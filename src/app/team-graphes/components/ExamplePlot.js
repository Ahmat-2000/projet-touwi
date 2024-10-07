"use client"; // Ensure this component is a Client Component

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

const ExamplePlot = () => {
    const [data, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing

    const [mode, setMode] = useState('add'); // Mode can be 'add' or 'delete'

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
                const signalY = newData.map(row => row.y); // Correctly map to row.y
                const signalZ = newData.map(row => row.z); // Correctly map to row.z

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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            parseCSV(file);
        }
    };

    const syncZoom = (eventdata, index, Plotly) => {
        console.log('Syncing plots...');
        console.log(eventdata);
        console.log(index);
        console.log(Plotly);
        console.log("--------------------");
        const plotRefs = [plotRef1, plotRef2, plotRef3];
        const otherPlots = plotRefs.current.filter((_, i) => i !== index);
        otherPlots.forEach((plotRef) => {
            if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
                Plotly.relayout(plotRef.current, {
                    'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
                });
            }
            if (eventdata['yaxis.range[0]'] && eventdata['yaxis.range[1]']) {
                Plotly.relayout(plotRef.current, {
                    'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']],
                });
            }
        });
    };


    function toggleAddMode() {
        changeMode('add');
    }

    function toggleDeleteMode() {
        changeMode('delete');
    }

    function changeMode(currentMode) {
        setMode(currentMode);
        document.getElementById('modeIndicator').innerText = `Mode: ${currentMode}`;
    }

    function resetSelection() {
        changeMode('None');
    }

    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

        // Only create the plots if data is available
        if (data.length > 0) {

            // Initialize the first Plotly chart
            Plotly.newPlot(plotRef1.current, [data[0]], {
                title: 'First Plotly Graph',
                xaxis: { title: 'Timestamp' },
                yaxis: { title: 'Signal X' },
            });

            // Initialize the second Plotly chart
            Plotly.newPlot(plotRef2.current, [data[1]], {
                title: 'Second Plotly Graph',
                xaxis: { title: 'Timestamp' },
                yaxis: { title: 'Signal Y' },
            });

            // Initialize the third Plotly chart
            Plotly.newPlot(plotRef3.current, [data[2]], {
                title: 'Third Plotly Graph',
                xaxis: { title: 'Timestamp' },
                yaxis: { title: 'Signal Z' },
            });

            // Add event listener for plotly_click on the first plot
            plotRef1.current.on('plotly_click', (eventData) => {
                const xValue = eventData.points[0].x;
                const yValue = eventData.points[0].y;
                console.log(`First Plot clicked on point: (${xValue}, ${yValue})`);
            });

            // Add event listener for plotly_click on the second plot
            plotRef2.current.on('plotly_click', (eventData) => {
                const xValue = eventData.points[0].x;
                const yValue = eventData.points[0].y;
                console.log(`Second Plot clicked on point: (${xValue}, ${yValue})`);
            });

            // Add event listener for plotly_click on the third plot
            plotRef3.current.on('plotly_click', (eventData) => {
                const xValue = eventData.points[0].x;
                const yValue = eventData.points[0].y;
                console.log(`Third Plot clicked on point: (${xValue}, ${yValue})`);
            });

            // Sync the plots
            const syncPlot = (eventdata) => syncZoom(eventdata, index, Plotly);
            plotRef1.current.on('plotly_relayout', syncPlot);
            plotRef2.current.on('plotly_relayout', syncPlot);
            plotRef3.current.on('plotly_relayout', syncPlot);
            plotRef1.current.syncPlot = syncPlot;
            plotRef2.current.syncPlot = syncPlot;
            plotRef3.current.syncPlot = syncPlot;

        }

        // Cleanup on unmount
        return () => {
            // <!> Temporary fix <!>
            // Removing examples of event listeners for now but keep in mind that they still need to exist to be purged ( page reload / page redirect )
            if (plotRef1.current) {
                Plotly.purge(plotRef1.current);
                Plotly.purge(plotRef2.current);
                Plotly.purge(plotRef3.current);
            }
        };
    }, [data]);

    return (
        <div style={styles.container}>
            <h2>Upload CSV to Create Synced Plots</h2>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={styles.fileInput}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Conditionally render buttons only when data is loaded */}
            {data.length > 0 && (
                <div id="controls" style={styles.controls}>
                    <button onClick={toggleAddMode} style={styles.button}>Add Period</button>
                    <button onClick={toggleDeleteMode} style={styles.button}>Delete Period</button>
                    <button onClick={resetSelection} style={styles.button}>Reset All</button>
                    <span id="modeIndicator" style={styles.modeIndicator}>Mode: {mode}</span>
                </div>
            )}

            <div style={styles.plotContainer}>
                <div ref={plotRef1} style={styles.plot} />
                <div ref={plotRef2} style={styles.plot} />
                <div ref={plotRef3} style={styles.plot} />
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        textAlign: 'center',
    },
    fileInput: {
        margin: '20px 0',
    },
    plotContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    plot: {
        margin: '20px 0',  // Add margin to create space between plots
        width: '95%',
        height: '400px',
    },
    controls: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',  // Space between buttons
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#007BFF',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        transition: 'background-color 0.3s',
    },
    modeIndicator: {
        marginLeft: '10px',
        fontSize: '16px',
        color: '#333',
    }
};

export default ExamplePlot;
