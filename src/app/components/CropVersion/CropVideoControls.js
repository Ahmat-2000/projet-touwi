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
        <div>
            { /*
            <div className="video-wrapper relative">
                <video ref={videoRef} id="syncVideo" width="600" height="400" controls loop>
                    {videoUrl && <source src={videoUrl} type="video/webm" />}
                    Your browser does not support the video tag.
                </video>
                <div className="video-controls-wrapper">
                    {propsVideoControls.cropVideoStart && (
                        <div 
                            className="video-start-indicator"
                            style={{
                                left: `${(propsVideoControls.cropVideoStart / videoRef.current.duration) * 100}%`
                            }}
                        />
                    )}
                    {propsVideoControls.cropVideoEnd && (
                        <div 
                            className="video-end-indicator"
                            style={{
                                left: `${(propsVideoControls.cropVideoEnd / videoRef.current.duration) * 100}%`
                            }}
                        />
                    )}
                </div>
            </div>
            */ }

            <CustomVideoPlayer
                videoRef={videoRef}
                videoUrl={videoUrl}
                cropVideoStart={propsVideoControls.cropVideoStart}
                cropVideoEnd={propsVideoControls.cropVideoEnd}
            />
            <div className="controls-group">
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

                    <div className="crop-info">
                        <div className="crop-values">
                            <p className="crop-timestamp">
                                <span className="crop-label">Crop Video Start:</span>
                                <span className="crop-value">{propsVideoControls.cropVideoStart?.toFixed(2) || '-'}</span>
                            </p>
                            <p className="crop-timestamp">
                                <span className="crop-label">Crop Video End:</span>
                                <span className="crop-value">{propsVideoControls.cropVideoEnd?.toFixed(2) || '-'}</span>
                            </p>
                        </div>

                        <button
                            onClick={() => cropVideo(
                                propsVideoControls.cropVideoStart,
                                propsVideoControls.cropVideoEnd
                            )}
                            className="crop-button"
                            disabled={!propsVideoControls.cropVideoStart || !propsVideoControls.cropVideoEnd}
                        >
                            Crop Video
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropVideoControls;