class filesInterface{
    
    // To call with 2 File objects
    constructor(accTimestamps, accX, accY, accZ, gyroTimestamps, gyroX, gyroY, gyroZ, name, label=undefined){
        this.accData = {"timestamp": accTimestamps, "x": accX, "y": accY, "z": accZ};
        this.gyroData = {"timestamp": gyroTimestamps, "x": gyroX, "y": gyroY, "z": gyroZ};
        this.name = name;
        this.label = label || Array(Math.max(accTimestamps.length, gyroTimestamps.length)).fill("NULL");
    }

    // To call with a File object organized in the Chronos format
    static async initializeFromChronos(chronosFile, name=""){
        const content = await this.readFile(chronosFile);
        const { headers, data } = await this.processFileContent(content);

        // Just basic checks to see if the file is in the correct format
        if (headers.length != 8){
            throw new Error("Invalid file format, incorrect number of columns");
        }
        if (headers[0] != "timestamp" || headers[1] != "accel_x" || headers[2] != "accel_y" || headers[3] != "accel_z" || headers[4] != "gyro_x" || headers[5] != "gyro_y" || headers[6] != "gyro_z" || headers[7] != "label"){
            throw new Error("Invalid file format, a column has the wrong name");
        }

        // Create the variables necessary for the class
        const timestamps = data.map(row => row[0]);
        const accX = data.map(row => row[1]);
        const accY = data.map(row => row[2]);
        const accZ = data.map(row => row[3]);
        const gyroX = data.map(row => row[4]);
        const gyroY = data.map(row => row[5]);
        const gyroZ = data.map(row => row[6]);
        const label = data.map(row => row[7]);
        if (name == ""){
            name = chronosFile.name;
        }

        return new filesInterface(timestamps, accX, accY, accZ, timestamps, gyroX, gyroY, gyroZ, name, label);

    }

    // Call this with File objects containing csv files of the timestamp,x,y,z format
    static async initializeFrom2Csv(accelFile, gyroFile, name=""){
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

    // fileName is "accel", "gyro" or "label"
    // columnName is "timestamp", "x", "y" or "z"
    // throws an error if the file or column name is invalid
    // returns the column data
    getColumn(fileName, columnName){
        fileName = fileName.toLowerCase();
        let whichData;
        if (fileName == "label" || fileName == "labels"){
            return this.label;
        }
        if (fileName == "accel" || fileName == "accelerometer" || fileName == "acc"){
            whichData = this.accData;
        }
        else{
            if (fileName == "gyro" || fileName == "gyroscope"){
                whichData = this.gyroData;
            }
            else{
                throw new Error("Invalid file name");
            }
        }
        if (columnName != "timestamp" && columnName != "x" && columnName != "y" && columnName != "z"){
            throw new Error("Invalid column name");
        }
        return whichData[columnName];
    }

    getName(){
        return this.name;
    }

    // is the same as getColumn("label", "whatever")
    getLabels(){
        return this.label;
    }
}

export default filesInterface;