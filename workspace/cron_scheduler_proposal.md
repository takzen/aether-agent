# Propozycja Architektoniczna: Wdrożenie Task Schedulera (Cron) w Rdzeniu Aether

## Cel
Wzbogacenie rdzenia Aether o asynchroniczny, wbudowany mechanizm harmonogramowania zadań (np. oparty na `APScheduler` w Pythonie), który uruchamiałby się w cyklu życia aplikacji FastAPI (`lifespan` w `backend/main.py`).

## Uzasadnienie (Dlaczego jest to potrzebne?)

Obecnie system operuje w modelu ściśle **Event-Driven (Reaktywnym)**. Oznacza to, że procesy cykliczne, takie jak konsolidacja pamięci (`sleep_cycle`), optymalizacja wektorów w bazie Qdrant czy rutynowe czyszczenie logów systemowych (SQLite), muszą być wyzwalane ręcznie z poziomu interfejsu (np. poprzez uderzenie w endpoint `/system/sleep-cycle`) lub zewnętrznego wyzwalacza.

Wprowadzenie wbudowanego harmonogramu zadań (Cron) umożliwi systemowi przejście w tryb **Active World Model (Proaktywny)**. 

### Korzyści:
1. **Prawdziwa Autonomia ("Świadomość Czasu")**:
   - Automatyczne wyzwalanie `run_sleep_cycle()` np. o 3:00 w nocy czasu lokalnego.
   - Półautomatyczne generowanie raportu `Morning Brief` gotowego do odczytania rano przez operatora.
   - Samodzielne sprzątanie starych logów i nieużywanych sesji w bazie SQLite.

2. **Proaktywny Monitoring i Alerty**:
   - Możliwość cyklicznego sprawdzania dostępności usług (Qdrant, klucze API) i wysyłania powiadomień błędów np. przez zintegrowany `telegram_bridge`.
   - Wczesne wykrywanie anomalii w systemie bez konieczności odpytywania przez użytkownika.

3. **Asynchroniczne Zarządzanie Zadaniami (Background Jobs)**:
   - Zdolność do kolejkowania i procesowania długotrwałych zadań w tle (np. batch processing dokumentów do indeksacji lub głęboki scraping webowy), odciążając główny wątek odpowiedzi HTTP.

## Proponowana Implementacja

Najmniej inwazyjnym i niezależnym od zewnętrznych serwisów (jak Redis/Celery) rozwiązaniem dla obecnej architektury jest integracja biblioteki `apscheduler` bezpośrednio z cyklem życia aplikacji FastAPI.

**Szkic zmian w `backend/main.py`:**

```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sleep_cycle import run_sleep_cycle

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # [...] Dotychczasowa logika inicjalizacji (baza, logi, telegram)
    
    # Inicjalizacja harmonogramu
    scheduler.add_job(run_sleep_cycle, 'cron', hour=3, minute=0)
    scheduler.start()
    
    await sqlite_service.add_log("info", "CORE", "Cron Scheduler started.")
    
    yield
    
    # Zatrzymanie harmonogramu
    scheduler.shutdown()
    # [...] Dotychczasowa logika zamykania
```

## Konsekwencje do rozważenia
- **Koszty Tokenów**: Procesy działające w tle, które angażują wywołania LLM (np. PydanticAI w `run_sleep_cycle()`), będą zużywać jednostki API, nawet gdy użytkownik nie korzysta aktywnie z systemu. Należy wdrożyć limity (np. sprawdzanie przed wywołaniem LLM, czy pojawiły się faktycznie nowe logi od ostatniego punktu kontrolnego).
- **Złożoność**: Harmonogram wewnątrzaplikacyjny w FastAPI jest skuteczny przy jednym serwerze (single-worker), jednak przy skalowaniu w poziomie może prowadzić do powielania wywołań crona (np. 3 kontenery uruchomią `run_sleep_cycle` jednocześnie). W środowisku klastrowym wymagane by było blokowanie rozproszone na bazie (np. SQLite check/lock). 

*Dokument wygenerowany przez Aether Core - Meta-Cognitive Directive: HYPOTHESIS.*
