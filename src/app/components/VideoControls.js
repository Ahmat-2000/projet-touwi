// VideoControls.js

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const VideoControls = ({ propsVideoControls }) => {

    const videoRef = propsVideoControls.videoRef;                   //hf for this part
    const [, forceUpdate] = useState({});                           //Bad code merge fused 2 different codes but it works
    const [windowSize, setWindowSize] = useState(100);
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);

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
            return `${(size/1000).toFixed(1)}k`;
        }
        return size;
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
                    video.paused ? video.play() : video.pause();
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
    }, [propsVideoControls.syncEnabled, windowSize]);

    return (
        <div>
            <video ref={videoRef} id="syncVideo" width="600" height="400" controls loop>
                {videoUrl && <source src={videoUrl} type="video/webm" />}
                Your browser does not support the video tag.
            </video>
            <div className="controls-group">
                <div className="window-controls">
                    <div className="window-controls-content">
                        <span className="window-label">Window:</span>
                        <div 
                            className="slider-container"
                            onMouseEnter={() => setIsHoveringSlider(true)}
                            onMouseLeave={() => setIsHoveringSlider(false)}
                        >
                            <input
                                type="range"
                                min="50"
                                max="5000"
                                value={windowSize}
                                onChange={(e) => setWindowSize(parseInt(e.target.value))}
                                className="window-slider"
                            />
                            <div
                                className="slider-tooltip"
                                style={{
                                    left: `${((windowSize - 50) / (5000 - 50)) * 100}%`
                                }}
                            >
                                {formatWindowSize(windowSize)}
                            </div>
                        </div>
                        <div className="preset-container">
                            {presetSizes.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => setWindowSize(preset.value)}
                                    className="preset-button"
                                    style={{
                                        backgroundColor: windowSize === preset.value ? '#4CAF50' : '#e0e0e0',
                                        color: windowSize === preset.value ? 'white' : '#333',
                                    }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="video-sync-controls">
                    <div className="video-controls">
                        <button 
                            onClick={() => adjustSpeed(false)}
                            className="video-button"
                            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            -
                        </button>
                        <span 
                            className="speed-display"
                            onClick={resetSpeed}
                            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            {(videoRef.current && videoRef.current.playbackRate) ? videoRef.current.playbackRate.toFixed(2) : '1.00'}x
                        </span>
                        <button 
                            onClick={() => adjustSpeed(true)}
                            className="video-button"
                            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            +
                        </button>
                    </div>
                    <button 
                        onClick={toggleSync}
                        className={`sync-button ${propsVideoControls.syncEnabled ? 'bg-[#4CAF50]' : 'bg-[#f44336]'}`}
                    >
                        {propsVideoControls.syncEnabled ? 'Disable Sync' : 'Enable Sync'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoControls;