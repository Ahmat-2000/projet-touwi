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
            });

            if (!propsData.plotRefList.includes(plotRef.current)) {
                propsData.plotRefList.push(plotRef.current);
            }

            // Bind event handlers if they are provided in propsData
            if (propsData.click) {
                /*
                plotRef.current.on('plotly_click', (eventData) =>
                    propsData.click(eventData, Plotly)
                );
                */
               plotRef.current.on('plotly_click', (eventData) =>
                    test(eventData, Plotly)
                );

            }
            if (propsData.hover) {
                /*
                plotRef.current.on('plotly_hover', (eventData) =>
                    propsData.hover(eventData, Plotly)
                );
                */
            }
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
