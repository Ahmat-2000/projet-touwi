import Link from 'next/link';
import BaseApp from './team-graphes/components/BaseApp';

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Plotly.js Demo</h1>
      <BaseApp />
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
