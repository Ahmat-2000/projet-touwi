// CropPlot.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const CropPlot = ({ propsData }) => {

    const plotRef = useRef(null);

    useEffect(() => {
        propsData.plotRef.current = plotRef.current;
    }, [propsData.plotRef]);

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
                plot_bgcolor: 'rgba(255, 255, 255, 0)',
                paper_bgcolor: 'rgba(255, 255, 255, 0)',
                autosize: true,
            },
            {
                scrollZoom: propsData.dragModeRef.current === 'pan',
                displayModeBar: false,
                doubleClick: false,
                responsive: true,
            }
        );

        const plotElement = plotRef.current;

        // Add click event handler
        plotElement.on('plotly_click', (eventData) => {
            const xValue = eventData.points[0].x;
            const currentAppMode = propsData.appModeRef.current;

            if (currentAppMode === 'signal_start') {

                if (propsData.signalCropPointsRef.current?.start !== undefined) {
                    alert("Signal Start already defined please delete previous flag before creating a new one");
                    return;
                }

                const newPoints = {start: xValue, end: propsData.signalCropPointsRef.current?.end || undefined};
                propsData.signalCropPointsRef.current = newPoints;
                propsData.setSignalCropPoints(newPoints);
                const style = {
                    color: 'blue',
                    width: 3,
                    dash: 'solid'
                }
                displayFlag(xValue, style, 'Start');
            } 
            else if (currentAppMode === 'signal_end') {

                if (propsData.signalCropPointsRef.current?.end !== undefined) {
                    alert("Signal End already defined please delete previous flag before creating a new one");
                    return;
                }

                const newPoints = {start: propsData.signalCropPointsRef.current?.start || undefined, end: xValue};
                propsData.signalCropPointsRef.current = newPoints;
                propsData.setSignalCropPoints(newPoints);
                const style = {
                    color: 'red',
                    width: 3,
                    dash: 'solid'
                }
                displayFlag(xValue, style, 'End');
            }
        });

        // Add annotation click handler
        plotElement.on('plotly_clickannotation', (eventData) => {
            if (propsData.appModeRef.current === 'delete') {
                deleteFlag(plotElement, eventData.annotation.x);
            }
        });

        propsData.plotRef.current = plotRef.current;

        // Cleanup function
        return () => {
            if (plotElement) {
                plotElement.removeAllListeners('plotly_click');
                plotElement.removeAllListeners('plotly_clickannotation');
                plotElement.removeAllListeners('plotly_relayout');
                Plotly.purge(plotElement);
            }
        };
    }, []);

    function displayFlag(point, style, text) {

        const shape = {
            type: 'line',
            x0: point,
            x1: point,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: style,
        };

        const annotation = {
            x: point,
            y: 1,
            xref: 'x',
            yref: 'paper',
            text: text,
            showarrow: false,
            font: {
                size: 12,
                color: 'white'
            },
            bgcolor: style.color,
            bordercolor: 'rgba(0,0,0,0.2)',
            borderwidth: 1,
            borderpad: 4,
            align: 'center',
            valign: 'middle',
            hoverlabel: {
                bgcolor: style.color,
                font: { color: 'white' }
            },
            clicktoshow: false,
            hovertext: 'Flag at ' + point,
            opacity: 1,
            padding: 8,
            borderpad: 4,
            align: 'left',
            valign: 'middle',
        };

        Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape], annotations: [...plotRef.current.layout.annotations, annotation] });

    }

    function deleteFlag(plotRef, xValue) {
        // Filter out shapes and annotations at the clicked x-value
        const shapes = plotRef.layout.shapes.filter(shape => 
            Math.abs(shape.x0 - xValue) > 0.1
        );
        
        const annotations = plotRef.layout.annotations.filter(annotation => 
            Math.abs(annotation.x - xValue) > 0.1
        );

        // Update the plot with the filtered shapes and annotations
        Plotly.relayout(plotRef, {
            shapes: shapes,
            annotations: annotations
        });

        // Clear corresponding crop point if it exists
        const currentPoints = propsData.signalCropPointsRef.current;

        if (currentPoints) {
            if (Math.abs(currentPoints.start - xValue) <= 0.1) {
                const newPoints = { start: undefined, end: currentPoints.end };
                propsData.signalCropPointsRef.current = newPoints;
                propsData.setSignalCropPoints(newPoints);
            } else if (Math.abs(currentPoints.end - xValue) <= 0.1) {
                const newPoints = { start: currentPoints.start, end: undefined };
                propsData.signalCropPointsRef.current = newPoints;
                propsData.setSignalCropPoints(newPoints);
            }
        }
    }


    return (
        <div className="h-[30vh] w-full relative mt-12">
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