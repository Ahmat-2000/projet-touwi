// StatusInput.js
"use client";

import React, { useState } from 'react';

function StatusInput({ id, onUpdateStatus, onRedSquareClick }) {
    const [inputText, setInputText] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [clicked, setClicked] = useState(false);

    const handleStatusUpdate = () => {
        setStatusMessage(inputText);
        onUpdateStatus(id, inputText); // Notify parent of new status and synchronize click info
    };

    const handleRedSquareClick = () => {
        setClicked(true);
        onRedSquareClick(id, inputText); // Notify parent of click event and status
    };

    return (
        <div style={{ border: '1px solid gray', padding: '10px', margin: '10px' }}>
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter a status message"
            />
            <button onClick={handleStatusUpdate}>Update Status</button>
            <p>Component {id} Status: {statusMessage}</p>

            <div
                onClick={handleRedSquareClick}
                style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: 'red',
                    cursor: 'pointer',
                    marginTop: '10px'
                }}
            ></div>

            {clicked && <p>Red square clicked!</p>}
        </div>
    );
}

export default StatusInput;
