import React from 'react';

const FrontEndComponent = () => {
  return (
    <div className="min-h-screen bg-body p-6 relative">
      {/* Header section */}
      <div className="flex justify-between items-start sm:flex-row flex-col sm:space-y-0 space-y-4">
        {/* Logo and text */}
        <div className="flex items-center space-x-2">
          <img src="/images/logo.png" alt="Logo" className="w-12 h-12 rounded-lg" />
          <span className="text-2xl font-bold">Logo</span>
        </div>

        {/* Buttons on the right (responsive behavior) */}
        <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row sm:flex-wrap">
          {/* Other Buttons */}
          <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white text-xl w-64 py-4 rounded">Flag</button>
          <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white text-xl w-64 py-4 rounded">Event</button>
          <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white text-xl w-64 py-4 rounded">Sync</button>

          {/* Deconnecter Button */}
          <button className="bg-[#514A4A] text-white px-10 py-4 rounded">Deconnecter</button>
        </div>
      </div>

      {/* Images in the middle of the page, vertically aligned */}
      <div className="flex flex-col items-center mt-12 w-4.5/5 mx-auto">
        <img
          src="/images/Signal1.png"
          alt="Signal 1"
          className="w-full h-auto object-cover mb-4 rounded-lg"
        />
        <img
          src="/images/Signal1.png"
          alt="Signal 2"
          className="w-full h-auto object-cover rounded-lg"
        />
      </div>

      {/* Section with Input, Footer buttons, and Image on the right */}
      <div className="flex justify-between items-start mt-8">
        {/* Left column with Input and Add Label button + Footer buttons */}
        <div className="flex flex-col w-full sm:w-auto">
          {/* Input and Add Label button (aligned with top of video image) */}
          <div className="flex items-start">
            <input
              type="text"
              placeholder="Enter a label"
              className="border w-[32rem] py-4 px-4 mr-2 rounded placeholder-gray-600 text-xl"
            />
            <button className="bg-gradient-to-r from-[#2481D9] to-[#5EB1FF] text-white text-xl w-64 py-4 rounded">Add Label</button>
          </div>

          {/* Footer buttons (aligned with bottom of video image) */}
          <div className="flex space-x-2 items-end mt-28"> {/* Ajout de mt-12 pour plus d'espace */}
            <button className="bg-gradient-to-r from-[#584BB4] to-[#465D9A] text-white text-xl w-64 py-4 rounded">Upload Video</button>
            <button className="bg-gradient-to-r from-[#584BB4] to-[#465D9A] text-white text-xl w-64 py-4 rounded">Upload File</button>
            <button className="bg-gradient-to-r from-[#584BB4] to-[#465D9A] text-white text-xl w-64 py-4 rounded">Download File</button>
          </div>
        </div>

        {/* Right column with Image, aligned with footer buttons */}
        <div className="ml-4 flex flex-col justify-between">
          {/* Image at the top */}
          <div>
            <img
              src="/images/video.png"
              alt="video 3"
              className="w-50 h-50 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontEndComponent;
