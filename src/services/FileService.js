// Process a CSV file by removing the last newline character, if present
export async function processCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        if (file && file.type !== "text/csv" && getFileExtension(file.name) !== "touwi") { // Test if it's a CSV or touwi file
            resolve(file);
        }

        reader.onload = function (e) {
            let fileContent = e.target.result;

            // Vérifier si le fichier se termine par un retour chariot (\n ou \r\n)
            if (fileContent.endsWith("\n")) {
                fileContent = fileContent.slice(0, -2); // Supprimer \n
            } else if (fileContent.endsWith("\r\n")){
                fileContent = fileContent.slice(0, -4); // Supprimer \r\n
            }

            // Créer un nouveau fichier avec le contenu modifié
            const processedFile = new Blob([fileContent], { type: "text/csv" });

            resolve(processedFile); // Retourner le fichier traité
        };

        reader.onerror = (error) => {
            reject("Error reading file: " + error.message);
        };

        reader.readAsText(file); // Lire le fichier CSV comme texte
    });
}

function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.'); // Trouver le dernier point
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return ''; // Pas d'extension ou le point est le premier caractère
    }
    return filename.substring(lastDotIndex + 1); // Récupérer tout après le dernier point
}