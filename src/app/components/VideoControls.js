// VideoControls.js

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const VideoControls = ({ propsData }) => {

    

    const videoRef = propsData.videoRef;
    const [, forceUpdate] = useState({});
    const [syncEnabled, setSyncEnabled] = useState(true);

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

    const controlStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        borderRadius: '4px',
        margin: '10px 0',
        overflow: 'hidden',
    };

    const buttonStyle = {
        padding: '8px 16px',
        backgroundColor: 'transparent',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    };

    const speedDisplayStyle = {
        padding: '8px 16px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 'bold',
        borderLeft: '1px solid rgba(255,255,255,0.3)',
        borderRight: '1px solid rgba(255,255,255,0.3)',
        minWidth: '70px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    };

    const timeUpdateListener = () => {
        if (propsData.plotList.current.length > 0) {
            const video = videoRef.current;
            const currentVideoTime = video.currentTime;
            const videoDuration = video.duration;
            const signalLength = propsData.plotList.current[0].current.data[0].x.length;
            
            // Convert video time to signal index using linear mapping
            const currentSignalIndex = Math.floor((currentVideoTime / videoDuration) * signalLength);

            const windowSize = 1000;

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
        if (syncEnabled) {
            videoRef.current.removeEventListener('timeupdate', timeUpdateListener);
        } else {
            videoRef.current.addEventListener('timeupdate', timeUpdateListener);
        }
        setSyncEnabled(!syncEnabled);
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
                    event.preventDefault();
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
                default:
                    break;
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeydown);

        


        if (syncEnabled) {
            videoRef.current.addEventListener('timeupdate', timeUpdateListener);
        }

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeydown);
            if (videoRef.current) {
                videoRef.current.removeEventListener('timeupdate', timeUpdateListener);
            }
        };
    }, [syncEnabled]);

    return (
        <div>
            <video ref={videoRef} id="syncVideo" width="600" height="400" controls>
                <source src={propsData.pathVideo} type="video/webm" />
                Your browser does not support the video tag.
            </video>
            <div style={controlStyle}>
                <button 
                    onClick={() => adjustSpeed(false)}
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    -
                </button>
                <span 
                    style={speedDisplayStyle}
                    onClick={resetSpeed}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    {(videoRef.current && videoRef.current.playbackRate) ? videoRef.current.playbackRate.toFixed(2) : '1.00'}x
                </span>
                <button 
                    onClick={() => adjustSpeed(true)}
                    style={buttonStyle}
                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0,0,0,0.1)'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    +
                </button>
            </div>
            <button 
                onClick={toggleSync}
                style={{
                    ...buttonStyle,
                    backgroundColor: syncEnabled ? '#4CAF50' : '#f44336',
                    padding: '8px 16px',
                    marginLeft: '10px'
                }}
            >
                {syncEnabled ? 'Disable Sync' : 'Enable Sync'}
            </button>
        </div>
    );
};

export default VideoControls;
