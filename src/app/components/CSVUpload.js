// CSVUpload.js
"use client";

import React from 'react';
import Plotly from 'plotly.js-basic-dist-min';

const CSVUpload = ({ parseCSV, error }) => {

    


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            parseCSV(file);
        }
    };

    return (
        <>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={styles.fileInput}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    );
};

const styles = {
    fileInput: {
        margin: '20px 0',
    },
};

export default CSVUpload;
