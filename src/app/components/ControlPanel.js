// ControlPanel.js
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { receiveExportFile } from '@/team-offline/requests';
import Image from 'next/image';


const ControlPanel = ({ propsControlPanel }) => {

    const [customButtons, setCustomButtons] = useState([]);                     //List of created buttons value/setter
    const [buttonText, setButtonText] = useState('');                           //Next created button text value/setter
    const [buttonSelectorColor, setButtonSelectorColor] = useState('#297DCB');  //Next created button color value/setter
    const [counter, setCounter] = useState(0);                                  //Counter for button key ID

    const inputRef = useRef(null);                                              //UseRef for input field 

    useEffect(() => {
        if (propsControlPanel.labelsList.length > 0) {                           //Reopen mode loading all existing periods corresponding buttons
            let index = 0;
            const newButtons = propsControlPanel.labelsList.map((label) => 
                handleRecreateButton(label[0], label[1], index++)
            );
            
            setCustomButtons(prevButtons => [...prevButtons, ...newButtons]);
            setCounter(index);
        }
    }, [propsControlPanel.labelsList]);
    
    useEffect(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => {
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    const handleCreateButton = () => {
        if (buttonText.trim()) {
            const newButton = {
                id: counter,
                text: buttonText.trim(),
                color: buttonSelectorColor
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
        propsControlPanel.setAppMode('period');
        propsControlPanel.setPlotlyDragMode(false);
        propsControlPanel.setCustomLabel(text);
        propsControlPanel.setLabelColor(color);
    };

    const handleKeydown = (event) => {
        if (event.target.tagName === 'INPUT') {
            return;
        }

        const charUpper = event.key.toUpperCase();
        switch (charUpper) {
            // Navigation modes
            case 'Z':
                propsControlPanel.setPlotlyDragMode('zoom');
                propsControlPanel.setAppMode('None');
                break;
            case 'P':
                propsControlPanel.setPlotlyDragMode('pan');
                propsControlPanel.setAppMode('None');
                break;

            // Action modes
            case 'F':
                propsControlPanel.setPlotlyDragMode(false);
                propsControlPanel.setAppMode('flag');
                break;
            case 'D':
                propsControlPanel.setPlotlyDragMode(false);
                propsControlPanel.setAppMode('delete');
                break;
            case 'DELETE':
                if (window.confirm('Are you sure you want to delete all periods and flags?')) {
                    propsControlPanel.resetEvents();
                }
                break

            // Reset/Home
            case 'H':
                propsControlPanel.resetZoom();
                propsControlPanel.setAppMode('Home');
                break;
            case 'R':
                propsControlPanel.setPlotlyDragMode(false);
                propsControlPanel.setAppMode('None');
                break;
        }
    };

    

    return (
        <div className="w-full bg-white rounded-xl shadow-md flex flex-col gap-3 box-border p-3">
            {/* First Row */}
            <div className="grid grid-cols-[20fr_60fr_20fr] gap-3 w-full">
                {/* Current Mode Display */}
                <div className="bg-gray-50 rounded-lg p-2.5 h-full flex flex-col">
                    <div className="flex flex-col justify-center items-center h-full gap-2">
                        <span className="text-sm font-semibold text-gray-600">Current Mode:</span>
                        <span 
                            className="px-4 py-2 rounded-md font-semibold min-w-20 text-center text-white"
                            style={{backgroundColor: propsControlPanel.appMode === 'period' ? propsControlPanel.labelColor : (propsControlPanel.appMode === 'delete' ? 'red' : '#297DCB')}}>
                            {propsControlPanel.appMode === 'period' ? `${propsControlPanel.appMode} - ${propsControlPanel.customLabel}` : propsControlPanel.appMode}
                        </span>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={ () => { propsControlPanel.resetZoom(); propsControlPanel.setAppMode('Home'); }}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg ${propsControlPanel.appMode === 'Home' ? 'bg-[#297DCB] text-white' : 'bg-gray-100 text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                            >
                                <i className="fas fa-home text-base"></i>
                                <span className="text-sm">Home</span>
                            </button>

                        <button
                            onClick={() => { propsControlPanel.setPlotlyDragMode(false); propsControlPanel.setAppMode('None'); }}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg ${propsControlPanel.appMode === 'None' ? 'bg-[#297DCB] text-white' : 'bg-gray-100 text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                        >
                            <i className="fas fa-mouse-pointer text-base"></i>
                            <span className="text-sm">Pointer</span>
                        </button>

                            <button
                                onClick={() => { propsControlPanel.setPlotlyDragMode(false); propsControlPanel.setAppMode('flag'); }}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg ${propsControlPanel.appMode === 'flag' ? 'bg-[#297DCB] text-white' : 'bg-gray-100 text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200`}
                            >
                                <i className="fas fa-flag text-base"></i>
                                <span className="text-sm">Add Flag</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-2.5 flex justify-center items-center">
                    <button className="w-4/5 h-15 flex flex-col items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-600 hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200" onClick={() => {
                        
                        try {
                            receiveExportFile(propsControlPanel.filename).then((data) => {
                                const url = URL.createObjectURL(data);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = propsControlPanel.filename;
                                link.click();
                                URL.revokeObjectURL(url);
                            });
                        } 
                        catch (error) {
                            console.error("Error exporting file:", error);
                        }

                    }}>
                        <i className="fas fa-file-export text-base"></i>
                        <span className="text-sm">Export</span>
                    </button>
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-[1fr_2fr_1fr] gap-3 w-full">
                {/* Navigation Section */}
                <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="grid grid-cols-2 gap-2 h-full">
                        <button
                            onClick={() => { propsControlPanel.setPlotlyDragMode('zoom'); propsControlPanel.setAppMode('None'); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg ${propsControlPanel.dragMode === 'zoom' ? 'bg-[#297DCB] text-white' : 'bg-gray-100 text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200 h-full`}
                        >
                            <i className="fas fa-search-plus text-base"></i>
                            <span className="text-sm">Zoom</span>
                        </button>
                        <button
                            onClick={() => { propsControlPanel.setPlotlyDragMode('pan'); propsControlPanel.setAppMode('None'); }}
                            className={`flex flex-col items-center justify-center p-3 rounded-lg ${propsControlPanel.dragMode === 'pan' ? 'bg-[#297DCB] text-white' : 'bg-gray-100 text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200 h-full`}
                        >
                            <i className="fas fa-hand-paper text-base"></i>
                            <span className="text-sm">Pan</span>
                        </button>
                    </div>
                </div>

                {/* Button Creator Section */}
                <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="h-full flex flex-col gap-2.5">
                        <div className="flex gap-2.5 items-center">
                            
                            <div className="flex flex-col items-center">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="color"
                                        value={buttonSelectorColor}
                                        onChange={(e) => setButtonSelectorColor(e.target.value)}
                                        className="w-10 h-10 rounded cursor-pointer hover:opacity-90 transition-opacity"
                                        title="Choose button color"
                                    />
                                    <Image 
                                        src="/images/colorPicker.png"
                                        alt="Color Picker"
                                        className="w-6 h-6 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                                        width={20}
                                        height={20}
                                    />
                                </div>
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                value={buttonText}
                                onChange={(e) => setButtonText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter button label"
                                className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-md focus:border-[#297DCB] focus:outline-none focus:ring-2 focus:ring-[#297DCB] focus:ring-opacity-20 text-sm"
                                style={{ color: buttonSelectorColor, fontWeight: 'bold' }}
                            />
                            
                            <button 
                                onClick={handleCreateButton} 
                                className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200"
                                style={{ backgroundColor: buttonSelectorColor, color: 'white' }}
                            >
                                <i className="fas fa-plus"></i>
                                Create Button
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2.5 max-h-[90px] overflow-y-auto pr-1.5 overflow-x-auto">
                            {customButtons.map((button) => (
                                <div key={button.id} className="flex-none">
                                    <button
                                        onClick={() => handleCustomButtonClick(button.text, button.color)}
                                        className="w-45 h-9 min-w-[150px] rounded-md font-semibold cursor-pointer transition-all flex justify-between items-center gap-1 px-2.5 py-1.5 overflow-hidden"
                                        style={{ backgroundColor: button.color }}
                                    >
                                        <span className="flex-1 text-left whitespace-nowrap overflow-x-auto overflow-y-hidden mr-1 max-w-[calc(100%-40px)] min-w-0 px-1 text-white">
                                            {button.text}
                                        </span>
                                        <span className="opacity-50 text-white px-1">|</span>
                                        <i
                                            className="fas fa-times flex-shrink-0 w-4 flex justify-center items-center text-white"
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

                {/* Delete Section */}
                <div className="bg-gray-50 rounded-lg p-2.5">
                    <div className="grid grid-cols-2 gap-2 h-full">
                        <button
                            onClick={() => { propsControlPanel.setPlotlyDragMode(false); propsControlPanel.setAppMode('delete'); }}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg ${propsControlPanel.appMode === 'delete' ? 'bg-[#297DCB] text-white' : 'bg-gray-100 text-gray-600'} hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-gray-200 h-full`}
                        >
                            <i className="fas fa-trash text-base"></i>
                            <span className="text-sm">Delete</span>
                        </button>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete all periods and flags?')) {
                                    propsControlPanel.resetEvents();
                                }
                            }}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:translate-y-[-2px] transition-all shadow hover:shadow-md border border-red-200 h-full"
                        >
                            <i className="fas fa-trash-alt text-base"></i>
                            <span className="text-sm">Clear All</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;