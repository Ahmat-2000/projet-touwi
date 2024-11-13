export const saveNewFile = async (touwiFile) => {
    //touwiFile doit être un objet de type File ou Blob
    try {
        const formData = new FormData();
        formData.append("file", touwiFile);
        const response = await fetch("http://localhost:3000/api/local/saveFile", {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'envoi des données:', error);
        throw error; 
    }
};

export const saveModificationFile = async (touwiFile) => {
    //touwiFile doit être un objet de type File ou Blob
    try {
        const formData = new FormData();
        formData.append("file", touwiFile);
        const response = await fetch("http://localhost:3000/api/local/saveModificationFile", {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Erreur lors de l\'envoi des données:', error);
        throw error; 
    }
};

export const saveVideoSynchronisationData = async (jsonData) => {
    //jsonData doit ête un objet de type dictionnaire
    try {
        jsonData = {
            "name": "reopen.touwi",
            "age": 30,
            "city": "Wonderland"
          }
        const response = await fetch("http://localhost:3000/api/local/saveVideoSynchronisation", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });
        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error)
        console.error('Erreur lors de l\'envoi des données:', error);
        throw error; 
    }
};


export const receiveFile = async (name) => {
    try {
        const response = await fetch("http://localhost:3000/api/local/sendFile", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "filename": name,
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP! statut: ${response.status}`);
        }

        let txt = await response.text();
        return txt

    } catch (error) {
        console.error('Erreur lors de la récupération du fichier:', error);
    }
};