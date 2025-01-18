// App.js
"use client";

import React, { useState, useRef, useEffect } from 'react';

import { useVariablesContext } from '@/utils/VariablesContext';
import { periodUpdate } from '@/team-offline/outils';
import { useRouter } from "next/navigation";

import Graph from './Graph';
import Plotly from 'plotly.js-basic-dist-min';
import LifeLine from "react-loading-indicators/LifeLine";
import { getVideoTimers } from '@/team-offline/outils';

const App = () => {
    const router = useRouter();
    
    const { variablesContext } = useVariablesContext();     //Previous page informations
    console.log("App", variablesContext);

    // State hooks
    const [appMode, setAppMode] = useState('None');         // App mode value/setter
    const [dragMode, setDragMode] = useState(false);        // Drag mode value/setter
    const [shapes, setShapes] = useState([]);               //Useless (I think)
    const [annotations, setAnnotations] = useState([]);     //Useless (I think)
    const [timestamps, setTimestamps] = useState([]);       //list of timestamps same format as .csv used to convert back points to timestamps
    const [preRender, setPreRender] = useState(false);      //If false, do not render the graph
    const [hasVideo, setHasVideo] = useState(false);
    const [cropPoints, setCropPoints] = useState({ video: { start: null, end: null }, signal: { start: null, end: null } });
    const [fileName, setFileName] = useState('');           // Store fileName
    const [isReopen, setIsReopen] = useState(false);        // Store isReopen status

    //If video is given :
    const [syncEnabled, setSyncEnabled] = useState(true);   //Link/Unlink video playing to signals
    const videoRef = useRef(null);                          //UseRef for video

    // Refs
    const timestampRef = useRef([]);                        //UseRef for timestamps (Unsure if needed)
    const prevMidPointRef = useRef(null);                   //UseRef for midPoint indicator
    const plotList = useRef([]);                            //UseRef for list containing components Plot.js

    useEffect(() => {                                       // Handling page reload & video setup
        if (variablesContext === null) {                    // -> redirect to import page
            router.push("/import");
            return;
        }

        // Getting .touwi file name depending of new project or reopening project
        let currentFileName;
        if (variablesContext.touwi === null) {
            currentFileName = variablesContext.accel.name.split("_accel")[0] + '.touwi';
            setFileName(currentFileName);
            setIsReopen(false);
            //New Project at @fileName
        } else {
            currentFileName = variablesContext.touwi.name;
            setFileName(currentFileName);
            setIsReopen(true);
            // Reopening Project at @fileName
        }
        const fetchTimers = async (currentFileName,) => {   //If found -> set cropPoints
            if (!variablesContext.video) {                  //Else -> do not display video
                setHasVideo(false);
                setPreRender(true);
                return;
            }

            if (variablesContext.crop) {
                setCropPoints({
                    signal: { start: variablesContext.crop.signal.start, end: variablesContext.crop.signal.end },
                    video: { start: variablesContext.crop.video.start, end: variablesContext.crop.video.end }
                });
                setHasVideo(true);
                setPreRender(true);
                return;
            }
            else {
                const timers = await fetchVideoTimers(currentFileName);
                if (timers === undefined) {
                    setHasVideo(false);
                    alert("No crop timers found for this video, video will be removed");
                    setPreRender(true);
                    return;
                }
                setCropPoints({
                    signal: timers['videoTimers'].signal,
                    video: timers['videoTimers'].video
                });
                setHasVideo(true);
                setPreRender(true);
            };
        }
        fetchTimers(currentFileName);
    }, []);

    useEffect(() => {                                       //Update timestampRef when timestamps change
        if (timestamps.length > 0) {                        //Only needed for the default plot
            timestampRef.current = timestamps;              //list needs to be stored once and remain unchanged
        }
    }, [timestamps]);


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

            const updates = plotList.current.map(plotRef => {
                return Plotly.relayout(plotRef.current, {
                    'xaxis.autorange': true,
                    'yaxis.autorange': true
                });
            });

            // Wait for all layout updates to complete
            Promise.all(updates).then(() => {
                const midPoint = (plotList.current[0].current.layout.xaxis.range[0] + plotList.current[0].current.layout.xaxis.range[1]) / 2;
                prevMidPointRef.current = midPoint;
                highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, '');
            });
        });
    }

    function resetEvents() {

        // Clear shapes and annotations lists
        const updatedShapes = [];
        const updatedAnnotations = [];

        // Update shapes and annotations on all plots
        plotList.current.forEach((plotRef) => {
            Plotly.relayout(plotRef.current, { shapes: updatedShapes, annotations: updatedAnnotations });
        });

        // Clear global state for shapes and annotations if they are used
        setShapes(updatedShapes);
        setAnnotations(updatedAnnotations);
        periodUpdate(timestampRef.current[0], timestampRef.current[timestampRef.current.length - 1], 'NONE', fileName);
    }

    function voidPlots() {

        // Destroy all plots
        plotList.current.forEach((plotRef) => {
            if (plotRef.current === null) {
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.purge(plotRef.current);
        });

    }

    function setPlotlyDragMode(newDragMode) {

        setDragMode(newDragMode);

        // Update drag mode for all plots
        plotList.current.forEach((plotRef) => {

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
                plot_bgcolor: 'rgba(255, 255, 255, 0)',
                paper_bgcolor: 'rgba(255, 255, 255, 0)',
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
            opacity: 0.66,
            padding: 8,
            borderpad: 4,
            align: 'left',
            valign: 'middle',
        };



        // Add new shape and annotation to all plots
        plotList.current.forEach(plotRef => {
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape], annotations: [...plotRef.current.layout.annotations, annotation] });
        });

    }

    function deleteRegion(plotList, xValue, onlyFlag) {

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

            // Update shapes and annotations on the plots
            plotRefs.forEach(plotRef => {
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

    async function fetchVideoTimers(currentFileName) {
        const tmp = await getVideoTimers(currentFileName);
        return tmp;
    }


    return (
        variablesContext == null ? null : (
            <div className="w-full flex flex-col gap-4 bg-[#e1ebff]">
                <div className="w-full p-5 mx-2.5">
                    {preRender ? (
                        <Graph
                            propsData={{
                                appMode: appMode,
                                deleteRegion: deleteRegion,
                                dragMode: dragMode,
                                cropPoints: cropPoints,
                                hasVideo: hasVideo,
                                highlightFlag: highlightFlag,
                                isReopen: isReopen,
                                name: fileName,
                                plotList: plotList,
                                resetZoom: resetZoom,
                                resetEvents: resetEvents,
                                setSyncEnabled: setSyncEnabled,
                                setTimestamps: setTimestamps,
                                setAppMode: setAppMode,
                                setDragMode: setDragMode,
                                setPlotlyDragMode: setPlotlyDragMode,
                                syncEnabled: syncEnabled,
                                syncZoom: syncZoom,
                                timestampRef: timestampRef,
                                videoRef: videoRef,
                                video: hasVideo ? variablesContext.video : null,
                                voidPlots: voidPlots,
                            }}
                        />
                    ) : (
                        <div className="flex flex-col justify-center items-center h-full" style={{ height: '100vh' }}>
                            <LifeLine color="#3176cc" size="large" text="Loading..." textColor="#3176cc" />
                        </div>
                    )}
                </div>

            </div>
        )
    )
};

export default App;