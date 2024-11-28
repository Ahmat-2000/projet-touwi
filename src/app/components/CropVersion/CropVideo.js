// CropVideo.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';

import { useVariablesContext } from '@/utils/VariablesContext';
import { useRouter } from "next/navigation";
import { getRowWithTimestamp } from '@/team-offline/outils';
import { saveVideoTimers } from '@/team-offline/requests';

import CropPlot from './CropPlot';
import CropVideoControls from './CropVideoControls';

export default function CropVideo() {
    const { variablesContext } = useVariablesContext();         //Form file getter
    const { setVariablesContext } = useVariablesContext();      //Form file setter

    const router = useRouter();
    // Temporary fix for routing
    useEffect(() => {
        if (variablesContext === null) {
            router.push("/import");
        }
    }, [variablesContext, router]);
    //End of temporary fix for routing

    const [singlePlot, setSinglePlot] = useState(null);         //Signal Plot value/setter
    const [cropVideoStart, setCropVideoStart] = useState(null); //Video start setter
    const [cropVideoEnd, setCropVideoEnd] = useState(null);     //Video end setter
    const [appMode, setAppMode] = useState('None');             //AppMode value/setter
    const [dragMode, setDragMode] = useState(false);            //Drag mode setter

    const appModeRef = useRef(appMode);                         //UseRef for appMode
    const dragModeRef = useRef(dragMode);                       //UseRef for dragMode
    const plotRef = useRef(null);                               //UseRef for plot
    const videoRef = useRef(null);                              //UseRef for video
    
    useEffect(() => {                                           //Listen to dragMode change
        dragModeRef.current = dragMode;                         //Update dragModeRef to the change
    }, [dragMode]);
    
    useEffect(() => {                                           //Listen to appMode change
        appModeRef.current = appMode;                           //Update appModeRef to the change
    }, [appMode]);

    useEffect(() => {                                           //Create default plot : Accelerometer X
        const filename = variablesContext.accel.name.split("_accel")[0] + '.touwi';
        createPlot(filename);
    }, []);

    function createPlot(filename) {

        const bundle = getRowWithTimestamp("accel", "x", filename);
        bundle.then(result => {

            const timestamp = result[0];
            const data = result[1];

            const props = {
                data: data,
                title: "Crop Video : " + variablesContext.accel.name,
                timestamp: timestamp,
                shapes: [],
                annotations: [],
                color: "#8E44AD",
                plotRef: plotRef,
                appModeRef: appModeRef,
                dragModeRef: dragModeRef,
                cropVideoStart: cropVideoStart,
                setCropVideoStart: setCropVideoStart,
                cropVideoEnd: cropVideoEnd,
                setCropVideoEnd: setCropVideoEnd
            };

            setSinglePlot(<CropPlot key={0} propsData={props} />);
        });
    }

    function setPlotlyDragMode(newDragMode) {

        setDragMode(newDragMode);

        const currentLayout = {
            ...plotRef.current.layout,
            dragmode: newDragMode
        };

        const config = {
            displayModeBar: false,
            doubleClick: false,
            scrollZoom: newDragMode === 'pan'
        };

        Plotly.react(plotRef.current, plotRef.current.data, currentLayout, config);
    }

    return (
        <div>
            <h1>Crop Video</h1>
            <div className="control-panel">
                <button 
                    onClick={() => { setAppMode('signal_start'); setPlotlyDragMode(false); }}
                    className={`control-button ${appMode === 'start' ? 'active' : ''}`}
                    data-active={appMode === 'signal_start'}
                >
                    <span>Signal Start</span>
                </button>
                <button 
                    onClick={() => { setAppMode('signal_end'); setPlotlyDragMode(false); }}
                    className={`control-button ${appMode === 'signal_end' ? 'active' : ''}`}
                    data-active={appMode === 'signal_end'}
                >
                    <span>Signal End</span>
                </button>
                <button 
                    onClick={() => { setAppMode('video_start'); setPlotlyDragMode(false); }}
                    className={`control-button ${appMode === 'video_start' ? 'active' : ''}`}
                    data-active={appMode === 'video_start'}
                >
                    <span>Video Start</span>
                </button>
                <button 
                    onClick={() => { setAppMode('video_end'); setPlotlyDragMode(false); }}
                    className={`control-button ${appMode === 'video_end' ? 'active' : ''}`}
                    data-active={appMode === 'video_end'}
                >
                    <span>Video End</span>
                </button>
                <button 
                    onClick={() => { setPlotlyDragMode('pan'); setAppMode('None'); }}
                    className={`control-button ${appMode === 'pan' ? 'active' : ''}`}
                    data-active={appMode === 'pan'}
                >
                    <span>Pan</span>
                </button>
                <button
                    onClick={() => { setPlotlyDragMode('zoom'); setAppMode('None'); }}
                    className={`control-button ${appMode === 'zoom' ? 'active' : ''}`}
                    data-active={appMode === 'zoom'}
                >
                    <i className="fas fa-search-plus"></i>
                    <span>Zoom</span>
                </button>
                <button 
                    onClick={() => { setPlotlyDragMode(false); setAppMode('None'); }}
                    className="control-button danger"
                >
                    <span>Clean</span>
                </button>
                <button
                    onClick={() => { setAppMode('delete'); setPlotlyDragMode(false); }}
                    className={`control-button ${appMode === 'delete' ? 'active' : ''}`}
                    data-active={appMode === 'delete'}
                >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                </button>
            </div>


            <CropVideoControls
                propsVideoControls={{
                    video: variablesContext.video,
                    videoRef: videoRef,
                    plotRef: plotRef,
                    appModeRef: appModeRef,
                    cropVideoStart: cropVideoStart,
                    setCropVideoStart: setCropVideoStart,
                    cropVideoEnd: cropVideoEnd,
                    setCropVideoEnd: setCropVideoEnd
                }}
            />

            {singlePlot}

            <div className="submit-crop">
                <button
                    onClick={() => {
                        setVariablesContext({...variablesContext, crop:{start: cropVideoStart, end: cropVideoEnd}});
                        const filename = variablesContext.accel.name.split("_accel")[0] + '.touwi';
                        console.log("Saving video timers", cropVideoStart, cropVideoEnd, filename);
                        saveVideoTimers(cropVideoStart, cropVideoEnd, filename);
                        router.push("/edit");
                    }}
                >
                    <span>Submit</span>
                </button>
            </div>
        </div>

        
    );
}

