
import React from 'react';

const ManifestView: React.FC = () => {
    return (
        <div className="view-container">

            <div className="tech-border view-content" style={{
                padding: '3rem',
                backgroundColor: 'rgba(255,140,0,0.02)',
                borderTop: '4px solid var(--accent)'
            }}>

                <div style={{ color: 'var(--accent)', fontSize: '10px', letterSpacing: '3px', marginBottom: '2rem' }}>
                    MANIFEST_SYSTEMU // WERSJA 1.0 // CEL: ROZSĄDEK
                </div>
                <h2 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '3rem', fontFamily: 'var(--font-heading)' }}>
                    MYŚLISZ, ŻE TO <span style={{ color: 'var(--accent)' }}>FIKCJA</span>?
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>01 // ABSURD JEST PALIWEM</div>
                        <p style={{ color: '#888', lineHeight: '1.8' }}>
                            Biurokracja w Polsce to nie błąd systemu. To jego główny ficzer. &apos;Bieg Wsteczny&apos; to protokół, który zamienia frustrację obywatela w twarde dane analityczne.

                        </p>
                    </div>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>02 // AGENCI TO SYMBOLE</div>
                        <p style={{ color: '#888', lineHeight: '1.8' }}>
                            Scout, Legalist, Shrink... to nie bajki. To personifikacje procesów myślowych, przez które przechodzisz stojąc w kolejce od 6 rano.
                        </p>
                    </div>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>03 // TECHNOLOGIA NIE ZBAWI</div>
                        <p style={{ color: '#888', lineHeight: '1.8' }}>
                            Wykorzystujemy AI do chirurgicznej sekcji przepisów. Od historycznych nawyków (Historian) po prawnicze pułapki (Legalist).
                        </p>
                    </div>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>04 // TRANSPARENTNOŚĆ TO LEKARSTWO</div>
                        <p style={{ color: '#888', lineHeight: '1.8' }}>
                            Każdy absurd zostanie zważony i publicznie poddany debacie. Jeśli system nie potrafi się obronić przed logiką maszyn, nie zasługuje na zaufanie.
                        </p>
                    </div>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>05 // CZŁOWIEK PONAD PIECZĄTKĘ</div>
                        <p style={{ color: '#888', lineHeight: '1.8' }}>
                            Jesteśmy cyfrowym skansenem, który pokazuje błędy teraźniejszości, by nie stały się fundamentem przyszłości.
                        </p>
                    </div>
                    <div>
                        <div style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>06 // CHARAKTER PROJEKTU</div>
                        <p style={{ color: '#888', lineHeight: '1.8' }}>
                            Wszelkie prezentowane tu dane, agenci i interakcje mają charakter wyłącznie edukacyjny i satyryczny. Projekt służy jako studium przypadku w zakresie UX i cyfryzacji usług publicznych.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManifestView;
