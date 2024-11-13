// VideoControls.js

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const VideoControls = ({ propsData }) => {

    

    const videoRef = propsData.videoRef;
    const [, forceUpdate] = useState({});
    const [windowSize, setWindowSize] = useState(100);
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);
    const [videoUrl, setVideoUrl] = useState(null);

    useEffect(() => {
        if (propsData.video && propsData.video.file) {
            const url = URL.createObjectURL(propsData.video.file);
            setVideoUrl(url);
            return () => {
                URL.revokeObjectURL(url); // Clean up the URL when the component unmounts
            };
        }
    }, [propsData.video]);

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
        if (propsData.plotList.current.length > 0) {
            const video = videoRef.current;
            const currentVideoTime = video.currentTime;
            const videoDuration = video.duration;

            if (propsData.plotList.current[0].current === null) {
                console.log('Removing deleted plot from list | code °6 ');
                propsData.plotList.current = propsData.plotList.current.filter(ref => ref !== propsData.plotList.current[0]);
            }

            const signalLength = propsData.plotList.current[0].current.data[0].x.length;
            
            const currentSignalIndex = Math.floor((currentVideoTime / videoDuration) * signalLength);

            const newLayout = {
                'xaxis.range[0]': currentSignalIndex - windowSize,
                'xaxis.range[1]': currentSignalIndex + windowSize,
                'yaxis.range[0]': propsData.plotList.current[0].current.layout.yaxis.range[0],
                'yaxis.range[1]': propsData.plotList.current[0].current.layout.yaxis.range[1]  
            };

            propsData.syncZoom(newLayout, propsData.plotList.current);
        }
    };

    const toggleSync = () => {
        if (propsData.syncEnabled) {
            videoRef.current.removeEventListener('timeupdate', timeUpdateListener);
        } else {
            videoRef.current.addEventListener('timeupdate', timeUpdateListener);
        }
        propsData.setSyncEnabled(!propsData.syncEnabled);
    };

    useEffect(() => {
        const handleKeydown = (event) => {
            // Ensure video element is defined
            if (!videoRef) return;

            // Base jump time in seconds
            const baseJumpTime = 0.5;
            // Scale jump by playback rate (faster playback = bigger jumps)
            const scaledJumpTime = baseJumpTime * videoRef.current.playbackRate;

            switch (event.code) {
                case 'Space':
                    if (!propsData.syncEnabled) {
                        propsData.setSyncEnabled(true);
                    }
                    event.preventDefault();
                    console.log('Video is ' + (videoRef.current.paused ? 'paused' : 'playing'));
                    videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - scaledJumpTime);
                    videoRef.current.pause();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + scaledJumpTime);
                    videoRef.current.pause();
                    break;
                case 'Escape':
                    if (propsData.syncEnabled) {
                        videoRef.current.removeEventListener('timeupdate', timeUpdateListener);
                        propsData.setSyncEnabled(false);
                    }
                    break;
                default:
                    break;
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeydown);

        


        if (propsData.syncEnabled) {
            videoRef.current.addEventListener('timeupdate', timeUpdateListener);
        }

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            if (videoRef.current) {
                videoRef.current.removeEventListener('timeupdate', timeUpdateListener);
            }
        };
    }, [propsData.syncEnabled, windowSize]);

    return (
        <div>
            <video ref={videoRef} id="syncVideo" width="600" height="400" controls loop>
                {videoUrl && <source src={videoUrl} type="video/webm" />}
                Your browser does not support the video tag.
            </video>
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
                className="video-button"
                style={{
                    backgroundColor: propsData.syncEnabled ? '#4CAF50' : '#f44336',
                    padding: '8px 16px',
                    marginLeft: '10px'
                }}
            >
                {propsData.syncEnabled ? 'Disable Sync' : 'Enable Sync'}
            </button>
            <div className="window-controls">
                <span className="window-label">Window:</span>
                
                <div className="slider-container"
                    onMouseEnter={() => setIsHoveringSlider(true)}
                    onMouseLeave={() => setIsHoveringSlider(false)}>
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
                        }}>
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
    );
};

export default VideoControls;