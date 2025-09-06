#!/usr/bin/env bun

import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import linkedIn from 'linkedin-jobs-api';
import dotenv from "dotenv";
dotenv.config();

const AI_API_KEY = process.env.GEMINI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "pNInz6obpgDQGcFmaJgB";

const args = process.argv.slice(2);

function showUsage() {
  console.log(`
🎬 Complete TikTok Video Creator

Usage:
  bun create-video.ts [options]

Options:
  --keyword <keyword>        Job keyword to search for (default: "software engineer")
  --location <location>      Job location (default: "San Jose, California")
  --salary <salary>          Minimum salary (default: "100000")
  --level <level>            Experience level (default: "entry level")
  --output <filename>        Output video filename (default: auto-generated)
  --help, -h                 Show this help message

Examples:
  bun create-video.ts
  bun create-video.ts --keyword "data scientist" --location "New York" --output my-job-video.mp4
  bun create-video.ts --keyword "frontend developer" --salary "120000" --level "mid level"

The script will:
1. 🔍 Scrape a random job from LinkedIn
2. 🤖 Generate brainrot script with AI
3. 🎵 Create audio with ElevenLabs
4. 🎬 Render complete video with captions
  `);
}

let keyword = "software engineer";
let location = "San Jose, California";
let salary = "100000";
let level = "entry level";
let outputFile = "";

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--keyword':
      keyword = args[++i] || keyword;
      break;
    case '--location':
      location = args[++i] || location;
      break;
    case '--salary':
      salary = args[++i] || salary;
      break;
    case '--level':
      level = args[++i] || level;
      break;
    case '--output':
      outputFile = args[++i] || outputFile;
      break;
    case '--help':
    case '-h':
      showUsage();
      process.exit(0);
    default:
      const arg = args[i];
      if (arg && arg.startsWith('--')) {
        console.error(`Unknown option: ${arg}`);
        showUsage();
        process.exit(1);
      }
  }
}

