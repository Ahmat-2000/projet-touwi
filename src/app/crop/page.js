import CropVideo from '../components/CropVersion/CropVideo';


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
