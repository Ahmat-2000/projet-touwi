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
        backgroundColor: '#f9f9f9',
        minHeight: '100vh',
    },
};
