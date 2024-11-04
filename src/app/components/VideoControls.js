import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const VideoControls = forwardRef(({ propsData }, ref) => {

    const videoElementRef = useRef(null);

    const timeUpdateHandlerRef = useRef(null);

    const appModeRef = useRef(propsData.appMode);

    const highlightedVideoPart = useRef(null);

    useEffect(() => {
        appModeRef.current = propsData.appMode;   
    }, [propsData.appMode]);

    const [, forceUpdate] = useState({});

    const adjustSpeed = (increment) => {
        try {
            const currentSpeed = videoElementRef.playbackRate;
            let newSpeed = increment ? currentSpeed * 2 : currentSpeed / 2;
             
            // Limit the speed between 0.1 and 16
            newSpeed = Math.min(16, Math.max(0.1, newSpeed));
            
            videoElementRef.playbackRate = newSpeed;
            forceUpdate({});
        } catch (error) {
            console.warn('Playback speed not supported:', error);
        }
    };

    const resetSpeed = () => {
        videoElementRef.playbackRate = 1;
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
                    {(videoElementRef && videoElementRef.playbackRate) ? videoElementRef.playbackRate.toFixed(2) : '1.00'}x
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
        </div>
    );
});

export default VideoControls;
