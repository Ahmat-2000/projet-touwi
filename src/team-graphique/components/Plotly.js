import React from 'react';

const Plotly = () => {
    const data = [10, 20, 30, 40, 50]; // Example data

    return (
        <div style={{ width: '300px', height: '200px', border: '1px solid #ccc', padding: '10px' }}>
            <h3>Simple Bar Graph</h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%' }}>
                {data.map((value, index) => (
                    <div key={index} style={{ width: '30px', height: `${value * 3}px`, backgroundColor: '#4CAF50' }}>
                        <span style={{ fontSize: '12px', color: '#fff' }}>{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Plotly;
