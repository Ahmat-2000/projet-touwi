// Graph.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
import Modal from 'react-modal';
import Plot from './Plot';

import { useVariablesContext } from '@/utils/VariablesContext';
import { getRowWithTimestamp,periodUpdate,updateLabelByTimestamp } from '@/team-offline/outils';


const Graph = ({ temporaryData, plotList, appMode, setAppMode, hasVideo, syncZoom, videoRef, highlightFlag, deleteRegion, name ,timestamps,setTimestamps,timestampRef}) => {
    const [plots, setPlots] = useState([]);
    const [selections, setSelections] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('accel');
    const [selectedAxis, setSelectedAxis] = useState('x');

    const appModeRef = useRef(appMode);

    useEffect(() => {
        appModeRef.current = appMode;
    }, [appMode]);

    useEffect(() => {
        createPlot('accel', 'x', name);
    }, []);
    

    //--------------------------------

    const handleOpenModal = () => {
        setIsModalOpen(true); // Ouvre la boîte modale
    };

    const handleCloseModal = () => {
        setIsModalOpen(false); // Ferme la boîte modale
    };

    const handleAddPlot = () => {
        const filename = name;
        createPlot(selectedCategory, selectedAxis, filename);
        setIsModalOpen(false); // Ferme la boîte modale après le choix
    };

    //--------------------------------


    function handlePlotClick(eventData) {
        const xValue = eventData.points[0].x;

        const currentAppMode = appModeRef.current;

        // When clicking a point in a plot, if we have a video, the video should jump to the corresponding timestamp
        if (currentAppMode === 'None') {
            if (hasVideo) {
                const video = videoRef.current;
                const videoDuration = video.duration; // Get video duration in seconds

                if (plotList.current[0].current === null) {
                    console.log('Removing deleted plot from list | code °3 ');
                    plotList.current = plotList.current.filter(ref => ref !== plotList.current[0]);
                }

                const signalLength = plotList.current[0].current.data[0].x.length; // Get signal length from plotly data

                // Convert signal index to video time using linear mapping
                const videoTime = (xValue / signalLength) * videoDuration;

                // Set video current time
                video.currentTime = videoTime;
            }
        }

        // Handle the different modes
        if (currentAppMode === 'delete') {
            deleteRegion(plotList, xValue, false);
        } else {
            if (currentAppMode === 'period') {
                if (selections.length === 0 || selections[selections.length - 1].end !== null) {
                    console.log(`Selected region: Start - ${xValue}`);
                    selections.push({ start: xValue, end: null });
                }
                else {
                    console.log(`Selected region: Start - ${selections[selections.length - 1].start}, End - ${xValue}`);
                    selections[selections.length - 1].end = xValue;
                    highlightRegion(selections[selections.length - 1].start, xValue);
                    periodUpdate(timestampRef.current[selections[selections.length - 1].start] ,timestampRef.current[xValue],"PERIOD",name);
                }
            }

            if (currentAppMode === 'flag') {
                console.log(`Flag added at x: ${xValue}`);
                highlightFlag(xValue, { width: 1, color: 'blue', dash: 'dashdot' }, 'Flag');
                updateLabelByTimestamp(timestampRef.current[xValue],"FLAG",name);
            }


        }
    };

    function highlightRegion(start, end) {
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
            fillcolor: 'rgba(255, 0, 0, 0.35)',
            line: {
                width: 0
            }
        };

        plotList.current.forEach(plotRef => {
            Plotly.relayout(plotRef.current, { shapes: [...plotRef.current.layout.shapes, shape] });
        });
    }

    function deletePlot(plotRef) {
        Plotly.delete(plotRef);
    }

    function handlePlotHover(eventData) {
        const xValue = eventData.points[0].x;
        console.log(`Hovering over x: ${xValue}`);
    };

    function test() {
        const res = getRowWithTimestamp('LABEL', '', name);
        res.then(result => {
            const labelColumn = result[1];
            console.log("test",labelColumn);

        });
    }

    function createPlot(sensor, axis, filename) {

        const bundle = getRowWithTimestamp(sensor, axis, name);

        bundle.then(result => {
    
            const timestamp = result[0];
            const data = result[1];

            setTimestamps(timestamp);

            const props = {
                data: data,
                title: filename + ' ' + sensor.charAt(0).toUpperCase() + sensor.slice(1) + ' ' + axis.toUpperCase(),
                timestamp: Array.from({ length: data.length }, (_, i) => i),
                handlePlotClick: (eventData) => handlePlotClick(eventData),
                hover: handlePlotHover,
                handleRelayout: syncZoom,
                plotRefList: plotList.current,
                shapes: [],
                annotations: [],
                appMode: appMode,
                timestampRef: timestampRef.current,
                timestamps: timestamps,
                setTimestamps: setTimestamps
            };


            setPlots(prevPlots => [...prevPlots,
            <Plot key={props.title} propsData={props} />
            ]);

        });
    }


    return (
        <div>
            <div className="addPlot-container">
                <button onClick={handleOpenModal}>
                    Create Plot
                </button>
                <button onClick={test}>Test</button>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={handleCloseModal}
                ariaHideApp={false}
                contentLabel="Choose Plot Type"
                style={{
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
                        textAlign: 'center'
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
                    <div key={index} style={{ marginTop: '20px' }}>
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