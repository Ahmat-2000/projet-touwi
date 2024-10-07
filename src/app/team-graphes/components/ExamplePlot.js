"use client"; // Ensure this component is a Client Component

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

const ExamplePlot = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const plotRefs = useRef([React.createRef(), React.createRef(), React.createRef()]);

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

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            parseCSV(file);
        }
    };

    const syncZoom = (eventdata, index, Plotly) => {
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

    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js');

        if (data.length > 0) {
            plotRefs.current.forEach((plotRef, index) => {
                Plotly.newPlot(plotRef.current, [data[index]], {
                    xaxis: { title: index === 2 ? 'Timestamp' : '' },
                    yaxis: { title: `Signal ${['X', 'Y', 'Z'][index]}` },
                }, {
                    displayModeBar: false, // Hide the entire mode bar
                    // Alternatively, you can selectively hide buttons if needed
                    // modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d', 'toggleSpikelines'],
                });

                const syncPlot = (eventdata) => syncZoom(eventdata, index, Plotly);
                plotRef.current.on('plotly_relayout', syncPlot);
                plotRef.current.syncPlot = syncPlot;
            });
        }

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
        margin: '0',  // Set margin to 0 to eliminate all gaps
        width: '95%',  // Set width to 95% of the page
        height: '400px', // Fixed height for plots
    },
};

export default ExamplePlot;
