"use client";

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../components/App'), {
  ssr: false
});

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
