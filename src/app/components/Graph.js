// Graph.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import Modal from 'react-modal';
import Plot from './Plot';

import { getRowWithTimestamp, periodUpdate, updateLabelByTimestamp } from '@/team-offline/outils';



const Graph = ({ propsData }) => {
    const [plots, setPlots] = useState([]);
    const [selections, setSelections] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('accel');
    const [selectedAxis, setSelectedAxis] = useState('x');
    const [plotFinished, setPlotFinished] = useState(false);
    const [showReloadButton, setShowReloadButton] = useState(true);

    const appModeRef = useRef(propsData.appMode);
    const [plotIndexColor, setPlotIndexColor] = useState(0);

    useEffect(() => {
        appModeRef.current = propsData.appMode;
    }, [propsData.appMode]);



    useEffect(() => {
        createPlot('accel', 'x', propsData.name);
    }, [propsData.name]);



    useEffect(() => {
        setPlots(prevPlots => {
            const referencePlot = propsData.plotList.current[0]?.current;
            if (!referencePlot) {
                return prevPlots;
            }

            const currentLayout = {
                shapes: referencePlot.layout.shapes,
                annotations: referencePlot.layout.annotations
            };

            return prevPlots.map(plot => 
                React.cloneElement(plot, {
                    propsData: {
                        ...plot.props.propsData,
                        customLabel: propsData.customLabel,
                        labelColor: propsData.labelColor,
                        shapes: currentLayout.shapes,
                        annotations: currentLayout.annotations
                    }
                })
            );
        });
    }, [propsData.customLabel, propsData.labelColor, propsData.plotList]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowReloadButton(false);
        }, 5000); // Button will disappear after 5 seconds

        return () => clearTimeout(timer);
    }, []);


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


    function handlePlotClick(eventData, labelText, labelTextColor) {
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
                    console.log(`Selected region: Start - ${xValue}`);
                    selections.push({ start: xValue, end: null });
                }
                else {
                    console.log(`Selected region: Start - ${selections[selections.length - 1].start}, End - ${xValue}`);
                    selections[selections.length - 1].end = xValue;
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
                        //console.log("Flag loaded at: ", i, labelName);
                    }

                    if (start !== null) {
                        if (columnLabels[i - 1].startsWith('PERIOD:')) {
                            const labelName = columnLabels[i - 1].slice(7);
                            //highlightRegion(start, i - 1, labelColor);
                            periodList.push([start, i - 1, labelName]);
                            //console.log("Period loaded at: ", start, i - 1, labelName, labelColor);
                            start = null;
                        }
                    }
                }
                else if (columnLabels[i].startsWith('PERIOD:')) {
                    if (start === null) { start = i; }

                    if (i === columnLabels.length - 1) {
                        const labelName = columnLabels[i - 1].slice(7);
                        //highlightRegion(start, i, labelColor);
                        periodList.push([start, i, labelName]);
                        //console.log("Period loaded at: ", start, i, labelName, labelColor);
                    }
                }

                else { console.error('Invalid label format: ', columnLabels[i]); }
            };

            console.log("Period list: ", periodList);

            const labels = [...new Set(periodList.map(period => period[2]))];  

            const colors = generateColors(labels.length);

            for (let i = 0; i < periodList.length; i++) {
                const periodColor = colors[labels.indexOf(periodList[i][2])];
                highlightRegion(periodList[i][0], periodList[i][1], periodColor);
                console.log("Highlighted: ", periodList[i][0], periodList[i][1], periodColor);
            }

            const buttonSetter = [];
            for (let i = 0; i < labels.length; i++) {
                buttonSetter.push([labels[i], colors[i]]);  
            }

            console.log("Button setter: ", buttonSetter);
            propsData.setLabelsList(buttonSetter);
        });
    }

    function generateColors(n){
        return Array(n).fill('#964B00');
    }

    function createPlot(sensor, axis, filename) {

        const bundle = getRowWithTimestamp(sensor, axis, propsData.name);

        bundle.then(result => {

            const timestamp = result[0];
            const data = result[1];

            const colors = [
                '#2E86C1',  // Strong Blue
                '#E74C3C',  // Soft Red
                '#27AE60',  // Forest Green
                '#8E44AD'   // Royal Purple
            ];

            const plotColor = colors[plotIndexColor % colors.length];
            setPlotIndexColor(plotIndexColor + 1);

            const props = {
                data: data,
                title: filename + ' ' + sensor.charAt(0).toUpperCase() + sensor.slice(1) + ' ' + axis.toUpperCase(),
                timestamp: Array.from({ length: data.length }, (_, i) => i),
                plotRefList: propsData.plotList.current,
                shapes: [],
                annotations: [],
                color: plotColor,
                appModeRef: appModeRef,
                handlePlotClick: handlePlotClick,
                handleRelayout: propsData.syncZoom,
                hover: handlePlotHover,
                customLabel: propsData.customLabel,
                labelColor: propsData.labelColor,
                deleteRegion: propsData.deleteRegion,
            };


            setPlots(prevPlots => [...prevPlots,
            <Plot key={props.title} propsData={props} />
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
            <div className="addPlot-container">
                <button onClick={handleOpenModal}>
                    Create Plot
                </button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                ariaHideApp={false}
                contentLabel="Choose Plot Type"
                style={{
                    overlay: {
                        zIndex: 1,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)'
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '20px',
                        borderRadius: '8px',
                        width: '300px',
                        textAlign: 'center',
                    }
                }}
            >
                <h2>Choose Signal Type</h2>
                <label>
                    Category:
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
                    >
                        <option value="accel">Accelerometer</option>
                        <option value="gyro">Gyroscope</option>
                    </select>
                </label>
                <br />
                <label>
                    Axis:
                    <select
                        value={selectedAxis}
                        onChange={(e) => setSelectedAxis(e.target.value)}
                        style={{ marginBottom: '20px', padding: '5px', width: '100%' }}
                    >
                        <option value="x">X</option>
                        <option value="y">Y</option>
                        <option value="z">Z</option>
                    </select>
                </label>
                <br />
                <button onClick={handleAddPlot} style={{ padding: '10px', backgroundColor: 'green', color: 'white', borderRadius: '5px' }}>
                    Add Plot
                </button>
                <button onClick={handleCloseModal} style={{ marginLeft: '10px', padding: '10px', backgroundColor: 'red', color: 'white', borderRadius: '5px' }}>
                    Cancel
                </button>
            </Modal>

            <div className="plot-container">
                {plots.map((plot, index) => (
                    <div key={index} className='Plot_fromMap'>
                        {plot}
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    plotContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 'auto',
        width: '100%',
        overflow: 'hidden'
    }
};

export default Graph;