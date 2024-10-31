// Graph.js

import React, { useState, useRef, useEffect } from 'react';
import Plot from './Plot';
import Plotly from 'plotly.js-dist';


const Graph = ({ temporaryData, plotList, appMode, setAppMode, hasVideo, syncZoom }) => {
    const [plots, setPlots] = useState([]);
    const [selections, setSelections] = useState([]);

    const appModeRef = useRef(appMode);

    useEffect(() => {
        appModeRef.current = appMode;
    }, [appMode]);


    useEffect(() => {
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
                video.currentTime = xValue / 1000; // might be (xValue - videoStartTimestamp) / 1000 if we are using tstamps
            }
        }

        // Handle the different modes
        if ( currentAppMode === 'delete') {
            deleteRegion(plotList, xValue);
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
                highlightFlag( xValue);
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

    function highlightFlag(xValue) {

        const shape = {
            type: 'line',
            x0: xValue,
            x1: xValue,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: {
                width: 1,
                color: 'blue',
                dash: 'dashdot'
            },
        };

        const annotation = {
            x: xValue, //+ 3000,
            /* this is shitty because xValue is a timestamp so values are fucked and doesn't go 
            from 1 to 30_000 but 1.464T to 1.513T so text need 3000 to move a bit to the right of the flag bar
            @Antoine
            */
            y: 1, // Adjust this value to position the text on the y-axis
            xref: 'x',
            yref: 'paper',
            text: 'Default Text', // Your default text here
            showarrow: false,
            font: {
                size: 12,
                color: 'black'
            },
            bordercolor: 'grey',
            borderwidth: 2,
            borderpad: 4,
            align: 'left',
            valign: 'middle',

        };

        plotList.current.forEach(plotRef =>{
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape], annotations: [...plotRef.current.layout.annotations, annotation] });
        });

    }


    function deleteRegion(plotList, xValue) {


        // Find the region that contains the clicked xValue
        let regionIndex = plotList.current[0].current.layout.shapes.findIndex(shape => shape.x0 <= xValue && shape.x1 >= xValue);
        if (regionIndex !== -1) {
            // Remove the region from both layout.shapes and selections
            plotList.current.forEach(plotRef => {
                plotRef.current.layout.shapes.splice(regionIndex, 1);
            });

            selections.splice(regionIndex, 1);

            // Update the shapes on the plots
            plotList.current.forEach(plotRef => {
                Plotly.relayout(plotRef.current, { shapes: plotRef.current.layout.shapes, annotations: plotRef.current.layout.annotations });
            });

            console.log(`Region removed at x: ${xValue}`);
        }
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

        const newPlot = <Plot key={props.title} propsData={props} />;


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
