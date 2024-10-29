// Graph.js

import React, { useState, useRef, useEffect } from 'react';
import Plot from './Plot';



const Graph = ({ temporaryData, plotList, appMode, setAppMode }) => {
    const [plots, setPlots] = useState([]);
    const [selections, setSelections] = useState([]);

    const appModeRef = useRef(appMode);
    let test = 5;

    useEffect(() => {
        appModeRef.current = appMode;
    }, [appMode]);


    useEffect(() => {
        if (test === 5) {
            test = 6;
            console.log('USE EFFECT CALLED');
            createPlot('Accelerometer', 'x', 'P11', temporaryData[0]['y']);
        }
    }, []); // Empty dependency array to ensure it runs only once


    
    function fetchData(sensor, axis) {
        
        const data = readAndGetColumFromCSV(sensor, axis);
        const timestamp = readAndGetColumFromCSV('timestamp');

        return [timestamp, data];
    }

    function readAndGetColumFromCSV(sensor, axis) {
        
        const simulatedData = {
            Accelerometer: {
                x: Array.from({ length: 1000 }, () => Math.random() * 100),
                y: Array.from({ length: 1000 }, () => Math.random() * 100),
                z: Array.from({ length: 1000 }, () => Math.random() * 100)
            },
            Gyroscope: {
                x: Array.from({ length: 1000}, () => Math.random() * 100),    
                y: Array.from({ length: 1000}, () => Math.random() * 100),
                z: Array.from({ length: 1000}, () => Math.random() * 100)
            },
            timestamp: Array.from({ length: 1000 }, (_, i) => i)
        };

        // Case we want Timestamps
        if (typeof axis === 'undefined') {
            return simulatedData[sensor];
        }

        // Case we want a specific axis
        return simulatedData[sensor][axis];
    }

    function handlePlotClick (eventData, Plotly) {
        const xValue = eventData.points[0].x;

        const currentAppMode = appModeRef.current;

        console.log(`Clicked at x: ${xValue}`);
        console.log(`App mode: ${currentAppMode}`);

        // Handle the different modes
        if ( currentAppMode === 'delete') {
            deleteRegion(Plotly, plotList, xValue);
        } else {
            if (currentAppMode === 'period') {
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

            if (currentAppMode === 'flag') {
                console.log(`Flag added at x: ${xValue}`);
                highlightFlag(Plotly, xValue);
            }


        }
    };

    function highlightRegion(Plotly, start, end) {
        console.log('Highlighting region');
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

        plotList.current.forEach(plotRef => {
            Plotly.relayout(plotRef, { shapes: [...plotRef.layout.shapes, shape] });
        });
        
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
            x: xValue, //+ 3000,
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

        plotList.current.forEach(plotRef =>{
            Plotly.relayout(plotRef, { shapes: [...plotRef.layout.shapes, shape], annotations: [...plotRef.layout.annotations, annotation] });
        });
    }


    function deleteRegion(Plotly, plotList, xValue) {


        // Find the region that contains the clicked xValue
        let regionIndex = plotList.current[0].layout.shapes.findIndex(shape => shape.x0 <= xValue && shape.x1 >= xValue);
        if (regionIndex !== -1) {
            // Remove the region from both layout.shapes and selections
            plotList.current.forEach(plotRef => {
                plotRef.layout.shapes.splice(regionIndex, 1);
            });

            //layout_plot1.shapes.splice(regionIndex, 1);
            //layout_plot2.shapes.splice(regionIndex, 1);
            //layout_plot3.shapes.splice(regionIndex, 1);

            selections.splice(regionIndex, 1);

            // Update the shapes on the plots
            plotList.current.forEach(plotRef => {
                Plotly.relayout(plotRef, { shapes: plotRef.layout.shapes, annotations: plotRef.layout.annotations });
            });

            console.log(`Region removed at x: ${xValue}`);
        }
    }

    function handlePlotHover (eventData, Plotly) {
        const xValue = eventData.points[0].x;
        console.log(`Hovering over x: ${xValue}`);
    };



    function syncZoom (eventdata, Plotly, plotRefList) {
        console.log("Sync fired")

        //get the x and y range of the plot
        const layoutUpdate = {
            'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
            'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']]
        };

        //update the x and y range of the other plots
        if (eventdata['xaxis.range[0]'] !== undefined) {
            
            plotRefList.forEach((plotRef) => {
                Plotly.relayout(plotRef, layoutUpdate);
            });
            
           //Plotly.relayout( plotRefList[0].current, layoutUpdate);
           //Plotly.relayout( plotRefList[1].current, layoutUpdate);
        }

        /*
        if (eventdata['xaxis.range[0]'] && eventdata['xaxis.range[1]']) {
            Plotly.relayout(toChange1.current, layoutUpdate);
            Plotly.relayout(toChange2.current, layoutUpdate);
        }
        */

    };
    

    function createPlot(sensor, axis, filename, data) {

        if (data === undefined) {
            console.log('data is undefined');
            const tmp = fetchData(sensor, axis);
            data = tmp[1];


            // data = [ [5, 7, 3, 4], [1, 2, 3, 4] ]
        }

        console.log('Data:', data);
        console.log('Timestamp:', Array.from({ length: data.length }, (_, i) => i), 'Length:', data.length);


        const Plotly = require('plotly.js/dist/plotly.js');

        const newPlotRef = React.createRef();
        
        const props = {
            data: data,
            title: filename + ' ' + sensor + ' ' + axis,
            timestamp: Array.from({ length: data.length }, (_, i) => i),
            plotRef: newPlotRef,
            handlePlotClick: (eventData) => handlePlotClick(eventData, Plotly),
            hover: handlePlotHover,
            handleRelayout: (eventData) => syncZoom(eventData, Plotly, plotList.current),
            plotRefList: plotList.current,
            selections: selections,
            setSelections: setSelections,
            shapes: [],
            annotations: [],
            appMode: appMode,
        };

        const newPlot = <Plot key={props.title} propsData={props} setAppMode={setAppMode} />;


        setPlots((prevPlots) => [...prevPlots, newPlot]);

        
    }


    return (

        <div>

            <div>
                <button onClick={() => createPlot('Accelerometer', 'x', 'P11')}>Create Plot</button>
            </div>

            <div>
                <button onClick={() => console.log(plotList.current)}>Print plotList</button>
            </div>


            <div>
                {plots.map((plot, index) => (
                    <div key={index} style={{ marginTop: '20px' }}>
                        {plot}
                    </div>
                ))}
            </div>
        

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
