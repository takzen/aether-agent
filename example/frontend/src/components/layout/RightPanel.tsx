
import React from 'react';
import { Vote, TrendingUp } from 'lucide-react';
import { TOP_RANKING } from '../../lib/constants';

const RightPanel: React.FC = () => {
    return (
        <aside style={{
            padding: '2rem',
            overflowY: 'auto'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

                {/* DIAGNOSTIC CHART */}
                <div className="tech-border" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                    <h4 className="hud-label" style={{ marginBottom: '1rem' }}>INTENSYWNOŚĆ_ABSURDU_24H</h4>
                    <svg viewBox="0 0 300 100" style={{ width: '100%', height: '80px', borderBottom: '1px solid #333', borderLeft: '1px solid #333', overflow: 'hidden' }}>
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.2 }} />
                                <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                            </linearGradient>
                        </defs>
                        {/* Linear Path (Safe & Technical) */}
                        <path d="M0,80 L40,70 L80,90 L120,50 L160,80 L200,40 L240,60 L280,30 L300,50 L300,100 L0,100 Z" fill="url(#grad1)" />
                        <path d="M0,80 L40,70 L80,90 L120,50 L160,80 L200,40 L240,60 L280,30 L300,50" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />
                        {/* Marker Circle */}
                        <circle cx="280" cy="30" r="3" fill="#fff" />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '9px', color: '#666' }}>
                        <span>00:00</span>
                        <span>12:00</span>
                        <span>24:00</span>
                    </div>
                </div>

                {/* TOP RANKING */}
                <div>
                    <h4 className="hud-label" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        TOP_RANKING_ABSURDÓW
                        <TrendingUp size={14} color="var(--accent)" />
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {TOP_RANKING.map((item, index) => (
                            <div key={item.id} className="tech-border" style={{
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: index === 0 ? 'rgba(255,140,0,0.05)' : 'transparent',
                                borderColor: index === 0 ? 'var(--accent)' : '#222'
                            }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        fontSize: '18px', fontWeight: 'bold', color: index === 0 ? 'var(--accent)' : '#444',
                                        width: '24px', textAlign: 'center'
                                    }}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>{item.title}</div>
                                        <div style={{ fontSize: '9px', color: '#666' }}>ID: {item.id}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 'bold' }}>{item.score}</div>
                                    <div style={{ fontSize: '8px', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                                        <Vote size={8} /> GŁOSY
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SYSTEM HEALTH */}
                <div style={{ padding: '1.5rem', border: '1px dashed #333', marginTop: 'auto' }}>
                    <div style={{ fontSize: '9px', color: '#666', marginBottom: '1rem' }}>SYSTEM_HEALTH_METRICS</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div style={{ fontSize: '13px', color: '#fff' }}>#ParadoksPieczątki</div>
                        <div style={{ fontSize: '9px', color: '#555' }}>Status: Faza_Krytyczna</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', color: '#fff' }}>#CzynnyŻalOnline</div>
                        <div style={{ fontSize: '9px', color: '#555' }}>Status: Analiza_W_Toku</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RightPanel;
