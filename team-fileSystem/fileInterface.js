// Description: This file contains the class filesInterface, which is used to handle the data from the files uploaded by the user

// Usage: Either you open the files for the first time and you have an accelerometer file and a gyroscope file :
// call "await filesInterface.initializeFrom2Csv(accelFile, gyroFile)" and you will get an object with the data from both files

// Or you have a file in the Chronos format :
// call "await filesInterface.initializeFromChronos(chronosFile)" and you will get an object with the data from that file. 
class filesInterface{

    static #isAllowedToCreate = false;
    
    // To call with 2 File objects
    constructor(timestamps, accX, accY, accZ, gyroX, gyroY, gyroZ, name, label=undefined){

        if (!filesInterface.#isAllowedToCreate){
            throw new Error("Use the static factory methods to create a new instance of this class (initializeFrom2Csv or initializeFromChronos)");
        }

        this.timestamps = timestamps
        this.accData = {"x": accX, "y": accY, "z": accZ};
        this.gyroData = {"x": gyroX, "y": gyroY, "z": gyroZ};
        this.name = name;
        this.label = label || Array(this.timestamps.length).fill("NULL");

        filesInterface.#isAllowedToCreate = false;
    }

    // To call with a File object organized in the Chronos format
    static async initializeFromChronos(chronosFile, name=""){
        const content = await this.readFile(chronosFile);
        const { headers, data } = await this.processFileContent(content);

        // Just basic checks to see if the file is in the correct format
        if (headers.length != 8){
            throw new Error("Invalid file format, incorrect number of columns");
        }
        if (headers[0] != "timestamp" || headers[1] != "gyro_x" || headers[2] != "gyro_y" || headers[3] != "gyro_z" || headers[4] != "accel_x" || headers[5] != "accel_y" || headers[6] != "accel_z" || headers[7] != "label"){
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

        filesInterface.#isAllowedToCreate = true;
        return new filesInterface(timestamps, accX, accY, accZ, timestamps, gyroX, gyroY, gyroZ, name, label);

    }

    // Call this with File objects containing csv files of the "timestamp,x,y,z" format and the same number of lines in both files
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
        const gyroTimestamps = gyroData.map(row => row[0]);

        if (accTimestamps.length != gyroTimestamps.length){
            throw new Error("Files have different number of rows");
        }

        const accX = accData.map(row => row[1]);
        const accY = accData.map(row => row[2]);
        const accZ = accData.map(row => row[3]);
        const gyroX = gyroData.map(row => row[1]);
        const gyroY = gyroData.map(row => row[2]);
        const gyroZ = gyroData.map(row => row[3]);
        if (name == ""){
            name = accelFile.name + "_" + gyroFile.name;
        }

        filesInterface.#isAllowedToCreate = true;
        return new filesInterface(accTimestamps, accX, accY, accZ, gyroX, gyroY, gyroZ, name);
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

    // fileName is "accel", "gyro", "label" or "timestamps"
    // columnName is "x", "y" or "z"
    // throws an error if the file or column name is invalid
    // returns the column data
    getColumn(fileName, columnName=""){
        fileName = fileName.toLowerCase();
        let whichData;
        if (fileName == "label" || fileName == "labels"){
            return this.label;
        }
        if (fileName == "timestamps" || fileName == "timestamp" || fileName == "time"){
            return this.timestamps;
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
        if (columnName != "x" && columnName != "y" && columnName != "z"){
            throw new Error("Invalid column name");
        }
        this.checkIntegrity(); // asked by Antoine
        return whichData[columnName];
    }

    getName(){
        return this.name;
    }

    // is the same as getColumn("label", "whatever")
    getLabels(){
        return this.label;
    }

    // takes a timestamp and a name, checks if timestamp exists, then adds a flag at that timestamp with that name
    // doesnt return anything
    addFlag(timestamp, flag){
        const index = this.timestamps.indexOf(timestamp);
        if (index == -1){
            throw new Error("Invalid timestamp");
        }
        console.log(this.label);
        this.label[index] = "F:"+flag;
    }

    // takes a start and end timestamp and a name, checks if timestamps exist, then adds a period with that name to all timestamps in that range
    // doesnt return anything
    addPeriod(startTimestamp, endTimestamp, flag){
        const startIndex = this.timestamps.indexOf(startTimestamp);
        const endIndex = this.timestamps.indexOf(endTimestamp);
        if (startIndex == -1 || endIndex == -1){
            throw new Error("Invalid timestamp");
        }
        for (let i = startIndex; i <= endIndex; i++){
            this.label[i] = "P:"+flag;
        }
    }

    // same as addFlag but with an index
    addFlagWithIndex(index, flag){
        if (index < 0 || index >= this.label.length){
            throw new Error("Invalid index");
        }
        this.label[index] = "F:"+flag;
    }

    // same as addPeriod but with indexes
    addPeriodWithIndex(startIndex, endIndex, flag){
        if (startIndex < 0 || startIndex >= this.label.length || endIndex < 0 || endIndex >= this.label.length){
            throw new Error("Invalid index");
        }
        for (let i = startIndex; i <= endIndex; i++){
            this.label[i] = "P:"+flag;
        }
    }

    // checks if the data is consistent and throws an error if it is not
    // returns true but you can just call it without checking the return value, it will throw an error if something is wrong
    checkIntegrity(){
        if (this.timestamps.length != this.accData["x"].length || this.timestamps.length != this.accData["y"].length || this.timestamps.length != this.accData["z"].length){
            throw new Error("Inconsistent data in accelerometer");
        }
        if (this.timestamps.length != this.gyroData["x"].length || this.timestamps.length != this.gyroData["y"].length || this.timestamps.length != this.gyroData["z"].length){
            throw new Error("Inconsistent data in gyroscope");
        }
        if (this.timestamps.length != this.label.length){
            throw new Error("Inconsistent data in labels");
        }
        return true;
    }
}

export default filesInterface;