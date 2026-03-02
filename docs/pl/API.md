# Odniesienie do API

Backend Aether udostępnia API REST oparte na FastAPI.
Domyślny lokalny URL: `http://localhost:8000`.

## Stan systemu i System

### `GET /ping`
Sprawdzenie stanu.

### `GET /stats`
Zwraca statystyki pulpitu (dokumenty, wspomnienia, niezawodność, sesje).

### `GET /config`
Odczytuje konfigurację środowiska wykonawczego backendu.

### `POST /config`
Aktualizuje konfigurację środowiska wykonawczego backendu.

### `POST /system/clear`
Czyści główne dane systemowe (sesje, wykres, logi, stan indeksu pamięci, jeśli dotyczy).

## Poznanie

### `GET /cognition/settings`
Zwraca ustawienia poznania (`persona`, `autonomia`, `kreatywność`, flagi refleksji i rytmu okołodobowego).

### `POST /cognition/settings`
Aktualizuje ustawienia poznania.

## Czat i Agent

### `POST /chat/stream`
Główny punkt końcowy czatu strumieniowego (strumień NDJSON).
Używa bieżących ustawień poznania (`persona`, `autonomia`, `refleksja`, `circadian_lock`, `custom_directives`) i stosuje temperaturę modelu z `creativity`.
Opcjonalne pole żądania: `source` (`dashboard` lub `telegram`) używane dla polityki autonomii środowiska wykonawczego.

Typy zdarzeń strumienia odpowiedzi obejmują:
- `status`
- `tool_call`
- `token`
- `final`
- `error`

Ostateczny ładunek obejmuje:
- `response`
- `confidence`
- `reasoning`
- `new_messages`
- `pending_actions`
- `active_skills` (lista debugowania umiejętności dopasowanych do tego żądania)

### `POST /chat`
Punkt końcowy czatu bez strumieniowania.
Używa bieżących ustawień poznania (`persona`, `autonomia`, `refleksja`, `circadian_lock`, `custom_directives`) i stosuje temperaturę modelu z `creativity`.
Opcjonalne pole żądania: `source` (`dashboard` lub `telegram`) używane dla polityki autonomii środowiska wykonawczego.

### `POST /actions/approve`
Zatwierdza/odrzuca akcje HITL (dla chronionych zapisów plików).

## Sesje

### `GET /sessions`
Wyświetla listę sesji czatu.

### `POST /sessions`
Tworzy nową sesję.

### `GET /sessions/{session_id}/messages`
Zwraca wiadomości dla sesji.

### `DELETE /sessions/{session_id}`
Usuwa sesję.

## Logi

### `GET /logs`
Zwraca logi (obsługiwane `limit`, `from_id`).

### `DELETE /logs`
Czyści logi.

## Baza Wiedzy

### `GET /knowledge`
Wyświetla listę znanych plików źródłowych i statusu indeksu.

### `POST /ingest`
Przesyła plik źródłowy do magazynu wiedzy.

### `POST /knowledge/index/{filename}`
Indeksuje istniejący plik źródłowy.

### `POST /knowledge/vision-index/{filename}`
Uruchamia multimodalne indeksowanie wizyjne dla pliku PDF:
- renderuje strony PDF do obrazów
- analizuje strony wybranym modelem wizyjnym (domyślnie: `gemini:gemini-2.5-flash`)
- przechowuje wydobytą wiedzę ze stron w indeksie wektorowym jako warstwę `vision`
- po pomyślnym uruchomieniu, metadane wiedzy zawierają:
  - `vision_indexed: true`
  - `vision_model: <użyty model>`
- powtórzenie tego punktu końcowego aktualizuje/odświeża warstwę wizyjną (`Re-indeks Vision`)

Parametry zapytania:
- `max_pages` (opcjonalnie, domyślnie `4`)
- `model` (opcjonalnie, `ollama:*` lub `gemini:*`, np. `gemini:gemini-2.5-flash`)

### `GET /knowledge/content/{filename}`
Odczytuje surową zawartość pliku źródłowego.

