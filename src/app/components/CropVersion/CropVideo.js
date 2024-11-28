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

const CropVideo = () => {
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
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-2xl font-bold text-[#1B649F] mb-4">Crop Video</h1>
            
            {/* Main Container */}
            <div className="flex-container">
                {/* Video Controls Section */}
                <div className="video-container">
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
                </div>

                {/* Control Panel */}
                <div className="control-panel">
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => { setAppMode('video_start'); setPlotlyDragMode(false); }}
                            className={`control-button ${appMode === 'video_start' ? 'bg-[#297DCB] text-white' : 'bg-gray-100'}`}
                            data-active={appMode === 'video_start'}
                        >
                            <i className="fas fa-film"></i>
                            <span>Video Start</span>
                        </button>

                        <button
                            onClick={() => { setPlotlyDragMode('zoom'); setAppMode('None'); }}
                            className={`control-button ${dragMode === 'zoom' ? 'bg-[#297DCB] text-white' : 'bg-gray-100'}`}
                            data-active={dragMode === 'zoom'}
                        >
                            <i className="fas fa-search-plus"></i>
                            <span>Zoom</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <button
                            onClick={() => { setAppMode('video_end'); setPlotlyDragMode(false); }}
                            className={`control-button ${appMode === 'video_end' ? 'bg-[#297DCB] text-white' : 'bg-gray-100'}`}
                            data-active={appMode === 'video_end'}
                        >
                            <i className="fas fa-film"></i>
                            <span>Video End</span>
                        </button>
                        
                        <button
                            onClick={() => { setPlotlyDragMode('pan'); setAppMode('None'); }}
                            className={`control-button ${dragMode === 'pan' ? 'bg-[#297DCB] text-white' : 'bg-gray-100'}`}
                            data-active={dragMode === 'pan'}
                        >
                            <i className="fas fa-hand-paper"></i>
                            <span>Pan</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <button 
                            onClick={() => { setPlotlyDragMode(false); setAppMode('None'); }}
                            className={`control-button ${appMode === 'None' ? 'bg-[#297DCB] text-white' : 'bg-gray-100'}`}
                            data-active={appMode === 'None'}
                        >
                            <i className="fas fa-mouse-pointer"></i>
                            <span>Normal</span>
                        </button>

                        <button
                            onClick={() => { setAppMode('delete'); setPlotlyDragMode(false); }}
                            className={`control-button ${appMode === 'delete' ? 'bg-[#297DCB] text-white' : 'bg-gray-100'}`}
                            data-active={appMode === 'delete'}
                        >
                            <i className="fas fa-trash"></i>
                            <span>Delete</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Plot Section */}
            <div className="graph-container">
                {singlePlot}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-4">
                <button
                    onClick={() => {
                        setVariablesContext({ ...variablesContext, crop: { start: cropVideoStart, end: cropVideoEnd } });
                        const filename = variablesContext.accel.name.split("_accel")[0] + '.touwi';
                        console.log("Saving video timers", cropVideoStart, cropVideoEnd, filename);
                        saveVideoTimers(cropVideoStart, cropVideoEnd, filename);
                        router.push("/edit");
                    }}
                    className="bg-[#297DCB] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                >
                    <i className="fas fa-check mr-2"></i>
                    Submit
                </button>
            </div>
        </div>
    );
}

export default CropVideo;