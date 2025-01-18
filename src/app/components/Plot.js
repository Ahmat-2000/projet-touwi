// Plot.js
"use client";

import React, { useEffect, useRef, useState } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const Plot = ({ propsData }) => {

    const [deletePlot, setDeletePlot] = useState(false);    //Button boolean to delete plot
    const [verticalSync, setVerticalSync] = useState(true); //Vertical sync boolean
    const plotRef = useRef(null);                            //UseRef for plot element
    
    useEffect(() => {                                        //Update vertical sync attribute when verticalSync changes
        if (plotRef.current) {
            plotRef.current.setAttribute('data-vertical-sync', verticalSync);
        }
    }, [verticalSync]);

    useEffect(() => {                                        //When deleting itself, remove the dom div from the parent
        if (deletePlot) {
            propsData.clearDiv(propsData.keyID);
        }
    }, [deletePlot]);

    useEffect(() => {                                        //Create the plot
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
                plot_bgcolor: 'rgba(255, 255, 255, 0)',
                paper_bgcolor: 'rgba(255, 255, 255, 0)',
                dragmode: propsData.dragModeRef.current,
                shapes: propsData.shapes,
                annotations: propsData.annotations,
                margin: { t: 20, b: 20, l: 60, r: 20 },
                autosize: true,
                xaxis: propsData.xaxisRange ? { range: propsData.xaxisRange } : {},
            },
            {
                scrollZoom: propsData.dragModeRef.current === 'pan',
                displayModeBar: false,
                doubleClick: false,
                responsive: true,
                showAxisDragHandles: false,
            }
        );

        plotRef.current.setAttribute('data-custom-label', propsData.customLabel);
        plotRef.current.setAttribute('data-label-color', propsData.labelColor);
        plotRef.current.setAttribute('data-vertical-sync', verticalSync);

        propsData.plotRefList.push(plotRef);

        // Sync with other plots if there are any
        if (propsData.plotRefList.length > 1) {
            const referencePlot = propsData.plotRefList[0].current;
            if (referencePlot.layout) {

                const currentLayout = {
                    'xaxis.range': referencePlot.layout.xaxis.range,
                    shapes: referencePlot.layout.shapes,
                    annotations: referencePlot.layout.annotations,
                    dragmode: referencePlot._fullLayout.dragmode,
                    plot_bgcolor: referencePlot._fullLayout.plot_bgcolor,
                    paper_bgcolor: referencePlot._fullLayout.paper_bgcolor,
                };

                Plotly.relayout(plotRef.current, currentLayout);
            }
        }

        // Add event listeners
        const plotElement = plotRef.current;

        plotElement.on('plotly_click', (eventdata) => {
            propsData.handlePlotClick(eventdata);
        });

        plotElement.on('plotly_relayout', (eventdata) => {
            propsData.handleRelayout(eventdata, propsData.plotRefList, plotRef);
        });

        if (propsData.hover) { /* plotElement.on('plotly_hover', (eventData) =>     propsData.hover(eventData) ); */ }

        plotElement.on('plotly_clickannotation', (eventData) => {

            if (propsData.appModeRef.current === 'delete') {
                const modifiedList = { current: propsData.plotRefList };
                propsData.deleteRegion(modifiedList, eventData.annotation.x, false);
            }
        });

        // Cleanup function
        return () => {
            if (plotElement) {
                plotElement.removeAllListeners('plotly_click');
                plotElement.removeAllListeners('plotly_relayout');
                plotElement.removeAllListeners('plotly_clickannotation');
                Plotly.purge(plotElement);
            }
            const index = propsData.plotRefList.indexOf(plotRef);
            if (index > -1) {
                propsData.plotRefList.splice(index, 1);
            }
        };
    }, []);

    if (!deletePlot) {

        return (
            <div className="h-[22vh] w-full relative">
                <div className="absolute left-5 right-0 z-10 flex items-center justify-between">
                    {/* Title and Lock Y-axis group */}
                    <div className="flex items-center gap-2.5">
                        {/* Title */}
                        <div className={`bg-white/95 px-2.5 py-1.5 rounded-md text-sm font-bold shadow-sm border-2 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
                             style={{ borderColor: propsData.color }}>
                            {propsData.title}
                        </div>

                        {/* Lock Y-axis Button */}
                        <button
                            onClick={() => setVerticalSync(!verticalSync)}
                            className={`px-2.5 py-1.5 rounded-md text-sm font-bold shadow-sm border-2 flex items-center gap-1.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5
                                      ${verticalSync ? 'text-white' : 'bg-white/95 text-black'}`}
                            style={{ 
                                backgroundColor: verticalSync ? propsData.color : 'rgba(255, 255, 255, 0.95)',
                                borderColor: propsData.color 
                            }}>
                            <i className={`fas fa-lock${verticalSync ? '' : '-open'}`}></i>
                            Lock Y-axis
                        </button>

                        {/* Home Button */}
                        <button
                            onClick={() => Plotly.relayout(plotRef.current, {
                                'xaxis.autorange': true,
                                'yaxis.autorange': true
                            })}
                            className={`bg-white/95 px-2.5 py-1.5 rounded-md text-sm font-bold shadow-sm border-2 flex items-center gap-1.5 text-black cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
                            style={{ borderColor: propsData.color }}>
                            <i className="fas fa-home"></i>
                        </button>
                    </div>

                    {/* Delete Button */}
                    <button
                        onClick={() => setDeletePlot(true)}
                        className="bg-[#ff4444] hover:bg-[#cc0000] text-white rounded-lg w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200 cursor-pointer border-0"
                    >
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>

                <div ref={plotRef} className="w-full h-full" />
            </div>
        );
    }
    else {

        if (propsData.plotRefList.length <= 1) {
            alert("Cannot delete the last plot. At least one plot must remain.");
            setDeletePlot(false);
        }
    }

};

export default Plot;