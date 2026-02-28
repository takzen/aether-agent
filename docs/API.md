# Referencja API

Backend Aether Agenta oparty jest na frameworku FastAPI i udostępnia zestaw endpointów RESTful do komunikacji z Dashboardem, zarządzania dokumentami oraz obsługi Agenta.

## Rdzeń Systemu (System Core)

### `GET /ping`
Sprawdza status serwera Backend.
- **Odpowiedź:** `{"status": "success", "message": "pong", "version": "1.3.0"}`

### `GET /stats`
Zwraca statystyki systemowe: liczbę dokumentów, wspomnień, sesji i wskaźnik niezawodności (Reliability).

### `GET /config` | `POST /config`
Zarządzanie konfiguracją systemową (Klucze API, URL do bazy Qdrant, wybór modelu).

## Telemetria i Logi (Telemetry & Logs)

### `GET /logs`
Pobiera najnowsze logi systemowe.
- **Parametry:** `limit` (domyślnie: 50), `from_id` (ID logu, od którego zacząć).
- **Zastosowanie:** Podgląd stanu pracy jądra systemu.

### `DELETE /logs`
Czyści wszystkie rekordy w tabeli `system_logs`.

## Agent i Czat (Agent & Chat)

### `POST /chat`
Główny punkt wejścia do komunikacji z Agentem. Obsługuje strumieniowanie myśli (Thought Stream) i odpowiedzi.

### `GET /sessions` | `GET /sessions/{session_id}`
Zarządzanie historią sesji czatu.

### `POST /approve_action`
Punkt wejścia dla systemu Human-in-the-Loop. Służy do potwierdzania akcji krytycznych przez użytkownika.

## Baza Wiedzy (Knowledge Base)

### `GET /knowledge`
Lista wszystkich dokumentów zaindeksowanych w systemie oraz tych oczekujących na dysku.

### `POST /ingest`
Przesyłanie nowych plików (PDF, TXT, MD) do folderu źródłowego.

### `POST /knowledge/index/{filename}`
Ręczne wyzwalanie procesu indeksowania (embedding) pliku znajdującego się na dysku.

### `DELETE /knowledge/{filename}`
Usuwanie dokumentu z bazy wektorowej oraz z dysku.

## Zarządzanie Pamięcią (Memory Manager)

### `GET /memories`
Lista semantycznych wspomnień wygenerowanych przez Agenta.

### `DELETE /memories/{memory_id}`
Usuwanie konkretnego wspomnienia.

## System Dokumentacji (Documentation System)

### `GET /system/docs`
Pobiera listę plików `.md` z folderu dokumentacji projektu.

### `GET /system/docs/content/{filename}`
Pobiera surową treść dokumentu markdown do wyświetlenia w UI.

---
*Dokumentacja API Aether — Generowana automatycznie przez system.*
