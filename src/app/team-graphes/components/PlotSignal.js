
const PlotSignal = (settings) => {

    const Plotly = require('plotly.js-dist');

    const layout_plot = {
        xaxis: { showticklabels: settings.showticklabels },
        yaxis: { title: settings.title },
        shapes: settings.shapes,
        annotations: settings.annotations,
        margin: settings.margin
    };

    const data = [
        {
            x: settings.data.x, // x-axis values
            y: settings.data.y, // y-axis values
            type: 'scatter', // type of chart (scatter for line graph)
        },
    ];

    const config = {
        displayModeBar: true,
        modeBarButtonsToRemove: ['zoom', 'pan', 'toImage', 'sendDataToCloud', 'autoScale2d', 'resetScale2d' ],
        displaylogo: false,
        doubleClick: false
    };

    Plotly.newPlot(settings.plotRef.current, data, layout_plot, config);

    return () => {
        console.log('Return PlotSignal');
        
    }
}

export default PlotSignal;

