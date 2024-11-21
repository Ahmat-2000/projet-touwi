// ControlPanel.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Plotly from 'plotly.js-basic-dist-min';
const ControlPanel = ({ propsControlPanel }) => {
    const [buttonText, setButtonText] = useState('');
    const [customButtons, setCustomButtons] = useState([]);
    const [counter, setCounter] = useState(0);
    const [selectedColor, setSelectedColor] = useState('#297DCB'); // Default blue color

    const inputRef = useRef(null);

    useEffect(() => {
        if (propsControlPanel.labelsList.length > 0) {
            // Create all new buttons at once
            let index = 0;
            const newButtons = propsControlPanel.labelsList.map((label) => 
                handleRecreateButton(label[0], label[1], index++)
            );
            
            // Update state once with all new buttons
            setCustomButtons(prevButtons => [...prevButtons, ...newButtons]);
            setButtonText('');
            inputRef.current?.focus();
            setCounter(index);
        }
    }, [propsControlPanel.labelsList]);
    
    const handleCreateButton = () => {
        if (buttonText.trim()) {
            const newButton = {
                id: counter,
                text: buttonText.trim(),
                color: selectedColor
            };
            setCounter(counter + 1);
            setCustomButtons([...customButtons, newButton]);
            setButtonText('');
            inputRef.current?.focus();
        }
    };

    const handleRecreateButton = (text, color, index) => {
        const newButton = {
            id: index,
            text: text,
            color: color
        };
        return newButton;
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCreateButton();
        }
    };

    const handleDeleteButton = (id) => {
        setCustomButtons(customButtons.filter(button => button.id !== id));
    };

    const handleCustomButtonClick = (text, color) => {
        console.log(`Period label set to: ${text} with color: ${color}`);
        propsControlPanel.setAppMode('period');
        propsControlPanel.setPlotlyDragMode(false);
        propsControlPanel.setCustomLabel(text);
        propsControlPanel.setLabelColor(color);
    };

    return (
        <div className="control-panel">
            {/* First Row */}
            <div className="control-row">
                <div className="mode-indicator-section">
                    <div className="mode-indicator">
                        <span className="mode-label">Current Mode:</span>
                        <span 
                            className="mode-value" 
                            style={{backgroundColor: propsControlPanel.appMode === 'period' ? propsControlPanel.labelColor : (propsControlPanel.appMode === 'delete' ? 'red' : '#297DCB')}}>
                            {propsControlPanel.appMode === 'period' ? `${propsControlPanel.appMode} - ${propsControlPanel.customLabel}` : propsControlPanel.appMode}
                        </span>
                    </div>
                </div>

                <div className="create-section">
                    <div className="control-section">
                        <div className="button-grid">
                            <button
                                onClick={propsControlPanel.resetZoom}
                                className="control-button"
                            >
                                <i className="fas fa-home"></i>
                                <span>Home</span>
                            </button>
                            <button
                                onClick={() => { propsControlPanel.setPlotlyDragMode(false); propsControlPanel.setAppMode('None'); }}
                                className={`control-button ${propsControlPanel.appMode === 'None' ? 'active' : ''}`}
                                data-active={propsControlPanel.appMode === 'None'}
                            >
                                <i className="fas fa-mouse-pointer"></i>
                                <span>None</span>
                            </button>
                            {/*
                            <button
                                onClick={() => { propsControlPanel.setAppMode('period'); propsControlPanel.setPlotlyDragMode(false); }}
                                className={`control-button ${propsControlPanel.appMode === 'period' ? 'active' : ''}`}
                                data-active={propsControlPanel.appMode === 'period'}
                            >
                                <i className="fas fa-arrows-alt-h"></i>
                                <span>Add Period</span>
                            </button>
                            */}
                            <button
                                onClick={() => { propsControlPanel.setPlotlyDragMode(false); propsControlPanel.setAppMode('flag'); }}
                                className={`control-button ${propsControlPanel.appMode === 'flag' ? 'active' : ''}`}
                                data-active={propsControlPanel.appMode === 'flag'}
                            >
                                <i className="fas fa-flag"></i>
                                <span>Add Flag</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="export-section">
                    <button className="control-button export" onClick={() => alert('Exporting not implemented yet') }>
                        <i className="fas fa-file-export"></i>
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Second Row */}
            <div className="control-row">
                <div className="navigate-section">
                    <div className="control-section">
                        <div className="button-grid">
                            <button
                                onClick={() => { propsControlPanel.setPlotlyDragMode('zoom'); propsControlPanel.setAppMode('zoom'); }}
                                className={`control-button ${propsControlPanel.appMode === 'zoom' ? 'active' : ''}`}
                                data-active={propsControlPanel.appMode === 'zoom'}
                            >
                                <i className="fas fa-search-plus"></i>
                                <span>Zoom</span>
                            </button>
                            <button
                                onClick={() => { propsControlPanel.setPlotlyDragMode('pan'); propsControlPanel.setAppMode('pan'); }}
                                className={`control-button ${propsControlPanel.appMode === 'pan' ? 'active' : ''}`}
                                data-active={propsControlPanel.appMode === 'pan'}
                            >
                                <i className="fas fa-hand-paper"></i>
                                <span>Pan</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="button-creator-section">
                    <div className="button-creator">
                        <div className="input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter button label"
                                className="button-input"
                            />
                            <input
                                type="color"
                                value={selectedColor}
                                onChange={(e) => setSelectedColor(e.target.value)}
                                className="color-picker"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    padding: '0',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            />
                            <button onClick={handleCreateButton} className="create-button">
                                <i className="fas fa-plus"></i>
                                Create Button
                            </button>
                        </div>

                        <div className="custom-buttons-container">
                            {customButtons.map((button) => (
                                <div key={button.id} className="custom-button-wrapper">
                                    <button
                                        onClick={() => handleCustomButtonClick(button.text, button.color)}
                                        className="custom-button"
                                        style={{ backgroundColor: button.color }}
                                    >
                                        <span className="button-content">{button.text}</span>
                                        <span className="separator">|</span>
                                        <i
                                            className="fas fa-times delete-icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteButton(button.id);
                                            }}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="delete-section">
                    <div className="control-section">
                        <div className="button-grid">
                            <button
                                onClick={() => { propsControlPanel.setPlotlyDragMode(false); propsControlPanel.setAppMode('delete'); }}
                                className={`control-button ${propsControlPanel.appMode === 'delete' ? 'active' : ''}`}
                                data-active={propsControlPanel.appMode === 'delete'}
                            >
                                <i className="fas fa-trash"></i>
                                <span>Delete</span>
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete all periods and flags?')) {
                                        propsControlPanel.resetEvents();
                                    }
                                }}
                                className="control-button danger"
                            >
                                <i className="fas fa-trash-alt"></i>
                                <span>Clear All</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;