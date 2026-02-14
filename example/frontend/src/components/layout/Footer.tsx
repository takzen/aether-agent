
import React from 'react';

interface FooterProps {
    setActiveView: (view: string) => void;
    isAdmin: boolean;
}

const Footer: React.FC<FooterProps> = ({ setActiveView, isAdmin }) => {
    return (
        <footer style={{
            height: '32px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'rgba(5,5,5,0.98)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            fontSize: '9px',
            color: '#888',
            zIndex: 1000,
            flexShrink: 0,
            letterSpacing: '1px'
        }}>
            <div className="footer-info" style={{ display: 'flex', gap: '2rem' }}>
                <span style={{ color: '#999' }}>© 2026 BIEG WSTECZNY // ARCHIWUM ABSURDÓW SYSTEMOWYCH</span>
                <span style={{ color: '#777' }}>LOKALIZACJA: WAW_CENTRAL_NODE_01</span>
            </div>


            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div className="footer-info" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#888' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--acid-green)', boxShadow: '0 0 4px var(--acid-green)' }}></div>
                    UPTIME: 99.99% [STABLE]
                </div>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <a href="https://github.com/takzen/bieg-wsteczny-prezentacja" target="_blank" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>GITHUB_SOURCE</a>
                    <button onClick={() => setActiveView('privacy')} style={{ background: 'none', border: 'none', color: '#888', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = '#888'}>POLITYKA_RODO</button>
                    <button onClick={() => setActiveView(isAdmin ? 'admin_dashboard' : 'admin_login')} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontSize: 'inherit', fontFamily: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'bold', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fff'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent)'}>
                        {isAdmin ? 'PANEL_ADMINA' : 'ZALOGUJ_ADMIN'}
                    </button>
                </div>
            </div>
        </footer>

    );
};

export default Footer;
