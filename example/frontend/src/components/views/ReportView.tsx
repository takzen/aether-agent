import React, { useState } from 'react';
import { Send, FileText, MapPin, AlertTriangle, Loader, Link as LinkIcon } from 'lucide-react';

const ReportView: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${API_URL}/api/reports/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    content: description,
                    location: location || null,
                    source_url: sourceUrl || null,
                }),
            });

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Limit zgłoszeń wyczerpany. Spróbuj ponownie za godzinę.');
                }
                const errData = await response.json();
                throw new Error(errData.detail || 'Błąd serwera');
            }

            setSubmitted(true);
        } catch (err) {
            console.error('Błąd wysyłania zgłoszenia:', err);
            const message = err instanceof Error ? err.message : 'Błąd połączenia z bazą danych.';
            setErrorMsg(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--acid-green)', fontSize: '10px', marginBottom: '1rem' }}>[ ZGŁOSZENIE PRZYJĘTE ]</div>
                <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '2rem' }}>Dziękujemy za obywatelską czujność</h2>
                <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                    Twoje zgłoszenie zostało przesłane do jednostek analitycznych. Agent Scout oraz Agent Bureaucrat zajmą się weryfikacją tego absurdu w ciągu najbliższych 24h cyfrowych.
                </p>
                <button
                    onClick={() => {
                        setTitle('');
                        setDescription('');
                        setLocation('');
                        setSourceUrl('');
                        setSubmitted(false);
                    }}
                    className="system-btn"
                    style={{ marginTop: '3rem' }}
                >
                    WYŚLIJ KOLEJNE ZGŁOSZENIE
                </button>
            </div>
        );
    }

    return (
        <div className="view-container">
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ color: 'var(--acid-green)', fontSize: '10px', letterSpacing: '4px' }}>[ DYŻUR OBYWATELSKI ]</div>
                <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>ZGŁOŚ ABSURD</h2>
                <p style={{ color: '#666', marginTop: '0.5rem' }}>Widzisz coś, co przeczy logice? Poinformuj naszych agentów.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                {errorMsg && (
                    <div style={{ border: '1px solid var(--error)', color: 'var(--error)', padding: '1rem', fontSize: '13px' }}>
                        BŁĄD SYSTEMU: {errorMsg}
                    </div>
                )}

                <div className="tech-border view-content" style={{ background: 'rgba(173,255,47,0.02)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--acid-green)', fontSize: '11px', marginBottom: '0.8rem' }}>
                                <FileText size={14} /> TYTUŁ DOWODU
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Np. Paradoks pieczątki w e-urzędzie..."
                                disabled={isSubmitting}
                                style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border)',
                                    padding: '1rem',
                                    color: '#fff',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                    opacity: isSubmitting ? 0.5 : 1
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--acid-green)', fontSize: '11px', marginBottom: '0.8rem' }}>
                                <AlertTriangle size={14} /> OPIS SYTUACJI
                            </label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Opisz dokładnie, dlaczego to działanie jest pozbawione sensu..."
                                disabled={isSubmitting}
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    background: 'rgba(0,0,0,0.3)',
                                    border: '1px solid var(--border)',
                                    padding: '1rem',
                                    color: '#fff',
                                    fontFamily: 'inherit',
                                    resize: 'none',
                                    outline: 'none',
                                    opacity: isSubmitting ? 0.5 : 1
                                }}
                            />
                        </div>

                        <div className="report-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#666', fontSize: '11px', marginBottom: '0.8rem' }}>
                                    <MapPin size={14} /> LOKALIZACJA
                                </label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Np. Urząd Miasta, Platforma X..."
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border)',
                                        padding: '1rem',
                                        color: '#fff',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        opacity: isSubmitting ? 0.5 : 1
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#666', fontSize: '11px', marginBottom: '0.8rem' }}>
                                    <LinkIcon size={14} /> LINK ŹRÓDŁOWY (DOWÓD)
                                </label>
                                <input
                                    type="text"
                                    value={sourceUrl}
                                    onChange={(e) => setSourceUrl(e.target.value)}
                                    placeholder="Link do artykułu, BIP, newsa..."
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid var(--border)',
                                        padding: '1rem',
                                        color: '#fff',
                                        fontFamily: 'inherit',
                                        outline: 'none',
                                        opacity: isSubmitting ? 0.5 : 1
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <button
                                type="submit"
                                className="system-btn"
                                disabled={isSubmitting}
                                style={{
                                    width: '100%',
                                    maxWidth: '400px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    height: '50px',
                                    borderColor: 'var(--acid-green)',
                                    color: 'var(--acid-green)',
                                    opacity: isSubmitting ? 0.5 : 1,
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader size={16} className="spin-animation" /> PRZETWARZANIE...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} /> NADAJ SYGNAŁ DOWODOWY
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ fontSize: '10px', color: '#444', fontStyle: 'italic', textAlign: 'center' }}>
                    * Pamiętaj: Każde zgłoszenie jest analizowane przez sieć neuronową. Fałszywe alarmy osłabiają proces poznawczy systemu.
                </div>
            </form>
        </div>
    );
};

export default ReportView;
