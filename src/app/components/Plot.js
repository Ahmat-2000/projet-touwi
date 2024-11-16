// Plot.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';


const Plot = ({ propsData }) => {

    const plotRef = useRef(null);
    const [deletePlot, setDeletePlot] = useState(false);

    // Define the colors array with a more harmonious palette
    const colors = [
        '#2E86C1',  // Strong Blue
        '#E74C3C',  // Soft Red
        '#27AE60',  // Forest Green
        '#8E44AD'   // Royal Purple
    ];

    // Get the current plot index from the plotRefList length
    const plotIndex = propsData.plotRefList.length;
    // Use modulo to cycle through colors if we have more than 4 plots
    const plotColor = colors[plotIndex % colors.length];

    useEffect(() => {

        if (propsData && plotRef.current) {

            Plotly.newPlot(

                plotRef.current,

                [{
                    x: propsData.timestamp,
                    y: propsData.data,
                    line: {
                        color: plotColor,
                        width: 2
                    },
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
                    dragmode: propsData.appMode,
                    shapes: propsData.shapes,
                    annotations: propsData.annotations,
                    margin: { t: 20, b: 20, l: 60, r: 20 }
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

            if (propsData.plotRefList[0].current === null) {
                console.log('Removing deleted plot from list | code °4 ');
                propsData.plotRefList = propsData.plotRefList.filter(ref => ref !== propsData.plotRefList[0]);
            }

            //Zoom
            const currentLayout = {
                'xaxis.range': propsData.plotRefList[0].current.layout.xaxis.range,
                'yaxis.range': propsData.plotRefList[0].current.layout.yaxis.range
            };

            const currentDragMode = propsData.plotRefList[0].current._fullLayout.dragmode;
            const currentShapes = propsData.plotRefList[0].current.layout.shapes;
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

        // Possible hover event can be added here
        if (propsData.hover) { /* plotRef.current.on('plotly_hover', (eventData) =>     propsData.hover(eventData) ); */ }

    }, [propsData]);


    if (!deletePlot) {

        return (
            <div className="Plot-container" style={{ height: '25vh' }
            }>
                <div style={
                    {
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        zIndex: 1,
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: `2px solid ${plotColor}`
                    }
                }>
                    {propsData.title}
                </div>
                < button
                    onClick={() => setDeletePlot(true)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 1,
                        backgroundColor: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        transition: 'background-color 0.2s',
                        fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
                >
                    ✖
                </button>
                < div ref={plotRef} style={{ width: '100%', height: '100%' }} />
            </div>
        )
    }
    else {

        propsData.plotRefList.forEach((plotRef) => {
            if (plotRef.current === null) {
                //remove plot from plotRefList
                console.log('Removing deleted plot from list | code °5 ');
                propsData.plotRefList = propsData.plotRefList.filter(ref => ref !== plotRef);
            }
        });

        if (propsData.plotRefList.length <= 1) {
            alert("Cannot delete the last plot. At least one plot must remain.");
            setDeletePlot(false);
        }
    }


    /*
    //expected working behaviour :

    if (!deletePlot) {

        return (
            <div style={{ marginTop: '50px' }}>
                <div ref={plotRef} style={{ width: '100%', height: '500px' }}>
                    <button
                        onClick={() => setDeletePlot(true)}
                        className="delete-plot-button"
                    >
                        ✖
                    </button>
                </div>
            </div>
        )
    }
    else {

        if (propsData.plotRefList.length <= 1) {
            alert("Cannot delete the last plot. At least one plot must remain.");
            setDeletePlot(false);
            console.log('PlotRefList length is ' + propsData.plotRefList.length, propsData.plotRefList.current);
        }

        else {
            propsData.plotRefList.forEach((plotRef) => {
            if (plotRef.current === null) {
                //remove plot from plotRefList
                console.log('Removing deleted plot from list | code °5 ');
                propsData.plotRefList = propsData.plotRefList.filter(ref => ref !== plotRef);
            }
            });
    console.log('PlotRefList length is ' + propsData.plotRefList.length, propsData.plotRefList.current);
    return;
    }
            
        }
    */




};

export default Plot;