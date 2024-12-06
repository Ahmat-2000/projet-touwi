// VideoControls.js

import React, { useEffect, useRef, useState } from 'react';
import CustomVideoPlayer from './CropVersion/CustomVideoPlayer';

const VideoControls = ({ propsVideoControls }) => {

    const videoRef = propsVideoControls.videoRef;                   //hf for this part
    const [, forceUpdate] = useState({});                           //Bad code merge fused 2 different codes but it works
    const [windowSize, setWindowSize] = useState(100);
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (propsVideoControls.video && propsVideoControls.video.file) {
            const url = URL.createObjectURL(propsVideoControls.video.file);
            setVideoUrl(url);
            return () => {
                URL.revokeObjectURL(url); // Clean up the URL when the component unmounts
            };
        }
        
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

    const formatWindowSize = (size) => {
        if (size >= 1000) {
            return `${(size / 1000).toFixed(1)}k`;
        }
        return size.toString();
    };

    const presetSizes = [
        { label: 'XS', value: 50 },
        { label: 'S', value: 100 },
        { label: 'M', value: 500 },
        { label: 'L', value: 1000 },
        { label: 'XL', value: 5000 },
    ];

    const timeUpdateListener = () => {
        if (propsVideoControls.plotList.current.length > 0) {
            const video = videoRef.current;
            const currentVideoTime = video.currentTime;
            const videoDuration = video.duration;

            if (propsVideoControls.plotList.current[0].current === null) {
                console.log('Removing deleted plot from list | code °12 ');
                propsVideoControls.plotList.current = propsVideoControls.plotList.current.filter(ref => ref !== propsVideoControls.plotList.current[0]);
            }

            const signalLength = propsVideoControls.plotList.current[0].current.data[0].x.length;

            const currentSignalIndex = Math.floor((currentVideoTime / videoDuration) * signalLength);

            const newLayout = {
                'xaxis.range[0]': currentSignalIndex - windowSize,
                'xaxis.range[1]': currentSignalIndex + windowSize,
                'yaxis.range[0]': propsVideoControls.plotList.current[0].current.layout.yaxis.range[0],
                'yaxis.range[1]': propsVideoControls.plotList.current[0].current.layout.yaxis.range[1]
            };
            propsVideoControls.syncZoom(newLayout, propsVideoControls.plotList.current, null);
        }
    };

    const toggleSync = () => {
        if (propsVideoControls.syncEnabled) {
            videoRef.current.removeEventListener('timeupdate', timeUpdateListener);
        } else {
            videoRef.current.addEventListener('timeupdate', timeUpdateListener);
        }
        propsVideoControls.setSyncEnabled(!propsVideoControls.syncEnabled);
    };

    useEffect(() => {
        const video = videoRef.current;

        const handleKeydown = (event) => {
            if (!videoRef) return;

            // Base jump time in seconds
            const baseJumpTime = 0.5;
            const scaledJumpTime = baseJumpTime * video.playbackRate;

            switch (event.code) {
                case 'Space':
                    if (!propsVideoControls.syncEnabled) {
                        propsVideoControls.setSyncEnabled(true);
                    }
                    event.preventDefault();
                    setIsPlaying(!isPlaying);
                    isPlaying ? video.pause() : video.play();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - scaledJumpTime);
                    video.pause();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + scaledJumpTime);
                    video.pause();
                    break;
                case 'Escape':
                    if (propsVideoControls.syncEnabled) {
                        video.removeEventListener('timeupdate', timeUpdateListener);
                        propsVideoControls.setSyncEnabled(false);
                    }
                    isPlaying ? video.pause() : video.play();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeydown);

        if (propsVideoControls.syncEnabled) {
            video.addEventListener('timeupdate', timeUpdateListener);
        }

        return () => {
            window.removeEventListener('keydown', handleKeydown);
            if (video) {
                video.removeEventListener('timeupdate', timeUpdateListener);
            }
        };
    }, [propsVideoControls.syncEnabled, windowSize, isPlaying]);

    return (
        <div className={`flex gap-2 container p-4 rounded-xl shadow-md w-[60vh] mx-auto max-w-[98%] ${propsVideoControls.syncEnabled ? 'bg-green-500/50' : 'bg-red-600/50'}`}>
            
            {/* Left Section - Video Player and Controls */}
            <div className={`flex-1 p-4 rounded-xl shadow-md ${propsVideoControls.syncEnabled ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {/* Video Player */}
                <div className="w-full mb-4">
                    <CustomVideoPlayer
                        videoRef={videoRef}
                        videoUrl={videoUrl}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                        cropPoints={propsVideoControls.cropPoints}
                    />
                </div>

                {/* Controls Container */}
                <div className="w-full bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* X-Scale Slider */}
                        <div className="w-full bg-gray-100 rounded-lg p-4">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 min-w-0">
                                <span className="font-bold text-gray-700 whitespace-nowrap shrink-0">X-Scale:</span>

                                {/* Slider Container */}
                                <div className="flex-grow w-full md:w-auto min-w-0">
                                    <div className="relative h-8 flex items-center">
                                        <div className="relative w-full flex items-center"
                                            onMouseEnter={() => setIsHoveringSlider(true)}
                                            onMouseLeave={() => setIsHoveringSlider(false)}
                                        >
                                            <input
                                                type="range"
                                                min="10"
                                                max="5000"
                                                value={windowSize}
                                                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                                                className="w-full h-1 bg-blue-500 rounded-full appearance-none cursor-pointer 
                                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 
                                                 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full 
                                                 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:border-2 
                                                 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md 
                                                 [&::-webkit-slider-thumb]:transition-transform 
                                                 hover:[&::-webkit-slider-thumb]:scale-110"
                                            />
                                            <div
                                                className={`absolute bottom-5 left-1/2 -translate-x-1/2 -translate-y-full bg-blue-300 text-white rounded-md px-2 py-1 whitespace-nowrap ${isHoveringSlider ? 'opacity-100' : 'opacity-0'}`}
                                                style={{
                                                    left: `${((windowSize - 10) / (5000 - 10)) * 100}%`
                                                }}
                                            >
                                                {formatWindowSize(windowSize)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Preset Buttons */}
                                <div className="flex flex-wrap gap-1.5 shrink-0">
                                    {presetSizes.map((preset) => (
                                        <button
                                            key={preset.label}
                                            onClick={() => setWindowSize(preset.value)}
                                            className={`px-3 py-1.5 text-sm rounded-md transition-all
                                        ${windowSize === preset.value
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Speed Control */}
                                <div className="inline-flex items-center bg-[#297DCB] rounded-lg overflow-hidden h-8 shrink-0">
                                    <button
                                        onClick={() => adjustSpeed(false)}
                                        className="px-3 h-full text-white hover:bg-black/10 transition-colors"
                                        aria-label="Decrease speed"
                                    >
                                        <span className="text-lg">-</span>
                                    </button>
                                    <span
                                        className="px-3 h-full flex items-center text-white border-l border-r 
                                         border-white/30 cursor-pointer hover:bg-black/10 transition-colors 
                                         min-w-[70px] justify-center font-medium"
                                        onClick={resetSpeed}
                                    >
                                        {(videoRef.current && videoRef.current.playbackRate)
                                            ? videoRef.current.playbackRate.toFixed(2)
                                            : '1.00'}x
                                    </span>
                                    <button
                                        onClick={() => adjustSpeed(true)}
                                        className="px-3 h-full text-white hover:bg-black/10 transition-colors"
                                        aria-label="Increase speed"
                                    >
                                        <span className="text-lg">+</span>
                                    </button>
                                </div>


                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Right Section - Sync Button */}
            <div className="flex-none">
                <button
                    onClick={toggleSync}
                    className={`h-full w-8 rounded-lg font-medium text-white transition-all 
                        hover:opacity-90 flex flex-col items-center justify-center gap-2
                        ${propsVideoControls.syncEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    <i className={`fas fa-${propsVideoControls.syncEnabled ? 'link' : 'unlink'} text-2xl`} />
                    <span className="text-sm"></span>
                </button>
            </div>

        </div>
    );
};

export default VideoControls;