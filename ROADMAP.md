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

- [ ] **1.1** Inicjalizacja projektu — struktura katalogów, `pyproject.toml`, `venv`
- [ ] **1.2** Konfiguracja **FastAPI** — aplikacja startowa, health-check endpoint `/ping`
- [ ] **1.3** Integracja **PydanticAI** — pierwsza pętla agenta (input → reasoning → output)
- [ ] **1.4** Podpięcie **Gemini 1.5 Pro** jako głównego modelu logicznego
- [ ] **1.5** Podpięcie **Ollama / Llama 3** jako lokalnego fallbacku dla prywatnych danych
- [ ] **1.6** Mechanizm przełączania modeli (env flag lub runtime switch)
- [ ] **1.7** Pierwsza **PydanticAI Tool** — `get_current_time()`
- [ ] **1.8** Tool — `get_weather(location)` z zewnętrznym API
- [ ] **1.9** Tool — `web_search(query)` przez **Tavily** lub **DuckDuckGo**
- [ ] **1.10** Definicja **Structured Outputs** — rygorystyczne schematy Pydantic dla każdego rodzaju odpowiedzi agenta
- [ ] **1.11** Testy jednostkowe dla narzędzi i schematów

---

## 🗄️ Faza 2 — Pamięć i Kontekst _(Supabase)_

Cel: agent, który pamięta przeszłe rozmowy i potrafi uczyć się z dokumentów.

- [ ] **2.1** Uruchomienie projektu **Supabase** z rozszerzeniem `pgvector`
- [ ] **2.2** Schemat bazy danych — tabele: `conversations`, `memories`, `documents`, `chunks`
- [ ] **2.3** Klient Supabase w Pythonie — serwis `DatabaseService`
- [ ] **2.4** **Memory Management** — zapis każdej rozmowy do bazy po zakończeniu sesji
- [ ] **2.5** Wyszukiwanie wektorowe — agent przeszukuje bazę przed każdą odpowiedzią (`similarity_search`)
- [ ] **2.6** Budowanie kontekstu — wstrzykiwanie znalezionych wspomnień do promptu systemowego
- [ ] **2.7** Pipeline **Document Ingestion** — wgrywanie plików PDF i Markdown
- [ ] **2.8** **Chunking** dokumentów (np. `langchain.text_splitter` lub własny)
- [ ] **2.9** Generowanie i zapis embeddingów dla chunków do Supabase Vector
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
- [ ] **3.8** Adapter **Telegram Bot** — odbieranie wiadomości od użytkownika
- [ ] **3.9** Telegram — wysyłanie odpowiedzi i proaktywnych powiadomień
- [ ] **3.10** Obsługa przycisków / inline keyboard w Telegramie
- [ ] **3.11** _(Opcjonalne)_ Adapter **Discord** — bot na własnym serwerze
- [ ] **3.12** _(Opcjonalne)_ Adapter **WhatsApp** przez Twilio / WhatsApp Business API

---

## 🖥️ Faza 4 — Interfejs i Monitoring _(Frontend)_

Cel: Command Center do zarządzania agentem, wiedzą i obserwacji jego „myślenia" w czasie rzeczywistym.

- [ ] **4.1** Inicjalizacja projektu **Next.js 16** (App Router) + Tailwind CSS + shadcn/ui
- [ ] **4.2** Klient API — połączenie dashboardu z backendem FastAPI
- [ ] **4.3** Strona **Chat** — interfejs rozmowy z agentem w przeglądarce
- [ ] **4.4** Strona **Settings** — edycja system promptu i „osobowości" agenta
- [ ] **4.5** Strona **Knowledge Base** — lista wgranych dokumentów + możliwość usunięcia
- [ ] **4.6** Upload dokumentów z poziomu dashboardu (drag & drop)
- [ ] **4.7** Strona **Agent Logs** — podgląd wywołanych narzędzi i procesu wnioskowania
- [ ] **4.8** **Agentic Visualization** — wyświetlanie kroków myślenia (tool calls, reasoning steps)
- [ ] **4.9** Integracja **Supabase Realtime** — logi odświeżane na żywo bez odświeżania strony
- [ ] **4.10** Strona **Costs Monitor** — śledzenie zużycia tokenów i szacowanych kosztów API
- [ ] **4.11** Responsywność — podstawowy widok mobile dla zarządzania z telefonu

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

| Technologia                     | Przewaga                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **PydanticAI + Gemini 1.5 Pro** | Ogromne okno kontekstowe + wymuszone typowanie danych eliminuje ~90% błędów znanych z LangChain                |
| **Next.js 16 + FastAPI**        | Czyste rozdzielenie frontu od logiki AI — interfejs można zamienić niezależnie (np. app mobilna w przyszłości) |
| **Supabase**                    | Zastępuje 4 osobne usługi: baza danych, wektory, auth, storage — dramatycznie przyspiesza development          |

---

## 📊 Postęp ogólny

```
Faza 1  [░░░░░░░░░░░░░░░░░░░░]   0 / 11
Faza 2  [░░░░░░░░░░░░░░░░░░░░]   0 / 11
Faza 3  [░░░░░░░░░░░░░░░░░░░░]   0 / 12
Faza 4  [░░░░░░░░░░░░░░░░░░░░]   0 / 11
Faza 5  [░░░░░░░░░░░░░░░░░░░░]   0 / 12

TOTAL   [░░░░░░░░░░░░░░░░░░░░]   0 / 57 zadań
```

> Zaktualizuj pasek ręcznie lub automatycznie skryptem `scripts/update_progress.py` (Faza 5+)

---

_Aether Roadmap — MIT © Krzysztof Pika_
