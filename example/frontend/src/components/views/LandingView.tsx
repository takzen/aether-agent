
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Zap, Activity, Users, Database } from 'lucide-react';

interface LandingViewProps {
    onEnter: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onEnter }) => {
    return (
        <div className="landing-container" style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'var(--background)',
            color: '#fff',
            fontFamily: 'var(--font-mono)'
        }}>
            {/* BACKGROUND DECORATIONS */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                opacity: 0.1,
                pointerEvents: 'none'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }} />
            </div>

            {/* FLOATING PARTICLES/ICONS */}
            <motion.div
                className="landing-floating-icon top-left"
                animate={{
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', top: '15%', left: '10%', opacity: 0.2, color: 'var(--accent)' }}
            >
                <ShieldAlert size={80} className="icon-svg" />
            </motion.div>
            <motion.div
                className="landing-floating-icon bottom-right"
                animate={{
                    y: [0, 20, 0],
                    rotate: [0, -5, 0]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: 'absolute', bottom: '15%', right: '10%', opacity: 0.2, color: 'var(--acid-green)' }}
            >
                <Database size={80} className="icon-svg" />
            </motion.div>

            {/* MAIN CONTENT */}
            <div className="landing-content" style={{ zIndex: 1, textAlign: 'center', maxWidth: '800px', padding: '0 2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="landing-protocol" style={{ color: 'var(--accent)', fontSize: '12px', letterSpacing: '8px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                        [ PROTOKÓŁ_IDENTYFIKACJI_ABSURDU ]
                    </div>

                    <h1 className="landing-title" style={{
                        fontSize: 'clamp(3rem, 10vw, 6rem)',
                        fontFamily: 'var(--font-heading)',
                        margin: 0,
                        lineHeight: '0.9',
                        textShadow: '0 0 20px rgba(var(--accent-rgb), 0.5)'
                    }}>
                        BIEG <span style={{ color: 'var(--accent)' }}>WSTECZNY</span>
                    </h1>

                    <div className="landing-subtitle" style={{
                        marginTop: '1.5rem',
                        fontSize: '1.2rem',
                        color: '#666',
                        fontFamily: 'var(--font-heading)',
                        letterSpacing: '2px'
                    }}>
                        MONITORING ABSURDÓW SYSTEMOWYCH
                    </div>

                    <p className="landing-description" style={{
                        marginTop: '3rem',
                        fontSize: '1rem',
                        lineHeight: '1.8',
                        color: '#aaa',
                        maxWidth: '600px',
                        marginInline: 'auto'
                    }}>
                        Prawdziwe absurdy. Prawdziwe źródła. Platforma skanuje internet (Tavily) w poszukiwaniu
                        realnych przypadków biurokratycznego nonsensu. 10 agentów AI analizuje znalezione dane.
                    </p>

                    <div style={{
                        marginTop: '4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2rem'
                    }}>
                        <motion.button
                            onClick={onEnter}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="tech-border landing-button"
                            style={{
                                padding: '1.2rem 3rem',
                                background: 'transparent',
                                border: '1px solid var(--accent)',
                                color: 'var(--accent)',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                                boxShadow: '0 0 20px rgba(var(--accent-rgb), 0.2)',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--accent)';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 40px rgba(var(--accent-rgb), 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--accent)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(var(--accent-rgb), 0.2)';
                            }}
                        >
                            WEJDŹ DO TERMINALA
                        </motion.button>

                        <div className="landing-status-bar" style={{ display: 'flex', gap: '2rem', opacity: 0.4, marginTop: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '10px' }}>
                                <Activity size={12} /> SYSTEM_READY
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '10px' }}>
                                <Users size={12} /> 10_AGENTS_ONLINE
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '10px' }}>
                                <Zap size={12} /> REAL_DATA_SOURCES
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* DECORATIVE TERMINAL LINES AT THE SIDES */}
            <div className="landing-decor-left" style={{ position: 'absolute', left: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '5px', opacity: 0.2 }}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ width: i % 3 === 0 ? '15px' : '30px', height: '2px', background: 'var(--accent)' }} />
                ))}
            </div>
            <div className="landing-decor-right" style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '5px', opacity: 0.2 }}>
                {[...Array(20)].map((_, i) => (
                    <div key={i} style={{ width: i % 3 === 0 ? '15px' : '30px', height: '2px', background: 'var(--accent)', alignSelf: 'flex-end' }} />
                ))}
            </div>

            {/* VERSION INFO */}
            <div className="landing-version" style={{
                position: 'absolute',
                bottom: '2rem',
                fontSize: '9px',
                color: '#444',
                letterSpacing: '2px',
                textAlign: 'center',
                width: '100%'
            }}>
                v3.0.0-REAL // TAVILY_ENABLED // PRAWDZIWE_ŹRÓDŁA
            </div>
        </div>
    );
};

export default LandingView;