### `DELETE /knowledge/{filename}`
Usuwa źródło z dysku/indeksu.

## Dokumentacja Projektu

### `GET /system/docs`
Wyświetla listę dokumentów markdown w `/docs`.

### `GET /system/docs/content/{filename}`
Zwraca zawartość pliku markdown.

## Przeglądarka Obszaru Roboczego

### `GET /workspace/files`
Wyświetla pliki rekurencyjnie z `/workspace`.

### `POST /workspace/upload`
Przesyła plik bezpośrednio do `/workspace`.

### `GET /workspace/content?path=<relative_path>`
Zwraca surową zawartość tekstową pliku w `/workspace`.
Ścieżka musi być względna do `/workspace`.

### `DELETE /workspace/content?path=<relative_path>`
Usuwa plik w `/workspace`.

## Wspomnienia i Wykres

### `GET /memories`
Wyświetla listę rekordów pamięci.

### `DELETE /memories/{memory_id}`
Usuwa rekord pamięci.

### `GET /graph`
Zwraca węzły i linki wykresu koncepcyjnego.

### `POST /system/simulate`
Uruchamia aktywną symulację modelu świata.

### `POST /system/sleep-cycle`
Uruchamia proces cyklu snu.

## Harmonogram Cron

### `GET /cron/tasks`
Wyświetla dostępne handlery zadań cron.
Obejmuje wbudowany `tweet_update` i (przy pierwszym uruchomieniu) automatycznie utworzone zadania:
- `Aether Tweet Update 07:00` (`0 7 * * *`, `Europe/Warsaw`)
- `Aether Tweet Update 19:00` (`0 19 * * *`, `Europe/Warsaw`)
Obsługuje również ładunek `skill_task`:
- `skill_id` (wymagane): id z `GET /skills`
- `instruction` (opcjonalnie): instrukcja wykonawcza
- `store_as_tweet` (opcjonalnie, bool): zapisz wynik w szkicach tweetów

### `GET /cron/jobs`
Wyświetla listę zaplanowanych zadań.

### `POST /cron/jobs`
Tworzy/aktualizuje zadanie cron.

### `POST /cron/jobs/{job_id}/toggle`
Włącza/wyłącza zadanie cron.

### `POST /cron/jobs/{job_id}/run`
Uruchamia zadanie cron natychmiast.

### `DELETE /cron/jobs/{job_id}`
Usuwa zadanie cron.

## Aktualizacje Społecznościowe

### `GET /social/tweet-drafts`
Zwraca najnowsze wygenerowane szkice tweetów.

Parametry zapytania:
- `limit` (opcjonalnie, domyślnie `10`, maks. `50`)

## Umiejętności Agenta

### `GET /skills`
Wyświetla listę przechowywanych umiejętności.
Obejmuje `markdown_path` dla każdego pliku umiejętności w `workspace/skills/library`.

### `GET /skills/templates`
Wyświetla listę szablonów umiejętności z `workspace/skills/templates`.

### `POST /skills/templates/apply`
Ładuje jeden szablon i zwraca sparsowane pola dla formularza umiejętności:
- `name`
- `purpose`
- `triggers`
- `instructions`

### `GET /skills/{skill_id}/markdown`
Zwraca zawartość markdown i ścieżkę dla jednego pliku umiejętności.

### `POST /skills`
Tworzy umiejętność.

Body:
```json
{
  "name": "Short answer mode",
  "purpose": "Keep responses concise",
  "triggers": "brief,short,quick",
  "instructions": "Respond in under 5 lines unless user asks for details."
}
```

### `PUT /skills/{skill_id}`
Aktualizuje umiejętność (`name`, `purpose`, `triggers`, `instructions`).

### `POST /skills/{skill_id}/runtime`
Aktualizuje, gdzie umiejętność może być uruchamiana:
- `agent_enabled` (bool): zezwól na umiejętność w zwykłych czatach agenta
- `cron_enabled` (bool): zezwól na umiejętność w zadaniu `skill_task` crona

### `DELETE /skills/{skill_id}`
Usuwa umiejętność.