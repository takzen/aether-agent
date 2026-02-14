# 🗺️ Aether — Roadmapa Realizacji

> Żywy dokument. Odznaczaj zadania w miarę postępów.  
> Ostatnia aktualizacja: `2025-02-13`

---

## Status projektu

| Faza | Nazwa                       | Status            |
| ---- | --------------------------- | ----------------- |
| 1    | Fundamenty i „Mózg"         | 🔲 Nie rozpoczęta |
| 2    | Pamięć i Kontekst           | 🔲 Nie rozpoczęta |
| 3    | „Ręce" — Integracje i Akcje | 🔲 Nie rozpoczęta |
| 4    | Interfejs i Monitoring      | 🔲 Nie rozpoczęta |
| 5    | Bezpieczeństwo i Deployment | 🔲 Nie rozpoczęta |

---

## 🧠 Faza 1 — Fundamenty i „Mózg" _(Backend)_

Cel: działający agent, który myśli, odpowiada i korzysta z pierwszych narzędzi.

- [x] **1.1** Inicjalizacja projektu — struktura katalogów, `pyproject.toml`, `venv`
- [x] **1.2** Konfiguracja **FastAPI** — aplikacja startowa, health-check endpoint `/ping`
- [x] **1.3** Integracja **PydanticAI** — pierwsza pętla agenta (input → reasoning → output)
- [x] **1.4** Podpięcie **Gemini 3 Flash-preview** jako głównego modelu logicznego
- [ ] **1.5** Podpięcie **Ollama / Llama 3** jako lokalnego fallbacku dla prywatnych danych
- [ ] **1.6** Mechanizm przełączania modeli (env flag lub runtime switch)
- [x] **1.7** Pierwsza **PydanticAI Tool** — `get_current_time()`
- [ ] **1.8** Tool — `get_weather(location)` z zewnętrznym API
- [ ] **1.9** Tool — `web_search(query)` przez **Tavily** lub **DuckDuckGo**
- [ ] **1.10** Definicja **Structured Outputs** — rygorystyczne schematy Pydantic dla każdego rodzaju odpowiedzi agenta
- [ ] **1.11** Testy jednostkowe dla narzędzi i schematów

---

## 🗄️ Faza 2 — Pamięć i Kontekst _(Local ChromaDB / Supabase)_

Cel: agent, który pamięta przeszłe rozmowy i potrafi uczyć się z dokumentów. Note: Zmieniono na Local ChromaDB dla prywatności.

- [x] **2.1** Uruchomienie projektu **Local ChromaDB** (zastąpiło Supabase w tej fazie)
- [ ] **2.2** Schemat bazy danych — tabele: `conversations`, `memories`, `documents`, `chunks`
- [x] **2.3** Klient Bazy Danych w Pythonie — serwis `DatabaseService` (ChromaDB)
- [x] **2.4** **Memory Management** — zapis wspomnień (tool `remember`)
- [x] **2.5** Wyszukiwanie wektorowe — tool `recall`
- [ ] **2.6** Budowanie kontekstu — wstrzykiwanie znalezionych wspomnień do promptu systemowego
- [ ] **2.7** Pipeline **Document Ingestion** — wgrywanie plików PDF i Markdown
- [ ] **2.8** **Chunking** dokumentów (np. `langchain.text_splitter` lub własny)
- [x] **2.9** Generowanie i zapis embeddingów (Gemini Embeddings)
- [ ] **2.10** Tool — `search_knowledge_base(query)` do przeszukiwania własnych dokumentów
- [ ] **2.11** Endpoint `/ingest` w FastAPI do wgrywania plików przez API

---

## ⚡ Faza 3 — „Ręce" _(Integracje i Akcje)_

Cel: agent, który działa autonomicznie, wysyła powiadomienia i obsługuje zewnętrzne systemy.

- [ ] **3.1** Tool — `read_file(path)` i `write_file(path, content)`
- [ ] **3.2** Tool — `list_directory(path)` do nawigacji po systemie plików
- [ ] **3.3** Tool — `call_webhook(url, payload)` do integracji z zewnętrznymi serwisami
- [ ] **3.4** Tool — `execute_terminal(command)` z obowiązkowym potwierdzeniem (patrz Faza 5)
- [ ] **3.5** **Cron Jobs** z `APScheduler` lub `Celery` wbudowane w FastAPI
- [ ] **3.6** Zadanie poranne — codziennie o `08:00` agent wysyła podsumowanie dnia
- [ ] **3.7** System szablonów briefingów (pogoda, kalendarz, top wiadomości)
- [ ] **3.8** **Multi-channel Adapter System** — interfejs do obsługi różnych kanałów (BaseAdapter)
- [ ] **3.9** Implementacja pierwszego adaptera (np. **Telegram**) — odbieranie i wysyłanie wiadomości
- [ ] **3.10** Obsługa przycisków / inline keyboard w Telegramie
- [ ] **3.11** Implementacja kolejnych adapterów (**Discord**, Slack lub Custom Webhooks)
- [ ] **3.12** System zunifikowanych powiadomień push dla Dashboardu i kanałów zewnętrznych

