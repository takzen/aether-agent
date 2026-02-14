
import React from 'react';
import { Terminal } from 'lucide-react';

const DataSheetView: React.FC = () => {
    return (
        <div style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto' }}>
            <div className="tech-border" style={{ padding: '3rem', background: 'rgba(5,5,5,0.8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '10px', marginBottom: '0.5rem' }}>[ SYSTEM_SPECIFICATION ]</div>
                        <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>ARKUSZ DANYCH</h2>
                    </div>
                    <Terminal size={32} color="var(--accent)" />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#aaa' }}>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '1rem', color: '#666' }}>WERSJA_JĄDRA</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>v3.0.4_ABSURD_CORE</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '1rem', color: '#666' }}>LICZBA_WĘZŁÓW</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>12 (Active) / 4 (Dormant)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '1rem', color: '#666' }}>MOC_OBLICZENIOWA</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>64 PetaFLOPS (Symulacja Urzędu)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #222' }}>
                            <td style={{ padding: '1rem', color: '#666' }}>BAZA_DANYCH</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>Distributed Ledger (Bieg_Chain)</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', color: '#666' }}>STREFA_OPERACYJNA</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>PL_WAW_CENTRAL</td>
                        </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '4rem', padding: '1rem', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#333', fontSize: '9px' }}>PODPISANO: AGENT_AUDITOR // ANTIGRAVITY</div>
                    <div style={{ color: 'var(--accent)', fontSize: '9px' }}>STATUS: ZATWIERDZONE</div>
                </div>
            </div>
        </div>
    );
};

export default DataSheetView;
