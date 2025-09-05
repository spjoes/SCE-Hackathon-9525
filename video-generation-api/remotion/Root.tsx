import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {MyComposition, type MyCompositionProps} from './Composition';

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  
  // Get input props (will be passed from the render command)
  const inputProps = getInputProps() as unknown as MyCompositionProps & { durationInFrames?: number };
  
  // Calculate duration based on the last character's end time or use provided duration
  const lastCharacterEndTime = inputProps.characterEndTimes?.[inputProps.characterEndTimes.length - 1] || 4;
  const durationInFrames = inputProps.durationInFrames || Math.ceil(lastCharacterEndTime * fps);
  
  return (
    <>
      <Composition
        id="TikTokVideo"
        component={MyComposition as any}
        durationInFrames={durationInFrames}
        fps={fps}
        width={720}  // Reduced from 1080 for faster rendering
        height={1280} // Reduced from 1920 for faster rendering (maintains 9:16 aspect ratio)
        defaultProps={{
          text: inputProps.text || "Default text",
          characters: inputProps.characters || [],
          characterStartTimes: inputProps.characterStartTimes || [],
          characterEndTimes: inputProps.characterEndTimes || [],
          audioFile: inputProps.audioFile || "audio.mp3",
          backgroundVideo: inputProps.backgroundVideo
        }}
      />
    </>
  );
};