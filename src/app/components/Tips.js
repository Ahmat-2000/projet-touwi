//Tips.js
import React, {useEffect, useState} from 'react';
import Image from 'next/image';

const Tips = ({imgPath}) => {
    const [display, setDisplay] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setDisplay(!display)}
                className={`bg-[#297DCB] text-white px-4 py-2 rounded-lg hover:bg-[#1e5b9c] transition-all duration-200 ${display ? 'bg-[#1e5b9c]' : ''}`}
            >
                ?
            </button>
            {display && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setDisplay(false)}
                >
                    <div 
                        className="relative rounded-lg shadow-xl max-w-[90vw] max-h-[90vh] border-8 border-[#e3ebfe] "
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setDisplay(false)}
                            className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition-all duration-200 z-10"
                        >
                            ×
                        </button>
                        <div className="relative w-full h-full overflow-auto">
                            <Image 
                                src={imgPath}
                                alt="App Usage Tips"
                                width={2500}
                                height={1000}
                                className="rounded-lg w-auto h-auto"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 'calc(90vh - 2rem)',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tips;