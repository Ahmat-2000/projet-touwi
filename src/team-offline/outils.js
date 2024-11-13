import { receiveFile,saveModificationFile, saveNewFile} from "@/team-offline/requests";
import { useVariablesContext } from '@/utils/VariablesContext';

export const getRowWithTimestamp = async(sensor, axis) => {
  
  // Retourne le nom du fichier 
  const { variablesContext } = useVariablesContext();
  const fileName = variablesContext.accel.name.split("_")[0] + '.touwi';
  
  // Retourne le fichier .touwi 
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
      throw new Error("Contenu du fichier introuvable ou vide.");
  }

  // Détermine l'index de la colonne en fonction du capteur et de l'axe
  const headers = touwiContent.split("\n")[0].split(",");
  const axisColumn = `${sensor}_${axis}`;
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
export const updateLabelByTimestamp = async (timestamp, newLabel) => {

  // Retourne le nom du fichier 
  const { variablesContext } = useVariablesContext();
  const fileName = variablesContext.accel.name.split("_")[0] + '.touwi';

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

  // Rechercher le timestamp et modifier le label si trouvé
  const updatedDataRows = dataRows.map(row => {
    const columns = row.split(",");
    if (columns[0] === targetTimestamp) {  // Comparaison avec le timestamp en chaîne
      columns[columns.length - 1] = newLabel;  // Mettre à jour le dernier élément (LABEL)
    }
    return columns.join(",");
  });

  // Reconstituer le contenu du fichier avec les modifications
  const updatedContent = [header, ...updatedDataRows].join("\n");

  const blob = new Blob([updatedContent], { type: 'text/csv' });
  const file = new File([blob], fileName, { type: 'text/csv', lastModified: new Date() });

  await saveNewFile(file);// Retourner le contenu du fichier modifié sous forme de texte
}

/*
// Fonction pour mettre à jour les labels d'un timestamp jusqu'à un autre
export const periodUpdate = async (fileName, timestamp_debut, timestamp_fin) => {

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

  // Rechercher le timestamp et modifier le label si trouvé
  const updatedDataRows = dataRows.map(row => {
    const columns = row.split(",");
    if (columns[0] === targetTimestamp) {  // Comparaison avec le timestamp en chaîne
      columns[columns.length - 1] = newLabel;  // Mettre à jour le dernier élément (LABEL)
    }
    return columns.join(",");
  });




}
*/