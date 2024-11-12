import Image from 'next/image';
import React from 'react';

const FrontEndComponent = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 pt-0 relative">
      {/* Header section */}
      <div className="flex justify-between items-center sm:flex-row flex-col sm:space-y-0 space-y-4 px-6 pt-2 overflow-hidden">
        {/* Logo agrandi */}
        <div className="flex items-center space-x-2 m-0 p-0">
          <Image src="/images/image11.svg" alt="Logo" className="w-40 h-auto m-0 p-0" />
        </div>

        {/* Label input, Add Label button et Bouton Sign out dans le même conteneur */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Enter a label"
            className="border w-80 py-2 px-4 rounded-l placeholder-gray-600 text-lg"
            style={{ color: "#297DCB" }}
          />
          <button className="bg-[#297DCB] text-white text-lg px-4 py-2 rounded-r">Add Label</button>
          <button className="bg-[#514A4A] text-white px-6 py-2 rounded">Sign out</button>
        </div>
      </div>

      {/* Boutons de contrôle - prend toute la largeur */}
      <div className="flex justify-between space-x-2 mt-4 w-full items-end">
        {["Zoom", "Pan", "Add Period", "Delete Period", "Add Flag", "Reset Mode", "Delete All"].map((text) => (
          <button key={text} className="bg-[#297DCB] text-white text-2xl w-full flex justify-center items-center py-2 rounded ">
            {text}
          </button>
        ))}
        <span className="ml-4 text-gray-700 text-xl font-bold whitespace-nowrap">Mode: none</span>
      </div>

      {/* Images des signaux - prend toute la largeur */}
      <div className="flex flex-col items-center mt-4 w-full border border-blue-300 p-4 rounded">
        <Image src="/images/Signal1.png" alt="Signal X" className="w-full h-auto object-cover mb-2" />
        <Image src="/images/Signal2.png" alt="Signal Y" className="w-full h-auto object-cover" />
      </div>

      {/* Placeholder vidéo, positionné à gauche et plus petit */}
      <div className="flex justify-start mt-4">
        <Image src="/images/video.png" alt="Video Placeholder" className="w-1/3 h-auto object-cover rounded" />
      </div>
    </div>
  );
};

export default FrontEndComponent;
