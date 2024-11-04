// Graph.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

import Plot from './Plot';


const Graph = ({ temporaryData, plotList, appMode, setAppMode, hasVideo, syncZoom, videoRef, highlightFlag, deleteRegion }) => {
    const [plots, setPlots] = useState([]);
    const [selections, setSelections] = useState([]);

    const appModeRef = useRef(appMode);

    useEffect(() => {
        appModeRef.current = appMode;
    }, [appMode]);


    useEffect(() => {
        console.log('Graph useEffect');
        createPlot('Accelerometer', 'x', 'P11', temporaryData[0]['y']); // Display Accelerometer x-axis data by default
    }, []);


    
    function fetchData(sensor, axis) {
        
        const data = readAndGetColumFromCSV(sensor, axis);
        const timestamp = readAndGetColumFromCSV('timestamp');

        return [timestamp, data];
    }

    function readAndGetColumFromCSV(sensor, axis) {
        
        const simulatedData = {
            Accelerometer: {
                x: Array.from({ length: 30157 }, () => Math.random() * 200 - 50),
                y: Array.from({ length: 30157 }, () => Math.random() * 200 - 50),
                z: Array.from({ length: 30157 }, () => Math.random() * 200 - 50)
            },
            Gyroscope: {
                x: Array.from({ length: 30157}, () => Math.random() * 200 - 50),    
                y: Array.from({ length: 30157}, () => Math.random() * 200 - 50),
                z: Array.from({ length: 30157}, () => Math.random() * 200 - 50)
            },
            timestamp: Array.from({ length: 30157 }, (_, i) => i)
        };

        // Case we want Timestamps
        if (typeof axis === 'undefined') {
            return simulatedData[sensor];
        }

        // Case we want a specific axis
        return simulatedData[sensor][axis];
    }

    function handlePlotClick (eventData) {
        const xValue = eventData.points[0].x;

        const currentAppMode = appModeRef.current;

        console.log(`Clicked at x: ${xValue} App mode: ${currentAppMode}`);

        // When clicking a point in a plot, if we have a video, the video should jump to the corresponding timestamp
        if (currentAppMode === 'None') {
            if (hasVideo) {
                const video = videoRef.current;
                const videoDuration = video.duration; // Get video duration in seconds
                const signalLength = plotList.current[0].current.data[0].x.length; // Get signal length from plotly data
                
                // Convert signal index to video time using linear mapping
                const videoTime = (xValue / signalLength) * videoDuration;
                
                // Set video current time
                video.currentTime = videoTime;
                console.log(`Jumping to video time: ${videoTime}s`);
            }
        }

        // Handle the different modes
        if ( currentAppMode === 'delete') {
            deleteRegion(plotList, xValue, false);
        } else {
            if (currentAppMode === 'period') {
                if (selections.length === 0 || selections[selections.length - 1].end !== null) {
                    console.log(`Selected region: Start - ${xValue}`);
                    selections.push({ start: xValue, end: null });
                }
                else {
                    console.log(`Selected region: Start - ${selections[selections.length - 1].start}, End - ${xValue}`);
                    selections[selections.length - 1].end = xValue;
                    // Highlight the region across all plots
                    highlightRegion( selections[selections.length - 1].start, xValue);
                }
            }

            if (currentAppMode === 'flag') {
                console.log(`Flag added at x: ${xValue}`);
                highlightFlag( xValue, { width: 1, color: 'blue', dash: 'dashdot' }, 'Flag');
            }


        }
    };

    function highlightRegion(start, end) {
        if (start > end) {
            [start, end] = [end, start];
        }

        const shape = {
            type: 'rect',
            x0: start,
            x1: end,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            fillcolor: 'rgba(255, 0, 0, 0.35)',
            line: {
                width: 0
            }
        };
        
        plotList.current.forEach(plotRef => {
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape] });
        });
        
        
    }


    

    function handlePlotHover (eventData) {
        const xValue = eventData.points[0].x;
        console.log(`Hovering over x: ${xValue}`);
    };
    

    function createPlot(sensor, axis, filename, data) {
        
        // bricolage en attendant de pouvoir fetch les données du .touwi
        if (data === undefined) {
            const tmp = fetchData(sensor, axis);
            data = tmp[1];
            // data = [ [5, 7, 3, 4], [1, 2, 3, 4] ]

        }
        
        // Create timestamp array from 0 to data length
        const timestamp = Array.from({ length: data.length }, (_, i) => i);

        
        const props = {
            data: data,
            title: filename + ' ' + sensor + ' ' + axis,
            timestamp: timestamp,
            handlePlotClick: (eventData) => handlePlotClick(eventData),
            hover: handlePlotHover,
            handleRelayout: syncZoom,
            plotRefList: plotList.current,
            shapes: [],
            annotations: [],
            appMode: appMode,
            
        };

        // Create new plot
        const newPlot = <Plot key={props.title} propsData={props} />;

        // Add new plot to plots list
        setPlots([...plots, newPlot]);
        
    }


    return (
        <div>
            <div>
                <button onClick={() => createPlot('Accelerometer', 'x', 'P11')}>Create Plot</button>
            </div>

            <div>
                {plots.map((plot, index) => (
                    <div key={index} style={{ marginTop: '20px' }}>
                        {plot}
                    </div>
                ))}
            </div>
        </div>
);
};

const styles = {
    plotContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 'auto',
        width: '100%',
        overflow: 'hidden'
    }
};

export default Graph;
