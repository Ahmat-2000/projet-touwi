"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useVariablesContext } from "@/utils/VariablesContext";
import { parseCSV } from '@/services/ParserService';

const Edit = () => {
    const { variablesContext } = useVariablesContext();

    const [data, setData] = useState([]); // Array to store data for the plots
    const [error, setError] = useState(''); // Error message for CSV parsing
    let mode = 'None'; // Default mode
    const [selections, setSelections] = useState([]); // Array to store selected regions

    const plotRef1 = useRef(null);
    const plotRef2 = useRef(null);
    const plotRef3 = useRef(null);

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
        const Plotly = require('plotly.js/dist/plotly.js');
        console.log(`Mode set to: ${newDragMode}`);

        Plotly.relayout(plotRef1.current, { dragmode: newDragMode });
        Plotly.relayout(plotRef2.current, { dragmode: newDragMode });
        Plotly.relayout(plotRef3.current, { dragmode: newDragMode });
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
        const Plotly = require('plotly.js/dist/plotly.js');

        Plotly.relayout(plotRef1.current, { shapes: [], annotations: [] });
        Plotly.relayout(plotRef2.current, { shapes: [], annotations: [] });
        Plotly.relayout(plotRef3.current, { shapes: [], annotations: [] });
        //setSelections([]);
        //resetMode();
    }

    function voidPlots() {
        const Plotly = require('plotly.js/dist/plotly.js');
        Plotly.purge(plotRef1.current);
        Plotly.purge(plotRef2.current);
        Plotly.purge(plotRef3.current);
        setData([]);
        setSelections([]);
        setError('');
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

    function highlightFlag(Plotly, xValue) {

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
        Plotly.relayout(plotRef3.current, { shapes: [...plotRef3.current.layout.shapes, shape], annotations: [...plotRef3.current.layout.annotations, annotation] });
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
            Plotly.relayout(plotRef1.current, { shapes: layout_plot1.shapes, annotations: layout_plot1.annotations });
            Plotly.relayout(plotRef2.current, { shapes: layout_plot2.shapes, annotations: layout_plot2.annotations });
            Plotly.relayout(plotRef3.current, { shapes: layout_plot3.shapes, annotations: layout_plot3.annotations });

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
            if (mode === 'period') {
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

            if (mode === 'flag') {
                console.log(`Flag added at x: ${xValue}`);
                highlightFlag(Plotly, xValue);
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

    useEffect(() => { // Exécuté une fois
        console.log('Variables context:', variablesContext);
        if (variablesContext && 'accel' in variablesContext) {
            const file = variablesContext.accel;
            if (file) {
                console.log('File loaded:', file);
                parseCSV(file, setData, setError);
            }
        }
    }, []);

    useEffect(() => { // Executé quand data change
        const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

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

            const layout_plot3 = {
                xaxis: { title: 'Timestamp' },
                yaxis: { title: 'Signal Z' },
                shapes: [],
                annotations: [],
                margin: { t: 40, b: 40, l: 60, r: 20 }
            };

            const config = {
                displayModeBar: true,
                modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d' ],
                displaylogo: false,
                doubleClick: false
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
            {/* Conditionally render buttons only when data is loaded */}
            {data.length > 0 && (
                <div id="controls" style={styles.controls}>
                    
                    <button onClick={() => { setMode('zoom'); }} style={styles.button}>Zoom</button>
                    <button onClick={() => { setMode('pan'); }} style={styles.button}>Pan</button>
                    <br />

                    <button onClick={() => { toggleAddMode(); setMode(false);}} style={styles.button}>Add Period</button>
                    <button onClick={() => { toggleDeleteMode(); setMode(false) ; }} style={styles.button}>Delete Period</button>
                    <button onClick={() => { toggleEventMode(); setMode(false) ; }} style={styles.button}>Add Flag</button>
                    <button onClick={() => { resetMode(); setMode(false); }} style={styles.button}>Reset Mode</button>
                    <br />
                    <button onClick={() => { resetEvents(); setMode(false) ; }} style={styles.button}>Delete All Periods/Flags</button>
                    
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


export default Edit;
