class filesInterface{
    
    // To call with 2 File objects
    constructor(accTimestamps, accX, accY, accZ, gyroTimestamps, gyroX, gyroY, gyroZ, name){
        this.accTimestamps = accTimestamps;
        this.accX = accX;
        this.accY = accY;
        this.accZ = accZ;
        this.gyroTimestamps = gyroTimestamps;
        this.gyroX = gyroX;
        this.gyroY = gyroY;
        this.gyroZ = gyroZ;
        this.name = name;
    }

    static async initializeFiles(accelFile, gyroFile){
        const [accContent, gyroContent] = await Promise.all([this.readFile(accelFile), this.readFile(gyroFile)]);
        const { headers: accHeaders, data: accData } = this.processFileContent(accContent);
        const { headers: gyroHeaders, data: gyroData } = this.processFileContent(gyroContent);


        // Just basic checks to see if the files are in the correct format
        if (accHeaders.length != 4 || gyroHeaders.length != 4){
            throw new Error("Invalid file format");
        }
        if (accHeaders[0] != "timestamp" || gyroHeaders[0] != "timestamp"){
            throw new Error("Invalid file format");
        }
        if (accHeaders[1] != "x" || accHeaders[2] != "y" || accHeaders[3] != "z"){
            throw new Error("Invalid file format");
        }
        if (gyroHeaders[1] != "x" || gyroHeaders[2] != "y" || gyroHeaders[3] != "z"){
            throw new Error("Invalid file format");
        }

        // Initialize the class variables
        const accTimestamps = gyroData.map(row => row[0]);
        const accX = accData.map(row => row[1]);
        const accY = accData.map(row => row[2]);
        const accZ = accData.map(row => row[3]);
        const gyroTimestamps = gyroData.map(row => row[0]);
        const gyroX = gyroData.map(row => row[1]);
        const gyroY = gyroData.map(row => row[2]);
        const gyroZ = gyroData.map(row => row[3]);
        const name = accelFile.name + "_" + gyroFile.name;

        return new filesInterface(accTimestamps, accX, accY, accZ, gyroTimestamps, gyroX, gyroY, gyroZ, name);
    }

    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    static async processFileContent(content) {
        const lines = content.split("\n");
        const headers = lines.shift().split(",");
        const data = lines.map(line => line.split(","));
        return { headers, data };
    }
}