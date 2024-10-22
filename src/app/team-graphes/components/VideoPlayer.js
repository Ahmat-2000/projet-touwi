import React from 'react';

const VideoPlayer = (path) => {

    console.log("Might consider a way to switch between normal mode and video mode cleanly");

    function syncVideoToPlot(start, end ,data, horizontalWidth, currentVideoTime){

        const currentTimestamp = start + currentVideoTime * 1000; // Convert to milliseconds

        // const horizontalWidth = 5000; 5 seconds video gap on the signal before and after the current timestamp
        
        const newSignalData = data.filter(point =>
            point.timestamp >= currentTimestamp - horizontalWidth 
            &&
            point.timestamp <= currentTimestamp + horizontalWidth
        );





    }


    return (
        <div>
            <video id="syncVideo" width="600" controls>
                <source src={path} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;