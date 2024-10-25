import React, { useEffect } from 'react';

const Plot = ({ data, plotRef, handlePlotClick, handleRelayout,mode, selections, setSelections, shapes, annotations}) => {

    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

        if (data) {
            // Initialize the Plotly chart
            Plotly.newPlot(plotRef.current, [data], {
                xaxis: { showticklabels: false },
                yaxis: { title: data.yaxisTitle || 'Signal' },
                shapes: shapes || [],  // Apply existing shapes (periods)
                annotations: annotations || [],  // Apply existing annotations (flags)
                margin: { t: 40, b: 20, l: 60, r: 20 }
            }, {
                displayModeBar: true,
                modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d'],
                displaylogo: false,
                doubleClick: false
            });

        }

        // Cleanup on unmount
        return () => {
            if (plotRef.current) {
                Plotly.purge(plotRef.current);
            }
        };
    }, [data]);

    // Effect to handle mode changes (add_period, add_flag, etc.)
    useEffect(() => {
        const Plotly = require('plotly.js/dist/plotly.js'); // Keep your import as is

        // Remove any previous event listeners before adding new ones
        const currentPlot = plotRef.current;

        if (currentPlot) {
            currentPlot.removeAllListeners('plotly_click');    // Clean previous 'plotly_click' listeners
            currentPlot.removeAllListeners('plotly_relayout'); // Clean previous 'plotly_relayout' listeners
        }

        // Add event listeners for plot interactions
        plotRef.current.on('plotly_click', handlePlotClick);
        plotRef.current.on('plotly_relayout', handleRelayout);

    }, [mode, handlePlotClick, handleRelayout]);
    return <div ref={plotRef} style={{ width: '95%', height: '400px' }} />;
};

export default Plot;
