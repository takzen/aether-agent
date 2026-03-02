---
description: Proces podsumowania sesji badawczej i analizy zachowania agenta (Session Synthesis & Agent Behavioral Analysis)
---

# 📊 Workflow: Analiza Sesji i Weryfikacja Behawioralna (V-Analysis)

Ten workflow służy do rzetelnego podsumowania etapu prac, eliminacji "halucynacji" i weryfikacji faktycznego zachowania agenta względem dostarczonych danych (RAG/Web).

## 1. Protokół Zakończenia (Termination Protocol)
Każda sesja badawcza musi zakończyć się chłodną analizą faktów. Unikamy marketingu i kwiecistych opisów. Skupiamy się na:
- Co zostało zaindeksowane (identyfikacja plików w Qdrant/SQLite).
- Jakie narzędzia wywołał agent (analiza logów: `search_knowledge_base`, `web_search`).
- Czy odpowiedź była oparta na faktach (DOCS/WEB), czy na domysłach (HYPOTHESIS).

## 2. Analiza Zachowania Agenta (Behavioral Audit) - Sesja 2026-03-01
Podsumowanie dzisiejszych testów na przykładzie "Symbiozy Poznawczej":

### ✅ Sukcesy Techniczne:
*   **Integracja RAG**: Pliki `symbioza_poznawcza.md` oraz `badania_adamatzky_2022.md` zostały poprawnie wciągnięte do bazy wektorowej. Agent precyzyjnie wyodrębnił z nich gatunki grzybów (*Schizophyllum commune*) i parametry impulsów (leksykon 50 słów).
*   **Wykrywanie Luk (Gap Detection)**: Agent poprawnie zdiagnozował brak szczegółów molekularnych o *Mimosa pudica* w bazie lokalnej i samodzielnie zainicjował `web_search` (Tavily), aby domknąć kontekst.
*   **Kontekstualizacja**: Skuteczne powiązanie biologicznej habituacji z systemowym mechanizmem **Self-Pruning**.

### ⚠️ Wykryte Problemy (Do Korekty):
*   **Nadinterpretacja (Persona Overdrive)**: Agent ma tendencję do ubierania prostych operacji technicznych w zbyt "wizjonerski" język, co może sugerować procesy, które fizycznie jeszcze nie zachodzą (np. "samodzielna ewolucja grafu").
*   **Płytki RAG**: Przy zbyt ogólnych pytaniach agent polega na `HYPOTHESIS` zamiast wymuszać `DOCS`. Wymaga to doprecyzowania promptów lub obniżenia progu `match_threshold`.

## 3. Akcje na Kolejną Sesję
- [ ] Opracowanie szkicu protokołu komunikacji bezadresowej (inspirowanego *fungal spikes*).
- [ ] Implementacja mechanizmu regulacji "natrętności persony" (Persona Attenuation).
- [ ] Weryfikacja stabilności grafu wiedzy po kolejnym restarcie systemu.

## 4. Styl Komunikacji (Preferred Communication Style)
**ZASADA KLUCZOWA**: Agent musi komunikować się w sposób rzetelny, bezpośredni i pozbawiony "AI-owej egzaltacji".
*   **Wzorzec**: Język konkretny, dynamiczny i ludzki (np. "RAG wchodzi gładko", "Agent bez problemu przetrawił raporty").
*   **Antywzorzec**: Fantazjowanie, używanie górnolotnych pojęć marketingowych (np. "rewolucja poznawcza", "samodzielna ewolucja świadomości"), "lanie wody".
*   **Cel**: Każdy komunikat ma być jak szybki update z testów – konkretny wniosek + co z tego wynika dla pracy, bez zbędnych opisów.


---
*Status: Zweryfikowano | Dokumentacja techniczna projektu Aether Core*
