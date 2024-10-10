"use client";

{/*
import Link from 'next/link';
import BaseApp from './team-graphes/components/BaseApp';
import PlotSignal from './team-graphes/components/PlotSignal';

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plotly.js Demo</h1>
      <PlotSignal />
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  description: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '20px',
  },
};
*/}

// App.js
import React, { useRef, useEffect } from 'react';
import PlotSignal from './team-graphes/components/PlotSignal';

const App = () => {
    const plotRef1 = useRef(null);
    const plotRef2 = useRef(null);

    const settings = {
        showticklabels: true,
        title: 'Sample Plot',
        shapes: [], // Array of shapes to display on the plot
        annotations: [], // Array of annotations
        margin: { t: 20, b: 40, l: 50, r: 20 }, // Margins of the plot
        data: {
            x: [1, 2, 3, 4],
            y: [10, 15, 13, 17]
        },
        plotRef: plotRef1 // Reference to the DOM element for the plot
    };

    const settings2 = {
      showticklabels: false,
      title: 'Sample Plot 2',
      shapes: [], // Array of shapes to display on the plot
      annotations: [], // Array of annotations
      margin: { t: 20, b: 40, l: 50, r: 20 }, // Margins of the plot
      data: {
          x: [ 7, 8, 9, 10],
          y: [ 20, 25, 23, 27]
      },
      plotRef: plotRef2 // Reference to the DOM element for the plot
  };

    useEffect(() => {
        // Call PlotSignal when the component mounts
        const cleanup = PlotSignal(settings);
        const cleanup2 = PlotSignal(settings2);

        // Cleanup when the component unmounts
        return () => {
            cleanup();
            cleanup2();
        };
    }, []);

    return (
        <div>
            <h1>Plot Example</h1>
            <div ref={plotRef1} style={{ width: '600px', height: '400px' }}></div>
            <div ref={plotRef2} style={{ width: '600px', height: '400px' }}></div>
        </div>
    );
};

export default App;
