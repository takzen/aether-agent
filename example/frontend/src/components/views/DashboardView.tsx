import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MessageSquareCode, Activity, Brain, Search, Check, Download } from 'lucide-react';
import { AGENT_CONFIG } from '../../lib/constants';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
    id: string;
    agent_id: string;
    agent_name: string;
    content: string;
    message_type: string;
    debate_id: string;
    timestamp: string;
    parent_id: string | null;
}

interface Debate {
    id: string;
    title: string;
    summary: string;
    absurd_score: number;
    created_at: string;
    tags: string[];
    messages: Message[];
    confirmations?: number;
    source_url?: string | null;
}

const DashboardView: React.FC<{ tagFilter?: string | null; onNotification?: (m: string, t?: string) => void }> = ({ tagFilter, onNotification }) => {
    const [debates, setDebates] = useState<Debate[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [votedDebates, setVotedDebates] = useState<Set<string>>(new Set());
    const channelRef = useRef<RealtimeChannel | null>(null);
    const isMountedRef = useRef(true);
    const loaderRef = useRef<HTMLDivElement | null>(null);
    const PAGE_SIZE = 5;

    // Load voted debates from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('voted_debates');
        if (stored) {
            setVotedDebates(new Set(JSON.parse(stored)));
        }
    }, []);

    const handleConfirmAbsurd = async (debateId: string) => {
        if (votedDebates.has(debateId)) return;

        try {
            // Get current debate data
            const currentDebate = debates.find(d => d.id === debateId);
            const newConfirmations = (currentDebate?.confirmations || 0) + 1;
            const newAbsurdScore = (currentDebate?.absurd_score || 0) + 1;

            // Update both confirmations AND absurd_score in database
            await supabase.from('debates').update({
                confirmations: newConfirmations,
                absurd_score: newAbsurdScore
            }).eq('id', debateId);

            // Update local state
            setDebates(prev => prev.map(d =>
                d.id === debateId ? {
                    ...d,
                    confirmations: newConfirmations,
                    absurd_score: newAbsurdScore
                } : d
            ));

            // Mark as voted
            const newVoted = new Set(votedDebates).add(debateId);
            setVotedDebates(newVoted);
            localStorage.setItem('voted_debates', JSON.stringify([...newVoted]));

            onNotification?.('ABSURD_POTWIERDZONY_PRZEZ_OBYWATELA', 'success');
        } catch (e) {
            console.error('Błąd głosowania:', e);
        }
    };

    const fetchDebates = useCallback(async (offset = 0, append = false) => {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);

        try {
            let query = supabase
                .from('debates')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + PAGE_SIZE - 1);

            // Filter by tag if selected
            if (tagFilter) {
                query = query.contains('tags', [tagFilter]);
            }

            const { data: dData, error } = await query;

            if (error) throw error;

            // Check if there are more items to load
            if (!dData || dData.length < PAGE_SIZE) {
                setHasMore(false);
            }

            if (dData && dData.length > 0) {
                // Fetch messages for these debates
                const debateIds = dData.map(d => d.id);
                const { data: mData } = await supabase
                    .from('messages')
                    .select('*')
                    .in('debate_id', debateIds)
                    .order('timestamp', { ascending: true });

                const merged = dData.map(d => ({
                    ...d,
                    messages: mData?.filter(m => m.debate_id === d.id) || []
                }));

                if (isMountedRef.current) {
                    if (append) {
                        setDebates(prev => [...prev, ...merged]);
                    } else {
                        setDebates(merged);
                    }
                }
            }
        } catch (e) {
            console.error('[DEBUG] Fetch error:', e);
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [tagFilter]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchDebates(debates.length, true);
        }
    }, [debates.length, loadingMore, hasMore, fetchDebates]);

    useEffect(() => {
        isMountedRef.current = true;
        setHasMore(true); // Reset pagination on filter change
        fetchDebates(0, false);

        // Delay subscription to avoid React StrictMode double-mount issue
        const subscriptionTimeout = setTimeout(() => {
            if (!isMountedRef.current) return;

            console.log('[REALTIME] Inicjalizacja kanału...');
            channelRef.current = supabase.channel('dashboard_live_' + Date.now())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'debates' }, payload => {
                    if (!isMountedRef.current) return;
                    console.log('[REALTIME] Zmiana w debacie:', payload.eventType);
                    if (payload.eventType === 'INSERT') {
                        const newD = { ...payload.new as Debate, messages: [] };
                        setDebates(prev => [newD, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        const up = payload.new as Debate;
                        // Zachowaj istniejące wiadomości przy update nagłówka
                        setDebates(prev => prev.map(d => d.id === up.id ? { ...d, ...up, messages: d.messages } : d));
                    } else if (payload.eventType === 'DELETE') {
                        const oldId = payload.old.id;
                        setDebates(prev => prev.filter(d => d.id !== oldId));
                    }
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                    if (!isMountedRef.current) return;
                    const nm = payload.new as Message;
                    console.log('!!! [REALTIME] ODEBRANO WIADOMOŚĆ OD:', nm.agent_id);

                    setDebates(current => current.map(d => {
                        if (d.id === nm.debate_id) {
                            const exists = d.messages.some(m => m.id === nm.id);
                            if (exists) return d;
                            return { ...d, messages: [...d.messages, nm] };
                        }
                        return d;
                    }));
                })
                .subscribe((status) => {
                    console.log('[REALTIME] Status subskrypcji:', status);
                });
        }, 100);

        return () => {
            isMountedRef.current = false;
            clearTimeout(subscriptionTimeout);
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [fetchDebates]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, loading, loadMore]);

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>SYNCHRONIZACJA...</div>;

    return (
        <div style={{ padding: '0' }}>
            {debates.map((debate, index) => {
                const primaryAgent = AGENT_CONFIG.scout;
                const AgentIcon = primaryAgent.icon;

                return (
                    <article key={debate.id} className="debate-card" style={{
                        padding: '2rem',
                        borderBottom: '1px solid var(--border)',
                        background: index === 0 ? 'rgba(255,140,0,0.02)' : 'transparent',
                        transition: 'background 0.2s',
                        animation: 'fadeIn 0.5s ease-out'
                    }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <div className="agent-avatar" style={{
                                border: '1px solid var(--border)',
                                background: 'rgba(255,255,255,0.02)', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <span className="agent-icon-wrapper">
                                    <AgentIcon size={24} color={primaryAgent.color} />
                                </span>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    <div style={{ fontSize: '12px', color: '#555' }}>
                                        <span style={{ color: '#fff' }}>SYSTEM_ORCHESTRATOR</span> @central • {new Date(debate.created_at).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {debate.tags?.map(tag => (
                                            <span key={tag} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px', color: 'var(--accent)', fontWeight: 'bold' }}>#{tag.toUpperCase()}</span>
                                        ))}
                                    </div>
                                </div>

                                <h3 style={{ fontSize: '1.6rem', color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{debate.title}</h3>
                                <p style={{ fontSize: '1rem', color: '#bbb', lineHeight: '1.6', marginBottom: '1.5rem' }}>{debate.summary}</p>

                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: debate.title.startsWith('[SCOUT]') ? 'rgba(173,255,47,0.05)' : 'rgba(255,140,0,0.05)',
                                    border: '1px solid var(--border)',
                                    borderLeft: debate.title.startsWith('[SCOUT]') ? '4px solid var(--acid-green)' : '4px solid var(--accent)',
                                    marginBottom: '1.5rem',
                                    fontSize: '11px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        color: debate.title.startsWith('[SCOUT]') ? 'var(--acid-green)' : 'var(--accent)',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '0.2rem'
                                    }}>
                                        <Search size={12} /> {debate.title.startsWith('[SCOUT]') ? 'WYWIAD SCOUTA' : 'PROTOKÓŁ ANALIZY AI'}
                                    </div>
                                    <div style={{ color: '#fff' }}>
                                        Źródło: {debate.title.startsWith('[SCOUT]') ? 'Web Search (Tavily API)' : 'Zgłoszenie Obywatelskie'} (ID: {debate.id.slice(0, 8)})
                                    </div>

                                    {/* DODANE: Przycisk weryfikacji źródła */}
                                    {(() => {
                                        // Szukamy URL w tytule, summary lub content (wyłapujemy pierwszy link)
                                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                                        const foundUrl = debate.summary?.match(urlRegex)?.[0] || debate.source_url;

                                        if (foundUrl) {
                                            const isScout = debate.title.startsWith('[SCOUT]');
                                            const btnColor = isScout ? 'var(--acid-green)' : 'var(--accent)';
                                            const btnBg = isScout ? 'rgba(0,255,65,0.05)' : 'rgba(255,140,0,0.05)';
                                            const btnBorder = isScout ? 'rgba(0,255,65,0.2)' : 'rgba(255,140,0,0.2)';
                                            const btnHoverBg = isScout ? 'rgba(0,255,65,0.1)' : 'rgba(255,140,0,0.1)';
                                            const btnShadow = isScout ? 'rgba(0,255,65,0.2)' : 'rgba(255,140,0,0.2)';
                                            const isDownload = foundUrl.toLowerCase().includes('.pdf') || foundUrl.includes('supabase.co/storage');

                                            return (
                                                <div style={{
                                                    marginTop: '1rem',
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    paddingTop: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem'
                                                }}>
                                                    <a
                                                        href={foundUrl.replace(/[)\].,]$/, '')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download={isDownload ? true : undefined}
                                                        onClick={() => {
                                                            if (isDownload) {
                                                                const statusId = `download-status-${debate.id}`;
                                                                const statusEl = document.getElementById(statusId);
                                                                if (statusEl) {
                                                                    statusEl.style.opacity = '1';
                                                                    setTimeout(() => {
                                                                        const el = document.getElementById(statusId);
                                                                        if (el) el.style.opacity = '0';
                                                                    }, 3000);
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '0.6rem',
                                                            color: btnColor,
                                                            textDecoration: 'none',
                                                            fontSize: '10px',
                                                            fontWeight: 'bold',
                                                            letterSpacing: '1px',
                                                            padding: '4px 8px',
                                                            background: btnBg,
                                                            border: `1px solid ${btnBorder}`,
                                                            borderRadius: '2px',
                                                            transition: 'all 0.2s',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = btnHoverBg;
                                                            e.currentTarget.style.boxShadow = `0 0 10px ${btnShadow}`;
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = btnBg;
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        }}
                                                    >
                                                        {isDownload ? <Download size={12} /> : <Search size={12} />}
                                                        {isDownload ? 'POBIERZ DOWÓD (PDF)' : 'ZWERYFIKUJ DOWÓD W SIECI'}
                                                    </a>
                                                    {isDownload && (
                                                        <span
                                                            id={`download-status-${debate.id}`}
                                                            style={{
                                                                fontSize: '9px',
                                                                color: 'var(--acid-green)',
                                                                opacity: 0,
                                                                transition: 'opacity 0.3s',
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            [ PLIK ZAPISANY NA DYSKU ]
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: 'var(--thread-main-padding)', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                                    {debate.messages.length > 0 ? (
                                        (() => {
                                            // Budowanie drzewa wiadomości
                                            const messageMap = new Map<string, Message>();
                                            const roots: Message[] = [];

                                            // Najpierw sortujemy po czasie, żeby mieć dobrą kolejność w mapowaniu
                                            const sortedMessages = [...debate.messages].sort((a, b) =>
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
                                                const config = AGENT_CONFIG[msg.agent_id as keyof typeof AGENT_CONFIG] || AGENT_CONFIG.scout;
                                                const children = childrenMap.get(msg.id) || [];

                                                return (
                                                    <div key={msg.id} style={{
                                                        marginLeft: depth > 0 ? 'var(--thread-indent)' : '0',
                                                        position: 'relative'
                                                    }}>
                                                        {/* Linia pionowa kontynuująca: zaczyna się DOKŁADNIE pod poziomą częścią łokcia */}
                                                        {depth > 0 && !isLast && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                left: 'calc(-1 * var(--thread-indent))',
                                                                top: '0.8rem', // Środek ikony
                                                                bottom: 'calc(-1 * 0.4rem)', // Połowa odstępu (0.8rem / 2)
                                                                width: '1px',
                                                                background: 'rgba(255,255,255,0.1)',
                                                                pointerEvents: 'none'
                                                            }} />
                                                        )}
                                                        {/* Łokieć: od góry (połowy odstępu) do środka ikony */}
                                                        {depth > 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                left: 'calc(-1 * var(--thread-indent))',
                                                                top: 'calc(-1 * 0.4rem)', // Połowa odstępu od poprzednika
                                                                width: 'calc(var(--thread-indent) + 10px)', // Wydłużona aby dotknąć ikony
                                                                height: '1.2rem', // Od -0.4rem do 0.8rem
                                                                borderLeft: '1px solid rgba(255,255,255,0.1)',
                                                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                                borderBottomLeftRadius: '10px',
                                                                pointerEvents: 'none'
                                                            }} />
                                                        )}
                                                        <div className="fadeIn" style={{
                                                            fontSize: '13px',
                                                            marginBottom: depth > 0 ? '0.8rem' : '1.5rem'
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                                                <config.icon size={12} color={config.color} />
                                                                <span style={{ color: config.color, fontWeight: 'bold' }}>{config.name}</span>
                                                                <span style={{ color: '#444' }}>[{config.role}]</span>
                                                            </div>
                                                            <p style={{ color: '#888', lineHeight: '1.5' }}>{msg.content}</p>
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
                                        })()
                                    ) : (
                                        <div style={{ color: 'var(--accent)', fontSize: '10px' }}>INICJALIZACJA DEBATY AI...</div>
                                    )}
                                    {debate.messages.length > 0 && debate.messages.length < 10 && (
                                        <div style={{ color: '#444', fontSize: '10px', marginTop: '0.5rem' }} className="typing-indicator">
                                            <span>.</span><span>.</span><span>.</span> KOLEJNY AGENT ANALIZUJE DANE
                                        </div>
                                    )}
                                </div>

                                <div className="debate-footer" style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1.2rem', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#666', fontSize: '10px', fontWeight: 'bold' }}>
                                        <MessageSquareCode size={14} /> {debate.messages.length} ODPOWIEDZI
                                    </div>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        fontSize: '10px', fontWeight: 'bold',
                                        color: debate.absurd_score >= 71 ? '#f44' : debate.absurd_score >= 31 ? 'var(--accent)' : '#4f4'
                                    }}>
                                        <Activity size={14} /> ABSURD SCORE: {debate.absurd_score ? Math.round(debate.absurd_score) : 'N/A'}
                                    </div>
                                    {votedDebates.has(debate.id) ? (
                                        <div style={{
                                            marginLeft: 'auto',
                                            display: 'flex', alignItems: 'center', gap: '0.6rem',
                                            background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)',
                                            padding: '0.4rem 1rem', borderRadius: '20px', color: '#0f6', fontSize: '10px', fontWeight: 'bold'
                                        }}>
                                            <Check size={12} /> POTWIERDZONO ({debate.confirmations || 0})
                                        </div>
                                    ) : (
                                        <button className="action-btn"
                                            onClick={() => handleConfirmAbsurd(debate.id)}
                                            style={{
                                                marginLeft: 'auto',
                                                display: 'flex', alignItems: 'center', gap: '0.6rem',
                                                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                                                padding: '0.4rem 1rem', borderRadius: '20px', color: '#fff', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,140,0,0.2)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        >
                                            <Brain size={12} /> POTWIERDŹ ABSURD {(debate.confirmations || 0) > 0 && `(${debate.confirmations})`}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                );
            })}

            {/* Infinite Scroll Loader */}
            <div
                ref={loaderRef}
                style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#444',
                    fontSize: '11px',
                    fontWeight: 'bold'
                }}
            >
                {loadingMore && (
                    <div style={{ color: 'var(--accent)' }}>
                        <span className="typing-indicator">
                            <span>.</span><span>.</span><span>.</span>
                        </span> ŁADOWANIE ARCHIWUM...
                    </div>
                )}
                {!hasMore && debates.length > 0 && (
                    <div style={{ color: '#333' }}>— KONIEC ARCHIWUM —</div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;
