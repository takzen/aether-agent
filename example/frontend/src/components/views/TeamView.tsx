
import React from 'react';
import { AGENT_CONFIG } from '../../lib/constants';

const TeamView: React.FC = () => {
    return (
        <div style={{ padding: '3rem' }}>
            <div className="hud-label" style={{ marginBottom: '2rem' }}>Struktura_Zespołu_Obszar_PL</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                    <div key={id} className="tech-border" style={{ padding: '1.5rem', background: 'rgba(255,140,0,0.02)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <config.icon size={24} color={config.color} />
                            <div>
                                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>{config.name}</div>
                                <div style={{ color: config.color, fontSize: '10px' }}>PROFIL: {config.role}</div>
                            </div>
                        </div>
                        <div style={{ color: '#666', fontSize: '11px', lineHeight: '1.6' }}>
                            Zasoby poznawcze: 100%<br />
                            Tryb pracy: ANALIZA_CIĄGŁA<br />
                            Lokalizacja: Węzeł_Chmurowy_G-3
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamView;
