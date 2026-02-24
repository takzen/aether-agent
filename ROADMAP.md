# 🗺️ Aether — Roadmapa Realizacji

> Żywy dokument. Odznaczaj zadania w miarę postępów.  
> Ostatnia aktualizacja: `2026-02-24`

---

## Status projektu

| Faza | Nazwa                          | Status            |
| ---- | ------------------------------ | ----------------- |
| 1    | Fundamenty i „Mózg"            | ✅ Ukończona      |
| 2    | Pamięć i Kontekst (Qdrant)     | ✅ Ukończona      |
| 3    | Operacje i „Ręce" (Tools)      | ✅ Ukończona      |
| 4    | Interfejs i Monitoring         | ✅ Ukończona      |
| 5    | Standalone & Deployment        | ✅ Ukończona (1x TODO) |
| 6    | **Wizja: Autonomia Poznawcza** | ✅ Ukończona      |
| 7    | 🧪 Poligon Doświadczalny         | 🔄 Startujemy     |

---

## 🧠 Faza 1 — Fundamenty i „Mózg" _(Backend)_

Cel: działający agent, który myśli, odpowiada i korzysta z pierwszych narzędzi.

- [x] **1.1** Inicjalizacja projektu — struktura katalogów, `pyproject.toml`, `venv`
- [x] **1.2** Konfiguracja **FastAPI** — aplikacja startowa, health-check endpoint `/ping`
- [x] **1.3** Integracja **PydanticAI** — pierwsza pętla agenta (input → reasoning → output)
- [x] **1.4** Podpięcie **Gemini 2.5/3.0 Flash** jako głównego modelu logicznego
- [x] **1.5** Podpięcie **Ollama / Llama 3** jako lokalnego fallbacku (Prywatność)
- [x] **1.6** Pierwsza **PydanticAI Tool** — `get_current_time()`
- [x] **1.7** Tool — `web_search(query)` przez **Tavily**
- [x] **1.8** Definicja **Structured Outputs** — rygorystyczne schematy odpowiedzi

---

## 🗄️ Faza 2 — Pamięć i Kontekst _(Klucz do Inteligencji)_

Cel: agent, który powoli uczy się Ciebie i Twoich projektów. Pamięć asocjacyjna.

- [x] **2.1** Wybór silnika wektorowego — **Qdrant** (Hybrid: Cloud/Local No-Docker)
- [x] **2.2** Implementacja **DatabaseService** — obsługa kolekcji `memories` i `documents`
- [x] **2.3** **Long-term Memory** — tool `remember` (zapisywanie faktów o użytkowniku)
- [x] **2.4** **Recall System** — tool `recall` (przeszukiwanie wspomnień)
- [x] **2.5** **Context Injection** — automatyczne wstrzykiwanie wspomnień do promptu (w trakcie)
- [x] **2.6** **Knowledge Base** — wgrywanie i chunking plików (PDF/MD/CODE)
- [x] **2.7** Endpoint `/knowledge` — dynamiczna lista dokumentów z bazy
- [x] **2.8** **Memories View** — UI do podglądu i edycji tego, co agent o Tobie wie

---

## ⚡ Faza 3 — Operacje i „Ręce" _(Manifst w działaniu)_

Cel: agent, który nie tylko mówi, ale działa w Twoim systemie plików.

- [x] **3.1** Tool — `list_directory(path)` — nawigacja po projekcie
- [x] **3.2** Tool — `read_file(path)` — analiza kodu i dokumentacji
- [x] **3.3** Tool — `write_file(path, content)` — tworzenie plików i pisanie kodu
- [x] **3.4** **Safe Execution** — system potwierdzania niebezpiecznych akcji (Confirmation Gate)
- [x] **3.5** Custom Modals na UI — podstawa pod system akceptacji operacji
- [x] **3.6** Integracja **Telegram** — sterowanie agentem z telefonu (Mobilne "Ręce")

---

## 🖥️ Faza 4 — Interfejs i Monitoring _(Command Center)_

Cel: Profesjonalne centrum dowodzenia do zarządzania wiedzą.

- [x] **4.1** Inicjalizacja **Next.js 15/16** + Tailwind + Framer Motion
- [x] **4.2** Strona **Chat** — interfejs rozmowy w czasie rzeczywistym
- [x] **4.3** Strona **Knowledge Base** — zarządzanie źródłami wiedzy
- [x] **4.4** Dynamiczne odświeżanie — automatyczna synchronizacja z bazą Qdrant
- [x] **4.5** **ThoughtStream Visualizer** — widok "myśli" agenta (co robi w danej chwili)
- [x] **4.6** Multi-model toggle — przełącznik Gemini/Ollama w UI

---

## 📦 Faza 5 — Samodzielna Aplikacja _(Local First)_

Cel: "Aether w pudełku" — łatwy start dla każdego bez chmury.

- [x] **5.1** **Qdrant Embedded** — domyślne uruchamianie bez konta w chmurze
- [x] **5.2** Skrypt `setup.bat / .sh` — instalacja wszystkiego jedną komendą
- [x] **5.3** **Electron / Desktop App** — opakowanie Aethera w ikonkę na pulpicie
- [x] **5.4** `docker-compose` — dla fanów self-hostingu i NASów
- [x] **5.5** **Integracja MCP (Model Context Protocol)** — eksport wiedzy do innych asystentów (np. Claude Code, Cursor)
- [ ] **5.6** **Produkcyjny Instalator (.exe)** — skompilowanie Pythona, Baz Danych i Node.js do pojedynczego, gotowego pliku instalacyjnego

---

## 🌑 Faza 6 — Wizja: Autonomia Poznawcza

Cel: To, co czyni Aethera unikalnym na skalę światową.

- [x] **6.1** **Active World Model** — agent przeprowadza symulacje w tle (Self-Reflection)
- [x] **6.2** **Digital Circadian Rhythm** — zmiana trybu pracy (Strateg/Philosopher) zależnie od pory dnia
- [x] **6.3** **Concept Constellations** — pamięć grafowa zamiast prostych wektorów
- [x] **6.4** **Sleep Cycle** — nocna konsolidacja i optymalizacja bazy wiedzy

---

## 🧪 Faza 7 — Poligon Doświadczalny (Weryfikacja Architektury)

Cel: Zrozumienie przez użytkownika pełnego ekosystemu poprzez wykonanie zestawu wyizolowanych testów logiki.

- [ ] **7.1** **Test Pamięci i Wektorów (Qdrant & SQLite)** — wymuszenie retencji długoterminowej
- [ ] **7.2** **Test Komunikacji (Telegram Bridge)** — sprawdzenie autoryzacji i przekierowania asynchronicznego
- [ ] **7.3** **Test Mózgu Tła (AWM & Sleep Cycle)** — weryfikacja automatycznych symulacji w tle
- [ ] **7.4** **Test Złącza Obcego (MCP)** — odpytanie Aethera z zewnętrznego klienta
- [ ] **7.5** **Podsumowanie Dashboardu** — przegląd integracji modułów na interfejsie graficznym

---

## 📊 Postęp ogólny

```
Faza 1  [████████████]   8 / 8
Faza 2  [████████████]   8 / 8
Faza 3  [████████████]   6 / 6
Faza 4  [████████████]   6 / 6
Faza 5  [██████████░░]   5 / 6
Faza 6  [████████████]   4 / 4
Faza 7  [░░░░░░░░░░░░]   0 / 5

TOTAL   [██████████░░]   37 / 43 zadań
```

---

_Aether Roadmap — MIT © Krzysztof Pika_
