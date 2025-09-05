# 🎬 Complete TikTok Video Creator

Create complete brainrot job videos without running the API server. This script replicates the entire `/create` endpoint functionality as a standalone command.

## Quick Start

### Basic Usage
```bash
# Create video with default settings
bun create-video.ts

# Windows shortcut
create.bat
```

### Custom Options
```bash
# Custom job search
bun create-video.ts --keyword "data scientist" --location "New York" --salary "120000"

# Custom output filename
bun create-video.ts --output my-job-video.mp4

# Full customization
bun create-video.ts --keyword "frontend developer" --location "San Francisco" --salary "150000" --level "senior level" --output senior-frontend.mp4
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--keyword` | Job keyword to search for | `"software engineer"` |
| `--location` | Job location | `"San Jose, California"` |
| `--salary` | Minimum salary | `"100000"` |
| `--level` | Experience level | `"entry level"` |
| `--output` | Output video filename | Auto-generated |
| `--help` | Show help message | - |

## Experience Levels
- `"entry level"`
- `"mid level"`
- `"senior level"`
- `"director"`
- `"executive"`


## Output Files

All files are saved to the `public/` directory:

- `brainrot-job-video_TIMESTAMP.mp4` - Final video
- `audio_TIMESTAMP.mp3` - Generated audio
- `timestamps_TIMESTAMP.json` - Timing data

## Example Output

```
🚀 Starting complete video creation pipeline...

🔍 Step 1: Fetching job listings...
   Keyword: software engineer
   Location: San Jose, California
   Salary: $100000+
   Level: entry level
✅ Found 47 jobs, selected: "Full Stack Engineer" at TechCorp

🤖 Step 2: Generating brainrot script with AI...
✅ Generated script (892 characters):
   "POV: You're tryna get that bread and TechCorp drops a fire job alert..."

🎵 Step 3: Generating audio with timestamps...
✅ Audio saved: public/audio_2025-01-05T12-34-56-789Z.mp3
✅ Timestamps saved: public/timestamps_2025-01-05T12-34-56-789Z.json

🎬 Step 4: Rendering video with Remotion...
✅ Bundling complete
✅ Composition selected
🎬 Rendering video: brainrot-job-video_2025-01-05T12-34-56-789Z.mp4
   Duration: 45s (1350 frames)
   Resolution: 720x1280
🎬 Rendering: [████████████████████████████████████████████████] 100% (1350 frames) | 23s elapsed | ETA: 0s

🎉 COMPLETE! Brainrot job video created successfully!

📋 Job Information:
   Title: Full Stack Engineer
   Company: TechCorp
   Location: San Jose, CA
   URL: https://linkedin.com/jobs/view/...

🎬 Video Details:
   📁 Video: public/brainrot-job-video_2025-01-05T12-34-56-789Z.mp4
   🎵 Audio: public/audio_2025-01-05T12-34-56-789Z.mp3
   📊 Timestamps: public/timestamps_2025-01-05T12-34-56-789Z.json
   ⏱️  Render time: 23s
   📏 File size: 12.4MB
   🎯 Resolution: 720x1280

🚀 Ready to upload to TikTok!
```

## Requirements

- Bun runtime
- Internet connection (for job scraping and AI)
- ElevenLabs and Google AI API keys (configured in script)

## Batch Processing

Create multiple videos with different criteria:

```bash
# Different job types
bun create-video.ts --keyword "data scientist" --output ds-video.mp4
bun create-video.ts --keyword "product manager" --output pm-video.mp4
bun create-video.ts --keyword "ux designer" --output ux-video.mp4

# Different locations
bun create-video.ts --location "New York" --output ny-jobs.mp4
bun create-video.ts --location "Seattle" --output seattle-jobs.mp4
```

## Troubleshooting

- **No jobs found**: Try broader keywords or different location
- **API errors**: Check internet connection and API keys
- **Render fails**: Ensure Remotion dependencies are installed (`bun install`)
- **Missing files**: Script creates `public/` directory automatically

## Help

```bash
bun create-video.ts --help
```
