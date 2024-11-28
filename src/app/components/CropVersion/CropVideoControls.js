// VideoControls.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import CustomVideoPlayer from './CustomVideoPlayer';

const CropVideoControls = ({ propsVideoControls }) => {
    const [videoUrl, setVideoUrl] = useState(null); //Video URL value/setter

    const videoRef = propsVideoControls.videoRef;   //Video UseRef
    const timeUpdateHandlerRef = useRef(null);      //TEMPORARY WILL BE REMOVED FEATURE WIP
    const [, forceUpdate] = useState({});          //Does something

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

    function cropVideo(start, end) {
        const video = videoRef.current;

        if (timeUpdateHandlerRef.current) {
            video.removeEventListener('timeupdate', timeUpdateHandlerRef.current);
        }

        const handleTimeUpdate = () => {
            if (video.currentTime <= start) {
                video.currentTime = start;
            }
            else if (video.currentTime >= end) {
                video.currentTime = start;
                video.pause();
            }
        };

        timeUpdateHandlerRef.current = handleTimeUpdate;

        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
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

            const isStartVideo = currentAppMode === 'video_start';
            const isEndVideo = currentAppMode === 'video_end';

            if (isStartVideo) {
                propsVideoControls.setCropVideoStart(video.currentTime);
            }
            else if (isEndVideo) {
                propsVideoControls.setCropVideoEnd(video.currentTime);
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
            <CustomVideoPlayer
                videoRef={videoRef}
                videoUrl={videoUrl}
                cropVideoStart={propsVideoControls.cropVideoStart}
                cropVideoEnd={propsVideoControls.cropVideoEnd}
            />
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="inline-flex items-center bg-[#297DCB] rounded-lg overflow-hidden h-8">
                            <button
                                onClick={() => adjustSpeed(false)}
                                className="px-4 h-full text-white hover:bg-black/10 transition-colors"
                                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                -
                            </button>
                            <span
                                className="px-4 h-full flex items-center text-white border-l border-r border-white/30 cursor-pointer hover:bg-black/10 transition-colors"
                                onClick={resetSpeed}
                            >
                                {(videoRef.current && videoRef.current.playbackRate) ? videoRef.current.playbackRate.toFixed(2) : '1.00'}x
                            </span>
                            <button
                                onClick={() => adjustSpeed(true)}
                                className="px-4 h-full text-white hover:bg-black/10 transition-colors"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <p className="flex items-center gap-2">
                                    <span className="text-gray-600 font-medium">Crop Video Start:</span>
                                    <span className="text-gray-900">{propsVideoControls.cropVideoStart?.toFixed(2) || '-'}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="text-gray-600 font-medium">Crop Video End:</span>
                                    <span className="text-gray-900">{propsVideoControls.cropVideoEnd?.toFixed(2) || '-'}</span>
                                </p>
                            </div>

                            <button
                                onClick={() => cropVideo(
                                    propsVideoControls.cropVideoStart,
                                    propsVideoControls.cropVideoEnd
                                )}
                                disabled={!propsVideoControls.cropVideoStart || !propsVideoControls.cropVideoEnd}
                                className="px-4 py-2 bg-[#297DCB] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1e5c9c] transition-colors"
                            >
                                Crop Video
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropVideoControls;