// App.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import Plotly from 'plotly.js-basic-dist-min';

import Graph from './Graph';
import ControlPanel from './ControlPanel';

import VideoControls from './VideoControls';
import { useVariablesContext } from '@/utils/VariablesContext';
import {saveNewFile, receiveFile,saveModificationFile} from '@/team-offline/requests';
import {getRowWithTimestamp, updateLabelByTimestamp, periodUpdate} from '@/team-offline/outils';
import { useRouter } from "next/navigation";


const App = () => {


    const { variablesContext } = useVariablesContext();
    const router = useRouter();

    //Temporary fix for routing

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
    if (variablesContext.touwi === null) {
        fileName = variablesContext.accel.name.split("_accel")[0] + '.touwi';
        //New Project at @fileName
     } else {
        fileName = variablesContext.touwi.name;
        // Reopening Project at @fileName
     }
    

    const hasVideo = variablesContext.video ? true : false;

    const [error, setError] = useState(''); // Error message for CSV parsing

    const [appMode, setAppMode] = useState('None'); // Mode for app Actions ONLY
    
    const [selections, setSelections] = useState([]); // Array to store selected regions
    const [shapes, setShapes] = useState([]);  // To store shapes (periods)
    const [annotations, setAnnotations] = useState([]);  // To store annotations (flags)
    const [syncEnabled, setSyncEnabled] = useState(true);

    const [timestamps,setTimestamps] = useState([]);
    const timestampRef = useRef([]);


    const prevMidPointRef = useRef(null);

    const plotList = useRef([]);
    const videoRef = useRef(null);

    useEffect(() => {
        if (timestamps.length > 0 ){
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
                highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, 'Midpoint Indicator');
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
                //remove plot from plotRefList
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.relayout(plotRef.current, { shapes: updatedShapes, annotations: updatedAnnotations });
        });

        // Reset clicks
        setSelections([]);

        // Reset mode after clearing events
        setAppMode('None');

        // Clear global state for shapes and annotations if they are used
        setShapes(updatedShapes);
        setAnnotations(updatedAnnotations);

        periodUpdate(timestampRef.current[0],timestampRef.current[timestampRef.current.length],'NONE',fileName);

        console.log('All periods and flags have been reset.');
    }

    // Function to completely purge plots and reset the state
    function voidPlots() {

        // Destroy all plots
        plotList.current.forEach((plotRef) => {
            if (plotRef.current === null) {
                //remove plot from plotRefList
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.purge(plotRef.current);
        });

        // Reset clicks
        setSelections([]);

        // Reset error
        setError('');
    }


    function setPlotlyDragMode(newDragMode) {

        console.log(`Plotly drag mode set to: ${newDragMode}`);

        // Update drag mode for all plots
        plotList.current.forEach((plotRef) => {

            if (plotRef.current === null) {
                //remove plot from plotRefList
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
                scrollZoom: newDragMode === 'pan' };

            // Use Plotly.react to update the axis ranges and scrollZoom
            Plotly.react(plotRef.current, plotRef.current.data, currentLayout, config);
        });
    }

    function syncZoom(eventdata, plotRefList) {

        if (!('xaxis.range[0]' in eventdata)){
            //synczoom is also called in functions highlightFlag and deleteRegion because it updates the plot layout (atttibutes shapes & annotations)
            //I don't think we can stop it so just cancel it here
            return;
        }

        //Get new axis range
        const layoutUpdate = {
            'xaxis.range': [eventdata['xaxis.range[0]'], eventdata['xaxis.range[1]']],
            'yaxis.range': [eventdata['yaxis.range[0]'], eventdata['yaxis.range[1]']]
        };

        const midPoint = (eventdata['xaxis.range[0]'] + eventdata['xaxis.range[1]']) / 2;
        
        //Remove previous INDICATOR
        if (prevMidPointRef.current !== null) {
            deleteRegion(plotList, prevMidPointRef.current, true);
        }

        //Add new INDICATOR
        highlightFlag(midPoint, { width: 3, color: 'black', dash: 'solid' }, 'Midpoint Indicator');
        prevMidPointRef.current = midPoint;
        
        //Update axis range for all plots
        plotRefList.forEach((plotRef) => {
            if (plotRef.current === null) {
                //remove plot from plotRefList
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
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

        // create new annotation
        const annotation = {
            x: xValue,
            y: 1, // Adjust this value to position the text on the y-axis
            xref: 'x',
            yref: 'paper',
            text: text,
            showarrow: false,
            font: {
                size: 12,
                color: 'black'
            },
            bordercolor: 'grey',
            borderwidth: 2,
            borderpad: 4,
            align: 'left',
            valign: 'middle',

        };

        // Add new shape and annotation to all plots
        plotList.current.forEach(plotRef => {
            if (plotRef.current === null) {
                //remove plot from plotRefList
                plotList.current = plotList.current.filter(ref => ref !== plotRef);
                return;
            }
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape], annotations: [...plotRef.current.layout.annotations, annotation] });
        });

    }

    function deleteRegion(plotList, xValue, onlyFlag) {

        if (plotList.current[0].current === null) {
            console.log('Removing deleted plot from list | code °2 ');
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
            periodUpdate(timestampRef.current[shape.x0],timestampRef.current[shape.x1],'NONE',fileName);

            // Remove 1 shape from all plots
            plotRefs.forEach(plotRef => {
                if (plotRef.current === null) {
                    //remove plot from plotRefList
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
            selections.splice(regionIndex, 1);

            // Update shapes and annotations on the plots
            plotRefs.forEach(plotRef => {
                if (plotRef.current === null) {
                    //remove plot from plotRefList
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
            {hasVideo && (
                <div className="video-container">
                    <VideoControls propsData={{
                        video: hasVideo ? variablesContext.video : null,
                        plotList: plotList,
                        syncZoom: syncZoom,
                        videoRef: videoRef,
                        highlightFlag: highlightFlag,
                        deleteRegion: deleteRegion,
                        syncEnabled: syncEnabled,
                        setSyncEnabled: setSyncEnabled
                    }} />
                </div>
            )}

            <div className={`panel-container ${!hasVideo ? 'full-width' : ''}`}>
                    <ControlPanel
                        resetZoom={resetZoom}
                        resetMode={() => setAppMode('None')}
                        resetEvents={resetEvents}
                        voidPlots={voidPlots}
                        plotList={plotList}
                        setAppMode={setAppMode}
                        setPlotlyDragMode={setPlotlyDragMode}
                        appMode={appMode}
                        hasVideo={hasVideo}
                    />
            </div>

                <div className="graph-container">
                    <Graph 
                        plotList={plotList} 
                        appMode={appMode} 
                        setAppMode={setAppMode} 
                        hasVideo={hasVideo} 
                        syncZoom={syncZoom}
                        videoRef={videoRef}
                        highlightFlag={highlightFlag}
                        deleteRegion={deleteRegion}
                        name={fileName}
                        timestamps={timestamps}
                        setTimestamps={setTimestamps}
                        timestampRef={timestampRef}

                    />
                </div>
        </div>
    );
    
};

export default App;