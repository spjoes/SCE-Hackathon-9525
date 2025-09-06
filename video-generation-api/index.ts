import express from "express";
import { GoogleGenAI } from "@google/genai";
import { ElevenLabsClient, play } from "@elevenlabs/elevenlabs-js";
import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import linkedIn from 'linkedin-jobs-api';
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 8080;

app.use('/public', express.static('public'));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

app.get("/", async (req, res) => {
  const jobURL = "https://www.linkedin.com/jobs/view/full-stack-software-engineer-new-graduates-united-states-at-wanderlog-4296181217?position=1&pageNum=0&refId=%2F71c2MoeBv7H4%2FA1Uxn0qg%3D%3D&trackingId=TRK%2FGkH6wQcK%2FS97ZG%2Bnbw%3D%3D";
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
        `Please grab the job description from the url given and then shorten the job description for a Tiktok Brainrot Video that showcases the job. Please use brainrot language and style. Please ONLY respond with the text that will be in the video. No extras: ${jobURL}`
    ],
    config: {
      tools: [{urlContext: {}}],
    },
  });
  console.log(response.candidates?.[0]?.urlContextMetadata);
  res.send(response.text);
});

app.get("/getJobs", async (req, res) => {
    const queryOptions = {
        keyword: 'software engineer',
        location: 'San Jose, California',
        dateSincePosted: 'past Week',
        salary: '100000',
        experienceLevel: 'entry level',
        limit: '100',
        page: "0",
        has_verification: false,
        under_10_applicants: false,
    };
    linkedIn.query(queryOptions).then((response: any) => {
        console.log(response); // An array of Job objects
        res.send(response);
    });
});

app.get("/voice", async (req, res) => {
  const text = "Hello, I gave up on my friends after they screwed me over.";
  
  const audioWithTimestamps = await elevenlabs.textToSpeech.convertWithTimestamps(
    "pNInz6obpgDQGcFmaJgB",
    {
      text: text,
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    }
  );
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `audio_${timestamp}.mp3`;
  
  const audioBuffer = Buffer.from(audioWithTimestamps.audioBase64, 'base64');
  fs.writeFileSync(`public/${filename}`, audioBuffer);
  console.log(`Audio saved as: public/${filename}`);
  
  const timestampData = {
    text: text,
    characters: audioWithTimestamps.alignment?.characters || [],
    characterStartTimes: audioWithTimestamps.alignment?.characterStartTimesSeconds || [],
    characterEndTimes: audioWithTimestamps.alignment?.characterEndTimesSeconds || [],
    normalizedCharacters: audioWithTimestamps.normalizedAlignment?.characters || [],
    normalizedCharacterStartTimes: audioWithTimestamps.normalizedAlignment?.characterStartTimesSeconds || [],
    normalizedCharacterEndTimes: audioWithTimestamps.normalizedAlignment?.characterEndTimesSeconds || []
  };
  
  fs.writeFileSync(`public/timestamps_${timestamp}.json`, JSON.stringify(timestampData, null, 2));
  console.log(`Timestamps saved as: public/timestamps_${timestamp}.json`);
  
  res.json({ 
    message: "Audio with timestamps generated and saved successfully",
    filename: filename,
    timestampFile: `timestamps_${timestamp}.json`,
    timestampData: timestampData
  });
});