const ai = new GoogleGenAI({
  apiKey: AI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

async function createVideo() {
  try {
    console.log("🚀 Starting complete video creation pipeline...\n");

    console.log("🔍 Step 1: Fetching job listings...");
    console.log(`   Keyword: ${keyword}`);
    console.log(`   Location: ${location}`);
    console.log(`   Salary: $${salary}+`);
    console.log(`   Level: ${level}`);

    const queryOptions = {
      keyword: keyword,
      location: location,
      dateSincePosted: 'past Week',
      salary: salary,
      experienceLevel: level,
      limit: '20',
      page: "0",
      has_verification: false,
      under_10_applicants: false,
    };

    const jobListings = await new Promise<any[]>((resolve, reject) => {
      linkedIn.query(queryOptions).then((response: any) => {
        resolve(response);
      }).catch(reject);
    });

    if (!jobListings || jobListings.length === 0) {
      throw new Error("No job listings found with the specified criteria");
    }

    const randomJob = jobListings[Math.floor(Math.random() * jobListings.length)];
    console.log(`✅ Found ${jobListings.length} jobs, selected: "${randomJob.position}" at ${randomJob.company}\n`);

    console.log("🤖 Step 2: Generating brainrot script with AI...");
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `Please get the job description from the url provided. Then, shorten the job description for a Tiktok Brainrot Video that overviews the job.
        Please use brainrot language and style. Please ONLY respond with the text that will be in the video and nothing extra. PLease do not start the video with "POV:" or anything like that.\n ${randomJob.jobUrl}`
      ],
      config: {
        tools: [{urlContext: {}}],
      },
    });

    const brainrotText = (geminiResponse?.text || "This job is absolutely fire, no cap!").trim();
    console.log(`✅ Generated script (${brainrotText.length} characters):`);
    console.log(`   "${brainrotText.substring(0, 100)}${brainrotText.length > 100 ? '...' : ''}"\n`);

    console.log("🎵 Step 3: Generating audio with timestamps...");
    const audioWithTimestamps = await elevenlabs.textToSpeech.convertWithTimestamps(
      VOICE_ID,
      {
        text: brainrotText,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const audioFilename = `audio_${timestamp}.mp3`;
    const timestampFilename = `timestamps_${timestamp}.json`;

    const audioBuffer = Buffer.from(audioWithTimestamps.audioBase64, 'base64');
    fs.writeFileSync(`public/${audioFilename}`, audioBuffer);
    console.log(`✅ Audio saved: public/${audioFilename}`);

    const timestampData = {
      text: brainrotText,
      characters: audioWithTimestamps.alignment?.characters || [],
      characterStartTimes: audioWithTimestamps.alignment?.characterStartTimesSeconds || [],
      characterEndTimes: audioWithTimestamps.alignment?.characterEndTimesSeconds || [],
      normalizedCharacters: audioWithTimestamps.normalizedAlignment?.characters || [],
      normalizedCharacterStartTimes: audioWithTimestamps.normalizedAlignment?.characterStartTimesSeconds || [],
      normalizedCharacterEndTimes: audioWithTimestamps.normalizedAlignment?.characterEndTimesSeconds || []
    };

    fs.writeFileSync(`public/${timestampFilename}`, JSON.stringify(timestampData, null, 2));
    console.log(`✅ Timestamps saved: public/${timestampFilename}\n`);

    console.log("🎬 Step 4: Rendering video with Remotion...");
    
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./remotion/index.ts"),
    });
    console.log("✅ Bundling complete");

    const inputProps = {
      text: brainrotText,
      characters: timestampData.characters,
      characterStartTimes: timestampData.characterStartTimes,
      characterEndTimes: timestampData.characterEndTimes,
      audioFile: audioFilename,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "TikTokVideo",
      inputProps,
    });
    console.log("✅ Composition selected");

    const videoFilename = outputFile || `brainrot-job-video_${timestamp}.mp4`;
    const outputPath = path.resolve(`public/${videoFilename}`);

    console.log(`🎬 Rendering video: ${videoFilename}`);
    console.log(`   Duration: ${Math.ceil(composition.durationInFrames / composition.fps)}s (${composition.durationInFrames} frames)`);
    console.log(`   Resolution: ${composition.width}x${composition.height}`);

    const startTime = Date.now();

    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
      imageFormat: "jpeg",
      jpegQuality: 80,
      scale: 1,
      numberOfGifLoops: undefined,
      everyNthFrame: 1,
      concurrency: null,
      enforceAudioTrack: true,
      onProgress: (progress) => {
        const percentage = Math.round(progress.progress * 100);
        const progressBar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const eta = progress.progress > 0 ? Math.round((elapsed / progress.progress) - elapsed) : 0;
        
        let stage = 'Rendering';
        if (progress.stitchStage === 'encoding') {
          stage = 'Encoding';
        } else if (progress.stitchStage === 'muxing') {
          stage = 'Muxing audio';
        }
        
        process.stdout.write(`\r🎬 ${stage}: [${progressBar}] ${percentage}% (${progress.renderedFrames} frames) | ${elapsed}s elapsed | ETA: ${eta}s`);
      },
    });

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const fileSize = Math.round(fs.statSync(outputPath).size / 1024 / 1024 * 100) / 100;

    console.log(`\n\n🎉 COMPLETE! Brainrot job video created successfully!`);
    console.log(`\n📋 Job Information:`);
    console.log(`   Title: ${randomJob.position}`);
    console.log(`   Company: ${randomJob.company}`);
    console.log(`   Location: ${randomJob.location}`);
    console.log(`   URL: ${randomJob.jobUrl}`);
    
    console.log(`\n🎬 Video Details:`);
    console.log(`   📁 Video: public/${videoFilename}`);
    console.log(`   🎵 Audio: public/${audioFilename}`);
    console.log(`   📊 Timestamps: public/${timestampFilename}`);
    console.log(`   ⏱️  Render time: ${totalTime}s`);
    console.log(`   📏 File size: ${fileSize}MB`);
    console.log(`   🎯 Resolution: ${composition.width}x${composition.height}`);
    
    console.log(`\n✨ Script preview:`);
    console.log(`   "${brainrotText}"`);

    console.log(`\n🚀 Ready to upload to TikTok!`);

  } catch (error) {
    console.error("\n❌ Video creation failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
  console.log("📁 Created public directory");
}

createVideo();
