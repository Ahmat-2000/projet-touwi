// Plot.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const Plot = ({ propsData }) => {

    const plotRef = useRef(null);
    const [deletePlot, setDeletePlot] = useState(false);
    const [verticalSync, setVerticalSync] = useState(false);

    // Effect to update data-vertical-sync attribute when verticalSync changes
    useEffect(() => {
        if (plotRef.current) {
            plotRef.current.setAttribute('data-vertical-sync', verticalSync);
        }
    }, [verticalSync]);

    useEffect(() => {
        if (!propsData || !plotRef.current) return;

        // Create the plot
        Plotly.newPlot(
            plotRef.current,
            [{
                x: propsData.timestamp,
                y: propsData.data,
                line: {
                    color: propsData.color,
                    width: 2
                },
                hovertemplate: '<span style="background-color:red">X: %{x:.0f} <br> Y: %{y:.3f}</span> <extra></extra>',
                hoverlabel: {
                    bgcolor: '#FF6F61',
                    bordercolor: 'grey',
                    font: {
                        color: 'black',
                        size: 14
                    },
                },
                hovermode: 'closest',
            }],
            {
                dragmode: propsData.appMode,
                shapes: propsData.shapes,
                annotations: propsData.annotations,
                margin: { t: 20, b: 20, l: 60, r: 20 },
                autosize: true
            },
            {
                scrollZoom: propsData.appMode === 'pan',
                displayModeBar: false,
                doubleClick: false,
                responsive: true,
                showAxisDragHandles: false,
            }
        );

        // Add plot reference to list if not already present
        if (!propsData.plotRefList.includes(plotRef)) {
            propsData.plotRefList.push(plotRef);
            plotRef.current.setAttribute('data-vertical-sync', verticalSync);
        }

        // Sync with other plots if there are any
        if (propsData.plotRefList.length > 1) {
            const firstPlot = propsData.plotRefList[0].current;
            if (firstPlot) {
                const currentLayout = {
                    //'xaxis.autorange': true,
                    //'yaxis.autorange': true,
                    shapes: firstPlot.layout.shapes,
                    annotations: firstPlot.layout.annotations,
                    dragmode: firstPlot._fullLayout.dragmode
                };

                Plotly.relayout(plotRef.current, currentLayout);
            }
        }

        // Add event listeners
        const plotElement = plotRef.current;

        plotElement.on('plotly_click', (eventdata) => {
            const labelText = propsData.customLabel || "debugPlot";
            const labelTextColor = propsData.labelColor || "black";

            propsData.handlePlotClick(eventdata, labelText, labelTextColor);
            
        });
        plotElement.on('plotly_relayout', (eventdata) => {
            propsData.handleRelayout(eventdata, propsData.plotRefList, plotRef);
        });

        if (propsData.hover) { /* plotElement.on('plotly_hover', (eventData) =>     propsData.hover(eventData) ); */ }

        // Cleanup function
        return () => {
            if (plotElement) {
                plotElement.removeAllListeners('plotly_click');
                plotElement.removeAllListeners('plotly_relayout');
                Plotly.purge(plotElement);
            }
            const index = propsData.plotRefList.indexOf(plotRef);
            if (index > -1) {
                propsData.plotRefList.splice(index, 1);
            }
        };
    }, [propsData]);

    if (!deletePlot) {

        return (
            <div className="Plot-container" style={{
                height: '25vh',
                width: '100%',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    left: '20px',
                    right: '0px',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Title and Lock Y-axis group */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        {/* Title */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: `2px solid ${propsData.color}`
                        }}>
                            {propsData.title}
                        </div>

                        {/* Lock Y-axis Button */}
                        <button
                            onClick={() => setVerticalSync(!verticalSync)}
                            style={{
                                background: verticalSync ? propsData.color : 'rgba(255, 255, 255, 0.95)',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                border: `2px solid ${propsData.color}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                color: verticalSync ? 'white' : 'black',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <i className={`fas fa-lock${verticalSync ? '' : '-open'}`}></i>
                            Lock Y-axis
                        </button>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => setDeletePlot(true)}
                        style={{
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
                </div>

                <div ref={plotRef} style={{ width: '100%', height: '100%' }} />
            </div>
        );
    }
    else {

        propsData.plotRefList.forEach((plotRef) => {
            if (plotRef.current === null) {
                console.log('Removing deleted plot from list | code °11 ');
                propsData.plotRefList = propsData.plotRefList.filter(ref => ref !== plotRef);
            }
        });

        if (propsData.plotRefList.length <= 1) {
            alert("Cannot delete the last plot. At least one plot must remain.");
            setDeletePlot(false);
        }
    }

};

export default Plot;