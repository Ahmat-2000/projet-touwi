class filesInterface{
    
    // To call with 2 File objects
    constructor(accTimestamps, accX, accY, accZ, gyroTimestamps, gyroX, gyroY, gyroZ, name){
        this.accData = {"timestamps": accTimestamps, "x": accX, "y": accY, "z": accZ};
        this.gyroData = {"timestamps": gyroTimestamps, "x": gyroX, "y": gyroY, "z": gyroZ};
        this.name = name;
    }

    static async initializeFiles(accelFile, gyroFile, name=""){
        const [accContent, gyroContent] = await Promise.all([this.readFile(accelFile), this.readFile(gyroFile)]);
        const { headers: accHeaders, data: accData } = await this.processFileContent(accContent);
        const { headers: gyroHeaders, data: gyroData } = await this.processFileContent(gyroContent);

        // Just basic checks to see if the files are in the correct format
        if (accHeaders.length != 4 || gyroHeaders.length != 4){
            throw new Error("Invalid file format, incorrect number of columns");
        }
        if (accHeaders[0] != "timestamp" || gyroHeaders[0] != "timestamp"){
            throw new Error("Invalid file format, missing timestamp");
        }
        if (accHeaders[1] != "x" || accHeaders[2] != "y" || accHeaders[3] != "z"){
            throw new Error("Invalid file format, missing accel x, y or z");
        }
        if (gyroHeaders[1] != "x" || gyroHeaders[2] != "y" || gyroHeaders[3] != "z"){
            throw new Error("Invalid file format, missing gyro x, y or z");
        }

        // Create the variables necessary for the class
        const accTimestamps = gyroData.map(row => row[0]);
        const accX = accData.map(row => row[1]);
        const accY = accData.map(row => row[2]);
        const accZ = accData.map(row => row[3]);
        const gyroTimestamps = gyroData.map(row => row[0]);
        const gyroX = gyroData.map(row => row[1]);
        const gyroY = gyroData.map(row => row[2]);
        const gyroZ = gyroData.map(row => row[3]);
        if (name == ""){
            name = accelFile.name + "_" + gyroFile.name;
        }

        return new filesInterface(accTimestamps, accX, accY, accZ, gyroTimestamps, gyroX, gyroY, gyroZ, name);
    }

    // file is a File object, returns a string with the file content
    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // returns a dictionary with the headers and the data, content is a string with the file content
    static async processFileContent(content) {
        const lines = content.split("\n");
        const headers = lines.shift().split(",");
        const data = lines.map(line => line.split(","));
        return { headers, data };
    }

    // fileName is "accel" or "gyro"
    // columnName is "timestamps", "x", "y" or "z"
    // throws an error if the file or column name is invalid
    // returns the column data
    getColumn(fileName, columnName){
        let whichData;
        if (fileName == "accel"){
            whichData = this.accData;
        }
        else{
            if (fileName == "gyro"){
                whichData = this.gyroData;
            }
            else{
                throw new Error("Invalid file name");
            }
        }
        if (columnName != "timestamps" && columnName != "x" && columnName != "y" && columnName != "z"){
            throw new Error("Invalid column name");
        }
        return whichData[columnName];
    }

    getName(){
        return this.name;
    }
}

export default filesInterface;