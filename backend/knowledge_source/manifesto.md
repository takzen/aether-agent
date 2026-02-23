# 🛰️ Aether: Technical Manifesto
### *Zdejmujemy ograniczenia bezstanowych LLM poprzez Wektorową Pamięć Asocjacyjną.*

Każdy współczesny chatbot cierpi na **"cyfrową amnezję"**. Twoje preferencje, kontekst projektu i historia decyzji znikają wraz z zamknięciem sesji. Aether to system operacyjny dla Twojej osobistej wiedzy, zaprojektowany jako **Local-First Agentic Runtime**.

## 🔴 I. Hardwarowa i Programowa Prywatność (Local Sovereignty)
Większość agentów to "okna na chmurę". Aether odwraca tę piramidę.
*   **Vector Engine**: Wykorzystujemy hybrydowy silnik **Qdrant (Embedded)**. Dane wektorowe (Twoje wspomnienia) nie opuszczają dysku, chyba że jawnie podłączysz Qdrant Cloud.
*   **Data Tier**: Zero zewnętrznych baz SQL. Pamięć jest trwała, lokalna i synchronizowana w czasie rzeczywistym z interfejsem.

## 🧠 II. Architektura Podwójnej Pamięci (Dual-Stream RAG)
Aether nie tylko "szuka w dokumentach". On buduje Twoją tożsamość cyfrową poprzez dwa niezależne strumienie:
1.  **Static Knowledge (The Library)**: Wysoko wydajny RAG mapujący Twoje dokumenty (PDF, MD, CODE) na przestrzeń wektorową 768-D.
2.  **Episodic Memory (The Ego)**: Dynamiczne wyłapywanie faktów z rozmowy asocjacyjnie łączące nowe fakty z przeszłością.
3.  **Concept Constellations (Nowość)**: Zastępujemy proste wyszukiwanie wektorowe **Dynamiczną Syntezą Pojęć**. Aether nie szuka tylko dokumentów – on utrzymuje "Konstelacje Myśli", mapując Twoje intencje, a nie tylko suche fakty.

## 🌑 III. Od RAG do "Active World Model" (Wewnętrzna Symulacja)
Aether ewoluuje z reaktywnego bota w aktywny model świata.
*   **Internal Simulation**: Agent nie czeka uśpiony. Przeprowadza proaktywne symulacje – analizuje potencjalne konflikty w Twoich projektach (np. wpływ wybranej typografii na planowane moduły), zanim o nie zapytasz.
*   **Self-Reflection**: Wykorzystując okno kontekstowe Gemini 3.0 Flash, raz na jakiś czas Aether robi "Self-Reflection" – szuka nowych połączeń i optymalizacji w całej bazie wiedzy.

## 🕒 IV. "Digital Circadian Rhythm" (Cyfrowy Rytm Okołodobowy)
Aether rozumie czas i Twoją energię, dostosowując swój tryb pracy:
*   **Rano (Strateg)**: Podsumowuje nocne symulacje, konsoliduje fakty i wyznacza priorytety.
*   **Dzień (Hands)**: Maksymalna operacyjność – pisanie kodu, wykonywanie skryptów, działanie "akcja-reakcja".
*   **Wieczór (Philosopher)**: Czas na refleksję nad sensem wybranych rozwiązań i przygotowanie do konsolidacji.

## 🌑 V. Synteza Proaktywna (Cognitive Autonomy)
*   **Odpowiedzialność, nie tylko posłuszeństwo**: Aether nie czeka na prompt. On monitoruje status Twoich projektów i Twoje samopoczucie techniczne.
*   **The Sleep Cycle**: Nocna rekonsolidacja bazy wektorowej w strukturę grafową. Aether "marzy" o Twoim kodzie, szukając błędów logiki, zanim usiądziesz do klawiatury.
*   **Intent Awareness**: Jeśli zmieniasz zdanie, Aether pyta o zmianę Twojej fundamentalnej filozofii projektowej.

## 🛠️ VI. Transparentna Pętla Rozumowania (Reasoning Chain)
Koniec z czarnymi skrzynkami. Aether to **White-Box AI**.
*   **Orkiestracja**: Oparty na rygorystycznym systemie **Pydantic-AI**. Każda decyzja o użyciu narzędzia jest walidowana przez schematy danych.
*   **ThoughtStream**: Backend przesyła logi myślowe w czasie rzeczywistym. Widzisz historię każdej odpowiedzi i każde połączenie między węzłami.

## ⚡ VII. Autonomia Operacyjna (The Hands)
Aether nie kończy na generowaniu tekstu.
*   **Actionable Tools**: Poprzez wbudowany terminal i dostęp do systemu plików, agent staje się **Runtime'em**. Może pisać, testować i uruchamiać kod, pamiętając "dlaczego" stoi za każdą linią skryptu.

## 🔗 Manifest Techniczny:
*   **Backend**: Python 3.12 (FastAPI, Pydantic-AI)
*   **AI Engine**: Gemini 3.0 Flash (Long Context) + Gemini Embeddings
*   **Database**: Qdrant (Hybrid Cloud/Local) + Graph Logic
*   **Frontend**: Next.js 16 (Dashboard Interface)

---
**Aether to nie tylko automatyzacja. To synteza inteligencji z ciągłością istnienia.**
