import React, { useState, useEffect } from 'react';
import { BarChart3, Activity, Users, ShieldAlert, Cpu, Network } from 'lucide-react';

interface StatsData {
    total_debates: number;
    total_reports: number;
    total_confirmations: number;
    average_absurd_score: number;
    total_messages: number;
    system_status: string;
    redundancy_level: string;
}

const StatsView: React.FC = () => {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                const res = await fetch(`${API_URL}/api/stats/`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Odświeżaj co 30s
        return () => clearInterval(interval);
    }, []);

    const StatBox = ({ label, value, icon: Icon, color }: { label: string, value: string | number, icon: React.ElementType, color: string }) => (
        <div className="tech-border" style={{
            padding: '1.5rem',
            background: 'rgba(255,255,255,0.01)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                <Icon size={80} color={color} />
            </div>
            <div style={{ fontSize: '10px', color: '#666', letterSpacing: '2px', fontWeight: 'bold' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: '2rem', color: color, fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>
                {value}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--accent)' }}>
                <Activity className="spin-animation" /> <span style={{ marginLeft: '1rem' }}>POBIERANIE_DANYCH_ANALITYCZNYCH...</span>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ color: 'var(--acid-green)', fontSize: '10px', letterSpacing: '4px' }}>[ MONITORING_SYSTEMOWY ]</div>
                <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>ANALYTICS_DASHBOARD</h2>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Globalne metryki absurdu i wydajności agentów AI.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <StatBox label="Wykryte Absurdy" value={stats?.total_debates || 0} icon={ShieldAlert} color="var(--accent)" />
                <StatBox label="Średni Absurd Score" value={`${stats?.average_absurd_score || 0}%`} icon={BarChart3} color="var(--error)" />
                <StatBox label="Głosy Obywatelskie" value={stats?.total_confirmations || 0} icon={Users} color="var(--acid-green)" />
                <StatBox label="Przetworzone Sygnały" value={stats?.total_reports || 0} icon={Network} color="#00ffff" />
                <StatBox label="Interakcje AI" value={stats?.total_messages || 0} icon={Cpu} color="#ff00ff" />
                <StatBox label="Status Systemu" value={stats?.system_status || 'OFFLINE'} icon={Activity} color={stats?.system_status === 'OPERATIONAL' ? 'var(--acid-green)' : 'var(--error)'} />
            </div>

            <div className="tech-border" style={{ padding: '2rem', background: 'rgba(173,255,47,0.02)' }}>
                <h4 className="hud-label" style={{ marginBottom: '1.5rem' }}>Diagnostyka Węzła</h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                            <span style={{ color: '#666' }}>INTEGRALNOŚĆ_BAZY</span>
                            <span style={{ color: 'var(--acid-green)', whiteSpace: 'nowrap' }}>[ STABLE ]</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '100%', width: '94%', background: 'var(--acid-green)' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                            <span style={{ color: '#666' }}>REDUNDANCJA_DANYCH</span>
                            <span style={{ color: 'var(--acid-green)', whiteSpace: 'nowrap' }}>{stats?.redundancy_level}</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '100%', width: '99.8%', background: 'var(--acid-green)' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                            <span style={{ color: '#666' }}>LATENCJA_AGENTA</span>
                            <span style={{ color: 'var(--accent)', whiteSpace: 'nowrap' }}>[ 1.2s ]</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '100%', width: '82%', background: 'var(--accent)' }}></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                            <span style={{ color: '#666' }}>PRZEPUSTOWOŚĆ_API</span>
                            <span style={{ color: 'var(--acid-green)', whiteSpace: 'nowrap' }}>[ HIGH ]</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '100%', width: '100%', background: 'var(--acid-green)' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsView;
