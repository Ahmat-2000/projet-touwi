// Signal.js
import React, { useEffect, useRef } from 'react';

const Signal = ({ propsData }) => {
    const plotRef = useRef(null);

    function test(eventData, Plotly) {

        console.log('List of plots:', propsData.plotRefList);

    }

    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js');

        if (propsData && plotRef.current) {
            Plotly.newPlot(plotRef.current, [
                {
                    x: propsData.data,
                    y: propsData.timestamp,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'blue' },
                },
            ], {
                title: propsData.title,
                dragmode: propsData.dragMode,

                shapes: propsData.shapes || [],  // Apply existing shapes
                annotations: propsData.annotations || [],  // Apply existing annotations
                margin: { t: 40, b: 20, l: 60, r: 20 }
            }, {
                displayModeBar: true,
                modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d'],
                displaylogo: false,
                doubleClick: false
            });

            // Add the plot reference to the list of plots
            if (!propsData.plotRefList.includes(plotRef.current)) {
                propsData.plotRefList.push(plotRef.current);
            }

            // Add event listener click
            if (propsData.click) {
                plotRef.current.on('plotly_click', (eventData) =>
                    propsData.click(eventData, Plotly)
                );
            }

            // Add event listener hover
            if (propsData.hover) {
                /*
                plotRef.current.on('plotly_hover', (eventData) =>
                    propsData.hover(eventData, Plotly)
                );
                */
            }

            // Add event listener relayout
            if (propsData.sync) {
                plotRef.current.on('plotly_relayout', (eventData) =>
                    propsData.sync(eventData, Plotly, propsData.plotRefList)
                );
            }
        }
    }, [propsData]); // Re-run the effect if propsData changes

    return <div ref={plotRef} style={{ width: '100%', height: '400px' }} />;
};

export default Signal;
