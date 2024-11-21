// App.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import Plotly from 'plotly.js-basic-dist-min';

import Graph from './Graph';
import ControlPanel from './ControlPanel';
import VideoControls from './VideoControls';
import { useVariablesContext } from '@/utils/VariablesContext';
import { periodUpdate } from '@/team-offline/outils';
import { useRouter } from "next/navigation";

const App = () => {

    const { variablesContext } = useVariablesContext();
    const router = useRouter();

    // State hooks
    const [appMode, setAppMode] = useState('None'); // Mode for app Actions ONLY
    //const [selections, setSelections] = useState([]); // Array to store selected regions
    const [shapes, setShapes] = useState([]);  // To store shapes (periods)
    const [annotations, setAnnotations] = useState([]);  // To store annotations (flags)
    const [syncEnabled, setSyncEnabled] = useState(true);
    const [timestamps, setTimestamps] = useState([]);

    // Refs
    const timestampRef = useRef([]);
    const prevMidPointRef = useRef(null);
    const plotList = useRef([]);
    const videoRef = useRef(null);

    // Temporary fix for routing
    useEffect(() => {
        if (variablesContext === null) {
            router.push("/import");
        }
    }, [variablesContext, router]);

    if (variablesContext === null) {
        return (
            <div>
                <h1 style={{ color: 'red' }}>ERROR</h1>
                <p>Please refresh from localhost:3000</p>
                <p>Sorry for the inconvenience, proper routing will be implemented soon.</p>
            </div>
        );
    }

    //End of temporary fix for routing


    // Getting .touwi file name depending of new project or reopening project
    let fileName;
    let isReopen = false;
    if (variablesContext.touwi === null) {
        fileName = variablesContext.accel.name.split("_accel")[0] + '.touwi';
        //New Project at @fileName
    } else {
        fileName = variablesContext.touwi.name;
        isReopen = true;
        // Reopening Project at @fileName
    }

    const hasVideo = variablesContext.video ? true : false;


    // Effect to update timestampRef
    useEffect(() => {
        if (timestamps.length > 0) {
            timestampRef.current = timestamps;
        }
    }, [timestamps]);

    // Function to reset the zoom on all three plots
    function resetZoom() {

        // Stop video if playing
        if (hasVideo && videoRef.current) {
            if (syncEnabled) {
                setSyncEnabled(false);
            }
            videoRef.current.currentTime = videoRef.current.duration / 2;
        }

        // Use requestAnimationFrame instead of setTimeout for better performance
        requestAnimationFrame(() => {
            // Remove last indicator
            if (prevMidPointRef.current !== null) {
                deleteRegion(plotList, prevMidPointRef.current, true);
            }

            // Batch layout updates
            const updates = plotList.current.map(plotRef => {
                return Plotly.relayout(plotRef.current, {
                    'xaxis.autorange': true,
                    'yaxis.autorange': true
                });
            });

            // Wait for all layout updates to complete
            Promise.all(updates).then(() => {

                if (plotList.current[0].current === null) {
                    console.log('Removing deleted plot from list | code °1 ');
                    plotList.current = plotList.current.filter(ref => ref !== plotList.current[0]);
                }

                const midPoint = (plotList.current[0].current.layout.xaxis.range[0] +
                    plotList.current[0].current.layout.xaxis.range[1]) / 2;
                prevMidPointRef.current = midPoint;
                //highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, 'Midpoint Indicator');
                highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, '');
            });
        });
    }

    function resetMode() {
        setAppMode('None');
        setPlotlyDragMode(false);
    }


    function resetEvents() {

        // Clear shapes and annotations lists
        const updatedShapes = [];
        const updatedAnnotations = [];

        // Update shapes and annotations on all plots
        plotList.current.forEach((plotRef) => {
            if (plotRef.current === null) {
                console.log('Removing deleted plot from list | code °2 ');
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.relayout(plotRef.current, { shapes: updatedShapes, annotations: updatedAnnotations });
        });

        // Reset clicks
        //setSelections([]);

        // Reset mode after clearing events
        setAppMode('None');

        // Clear global state for shapes and annotations if they are used
        setShapes(updatedShapes);
        setAnnotations(updatedAnnotations);
        periodUpdate(timestampRef.current[0], timestampRef.current[timestampRef.current.length - 1], 'NONE', fileName);

        console.log('All periods and flags have been reset.');
    }

    // Function to completely purge plots and reset the state
    function voidPlots() {

        // Destroy all plots
        plotList.current.forEach((plotRef) => {
            if (plotRef.current === null) {
                console.log('Removing deleted plot from list | code °3 ');
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.purge(plotRef.current);
        });

        // Reset clicks
        //setSelections([]);
    }


    function setPlotlyDragMode(newDragMode) {

        console.log(`Plotly drag mode set to: ${newDragMode}`);

        // Update drag mode for all plots
        plotList.current.forEach((plotRef) => {

            if (plotRef.current === null) {
                console.log('Removing deleted plot from list | code °4 ');
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }

            //if we don't use scrollzoom on navigate, just use :
            //Plotly.relayout(plotRef, { dragmode: newDragMode });

            // Get the current layout of the plot
            const currentLayout = {
                ...plotRef.current_fullLayout,
                annotations: plotRef.current.layout.annotations,
                dragmode: newDragMode,
                margin: plotRef.current.layout.margin,
                shapes: plotRef.current.layout.shapes,
                title: plotRef.current.layout.title,
                xaxis: { range: plotRef.current.layout.xaxis.range },
                yaxis: { range: plotRef.current.layout.yaxis.range },
            };

            // Set the scrollZoom configuration based on the new drag mode
            const config = {
                displayModeBar: false,
                doubleClick: false,
                scrollZoom: newDragMode === 'pan'
            };

            // Use Plotly.react to update the axis ranges and scrollZoom
            Plotly.react(plotRef.current, plotRef.current.data, currentLayout, config);
        });
    }

    function syncZoom(eventdata, plotRefList, plotSender) {
        if (!('xaxis.range[0]' in eventdata)) {
            return;
        }

        const midPoint = (eventdata['xaxis.range[0]'] + eventdata['xaxis.range[1]']) / 2;

        //Remove previous INDICATOR
        if (prevMidPointRef.current !== null) {
            deleteRegion(plotList, prevMidPointRef.current, true);
        }

        //Add new INDICATOR
        //highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, 'Midpoint Indicator');
        highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, '');
        prevMidPointRef.current = midPoint;

        let layoutMode;
        let layoutUpdate;

        if (!(plotSender === null)) {
            if (plotSender.current.getAttribute('data-vertical-sync') === 'true') {
                layoutMode = 'horizontal';
            } else {
                layoutMode = '2_axis';
            }
        }
        else {
            layoutMode = 'horizontal';
        }

        //Update axis range for all plots
        plotRefList.forEach((plotRef) => {

            if (plotRef.current === null) {
                console.log('Removing deleted plot from list | code °5 ');
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }

            console.log('!', plotRef.current.getAttribute('data-vertical-sync'));

            if (layoutMode == '2_axis') {
                if (plotRef.current.getAttribute('data-vertical-sync') === 'true') {
                    layoutUpdate = {
                        'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
                    };
                }
                else {
                    layoutUpdate = {
                        'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
                        'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']],
                    };
                }
            }
            else if (layoutMode == 'horizontal') {
                layoutUpdate = { 'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']] };
            }
            else {
                console.error('Invalid layout mode detected');
            }

            Plotly.relayout(plotRef.current, layoutUpdate);

        });
    };

    function highlightFlag(xValue, style, text) {

        // create new shape
        const shape = {
            type: 'line',
            x0: xValue,
            x1: xValue,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: style,
        };

        const annotation = {
            x: xValue,
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
            hovertext: 'Flag at ' + xValue,
            //hovertext: 'Click to delete flag',
            opacity: 0.66,
            padding: 8,
            borderpad: 4,
            align: 'left',
            valign: 'middle',
        };



        // Add new shape and annotation to all plots
        plotList.current.forEach(plotRef => {
            if (plotRef.current === null) {
                console.log('Removing deleted plot from list | code °6 ');
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape], annotations: [...plotRef.current.layout.annotations, annotation] });
        });

    }

    function deleteRegion(plotList, xValue, onlyFlag) {

        if (plotList.current[0].current === null) {
            console.log('Removing deleted plot from list | code °7 ');
            plotList.current = plotList.current.filter(ref => ref !== plotList.current[0]);
        }

        // Find the region that contains the clicked xValue
        let regionIndex = plotList.current[0].current.layout.shapes.findIndex(
            shape => shape.x0 === shape.x1 && shape.x0 === xValue
        );

        // If no flag match and onlyFlag is false, check for periods
        if (regionIndex === -1 && !onlyFlag) {
            regionIndex = plotList.current[0].current.layout.shapes.findIndex(shape =>
                shape.x0 < shape.x1 && shape.x0 <= xValue && shape.x1 >= xValue
            );
        }

        // If region found, delete it and any associated annotation
        if (regionIndex !== -1) {
            const plotRefs = plotList.current;
            const shape = plotRefs[0].current.layout.shapes[regionIndex];
            const isFlag = shape.x0 === shape.x1;
            if (!onlyFlag) {
                periodUpdate(timestampRef.current[shape.x0], timestampRef.current[shape.x1], 'NONE', fileName);
            }

            // Remove 1 shape from all plots
            plotRefs.forEach(plotRef => {
                if (plotRef.current === null) {
                    console.log('Removing deleted plot from list | code °8 ');
                    plotList.current = plotList.current.filter(ref => ref !== plotRef);
                    return;
                }
                plotRef.current.layout.shapes.splice(regionIndex, 1);

                // Remove it's annotation if it's a flag
                if (isFlag) {
                    const annotationIndex = plotRef.current.layout.annotations.findIndex(
                        annotation => annotation.x === xValue
                    );

                    if (annotationIndex !== -1) {
                        plotRef.current.layout.annotations.splice(annotationIndex, 1);
                    }
                }
            });

            // Reset clicks
            //selections.splice(regionIndex, 1);

            // Update shapes and annotations on the plots
            plotRefs.forEach(plotRef => {
                if (plotRef.current === null) {
                    console.log('Removing deleted plot from list | code °9 ');
                    plotList.current = plotList.current.filter(ref => ref !== plotRef);
                    return;
                }
                Plotly.relayout(plotRef.current, {
                    shapes: plotRef.current.layout.shapes,
                    annotations: plotRef.current.layout.annotations
                });
            });

            if (!onlyFlag) {
                console.log(`Region${isFlag ? ' and annotation' : ''} removed at x: ${xValue}`);
            }
        }
    }

    return (
        <div className="app-container">
            <div className="graph-container">
                <Graph
                    propsData={{
                        hasVideo: hasVideo,
                        video: hasVideo ? variablesContext.video : null,
                        plotList: plotList,
                        appMode: appMode,
                        syncZoom: syncZoom,
                        syncEnabled: syncEnabled,
                        setSyncEnabled: setSyncEnabled,
                        videoRef: videoRef,
                        highlightFlag: highlightFlag,
                        deleteRegion: deleteRegion,
                        name: fileName,
                        setTimestamps: setTimestamps,
                        timestampRef: timestampRef,
                        isReopen: isReopen,
                        resetZoom: resetZoom,
                        resetMode: () => setAppMode('None'),
                        resetEvents: resetEvents,
                        voidPlots: voidPlots,
                        setAppMode: setAppMode,
                        setPlotlyDragMode: setPlotlyDragMode,
                    }}
                />
            </div>
        </div>
    );
};

export default App;