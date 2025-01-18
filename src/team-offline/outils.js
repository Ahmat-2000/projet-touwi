import { receiveFile, saveModificationFile, saveNewFile, receiveVideoTimers } from "@/team-offline/requests";

export const getRowWithTimestamp = async(sensor, axis, fileName) => {

  // Returns the .touwi file content
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
      throw new Error("File content not found or empty.");
  }

  // Determines the column index based on the sensor and axis
  const headers = touwiContent.split("\n")[0].split(",");
  let axisColumn;
  if (axis === ''){
    axisColumn = sensor;
  }
  else{
    axisColumn = `${sensor}_${axis}`;
  }
  const timestampIndex = headers.indexOf("timestamp");
  const axisIndex = headers.indexOf(axisColumn);
 

  const res = [[],[]]
  

  // Retrieves the columns 
  const rows = touwiContent.trim().split("\n").slice(1);

  // Iterates through timestamps and columns
  rows.forEach(row => {
      const columns = row.split(",");
      const timestamp = columns[timestampIndex];
      const axisValue = columns[axisIndex];

      res[0].push(timestamp)
      res[1].push(axisValue)
  });
  
  return res
}

export const getReducedRowsWithTimestamp = async(sensor, axis, fileName, start, end) => {
  // Returns the .touwi file content
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
    throw new Error("File content not found or empty.");
  }

  // Determines the column index based on the sensor and axis
  const headers = touwiContent.split("\n")[0].split(",");
  let axisColumn;
  if (axis === '') {
    axisColumn = sensor;
  }
  else {
    axisColumn = `${sensor}_${axis}`;
  }
  const timestampIndex = headers.indexOf("timestamp");
  const axisIndex = headers.indexOf(axisColumn);


  const res = [[], []]


  // Retrieves the columns 
  const rows = touwiContent.trim().split("\n").slice(1);

  // Iterates through timestamps and columns
  rows.forEach(row => {
    const columns = row.split(",");
    const timestamp = columns[timestampIndex];
    const axisValue = columns[axisIndex];


    if (timestamp >= start && timestamp <= end) {
      res[0].push(timestamp)
      res[1].push(axisValue)
    }
  });

  return res
}

// Function to update a label by timestamp
export const updateLabelByTimestamp = async (timestamp, newLabel, fileName) => {
  // Loads the file content
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
    throw new Error("File content not found or empty.");
  }

  // Divides the content into lines
  const rows = touwiContent.trim().split("\n");

  // Extracts the header and data rows
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Converts the target timestamp to a string for correct comparison
  const targetTimestamp = String(timestamp);

  console.log("Starting label update...");

  // Searches for the timestamp and updates the label if found
  const updatedDataRows = dataRows.map(row => {
    const columns = row.split(",");
    if (columns[0] === targetTimestamp) {  // Comparison with the timestamp as a string
      console.log(`Updating label for timestamp ${targetTimestamp}`);
      columns[columns.length - 1] = newLabel;  // Updates the last element (LABEL)
    }
    return columns.join(",");
  });

  // Reconstructs the file content with the updates
  const updatedContent = [header, ...updatedDataRows].join("\n");

  // Creates a Blob and a file to save the updates
  const blob = new Blob([updatedContent], { type: 'text/csv' });
  const file = new File([blob], fileName, { type: 'text/csv', lastModified: new Date() });

  // Verification of save
  const saveResult = await saveNewFile(file);
}

// Function to update labels from one timestamp to another
export const periodUpdate = async (timestamp_debut, timestamp_fin,new_label,fileName) => {

  if (timestamp_debut === undefined || timestamp_fin === undefined || new_label === undefined || fileName === undefined) {
    console.error(`One of the required parameters is not set properly : timestamp_debut{${timestamp_debut}}, timestamp_fin{${timestamp_fin}}, new_label{${new_label}}, fileName{${fileName}}`);
  }
  console.log('Period added from ' + timestamp_debut + ' to ' + timestamp_fin + ' with label ' + new_label);

  // Loads the file content
  const touwiContent = await receiveFile(fileName);

  if (!touwiContent) {
    throw new Error("File content not found or empty.");
  }

  // Divides the content into lines
  const rows = touwiContent.trim().split("\n");

  // Extracts the header and data rows
  const header = rows[0];
  const dataRows = rows.slice(1);

  // Converts the target timestamps to strings for correct comparison
  const targetStartTimestamp = String(timestamp_debut);
  const targetEndTimestamp = String(timestamp_fin);

  // Searches for the timestamps and updates the label if found
  const updatedDataRows = dataRows.map(row => {
    const columns = row.split(",");
    const currentTimestamp = columns[0];

    // Checks if the timestamp is within the defined range
    if (currentTimestamp >= targetStartTimestamp && currentTimestamp <= targetEndTimestamp) {
      columns[columns.length - 1] = new_label;  // Updates the last element (LABEL)
    }
    return columns.join(",");
  });

  const updatedContent = [header, ...updatedDataRows].join("\n");

  const blob = new Blob([updatedContent], { type: 'text/csv' });
  const file = new File([blob], fileName, { type: 'text/csv', lastModified: new Date() });

  await saveNewFile(file);// Returns the modified file content as text

}

export const getVideoTimers = async (fileName) => {
  const videoTimers = await receiveVideoTimers(fileName);
  const jsonVideoTimers = JSON.parse(videoTimers);
  return jsonVideoTimers[fileName];
}
