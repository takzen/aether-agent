# Aether Agent Core Rules & Guidelines (GEMINI.md)

Ten plik zawiera kluczowe zasady, preferencje i wytyczne, których muszę przestrzegać podczas pracy nad projektem Aether Agent. Jest to moja "pamięć operacyjna" dotycząca standardów jakości i Twoich oczekiwać.

## 1. Design & Aesthetics (Premium Standard)
*   **Wizualne WOW:** Każdy element UI musi wyglądać nowocześnie i profesjonalnie. Unikamy standardowych kolorów (czysty czerwony, niebieski). Używamy palet HSL, gradientów i trybu Dark Mode.
*   **Interaktywność:** Priorytetem są mikro-animacje (framer-motion), hover effects i szklane interfejsy (glassmorphism).
*   **Brak placeholderów:** Jeśli potrzebujemy obrazu, generuję go; jeśli tekstu – piszę konkretną treść.

## 2. Technologia & Architektura
*   **Backend:** Python (FastAPI), SQLite (local memory), Qdrant (vector knowledge).
*   **Frontend:** Next.js, React, TailwindCSS (tylko na wyraźną prośbę), Vanilla CSS dla unikalnych komponentów.
*   **Komunikacja:** Standard Model Context Protocol (MCP) do interakcji między agentem a narzędziami systemowymi.

## 3. Workflow & Terminal
*   **Bash:** Używam Basha do operacji systemowych (lepiej radzi sobie z wielkością liter na Windows).
*   **Dashboard:** Terminal w dashboardzie to centralne "Command Center". Rozwijamy go o Slash Commands (`/logs`, `/clear`, `/simulate`).
*   **Roadmapy:** Wszystkie archiwalne roadmapy trafiają do `docs/archive/roadmaps/`.

## 4. Zasady Współpracy
*   **Proaktywność:** Rozwiązuję błędy zanim o nie zapytasz, sprawdzam statusy buildów i testów.
*   **Pamięć:** Przed rozpoczęciem nowej analizy sprawdzam Knowledge Items (KI) i folder `customizations/`.

## 5. Wersjonowanie & Release
*   **Wersja:** Każda zmiana wersji musi być odzwierciedlona w:
    *   `frontend/src/components/Sidebar.tsx` (wyświetlana wersja na dole).
    *   `README.md`.
    *   `backend/pyproject.toml`.
    *   `frontend/package.json` oraz `desktop/package.json`.
*   **Git Tag:** Po zmianie wersji w plikach, należy stworzyć tag gita (np. `git tag -a v1.1.0 -m "Release v1.1.0"`).
*   **Proces:** Przy większych zmianach lub zakończeniu etapu z roadmapy, inicjuję proces `/release`.

---
*Ostatnia aktualizacja: 2026-02-27*
