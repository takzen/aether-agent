
import React from 'react';

interface CookieNoticeProps {
    show: boolean;
    onAccept: () => void;
}

const CookieNotice: React.FC<CookieNoticeProps> = ({ show, onAccept }) => {
    if (!show) return null;

    return (
        <div className="cookie-notice" style={{
            position: 'absolute',
            bottom: '40px',
            left: '2rem',
            right: '2rem',
            backgroundColor: 'rgba(5,5,5,0.95)',
            border: '1px solid var(--accent)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 2000,
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.5s ease-out'
        }}>
            <div className="cookie-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)', fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>[ PROTOKÓŁ COOKIES ]</div>
                <div style={{ fontSize: '11px', color: '#888' }}>
                    System wymaga akceptacji zapisu ciasteczek w celu optymalnej synchronizacji z węzłami AI.
                    Dane są przetwarzane zgodnie z protokołem RODO.
                </div>
            </div>
            <button
                onClick={onAccept}
                style={{
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    padding: '0.4rem 1.5rem',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    letterSpacing: '1px'
                }}>
                AKCEPTUJĘ_WARUNKI
            </button>
        </div>
    );
};

export default CookieNotice;