---

## 🖥️ Faza 4 — Interfejs i Monitoring _(Frontend)_

Cel: Command Center do zarządzania agentem, wiedzą i obserwacji jego „myślenia" w czasie rzeczywistym.

- [x] **4.1** Inicjalizacja projektu **Next.js 16** (App Router) + Tailwind CSS + shadcn/ui
- [ ] **4.2** Klient API — połączenie dashboardu z backendem FastAPI
- [x] **4.3** Strona **Chat** — interfejs rozmowy z agentem w przeglądarce
- [x] **4.4** Strona **Settings** — dashboard settings
- [x] **4.5** Strona **Knowledge Base** — dashboard KB
- [ ] **4.6** Upload dokumentów z poziomu dashboardu (drag & drop)
- [x] **4.7** Strona **Agent Logs** — dashboard logs
- [x] **4.8** **Agentic Visualization** — memories graph visualization
- [ ] **4.9** Integracja **Supabase Realtime** — logi odświeżane na żywo bez odświeżania strony
- [ ] **4.10** Strona **Costs Monitor** — śledzenie zużycia tokenów i szacowanych kosztów API
- [x] **4.11** Responsywność — podstawowy widok mobile dla zarządzania z telefonu

---

## 🔒 Faza 5 — Bezpieczeństwo i Deployment

Cel: system gotowy do długoterminowego self-hostingu, bezpieczny i łatwy w utrzymaniu.

- [ ] **5.1** **Confirmation Gate** — narzędzia oznaczone jako `dangerous=True` wymagają potwierdzenia przez UI lub Telegram przed wykonaniem
- [ ] **5.2** Whitelist bezpiecznych ścieżek dla operacji na plikach
- [ ] **5.3** Rate limiting na endpointach FastAPI (`slowapi`)
- [ ] **5.4** Autentykacja — zabezpieczenie API kluczem lub JWT (Supabase Auth)
- [ ] **5.5** `Dockerfile` dla backendu FastAPI
- [ ] **5.6** `Dockerfile` dla frontendu Next.js
- [ ] **5.7** `docker-compose.yml` — kompletny stack jedną komendą
- [ ] **5.8** Zmienne środowiskowe — `.env.example` z dokumentacją każdej zmiennej
- [ ] **5.9** Skrypt `setup.sh` — automatyczna inicjalizacja bazy Supabase (migracje, pgvector)
- [ ] **5.10** Dokumentacja self-hostingu na własnym serwerze / NAS (Unraid, TrueNAS, VPS)
- [ ] **5.11** GitHub Actions — CI pipeline (linting, testy)
- [ ] **5.12** Backup bazy danych — automatyczny eksport Supabase do pliku

---

## 💡 Dlaczego ten stos jest „killerem"?

| Technologia                         | Przewaga                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **PydanticAI + Gemini 3 Flash/Pro** | Ogromne okno kontekstowe + wymuszone typowanie danych eliminuje ~90% błędów znanych z LangChain                |
| **Next.js 16 + FastAPI**            | Czyste rozdzielenie frontu od logiki AI — interfejs można zamienić niezależnie (np. app mobilna w przyszłości) |
| **ChromaDB (Local)**                | Pełna prywatność danych i brak kosztów chmurowych (zastąpiło Supabase Vector w fazie dev)                      |

---

## 📊 Postęp ogólny

```
Faza 1  [██████████░░]   5 / 11
Faza 2  [████████░░░░]   5 / 11
Faza 3  [░░░░░░░░░░░░]   0 / 12
Faza 4  [████████░░░░]   6 / 11
Faza 5  [░░░░░░░░░░░░]   0 / 12

TOTAL   [█████░░░░░░░]   16 / 57 zadań
```

> Zaktualizuj pasek ręcznie lub automatycznie skryptem `scripts/update_progress.py` (Faza 5+)

---

_Aether Roadmap — MIT © Krzysztof Pika_
