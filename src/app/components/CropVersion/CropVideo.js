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
import Tips from '../Tips';

const CropVideo = () => {
    const { variablesContext } = useVariablesContext();         //Form file getter
    const { setVariablesContext } = useVariablesContext();      //Form file setter

    const router = useRouter();

    const [singlePlot, setSinglePlot] = useState(null);         //Signal Plot value/setter
    const [appMode, setAppMode] = useState('None');             //AppMode value/setter
    const [dragMode, setDragMode] = useState(false);            //Drag mode setter
    const [cropPoints, setCropPoints] = useState({start: null, end: null});           //Video crop points setter
    const [signalCropPoints, setSignalCropPoints] = useState([]); //Signal crop points setter
    const [, forceUpdate] = useState({});                       //Force update state

    const videoCropPointsRef = useRef(cropPoints);
    const signalCropPointsRef = useRef(signalCropPoints);

    const appModeRef = useRef(appMode);                         //UseRef for appMode
    const dragModeRef = useRef(dragMode);                       //UseRef for dragMode
    const plotRef = useRef(null);                               //UseRef for plot
    const videoRef = useRef(null);                              //UseRef for video

    useEffect(() => {                                       // Handling page reload
        if (variablesContext === null) {                    // -> redirect to import page
            router.push("/import");
        }
    }, [variablesContext, router]);

    useEffect(() => {
        if (!variablesContext) {
            console.log("Page has been reloaded, redirecting to the form");
            return;
        }

        const filename = variablesContext.accel.name.split("_accel")[0] + '.touwi';
        createPlot(filename);
    }, [variablesContext]);

    useEffect(() => {                                           //Listen to dragMode change
        dragModeRef.current = dragMode;                         //Update dragModeRef to the change
    }, [dragMode]);

    useEffect(() => {                                           //Listen to appMode change
        appModeRef.current = appMode;                           //Update appModeRef to the change
    }, [appMode]);

    useEffect(() => {
        videoCropPointsRef.current = cropPoints;
    }, [cropPoints]);

    useEffect(() => {
        signalCropPointsRef.current = signalCropPoints;
    }, [signalCropPoints]);

    useEffect(() => {
        const handleKeydown = (event) => {
            if (event.target.tagName === 'INPUT') {
                return;
            }

            const charUpper = event.key.toUpperCase();
            switch (charUpper) {

                case '1':
                    setAppMode('video_start');
                    break;
                case '2':
                    setAppMode('video_end');
                    break;
                case '3':
                    setAppMode('signal_start');
                    break;
                case '4':
                    setAppMode('signal_end');
                    break;
                
                case 'B':
                    setAppMode('Pointer');
                    break;
                case 'D':
                    setAppMode('delete');
                    break;


                // Reset zoom
                case 'H':
                    if (plotRef.current) {
                        Plotly.relayout(plotRef.current, {
                            'xaxis.autorange': true,
                            'yaxis.autorange': true
                        });
                    }
                    break;
                
                // Navigation modes
                case 'P':
                    setPlotlyDragMode('pan');
                    setAppMode('None');
                    break;
                case 'Z':
                    setPlotlyDragMode('zoom');
                    setAppMode('None');
                    break;
                
                // Video speed controls
                case '+':
                    event.preventDefault();
                    if (videoRef.current) {
                        const currentSpeed = videoRef.current.playbackRate;
                        let newSpeed = currentSpeed * 2;
                        // Limit the speed between 0.1 and 16
                        newSpeed = Math.min(16, Math.max(0.1, newSpeed));
                        videoRef.current.playbackRate = newSpeed;
                        forceUpdate({});
                    }
                    break;
                case '-':
                    event.preventDefault();
                    if (videoRef.current) {
                        const currentSpeed = videoRef.current.playbackRate;
                        let newSpeed = currentSpeed / 2;
                        // Limit the speed between 0.1 and 16
                        newSpeed = Math.min(16, Math.max(0.1, newSpeed));
                        videoRef.current.playbackRate = newSpeed;
                        forceUpdate({});
                    }
                    break;

            }
        };

        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
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

    return variablesContext === null ? null : (
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
                <div className="bg-white p-6 rounded-xl shadow-md w-[50%] flex flex-col justify-between gap-4 mx-auto">
                    {/* Header Section */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-lg font-bold text-gray-800 ml-9">Chronos Cropping Tool</h1>
                        <Image src="/images/temp_logo.png" width={100} height={70} alt="Chronos Logo" className="h-12 w-auto" />
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-50 rounded-lg px-4 py-2 flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-600">Current Mode</span>
                                <span className="px-3 py-1 rounded-md font-semibold text-center text-white bg-[#297DCB]">
                                    {appMode === 'None' ? 'Pointer' : appMode}
                                </span>
                            </div>
                            <Tips imgPath="/images/crop_tips.png" />
                        </div>
                    </div>

                    {/* Button Grid - With more spacing */}
                    <div className="flex justify-evenly px-6 flex-1">
                        {/* Video Controls Section */}
                        <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-6">Video Selection</span>
                            <div className="flex flex-col gap-6">
                                <button 
                                    onClick={() => { setAppMode('video_start'); setPlotlyDragMode(false); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'video_start' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-film text-2xl mb-3"></i>
                                    <span className="text-sm">Video Start</span>
                                </button>

                                <button
                                    onClick={() => { setAppMode('video_end'); setPlotlyDragMode(false); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'video_end' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-film text-2xl mb-3"></i>
                                    <span className="text-sm">Video End</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-px h-full bg-gray-200 my-4"></div>

                        {/* Signal Controls Section */}
                        <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-6">Signal Selection</span>
                            <div className="flex flex-col gap-6">
                                <button
                                    onClick={() => { setAppMode('signal_start'); setPlotlyDragMode(false); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'signal_start' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-wave-square text-2xl mb-3"></i>
                                    <span className="text-sm">Signal Start</span>
                                </button>

                                <button
                                    onClick={() => { setAppMode('signal_end'); setPlotlyDragMode(false); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'signal_end' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-wave-square text-2xl mb-3"></i>
                                    <span className="text-sm">Signal End</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-px h-full bg-gray-200 my-4"></div>

                        {/* Navigation Controls Section */}
                        <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-6">Signal Navigation</span>
                            <div className="flex flex-col gap-6">
                                <button
                                    onClick={() => { setPlotlyDragMode('zoom'); setAppMode('None'); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${dragMode === 'zoom' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-search-plus text-2xl mb-3"></i>
                                    <span className="text-sm">Zoom</span>
                                </button>

                                <button
                                    onClick={() => { setPlotlyDragMode('pan'); setAppMode('None'); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${dragMode === 'pan' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-hand-paper text-2xl mb-3"></i>
                                    <span className="text-sm">Pan</span>
                                </button>
                            </div>
                        </div>

                        <div className="w-px h-full bg-gray-200 my-4"></div>

                        {/* Utility Controls Section */}
                        <div className="bg-gray-50 p-4 rounded-2xl flex flex-col justify-center">
                            <span className="text-sm font-medium text-gray-600 text-center block mb-6">Tools</span>
                            <div className="flex flex-col gap-6">
                                <button 
                                    onClick={() => { setPlotlyDragMode(false); setAppMode('None'); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'None' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-mouse-pointer text-2xl mb-3"></i>
                                    <span className="text-sm">Pointer</span>
                                </button>

                                <button
                                    onClick={() => { setAppMode('delete'); setPlotlyDragMode(false); }}
                                    className={`h-28 w-44 flex flex-col items-center justify-center p-3 rounded-xl ${appMode === 'delete' ? 'bg-[#297DCB] text-white' : 'bg-white text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                                >
                                    <i className="fas fa-trash text-2xl mb-3"></i>
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
                        className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all shadow-lg hover:shadow-xl ${
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