// file1 and file2 are File objects referencing the 2 csv files from the gyro and the accel.
// returns a File object referencing the touwi file (concatenation of the csv files and adding the label column)
export default async function csvToChronos(file1, file2, name) {
    console.log("Processing files:", file1, file2);

    // simple promise that returns the content of the file when finished reading
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    // wait for both files to be read
    const [content1, content2] = await Promise.all([readFile(file1), readFile(file2)]);

    // Process the content of both files
    function processFileContent(content) {
        const lines = content.split("\n");
        const headers = lines.shift().split(",");
        const data = lines.map(line => line.split(","));
        return { headers, data };
    }

    const { headers: headers1, data: data1 } = processFileContent(content1);
    const { headers: headers2, data: data2 } = processFileContent(content2);

    // Find the timestamps for filtering
    const minTimestamp1 = Math.min(...data1.map(row => row[0]));
    const minTimestamp2 = Math.min(...data2.map(row => row[0]));
    const startTimestamp = Math.max(minTimestamp1, minTimestamp2); 

    const maxTimestamp1 = Math.max(...data1.map(row => row[0]));
    const maxTimestamp2 = Math.max(...data2.map(row => row[0]));
    const endTimestamp = Math.min(maxTimestamp1, maxTimestamp2); 

    // Filter the data based on timestamps
    const filteredData1 = data1.filter(row => row[0] >= startTimestamp && row[0] <= endTimestamp);
    const filteredData2 = data2.filter(row => row[0] >= startTimestamp && row[0] <= endTimestamp);

    // Combine the data
    const combinedHeaders = ["timestamp", ...headers1.slice(1), ...headers2.slice(1)];
    let combinedData = combinedHeaders.join(",") + "\n";

    for (let i = 0; i < filteredData1.length; i++) {
        combinedData += `${filteredData1[i][0]},${filteredData1[i].slice(1).join(",")},${filteredData2[i].slice(1).join(",")}\n`;
    }

    // Create a Blob from the combined data
    const blob = new Blob([combinedData], { type: 'text/csv' });
    const fileName = name || 'combined.csv'; // Use a default name if not provided

    console.log("File created:", fileName);

    // Create a File object from the Blob
    const file = new File([blob], fileName, {
        type: 'text/csv',
        lastModified: new Date()
    });

    return file; // Return the File object
}
