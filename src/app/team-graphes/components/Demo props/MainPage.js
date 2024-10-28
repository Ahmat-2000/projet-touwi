// MainPage.js
"use client";

import React, { useState } from 'react';
import StatusInput from './StatusInput';

function MainPage() {
  const [allStatuses, setAllStatuses] = useState({});
  const [lastClicked, setLastClicked] = useState({ id: null, status: '' });

  // Updates both the status and the latest clicked component
  const handleStatusUpdate = (componentId, newStatus) => {
    setAllStatuses((prevStatuses) => ({
      ...prevStatuses,
      [componentId]: newStatus,
    }));
    setLastClicked({ id: componentId, status: newStatus }); // Synchronize lastClicked
  };

  // Updates the latest clicked component info without changing its status
  const handleRedSquareClick = (componentId, status) => {
    setLastClicked({ id: componentId, status });
  };

  return (
    <div>
      <h1>Component Status Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Statuses of All Components:</h2>
        {Object.entries(allStatuses).map(([id, status]) => (
          <p key={id}>Component {id}: {status}</p>
        ))}
      </div>

      {/* Display the most recent clicked component with its status */}
      {lastClicked.id !== null && (
        <div style={{ marginBottom: '20px', color: 'blue' }}>
          <h2>Last Clicked Component:</h2>
          <p>Component {lastClicked.id} clicked with status: {lastClicked.status}</p>
        </div>
      )}

      {/* Render three StatusInput components with unique IDs */}
      {[1, 2, 3].map((id) => (
        <StatusInput
          key={id}
          id={id}
          onUpdateStatus={handleStatusUpdate}
          onRedSquareClick={handleRedSquareClick}
        />
      ))}
    </div>
  );
}

export default MainPage;
