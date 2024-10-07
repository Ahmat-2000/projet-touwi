import Link from 'next/link';
import FrontEndComponent from "@/team-graphique/FrontEndComponent";

export default function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Comparative Study of Plotly.js and Highcharts.js</h1>
      <p style={styles.description}>
        Explore the power of two leading libraries for data visualization: <strong>Plotly.js</strong> and <strong>Highcharts.js</strong>. Click below to see the demos.
      </p>
      <div style={styles.menu}>
        <Link href="/team-graphes/plotly">
          <button className="stylishButton" style={styles.button}>Plotly.js Demo</button>
        </Link>
        <Link href="/team-graphes/highcharts">
          <button className="stylishButton" style={styles.button}>Highcharts.js Demo</button>
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
    textAlign: 'center',
    padding: '20px',
  },
  title: {
    margin: '0',
    fontSize: '36px', // Increased text size for the title
    color: '#333',
  },
  description: {
    margin: '20px 0',
    fontSize: '20px', // Increased text size for the description
    color: '#555',
  },
  menu: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  button: {
    padding: '15px 30px', // Larger padding for buttons
    fontSize: '18px', // Increased font size for buttons
    color: '#fff',
    backgroundColor: '#0070f3', // Stylish background color (Next.js blue)
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s', // Transition effects
  },
};

// Add hover effect for buttons
const buttonStyles = `
  .stylishButton:hover {
    background-color: #005bb5; // Darker blue on hover
    transform: scale(1.05); // Slightly enlarge button on hover
  }
`;

// Append styles to the head of the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = buttonStyles;
  document.head.appendChild(styleSheet);
}
