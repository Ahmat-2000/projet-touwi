// Graph.js
"use client"; // Indicates this is a client component

import React, { useState, useRef } from 'react';
import Signal from './Signal';



const Graph = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [signals, setSignals] = useState([]);
    let mode = 'None';
    
    const plotList = useRef([]);

    // Example data sets
    const dataSets = {
        DataSet1: { x: [1, 2, 3, 4], y: [10, 15, 13, 17] },
        DataSet2: { x: [1, 2, 3, 4], y: [16, 5, 11, 9] },
        DataSet3: { x: [1, 2, 3, 4], y: [12, 9, 15, 11] },
    };

    const handleSelectDataSet = (key) => {
        setSignals((prevSignals) => [
            ...prevSignals,
            { data: dataSets[key], title: key }
        ]);
        setShowMenu(false);
    };

    
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

    function handlePlotHover (eventData, Plotly) {
        const xValue = eventData.points[0].x;
        console.log(`Hovering over x: ${xValue}`);
    };



    function syncZoom (eventdata, Plotly, plotRefList) {
        console.log('Syncing zoom');
        console.log(eventdata);
        console.log(plotRefList);
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
       console.log('Syncing zoom done');


    };
    
    


    

    function createPlot(sensor, axis, filename) {
        const data = fetchData(sensor, axis);
        // data = [ [5, 7, 3, 4], [1, 2, 3, 4] ]

        const newPlotRef = React.createRef();
        
        const props = {
            data: data[0],
            title: filename + ' ' + sensor + ' ' + axis,
            timestamp: data[1],
            plotRef: newPlotRef,
            click: handlePlotClick,
            hover: handlePlotHover,
            sync: syncZoom,
            plotRefList: plotList.current,
            selections: [],
            setSelections: [],
            shapes: [],
            annotations: [],
            dragMode: 'zoom',
        };

        console.log(props);
        console.log(props.title);

        const newSignal = <Signal key={props.title} propsData={props} />;


        setSignals((prevSignals) => [...prevSignals, newSignal]);

        
    }





    return (
        <div>
            <button onClick={() => setShowMenu(!showMenu)}>
                {showMenu ? 'Close Menu' : 'Open Menu'}
            </button>

            {showMenu && (
                <div style={{ margin: '10px 0' }}>
                    <h4>Select a Data Set:</h4>
                    <ul>
                        {Object.keys(dataSets).map((key) => (
                            <li 
                                key={key} 
                                onClick={() => handleSelectDataSet(key)} 
                                style={{ cursor: 'pointer', color: 'blue' }}
                            >
                                {key}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <button onClick={() => createPlot('Accelerometer', 'x', 'P11')}>Create Plot</button>
            </div>

            <div>
                <button onClick={() => console.log(plotList.current)}>Print plotList</button>
            </div>

           

            <div>
                {signals.map((signal, index) => (
                    <div key={index} style={{ marginTop: '20px' }}>
                        {signal}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Graph;
