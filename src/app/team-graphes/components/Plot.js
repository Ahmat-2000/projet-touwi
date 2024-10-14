import React, { useEffect } from 'react';

const Plot = ({ data, plotRef, handlePlotClick, handleRelayout, selections, setSelections, shapes, annotations}) => {

    useEffect(() => {
        console.log("period added succesfuly")

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

            // Add event listeners for plot interactions
            plotRef.current.on('plotly_click', handlePlotClick);
            plotRef.current.on('plotly_relayout', handleRelayout);
        }

        // Cleanup on unmount
        return () => {
            if (plotRef.current) {
                Plotly.purge(plotRef.current);
            }
        };
    }, [data, plotRef, handlePlotClick, handleRelayout, selections, setSelections]);

    return <div ref={plotRef} style={{ width: '95%', height: '400px' }} />;
};

export default Plot;
