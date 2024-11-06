"use client";

import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

const VideoSignalSync = () => {
    const videoRef = useRef(null);
    const plotRef = useRef(null);

    // Example accelerometer data (timestamp in Unix time, X-axis values)
    const accelData = [
        { timestamp: 1609459200000, x: 0.01 },
        { timestamp: 1609459201000, x: 0.02 },
        { timestamp: 1609459202000, x: 0.01 },
        { timestamp: 1609459203000, x: 0.00 },
        { timestamp: 1609459204000, x: -0.01 },
        { timestamp: 1609459205000, x: -0.02 },
        { timestamp: 1609459206000, x: 0.01 },
        { timestamp: 1609459207000, x: 0.02 },
        { timestamp: 1609459208000, x: 0.03 },
        { timestamp: 1609459209000, x: 0.02 },
        { timestamp: 1609459210000, x: 0.01 },
    ];

    // Define when the video starts in Unix time
    const videoStartTimestamp = 1609459200000;

    const plotSignal = (signalData) => {
        const timestamps = signalData.map(point => point.timestamp);
        const xValues = signalData.map(point => point.x);

        const trace = {
            x: timestamps,
            y: xValues,
            mode: 'lines',
            type: 'scatter',
        };

        const layout = {
            title: 'Accelerometer X-axis Signal',
            xaxis: { title: 'Timestamp (Unix Time)' },
            yaxis: { title: 'X Value' },
        };

        Plotly.newPlot(plotRef.current, [trace], layout);
    };

    const syncPlotToVideo = (currentVideoTime) => {
        const currentTimestamp = videoStartTimestamp + currentVideoTime * 1000;
        const windowSize = 5000; // 5 seconds before and after

        const filteredData = accelData.filter(point =>
            point.timestamp >= (currentTimestamp - windowSize) &&
            point.timestamp <= (currentTimestamp + windowSize)
        );

        const update = {
            x: [filteredData.map(point => point.timestamp)],
            y: [filteredData.map(point => point.x)],
        };

        Plotly.restyle(plotRef.current, update);
        Plotly.relayout(plotRef.current, {
            'xaxis.range': [currentTimestamp - windowSize, currentTimestamp + windowSize],
        });
    };

    function syncPlotToVideo2(currentVideoTime) {

        // Get the current timestamp of the video in milliseconds
        const currentTimestamp = 0 + currentVideoTime * 1000;

        // Define the moving window range
        const windowSize = 50000;  // 5 seconds before and after

        // Update only the x-axis range to create a moving window effect
        Plotly.relayout('signalPlot', {
            'xaxis.range': [currentTimestamp - windowSize, currentTimestamp + windowSize]
        });
    }

    useEffect(() => {
        // Initial plot
        plotSignal(accelData);

        const videoElement = videoRef.current;

        const handleTimeUpdate = () => {
            const currentVideoTime = videoElement.currentTime; // Time in seconds
            syncPlotToVideo(currentVideoTime);
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);

        // Cleanup event listener on component unmount
        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

    const handlePlotClick = (data) => {
        const clickedTimestamp = data.points[0].x; // Get the clicked timestamp
        const videoTime = (clickedTimestamp - videoStartTimestamp) / 1000; // Convert to seconds
        videoRef.current.currentTime = videoTime; // Seek video to this time
    };

    useEffect(() => {
        const signalPlotDiv = plotRef.current;

        // Add click event listener to sync video with plot
        signalPlotDiv.on('plotly_click', handlePlotClick);

        // Cleanup click event listener on component unmount
        return () => {
            signalPlotDiv.on('plotly_click', null);
        };
    }, []);

    return (
        <div>
            <h1>Video and Signal Sync Example</h1>
            <video ref={videoRef} width="600" controls>
                <source src="/images/placeholder.webm" type="video/webm" />
                Your browser does not support the video tag.
            </video>
            <div ref={plotRef} style={{ width: '100%', height: '500px' }}></div>
        </div>
    );
};

export default VideoSignalSync;
