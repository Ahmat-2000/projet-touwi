export default async function csvToTouwi(fileAccel, fileGyro, outputFileName = 'resultat.Touwi') {
    console.log("Processing files:", fileAccel, fileGyro);

    // Utilitaire pour lire un fichier en texte
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Lecture asynchrone des deux fichiers
    const [accelContent, gyroContent] = await Promise.all([readFile(fileAccel), readFile(fileGyro)]);

    // Traitement des contenus des fichiers
    function parseCsvContent(content) {
        const lines = content.trim().split("\n"); // Supprime les espaces superflus
        const data = lines.slice(1).map(line => line.split(",")); // Ignorer la première ligne (en-tête)
        return data;
    }

    const accelData = parseCsvContent(accelContent);
    const gyroData = parseCsvContent(gyroContent);

    // Combinaison des données avec ajout du label "NONE"
    const combinedHeaders = "timestamp,gyro_x,gyro_y,gyro_z,accel_x,accel_y,accel_z,LABEL";
    let combinedData = combinedHeaders + "\n";

    for (let i = 0; i < accelData.length; i++) {
        const timestamp = accelData[i][0]; // Timestamp commun entre les fichiers
        const gyroValues = gyroData[i].slice(1).join(","); // Récupérer x, y, z du gyroscope
        const accelValues = accelData[i].slice(1).join(","); // Récupérer x, y, z de l'accéléromètre
        combinedData += `${timestamp},${gyroValues},${accelValues},NONE\n`; // Ajouter la ligne combinée avec LABEL "NONE"
    }

    // Création du fichier combiné au format CSV
    const blob = new Blob([combinedData], { type: 'text/csv' });
    const file = new File([blob], outputFileName, { type: 'text/csv', lastModified: new Date() });

    console.log("Combined file created:", file.name);

   
    
    
    return file; // Retourne le fichier pour d'autres traitements (téléchargement, envoi, etc.)
}
