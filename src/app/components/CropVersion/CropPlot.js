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
        <div className="h-[25vh] w-full relative">
            <div className="absolute left-5 right-0 z-10 flex items-center justify-between">
                {/* Title and Lock Y-axis group */}
                <div className="flex items-center gap-2.5">
                    {/* Title */}
                    <div className="bg-white/95 px-2.5 py-1.5 rounded-md text-sm font-bold shadow-sm border-2 hover:translate-y-[-2px] transition-all hover:shadow-md"
                         style={{ borderColor: propsData.color }}>
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
                        className="bg-white/95 px-2.5 py-1.5 rounded-md text-sm font-bold shadow-sm border-2 flex items-center gap-1.5 text-black cursor-pointer transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md"
                        style={{ borderColor: propsData.color }}>
                        <i className="fas fa-home"></i>
                    </button>
                </div>
            </div>

            <div ref={plotRef} className="w-full h-full" />
        </div>
    );
}

export default CropPlot;