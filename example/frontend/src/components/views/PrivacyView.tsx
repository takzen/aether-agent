
import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface PrivacyViewProps {
    onClose: () => void;
}

const PrivacyView: React.FC<PrivacyViewProps> = ({ onClose }) => {

    return (
        <div className="view-container">
            <div className="tech-border view-content" style={{ background: 'rgba(5,5,5,0.8)' }}>

                <button
                    onClick={onClose}
                    className="system-btn"
                    style={{
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '11px'
                    }}
                >
                    <ArrowLeft size={14} /> POWRÓT
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '1.5rem' }}>

                    <ShieldCheck size={48} color="var(--accent)" />
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '10px', marginBottom: '0.4rem' }}>[ RODO_COMPLIANCE_PROTOCOL ]</div>
                        <h2 style={{ fontSize: '2.5rem', color: '#fff', margin: 0, fontFamily: 'var(--font-heading)' }}>POLITYKA PRYWATNOŚCI</h2>
                    </div>
                </div>

                <div style={{ color: '#bbb', fontSize: '13px', lineHeight: '2' }}>
                    <p>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '0.3rem' }}>§1. DEKLARACJA OGÓLNA</strong>
                        System &quot;Bieg Wsteczny&quot; szanuje Twoje dane bardziej niż Urząd Skarbowy.

                        Nie zbieramy numerów PESEL, NIP, ani imion Twoich przodków do 4 pokolenia wstecz.
                    </p>
                    <p>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '0.3rem' }}>§2. SZPIEGOWANIE (COOKIES)</strong>
                        Używamy ciasteczek (cookies), ale tylko tych technicznych. Służą one do utrzymania sesji Twojej walki z biurokracją. Nie sprzedajemy danych reklamodawcom – reklamodawcy boją się tego, co tu odkrywamy.
                    </p>
                    <p>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '0.3rem' }}>§3. PRAWO DO ZAPOMNIENIA</strong>
                        Masz prawo żądać usunięcia swoich logów z systemu. Wystarczy wysłać sygnał do Agenta Legalista (formularz w przygotowaniu). Pamiętaj jednak: w internecie nic nie ginie, a w urzędzie tym bardziej.
                    </p>
                    <p>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '0.3rem' }}>§4. BEZPIECZEŃSTWO</strong>
                        Twoje dane są szyfrowane protokołem, którego sami urzędnicy nie potrafią złamać, bo wymagałoby to zainstalowania aktualnej przeglądarki. Jesteś bezpieczny.
                    </p>
                    <p>
                        <strong style={{ color: '#fff', display: 'block', marginBottom: '0.3rem' }}>§5. ADMINISTRATOR_SYSTEMU</strong>
                        Administratorem danych jest jednostka centralna TAKZEN Archiwum. Kontakt z jednostką kontrolną możliwy wyłącznie drogą cyfrową: <span style={{ color: 'var(--accent)' }}>takzen.app@gmail.com</span>. Wszelkie wnioski o status danych są analizowane przez Agenta Legalista.
                    </p>
                </div>


                <div style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #333', color: '#666', fontSize: '10px', textAlign: 'right' }}>
                    ZATWIERDZONO PRZEZ: KANCELARIA CYFROWA &quot;LEGALIST&quot;

                </div>
            </div>
        </div>
    );
};

export default PrivacyView;
