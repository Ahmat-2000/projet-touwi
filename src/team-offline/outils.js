import { receiveFile,saveModificationFile, saveNewFile} from "@/team-offline/requests";

export const getRowWithTimestamp = async(sensor, axis, fileName) => {

  // Retourne le fichier .touwi 
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
      throw new Error("Contenu du fichier introuvable ou vide.");
  }

  // Détermine l'index de la colonne en fonction du capteur et de l'axe
  const headers = touwiContent.split("\n")[0].split(",");
  let axisColumn;
  if (axis === ''){
    axisColumn = sensor;
  }
  else{
    axisColumn = `${sensor}_${axis}`;
  }
  const timestampIndex = headers.indexOf("timestamp");
  const axisIndex = headers.indexOf(axisColumn);
 

  const res = [[],[]]
  

  //récupérer les colonnes 
  const rows = touwiContent.trim().split("\n").slice(1);

  // parcours des timestamp et colonnes
  rows.forEach(row => {
      const columns = row.split(",");
      const timestamp = columns[timestampIndex];
      const axisValue = columns[axisIndex];

      res[0].push(timestamp)
      res[1].push(axisValue)
  });
  
  return res
}

// Fonction pour mettre à jour un label par timestamp
export const updateLabelByTimestamp = async (timestamp, newLabel, fileName) => {
  // Charger le contenu du fichier
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
    throw new Error("Contenu du fichier introuvable ou vide.");
  }

  // Diviser le contenu en lignes
  const rows = touwiContent.trim().split("\n");

  // Extraire l'en-tête et les lignes de données
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Convertir le timestamp recherché en chaîne pour assurer la comparaison correcte
  const targetTimestamp = String(timestamp);

  console.log("Début de la mise à jour du label...");

  // Rechercher le timestamp et modifier le label si trouvé
  const updatedDataRows = dataRows.map(row => {
    const columns = row.split(",");
    if (columns[0] === targetTimestamp) {  // Comparaison avec le timestamp en chaîne
      console.log(`Modification du label pour le timestamp ${targetTimestamp}`);
      columns[columns.length - 1] = newLabel;  // Mettre à jour le dernier élément (LABEL)
    }
    return columns.join(",");
  });

  // Reconstituer le contenu du fichier avec les modifications
  const updatedContent = [header, ...updatedDataRows].join("\n");

  // Créer un Blob et un fichier pour sauvegarder les modifications
  const blob = new Blob([updatedContent], { type: 'text/csv' });
  const file = new File([blob], fileName, { type: 'text/csv', lastModified: new Date() });

  // Vérification de sauvegarde
  const saveResult = await saveNewFile(file);
}

// Fonction pour mettre à jour les labels d'un timestamp jusqu'à un autre
export const periodUpdate = async (timestamp_debut, timestamp_fin,new_label,fileName) => {

  // Charger le contenu du fichier
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
    throw new Error("Contenu du fichier introuvable ou vide.");
  }

  // Diviser le contenu en lignes
  const rows = touwiContent.trim().split("\n");

  // Extraire l'en-tête et les lignes de données
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Convertir le timestamp recherché en chaîne pour assurer la comparaison correcte
  const targetStartTimestamp = String(timestamp_debut);
  const targetEndTimestamp = String(timestamp_fin);

  // Rechercher les timestamps et modifier le label si trouvé
  const updatedDataRows = dataRows.map(row => {
    const columns = row.split(",");
    const currentTimestamp = columns[0];

    // Vérifier si le timestamp est dans l'intervalle défini
    if (currentTimestamp >= targetStartTimestamp && currentTimestamp <= targetEndTimestamp) {
      columns[columns.length - 1] = new_label;  // Mettre à jour le dernier élément (LABEL)
    }
    return columns.join(",");
  });

  const updatedContent = [header, ...updatedDataRows].join("\n");

  const blob = new Blob([updatedContent], { type: 'text/csv' });
  const file = new File([blob], fileName, { type: 'text/csv', lastModified: new Date() });

  await saveNewFile(file);// Retourner le contenu du fichier modifié sous forme de texte

}