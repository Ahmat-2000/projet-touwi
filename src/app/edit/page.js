import App from '../components/App';

export default function Home() {
  return (
    <div style={styles.container}>
      <App/>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    minHeight: '100vh',
  },
};
