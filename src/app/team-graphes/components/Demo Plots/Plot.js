// Signal.js
import React, { useEffect, useRef } from 'react';

const Signal = ({ propsData, appMode, setAppMode }) => {

    const plotRef = useRef(null);

    function changeAppModeDeBZ() {
        console.log('changeAppModeDeBZ');
        appMode = 'period';
        setAppMode('period');

    }

    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js');

        if (propsData && plotRef.current) {
            Plotly.newPlot(plotRef.current, [
                {
                    x: propsData.timestamp,
                    y: propsData.data,
                },
            ], {
                title: propsData.title,
                

                shapes: propsData.shapes || [],  // Apply existing shapes
                annotations: propsData.annotations || [],  // Apply existing annotations
                margin: { t: 40, b: 20, l: 60, r: 20 }
            }, {
                displayModeBar: true,
                modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d'],
                displaylogo: false,
                doubleClick: false
            });

        }
        
        // Add the plot reference to the list of plots
        if (!propsData.plotRefList.includes(plotRef.current)) {
            propsData.plotRefList.push(plotRef.current);
        }

        //plotRef.current.on('plotly_click', propsData.handlePlotClick);
        //plotRef.current.on('plotly_relayout', propsData.handleRelayout);

        // Add event listener hover
        if (propsData.hover) {
            /*
            plotRef.current.on('plotly_hover', (eventData) =>
                propsData.hover(eventData, Plotly)
            );
            */
        }

    }, [propsData]);


    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

        // Remove any previous event listeners before adding new ones
        const currentPlot = propsData.plotRef.current;

        // Add event listeners for plot interactions
        plotRef.current.on('plotly_click',    propsData.handlePlotClick);
        plotRef.current.on('plotly_relayout', propsData.handleRelayout);

    }, [propsData.appMode, propsData.handlePlotClick, propsData.handleRelayout]);
    

    return <div>
        <div ref={plotRef} style={{ width: '100%', height: '400px' }} />;
        <button onClick={changeAppModeDeBZ}>Change App Mode</button>
    </div>

};

export default Signal;
