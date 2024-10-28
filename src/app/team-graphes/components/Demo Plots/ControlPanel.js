// ControlPanel.js
import React from 'react';

const ControlPanel = ({ appMode, setAppMode, setPlotlyDragMode, resetZoom, resetMode, resetEvents, voidPlots, plotList }) => {

    return (
        <div style={styles.controls}>
            {/* Plotly drag modes */}
            <button onClick={() => setPlotlyDragMode('zoom')} style={styles.button}>Zoom</button>
            <button onClick={() => setPlotlyDragMode('pan')} style={styles.button}>Pan</button>
            <br />

            {/* App interaction modes */}
            <button onClick={() => {
                console.log(`Period add clicked`);
                setAppMode('period');
                setPlotlyDragMode(false);
            }} style={styles.button}>Add Period</button>

            <button onClick={() => {
                setAppMode('delete_period');
                setPlotlyDragMode(false);
            }} style={styles.button}>Delete Period</button>

            <button onClick={() => {
                setAppMode('flag');
                setPlotlyDragMode(false);
            }} style={styles.button}>Add Flag</button>

            {/* Delete Flag Button */}
            <button onClick={() => {
                setAppMode('delete_flag');
                setPlotlyDragMode(false);
            }} style={styles.button}>Delete Flag</button>

            <button onClick={() => {
                setPlotlyDragMode('zoom');
                resetZoom();
            }} style={styles.button}>Reset Zoom</button>

            <button onClick={resetMode} style={styles.button}>Reset Mode</button>
            <br />

            {/* Event clearing */}
            <button onClick={resetEvents} style={styles.button}>Delete All Periods/Flags</button>

            {/* Complete clear */}
            <button onClick={voidPlots} style={styles.button}>Clear All</button>

            {/* Dev mode, ensures plotlist is synced in ControlPanel */}
            <button onClick={() => console.log(plotList.current)} style={styles.button}>Log PlotList</button>

            {/* Display current mode */}
            <span className="mode-indicator" style={styles.modeIndicator}>appMode: {appMode}</span>
        </div>
    );
};

const styles = {
    controls: {
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#007BFF',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        transition: 'background-color 0.3s',
    },
    modeIndicator: {
        marginLeft: '10px',
        fontSize: '16px',
        color: '#333',
    }
};

export default ControlPanel;