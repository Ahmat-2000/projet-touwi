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
    backgroundColor: '#e1ebff',
    minHeight: '100vh',
  },
};
