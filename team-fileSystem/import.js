// pages/import.js
"use client"; // Indique que c'est un Client Component

import { useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";

import csvToChronos from './csvToChronos';
import exportFile from './export';


const ImportPage = () => {
  const router = useRouter();
  const [files, setFiles] = useState({
    accel: null,
    gyro: null,
    video: null,
    touwi: null,
  });
  const [frequency, setFrequency] = useState("");
  const [errors, setErrors] = useState({});

  const redirect = () => {
    
  };

  const fileRef = useRef([]);
  const resetFile = (index) =>{
    if(fileRef.current[index]){
      fileRef.current[index].value = '';
    }
  };

  // Fonction pour traiter les fichiers CSV et retirer la dernière ligne vide
  const processCSV = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (e) {
        const fileContent = e.target.result;
        const lines = fileContent.split("\n");
        
        // Supprimer la dernière ligne si elle est vide
        if (lines.length > 0 && lines[lines.length - 1].trim() === "") {
          lines.pop();
        }

        // Reconstruire le contenu du fichier
        const processedContent = lines.join("\n");
        const processedFile = new Blob([processedContent], {
          type: "text/csv",
        });

        resolve(processedFile); // Retourner le fichier traité
      };
      reader.onerror = reject;
      reader.readAsText(file); // Lire le fichier CSV
    });
  };

  // Gestion de l'importation des fichiers
  const handleFileChange = async (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];

    // Si le fichier est un CSV, traiter les lignes
    if (file && file.type === "text/csv") {
      const processedFile = await processCSV(file);
      setFiles({ ...files, [name]: processedFile });
    } else {
      setFiles({ ...files, [name]: file });
    }
  };

  // Gestion de la fréquence (Hz)
  const handleFrequencyChange = (e) => {
    setFrequency(e.target.value);
  };

  // Gestion de l'importation du fichier ".touwi"
  const handleReOpenTouwi = (e) => {
    const { files: selectedFiles } = e.target;
    setFiles({ ...files, touwi: selectedFiles[0] });
    redirect();
  };

  // Validation et soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation des fichiers
    if (!files.accel) newErrors.accel = "Le fichier Accel est requis.";
    if (!files.gyro) newErrors.gyro = "Le fichier Gyro est requis.";
    if (!frequency) newErrors.frequency = "La fréquence en Hz est requise.";
    if (isNaN(frequency) || frequency <= 0)
      newErrors.frequency = "Veuillez entrer une fréquence valide en Hz.";

    setErrors(newErrors);

    // Si aucune erreur, redirection ou traitement
    if (Object.keys(newErrors).length === 0) {
      // Logique pour envoyer les fichiers et la fréquence (ex: API ou une autre page)

      const combinedFile = await csvToChronos(files.accel, files.gyro, 'combined_output.csv');
      //exportFile(combinedFile);
      handleFileUpload(combinedFile);
      console.log("Fichiers envoyés:", files);
      console.log("Fréquence:", frequency);
      redirect();
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      sessionStorage.setItem('uploadedFile', reader.result); // Sauvegarde en session
    };
    reader.readAsDataURL(file); // Convertir en base64
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Import files</h1>
      <form onSubmit={handleSubmit}>
        {/* ACCEL */}
        <div>
          <label>
            Fichier Accel:
            <input
              type="file"
              name="accel"
              ref={(el) => (fileRef.current[0] = el)}
              accept=".csv"
              onChange={handleFileChange}
            />
          </label>
          <button onClick={() => resetFile(0)}>Cancel</button>

          {errors.accel && <p style={{ color: "red" }}>{errors.accel}</p>}
        </div>
      
        {/* GYRO */}
        <div>
          <label>
            Fichier Gyro:
            <input
              type="file"
              name="gyro"
              ref={(el) => (fileRef.current[1] = el)}
              accept=".csv"
              onChange={handleFileChange}
            />
            <button onClick={() => resetFile(1)}>Cancel</button>
          </label>
          {errors.gyro && <p style={{ color: "red" }}>{errors.gyro}</p>}
        </div>

        {/* VIDEO */}
        <div>
          <label>
            Vidéo:
            <input
              type="file"
              name="video"
              ref={(el) => (fileRef.current[2] = el)}
              accept="video/*"
              onChange={handleFileChange}
            />
            <button onClick={() => resetFile(2)}>Cancel</button>
          </label>
          {errors.video && <p style={{ color: "red" }}>{errors.video}</p>}
        </div>

        {/* Frequency */}
        <div>
          <label>
            Fréquence (en Hz):
            <input
              type="text"
              value={frequency}
              onChange={handleFrequencyChange}
              placeholder="Entrez la fréquence en Hz"
            />
          </label>
          {errors.frequency && (
            <p style={{ color: "red" }}>{errors.frequency}</p>
          )}
        </div>

        {/* VALIDATION */}
        <div>
          {/* OPEN */}
          <button type="submit">Ouvrir</button>

          {/* REOPEN */}
          <div>
            <button
              type="button"
              onClick={() => document.getElementById("touwiInput").click()}
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
 
  );
};

export default ImportPage;
