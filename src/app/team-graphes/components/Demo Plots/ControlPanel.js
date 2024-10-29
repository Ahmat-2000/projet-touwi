// ControlPanel.js
import React from 'react';



const ControlPanel = ({ resetZoom, resetMode, resetEvents, voidPlots, plotList, setAppMode, setPlotlyDragMode, appMode, plotlyMode }) => {

    return (
        <div style={styles.controls}>
            
            {/* Signal Navigation */}
            <button onClick={() => { setPlotlyDragMode('zoom'); setAppMode('None'); }} style={styles.button}>Zoom</button>
            <button onClick={() => setPlotlyDragMode('pan')  /* ;setAppMode('None'); */ } style={styles.button}>Pan</button>

            <br />

            { /* Actions */ }

            <button onClick={() => { console.log(`Period add clicked`); setAppMode('period'); setPlotlyDragMode(false); }} style={styles.button}>Add Period</button>
            {/* <button onClick={() => { setPlotlyDragMode(false); setAppMode('period'); }} style={styles.button} >Add Period </button> */}
            <button onClick={() => { setPlotlyDragMode(false); setAppMode('flag');   }} style={styles.button} >Add Flag </button>

            {/* Delete Flag Button */}
            <button onClick={() => { setPlotlyDragMode(false); setAppMode('delete'); }} style={styles.button}>Delete</button>

            <button onClick={() => { resetZoom(); }} style={styles.button}>Reset Zoom</button>
            <button onClick={() => { resetMode(); }} style={styles.button}>Reset Mode</button>

            <br />

            {/* Event clearing */}
            <button onClick={() => { resetEvents(); }} style={styles.button}>Delete All Periods/Flags</button>

            {/* Complete clear */}
            <button onClick={() => { voidPlots(); }} style={styles.button}>Clear All</button>

            {/* Dev mode, ensures plotlist is synced in ControlPanel */}
            <button onClick={() => console.log(plotList.current)} style={styles.button}>Log PlotList</button>

            {/* Display current mode */}
            <span className="mode-indicator" style={styles.modeIndicator}>Mode :{appMode} </span>
            <span className="mode-indicator" style={styles.modeIndicator}>Plotly Mode :{plotlyMode} </span>

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