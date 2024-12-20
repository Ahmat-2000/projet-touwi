// VideoControls.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';

const CropVideoControls = ({ propsVideoControls }) => {
    const [videoUrl, setVideoUrl] = useState(null); //Video URL value/setter

    const videoRef = propsVideoControls.videoRef;   //Video UseRef
    const timeUpdateHandlerRef = useRef(null);      //TEMPORARY WILL BE REMOVED FEATURE WIP
    const [, forceUpdate] = useState({});          //Does something

    const [isPlaying, setIsPlaying] = useState(false); //Is video playing


    useEffect(() => {                               //Link video URL from file
        const url = URL.createObjectURL(propsVideoControls.video.file);
        setVideoUrl(url);
        return () => {
            URL.revokeObjectURL(url); // Clean up the URL when the component unmounts
        };
    }, [propsVideoControls.video]);

    const adjustSpeed = (increment) => {
        try {
            const currentSpeed = videoRef.current.playbackRate;
            let newSpeed = increment ? currentSpeed * 2 : currentSpeed / 2;

            // Limit the speed between 0.1 and 16
            newSpeed = Math.min(16, Math.max(0.1, newSpeed));

            videoRef.current.playbackRate = newSpeed;
            forceUpdate({});
        } catch (error) {
            console.warn('Playback speed not supported:', error);
        }
    };

    const resetSpeed = () => {
        videoRef.current.playbackRate = 1;
        forceUpdate({});
    };



    useEffect(() => {
        const video = videoRef.current;

        const handleKeydown = (event) => {
            if (!videoRef) return;

            const baseJumpTime = 0.5;
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - baseJumpTime);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + baseJumpTime);
                    break;
            }
        };

        const handleTimebarClick = () => {

            const currentAppMode = propsVideoControls.appModeRef.current;
            const currentTime = video.currentTime;

            if (currentAppMode === 'video_start') {
                const newPoints = {start: currentTime, end: propsVideoControls.videoCropPointsRef.current?.end || null};
                propsVideoControls.setVideoCropPoints(newPoints);
                propsVideoControls.videoCropPointsRef.current = newPoints;
            }
            else if (currentAppMode === 'video_end') {
                const newPoints = {start: propsVideoControls.videoCropPointsRef.current?.start || null, end: currentTime};
                propsVideoControls.setVideoCropPoints(newPoints);
                propsVideoControls.videoCropPointsRef.current = newPoints;
            }

        };

        video.addEventListener('seeked', handleTimebarClick);
        window.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('keydown', handleKeydown);
            video.removeEventListener('seeked', handleTimebarClick);
        };
    }, []);


    return (
        <div className="flex flex-col gap-4">
            <div className="relative">
                <CustomVideoPlayer
                    videoRef={videoRef}
                    videoUrl={videoUrl}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    cropPoints={propsVideoControls.videoCropPoints}
                />
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white p-1 rounded-full shadow-md">
                        <div className="inline-flex items-center bg-[#297DCB] rounded-full overflow-hidden h-8">
                            <button
                                onClick={() => adjustSpeed(false)}
                                className="w-8 h-full text-white hover:bg-black/10 transition-colors flex items-center justify-center text-lg font-medium"
                            >
                                -
                            </button>
                            <div
                                className="px-3 h-full flex items-center text-white border-l border-r border-white/30 cursor-pointer hover:bg-black/10 transition-colors min-w-[60px] justify-center text-sm font-medium"
                                onClick={resetSpeed}
                            >
                                {(videoRef.current && videoRef.current.playbackRate) ? videoRef.current.playbackRate.toFixed(2) : '1.00'}x
                            </div>
                            <button
                                onClick={() => adjustSpeed(true)}
                                className="w-8 h-full text-white hover:bg-black/10 transition-colors flex items-center justify-center text-lg font-medium"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropVideoControls;