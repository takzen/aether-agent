import React, { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Database, RefreshCw, LogOut, CheckCircle, XCircle, Search, Clock } from 'lucide-react';

interface AdminDashboardViewProps {
    onLogout: () => void;
    adminCode: string;
    triggerNotification: (text: string, type?: 'success' | 'error') => void;
    onReportProcessed?: () => void;
}

interface Report {
    id: string;
    title: string;
    content: string;
    location: string | null;
    status: string;
    created_at: string;
    source_url?: string | null;
}

const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onLogout, adminCode, triggerNotification, onReportProcessed }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [scoutRunning, setScoutRunning] = useState(false);
    const [scoutStatus, setScoutStatus] = useState<{
        last_mission: string | null;
        worker_enabled: boolean;
        cron_schedule: string;
        last_status: string;
    }>({
        last_mission: null,
        worker_enabled: true,
        cron_schedule: '0 6 * * *',
        last_status: 'ready'
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

    const fetchScoutStatus = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/api/scout/status`, {
                headers: { 'X-API-KEY': adminCode }
            });
            if (response.ok) {
                const data = await response.json();
                setScoutStatus({
                    last_mission: data.last_mission,
                    worker_enabled: data.worker_enabled,
                    cron_schedule: data.cron_schedule,
                    last_status: data.last_status
                });
            }
        } catch (err) {
            console.error('Błąd pobierania statusu Scouta:', err);
        }
    }, [adminCode, API_URL]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/reports`, {
                headers: {
                    'X-API-KEY': adminCode
                }
            });

            if (!response.ok) throw new Error('Błąd autoryzacji lub połączenia');

            const data = await response.json();
            setReports(data || []);
        } catch (err) {
            console.error('Błąd pobierania zgłoszeń:', err);
        } finally {
            setLoading(false);
        }
    }, [adminCode, API_URL]);

    const handleApprove = async (id: string) => {
        setLoading(true);
        try {
            const aiResponse = await fetch(`${API_URL}/api/reports/${id}/process`, {
                method: 'POST',
                headers: {
                    'X-API-KEY': adminCode
                }
            });

            if (!aiResponse.ok) {
                const errData = await aiResponse.json();
                throw new Error(errData.detail || 'Błąd silnika AI');
            }

            await aiResponse.json();
            fetchReports();
            if (onReportProcessed) onReportProcessed();
            triggerNotification(`ANALIZA_URUCHOMIONA: System pracuje...`);
        } catch (err) {
            console.error('Błąd procesowania:', err);
            const message = err instanceof Error ? err.message : 'Nieznany błąd';
            triggerNotification(`BŁĄD_SYSTEMU: ${message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Czy na pewno chcesz usunąć to zgłoszenie z bazy?')) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/reports/${id}`, {
                method: 'DELETE',
                headers: { 'X-API-KEY': adminCode }
            });
            if (!response.ok) throw new Error('Błąd usuwania');
            fetchReports();
            if (onReportProcessed) onReportProcessed();
            triggerNotification('USUNIĘTO_POMYŚLNIE', 'success');
        } catch (err) {
            console.error('Błąd usuwania:', err);
            triggerNotification('BŁĄD_USUWANIA', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleScoutMission = async () => {
        setScoutRunning(true);
        try {
            const response = await fetch(`${API_URL}/api/scout/mission`, {
                method: 'POST',
                headers: { 'X-API-KEY': adminCode }
            });
            if (!response.ok) throw new Error('Błąd misji Scouta');
            const result = await response.json();
            triggerNotification(`SCOUT_RAPORT: ${result.message}`, 'success');
            fetchScoutStatus();
            fetchReports();
        } catch {
            triggerNotification('SCOUT_ERROR: Misja przerwana', 'error');
        } finally {
            setScoutRunning(false);
        }
    };

    const handleToggleWorker = async () => {
        const newState = !scoutStatus.worker_enabled;
        try {
            const response = await fetch(`${API_URL}/api/scout/toggle-worker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': adminCode
                },
                body: JSON.stringify({ enabled: newState })
            });
            if (response.ok) {
                setScoutStatus(prev => ({ ...prev, worker_enabled: newState }));
                triggerNotification(`WORKER: ${newState ? 'AKTYWNY' : 'DEZAKTYWOWANY'}`, 'success');
            }
        } catch {
            triggerNotification('BŁĄD_USTAWIŃ_WORKERA', 'error');
        }
    };

    useEffect(() => {
        fetchReports();
        fetchScoutStatus();
    }, [fetchReports, fetchScoutStatus]);


    return (
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ color: 'var(--accent)', fontSize: '10px', letterSpacing: '4px' }}>[ PANEL_ADMINISTRACYJNY ]</div>
                    <h2 style={{ fontSize: '2rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>CENTRUM KONTROLI</h2>
                </div>

                <button
                    onClick={onLogout}
                    style={{
                        background: 'rgba(255,51,51,0.1)',
                        border: '1px solid var(--error)',
                        color: 'var(--error)',
                        padding: '0.8rem 1.5rem',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.8rem',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={14} /> WYLOGUJ SESJĘ
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat( auto-fit, minmax(300px, 1fr) )', gap: '2rem', marginBottom: '4rem' }}>
                {/* SYSTEM STATS */}
                <div className="tech-border" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                        <LayoutDashboard size={20} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>STATYSTYKI SYSTEMU</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Zgłoszenia ogółem:</span>
                            <span style={{ color: '#fff' }}>{reports.length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Oczekujące na analizę:</span>
                            <span style={{ color: 'var(--warning)' }}>{reports.filter(r => r.status === 'pending').length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Przeanalizowane (AI):</span>
                            <span style={{ color: 'var(--acid-green)' }}>{reports.filter(r => r.status === 'approved').length}</span>
                        </div>
                    </div>
                </div>

                {/* DB STATUS */}
                <div className="tech-border" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                        <Database size={20} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>BAZA DANYCH ABSURDÓW</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Analizy w archiwum:</span>
                            <span style={{ color: '#fff' }}>{reports.filter(r => r.status === 'approved').length}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Ostatni sygnał:</span>
                            <span style={{ color: 'var(--acid-green)' }}>
                                {reports.length > 0
                                    ? new Date(reports[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : 'BRAK DANYCH'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Integracja Supabase:</span>
                            <span style={{ color: 'var(--acid-green)' }}>POŁĄCZONO</span>
                        </div>
                    </div>
                </div>

                {/* SCOUT CONTROL */}
                <div className="tech-border" style={{ padding: '1.5rem', background: 'rgba(0,255,100,0.02)', borderColor: 'rgba(0,255,100,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--acid-green)' }}>
                        <Search size={20} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>WYWIAD SCOUTA (Tavily)</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Status API:</span>
                            <span style={{ color: 'var(--acid-green)' }}>GOTOWY</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#555' }}>Ostatnia misja:</span>
                            <span style={{ color: scoutStatus.last_mission ? 'var(--acid-green)' : '#666' }}>
                                {scoutStatus.last_mission ? new Date(scoutStatus.last_mission).toLocaleString() : 'BRAK'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#555', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Clock size={12} /> Cron (06:00):
                            </span>
                            <button
                                onClick={handleToggleWorker}
                                style={{
                                    background: scoutStatus.worker_enabled ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                                    border: `1px solid ${scoutStatus.worker_enabled ? 'var(--acid-green)' : 'var(--error)'}`,
                                    color: scoutStatus.worker_enabled ? 'var(--acid-green)' : 'var(--error)',
                                    fontSize: '9px',
                                    padding: '2px 8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {scoutStatus.worker_enabled ? 'AKTYWNY' : 'WYŁĄCZONY'}
                            </button>
                        </div>
                        <button
                            onClick={handleScoutMission}
                            disabled={scoutRunning}
                            style={{
                                marginTop: '0.5rem',
                                background: scoutRunning ? 'rgba(100,100,100,0.2)' : 'rgba(0,255,100,0.1)',
                                border: '1px solid var(--acid-green)',
                                color: 'var(--acid-green)',
                                padding: '0.8rem 1rem',
                                fontSize: '11px',
                                cursor: scoutRunning ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.8rem',
                                width: '100%'
                            }}
                        >
                            <Search size={14} className={scoutRunning ? 'spin-animation' : ''} />
                            {scoutRunning ? 'SKANOWANIE SIECI...' : 'URUCHOM WYWIAD'}
                        </button>
                        <div style={{ fontSize: '9px', color: '#444', textAlign: 'center' }}>
                            ⚠️ Zużywa API Tavily - manualnie max 1x dziennie
                        </div>
                    </div>
                </div>

            </div>


            {/* REPORTS SECTION */}
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 className="hud-label">Zgłoszenia Obywatelskie ({reports.length})</h3>
                    <button
                        onClick={fetchReports}
                        className="system-btn"
                        style={{ fontSize: '10px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <RefreshCw size={12} className={loading ? "spin-animation" : ""} /> ODŚWIEŻ
                    </button>
                </div>

                {loading && reports.length === 0 ? (
                    <div style={{ color: '#666', fontSize: '12px', padding: '2rem', textAlign: 'center' }}>Ładowanie strumienia danych...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {reports.map((report) => (
                            <div key={report.id} className="tech-border" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderLeft: report.status === 'approved' ? '3px solid var(--acid-green)' : '3px solid var(--accent)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{report.title}</div>
                                    <div style={{ fontSize: '10px', color: report.status === 'pending' ? 'var(--warning)' : report.status === 'approved' ? 'var(--acid-green)' : '#666', textTransform: 'uppercase', border: '1px solid #333', padding: '2px 8px' }}>
                                        {report.status}
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '1rem', lineHeight: '1.6' }}>
                                    {report.content}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#555' }}>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <span>LOKALIZACJA: {report.location || 'BRAK'}</span>
                                        <span>DATA: {new Date(report.created_at).toLocaleString()}</span>
                                        {report.source_url && (
                                            <a
                                                href={report.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: 'var(--acid-green)', textDecoration: 'none' }}
                                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                            >
                                                [KLIKNIJ_DLA_DOWODU]
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', transition: 'color 0.2s' }}
                                            title="Usuń trwale"
                                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                        >
                                            <XCircle size={16} />
                                        </button>

                                        {report.status !== 'approved' && (
                                            <button
                                                onClick={() => handleApprove(report.id)}
                                                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', transition: 'color 0.2s' }}
                                                title="Zatwierdź do analizy AI"
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--acid-green)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                            >
                                                <CheckCircle size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {reports.length === 0 && (
                            <div style={{ color: '#666', fontSize: '12px', padding: '2rem', textAlign: 'center', border: '1px dashed #333' }}>
                                Brak nowych zgłoszeń w systemie. Obywatele śpią spokojnie.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardView;
