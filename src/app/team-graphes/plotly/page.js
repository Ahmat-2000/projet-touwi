// app/team-graphes/plotly/page.js

"use client"; // Mark this component as a Client Component

import DemoPlotly from "../components/DemoPlotly";

export default function PlotlyPage() {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Plotly.js Demo</h1>
            <p style={styles.description}>
                This is an example of how <strong>Plotly.js</strong> can be used to display dynamic charts.
            </p>
            <DemoPlotly/>
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
