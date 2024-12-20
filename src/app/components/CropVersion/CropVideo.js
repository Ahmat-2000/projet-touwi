// CropVideo.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import Image from 'next/image';

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
    

    useEffect(() => {                                       // Handling page reload
        if (variablesContext === null) {                    // -> redirect to import page
            router.push("/import");
        }
    }, [variablesContext, router]);

    if (variablesContext === null) {                        // Rendering none if page is to be redirected
        return null;
    }

    const [singlePlot, setSinglePlot] = useState(null);         //Signal Plot value/setter
    const [appMode, setAppMode] = useState('None');             //AppMode value/setter
    const [dragMode, setDragMode] = useState(false);            //Drag mode setter
    const [cropPoints, setCropPoints] = useState({start: null, end: null});           //Video crop points setter
    const [signalCropPoints, setSignalCropPoints] = useState([]); //Signal crop points setter

    const videoCropPointsRef = useRef(cropPoints);
    const signalCropPointsRef = useRef(signalCropPoints);

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

    useEffect(() => {
        videoCropPointsRef.current = cropPoints;
        console.log("videoCropPointsRef", videoCropPointsRef.current);
    }, [cropPoints]);

    useEffect(() => {
        signalCropPointsRef.current = signalCropPoints;
        console.log("signalCropPointsRef", signalCropPointsRef.current);
    }, [signalCropPoints]);

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
                signalCropPoints: signalCropPoints,
                setSignalCropPoints: setSignalCropPoints,
                signalCropPointsRef: signalCropPointsRef
            };

            setSinglePlot(<CropPlot key={0} propsData={props} />);
        });
    }

    function setPlotlyDragMode(newDragMode) {

        setDragMode(newDragMode);

        const currentLayout = {
            ...plotRef.current.layout,
            dragmode: newDragMode,
            plot_bgcolor: 'rgba(255, 255, 255, 0)',
            paper_bgcolor: 'rgba(255, 255, 255, 0)',
        };

        const config = {
            displayModeBar: false,
            doubleClick: false,
            scrollZoom: newDragMode === 'pan'
        };

        Plotly.react(plotRef.current, plotRef.current.data, currentLayout, config);
    }

    return (
        <div className="flex flex-col gap-4 p-10 w-full">
            {/* Main Container */}
            <div className="flex justify-between items-start gap-6 w-full">
                {/* Video Controls Section */}
                <div className="bg-white p-6 rounded-xl shadow-md w-[45%] mx-auto">
                    <CropVideoControls
                        propsVideoControls={{
                            video: variablesContext.video,
                            videoRef: videoRef,
                            plotRef: plotRef,
                            appModeRef: appModeRef,
                            videoCropPointsRef: videoCropPointsRef,
                            videoCropPoints: cropPoints,
                            setVideoCropPoints: setCropPoints,
                            signalCropPointsRef: signalCropPointsRef,
                            signalCropPoints: signalCropPoints
                        }}
                    />
                </div>

                {/* Control Panel */}
                <div className="bg-white p-6 rounded-xl shadow-md w-[50%] flex flex-col gap-1 mx-auto">
                    <div className="flex justify-between items-center">
                        <Image src="/images/temp_logo.png" width={100} height={70} alt="Chronos Logo" className="h-12 w-auto" />
                        <h1 className="text-2xl font-bold text-gray-800">Video Cropping Tool</h1>
                        <div className="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-600">Current Mode</span>
                            <span className="px-3 py-1 rounded-md font-semibold text-center text-white bg-[#297DCB]">
                                {appMode === 'None' ? 'Pointer' : appMode}
                            </span>
                        </div>
                    </div>

                    {/* Button Grid - Fixed Height Buttons with Separators */}
                    <div className="flex justify-evenly px-12">
                        {/* Video Controls Section */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-3">Video Selection</span>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => { setAppMode('video_start'); setPlotlyDragMode(false); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'video_start' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-film text-xl mb-2"></i>
                                    <span className="text-sm">Video Start</span>
                                </button>

                                <button
                                    onClick={() => { setAppMode('video_end'); setPlotlyDragMode(false); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'video_end' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-film text-xl mb-2"></i>
                                    <span className="text-sm">Video End</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-16 flex items-center justify-center">
                            <div className="w-px h-full bg-gray-200"></div>
                        </div>

                        {/* Signal Controls Section */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-3">Signal Selection</span>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => { setAppMode('signal_start'); setPlotlyDragMode(false); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'signal_start' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-wave-square text-xl mb-2"></i>
                                    <span className="text-sm">Signal Start</span>
                                </button>

                                <button
                                    onClick={() => { setAppMode('signal_end'); setPlotlyDragMode(false); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'signal_end' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-wave-square text-xl mb-2"></i>
                                    <span className="text-sm">Signal End</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-16 flex items-center">
                            <div className="w-px h-full bg-gray-200"></div>
                        </div>

                        {/* Navigation Controls Section */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-3">Signal Navigation</span>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => { setPlotlyDragMode('zoom'); setAppMode('None'); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${dragMode === 'zoom' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-search-plus text-xl mb-2"></i>
                                    <span className="text-sm">Zoom</span>
                                </button>

                                <button
                                    onClick={() => { setPlotlyDragMode('pan'); setAppMode('None'); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${dragMode === 'pan' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-hand-paper text-xl mb-2"></i>
                                    <span className="text-sm">Pan</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-16 flex items-center">
                            <div className="w-px h-full bg-gray-200"></div>
                        </div>

                        {/* Utility Controls Section */}
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-3">Tools</span>
                            <div className="flex flex-col gap-4">
                                <button 
                                    onClick={() => { setPlotlyDragMode(false); setAppMode('None'); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'None' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-mouse-pointer text-xl mb-2"></i>
                                    <span className="text-sm">Pointer</span>
                                </button>

                                <button
                                    onClick={() => { setAppMode('delete'); setPlotlyDragMode(false); }}
                                    className={`h-24 w-40 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'delete' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-trash text-xl mb-2"></i>
                                    <span className="text-sm">Delete</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={() => {
                            if (cropPoints.start === null || cropPoints.end === null || signalCropPoints.start === undefined || signalCropPoints.end === undefined) {
                                const videoStart = cropPoints.start ? cropPoints.start.toFixed(2) : 'X';
                                const videoEnd = cropPoints.end ? cropPoints.end.toFixed(2) : 'X';
                                const signalStart = signalCropPoints.start ? signalCropPoints.start : 'X';
                                const signalEnd = signalCropPoints.end ? signalCropPoints.end : 'X';
                                
                                alert("Please select the missing cropping points marked as X :\n" +
                                "\nVideo Start  : " + videoStart + "\n" +
                                "Video End   : " + videoEnd + "\n" +
                                "Signal Start : " + signalStart + "\n" + 
                                "Signal End  : " + signalEnd + "\n");
                                return;
                            }

                            const crop = {
                                video: { start: cropPoints.start, end: cropPoints.end },
                                signal: { start: signalCropPoints.start, end: signalCropPoints.end }
                            };

                            setVariablesContext({ 
                                ...variablesContext, 
                                crop: crop
                            });
                            const filename = variablesContext.accel.name.split("_accel")[0] + '.touwi';
                            saveVideoTimers(crop, filename);
                            router.push("/edit");
                        }}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all shadow-lg hover:shadow-xl ${
                            cropPoints.start === null || 
                            cropPoints.end === null || 
                            signalCropPoints.start === undefined || 
                            signalCropPoints.end === undefined
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                    >
                        <i className="fas fa-check text-xl"></i>
                        <span className="text-base font-medium">Submit</span>
                    </button>
                </div>
            </div>

            {/* Plot Section */}
            <div className="w-full">
                {singlePlot}
            </div>
        </div>
    );
}

export default CropVideo;