app.get("/create", async (req, res) => {
  try {
    const queryOptions = {
      keyword: 'software engineer',
      location: 'San Jose, California',
      dateSincePosted: 'past Week',
      salary: '100000',
      experienceLevel: 'entry level',
      limit: '100',
      page: "0",
      has_verification: false,
      under_10_applicants: false,
    };
    
    console.log("Fetching job listings...");
    const jobListings = await new Promise<any[]>((resolve, reject) => {
      linkedIn.query(queryOptions).then((response: any) => {
        resolve(response);
      }).catch(reject);
    });
    
    if (!jobListings || jobListings.length === 0) {
      return res.status(404).json({ error: "No job listings found" });
    }
    
    const randomJob = jobListings[Math.floor(Math.random() * jobListings.length)];
    console.log(`Selected random job: ${randomJob.position} at ${randomJob.company}`);
    
    console.log("Generating brainrot script...");
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        `Please get the job description from the url provided. Then, shorten the job description for a Tiktok Brainrot Video that overviews the job.
        Please use brainrot language and style. Please ONLY respond with the text that will be in the video and nothing extra.\n ${randomJob.jobUrl}`
      ],
      config: {
        tools: [{urlContext: {}}],
      },
    });
    
    const brainrotText = (geminiResponse.text || "This job is absolutely fire, no cap!").trim();
    console.log(`Generated script: "${brainrotText}"`);
    
    console.log("Generating audio with timestamps...");
    const audioWithTimestamps = await elevenlabs.textToSpeech.convertWithTimestamps(
      "pNInz6obpgDQGcFmaJgB",
      {
        text: brainrotText,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audio_${timestamp}.mp3`;
    
    const audioBuffer = Buffer.from(audioWithTimestamps.audioBase64, 'base64');
    fs.writeFileSync(`public/${filename}`, audioBuffer);
    console.log(`Audio saved as: public/${filename}`);
    
    const timestampData = {
      text: brainrotText,
      characters: audioWithTimestamps.alignment?.characters || [],
      characterStartTimes: audioWithTimestamps.alignment?.characterStartTimesSeconds || [],
      characterEndTimes: audioWithTimestamps.alignment?.characterEndTimesSeconds || [],
      normalizedCharacters: audioWithTimestamps.normalizedAlignment?.characters || [],
      normalizedCharacterStartTimes: audioWithTimestamps.normalizedAlignment?.characterStartTimesSeconds || [],
      normalizedCharacterEndTimes: audioWithTimestamps.normalizedAlignment?.characterEndTimesSeconds || []
    };
    
    fs.writeFileSync(`public/timestamps_${timestamp}.json`, JSON.stringify(timestampData, null, 2));
    console.log(`Timestamps saved as: public/timestamps_${timestamp}.json`);
    
    console.log("Bundling Remotion project...");
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./remotion/index.ts"),
    });
    
    console.log("Selecting composition...");
    const inputProps = {
      text: brainrotText,
      characters: timestampData.characters,
      characterStartTimes: timestampData.characterStartTimes,
      characterEndTimes: timestampData.characterEndTimes,
      audioFile: filename,
    };
    
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "TikTokVideo",
      inputProps,
    });
    
    console.log("Rendering video...");
    const videoFilename = `video_${timestamp}.mp4`;
    const outputPath = path.resolve(`public/${videoFilename}`);
    
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
        process.stdout.write(`\r🎬 Rendering: [${progressBar}] ${percentage}% (${progress.renderedFrames}/${composition.durationInFrames} frames)`);
      },
    });
    
    console.log(`\n✅ Video rendered: ${videoFilename}`);
    
    res.json({
      message: "Brainrot job video created successfully!",
      jobData: {
        title: randomJob.title,
        company: randomJob.company,
        location: randomJob.location,
        originalUrl: randomJob.url
      },
      brainrotScript: brainrotText,
      audioFile: filename,
      timestampFile: `timestamps_${timestamp}.json`,
      videoFile: videoFilename,
      videoUrl: `/public/${videoFilename}`,
      timestampData: timestampData
    });
    
  } catch (error) {
    console.error("Error in /create endpoint:", error);
    res.status(500).json({ 
      error: "Failed to create brainrot job video", 
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

app.get("/video/:filename", (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.resolve(`public/${filename}`);
  
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video not found" });
  }
  
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;
  
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0] || "0", 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});

app.delete("/cleanup/:timestamp", (req, res) => {
  const timestamp = req.params.timestamp;
  const filesToDelete = [
    `public/audio_${timestamp}.mp3`,
    `public/video_${timestamp}.mp4`,
    `public/timestamps_${timestamp}.json`
  ];
  
  let deletedCount = 0;
  filesToDelete.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deletedCount++;
    }
  });
  
  res.json({ 
    message: `Cleanup completed. Deleted ${deletedCount} files.`,
    timestamp 
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
