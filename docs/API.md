# API Reference

Backend Aether Agenta oparty jest na frameworku FastAPI i udostępnia zestaw endpointów RESTful do komunikacji z Dashboardem, zarządzania dokumentami oraz obsługi agenta.

## System Core

### `GET /ping`
Sprawdza status serwera Backend.
- **Odpowiedź:** `{"status": "success", "message": "pong", "version": "1.0.0"}`

### `GET /stats`
Zwraca statystyki systemowe: liczbę dokumentów, wspomnień, sesji i wskaźnik niezawodności (Reliability).

### `GET /config` | `POST /config`
Zarządzanie konfiguracją systemową (Klucze API, URL do bazy Qdrant, wybór modelu).

## Agent & Chat

### `POST /chat`
Główny punkt wejścia do komunikacji z agentem. Obsługuje strumieniowanie myśli i odpowiedzi.

### `GET /sessions` | `GET /sessions/{session_id}`
Zarządzanie historią sesji czatu.

### `POST /approve_action`
Punkt wejścia dla systemu Human-in-the-Loop. Służy do potwierdzania akcji krytycznych przez użytkownika.

## Knowledge Base

### `GET /knowledge`
Lista wszystkich dokumentów zaindeksowanych w systemie oraz tych oczekujących na dysku.

### `POST /ingest`
Przesyłanie nowych plików (PDF, TXT, MD) do folderu źródłowego.

### `POST /knowledge/index/{filename}`
Ręczne wyzwalanie procesu indeksowania (embedding) pliku znajdującego się na dysku.

### `DELETE /knowledge/{filename}`
Usuwanie dokumentu z bazy wektorowej oraz z dysku.

## Memory Manager

### `GET /memories`
Lista semantycznych wspomnień wygenerowanych przez agenta.

### `DELETE /memories/{memory_id}`
Usuwanie konkretnego wspomnienia.

## Documentation System

### `GET /system/docs`
Pobiera listę plików `.md` z folderu dokumentacji projektu.

### `GET /system/docs/content/{filename}`
Pobiera surową treść dokumentu markdown do wyświetlenia w UI.

---
*Aether API Documentation — Generowane automatycznie przez system.*
