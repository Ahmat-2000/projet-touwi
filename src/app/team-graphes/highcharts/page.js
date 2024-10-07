// app/team-graphes/highcharts/page.js

"use client"; // Mark this component as a Client Component

export default function HighchartsPage() {
    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Highcharts.js Demo</h1>
            <p style={styles.description}>
                This is an example of how <strong>Highcharts.js</strong> can be used to display dynamic charts.
            </p>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9', // Optional: Add a background color for contrast
        minHeight: '100vh', // Ensure full height coverage
    },
    title: {
        fontSize: '48px', // Increased font size for the title
        fontWeight: 'bold', // Make the title bold
        color: '#333', // Optional: Set a color for better visibility
        marginBottom: '20px', // Spacing below the title
    },
    description: {
        fontSize: '24px', // Increased font size for the description
        fontWeight: 'bold', // Make the description bold
        color: '#555', // Optional: Set a color for better visibility
        marginBottom: '20px', // Spacing below the description
    },
};
