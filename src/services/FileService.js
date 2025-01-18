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
      
            // Get the first line and determine its number of columns
            const firstLineLength = lines[0].split(',').length;
      
            // Filter lines that have a number of columns equal to that of the first line
            const filteredLines = lines.filter((line) => line.split(',').length === firstLineLength);
      
            // Convert back to CSV string
            const cleanedCSV = filteredLines.join('\n');
      
            // Create a CSV Blob from the cleaned string
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
    const lastDotIndex = filename.lastIndexOf('.'); // Find the last dot
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return ''; // No extension or the dot is the first character
    }
    return filename.substring(lastDotIndex + 1); // Get everything after the last dot
}