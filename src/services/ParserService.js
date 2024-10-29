// services/csvService.js
import Papa from 'papaparse';

// Parse CSV file and return structured data
export function parseCSV(file, onComplete, onError) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
            // Handle parsing errors
            if (results.errors.length > 0) {
                if (onError) {
                    onError("Error parsing CSV file. Check the console for details.");
                }
                console.error("CSV Parsing Errors:", results.errors);
                return;
            }

            // Extract valid data
            const validData = extractValidData(results.data);

            if (validData.length === 0) {
                if (onError) {
                    onError("No valid data found in CSV.");
                }
                console.error("No valid data found.");
                return;
            }

            // Extract signals and timestamps
            const { timestamps, signalX, signalY, signalZ } = extractSignals(validData);

            // Prepare chart data
            const chartData = formatChartData(timestamps, signalX, signalY, signalZ);

            if (onComplete) {
                onComplete(chartData);
            }
        },
        error: (error) => {
            if (onError) {
                onError("Error parsing CSV: " + error.message);
            }
            console.error("Error parsing CSV: ", error);
        }
    });
}

// Extract valid rows of data (removing invalid rows)
function extractValidData(data) {
    return data.filter(row =>
        row.timestamp !== undefined &&
        row.x !== undefined &&
        row.y !== undefined &&
        row.z !== undefined &&
        row.timestamp !== '' &&
        row.x !== '' &&
        row.y !== '' &&
        row.z !== ''
    );
}

// Extract timestamp and signal data for each axis
function extractSignals(data) {
    const timestamps = data.map(row => row.timestamp);
    const signalX = data.map(row => row.x);
    const signalY = data.map(row => row.y);
    const signalZ = data.map(row => row.z);

    return { timestamps, signalX, signalY, signalZ };
}

// Format the extracted data for plotting (e.g., Plotly)
function formatChartData(timestamps, signalX, signalY, signalZ) {
    return [
        { x: timestamps, y: signalX, type: 'scatter', mode: 'lines', line: { color: 'red' } },
        { x: timestamps, y: signalY, type: 'scatter', mode: 'lines', line: { color: 'green' } },
        { x: timestamps, y: signalZ, type: 'scatter', mode: 'lines', line: { color: 'blue' } }
    ];
}