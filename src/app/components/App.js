// App.js
"use client"; // Ensure this component is a Client Component

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import Graph from './Graph';
import ControlPanel from './ControlPanel';
import CSVUpload from './CSVUpload';

import VideoControls from './VideoControls';
import Plotly from 'plotly.js-dist';

const App = ({ hasVideo = true }) => {
    const [temporaryData, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing

    const [appMode, setAppMode] = useState('None'); // Mode for app Actions ONLY
    
    const [selections, setSelections] = useState([]); // Array to store selected regions
    const [shapes, setShapes] = useState([]);  // To store shapes (periods)
    const [annotations, setAnnotations] = useState([]);  // To store annotations (flags)

    const prevMidPointRef = useRef(null);
    const [prevMidPoint, setPrevMidPoint] = useState(null);

    const plotList = useRef([]);
    const videoRef = useRef(null);

    // Function to parse CSV and extract data
    const parseCSV = (file) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    setError("Error parsing CSV file. Check the console for details.");
                    console.error("CSV Parsing Errors:", results.errors);
                    return;
                }

                const newData = results.data.filter(row =>
                    row.timestamp !== undefined &&
                    row.x !== undefined &&
                    row.y !== undefined &&
                    row.z !== undefined &&
                    row.timestamp !== '' &&
                    row.x !== '' &&
                    row.y !== '' &&
                    row.z !== ''
                );

                if (newData.length === 0) {
                    setError("No valid data found in CSV.");
                    console.error("No valid data found.");
                    return;
                }

                const newTimestamps = newData.map(row => row.timestamp);
                const signalX = newData.map(row => row.x);
                const signalY = newData.map(row => row.y);
                const signalZ = newData.map(row => row.z);

                setData([
                    { x: newTimestamps, y: signalX, type: 'scatter', mode: 'lines', line: { color: 'red' } },
                    { x: newTimestamps, y: signalY, type: 'scatter', mode: 'lines', line: { color: 'green' } },
                    { x: newTimestamps, y: signalZ, type: 'scatter', mode: 'lines', line: { color: 'blue' } }
                ]);
                setError('');
            },
            error: (error) => {
                setError("Error parsing CSV: " + error.message);
                console.error("Error parsing CSV: ", error);
            },
        });
    };



    // Function to reset the zoom on all three plots
    function resetZoom() {

        plotList.current.forEach((plotRef) => {
            Plotly.relayout(plotRef.current, { 'xaxis.autorange': true, 'yaxis.autorange': true });
        });
    };

    function resetMode() {
        setAppMode('None');
        setPlotlyDragMode(false);
    }

    // Clear all events like periods/flags from the Plotly plots
    function resetEvents() {

        // Clear shapes and annotations from all three plot references
        const updatedShapes = [];
        const updatedAnnotations = [];

        // Update the shapes and annotations on each plot
        plotList.current.forEach((plotRef) => {
            Plotly.relayout(plotRef.current, { shapes: updatedShapes, annotations: updatedAnnotations });
        });

        // Clear any stored selections
        setSelections([]);

        // Reset mode after clearing events
        setAppMode('None');

        // Clear global state for shapes and annotations if they are used
        setShapes(updatedShapes);
        setAnnotations(updatedAnnotations);

        console.log('All periods and flags have been reset.');
    }

    // Function to completely clear plots and reset the state
    function voidPlots() {

        plotList.current.forEach((plotRef) => {
            Plotly.purge(plotRef.current);
        });

        setData([]);
        setSelections([]);
        setError('');
    }


    function setPlotlyDragMode(newDragMode) {


        console.log(`Plotly drag mode set to: ${newDragMode}`);

        plotList.current.forEach((plotRef) => {

            //if we don't use scrollzoom just use
            //Plotly.relayout(plotRef, { dragmode: newDragMode });

            // Get the current layout of the plot
            const currentLayout = {
                ...plotRef.current_fullLayout,
                annotations: plotRef.current.layout.annotations,
                dragmode: newDragMode,
                margin: plotRef.current.layout.margin,
                shapes: plotRef.current.layout.shapes,
                title: plotRef.current.layout.title,
                xaxis: { range: plotRef.current.layout.xaxis.range },
                yaxis: { range: plotRef.current.layout.yaxis.range },
            };

            // Set the scrollZoom configuration based on the new drag mode
            const config = {
                displayModeBar: false,
                doubleClick: false,
                scrollZoom: newDragMode === 'pan' };

            // Use Plotly.react to update the axis ranges and scrollZoom
            Plotly.react(plotRef.current, plotRef.current.data, currentLayout, config);
        });
    }

    function launchVideoMode() {
        console.log('Video Mode launched');

    }

    function syncZoom(eventdata, plotRefList) {

        console.log('prevMidPointRef:', prevMidPointRef);

        if (prevMidPointRef.current !== null) {
            //delete the previous flag
            deleteRegion(propsData.plotList, prevMidPointRef.current);
        }

        //get the x and y range of the plot
        const layoutUpdate = {
            'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
            'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']]
        };

        //update the x and y range of the other plots
        if (eventdata['xaxis.range[0]'] !== undefined) {

            const midPoint = (eventdata['xaxis.range[0]'] + eventdata['xaxis.range[1]']) / 2;

            prevMidPointRef.current = midPoint;

            plotRefList.forEach((plotRef) => {
                Plotly.relayout(plotRef.current, layoutUpdate);

                highlightFlag(midPoint, { width: 3, color: 'red', dash: 'solid' }, 'Indicator');


            });
        }
    };

    function highlightFlag(xValue, style, text) {

        const shape = {
            type: 'line',
            x0: xValue,
            x1: xValue,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: style,
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
            text: text,
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

        plotList.current.forEach(plotRef => {
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
                
                // Check if there is a corresponding annotation before deleting
                if (plotRef.current.layout.annotations && 
                    plotRef.current.layout.annotations.length > regionIndex) {
                    plotRef.current.layout.annotations.splice(regionIndex, 1);
                }
            });

            selections.splice(regionIndex, 1);

            // Update the shapes and annotations on the plots
            plotList.current.forEach(plotRef => {
                Plotly.relayout(plotRef.current, { 
                    shapes: plotRef.current.layout.shapes,
                    annotations: plotRef.current.layout.annotations || []
                });
            });

            console.log(`Region and any associated annotation removed at x: ${xValue}`);
        }
    }


    
    return (
        <div style={styles.container}>
            <h2>Upload CSV to Create Synced Plots</h2>
            <p style={{ fontWeight: 'bold', color: 'red' }}>
                (please use modified file published on discord or remove the last line in csv file if blank)
            </p>

            {hasVideo && (
                <VideoControls propsData={{
                    pathVideo: '/images/placeholder.webm',
                    plotList: plotList,
                    syncZoom: syncZoom,
                    videoRef: videoRef,
                    highlightFlag: highlightFlag,
                    deleteRegion: deleteRegion
                }} />
            )}

            <CSVUpload parseCSV={parseCSV} error={error} />

            {temporaryData.length > 0 && (
                <>
                    <ControlPanel
                        resetZoom={resetZoom}
                        resetMode={() => setAppMode('None')}
                        resetEvents={resetEvents}
                        voidPlots={voidPlots}
                        plotList={plotList}
                        setAppMode={setAppMode}
                        setPlotlyDragMode={setPlotlyDragMode}
                        appMode={appMode}
                    />

                    <Graph 
                        temporaryData={temporaryData} 
                        plotList={plotList} 
                        appMode={appMode} 
                        setAppMode={setAppMode} 
                        hasVideo={hasVideo} 
                        syncZoom={syncZoom}
                        videoRef={videoRef}
                        highlightFlag={highlightFlag}
                        deleteRegion={deleteRegion}
                    />
                </>
            )}
           
        </div>
    );
    
};

const styles = {
    container: {
        padding: '20px',
        textAlign: 'center',
    },
};

export default App;