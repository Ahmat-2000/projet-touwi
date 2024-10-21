"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useVariablesContext } from "@/utils/VariablesContext";
import { removeUnevenLinesFromCSV } from "@/services/FileService";

const ImportComponent = () => {
  const router = useRouter();
  const { setVariablesContext } = useVariablesContext();
  const [fields, setFields] = useState({
    accel: null,
    gyro: null,
    video: null,
    frequency: null,
  });
  const [errors, setErrors] = useState({});

  const redirect = () => {
    router.push("/edit");
  };

  const handleFileChange = async (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    const processedFile = await removeUnevenLinesFromCSV(file);
    setFields({ ...fields, [name]: processedFile });
  };

  const handleReOpenTouwi = async (e) => {
    const { files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    const processedFile = await removeUnevenLinesFromCSV(file);
    setVariablesContext(processedFile);
    redirect();
  };

  const handleFrequencyChange = (e) => {
    setFields((prevFields) => ({ ...prevFields, frequency: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!fields.accel) newErrors.accel = "Le fichier Accel est requis.";
    if (!fields.gyro) newErrors.gyro = "Le fichier Gyro est requis.";
    if (!fields.video) newErrors.video = "La vidéo est requise.";
    if (!fields.frequency) newErrors.frequency = "La fréquence en Hz est requise.";
    if (isNaN(fields.frequency) || fields.frequency <= 0)
      newErrors.frequency = "Veuillez entrer une fréquence valide en Hz.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Fichiers envoyés:", fields);
      setVariablesContext(fields);
      redirect();
    }
  };

  return (
    <div className="bg-blue-100 p-8 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
          Importation fichiers
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ACCEL */}
          <div>
            <label className="block text-lg text-gray-700 mb-2">
              Fichier Accel:
            </label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                Sélectionner fichier
                <input
                  type="file"
                  name="accel"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="ml-4 text-gray-500">
                {fields.accel ? fields.accel.name : "Aucun fichier sélectionné"}
              </span>
            </div>
            {errors.accel && <p className="text-red-500">{errors.accel}</p>}
          </div>

          {/* GYRO */}
          <div>
            <label className="block text-lg text-gray-700 mb-2">
              Fichier Gyro:
            </label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                Sélectionner fichier
                <input
                  type="file"
                  name="gyro"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="ml-4 text-gray-500">
                {fields.gyro ? fields.gyro.name : "Aucun fichier sélectionné"}
              </span>
            </div>
            {errors.gyro && <p className="text-red-500">{errors.gyro}</p>}
          </div>

          {/* VIDEO */}
          <div>
            <label className="block text-lg text-gray-700 mb-2">Vidéo:</label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600">
                Sélectionner vidéo
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="ml-4 text-gray-500">
                {fields.video ? fields.video.name : "Aucun fichier sélectionné"}
              </span>
            </div>
            {errors.video && <p className="text-red-500">{errors.video}</p>}
          </div>

          {/* FREQUENCY */}
          <div>
            <label className="block text-lg text-gray-700 mb-2">
              Fréquence (en Hz):
            </label>
            <input
              type="text"
              value={fields.frequency ?? ""}
              onChange={handleFrequencyChange}
              placeholder="Entrez la fréquence en Hz"
              className="w-full p-2 border rounded-md"
            />
            {errors.frequency && (
              <p className="text-red-500">{errors.frequency}</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
            >
              Ouvrir
            </button>

            {/* REOPEN */}
            <div>
              <button
                type="button"
                onClick={() => document.getElementById("touwiInput").click()}
                className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-blue-600"
              >
                Rouvrir
              </button>
              <input
                type="file"
                id="touwiInput"
                accept=".touwi"
                style={{ display: "none" }}
                onChange={handleReOpenTouwi}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportComponent;
