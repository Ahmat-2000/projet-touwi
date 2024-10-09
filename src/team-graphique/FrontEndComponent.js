import React from 'react';

const FrontEndComponent = () => {
  return (
    <div className="min-h-screen bg-body p-6 relative">
      {/* Header section */}
      <div className="flex justify-between items-start">
        {/* Logo and text */}
        <div className="flex items-center space-x-2">
          <img src="/images/logo.png" alt="Logo" className="w-12 h-12" />
          <span className="text-2xl font-bold">Logo</span>
        </div>

        {/* Buttons on the right (responsive behavior) */}
        <div className="space-x-2 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
          <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white px-4 py-2 rounded">Flag</button>
          <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white px-4 py-2 rounded">Event</button>
          <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white px-4 py-2 rounded">Sync</button>
        </div>
      </div>

      {/* Images in the middle of the page, vertically aligned */}
      <div className="flex flex-col items-center mt-12 w-4.5/5 mx-auto">
        <img
          src="/images/Signal1.png"
          alt="Signal 1"
          className="w-full h-auto object-cover mb-4"
        />
        <img
          src="/images/Signal1.png"
          alt="Signal 2"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Section with Input, Footer buttons, and Image on the right */}
      <div className="flex flex-wrap justify-between items-start mt-8">
        {/* Left column with Input and Add Label button + Footer buttons */}
        <div className="flex flex-col space-y-8 w-full sm:w-auto">
          {/* Input and Add Label button */}
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Enter a label"
              className="border px-4 py-2 mr-2 rounded placeholder-gray-600"
            />
            <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white px-4 py-2 rounded">Add Label</button>
          </div>

          {/* Footer buttons on the left */}
          <div className="flex space-x-2">
            <button className="bg-gradient-to-r from-[#584BB4] to-[#465D9A] text-white px-4 py-2 rounded">Upload Video</button>
            <button className="bg-gradient-to-r from-[#584BB4] to-[#465D9A] text-white px-4 py-2 rounded">Upload File</button>
            <button className="bg-gradient-to-r from-[#584BB4] to-[#465D9A] text-white px-4 py-2 rounded">Download File</button>
          </div>
        </div>

        {/* Right column with Image, responsive adjustments */}
        <div className="ml-4 mt-4 sm:mt-0 sm:w-auto w-full flex justify-center sm:justify-end">
          <img
            src="/images/video.png"
            alt="video 3"
            className="w-32 h-32 object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default FrontEndComponent;
