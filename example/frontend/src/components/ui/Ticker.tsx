
import React from 'react';

const Ticker: React.FC = () => {
    return (
        <div style={{
            background: 'rgba(0,255,65,0.05)',
            borderBottom: '1px solid #111',
            padding: '0.5rem',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontFamily: 'monospace',
            fontSize: '9px',
            color: 'var(--acid-green)',
            letterSpacing: '1px',
            pointerEvents: 'none',
            userSelect: 'none'
        }}>
            <div style={{ display: 'inline-block', animation: 'marquee 30s linear infinite' }}>
                [SYSTEM] WĘZEŁ_WAW: ONLINE ... [SCOUT] SKANOWANIE BIP_KRAKÓW: ZAKOŃCZONE ... [LEGALIST] ANALIZA PRAWNA USTAWY #442 ... [AUDITOR] WYKRYTO NOWĄ ANOMALIĘ POZIOM 4 ... [MODERNIST] AKTUALIZACJA PROTOKOŁU ... [SYSTEM] WĘZEŁ_WAW: STABILNY ... [BUREAUCRAT] GENEROWANIE RAPORTU ODCINKOWEGO ...
            </div>
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default Ticker;
