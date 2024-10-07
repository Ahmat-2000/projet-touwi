"use client"; // Ensure this component is a Client Component

import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';


const DemoPlotly = () => {
    const [data, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing
    let mode = 'None'; // Default mode
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
                const signalY = newData.map(row => row.x); // Correctly map to row.y
                const signalZ = newData.map(row => row.x); // Correctly map to row.z

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

    function toggleAddMode() {
        changeMode('add');
    }

    function toggleDeleteMode() {
        changeMode('delete');
    }

    function changeMode(currentMode) {
        mode = currentMode;
        console.log(`Mode changed to: ${mode}`);
        document.getElementById('modeIndicator').innerText = `Mode: ${mode}`;
    }

    function resetSelection() {
        changeMode('None');
    }

    function highlightRegion(Plotly, start, end) {
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

        Plotly.relayout(plotRef1.current, { shapes: [...plotRef1.current.layout.shapes, shape] });
        Plotly.relayout(plotRef2.current, { shapes: [...plotRef2.current.layout.shapes, shape] });
        Plotly.relayout(plotRef3.current, { shapes: [...plotRef3.current.layout.shapes, shape] });
    }

    function deleteRegion(Plotly, ly_plots, xValue) {
        const layout_plot1 = ly_plots[0];
        const layout_plot2 = ly_plots[1];
        const layout_plot3 = ly_plots[2];


        // Find the region that contains the clicked xValue
        let regionIndex = layout_plot1.shapes.findIndex(shape => shape.x0 <= xValue && shape.x1 >= xValue);
        if (regionIndex !== -1) {
            // Remove the region from both layout.shapes and selections
            layout_plot1.shapes.splice(regionIndex, 1);
            layout_plot2.shapes.splice(regionIndex, 1);
            layout_plot3.shapes.splice(regionIndex, 1);
            selections.splice(regionIndex, 1);

            // Update the shapes on the plots
            Plotly.relayout(plotRef1.current, { shapes: layout_plot1.shapes });
            Plotly.relayout(plotRef2.current, { shapes: layout_plot2.shapes });
            Plotly.relayout(plotRef3.current, { shapes: layout_plot3.shapes });

            console.log(`Region removed at x: ${xValue}`);
        }
    }

    const handlePlotClick = (eventData, Plotly) => {
        const xValue = eventData.points[0].x;
        console.log(`Clicked at x: ${xValue}`);
        console.log(`Current mode: ${mode}`);

        // Handle the different modes
        if (mode === 'delete') {
            deleteRegion(Plotly, [plotRef1.current.layout, plotRef2.current.layout, plotRef3.current.layout], xValue);
        } else {
            if (mode === 'add') {
                if (selections.length === 0 || selections[selections.length - 1].end !== null) {
                    console.log(`Selected region: Start - ${xValue}`);
                    selections.push({ start: xValue, end: null });
                }
                else {
                    console.log(`Selected region: Start - ${selections[selections.length - 1].start}, End - ${xValue}`);
                    selections[selections.length - 1].end = xValue;
                    // Highlight the region across all plots
                    highlightRegion(Plotly, selections[selections.length - 1].start, xValue);
                }
            }
        }
    };


    const syncZoom = (eventdata, Plotly, [toChange1, toChange2]) => {
        //get the x and y range of the plot
        const layoutUpdate = {
            'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
            'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']]
        };

        //update the x and y range of the other plots
        if (eventdata['xaxis.range[0]'] !== undefined) {
            Plotly.relayout(toChange1.current, layoutUpdate);
            Plotly.relayout(toChange2.current, layoutUpdate);
        }

        /*
        if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
            Plotly.relayout(toChange1.current, layoutUpdate);
            Plotly.relayout(toChange2.current, layoutUpdate);
        }
        */


    };


    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

        // Only create the plots if data is available
        if (data.length > 0) {
            // Initialize the first Plotly chart

            const layout_plot1 = {
                yaxis: { title: 'Signal X' },
                shapes: [],
                margin: { t: 40, b: 20, l: 60, r: 20 }
            };

            const layout_plot2 = {
                yaxis: { title: 'Signal Y' },
                shapes: [],
                margin: { t: 40, b: 20, l: 60, r: 20 }
                
                
            };

            const layout_plot3 = {
                xaxis: { title: 'Timestamp' },
                yaxis: { title: 'Signal Z' },
                shapes: [],
                margin: { t: 40, b: 40, l: 60, r: 20 }
            };

            const config = {
                displayModeBar: false,
                modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d'],
                displaylogo: false
            };


            Plotly.newPlot(plotRef1.current, [data[0]], layout_plot1, config);
            Plotly.newPlot(plotRef2.current, [data[1]], layout_plot2, config);
            Plotly.newPlot(plotRef3.current, [data[2]], layout_plot3, config);

            plotRef1.current.on('plotly_click', (eventData) => handlePlotClick(eventData, Plotly));
            // Add event listener for plotly_click on the second plot
            plotRef2.current.on('plotly_click', (eventData) => handlePlotClick(eventData, Plotly));
            // Add event listener for plotly_click on the third plot
            plotRef3.current.on('plotly_click', (eventData) => handlePlotClick(eventData, Plotly));


            plotRef1.current.on('plotly_relayout', (eventdata) => syncZoom(eventdata, Plotly, [plotRef2, plotRef3]));
            plotRef2.current.on('plotly_relayout', (eventdata) => syncZoom(eventdata, Plotly, [plotRef1, plotRef3]));
            plotRef3.current.on('plotly_relayout', (eventdata) => syncZoom(eventdata, Plotly, [plotRef1, plotRef2]));

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
                    <button onClick={resetSelection} style={styles.button}>Reset Mode</button>
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
        height: 'auto',
        width: '100%',
        overflow: 'hidden',
    },
    plot: {
        margin: '0', // Changed from '20px 0' to '0'
        width: '95%',
        height: '400px',
    },
    controls: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
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


export default DemoPlotly;
