import React from 'react';
import {Video, Audio, staticFile, useVideoConfig} from 'remotion';
import {TikTokCaptions, createCaptionDataFromTimestamps} from './TikTokCaptions';

export interface MyCompositionProps {
    text: string;
    characters: string[];
    characterStartTimes: number[];
    characterEndTimes: number[];
    audioFile: string;
    backgroundVideo?: string;
}

export const MyComposition: React.FC<MyCompositionProps> = ({
    text,
    characters,
    characterStartTimes,
    characterEndTimes,
    audioFile,
    backgroundVideo = 'Minecraft Parkour Gameplay NO COPYRIGHT (Vertical) [s600FYgI5-s].mp4'
}) => {
    const {fps} = useVideoConfig();
    
    const captionData = createCaptionDataFromTimestamps(
        text,
        characters,
        characterStartTimes,
        characterEndTimes,
        fps
    );
    
    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <Video
                src={staticFile(backgroundVideo)}
                startFrom={60}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            <Audio
                src={staticFile(audioFile)}
            />
            <TikTokCaptions captions={captionData} />
        </div>
    );
};