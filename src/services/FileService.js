// Process a CSV file by removing the last newline character, if present
export async function processCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (e) {
            let fileContent = e.target.result;

            // Vérifier si le fichier se termine par un retour chariot (\n ou \r\n)
            if (fileContent.endsWith("\r\n")) {
                fileContent = fileContent.slice(0, -2); // Supprimer \r\n
            } else if (fileContent.endsWith("\n")) {
                fileContent = fileContent.slice(0, -1); // Supprimer \n
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