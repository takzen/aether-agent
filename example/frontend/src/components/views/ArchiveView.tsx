'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Database, Calendar, TrendingUp, Filter, X, ExternalLink, Twitter } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { AGENT_CONFIG } from '@/lib/constants';

interface ArchivedDebate {
    id: string;
    title: string;
    summary: string | null;
    absurd_score: number;
    created_at: string;
    tags: string[];
    source_url?: string | null;
}

interface Message {
    id: string;
    agent_id: string;
    agent_name: string;
    content: string;
    timestamp: string;
    parent_id: string | null;
}

interface ArchiveStats {
    totalDebates: number;
    totalScore: number;
    avgScore: number;
}

const ArchiveView: React.FC = () => {
    const [debates, setDebates] = useState<ArchivedDebate[]>([]);
    const [filteredDebates, setFilteredDebates] = useState<ArchivedDebate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [allTags, setAllTags] = useState<string[]>([]);
    const [stats, setStats] = useState<ArchiveStats>({ totalDebates: 0, totalScore: 0, avgScore: 0 });

    // Modal state
    const [selectedDebate, setSelectedDebate] = useState<ArchivedDebate | null>(null);
    const [debateMessages, setDebateMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const fetchArchive = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('debates')
                .select('id, title, summary, absurd_score, created_at, tags, source_url')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setDebates(data);
                setFilteredDebates(data);

                // Extract unique tags
                const tags = new Set<string>();
                data.forEach(d => d.tags?.forEach((t: string) => tags.add(t)));
                setAllTags(Array.from(tags).sort());

                // Calculate stats
                const totalScore = data.reduce((sum, d) => sum + (d.absurd_score || 0), 0);
                setStats({
                    totalDebates: data.length,
                    totalScore: Math.round(totalScore),
                    avgScore: data.length > 0 ? Math.round(totalScore / data.length) : 0
                });
            }
        } catch (err) {
            console.error('Error fetching archive:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDebateMessages = async (debateId: string) => {
        setLoadingMessages(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('debate_id', debateId)
                .order('timestamp', { ascending: true });

            if (error) throw error;
            setDebateMessages(data || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
            setDebateMessages([]);
        } finally {
            setLoadingMessages(false);
        }
    };

    const openDebateModal = (debate: ArchivedDebate) => {
        setSelectedDebate(debate);
        fetchDebateMessages(debate.id);
    };

    const closeModal = () => {
        setSelectedDebate(null);
        setDebateMessages([]);
    };

    useEffect(() => {
        fetchArchive();
    }, [fetchArchive]);

    // Filter debates based on search and tag
    useEffect(() => {
        let result = debates;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(d =>
                d.title?.toLowerCase().includes(query) ||
                d.summary?.toLowerCase().includes(query)
            );
        }

        if (selectedTag) {
            result = result.filter(d => d.tags?.includes(selectedTag));
        }

        setFilteredDebates(result);
    }, [searchQuery, selectedTag, debates]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 71) return 'var(--error)';
        if (score >= 31) return 'var(--accent)';
        return 'var(--acid-green)';
    };

    const getAgentConfig = (agentId: string) => {
        const id = agentId.toLowerCase();
        return AGENT_CONFIG[id as keyof typeof AGENT_CONFIG] || {
            name: agentId,
            color: '#888',
            icon: null
        };
    };

    if (loading) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>
                SYNCHRONIZACJA_ARCHIWUM...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* STATS HEADER */}
            <div className="tech-border" style={{
                padding: '1.5rem',
                background: 'rgba(255,140,0,0.02)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '2rem',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Database size={18} color="var(--accent)" />
                    <div>
                        <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>ZARCHIWIZOWANYCH_DEBAT</div>
                        <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>{stats.totalDebates}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <TrendingUp size={18} color="var(--error)" />
                    <div>
                        <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>ŁĄCZNY_WSKAŹNIK_ABSURDU</div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--error)', fontWeight: 'bold' }}>{stats.totalScore.toLocaleString()}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Calendar size={18} color="var(--acid-green)" />
                    <div>
                        <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>ŚREDNI_WYNIK</div>
                        <div style={{ fontSize: '1.5rem', color: 'var(--acid-green)', fontWeight: 'bold' }}>{stats.avgScore}</div>
                    </div>
                </div>
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    <input
                        type="text"
                        placeholder="SZUKAJ_W_ARCHIWUM..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '0.8rem 1rem 0.8rem 2.5rem',
                            fontSize: '11px',
                            color: '#fff',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
                <div style={{ position: 'relative', minWidth: '180px' }}>
                    <Filter size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    <select
                        value={selectedTag || ''}
                        onChange={(e) => setSelectedTag(e.target.value || null)}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            padding: '0.8rem 1rem 0.8rem 2.5rem',
                            fontSize: '11px',
                            color: selectedTag ? 'var(--accent)' : '#666',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            appearance: 'none'
                        }}
                    >
                        <option value="">WSZYSTKIE_TAGI</option>
                        {allTags.map(tag => (
                            <option key={tag} value={tag}>#{tag}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* RESULTS COUNT */}
            <div style={{ fontSize: '10px', color: '#555', letterSpacing: '1px' }}>
                ZNALEZIONO: {filteredDebates.length} {filteredDebates.length === 1 ? 'REKORD' : 'REKORDÓW'}
            </div>

            {/* ARCHIVE LIST */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                overflow: 'hidden'
            }}>
                {/* HEADER ROW */}
                <div className="archive-header-row" style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 1fr 80px',
                    gap: '1rem',
                    padding: '0.8rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    fontSize: '9px',
                    color: '#666',
                    letterSpacing: '1px',
                    fontWeight: 'bold'
                }}>
                    <div className="hide-mobile">DATA</div>
                    <div>TYTUŁ_DEBATY</div>
                    <div style={{ textAlign: 'right' }}>WYNIK</div>
                </div>

                {/* DATA ROWS */}
                {filteredDebates.length > 0 ? filteredDebates.map((debate, index) => (
                    <div
                        key={debate.id}
                        onClick={() => openDebateModal(debate)}
                        className="archive-row"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '100px 1fr 80px',
                            gap: '1rem',
                            padding: '1rem',
                            background: index % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.01)',
                            borderTop: '1px solid rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,140,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.01)'}
                    >
                        <div className="hide-mobile" style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
                            {formatDate(debate.created_at)}
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                                {debate.title || 'Bez tytułu'}
                            </div>
                            <div className="show-mobile-only" style={{ fontSize: '10px', color: '#555', marginBottom: '4px' }}>
                                {formatDate(debate.created_at)}
                            </div>
                            {debate.tags && debate.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {debate.tags.slice(0, 3).map(tag => (
                                        <span
                                            key={tag}
                                            style={{
                                                fontSize: '8px',
                                                color: 'var(--accent)',
                                                background: 'rgba(255,140,0,0.1)',
                                                padding: '2px 6px',
                                                borderRadius: '2px'
                                            }}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: getScoreColor(debate.absurd_score || 0),
                            textAlign: 'right'
                        }}>
                            {Math.round(debate.absurd_score || 0)}
                        </div>
                    </div>
                )) : (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        color: '#444',
                        fontSize: '12px'
                    }}>
                        BRAK_REKORDÓW_SPEŁNIAJĄCYCH_KRYTERIA
                    </div>
                )}
            </div>

            {/* DEBATE DETAIL MODAL */}
            {selectedDebate && (
                <div
                    className="archive-modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 200000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onClick={closeModal}
                >
                    <div
                        className="archive-modal"
                        style={{
                            background: '#0a0a0a',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '100vh',
                            overflowY: 'auto',
                            padding: '0',
                            position: 'relative',
                            border: '1px solid var(--border)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Bar - sticky inside scrollable modal */}
                        <div
                            className="modal-header-actions"
                            style={{
                                position: 'sticky',
                                top: 0,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.8rem 1rem',
                                background: '#0a0a0a',
                                borderBottom: '1px solid var(--border)',
                                zIndex: 10
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span className="hide-mobile" style={{ fontSize: '9px', color: '#555', letterSpacing: '1px', marginRight: '0.5rem' }}>
                                    ANALIZA_DEBATY
                                </span>
                                <button
                                    onClick={() => {
                                        const text = `🚨 SYSTEM WYKRYŁ ABSURD: "${selectedDebate.title}"\nAnaliza AI: ${selectedDebate.absurd_score}/100\nJednostki analityczne potwierdzają nielogiczność.\n\n#BiegWsteczny #AbsurdSystemu`;
                                        const url = 'https://biegwsteczny.pl';
                                        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                                    }}
                                    className="twitter-share-btn"
                                    title="ROZPOWSZECHNIAJ_SYGNAŁ"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #1DA1F2',
                                        borderRadius: '4px',
                                        color: '#1DA1F2',
                                        cursor: 'pointer',
                                        padding: '0.4rem 0.6rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '10px',
                                        fontFamily: 'inherit',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Twitter size={14} /> <span className="btn-label">ROZPOWSZECHNIAJ_SYGNAŁ</span>
                                </button>
                                <button
                                    onClick={() => {
                                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                                        window.open(`${API_URL}/api/social/card/${selectedDebate.id}.png`, '_blank');
                                    }}
                                    title="RAPORT_GRAFICZNY"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--accent)',
                                        borderRadius: '4px',
                                        color: 'var(--accent)',
                                        cursor: 'pointer',
                                        padding: '0.4rem 0.6rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '10px',
                                        fontFamily: 'inherit',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ExternalLink size={14} /> <span className="btn-label">RAPORT_GRAFICZNY</span>
                                </button>
                            </div>
                            <button
                                onClick={closeModal}
                                title="ZAMKNIJ"
                                style={{
                                    background: 'rgba(255,60,60,0.15)',
                                    border: '1px solid rgba(255,60,60,0.4)',
                                    borderRadius: '4px',
                                    color: '#ff6666',
                                    cursor: 'pointer',
                                    padding: '0.5rem 0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '11px',
                                    fontFamily: 'inherit',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px'
                                }}
                            >
                                <X size={16} /> <span className="btn-label">ZAMKNIJ</span>
                            </button>
                        </div>

                        {/* Header */}
                        <div style={{ padding: '1.5rem', marginBottom: '0' }}>
                            <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                                REKORD_ARCHIWALNY // {formatDateTime(selectedDebate.created_at)}
                            </div>
                            <h2 style={{
                                fontSize: '1.3rem',
                                color: '#fff',
                                fontFamily: 'var(--font-heading)',
                                marginBottom: '1rem',
                                lineHeight: '1.3'
                            }}>
                                {selectedDebate.title}
                            </h2>

                            {/* Tags */}
                            {selectedDebate.tags && selectedDebate.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {selectedDebate.tags.map(tag => (
                                        <span
                                            key={tag}
                                            style={{
                                                fontSize: '10px',
                                                color: 'var(--accent)',
                                                background: 'rgba(255,140,0,0.1)',
                                                padding: '4px 8px',
                                                borderRadius: '3px'
                                            }}
                                        >
                                            #{tag.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Score */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '4px',
                                marginBottom: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                <div>
                                    <div style={{ fontSize: '9px', color: '#666', letterSpacing: '1px' }}>WSKAŹNIK_ABSURDU</div>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        color: getScoreColor(selectedDebate.absurd_score || 0)
                                    }}>
                                        {Math.round(selectedDebate.absurd_score || 0)}
                                    </div>
                                </div>
                                {selectedDebate.source_url && (
                                    <a
                                        href={selectedDebate.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="system-btn"
                                        style={{
                                            marginLeft: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '10px',
                                            padding: '0.6rem 1rem',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        <ExternalLink size={12} />
                                        WERYFIKUJ_ŹRÓDŁO
                                    </a>
                                )}
                            </div>

                            {/* Summary */}
                            {selectedDebate.summary && (
                                <div style={{
                                    fontSize: '13px',
                                    color: '#aaa',
                                    lineHeight: '1.6',
                                    padding: '1rem',
                                    background: 'rgba(255,140,0,0.03)',
                                    borderLeft: '2px solid var(--accent)',
                                    marginBottom: '1.5rem'
                                }}>
                                    {selectedDebate.summary}
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div style={{ padding: `0 var(--thread-main-padding) var(--thread-main-padding)` }}>
                            <h4 className="hud-label" style={{ marginBottom: '1rem' }}>TRANSMISJA_AGENTÓW</h4>

                            {loadingMessages ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                    ŁADOWANIE_WIADOMOŚCI...
                                </div>
                            ) : debateMessages.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {(() => {
                                        // Budowanie drzewa wiadomości
                                        const messageMap = new Map<string, Message>();
                                        const roots: Message[] = [];

                                        // Sortowanie chronologiczne
                                        const sortedMessages = [...debateMessages].sort((a, b) =>
                                            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                                        );

                                        sortedMessages.forEach(m => messageMap.set(m.id, m));

                                        // Grupowanie w drzewo
                                        const childrenMap = new Map<string, Message[]>();
                                        sortedMessages.forEach(m => {
                                            if (m.parent_id && messageMap.has(m.parent_id)) {
                                                const children = childrenMap.get(m.parent_id) || [];
                                                children.push(m);
                                                childrenMap.set(m.parent_id, children);
                                            } else {
                                                roots.push(m);
                                            }
                                        });

                                        // Funkcja rekurencyjna do renderowania wątków
                                        const renderMessage = (msg: Message, depth: number = 0, isLast: boolean = false) => {
                                            const agentConfig = getAgentConfig(msg.agent_id);
                                            const AgentIcon = agentConfig.icon;
                                            const children = childrenMap.get(msg.id) || [];

                                            return (
                                                <div key={msg.id} style={{
                                                    marginLeft: depth > 0 ? 'var(--thread-indent)' : '0',
                                                    position: 'relative'
                                                }}>
                                                    {/* Zaokrąglona linia połączenia (łokieć) */}
                                                    {depth > 0 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: 'calc(-1 * var(--thread-indent))',
                                                            top: 'calc(-1 * 0.25rem)', // Połowa odstępu (0.5rem / 2)
                                                            width: 'calc(var(--thread-indent) + 10px)',
                                                            height: '1.65rem', // Od -0.25rem do 1.4rem (środek ikony w modalu)
                                                            borderLeft: '1px solid rgba(255,255,255,0.1)',
                                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                            borderBottomLeftRadius: '10px',
                                                            pointerEvents: 'none'
                                                        }} />
                                                    )}
                                                    {/* Linia pionowa kontynuująca dla kolejnych rodzeństwa */}
                                                    {depth > 0 && !isLast && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            left: 'calc(-1 * var(--thread-indent))',
                                                            top: '1.4rem', // Środek ikony
                                                            bottom: 'calc(-1 * 0.25rem)',
                                                            width: '1px',
                                                            background: 'rgba(255,255,255,0.1)',
                                                            pointerEvents: 'none'
                                                        }} />
                                                    )}
                                                    <div
                                                        style={{
                                                            padding: '1rem',
                                                            background: 'rgba(0,0,0,0.3)',
                                                            borderLeft: `2px solid ${agentConfig.color}`,
                                                            borderRadius: '4px',
                                                            marginBottom: depth > 0 ? '0.5rem' : '1rem'
                                                        }}
                                                    >
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem',
                                                            marginBottom: '0.5rem',
                                                            flexWrap: 'wrap'
                                                        }}>
                                                            {AgentIcon && <AgentIcon size={14} color={agentConfig.color} />}
                                                            <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                color: agentConfig.color
                                                            }}>
                                                                AGENT_{msg.agent_id.toUpperCase()}
                                                            </span>
                                                            <span style={{
                                                                fontSize: '9px',
                                                                color: '#555',
                                                                marginLeft: 'auto'
                                                            }}>
                                                                {formatDateTime(msg.timestamp)}
                                                            </span>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '12px',
                                                            color: '#888',
                                                            lineHeight: '1.6'
                                                        }}>
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                    {children.length > 0 && (
                                                        <div style={{
                                                            marginLeft: 'var(--thread-inner-indent)',
                                                            marginTop: '0.5rem'
                                                        }}>
                                                            {children.map((child, idx) => renderMessage(child, depth + 1, idx === children.length - 1))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        };

                                        return roots.map((root, idx) => renderMessage(root, 0, idx === roots.length - 1));
                                    })()}
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#444', fontSize: '12px' }}>
                                    BRAK_ZAREJESTROWANYCH_TRANSMISJI
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArchiveView;
