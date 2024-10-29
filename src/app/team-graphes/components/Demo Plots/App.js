// App.js
"use client"; // Ensure this component is a Client Component

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import Graph from './Graph';
import ControlPanel from './ControlPanel';

const App = () => {
    const [data, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing

    const [appMode, setAppMode] = useState('None'); // Mode for app Actions ONLY
    
    const [selections, setSelections] = useState([]); // Array to store selected regions
    const [shapes, setShapes] = useState([]);  // To store shapes (periods)
    const [annotations, setAnnotations] = useState([]);  // To store annotations (flags)

    const plotList = useRef([]);

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
        const Plotly = require('plotly.js/dist/plotly.js');

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
        const Plotly = require('plotly.js/dist/plotly.js');

        // Clear shapes and annotations from all three plot references
        const updatedShapes = [];
        const updatedAnnotations = [];

        // Update the shapes and annotations on each plot
        plotList.current.forEach((plotRef) => {
            Plotly.relayout(plotRef, { shapes: updatedShapes, annotations: updatedAnnotations });
        });



        // Clear any stored selections
        setSelections([]);

        // Optionally reset mode after clearing events
        setAppMode('None');

        // Optionally clear global state for shapes and annotations if they are used
        setShapes(updatedShapes);
        setAnnotations(updatedAnnotations);

        console.log('All periods and flags have been reset.');
    }

    // Function to completely clear plots and reset the state
    function voidPlots() {
        const Plotly = require('plotly.js/dist/plotly.js');

        plotList.current.forEach((plotRef) => {
            Plotly.purge(plotRef.current);
        });

        //Plotly.purge(plotRef1.current);
        //Plotly.purge(plotRef2.current);
        //Plotly.purge(plotRef3.current);
        setData([]);
        setSelections([]);
        setError('');
    }

    function setPlotlyDragMode(newDragMode) {
        const Plotly = require('plotly.js/dist/plotly.js');
        console.log(`Plotly drag mode set to: ${newDragMode}`);

        plotList.current.forEach((plotRef) => {
            Plotly.relayout(plotRef, { dragmode: newDragMode });
        });

        //Plotly.relayout(plotRef1.current, { dragmode: newDragMode });
        //Plotly.relayout(plotRef2.current, { dragmode: newDragMode });
        //Plotly.relayout(plotRef3.current, { dragmode: newDragMode });
    }
    
    return (
        <div style={styles.container}>
            <h2>Upload CSV to Create Synced Plots</h2>
            <p style={{ fontWeight: 'bold', color: 'red' }}>
                (please use modified file published on discord or remove the last line in csv file if blank)
            </p>

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

            <Graph plotList={plotList} appMode={appMode} setAppMode={setAppMode} />
           
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
