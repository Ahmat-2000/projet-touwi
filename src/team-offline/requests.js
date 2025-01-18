export const saveNewFile = async (touwiFile) => {
    //touwiFile must be an object of type File or Blob
    try {
        const formData = new FormData();
        formData.append("file", touwiFile);
        const response = await fetch("http://localhost:3000/api/local/saveFile", {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending data:', error);
        throw error; 
    }
};

export const saveModificationFile = async (touwiFile) => {
    //touwiFile must be an object of type File or Blob
    try {
        const formData = new FormData();
        formData.append("file", touwiFile);
        const response = await fetch("http://localhost:3000/api/local/saveModificationFile", {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending data:', error);
        throw error; 
    }
};

//unused function
export const saveVideoSynchronisationData = async (jsonData) => {
    //jsonData must be a dictionary object
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error)
        console.error('Error sending data:', error);
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let txt = await response.text();
        return txt

    } catch (error) {
        console.error('Error retrieving the file:', error);
    }
};

export const receiveExportFile = async (name) => {
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
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = new Blob( [ await response.text()], { type: 'touwi' });
        const file = new File([blob], name, { type: 'touwi', lastModified: new Date() });
        return file

    } catch (error) {
        console.error('Error retrieving the file:', error);
    }
};

export const saveVideoTimers = async (cropPoints, filename) => {
    try {
        const jsonData = {
            [filename]: {
                videoTimers: {
                    signal: { start: cropPoints.signal.start, end: cropPoints.signal.end },
                    video: { start: cropPoints.video.start, end: cropPoints.video.end }
                }
            }
        };

        const response = await fetch("http://localhost:3000/api/local/saveVideoTimers", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error saving video timers:', error);
        throw error;
    }
};


export const receiveVideoTimers = async (name) => {
    try {
        const response = await fetch("http://localhost:3000/api/local/sendFile", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "filename": "videoTimers.json",
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let txt = await response.text();
        return txt

    } catch (error) {
        console.error('Error retrieving the file:', error);
    }
};