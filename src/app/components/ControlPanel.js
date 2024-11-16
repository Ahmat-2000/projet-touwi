// ControlPanel.js
"use client";

import React from 'react';
import Plotly from 'plotly.js-basic-dist-min';


const ControlPanel = ({ resetZoom, resetMode, resetEvents, voidPlots, plotList, setAppMode, setPlotlyDragMode, appMode, hasVideo }) => {
    return (
        <div className="control-panel">
            <div className="control-panel-header">
                <h3 className="group-title">Current Mode:</h3>
                <span className="mode-value">{appMode}</span>
            </div>
            
            <div className="control-group">
                <div className="button-grid-expanded">
                    <button
                        onClick={() => { setPlotlyDragMode('zoom'); setAppMode('zoom'); }}
                        className={`control-button ${appMode === 'zoom' ? 'active' : ''}`}
                        data-active={appMode === 'zoom'}
                    >
                        <i className="fas fa-search-plus"></i>
                        <span>Zoom</span>
                    </button>
                    <button
                        onClick={() => { setPlotlyDragMode('pan'); setAppMode('pan'); }}
                        className={`control-button ${appMode === 'pan' ? 'active' : ''}`}
                        data-active={appMode === 'pan'}
                    >
                        <i className="fas fa-hand-paper"></i>
                        <span>Pan</span>
                    </button>
                    <button
                        onClick={resetZoom}
                        className="control-button"
                    >
                        <i className="fas fa-home"></i>
                        <span>Reset View</span>
                    </button>
                    <button
                        onClick={() => { setAppMode('period'); setPlotlyDragMode(false); }}
                        className={`control-button ${appMode === 'period' ? 'active' : ''}`}
                        data-active={appMode === 'period'}
                    >
                        <i className="fas fa-arrows-alt-h"></i>
                        <span>Add Period</span>
                    </button>
                    <button
                        onClick={() => { setPlotlyDragMode(false); setAppMode('flag'); }}
                        className={`control-button ${appMode === 'flag' ? 'active' : ''}`}
                        data-active={appMode === 'flag'}
                    >
                        <i className="fas fa-flag"></i>
                        <span>Add Flag</span>
                    </button>
                    <button
                        onClick={() => { setPlotlyDragMode(false); setAppMode('delete'); }}
                        className={`control-button ${appMode === 'delete' ? 'active' : ''}`}
                        data-active={appMode === 'delete'}
                    >
                        <i className="fas fa-trash"></i>
                        <span>Delete</span>
                    </button>
                    <button
                        onClick={() => { setPlotlyDragMode(false); setAppMode('None'); }}
                        className={`control-button ${appMode === 'None' ? 'active' : ''}`}
                        data-active={appMode === 'None'}
                    >
                        <i className="fas fa-mouse-pointer"></i>
                        <span>None</span>
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('Are you sure you want to delete all periods and flags?')) {
                                resetEvents();
                            }
                        }}
                        className="control-button danger"
                    >
                        <i className="fas fa-trash-alt"></i>
                        <span>Clear All</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;