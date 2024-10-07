"use client"; // Ensure this component is a Client Component

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

const SignalLabeling = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const plotRefs = useRef([React.createRef(), React.createRef(), React.createRef()]); // Create refs for the three plots

    // Function to parse CSV and extract data
    const parseCSV = (file) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: (results) => {
                // Check for parsing errors
                if (results.errors.length > 0) {
                    setError("Error parsing CSV file. Check the console for details.");
                    console.error("CSV Parsing Errors:", results.errors);
                    return;
                }

                // Preprocess the data to remove any empty or invalid rows
                const newData = results.data.filter(row =>
                    row.timestamp !== undefined &&
                    row.x !== undefined &&
                    row.y !== undefined &&
                    row.z !== undefined &&
                    row.timestamp !== '' && // Filter out empty timestamps
                    row.x !== '' &&          // Filter out empty x values
                    row.y !== '' &&          // Filter out empty y values
                    row.z !== ''             // Filter out empty z values
                );

                if (newData.length === 0) {
                    setError("No valid data found in CSV.");
                    console.error("No valid data found.");
                    return;
                }

                // Extract data for plotting
                const newTimestamps = newData.map(row => row.timestamp);
                const signalX = newData.map(row => row.x);
                const signalY = newData.map(row => row.y);
                const signalZ = newData.map(row => row.z);

                // Set the data for the plot
                setData([
                    { x: newTimestamps, y: signalX, type: 'scatter', mode: 'lines', name: 'Signal X', line: { color: 'red' } },
                    { x: newTimestamps, y: signalY, type: 'scatter', mode: 'lines', name: 'Signal Y', line: { color: 'green' } },
                    { x: newTimestamps, y: signalZ, type: 'scatter', mode: 'lines', name: 'Signal Z', line: { color: 'blue' } }
                ]);
                setError(''); // Clear any previous errors
            },
            error: (error) => {
                setError("Error parsing CSV: " + error.message);
                console.error("Error parsing CSV: ", error);
            },
        });
    };

    // Function to handle file input change
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            parseCSV(file);
        }
    };

    // Sync zooming and panning across all plots
    const syncZoom = (eventdata, index, Plotly) => {
        const otherPlots = plotRefs.current.filter((_, i) => i !== index); // Get the other plots
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

    useEffect(() => {
        // Load Plotly after the component mounts
        const Plotly = require('plotly.js/dist/plotly.js');

        // Create the plots only if there is data
        if (data.length > 0) {
            plotRefs.current.forEach((plotRef, index) => {
                Plotly.newPlot(plotRef.current, [data[index]], {
                    title: `Signal ${['X', 'Y', 'Z'][index]}`,
                    xaxis: { title: 'Timestamp' },
                    yaxis: { title: `Signal ${['X', 'Y', 'Z'][index]}` },
                });

                // Sync the plots
                const syncPlot = (eventdata) => syncZoom(eventdata, index, Plotly);
                plotRef.current.on('plotly_relayout', syncPlot);

                // Store the syncPlot function for cleanup
                plotRef.current.syncPlot = syncPlot;
            });
        }

        // Cleanup function to remove event listeners
        return () => {
            plotRefs.current.forEach((plotRef) => {
                if (plotRef.current && plotRef.current.syncPlot) {
                    plotRef.current.removeEventListener('plotly_relayout', plotRef.current.syncPlot);
                }
            });
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
            <div style={styles.plotContainer}>
                {data.length > 0 && (
                    <>
                        <div ref={plotRefs.current[0]} style={styles.plot} />
                        <div ref={plotRefs.current[1]} style={styles.plot} />
                        <div ref={plotRefs.current[2]} style={styles.plot} />
                    </>
                )}
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
        margin: '20px 0',
        width: '80%', // Adjust width as necessary
        height: '400px', // Fixed height for plots
    },
};

export default SignalLabeling;
