"use client";

import dynamic from 'next/dynamic';

const CropVideo = dynamic(() => import('../components/CropVersion/CropVideo'), {
  ssr: false
});

export default function Home() {
    return (
        <div style={styles.container}>
            <CropVideo />
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
