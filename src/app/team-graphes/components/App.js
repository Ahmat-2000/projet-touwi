// App.js
"use client"; // Ensure this component is a Client Component

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import Graph from './Graph';
import ControlPanel from './ControlPanel';
import CSVUpload from './CSVUpload';

const App = () => {
    const [data, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing
    const [appMode, setAppMode] = useState('None'); // Default interaction mode
    const [selections, setSelections] = useState([]); // Array to store selected regions

    const plotRef1 = useRef(null);
    const plotRef2 = useRef(null);
    const plotRef3 = useRef(null);

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

    // Set the drag mode for Plotly plots (zoom, pan, etc.)
    function setPlotlyDragMode(newDragMode) {
        const Plotly = require('plotly.js/dist/plotly.js');
        console.log(`Plotly drag mode set to: ${newDragMode}`);

        Plotly.relayout(plotRef1.current, { dragmode: newDragMode });
        Plotly.relayout(plotRef2.current, { dragmode: newDragMode });
        Plotly.relayout(plotRef3.current, { dragmode: newDragMode });
    }

    // Clear all events like periods/flags from the Plotly plots
    function resetEvents() {
        const Plotly = require('plotly.js/dist/plotly.js');

        Plotly.relayout(plotRef1.current, { shapes: [], annotations: [] });
        Plotly.relayout(plotRef2.current, { shapes: [], annotations: [] });
        Plotly.relayout(plotRef3.current, { shapes: [], annotations: [] });
        
        setSelections([]); // Optionally reset selections
        setAppMode('None'); // Optionally reset mode after clearing events
    }

    // Function to completely clear plots and reset the state
    function voidPlots() {
        const Plotly = require('plotly.js/dist/plotly.js');
        Plotly.purge(plotRef1.current);
        Plotly.purge(plotRef2.current);
        Plotly.purge(plotRef3.current);
        setData([]);
        setSelections([]);
        setError('');
    }

    return (
        <div style={styles.container}>
            <h2>Upload CSV to Create Synced Plots</h2>
            <p style={{ fontWeight: 'bold', color: 'red' }}>
                (please use modified file published on discord or remove the last line in csv file if blank)
            </p>

            <CSVUpload parseCSV={parseCSV} error={error} />

            {data.length > 0 && (
                <>
                    <ControlPanel
                        mode={appMode}                  // Current interaction mode
                        setAppMode={setAppMode}          // App interaction mode setter
                        setPlotlyDragMode={setPlotlyDragMode}  // Plotly drag mode setter
                        resetMode={() => setAppMode('None')}  // Reset app interaction mode
                        resetEvents={resetEvents}        // Clear annotations and shapes
                        voidPlots={voidPlots}            // Clear all data and plots
                    />
                    <Graph
                        data={data}
                        plotRef1={plotRef1}
                        plotRef2={plotRef2}
                        plotRef3={plotRef3}
                        selections={selections}
                        setSelections={setSelections}
                        mode={appMode}  // Passing the current interaction mode to Graph component
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
