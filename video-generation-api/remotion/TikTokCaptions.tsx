import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/(?<!\s)\*((?!\s).*?(?<!\s))\*(?!\s)/g, '$1')
    .replace(/(?<!\s)_((?!\s).*?(?<!\s))_(?!\s)/g, '$1')
    .replace(/^\s*\*\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s\*\s/g, ' ')
    .trim();
};

export interface CaptionData {
  text: string;
  startFrame: number;
  endFrame: number;
  characters: string[];
  characterStartFrames: number[];
  characterEndFrames: number[];
}

interface TikTokCaptionsProps {
  captions: CaptionData[];
}

export const TikTokCaptions: React.FC<TikTokCaptionsProps> = ({captions}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  
  const activeCaption = captions.find(
    caption => frame >= caption.startFrame && frame <= caption.endFrame
  );
  
  if (!activeCaption) return null;
  
  const words = activeCaption.text.split(/\s+/).filter(word => word.length > 0);
  const wordBoundaries: number[] = [];
  let charIndex = 0;
  
  const reconstructedText = activeCaption.characters.join('');
  
  words.forEach((word, wordIndex) => {
    while (charIndex < activeCaption.characters.length) {
      const currentChar = activeCaption.characters[charIndex];
      if (currentChar && /\s/.test(currentChar)) {
        charIndex++;
      } else {
        break;
      }
    }
    
    wordBoundaries.push(charIndex);
    
    const wordChars = Array.from(word);
    let wordCharIndex = 0;
    
    while (wordCharIndex < wordChars.length && charIndex < activeCaption.characters.length) {
      const currentChar = activeCaption.characters[charIndex];
      const expectedChar = wordChars[wordCharIndex];
      
      if (currentChar === expectedChar) {
        charIndex++;
        wordCharIndex++;
      } else {
        charIndex++;
      }
    }
    
    if (wordCharIndex < wordChars.length) {
      charIndex += (wordChars.length - wordCharIndex);
    }
  });
  
  wordBoundaries.push(activeCaption.characters.length);
  
  let currentWordIndex = 0;
  for (let i = 0; i < wordBoundaries.length - 1; i++) {
    const boundaryIndex = wordBoundaries[i];
    if (boundaryIndex !== undefined) {
      const wordStartFrame = activeCaption.characterStartFrames[boundaryIndex] ?? 0;
      if (frame >= wordStartFrame) {
        currentWordIndex = i;
      }
    }
  }
  
  const maxWords = 5;
  const currentBatch = Math.floor(currentWordIndex / maxWords);
  const batchStartIndex = currentBatch * maxWords;
  const batchEndIndex = Math.min(words.length, batchStartIndex + maxWords);
  
  const batchWords = words.slice(batchStartIndex, batchEndIndex);
  
  const wordsToShow: Array<{
    word: string;
    wordIndex: number;
    startFrame: number;
    isCurrentlyBeingSpoken: boolean;
  }> = [];
  
  batchWords.forEach((word, relativeIndex) => {
    const absoluteWordIndex = batchStartIndex + relativeIndex;
    const startBoundary = wordBoundaries[absoluteWordIndex];
    const endBoundary = wordBoundaries[absoluteWordIndex + 1];
    
    if (startBoundary !== undefined) {
      const wordStartFrame = activeCaption.characterStartFrames[startBoundary] ?? 0;
      const wordEndFrame = endBoundary !== undefined && endBoundary > 0 ? 
        (activeCaption.characterEndFrames[endBoundary - 1] ?? wordStartFrame + 30) : 
        wordStartFrame + 30;
    
      if (frame >= wordStartFrame) {
        const isCurrentlyBeingSpoken = frame >= wordStartFrame && frame <= wordEndFrame;
        wordsToShow.push({
          word,
          wordIndex: absoluteWordIndex,
          startFrame: wordStartFrame,
          isCurrentlyBeingSpoken
        });
      }
    }
  });
  
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        textAlign: 'center',
        width: '90%',
        maxWidth: '800px',
      }}
    >
      <div
        style={{
          fontSize: '96px',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          textShadow: '6px 6px 0px #000, -6px -6px 0px #000, 6px -6px 0px #000, -6px 6px 0px #000',
          color: '#FFFFFF',
          lineHeight: '1.1',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '8px',
          wordBreak: 'break-word',
        }}
      >
        {wordsToShow.map(({word, wordIndex, startFrame, isCurrentlyBeingSpoken}) => {
          const scale = interpolate(
            frame,
            [startFrame, startFrame + 1],
            [0.8, 1],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
          );
          
          return (
            <span
              key={wordIndex}
              style={{
                opacity: frame >= startFrame ? 1 : 0,
                transform: `scale(${scale})`,
                color: isCurrentlyBeingSpoken ? '#FFD700' : '#FFFFFF',
                fontWeight: isCurrentlyBeingSpoken ? 'bold' : 'normal',
                display: 'inline-block',
                marginRight: '0.3em',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const createCaptionDataFromTimestamps = (
  text: string,
  characters: string[],
  characterStartTimes: number[],
  characterEndTimes: number[],
  fps: number
): CaptionData[] => {
  const cleanedText = cleanMarkdown(text);
  
  const originalText = characters.join('');
  const cleanedChars: string[] = [];
  const cleanedStartFrames: number[] = [];
  const cleanedEndFrames: number[] = [];
  
  let originalIndex = 0;
  let cleanedIndex = 0;
  
  for (const cleanedChar of cleanedText) {
    while (originalIndex < characters.length && 
           characters[originalIndex] !== cleanedChar) {
      originalIndex++;
    }
    
    if (originalIndex < characters.length && 
        originalIndex < characterStartTimes.length && 
        originalIndex < characterEndTimes.length) {
      cleanedChars.push(cleanedChar);
      const startTime = characterStartTimes[originalIndex];
      const endTime = characterEndTimes[originalIndex];
      if (startTime !== undefined && endTime !== undefined) {
        cleanedStartFrames.push(Math.floor(startTime * fps));
        cleanedEndFrames.push(Math.ceil(endTime * fps));
      } else {
        const estimatedTime = originalIndex * 0.1;
        cleanedStartFrames.push(Math.floor(estimatedTime * fps));
        cleanedEndFrames.push(Math.ceil((estimatedTime + 0.1) * fps));
      }
      originalIndex++;
    } else {
      const prevFrame = cleanedStartFrames.length > 0 ? 
        (cleanedStartFrames[cleanedStartFrames.length - 1] ?? 0) : 0;
      const prevTime = prevFrame / fps;
      const estimatedTime = prevTime + 0.1;
      cleanedChars.push(cleanedChar);
      cleanedStartFrames.push(Math.floor(estimatedTime * fps));
      cleanedEndFrames.push(Math.ceil((estimatedTime + 0.1) * fps));
    }
    cleanedIndex++;
  }
  
  const startFrame = 0;
  const endFrame = cleanedEndFrames.length > 0 ? 
    Math.max(...cleanedEndFrames) : 
    Math.ceil((characterEndTimes[characterEndTimes.length - 1] ?? 1) * fps);
  
  return [{
    text: cleanedText,
    startFrame,
    endFrame,
    characters: cleanedChars,
    characterStartFrames: cleanedStartFrames,
    characterEndFrames: cleanedEndFrames
  }];
};

export const createCaptionData = (
  text: string,
  fps: number,
  wordsPerSecond: number = 2.5
): CaptionData[] => {
  const cleanedText = cleanMarkdown(text);
  const words = cleanedText.split(' ');
  const characters = cleanedText.split('');
  const totalDuration = words.length / wordsPerSecond;
  const charDuration = totalDuration / characters.length;
  
  const characterStartFrames = characters.map((_, index) => 
    Math.floor(index * charDuration * fps)
  );
  const characterEndFrames = characters.map((_, index) => 
    Math.ceil((index + 1) * charDuration * fps)
  );
  
  return [{
    text: cleanedText,
    startFrame: 0,
    endFrame: Math.ceil(totalDuration * fps),
    characters,
    characterStartFrames,
    characterEndFrames
  }];
};
