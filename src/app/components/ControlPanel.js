// ControlPanel.js
"use client";

import React from 'react';
import Plotly from 'plotly.js-basic-dist-min';


const ControlPanel = ({ resetZoom, resetMode, resetEvents, voidPlots, plotList, setAppMode, setPlotlyDragMode, appMode, hasVideo }) => {
    

    return (
        <div>
            <div className="controls">

                {/* Signal Navigation */}
                <button onClick={() => { setPlotlyDragMode('zoom'); setAppMode('None'); }} className="control-button">Zoom</button>
                <button onClick={() => { setPlotlyDragMode('pan'); setAppMode('None'); }} className="control-button">Navigate</button>

                <br />

                { /* Actions */}

                <button onClick={() => { console.log(`Period add clicked`); setAppMode('period'); setPlotlyDragMode(false); }} className="control-button">Add Period</button>
                <button onClick={() => { setPlotlyDragMode(false); setAppMode('flag'); }} className="control-button" >Add Flag </button>

                {/* Delete Flag Button */}
                <button onClick={() => { setPlotlyDragMode(false); setAppMode('delete'); }} className="control-button">Delete</button>

                <button onClick={() => { resetZoom(); }} className="control-button">Home</button>
                {hasVideo && <button onClick={() => { resetMode(); }} className="control-button">Reset Mode</button>}

                <br />

                {/* Event clearing */}
                <button onClick={() => { resetEvents(); }} className="control-button">Delete All Periods/Flags</button>

                {/* Complete clear */}
                <button onClick={() => { voidPlots(); }} className="control-button">Clear All</button>

                {/* Dev mode, ensures plotlist is synced in ControlPanel */}
                <button onClick={() => console.log(plotList.current)} className="control-button">Log PlotList</button>

                {/* Video control*/}
                <button onClick={() => { setPlotlyDragMode(false); setAppMode('videoSync'); }} style={styles.button}>Video Sync</button>

                {/* Display current mode */}
                <span className="mode-indicator">Mode: {appMode}</span>

            </div>
        </div>
    );
};

export default ControlPanel;