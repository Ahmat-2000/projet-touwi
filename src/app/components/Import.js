"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useVariablesContext } from "@/utils/VariablesContext";
import { removeUnevenLinesFromCSV } from "@/services/FileService";
import csvToTouwi from '@/team-offline/csvToTouwi';
import { saveNewFile } from "@/team-offline/requests"
import Image from "next/image";

import FileUploader from './FileUploader';


const ImportComponent = () => {
  const router = useRouter();
  const accelInputRef = useRef(null);
  const gyroInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const touwiInputRef = useRef(null);
  const { setVariablesContext } = useVariablesContext();
  const [fields, setFields] = useState({
    accel: null,
    gyro: null,
    video: null,
    touwi: null,
  });
  const [errors, setErrors] = useState({});
  const [isReopenForm, setIsReopenForm] = useState(false);

  const redirect = () => {
    if (fields.video) {
      console.log("Redirecting to Page Crop");
      router.push("/crop");
    } else {
      console.log("Redirecting to Page Edit");
      router.push("/edit");
    }
  };

  const handleFileChange = async (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      const processedFile = await removeUnevenLinesFromCSV(file);
      setFields({ ...fields, [name]: { file: processedFile, name: file.name } });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!fields.accel) newErrors.accel = "Le fichier Accel est requis.";
    if (!fields.gyro) newErrors.gyro = "Le fichier Gyro est requis.";

    setErrors(newErrors);

    // Générez le nom de fichier à partir du nom de fileAccel

    if (Object.keys(newErrors).length === 0) {
      try {
        // Générez le nom de fichier à partir du nom de fileAccel
        const fileName = fields.accel.name.split("_accel")[0] + '.touwi';

        // Passez fileName comme argument à csvToTouwi
        const resultFile = await csvToTouwi(fields.accel.file, fields.gyro.file, fileName);
        await saveNewFile(resultFile);

        setVariablesContext(fields);
        redirect();
      } catch (error) {
        console.error("Erreur lors de la fusion des fichiers :", error);
      }
    }
  };

  const handleSubmitReopen = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!fields.touwi) newErrors.touwi = "Le fichier Touwi est requis.";

    setErrors(newErrors);

    // Générez le nom de fichier à partir du nom de touwi

    if (Object.keys(newErrors).length === 0) {
      try {
        setVariablesContext(fields);
        redirect();

      } catch (error) {
        console.error("Erreur lors de l'upload des fichiers :", error);
      }
    }
  };

  const handleRemoveFile = (name) => {
    setFields({ ...fields, [name]: null });
    // Reset the input field so it can trigger the onChange event with the same file
    if (name === "accel" && accelInputRef.current) {
      accelInputRef.current.value = null;
    } else if (name === "gyro" && gyroInputRef.current) {
      gyroInputRef.current.value = null;
    } else if (name === "video" && videoInputRef.current) {
      videoInputRef.current.value = null;
    } else if (name === "touwi" && touwiInputRef.current) {
      touwiInputRef.current.value = null;
    }

  };

  return (

    <div className="bg-[#EFEFEF] min-h-screen flex flex-col items-center justify-center relative">
      {/* Formulaire centré */}
      <div className="relative bg-[#D9D9D9] p-8 shadow-lg rounded-lg max-w-lg w-full mt-4">
        {/* Logo repositionné pour être en haut à gauche de la boîte */}
        <div className="absolute top-[-55px] left-[-120px]">
          <Image src={"/images/image11.svg"} alt="Logo" width={150} height={50} priority />
        </div>


        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1B649F]">
            Files Import
          </h1>
          <button
            type="button"
            className="bg-[#297DCB] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 ml-4"
            onClick={() => setIsReopenForm(!isReopenForm)}
          >
            {isReopenForm ? "Back to Import" : "Reopen"}
          </button>
        </div>

        {isReopenForm ? (
          <form onSubmit={handleSubmitReopen} className="space-y-6">
            {/* Touwi File Input */}
            <div>
              <label className="block text-lg text-gray-700 mb-2">Touwi file:</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-[#297DCB] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                  Select touwi file
                  <input
                    type="file"
                    name="touwi"
                    accept=".touwi"
                    onChange={handleFileChange}
                    ref={touwiInputRef}
                    className="hidden"
                  />
                </label>
                <span className="ml-4 text-gray-500">
                  {fields.touwi ? fields.touwi.name : "No file selected"}
                </span>
                {fields.touwi && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile("touwi")}
                  >
                    X
                  </button>
                )}
              </div>
              {errors.touwi && <p className="text-red-500">{errors.touwi}</p>}
            </div>

            {/* VIDEO */}
            <div>
              <label className="block text-lg text-gray-700 mb-2">Video:</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-[#297DCB] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                  Select a video
                  <input
                    type="file"
                    name="video"
                    accept="video/*"
                    onChange={handleFileChange}
                    ref={videoInputRef}
                    className="hidden"
                  />
                </label>
                <span className="ml-4 text-gray-500">
                  {fields.video ? fields.video.name : "No file selected"}
                </span>
                {fields.video && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile("video")}
                  >
                    X
                  </button>
                )}
              </div>
              {errors.video && <p className="text-red-500">{errors.video}</p>}
            </div>

            {/* Submit Button for Touwi */}
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-[#297DCB] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
              >
                Open
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ACCEL File Input */}
            <div>
              <label className="block text-lg text-gray-700 mb-2">Accel file:</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-[#297DCB] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                  Select accel file
                  <input
                    type="file"
                    name="accel"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={accelInputRef}
                    className="hidden"
                  />
                </label>
                <span className="ml-4 text-gray-500">
                  {fields.accel ? fields.accel.name : "No file selected"}
                </span>
                {fields.accel && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile("accel")}
                  >
                    X
                  </button>
                )}
              </div>
              {errors.accel && <p className="text-red-500">{errors.accel}</p>}
            </div>

            {/* GYRO File Input */}
            <div>
              <label className="block text-lg text-gray-700 mb-2">Gyro file:</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-[#297DCB] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                  Select gyro file
                  <input
                    type="file"
                    name="gyro"
                    accept=".csv"
                    onChange={handleFileChange}
                    ref={gyroInputRef}
                    className="hidden"
                  />
                </label>
                <span className="ml-4 text-gray-500">
                  {fields.gyro ? fields.gyro.name : "No file selected"}
                </span>
                {fields.gyro && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile("gyro")}
                  >
                    X
                  </button>
                )}
              </div>
              {errors.gyro && <p className="text-red-500">{errors.gyro}</p>}
            </div>

            {/* VIDEO */}
            <div>
              <label className="block text-lg text-gray-700 mb-2">Video:</label>
              <div className="flex items-center">
                <label className="cursor-pointer bg-[#297DCB] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                  Select a video
                  <input
                    type="file"
                    name="video"
                    accept="video/*"
                    onChange={handleFileChange}
                    ref={videoInputRef}
                    className="hidden"
                  />
                </label>
                <span className="ml-4 text-gray-500">
                  {fields.video ? fields.video.name : "No file selected"}
                </span>
                {fields.video && (
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFile("video")}
                  >
                    X
                  </button>
                )}
              </div>
              {errors.video && <p className="text-red-500">{errors.video}</p>}
            </div>

            {/* Submit Button for Import */}
            <div className="flex justify-between items-center">
              <button
                type="submit"
                className="bg-[#297DCB] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
              >
                Open
              </button>
            </div>
          </form>
        )}
      </div>

      <FileUploader />
    </div>
  );
};

export default ImportComponent;
