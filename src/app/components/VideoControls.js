import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const VideoControls = forwardRef(({ propsData }, ref) => {

    const videoElementRef = useRef(null);

    const timeUpdateHandlerRef = useRef(null);

    const appModeRef = useRef(propsData.appMode);

    const highlightedVideoPart = useRef(null);

    useEffect(() => {
        appModeRef.current = propsData.appMode;   
    }, [propsData.appMode]);


    const videoRef = propsData.videoRef;
    const [, forceUpdate] = useState({});
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [windowSize, setWindowSize] = useState(100);
    const [isHoveringSlider, setIsHoveringSlider] = useState(false);

    const adjustSpeed = (increment) => {
        try {
            const currentSpeed = videoElementRef.current.playbackRate;
            let newSpeed = increment ? currentSpeed * 2 : currentSpeed / 2;
             
            // Limit the speed between 0.1 and 16
            newSpeed = Math.min(16, Math.max(0.1, newSpeed));
            
            videoElementRef.current.playbackRate = newSpeed;
            forceUpdate({});
        } catch (error) {
            console.warn('Playback speed not supported:', error);
        }
    };

    const resetSpeed = () => {
        videoElementRef.current.playbackRate = 1;
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

    const cropVideo = (start, end) => {
        const video = videoElementRef.current;
        if (video) {

            if (timeUpdateHandlerRef.current) {
                video.removeEventListener('timeupdate', timeUpdateHandlerRef.current);
            }

            const handleTimeUpdate = () => {
                if (video.currentTime >= end || video.currentTime <= start) {
                    video.currentTime = start;
                }
            };
            timeUpdateHandlerRef.current = handleTimeUpdate;

            video.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    };

    function syncVideo(idx, timestampList) {

        if (appModeRef.current === 'videoSync') {

            timestampList = propsData.timelist.x

            let endVideoTimestamp = findClosestNumber(timestampList, parseInt(timestampList[idx]) + ((videoElementRef.current.duration-videoElementRef.current.currentTime)*1000)) 
                
            let timestampData = {
                synchronize : "true",
                start : {
                    'idx' : idx,
                    'startVideoSync' : timestampList[idx],
                    'startVideoTime' : videoElementRef.current.currentTime
                },
                end : {
                    'idx' : timestampList.indexOf(endVideoTimestamp),
                    'endVideoSync' : endVideoTimestamp,
                    'endVideoTime' : videoElementRef.current.currentTime+((endVideoTimestamp-timestampList[idx])/1000)
                }
                
            }
            localStorage.setItem('videoDelayIdx', JSON.stringify(timestampData))
            
            if (highlightedVideoPart.current) {propsData.graphRef.current.deleteHighlight(highlightedVideoPart.current)}

 
            highlightedVideoPart.current = propsData.graphRef.current.highlightRegion(idx,timestampList.indexOf(endVideoTimestamp), 'rgba(255, 215, 0, 0.35)')
            propsData.resetMode()

            cropVideo(timestampData['start']['startVideoTime'],timestampData['end']['endVideoTime'])
        }
  
    }

    function findClosestNumber(arr, target) {
        let left = 0;
        let right = arr.length - 1;
    
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid;
            }
        }
        
        const closestIndex = left;
        
        let closest = arr[closestIndex];
        if (closestIndex > 0) {
            const leftNeighbor = arr[closestIndex - 1];
            closest = Math.abs(leftNeighbor - target) < Math.abs(closest - target) ? leftNeighbor : closest;
        }
    
        return closest; 
    }

    function handlePlotClick(xvalue) {
        let ls = JSON.parse(localStorage.getItem('videoDelayIdx'))
        if (ls.synchronize === "true") {
            let timestampX = propsData.timelist.x[xvalue]
            if (parseInt(ls.start.startVideoSync) <= timestampX && parseInt(ls.end.endVideoSync) >= timestampX) {
                videoElementRef.current.currentTime = ((timestampX - (ls.start.startVideoSync))/1000)+ ls.start.startVideoTime
            }
        }
    }


    useImperativeHandle(ref, () => ({
        syncVideo, 
        handlePlotClick
    }));

    return (
        <div>
            <video ref={videoElementRef} id="syncVideo" width="600" height="400" controls>
                <source src={propsData.pathVideo} type="video/webm" />
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
                    {(videoElementRef.current && videoElementRef.current.playbackRate) ? videoElementRef.current.playbackRate.toFixed(2) : '1.00'}x
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
                //onClick={toggleSync}
                className="video-button"
                style={{
                    backgroundColor: syncEnabled ? '#4CAF50' : '#f44336',
                    padding: '8px 16px',
                    marginLeft: '10px'
                }}
            >
                {syncEnabled ? 'Disable Sync' : 'Enable Sync'}
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
});

export default VideoControls;
