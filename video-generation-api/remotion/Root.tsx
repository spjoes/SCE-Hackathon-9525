import React from 'react';
import {Composition, getInputProps} from 'remotion';
import {MyComposition, type MyCompositionProps} from './Composition';

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  
  const inputProps = getInputProps() as unknown as MyCompositionProps & { durationInFrames?: number };
  
  const lastCharacterEndTime = inputProps.characterEndTimes?.[inputProps.characterEndTimes.length - 1] || 4;
  const durationInFrames = inputProps.durationInFrames || Math.ceil(lastCharacterEndTime * fps);
  
  return (
    <>
      <Composition
        id="TikTokVideo"
        component={MyComposition as any}
        durationInFrames={durationInFrames}
        fps={fps}
        width={720}
        height={1280}
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