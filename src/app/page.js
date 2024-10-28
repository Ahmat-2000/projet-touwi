import Link from 'next/link';
import BaseApp from './team-graphes/components/BaseApp';
import App from './team-graphes/components/Demo Plots/App';

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plotly.js Demo</h1>
      <App /> {/* Fonctionnement Plots */}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
  },
  description: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#555',
    marginBottom: '20px',
  },
};


/*

//Team Graphes side use this :
function fetchData(sensor, axis) {
  const data = [];
  axis.forEach(ax => {
    data.push(readAndGetColumFromCSV(sensor, ax));
  });

  const timestamp = readAndGetColumFromCSV(sensor, 'timestamp');
  return [timestamp, data];
}

//With this type of functions from Team Offline :
function readAndGetColumFromCSV(sensor, axis) {

  const simulatedData = {
    Accelerometer: {
      x: readColumn(),
      y: readColumn(),
      z: readColumn()
    },
    Gyroscope: {
      x: readColumn(),
      y: readColumn(),
      z: readColumn()
    },
    timestamp: readColumn()
  };

  // Case we want Timestamps
  if (typeof axis === 'undefined') {
    return simulatedData[sensor];
  }

  // Case we want a specific axis
  return simulatedData[sensor][axis];
}

function readColumn() {
  //read and return entire column from the .touwi file
}

//Example :
// I want to get accel x, gyro y and z, and timestamps :
const accelX, gyroY, gyroZ, timestamps = fetchData('Accelerometer', ['x'], 'Gyroscope', ['y', 'z']);



object = {
  timestamps,
  data_signal
}

*/