import { saveModificationFile } from "@/team-offline/requests";

export async function getRowByTimestamp(file, timestamp) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target.result;
      const rows = content.split("\n").map(row => row.split(","));
      
      // Cherche la ligne contenant le timestamp
      const foundRow = rows.find(row => row[0] === timestamp.toString());
      
      if (foundRow) {
        resolve(foundRow);
      } else {
        reject(new Error("Timestamp non trouvé dans le fichier."));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

export async function updateLabelByTimestamp(file, timestamp, newLabel) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const content = event.target.result;
      const rows = content.split("\n").map(row => row.split(","));
      
      // Met à jour le label dans la ligne correspondant au timestamp
      const rowIndex = rows.findIndex(row => row[0] === timestamp.toString());
      
      if (rowIndex !== -1) {
        rows[rowIndex][1] = newLabel; // Suppose que le label est dans la 2e colonne

        // Reconvertit le tableau en CSV
        const updatedContent = rows.map(row => row.join(",")).join("\n");

        // Crée un nouvel objet Blob avec le contenu mis à jour
        const updatedFile = new Blob([updatedContent], { type: "text/csv" });

        try {
          // Utilise saveModificationFile pour sauvegarder les modifications
          const result = await saveModificationFile(updatedFile);
          resolve(result);
        } catch (error) {
          console.error("Erreur lors de la sauvegarde des modifications :", error);
          reject(error);
        }
      } else {
        reject(new Error("Timestamp non trouvé dans le fichier."));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}
