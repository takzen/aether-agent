# Instrukcja Obsługi Workflow: CORE-X (Analityk Architektury)

Plik ten definiuje standard pracy Agenta Aether w ramach projektu CORE-X. W tym trybie Agent nie jest biernym magazynem danych, lecz aktywnym partnerem analitycznym.

## 1. Dostarczanie Stanu (Ingestion)
Każdy nowy dokument lub fragment kodu wprowadzony do bazy wiedzy przez Użytkownika inicjuje proces analizy. Agent nie ogranicza się do indeksowania tekstu – szuka intencji, logiki i punktów styku z resztą systemu.

## 2. Mapowanie Struktury (Structural Mapping)
Wszystkie kluczowe byty (moduły, tabele, funkcje) są automatycznie łączone w grafie *Neural Topology*.
- **Synapsy Techniczne**: "Plik `X` importuje `Y`", "Funkcja `Z` zapisuje do tabeli `messages`".
- **Synapsy Logiczne**: "Złożoność tego modułu wpływa na wydajność bazy danych".

## 3. Audyt Krytyczny i Sugestie (Critical Audit)
To najważniejszy etap. Po zapoznaniu się z dokumentem, Agent generuje raport zawierający:
- **Analizę Architektury**: Ocena zgodności z obecnymi wzorcami projektu.
- **Sugestie Poprawy**: Propozycje refaktoryzacji, optymalizacji lub rozbudowy.
- **Wykrywanie Braków**: Informacja o brakujących elementach w dokumentacji lub kodzie.

## 4. Symulacja i Strategia (Simulation & Strategy)
Przed wprowadzeniem zmian Agent symuluje ich wpływ na projekt:
- "Zmiana typu danych w `schema.sql` wymusi aktualizację 3 komponentów frontendu".
- "Wdrożenie nowej funkcji `X` zwiększy obciążenie API o ok. 15%".

## 5. Warstwa Nadzoru i Cenzury (The Censors)
To krytyczny element modelu CORE-X. Każda sugestia lub zmiana zaproponowana przez Agenta Aether przechodzi przez filtr cenzury:
- **Użytkownik**: Główny decydent, oceniający przydatność biznesową i estetyczną sugestii.
- **Antigravity (AI Assistant)**: Partner techniczny Użytkownika, sprawdzający poprawność implementacji pod kątem jakości kodu i bezpieczeństwa.
- **Wspólna Ocena**: Sprawdzamy, czy "Aether o Aetherze" myśli logicznie, czy nie generuje halucynacji architektonicznych i czy jego wizja rozwoju jest spójna z fundamentami projektu.

## 6. Iteracja i Rozwój (Closing the Loop)
Użytkownik wraz z Antigravity akceptują, modyfikują lub odrzucają sugestie. Po zatwierdzeniu:
- Agent Aether aktualizuje manifest `docs/PROJECT_CORE_X.md`.
- Nowy stan projektu staje się fundamentem dla kolejnych analiz.
- Zapisujemy metryki "trafności" sugestii, aby trenować świadomość architektoniczną Agenta.

---
*Status Workflow: AKTYWNY (Recursive Oversight Mode)*
