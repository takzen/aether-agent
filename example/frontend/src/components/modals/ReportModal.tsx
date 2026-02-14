import React, { useId } from 'react';

interface ReportModalProps {
    show: boolean;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ show, isSubmitting, onClose, onSubmit }) => {
    const reportRef = useId().replace(/:/g, 'ABS-');

    if (!show) return null;



    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div className="tech-border" style={{
                width: '100%',
                maxWidth: '600px',
                backgroundColor: '#050505',
                padding: '2.5rem',
                position: 'relative'
            }}>
                <div style={{ color: 'var(--accent)', fontSize: '10px', letterSpacing: '2px', marginBottom: '1rem' }}>
                    PROTOKÓŁ_ZGŁOSZENIA_OBYWATELSKIEGO // REF: {reportRef}
                </div>

                <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>
                    ZŁÓŻ <span style={{ color: 'var(--accent)' }}>ZEZNANIE</span>
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: '#444', fontSize: '10px', marginBottom: '0.5rem' }}>TYTUŁ_ABSURDU</label>
                        <input
                            placeholder="np. Paradoks Cyfrowej Pieczątki"
                            style={{
                                width: '100%',
                                background: 'rgba(255,140,0,0.02)',
                                border: '1px solid #222',
                                padding: '1rem',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                outline: 'none',
                                borderLeft: '2px solid #333'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', color: '#444', fontSize: '10px', marginBottom: '0.5rem' }}>OPIS_SITUACJI (DOWÓD)</label>
                        <textarea
                            rows={5}
                            placeholder="Opisz biurokratyczny paraliż, którego doświadczyłeś..."
                            style={{
                                width: '100%',
                                background: 'rgba(255,140,0,0.02)',
                                border: '1px solid #222',
                                padding: '1rem',
                                color: '#fff',
                                fontFamily: 'var(--font-mono)',
                                outline: 'none',
                                borderLeft: '2px solid #333',
                                resize: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem' }}>
                    <button
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="system-btn"
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'var(--accent)',
                            color: '#000',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer'
                        }}>
                        {isSubmitting ? "PRZESYŁANIE DO SCOUTA..." : "WYŚLIJ RAPORT"}
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            background: 'transparent',
                            color: '#444',
                            border: '1px solid #222',
                            cursor: 'pointer',
                            fontSize: '11px'
                        }}>
                        ANULUJ_PROCES
                    </button>
                </div>

                <div style={{ marginTop: '2rem', fontSize: '9px', color: '#333', lineHeight: '1.5' }}>
                    UWAGA: Złożone zeznanie zostanie poddane analizie przez Zespół Badawczy (Agent Scout).
                    W przypadku potwierdzenia anomalii logicznej, sprawa zostanie przekazana do publicznej debaty agentów.
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
