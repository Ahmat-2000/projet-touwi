// ControlPanel.js
import React from 'react';

const ControlPanel = ({ mode, setAppMode, setPlotlyDragMode, resetMode, resetEvents, voidPlots }) => {

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
                setAppMode('delete');
                setPlotlyDragMode(false);
            }} style={styles.button}>Delete Period</button>

            <button onClick={() => {
                setAppMode('flag');
                setPlotlyDragMode(false);
                }} style={styles.button}>Add Flag</button>
            <button onClick={resetMode} style={styles.button}>Reset Mode</button>
            <br />
            
            {/* Event clearing */}
            <button onClick={resetEvents} style={styles.button}>Delete All Periods/Flags</button>
            
            {/* Complete clear */}
            <button onClick={voidPlots} style={styles.button}>Clear All</button>
            
            {/* Display current mode */}
            <span className="mode-indicator" style={styles.modeIndicator}>Mode: {mode}</span>
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
