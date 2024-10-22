"use client"; // Ensure this component is a Client Component

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Papa from 'papaparse';

const Plotly = require('plotly.js/dist/plotly.js');


const BaseApp = () => {
    const [data, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing
    let mode = 'None'; // Default mode
    const [selections, setSelections] = useState([]); // Array to store selected regions

    const plotRef1 = useRef(null);
    const plotRef2 = useRef(null);

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
                    { x: newTimestamps, y: signalX, type: 'scatter', mode: 'lines', line: { color: '#FF3131' } },
                    { x: newTimestamps, y: signalY, type: 'scatter', mode: 'lines', line: { color: '#00BF63' } }
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
        changeMode('period');
    }

    function toggleEventMode() {
        changeMode('flag');
    }

    function toggleDeleteMode() {
        changeMode('delete');
    }

    function setMode(newDragMode) {
        console.log(`Mode set to: ${newDragMode}`);

        Plotly.relayout(plotRef1.current, { dragmode: newDragMode });
        Plotly.relayout(plotRef2.current, { dragmode: newDragMode });
    }

    function changeMode(currentMode) {
        mode = currentMode;
        console.log(`Mode changed to: ${mode}`);
        document.getElementById('modeIndicator').innerText = `Mode: ${mode}`;
    }

    function resetMode() {
        changeMode('None');
    }

    function resetEvents() {

        Plotly.relayout(plotRef1.current, { shapes: [], annotations: [] });
        Plotly.relayout(plotRef2.current, { shapes: [], annotations: [] });
        //setSelections([]);
        //resetMode();
    }

    function voidPlots() {
        Plotly.purge(plotRef1.current);
        Plotly.purge(plotRef2.current);
        setData([]);
        setSelections([]);
        setError('');
    }

    function loadFile() {

        console.log('Loading preset periods');

        // timestamp start : 1711113095188
        // timestamp end : 1711113393011

        const minSignal = 1711113095188;
        const maxSignal = 1711113393011;
        const dif = maxSignal - minSignal;
        const gap = dif / 15;


        const exampleRawData = [
            [1711113095188, 1711113115042],
            [1711113154752, 1711113174606],
            [1711113214317, 1711113234171],
            [1711113273881, 1711113293735],
            [1711113333446, 1711113353300]

        ];

        const exampleFlagsData = [
            1711113125042,
            1711113184752,
            1711113244317,
            1711113303881,
        ];

        const exampleData = [];

        for (let i = 0; i < exampleRawData.length; i++) {
            highlightRegion(exampleRawData[i][0], exampleRawData[i][1]);
        }

        for (let i = 0; i < exampleFlagsData.length; i++) {
            highlightFlag(exampleFlagsData[i]);
        }
    }

    function checkPeriods() {
        const currentPeriodsList = plotRef1.current.layout.shapes;
        console.log("Current periods: ", currentPeriodsList);
    }


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
            fillcolor: 'rgba(255, 222, 89, 0.35)', // Converted hex color #FFDE59 to rgba
            line: {
            width: 0
            }
        };

        Plotly.relayout(plotRef1.current, { shapes: [...plotRef1.current.layout.shapes, shape] });
        Plotly.relayout(plotRef2.current, { shapes: [...plotRef2.current.layout.shapes, shape] });
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
            x: xValue + 4000,
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

        Plotly.relayout(plotRef1.current, { shapes: [...plotRef1.current.layout.shapes, shape], annotations: [...plotRef1.current.layout.annotations, annotation] });
        Plotly.relayout(plotRef2.current, { shapes: [...plotRef2.current.layout.shapes, shape], annotations: [...plotRef2.current.layout.annotations, annotation] });
    }


    function deleteRegion(ly_plots, xValue) {
        const layout_plot1 = ly_plots[0];
        const layout_plot2 = ly_plots[1];


        // Find the region that contains the clicked xValue
        let regionIndex = layout_plot1.shapes.findIndex(shape => shape.x0 <= xValue && shape.x1 >= xValue);
        if (regionIndex !== -1) {
            // Remove the region from both layout.shapes and selections
            layout_plot1.shapes.splice(regionIndex, 1);
            layout_plot2.shapes.splice(regionIndex, 1);
            selections.splice(regionIndex, 1);

            // Update the shapes on the plots
            Plotly.relayout(plotRef1.current, { shapes: layout_plot1.shapes, annotations: layout_plot1.annotations });
            Plotly.relayout(plotRef2.current, { shapes: layout_plot2.shapes, annotations: layout_plot2.annotations });

            console.log(`Region removed at x: ${xValue}`);
        }
    }

    const handlePlotClick = (eventData) => {
        const xValue = eventData.points[0].x;
        console.log(`Clicked at x: ${xValue}`);
        console.log(`Current mode: ${mode}`);

        // Handle the different modes
        if (mode === 'delete') {
            deleteRegion([plotRef1.current.layout, plotRef2.current.layout], xValue);
        } else {
            if (mode === 'period') {
                if (selections.length === 0 || selections[selections.length - 1].end !== null) {
                    console.log(`Selected region: Start - ${xValue}`);
                    selections.push({ start: xValue, end: null });
                }
                else {
                    console.log(`Selected region: Start - ${selections[selections.length - 1].start}, End - ${xValue}`);
                    selections[selections.length - 1].end = xValue;
                    // Highlight the region across all plots
                    highlightRegion(selections[selections.length - 1].start, xValue);
                }
            }

            if (mode === 'flag') {
                console.log(`Flag added at x: ${xValue}`);
                highlightFlag(xValue);
            }


        }
    };


    const syncZoom = (eventdata, [toChange1]) => {
        //get the x and y range of the plot
        const layoutUpdate = {
            'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
            'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']]
        };

        //update the x and y range of the other plots
        if (eventdata['xaxis.range[0]'] !== undefined) {
            Plotly.relayout(toChange1.current, layoutUpdate);
        }

        /*
        if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
            Plotly.relayout(toChange1.current, layoutUpdate);
            Plotly.relayout(toChange2.current, layoutUpdate);
        }
        */


    };


    useEffect(() => {

        console.log('Loading Plotly.js');

        // Only create the plots if data is available
        if (data.length > 0) {
            // Initialize the first Plotly chart

            const layout_plot1 = {
                xaxis: { showticklabels: false },
                yaxis: { title: 'Signal X' },
                shapes: [],
                annotations: [],
                margin: { t: 40, b: 20, l: 60, r: 20 }
            };

            const layout_plot2 = {
                xaxis: { showticklabels: false },
                yaxis: { title: 'Signal Y' },
                shapes: [],
                annotations: [],
                margin: { t: 40, b: 20, l: 60, r: 20 }


            };

            const config = {
                displayModeBar: true,
                modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d'],
                displaylogo: false,
                doubleClick: false
            };


            Plotly.newPlot(plotRef1.current, [data[0]], layout_plot1, config);
            Plotly.newPlot(plotRef2.current, [data[1]], layout_plot2, config);

            plotRef1.current.on('plotly_click', (eventData) => handlePlotClick(eventData));
            // Add event listener for plotly_click on the second plot
            plotRef2.current.on('plotly_click', (eventData) => handlePlotClick(eventData));

            plotRef1.current.on('plotly_relayout', (eventdata) => syncZoom(eventdata, [plotRef2]));
            plotRef2.current.on('plotly_relayout', (eventdata) => syncZoom(eventdata, [plotRef1]));

        }

        // Cleanup on unmount
        return () => {
            // <!> Temporary fix <!>
            // Removing examples of event listeners for now but keep in mind that they still need to exist to be purged ( page reload / page redirect )
            if (plotRef1.current) {
                Plotly.purge(plotRef1.current);
                Plotly.purge(plotRef2.current);
            }
        };
    }, [data]);


    return (
        <div style={styles.container}>
            <h2>Upload CSV to Create Synced Plots </h2>
            <p style={{ fontWeight: 'bold', color: 'red' }}>
                (please use modified file published on discord or remove the last line in csv file if blank)
            </p>
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

                    <button onClick={() => { setMode('zoom'); }} style={styles.button}>Zoom</button>
                    <button onClick={() => { setMode('pan'); }} style={styles.button}>Pan</button>
                    <br />

                    <button onClick={() => { toggleAddMode(); setMode(false); }} style={styles.button}>Add Period</button>
                    <button onClick={() => { toggleDeleteMode(); setMode(false); }} style={styles.button}>Delete Period</button>
                    <button onClick={() => { toggleEventMode(); setMode(false); }} style={styles.button}>Add Flag</button>
                    <button onClick={() => { resetMode(); setMode(false); }} style={styles.button}>Reset Mode</button>
                    <br />
                    <button onClick={() => { resetEvents(); setMode(false); }} style={styles.button}>Delete All Periods/Flags</button>

                    <span id="modeIndicator" style={styles.modeIndicator}>Mode: {mode}</span>
                    <button onClick={() => { loadFile(); }} style={styles.button}>Load preset periods</button>
                    <button onClick={() => { checkPeriods(); }} style={styles.button}>check period list (console)</button>
                </div>

            )}

            <div style={styles.plotContainer}>
                <div ref={plotRef1} style={styles.plot} />
                <div ref={plotRef2} style={styles.plot} />
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


export default BaseApp;
