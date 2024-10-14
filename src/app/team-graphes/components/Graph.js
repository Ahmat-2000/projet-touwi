import React, { useState} from 'react';
import Plot from './Plot'; // Import the Plot component

const Graph = ({ data, plotRef1, plotRef2, plotRef3, mode, selections, setSelections }) => {

    const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

    const [shapes, setShapes] = useState([]);  // To store shapes (periods)
    const [annotations, setAnnotations] = useState([]);  // To store annotations (flags)

    // Function to handle plot clicks
    const handlePlotClick = (eventData, Plotly) => {
        const xValue = eventData.points[0].x;
        console.log(`Clicked at x: ${xValue}`);
        console.log(`Current mode: ${mode}`);

        // Handle the different modes
        if (mode === 'delete') {
            deleteRegion(Plotly, [plotRef1.current.layout, plotRef2.current.layout, plotRef3.current.layout], xValue);
        } else {
            if (mode === 'period') {

                console.log(`Select region Start`);

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

    // Function to highlight the region in the plot
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

        setShapes([...shapes, shape]); // Save shapes globally

        console.log('Before relayout:', plotRef1.current.layout.shapes);

        Plotly.relayout(plotRef1.current, { shapes: [...plotRef1.current.layout.shapes, shape] });
        Plotly.relayout(plotRef2.current, { shapes: [...plotRef2.current.layout.shapes, shape] });
        Plotly.relayout(plotRef3.current, { shapes: [...plotRef3.current.layout.shapes, shape] });

        console.log('After relayout:', plotRef1.current.layout.shapes);

    }

    // Function to highlight a flag in the plot
    const highlightFlag = (Plotly, xValue) => {
        const shape = {
            type: 'line',
            x0: xValue,
            x1: xValue,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: { width: 1, color: 'blue', dash: 'dashdot' },
        };
        const annotation = {
            x: xValue + 4000,
            y: 1,
            xref: 'x',
            yref: 'paper',
            text: 'Default Text',
            showarrow: false,
            font: { size: 12, color: 'black' },
            bordercolor: 'grey',
            borderwidth: 2,
            borderpad: 4,
            align: 'left',
            valign: 'middle',
        };

        setShapes([...shapes, shape]); // Save shapes globally
        setAnnotations([...annotations, annotation]); // Save annotations globally

        Plotly.relayout(plotRef1.current, { shapes: [...plotRef1.current.layout.shapes, shape], annotations: [...plotRef1.current.layout.annotations, annotation] });
        Plotly.relayout(plotRef2.current, { shapes: [...plotRef2.current.layout.shapes, shape], annotations: [...plotRef2.current.layout.annotations, annotation] });
        Plotly.relayout(plotRef3.current, { shapes: [...plotRef3.current.layout.shapes, shape], annotations: [...plotRef3.current.layout.annotations, annotation] });
    };

    // Function to delete a region in the plot
    const deleteRegion = (Plotly, ly_plots, xValue) => {
        // Find the region that contains the clicked xValue from the state shapes
        const regionIndex = shapes.findIndex(shape => shape.x0 <= xValue && shape.x1 >= xValue);

        if (regionIndex !== -1) {
            // Remove the region from the shapes array immutably
            const updatedShapes = shapes.filter((_, i) => i !== regionIndex);

            // Update the plot layouts with the updated shapes
            Plotly.relayout(plotRef1.current, { shapes: updatedShapes });
            Plotly.relayout(plotRef2.current, { shapes: updatedShapes });
            Plotly.relayout(plotRef3.current, { shapes: updatedShapes });

            // Update the state with the updated shapes
            setShapes(updatedShapes);

            // Update the selections state if needed
            const updatedSelections = selections.filter((_, i) => i !== regionIndex);
            setSelections(updatedSelections);

            console.log(`Region removed at x: ${xValue}`);
        }
    };

    /*
    // Function to delete a region or flag in the plot
    const deleteRegion = (Plotly, ly_plots, xValue) => {
        // Find the shape (either flag or period) that contains the clicked xValue from the shapes state
        const regionIndex = shapes.findIndex(shape => {
            if (shape.type === 'rect') {
                // This is a period (rect), check if xValue is within the rectangle
                return shape.x0 <= xValue && shape.x1 >= xValue;
            } else if (shape.type === 'line') {
                // This is a flag (line), check if xValue matches the line's position
                return shape.x0 === xValue && shape.x1 === xValue;
            }
            return false;
        });

        if (regionIndex !== -1) {
            // Remove the shape (flag or period) from the shapes array immutably
            const updatedShapes = shapes.filter((_, i) => i !== regionIndex);

            // Update the plot layouts with the updated shapes
            Plotly.relayout(plotRef1.current, { shapes: updatedShapes });
            Plotly.relayout(plotRef2.current, { shapes: updatedShapes });
            Plotly.relayout(plotRef3.current, { shapes: updatedShapes });

            // Update the state with the updated shapes
            setShapes(updatedShapes);

            // If the deleted shape is a period (rect), also update the selections
            if (shapes[regionIndex].type === 'rect') {
                const updatedSelections = selections.filter((_, i) => i !== regionIndex);
                setSelections(updatedSelections);
            }

            console.log(`Shape (flag or period) removed at x: ${xValue}`);
        }
    };*/


    // Function to sync zoom between plots
    const syncZoom = (eventData, Plotly, [toChange1, toChange2]) => {
        console.log("Sync fired")
        const layoutUpdate = {
            'xaxis.range': [eventData['xaxis.range[0]'], eventData['xaxis.range[1]']],
            'yaxis.range': [eventData['yaxis.range[0]'], eventData['yaxis.range[1]']]
        };
        if (eventData['xaxis.range[0]'] !== undefined) {
            Plotly.relayout(toChange1.current, layoutUpdate);
            Plotly.relayout(toChange2.current, layoutUpdate);
        }
    };

    return (
        <div style={styles.plotContainer}>
            <Plot
                data={data[0]}
                plotRef={plotRef1}
                handlePlotClick={(eventData) => handlePlotClick(eventData, Plotly)}
                handleRelayout={(eventData) => syncZoom(eventData, Plotly, [plotRef2, plotRef3])}
                selections = {selections}
                setSelections = {setSelections}
                shapes={shapes}
                annotations={annotations}
            />
            <Plot
                data={data[1]}
                plotRef={plotRef2}
                handlePlotClick={(eventData) => handlePlotClick(eventData, Plotly)}
                handleRelayout={(eventData) => syncZoom(eventData, Plotly, [plotRef1, plotRef3])}
                selections = {selections}
                setSelections = {setSelections}
                shapes={shapes}
                annotations={annotations}
            />
            <Plot
                data={data[2]}
                plotRef={plotRef3}
                handlePlotClick={(eventData) => handlePlotClick(eventData, Plotly)}
                handleRelayout={(eventData) => syncZoom(eventData, Plotly, [plotRef1, plotRef2])}
                selections = {selections}
                setSelections = {setSelections}
                shapes={shapes}
                annotations={annotations}
            />
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
