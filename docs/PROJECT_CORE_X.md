# Projekt: CORE-X (Aether o Aetherze)

## Przegląd Projektu
CORE-X to wewnętrzna inicjatywa mająca na celu wykorzystanie Agenta Aether do analizy, dokumentowania i rozbudowy jego własnej architektury. Jest to podejście typu "Recursive AI" (Rekurencyjna SI) do rozwoju projektu.

## Główne Filary Architektury
1. **Backend (Python/FastAPI)**:
    - `main.py`: Orkiestrator i punkt wejścia API.
    - `local_db.py`: Warstwa synchronizacji SQLite dla sesji i pamięci grafowej.
    - `agent.py`: Logika agenta oparta na PydanticAI i definicje narzędzi.
    - `world_model.py`: Moduł symulacji i przewidywania przyszłych stanów.

2. **Frontend (Next.js/React)**:
    - `NeuralTopologyView.tsx`: Główna wizualizacja pamięci grafowej (Neural Topology).
    - `CommandCenter`: Centralny pulpit nawigacyjny do interakcji systemowych i slash commands.
    - `Memories`: Wizualizacja i przywoływanie danych z magazynu wektorowego (Qdrant).

3. **Silniki Danych**:
    - **SQLite**: Strukturalne dane relacyjne (Sesje, Logi systemowe).
    - **Qdrant**: Wielowymiarowe embeddingi wektorowe do semantycznego przywoływania wiedzy.
    - **Knowledge Base** (Baza Wiedzy): Źródła Markdown/Tekstowe przetwarzane na fragmenty (chunks).

## Cel Projektu
Poprawa rekurencyjnego rozumienia agenta, aby umożliwić mu autonomiczne budowanie własnych funkcjonalności i utrzymywanie grafu zależności w Neural Topology.
