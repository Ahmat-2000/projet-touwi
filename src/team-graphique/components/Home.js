import Link from 'next/link';
import PlotlyGraph from "@/team-graphique/components/Plotly";   

export default function Home() {
    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Choose a page to visit:</h1>
            <nav>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li>
                        <Link href="/page1" style={{ fontSize: '20px', marginRight: '20px' }}>
                            Go to Page 1
                        </Link>
                    </li>
                    <li>
                        <Link href="/graph" style={{ fontSize: '20px', marginTop: '10px' }}>
                            Go to Page 2
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
