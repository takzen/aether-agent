# Dziennik Zmian (Changelog)

Wszystkie istotne zmiany w projekcie Aether Agent zostaną udokumentowane w tym pliku.

## [1.3.0] - 2026-02-28
### Dodano
- **Neuromorphic Cognition Engine**: Oficjalne wydanie centrum `/cognition`.
  - **Profile Persony**: Analytical, Balanced, i Creative z automatyczną kalibracją temperatury (Logical Drift).
  - **Własne Dyrektywy**: Ręczne nadpisywanie zachowania dla stałych instrukcji stylu i reguł.
  - **Cykl Dobowy (Digital Circadian Rhythm)**: Dynamiczna zmiana osobowości (Strateg, Wykonawca, Filozof) zależna od czasu.
  - **Bezpieczeństwo**: Wizualne wskaźniki "Danger Zone" i wielopoziomowa autonomia (Manual, Co-Pilot, Full).
- **Premium Mermaid Rendering**: Zintegrowana wizualizacja diagramów z interaktywnym trybem Pan & Zoom.
- **Agregacja Narzędzi**: Identyczne wywołania narzędzi są teraz grupowane z licznikiem (np. `connect_concepts x5`).
- **Szklane Bloki Kodu**: Elegancki i minimalistyczny wygląd bloków kodu (Glassmorphism).

### Naprawiono
- **Zgodność ESLint**: Czysty build bez ostrzeżeń dotyczących `no-explicit-any` oraz nieużywanych zmiennych.
- **Stabilność Hydracji SSR**: Rozwiązano błędy synchronizacji stanu w Next.js.
- **Stylistyka UI**: Poprawione wyrównanie list i nowe efekty poświaty.

## [1.2.0] - 2026-02-27
### Dodano
- **Baza Wiedzy i Dokumentacja**: Pełna implementacja trasy `/docs` z obsługą diagramów Mermaid.
- **Nowa Dokumentacja**: Dodano `FEATURES.md` (opisy systemów) oraz `API.md` (referencja techniczna).
- **Kompatybilność React 19**: Gruntowna przebudowa systemu stanu w celu uniknięcia błędów SSR.
- **Ulepszony Terminal**: Minimalistyczny interfejs, unikalne klucze w logach i nowa komenda `/logclear`.

### Naprawiono
- **Błędy Hydracji**: Poprawki synchronizacji danych między serwerem a klientem w Dashboardzie.
- **Bezpieczeństwo Komend**: Literówki w komendach z ukośnikiem nie są już przekazywane bezpośrednio do AI.

## [1.1.0] - 2026-02-27 (Wydanie Bazowe)
### Dodano
- **Active World Model**: Silnik symulacji kontekstu pracujący w tle.
- **Concept Constellations**: Pamięć grafowa oparta na SQLite i Qdrant.
- **Desktop Shell**: Aplikacja natywna (Electron) dla Aether Agent.
- **Morning Brief**: Poranne podsumowanie stanu systemu i postępów.
