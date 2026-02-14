'use client';

import { useState, useEffect, useCallback } from "react";
import {
    Users, ShieldAlert,
    Activity, TrendingUp, Zap, Vote,
    ShieldCheck,
    Menu, X, Terminal, BarChart3
} from "lucide-react";

import { AGENT_CONFIG } from '@/lib/constants';

import { supabase } from '@/lib/supabaseClient';

interface RankingItem {
    id: string;
    title: string;
    score: number;
}

import Footer from "@/components/layout/Footer";
import CookieNotice from "@/components/modals/CookieNotice";
import PrivacyView from "@/components/views/PrivacyView";
import AdminLogin from "@/components/views/AdminLogin";
import AdminDashboardView from "@/components/views/AdminDashboardView";
import ReportView from "@/components/views/ReportView";
import ManifestView from "@/components/views/ManifestView";
import DashboardView from "@/components/views/DashboardView";
import ArchiveView from "@/components/views/ArchiveView";
import LandingView from "@/components/views/LandingView";
import StatsView from "@/components/views/StatsView";

export default function Home() {
    const [activeView, setActiveView] = useState('landing'); // 'landing', 'live', 'archive', 'team', 'report_absurd', 'admin_login', 'admin_dashboard', 'manifest', 'privacy', 'analytics'
    const [showCookieNotice, setShowCookieNotice] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminCode, setAdminCode] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [trendingTags, setTrendingTags] = useState<string[]>([]);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [topRanking, setTopRanking] = useState<RankingItem[]>([]);
    const [totalDebates, setTotalDebates] = useState<number>(0);

    const triggerNotification = (text: string, type: string = 'success') => {
        setStatusMsg({ text, type: (type === 'error' ? 'error' : 'success') });
        setTimeout(() => setStatusMsg(null), 5000);
    };

    const handleViewChange = (view: string) => {
        setActiveView(view);
        setIsMobileMenuOpen(false);
    };

    const fetchTrendingTags = useCallback(async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const res = await fetch(`${API_URL}/api/tags`);
            if (res.ok) {
                const data = await res.json();
                setTrendingTags(data);
            }
        } catch (err) {
            console.error('Error fetching tags:', err);
        }
    }, []);

    const fetchTopRanking = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('debates')
                .select('id, title, absurd_score')
                .order('absurd_score', { ascending: false })
                .limit(7);

            if (error) throw error;

            if (data) {
                setTopRanking(data.map(d => ({
                    id: d.id,
                    title: d.title || 'Bez tytułu',
                    score: d.absurd_score || 0
                })));
            }
        } catch (err) {
            console.error('Error fetching ranking:', err);
        }
    }, []);

    const fetchTotalDebates = useCallback(async () => {
        try {
            const { count, error } = await supabase
                .from('debates')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            setTotalDebates(count || 0);
        } catch (err) {
            console.error('Error fetching total:', err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowCookieNotice(true), 1500);
        fetchTrendingTags();
        fetchTopRanking();
        fetchTotalDebates();
        return () => clearTimeout(timer);
    }, [fetchTrendingTags, fetchTopRanking, fetchTotalDebates]);

    return (
        <main className="app-container" style={{
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
            fontFamily: 'var(--font-mono)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative'
        }}>
            {statusMsg && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    zIndex: 99999,
                    background: 'rgba(0,0,0,0.4)', // Dim background to make it look like a window
                }}>
                    <div className="tech-border" style={{
                        padding: '2rem 3rem',
                        background: 'rgba(5,5,5,0.98)',
                        borderColor: statusMsg.type === 'success' ? 'var(--acid-green)' : 'var(--error)',
                        boxShadow: `0 0 50px rgba(0,0,0,1), 0 0 20px ${statusMsg.type === 'success' ? 'rgba(173,255,47,0.3)' : 'rgba(255,51,51,0.3)'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        gap: '1.5rem',
                        pointerEvents: 'auto',
                        animation: 'menu-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                    }}>
                        {statusMsg.type === 'success' ?
                            <ShieldCheck size={18} color="var(--acid-green)" /> :
                            <ShieldAlert size={18} color="var(--error)" />
                        }
                        <div>
                            <div style={{
                                fontSize: '8px',
                                color: statusMsg.type === 'success' ? 'var(--acid-green)' : 'var(--error)',
                                marginBottom: '2px',
                                letterSpacing: '2px'
                            }}>
                                [ SYSTEM_NOTIFICATION ]
                            </div>
                            <div style={{ fontSize: '11px', color: '#fff', letterSpacing: '1px', fontWeight: 'bold' }}>
                                {statusMsg.text}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeView === 'landing' ? (
                <LandingView onEnter={() => handleViewChange('live')} />
            ) : (
                <>
                    {/* TOP BRAND HEADER */}
                    <header style={{
                        padding: '1rem 2rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'rgba(5,5,5,0.95)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 1000,
                        flexShrink: 0
                    }}>
                        <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1 }}>
                            <div className="header-logo" style={{ position: 'relative', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleViewChange('live')}>
                                <svg viewBox="0 0 40 40" style={{ width: '100%', height: '100%' }}>
                                    <path className="animate-logo-pulse" d="M20 2 L36 11 L36 29 L20 38 L4 29 L4 11 Z" fill="none" stroke="var(--accent)" strokeWidth="0.5" opacity="0.3" />
                                    <path d="M20 5 L33 12.5 L33 27.5 L20 35 L7 12.5 L7 12.5 Z" fill="rgba(255,140,0,0.05)" />
                                    <path d="M18 15 L12 20 L18 25 Z M25 15 L19 20 L25 25 Z" fill="var(--accent)" opacity="0.1" />
                                    <text className="animate-logo-flicker" x="20" y="26" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="900" fontFamily="sans-serif" style={{ filter: 'drop-shadow(0 0 5px var(--accent))' }}>R</text>
                                    <circle className="animate-logo-spin" cx="20" cy="20" r="16" stroke="var(--accent)" strokeWidth="0.5" fill="none" strokeDasharray="10 20" />
                                </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <h1 onClick={() => handleViewChange('live')} style={{
                                    fontSize: '1.5rem',
                                    fontFamily: 'var(--font-heading)',
                                    margin: 0,
                                    letterSpacing: '2px',
                                    cursor: 'pointer',
                                    lineHeight: '1.1'
                                }}>
                                    BIEG <span style={{ color: 'var(--accent)' }}>WSTECZNY</span>
                                </h1>
                                <div className="hide-phone" style={{ fontSize: '9px', color: 'var(--accent)', opacity: 0.7, letterSpacing: '0.5px', fontWeight: 'bold', marginTop: '2px' }}>
                                    DISCLAIMER: SATYRA OPARTA NA FAKTACH // CHARAKTER EDUKACYJNY
                                </div>
                            </div>
                        </div>

                        {/* CENTER DONATION SECTION */}
                        <div className="header-donation hide-mobile" style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <div className="tech-border" style={{
                                padding: '0.4rem 1rem',
                                background: 'rgba(255,255,255,0.01)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <a
                                    href="https://buycoffee.to/takzen"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="system-btn"
                                    style={{
                                        fontSize: '9px',
                                        padding: '0.4rem 0.8rem',
                                        textDecoration: 'none',
                                        backgroundColor: 'rgba(173,255,47,0.1)',
                                        color: 'var(--acid-green)',
                                        borderColor: 'rgba(173,255,47,0.3)',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ☕ POSTAW KAWĘ
                                </a>
                                <div style={{ width: '1px', height: '12px', background: 'var(--border)' }}></div>
                                <a
                                    href="https://whydonate.com/fundraising/bieg-wsteczny-ai-ujawnia-absurdy-w-polsce"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="system-btn"
                                    style={{
                                        fontSize: '9px',
                                        padding: '0.4rem 0.8rem',
                                        textDecoration: 'none',
                                        backgroundColor: 'rgba(255,140,0,0.1)',
                                        color: 'var(--accent)',
                                        borderColor: 'rgba(255,140,0,0.3)',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ⚡ WESPRZYJ PROJEKT
                                </a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
                            <div className="header-stats hide-mobile" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '10px',
                                color: '#888',
                                fontWeight: 'bold',
                                letterSpacing: '0.5px'
                            }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--error)',
                                    animation: 'pulse 2s infinite'
                                }}></span>
                                <span>WYKRYTYCH:</span>
                                <span style={{ color: 'var(--accent)', fontSize: '12px' }}>{totalDebates}</span>
                            </div>
                            <button className="mobile-nav-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </header>

                    {activeView === 'admin_login' && !isAdminAuthenticated ? (
                        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AdminLogin
                                onLoginSuccess={(code) => {
                                    setAdminCode(code);
                                    setIsAdminAuthenticated(true);
                                    handleViewChange('admin_dashboard');
                                    triggerNotification('DOSTĘP_AUTORYZOWANY: WITAJ_ADMINIE');
                                }}
                                onGoHome={() => handleViewChange('live')}
                                triggerNotification={triggerNotification}
                            />
                        </div>
                    ) : (
                        <div className="main-layout" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                            {/* LEFT SIDEBAR */}
                            <aside className="left-sidebar" style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto' }}>
                                <section>
                                    <h4 className="hud-label">Nawigacja</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                        {[
                                            { id: 'live', label: 'Kanał_Live', icon: Activity },
                                            { id: 'archive', label: 'Logi_Archiwalne', icon: TrendingUp },
                                            { id: 'analytics', label: 'Statystyki_Systemu', icon: BarChart3 },
                                            { id: 'team', label: 'Zespół_Obserwacyjny', icon: Users },
                                            { id: 'manifest', label: 'Manifest_Projektu', icon: Terminal }
                                        ].map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleViewChange(item.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                                    color: activeView === item.id ? 'var(--accent)' : '#666',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '0.5rem', width: '100%', textAlign: 'left',
                                                    borderLeft: activeView === item.id ? '2px solid var(--accent)' : '2px solid transparent'
                                                }}>
                                                <item.icon size={18} /> <span style={{ fontSize: '13px' }}>{item.label}</span>
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handleViewChange('report_absurd')}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                color: activeView === 'report_absurd' ? 'var(--acid-green)' : '#666',
                                                background: activeView === 'report_absurd' ? 'rgba(173,255,47,0.05)' : 'none',
                                                border: 'none', cursor: 'pointer', padding: '0.8rem 0.5rem', width: '100%', textAlign: 'left',
                                                marginTop: '1rem', borderLeft: activeView === 'report_absurd' ? '2px solid var(--acid-green)' : '1px solid rgba(173,255,47,0.2)'
                                            }}>
                                            <ShieldAlert size={18} color={activeView === 'report_absurd' ? 'var(--acid-green)' : '#666'} />
                                            <span style={{ fontSize: '13px', fontWeight: 'bold' }}>ZGŁOŚ_ABSURD</span>
                                        </button>
                                        {isAdminAuthenticated && (
                                            <button
                                                onClick={() => handleViewChange('admin_dashboard')}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                                    color: activeView === 'admin_dashboard' ? 'var(--error)' : '#ff4444',
                                                    background: 'none', border: 'none', cursor: 'pointer',
                                                    padding: '0.5rem', width: '100%', textAlign: 'left',
                                                    fontWeight: 'bold', borderLeft: activeView === 'admin_dashboard' ? '2px solid var(--error)' : '2px solid transparent'
                                                }}>
                                                <ShieldCheck size={18} /> <span style={{ fontSize: '13px' }}>PANEL_ADMINA</span>
                                            </button>
                                        )}
                                    </div>
                                </section>
                                <section>
                                    <h4 className="hud-label">Agenci AI</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
                                        {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                                            <div key={id} style={{ fontSize: '11px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <config.icon size={14} color={config.color} />
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                        <span style={{ fontSize: '12px', color: config.color, fontWeight: 'bold' }}>{config.name}</span>
                                                        <span style={{ fontSize: '9px', color: '#555', letterSpacing: '0.5px' }}>[{config.role}]</span>
                                                    </div>
                                                </div>
                                                <div style={{ color: '#444', marginLeft: '1.6rem', fontSize: '9px', marginTop: '2px' }}>WĘZEŁ_AKTYWNY</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </aside>

                            {/* MAIN CONTENT AREA */}
                            <section className="main-content" style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                                {activeView === 'live' && <DashboardView tagFilter={selectedTag} onNotification={triggerNotification} />}
                                {activeView === 'analytics' && <StatsView />}
                                {activeView === 'report_absurd' && <ReportView />}
                                {activeView === 'manifest' && <ManifestView />}
                                {activeView === 'privacy' && <PrivacyView onClose={() => handleViewChange('live')} />}
                                {activeView === 'team' && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                        {Object.entries(AGENT_CONFIG).map(([id, config]) => (
                                            <div key={id} className="tech-border" style={{ padding: '1.5rem', background: 'rgba(255,140,0,0.02)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                                    <config.icon size={24} color={config.color} />
                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{config.name}</div>
                                                </div>
                                                <div style={{ color: '#888', fontSize: '12px', lineHeight: '1.6' }}>{config.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeView === 'archive' && <ArchiveView />}
                                {activeView === 'admin_dashboard' && isAdminAuthenticated && (
                                    <AdminDashboardView
                                        onLogout={() => { setIsAdminAuthenticated(false); setAdminCode(""); handleViewChange('live'); }}
                                        adminCode={adminCode}
                                        triggerNotification={triggerNotification}
                                        onReportProcessed={fetchTrendingTags}
                                    />
                                )}
                            </section>

                            {/* RIGHT SIDEBAR */}
                            <aside className="right-sidebar" style={{ width: '320px', borderLeft: '1px solid var(--border)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2.5rem', overflowY: 'auto' }}>
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                        <Vote size={16} color="var(--accent)" />
                                        <h4 className="hud-label" style={{ margin: 0 }}>Ranking Absurdów</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                        {topRanking.length > 0 ? topRanking.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '13px', color: '#fff' }}>{item.title}</div>
                                                <div style={{
                                                    color: item.score >= 71 ? 'var(--error)' : item.score >= 31 ? 'var(--accent)' : 'var(--acid-green)',
                                                    fontWeight: 'bold'
                                                }}>{Math.round(item.score)}</div>
                                            </div>
                                        )) : (
                                            <div style={{ fontSize: '11px', color: '#444' }}>BRAK_DANYCH_RANKINGU</div>
                                        )}
                                    </div>
                                </section>
                                <section>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                        <Zap size={16} color="var(--accent)" />
                                        <h4 className="hud-label" style={{ margin: 0 }}>Trendujące Tagi</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {trendingTags.length > 0 ? trendingTags.map(tag => (
                                            <span
                                                key={tag}
                                                onClick={() => {
                                                    setSelectedTag(selectedTag === tag ? null : tag);
                                                    handleViewChange('live');
                                                }}
                                                style={{
                                                    fontSize: '11px',
                                                    color: selectedTag === tag ? '#000' : '#888',
                                                    background: selectedTag === tag ? 'var(--accent)' : 'rgba(255,255,255,0.03)',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    fontWeight: selectedTag === tag ? 'bold' : 'normal',
                                                    transition: 'all 0.2s'
                                                }}>
                                                #{tag.length > 25 ? tag.slice(0, 25) + '...' : tag}
                                            </span>
                                        )) : <div style={{ fontSize: '10px', color: '#444' }}>BRAK_DANYCH_TAGÓW</div>}
                                    </div>
                                </section>
                            </aside>
                        </div>
                    )}

                    {/* MOBILE MENU OVERLAY */}
                    {isMobileMenuOpen && (
                        <div className="mobile-menu-overlay" style={{
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(5,5,5,0.98)', zIndex: 2000, padding: '2rem',
                            display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '2rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff' }}>
                                    <X size={32} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                <h4 className="hud-label" style={{ fontSize: '1.2rem' }}>Menu_Główne</h4>
                                {[
                                    { id: 'live', label: 'Kanał_Live', icon: Activity },
                                    { id: 'archive', label: 'Logi_Archiwalne', icon: TrendingUp },
                                    { id: 'analytics', label: 'Statystyki_Systemu', icon: BarChart3 },
                                    { id: 'team', label: 'Zespół_Obserwacyjny', icon: Users },
                                    { id: 'manifest', label: 'Manifest_Projektu', icon: Terminal }
                                ].map((item) => (
                                    <button key={item.id} onClick={() => handleViewChange(item.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '1.3rem',
                                        color: activeView === item.id ? 'var(--accent)' : '#fff', background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border)', padding: '1rem', borderRadius: '4px', textAlign: 'left'
                                    }}>
                                        <item.icon size={24} /> {item.label}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleViewChange('report_absurd')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1.5rem',
                                        color: 'var(--acid-green)', background: 'rgba(173,255,47,0.1)',
                                        border: '1px solid var(--acid-green)', padding: '1rem', borderRadius: '4px',
                                        fontSize: '1.3rem', fontWeight: 'bold'
                                    }}>
                                    <ShieldAlert size={24} /> <span>ZGŁOŚ_ABSURD</span>
                                </button>
                            </div>

                            <div style={{ height: '1px', background: 'var(--border)', width: '100%' }}></div>

                            <section>
                                <h4 className="hud-label">Ranking_Absurdów</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {topRanking.length > 0 ? topRanking.map((item) => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '14px', color: '#fff' }}>{item.title}</div>
                                            <div style={{
                                                color: item.score >= 71 ? 'var(--error)' : item.score >= 31 ? 'var(--accent)' : 'var(--acid-green)',
                                                fontWeight: 'bold'
                                            }}>{Math.round(item.score)}</div>
                                        </div>
                                    )) : (
                                        <div style={{ fontSize: '12px', color: '#444' }}>BRAK_DANYCH</div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <h4 className="hud-label">Trendujące</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                                    {trendingTags.map(tag => (
                                        <span
                                            key={tag}
                                            onClick={() => {
                                                setSelectedTag(selectedTag === tag ? null : tag);
                                                handleViewChange('live');
                                            }}
                                            style={{
                                                fontSize: '13px', color: selectedTag === tag ? '#000' : '#ccc',
                                                background: selectedTag === tag ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                                padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <div style={{ marginTop: '1rem', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--accent)', opacity: 0.7, letterSpacing: '1px', textAlign: 'center', lineHeight: '1.5', fontWeight: 'bold' }}>
                                    DISCLAIMER: SATYRA OPARTA NA FAKTACH // CHARAKTER EDUKACYJNY
                                </div>
                            </div>
                        </div>
                    )}

                    <Footer setActiveView={handleViewChange} isAdmin={isAdminAuthenticated} />
                    <CookieNotice show={showCookieNotice} onAccept={() => setShowCookieNotice(false)} />
                </>
            )
            }
        </main >
    );
}


