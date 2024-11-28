// CropPlot.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const CropPlot = ({ propsData }) => {

    const plotRef = useRef(null);

    useEffect(() => {
        if (!propsData || !plotRef.current) return;

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
                dragmode: propsData.dragModeRef.current,
                shapes: propsData.shapes,
                annotations: propsData.annotations,
                margin: { t: 20, b: 20, l: 60, r: 20 },
                autosize: true,
            },
            {
                scrollZoom: propsData.dragModeRef.current === 'pan',
                displayModeBar: false,
                doubleClick: false,
                responsive: true,
            }
        );

        propsData.plotRef.current = plotRef.current;
        const plotElement = plotRef.current;

        // Cleanup function
        return () => {
            if (plotElement) {
                plotElement.removeAllListeners('plotly_click');
                plotElement.removeAllListeners('plotly_relayout');
                Plotly.purge(plotElement);
            }
        };
    }, []);


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

                    {/* Home Button */}
                    <button
                        onClick={() => { 
                            Plotly.relayout(
                                plotRef.current, {
                            'xaxis.autorange': true,
                            'yaxis.autorange': true
                        }) }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: `2px solid ${propsData.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'black',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <i className="fas fa-home"></i>

                    </button>
                </div>
            </div>

            <div ref={plotRef} style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

export default CropPlot;