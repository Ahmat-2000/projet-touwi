// Signal.js
import React, { useEffect, useRef } from 'react';

const Signal = ({ propsData }) => {

    const plotRef = useRef(null);

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
                
                dragmode: propsData.appMode,
                shapes: propsData.shapes,
                annotations: propsData.annotations,
                margin: { t: 40, b: 20, l: 60, r: 20 }
            }, {
                displayModeBar: true,
                modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d'],
                displaylogo: false,
                doubleClick: false,
                scrollZoom: false,
            });

        }

        // Add the plot reference to the list of plots
        if (!propsData.plotRefList.includes(plotRef.current)) {
            propsData.plotRefList.push(plotRef.current);
        }

        if (propsData.plotRefList.length > 1) {
            
            //Get all current attributes from the first plot in the list and apply them to the new plot
            //Might be bad practice to only get the first plot in the list 
            //and not use the global list of shapes & etc (not in use because they ain't updated correctly)

            //Zoom
            const currentLayout = {
                'xaxis.range': propsData.plotRefList[0].layout.xaxis.range,
                'yaxis.range': propsData.plotRefList[0].layout.yaxis.range
            };
            
            
            const currentDragMode = propsData.plotRefList[0]._fullLayout.dragmode;
            const currentShapes = propsData.plotRefList[0].layout.shapes;
            const currentAnnotations = propsData.plotRefList[0].layout.annotations;

            Plotly.relayout(plotRef.current, currentLayout);
            Plotly.relayout(plotRef.current, { shapes: currentShapes, annotations: currentAnnotations });
            Plotly.relayout(plotRef.current, { dragmode: currentDragMode });

        }

        // Add event listeners for plot interactions
        plotRef.current.on('plotly_click',    propsData.handlePlotClick);
        plotRef.current.on('plotly_relayout', propsData.handleRelayout);

        if (propsData.hover) { /* plotRef.current.on('plotly_hover', (eventData) =>     propsData.hover(eventData, Plotly) ); */ }

    }, [propsData]);
    

    return <div>
        <div ref={plotRef} style={{ width: '100%', height: '400px' }} />;
    </div>

};

export default Signal;
