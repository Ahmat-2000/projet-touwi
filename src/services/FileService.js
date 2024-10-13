// services/FileService.js


export const removeUnevenLinesFromCSV = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        if (file && file.type !== "text/csv" && getFileExtension(file.name) !== "touwi") { // Test if it's a CSV or touwi file
            resolve(file); // Return the file as is if it's not a CSV file or a touwi file
            return;
        }
    
        reader.onload = (event) => {
            const csvText = event.target.result;
            const lines = csvText.split('\n');
      
            // Obtenir la première ligne et déterminer son nombre de colonnes
            const firstLineLength = lines[0].split(',').length;
      
            // Filtrer les lignes qui ont un nombre de colonnes égal à celui de la première ligne
            const filteredLines = lines.filter((line) => line.split(',').length === firstLineLength);
      
            // Reconvertir en chaîne CSV
            const cleanedCSV = filteredLines.join('\n');
      
            // Créer un Blob CSV à partir de la chaîne nettoyée
            const csvBlob = new Blob([cleanedCSV], { type: 'text/csv' });
            resolve(csvBlob);
        };
    
        reader.onerror = () => {
            reject('Erreur de lecture du fichier.');
        };
    
        reader.readAsText(file);
    });
};

function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.'); // Trouver le dernier point
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return ''; // Pas d'extension ou le point est le premier caractère
    }
    return filename.substring(lastDotIndex + 1); // Récupérer tout après le dernier point
}