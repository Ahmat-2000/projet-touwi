export default async function csvToTouwi(fileAccel, fileGyro, outputFileName) {
    console.log("Processing files:", fileAccel, fileGyro);

    // Utility function to read a file as text
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // Asynchronously read the two files
    const [accelContent, gyroContent] = await Promise.all([readFile(fileAccel), readFile(fileGyro)]);

    // Process the contents of the files
    function parseCsvContent(content) {
        const lines = content.trim().split("\n"); // Remove extra spaces
        const data = lines.slice(1).map(line => line.split(",")); // Ignore the first line (header)
        return data;
    }

    const accelData = parseCsvContent(accelContent);
    const gyroData = parseCsvContent(gyroContent);

    // Combine the data with the label "NONE"
    const combinedHeaders = "timestamp,gyro_x,gyro_y,gyro_z,accel_x,accel_y,accel_z,LABEL";
    let combinedData = combinedHeaders + "\n";

    for (let i = 0; i < accelData.length; i++) {
        const timestamp = accelData[i][0]; // Common timestamp between the files
        const gyroValues = gyroData[i].slice(1).join(","); // Get x, y, z from the gyroscope
        const accelValues = accelData[i].slice(1).join(","); // Get x, y, z from the accelerometer
        combinedData += `${timestamp},${gyroValues},${accelValues},NONE\n`; // Add the combined line with the LABEL "NONE"
    }

    // Create the combined file in CSV format
    const blob = new Blob([combinedData], { type: 'text/csv' });
    const file = new File([blob], outputFileName, { type: 'text/csv', lastModified: new Date() });

    console.log("Combined file created:", file.name);

   
    
    
    return file; // Return the file for further processing (download, send, etc.)
}
