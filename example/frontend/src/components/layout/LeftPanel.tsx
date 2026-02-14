
import React from 'react';
import { Activity } from 'lucide-react';
import { AGENT_CONFIG } from '../../lib/constants';

const LeftPanel: React.FC = () => {
    return (
        <aside style={{
            padding: '2rem',
            borderRight: '1px solid var(--border)',
            overflowY: 'auto',
            background: 'rgba(5,5,5,0.8)'
        }}>
            <h4 className="hud-label" style={{ marginBottom: '2rem' }}>SIATKA_AGENTÓW</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* ACTIVE NODES */}
                {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.8 }}>
                        <div style={{ position: 'relative' }}>
                            <config.icon size={16} color={config.color} />
                            <div className="status-dot" style={{ background: config.color }}></div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ccc' }}>AGENT_{config.name.toUpperCase()}</div>
                            <div style={{ fontSize: '9px', color: '#555' }}>ROLA: {config.role}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* SYSTEM LOGS */}
            <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #222' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#666' }}>
                    <Activity size={12} />
                    <span className="hud-label">LOGI_SYSTEMOWE</span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#444', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                        <span style={{ color: 'var(--accent)' }}>[14:02:11]</span>
                        <span style={{ marginLeft: '8px' }}>Wykryto nową anomalię w Sektorze ZUS...</span>
                    </div>
                    <div>
                        <span style={{ color: '#555' }}>[13:58:32]</span>
                        <span style={{ marginLeft: '8px' }}>Agent_Scout rozpoczął skanowanie...</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--error)' }}>[13:45:10]</span>
                        <span style={{ marginLeft: '8px' }}>Błąd krytyczny: Pętla logiczna w ustawie...</span>
                    </div>
                    <div>
                        <span style={{ color: '#555' }}>[12:30:45]</span>
                        <span style={{ marginLeft: '8px' }}>Synchronizacja węzłów zakończona.</span>
                    </div>
                    {/* Repeated logs for fill */}
                    <div style={{ opacity: 0.5 }}>
                        <span style={{ color: '#555' }}>[12:15:22]</span>
                        <span style={{ marginLeft: '8px' }}>Restart podsystemu &quot;Sens&quot;.</span>

                    </div>
                    <div style={{ opacity: 0.3 }}>
                        <span style={{ color: '#555' }}>[12:10:01]</span>
                        <span style={{ marginLeft: '8px' }}>Inicjalizacja protokołu...</span>
                    </div>
                </div>

                {/* STATUS BOX */}
                <section style={{ marginTop: '4rem', padding: '1rem', border: '1px dashed #333' }}>
                    <div className="hud-label" style={{ marginBottom: '1rem' }}>STAN_WĘZŁÓW</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                            <div key={id} style={{ fontSize: '11px' }}>
                                <div style={{ color: config.color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <config.icon size={12} />
                                    <span>[{id.toUpperCase()}] / {config.role}</span>
                                </div>
                                <div style={{ color: '#444', marginLeft: '1.2rem' }}>STATUS: WĘZEŁ_AKTYWNY</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </aside>
    );
};

export default LeftPanel;
