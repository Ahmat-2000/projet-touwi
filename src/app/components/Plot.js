// Plot.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';


const Plot = ({ propsData }) => {

    const plotRef = useRef(null);
    const [deletePlot, setDeletePlot] = useState(false);

    useEffect(() => {

        if (propsData && plotRef.current) {

            Plotly.newPlot(
                
                plotRef.current, 
                
                [{
                    x: propsData.timestamp,
                    y: propsData.data,
                    hovertemplate: '<span style="background-color:red">X: %{x:.0f} <br> Y: %{y:.3f}</span> <extra></extra>',
                    hoverlabel: {
                        bgcolor: '#FF6F61', // Background color
                        bordercolor: 'grey',
                        font: {
                            color: 'black',
                            size: 14 // Font size
                        },
                    },
                    hovermode: 'closest'
                },], 
                
                {
                    title: propsData.title,
                    
                    dragmode: propsData.appMode,
                    shapes: propsData.shapes,
                    annotations: propsData.annotations,
                    margin: { t: 40, b: 20, l: 60, r: 20 }
                }, 
                
                {
                    scrollZoom: false,
                    displayModeBar: false,
                    doubleClick: false,
                }
            
            );

        }

        // Add the plot reference to the list of plots
        if (!propsData.plotRefList.includes(plotRef)) {
            propsData.plotRefList.push(plotRef);
        }

        if (propsData.plotRefList.length > 1) {
            
            //Get all current attributes from the first plot in the list and apply them to the new plot
            //Might be bad practice to only get the first plot in the list 
            //and not use the global list of shapes & etc (not in use because they ain't updated correctly)

            //Zoom
            const currentLayout = {
                'xaxis.range': propsData.plotRefList[0].current.layout.xaxis.range,
                'yaxis.range': propsData.plotRefList[0].current.layout.yaxis.range
            };        
            
            const currentDragMode =    propsData.plotRefList[0].current._fullLayout.dragmode;
            const currentShapes =      propsData.plotRefList[0].current.layout.shapes;
            const currentAnnotations = propsData.plotRefList[0].current.layout.annotations;

            
            Plotly.relayout(plotRef.current, {
                ...currentLayout,
                shapes: currentShapes,
                annotations: currentAnnotations,
                dragmode: currentDragMode
            });
            
            

        }

        // Add event listeners for plot interactions
        plotRef.current.on('plotly_click', (eventData) => {
            if (propsData.hasVideo && propsData.videoRef.current) {
                const clickedTime = eventData.points[0].x;
                // Convert timestamp to video time (assuming timestamp is in milliseconds)
                const videoTime = clickedTime / 1000;
                propsData.videoRef.current.currentTime = videoTime;
            }
            // Call the original click handler if it exists
            if (propsData.handlePlotClick) {
                propsData.handlePlotClick(eventData);
            }
        });

        plotRef.current.on('plotly_relayout', (eventData) => propsData.handleRelayout(eventData, propsData.plotRefList));

        if (propsData.hover) { /* plotRef.current.on('plotly_hover', (eventData) =>     propsData.hover(eventData) ); */ }

    }, [propsData]);

    if (deletePlot) {
        return null;
    }

    return (
        <div style={{marginTop: '50px'}}>
            <div ref={plotRef} style={{ width: '100%', height: '500px' }}>
                <button
                    onClick={() => setTestCheck(true)}
                    className="delete-plot-button"
                >
                    ✖
                </button>
                <button onClick={() => console.log(propsData.plotRefList)}>Log Plot List</button>
            </div>
        </div>
    )

};

export default Plot;
