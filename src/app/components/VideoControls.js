import React, { useEffect, useRef } from 'react';

const VideoControls = ({ propsData }) => {

    const videoRef = propsData.videoRef;

    const togglePlayPause = () => {
        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
    };

    function ff() {
        console.log("ff"    );
    }

    useEffect(() => {
        const handleKeydown = (event) => {
            // Ensure video element is defined
            if (!videoRef) return;

            switch (event.code) {
                case 'Space':
                    event.preventDefault(); // Prevent default page scroll with spacebar
                    togglePlayPause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - videoRef.current.duration * 0.1);
                    videoRef.current.pause();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + videoRef.current.duration * 0.1);
                    videoRef.current.pause();
                    break;
                default:
                    break;
            }
        };

        // Add event listener for keydown
        window.addEventListener('keydown', handleKeydown);

        


        //add an update function to the video to update the plot when video currentTime changes
        videoRef.current.addEventListener('timeupdate', () => {
            
            if (propsData.plotList.current.length > 0) {
                const currentVideoTime = propsData.videoRef.current.currentTime;
                console.log('Video time:', currentVideoTime, currentVideoTime * 1000, propsData.videoRef.current.duration);

                const currentTimestamp = 0 + currentVideoTime * 1000; // replace 0 with videoStartTimestamp if we are using timestamps

                const windowSize = 1000; // 10 seconds before and after center point

                const newLayout = {
                    'xaxis.range[0]': currentTimestamp - windowSize,
                    'xaxis.range[1]': currentTimestamp + windowSize,
                    'yaxis.range[0]': -100,
                    'yaxis.range[1]': 150,

                };

                propsData.syncZoom(newLayout, propsData.plotList.current);
            }
        });

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    return (
        <div>
            <video ref={videoRef} id="syncVideo" width="600" height="400" controls>
                <source src={propsData.pathVideo} type="video/webm" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoControls;









/*
useEffect(() => {
    if (propsData && videoRef.current) {
        videoRef.current.currentTime = propsData.currentVideoTime;
    }
}, [propsData.currentVideoTime]);
*/


