import MyGraph from '../components/Plotly'; // Import MyGraph component

const GraphPage = () => {
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Graph Page</h1>
            <MyGraph /> {/* Render the MyGraph component */}
        </div>
    );
};

export default GraphPage; // Export the GraphPage component
