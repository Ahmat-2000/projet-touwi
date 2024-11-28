// Graph.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import Modal from 'react-modal';
import Plot from './Plot';
import VideoControls from './VideoControls';
import ControlPanel from './ControlPanel';
import Image from 'next/image';

import { getRowWithTimestamp, periodUpdate, updateLabelByTimestamp } from '@/team-offline/outils';



const Graph = ({ propsData }) => {
    const [plots, setPlots] = useState([]);                             //Plots dom list value/setter

    const [isModalOpen, setIsModalOpen] = useState(false);              //Modal (create plot form) handling value/setter
    const [selectedCategory, setSelectedCategory] = useState('accel');  //Modal sensor type value/setter
    const [selectedAxis, setSelectedAxis] = useState('x');              //Modal axis type value/setter
    const [plotFinished, setPlotFinished] = useState(false);            //Default first plot init check value/setter
    const [customLabel, setCustomLabel] = useState('defaultLabel');     //Next period label text value/setter
    const [labelColor, setLabelColor] = useState('grey');               //Next period label color value/setter
    const [keyCounter, setKeyCounter] = useState(0);                    //Counter for Plot key ID
    const [plotIndexColor, setPlotIndexColor] = useState(0);            //Counter for next plot color
    
    //When App is Reopen:
    const [labelsList, setLabelsList] = useState([]);                   //List of retrieved periods : [periodName, periodColor]

    const dragModeRef = useRef(propsData.dragMode);                     //Dragmode UseRef to force update in Plot.js
    const appModeRef = useRef(propsData.appMode);                       //App mode UseRef to force update in Plot.js

    let selections = [];                                                //Click list

    useEffect(() => {                                                   //Listen to appMode change
        appModeRef.current = propsData.appMode;                         //Update appModeRef to the change
    }, [propsData.appMode]);

    useEffect(() => {                                                   //Listen to dragMode change
        dragModeRef.current = propsData.dragMode;                       //Update dragModeRef to the change
    }, [propsData.dragMode]);

    useEffect(() => {                                                   //Create default plot : Accelerometer X
        createPlot('accel', 'x', propsData.name);
    }, []);

    useEffect(() => {                                                   //Update next label(text and color) for each plot when changing
        propsData.plotList.current.forEach(plotRef => {
            plotRef.current.setAttribute('data-label-color', labelColor);
            plotRef.current.setAttribute('data-custom-label', customLabel);
        });
    }, [labelColor, setLabelColor, customLabel, setCustomLabel]);

    function clearDiv(keyNumber) {
        setPlots(prevPlots => {
            const newPlots = prevPlots.filter(plot => String(plot.key) !== String(keyNumber));
            console.log(`Plot ${keyNumber} removed. Remaining plots: ${newPlots.length}`);
            return newPlots;
        });
    }

    //--------------------------------

    const handleOpenModal = () => {
        setIsModalOpen(true); // Ouvre la boîte modale
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Ferme la boîte modale
    };

    const handleAddPlot = () => {
        createPlot(selectedCategory, selectedAxis, propsData.name);
        setIsModalOpen(false); // Ferme la boîte modale après le choix
    };

    //--------------------------------


    function handlePlotClick(eventData) {
        const xValue = eventData.points[0].x;

        const currentAppMode = appModeRef.current;

        // When clicking a point in a plot, if we have a video, the video should jump to the corresponding timestamp
        if (currentAppMode === 'None') {
            if (propsData.hasVideo) {
                const video = propsData.videoRef.current;
                const videoDuration = video.duration; // Get video duration in seconds

                if (propsData.plotList.current[0].current === null) {
                    console.log('Removing deleted plot from list | code °3 ');
                    propsData.plotList.current = propsData.plotList.current.filter(ref => ref !== propsData.plotList.current[0]);
                }

                const signalLength = propsData.plotList.current[0].current.data[0].x.length; // Get signal length from plotly data

                // Convert signal index to video time using linear mapping
                const videoTime = (xValue / signalLength) * videoDuration;

                // Set video current time
                video.currentTime = videoTime;
            }
        }

        // Handle the different modes
        if (currentAppMode === 'delete') {
            propsData.deleteRegion(propsData.plotList, xValue, false);
        } else {
            if (currentAppMode === 'period') {
                if (selections.length === 0 || selections[selections.length - 1].end !== null) {
                    console.log(`New period: Start - ${xValue}, End - ?`);
                    selections.push({ start: xValue, end: null });
                }
                else {
                    console.log(`New period: Start - ${selections[selections.length - 1].start}, End - ${xValue}`);
                    
                    selections[selections.length - 1].end = xValue;

                    const referencePlot = propsData.plotList.current[0].current;
                    const labelText = referencePlot.getAttribute('data-custom-label');
                    const labelTextColor = referencePlot.getAttribute('data-label-color');

                    highlightRegion(selections[selections.length - 1].start, xValue, labelTextColor);
                    const labelName = "PERIOD:" + labelText;
                    periodUpdate(propsData.timestampRef.current[selections[selections.length - 1].start], propsData.timestampRef.current[xValue], labelName, propsData.name);
                }
            }

            if (currentAppMode === 'flag') {
                const flagText = prompt("Enter flag text:");
                if (flagText) {
                    const flagLabel = "FLAG:" + flagText;
                    propsData.highlightFlag(xValue, { width: 1, color: 'blue', dash: 'dashdot' }, flagText);
                    updateLabelByTimestamp(propsData.timestampRef.current[xValue], flagLabel, propsData.name);
                    console.log(`Flag added at x: ${xValue} : ${flagText}`);
                }
            }


        }
    };

    function highlightRegion(start, end, color) {
        if (start > end) {
            [start, end] = [end, start];
        }

        const shape = {
            type: 'rect',
            x0: start,
            x1: end,
            y0: 0,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            fillcolor: color,
            opacity: 0.5,
            line: {
                width: 0
            }
        };

        propsData.plotList.current.forEach(plotRef => {
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape] });
        });
    }

    function handlePlotHover(eventData) {
        const xValue = eventData.points[0].x;
        console.log(`Hovering over x: ${xValue}`);
    };

    function reload_labels() {
        const res = getRowWithTimestamp('LABEL', '', propsData.name);
        res.then(result => {
            const columnLabels = result[1];

            let start = null;
            const periodList = [];

            for (let i = 0; i < columnLabels.length; i++) {
                if (!columnLabels[i].startsWith('PERIOD:')) {

                    if (columnLabels[i].startsWith('FLAG:')) {
                        const labelName = columnLabels[i].slice(5); // Extract random string after 'FLAG:'
                        propsData.highlightFlag(i, { width: 1, color: 'blue', dash: 'dashdot' }, labelName);
                    }

                    if (start !== null) {
                        if (columnLabels[i - 1].startsWith('PERIOD:')) {
                            const labelName = columnLabels[i - 1].slice(7);
                            periodList.push([start, i - 1, labelName]);
                            start = null;
                        }
                    }
                }
                else if (columnLabels[i].startsWith('PERIOD:')) {
                    if (start === null) { start = i; }

                    if (i === columnLabels.length - 1) {
                        const labelName = columnLabels[i - 1].slice(7);
                        periodList.push([start, i, labelName]);
                    }
                }

                else { console.error('Invalid label format: ', columnLabels[i]); }
            };

            const labels = [...new Set(periodList.map(period => period[2]))];  
            const colors = generateColors(labels.length);

            for (let i = 0; i < periodList.length; i++) {
                const periodColor = colors[labels.indexOf(periodList[i][2])];
                highlightRegion(periodList[i][0], periodList[i][1], periodColor);
            }

            const buttonSetter = [];
            for (let i = 0; i < labels.length; i++) {
                buttonSetter.push([labels[i], colors[i]]);  
            }
            setLabelsList(buttonSetter);
        });
    }

    function generateColors(n){
        const split = 360 / n;
        const colors = [];
        for (let i = 0; i < n; i++) {
            colors.push('#' + hsvToHex(i * split, 100, 70));
        }
        return colors;
    }

    function hsvToHex(h, s, v) {
        var convert = require('color-convert');
        return convert.hsv.hex(h, s, v);
    }

    function createPlot(sensor, axis, filename) {

        const bundle = getRowWithTimestamp(sensor, axis, propsData.name);

        bundle.then(result => {

            const timestamp = result[0];
            const data = result[1];

            const colors = [                    //Color loop for plots signals colors
                '#2E86C1',  // Strong Blue
                '#E74C3C',  // Soft Red
                '#27AE60',  // Forest Green
                '#8E44AD'   // Royal Purple
            ];

            const plotColor = colors[plotIndexColor % colors.length];
            setPlotIndexColor(plotIndexColor + 1);

            const keyID = keyCounter;
            setKeyCounter(keyCounter + 1);

            const props = {
                data: data,
                keyID: keyID,
                title: filename + ' ' + sensor.charAt(0).toUpperCase() + sensor.slice(1) + ' ' + axis.toUpperCase(),
                timestamp: Array.from({ length: data.length }, (_, i) => i),
                plotRefList: propsData.plotList.current,
                shapes: [],
                annotations: [],
                color: plotColor,
                dragModeRef: dragModeRef,
                appModeRef: appModeRef,
                handlePlotClick: handlePlotClick,
                handleRelayout: propsData.syncZoom,
                hover: handlePlotHover,
                customLabel: customLabel,
                labelColor: labelColor,
                deleteRegion: propsData.deleteRegion,
                clearDiv: clearDiv,
            };


            setPlots(prevPlots => [...prevPlots,
                <Plot key={keyID} propsData={props} />
            ]);

            if (!plotFinished) {
                propsData.timestampRef.current = timestamp;
                setPlotFinished(true);
                if (propsData.isReopen) {
                    reload_labels();
                }
            }
        });
    }

    return (
        <div>
            <div className="w-full flex mb-4">
                {propsData.hasVideo && (
                    /*
                        <div className="bg-white p-4 rounded-xl shadow-md m-4 w-[80vh]">
                        */
                    <div>
                        <VideoControls propsVideoControls={{
                            video: propsData.video,
                            plotList: propsData.plotList,
                            syncZoom: propsData.syncZoom,
                            videoRef: propsData.videoRef,
                            highlightFlag: propsData.highlightFlag,
                            deleteRegion: propsData.deleteRegion,
                            syncEnabled: propsData.syncEnabled,
                            setSyncEnabled: propsData.setSyncEnabled
                        }} />
                    </div>
                )}
                <div className="w-full h-full p-3 bg-white rounded-xl shadow-md flex flex-col gap-3 box-border mt-4 mx-2">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold text-gray-800">Chronos Signal Labeling WebApp</h2>
                        <div>
                            <Image src="/images/temp_logo.png" alt="Chronos Logo" width={100} height={100} />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <button 
                                    onClick={handleOpenModal}
                                    className="bg-[#297DCB] text-white px-5 py-2.5 rounded-lg font-semibold cursor-pointer transition-all duration-200 hover:bg-[#1e5b9c] hover:shadow-lg flex items-center gap-2 group-hover:translate-y-[-2px]"
                                >
                                    <i className="fas fa-plus-circle"></i>
                                    <span>Add Signal</span>
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                    Create new plot visualization
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-gray-200"></div>
                            <span className="text-sm text-gray-500">
                                {plots.length} signal{plots.length !== 1 ? 's' : ''} displayed
                            </span>
                        </div>
                    </div>
                    
                    <ControlPanel
                        propsControlPanel={{
                            appMode: propsData.appMode,
                            resetZoom: propsData.resetZoom,
                            resetEvents: propsData.resetEvents,
                            voidPlots: propsData.voidPlots,
                            setAppMode: propsData.setAppMode,
                            setPlotlyDragMode: propsData.setPlotlyDragMode,
                            customLabel: customLabel,
                            setCustomLabel: setCustomLabel,
                            labelColor: labelColor,
                            setLabelColor: setLabelColor,
                            labelsList: labelsList,
                        }}
                    />
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                ariaHideApp={false}
                contentLabel="Choose Plot Type"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg w-[300px] text-center"
                overlayClassName="fixed inset-0 bg-black/75 z-10"
            >
                <h2 className="text-xl font-bold mb-4">Choose Signal Type</h2>
                <label className="block mb-4">
                    Sensor :
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="mt-2 mb-2.5 p-1.5 w-full border rounded"
                    >
                        <option value="accel">Accelerometer</option>
                        <option value="gyro">Gyroscope</option>
                    </select>
                </label>
                <label className="block mb-4">
                    Axis :
                    <select
                        value={selectedAxis}
                        onChange={(e) => setSelectedAxis(e.target.value)}
                        className="mt-2 mb-5 p-1.5 w-full border rounded"
                    >
                        <option value="x">X</option>
                        <option value="y">Y</option>
                        <option value="z">Z</option>
                    </select>
                </label>
                <div className="flex gap-2.5 justify-center">
                    <button 
                        onClick={handleAddPlot}
                        className="px-2.5 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                        Add Plot
                    </button>
                    <button 
                        onClick={handleCloseModal}
                        className="px-2.5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            <div className="flex flex-col items-center w-full">
                {plots.map((plot) => (
                    <div key={plot.key} className="mt-1 flex flex-col w-full">
                        {plot}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Graph;