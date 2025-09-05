#!/usr/bin/env bun

import fs from "fs";
import path from "path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const args = process.argv.slice(2);

function showUsage() {
  console.log(`
🎬 Remotion Video Renderer

Usage:
  bun render-video.ts <timestamp-file> <audio-file> [output-file] [background-video]

Arguments:
  timestamp-file    Path to the JSON file with timestamp data (required)
  audio-file        Path to the audio file (required)
  output-file       Output video filename (optional, default: output_TIMESTAMP.mp4)
  background-video  Background video filename (optional, default: Minecraft video)

Examples:
  bun render-video.ts timestamps_2025-01-05.json audio_2025-01-05.mp3
  bun render-video.ts public/timestamps_2025-09-05T20-53-27-661Z.json public/audio_2025-09-05T20-53-27-661Z.mp3 my-video.mp4
  bun render-video.ts timestamps.json audio.mp3 output.mp4 custom-bg.mp4

Note: All file paths are relative to the current directory or can be absolute.
  `);
}

if (args.length < 2) {
  console.error("❌ Error: Missing required arguments");
  showUsage();
  process.exit(1);
}

const [timestampFile, audioFile, outputFile, backgroundVideo] = args;

async function renderVideo() {
  try {
    if (!timestampFile || !audioFile) {
      throw new Error("Missing required arguments");
    }

    if (!fs.existsSync(timestampFile)) {
      throw new Error(`Timestamp file not found: ${timestampFile}`);
    }
    
    if (!fs.existsSync(audioFile)) {
      throw new Error(`Audio file not found: ${audioFile}`);
    }

    console.log("📄 Loading timestamp data...");
    const timestampData = JSON.parse(fs.readFileSync(timestampFile, 'utf-8'));
    
    if (!timestampData.text || !timestampData.characters || !timestampData.characterStartTimes) {
      throw new Error("Invalid timestamp file format. Missing required fields: text, characters, characterStartTimes");
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalOutputFile = outputFile || `output_${timestamp}.mp4`;
    const outputPath = path.resolve(finalOutputFile);

    console.log("🔧 Bundling Remotion project...");
    const bundleLocation = await bundle({
      entryPoint: path.resolve("./remotion/index.ts"),
    });

    console.log("🎯 Selecting composition...");
    const inputProps = {
      text: timestampData.text,
      characters: timestampData.characters,
      characterStartTimes: timestampData.characterStartTimes,
      characterEndTimes: timestampData.characterEndTimes || [],
      audioFile: audioFile ? path.basename(audioFile) : "audio.mp3",
      backgroundVideo: backgroundVideo || undefined,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "TikTokVideo",
      inputProps,
    });

    console.log("🎬 Rendering video...");
    console.log(`   Input: ${timestampFile} + ${audioFile}`);
    console.log(`   Output: ${finalOutputFile}`);
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
        process.stdout.write(`\r🎬 Rendering: [${progressBar}] ${percentage}% (${progress.renderedFrames} frames) | ${elapsed}s elapsed | ETA: ${eta}s`);
      },
    });

    const totalTime = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n✅ Video rendered successfully!`);
    console.log(`   📁 Output: ${finalOutputFile}`);
    console.log(`   ⏱️  Time: ${totalTime}s`);
    console.log(`   📊 Size: ${Math.round(fs.statSync(outputPath).size / 1024 / 1024 * 100) / 100}MB`);

  } catch (error) {
    console.error("\n❌ Rendering failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (args.includes('--help') || args.includes('-h')) {
  showUsage();
  process.exit(0);
}

renderVideo();
