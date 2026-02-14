
import React, { useState } from 'react';
import { Lock, ShieldCheck, Cpu, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
    onLoginSuccess: (code: string) => void;
    onGoHome: () => void;
    triggerNotification: (text: string, type?: 'success' | 'error') => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onGoHome, triggerNotification }) => {

    const [accessCode, setAccessCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${API_URL}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: accessCode })
            });

            if (response.ok) {
                // Success - access granted by backend
                onLoginSuccess(accessCode);
            } else {
                triggerNotification("BŁĄD AUTORYZACJI: NIEPOPRAWNA SYGNATURA NEURALNA", "error");
            }
        } catch (err) {
            console.error('Auth connection error:', err);
            triggerNotification("BŁĄD POŁĄCZENIA: MODUŁ AUTORYZACJI OFFLINE", "error");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, rgba(255,140,0,0.05) 0%, transparent 70%)'
        }}>
            <div className="tech-border" style={{
                width: '90%',
                maxWidth: '400px',
                padding: '2rem',
                background: 'rgba(5,5,5,0.95)',
                boxShadow: '0 0 40px rgba(0,0,0,0.8)'
            }}>

                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', border: '1px solid var(--border)', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                        <Lock size={32} />
                    </div>
                    <div style={{ color: 'var(--accent)', fontSize: '10px', letterSpacing: '4px', marginBottom: '0.5rem' }}>[ STREFA_RESTRYKCYJNA ]</div>
                    <h2 style={{ fontSize: '1.8rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>AUTORYZACJA</h2>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <div style={{ color: '#444', fontSize: '9px', marginBottom: '0.8rem', letterSpacing: '2px' }}>SYGNATURA_DOSTĘPU_ADMINA</div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="••••••••••••"
                                style={{
                                    width: '100%',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid var(--border)',
                                    padding: '1rem',
                                    color: '#fff',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>
                                <Cpu size={14} />
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={isVerifying}
                        className="system-btn"
                        style={{
                            padding: '1.2rem',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem'
                        }}
                    >
                        {isVerifying ? (
                            <>WERYFIKACJA_W_TOKU...</>
                        ) : (
                            <>
                                <ShieldCheck size={16} />
                                PRZYSTĄP_DO_WERYFIKACJI
                            </>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onGoHome}
                        className="system-btn"
                        style={{
                            padding: '0.8rem',
                            fontSize: '11px',
                            opacity: 0.6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <ArrowLeft size={14} /> POWRÓT
                    </button>
                </form>


                <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '1.5rem' }}>
                    <div style={{ fontSize: '9px', color: '#333' }}>
                        PROTOKÓŁ_SZYFROWANIA: <span style={{ color: '#555' }}>AES_256_GCM</span>
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--error)', fontWeight: 'bold' }}>
                        IP_LOGGED
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
