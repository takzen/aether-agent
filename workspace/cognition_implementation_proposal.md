# Propozycja Wdrożenia Systemu Nadzoru nad Kognicją (Cognition Control)

## Cel
Ożywienie interfejsu użytkownika w `/frontend/src/app/cognition/page.tsx`, aby przestał być statycznym mockupem i został zintegrowany z rdzeniem decyzyjnym Aether (`backend/agent.py` i bazą konfiguracji).

## Opis Rozwiązania
Obecnie panel Cognition wizualizuje kluczowe parametry metapoznawcze: **Autonomię**, **Personę (Temperament)**, **Kreatywność (Logical Drift)** oraz przełączniki **Self-Reflection** i **Circadian Lock**. 
Zadanie polega na spięciu tych przełączników z rzeczywistymi dyrektywami promptu systemowego oraz mechanizmami uruchamiania narzędzi (np. pomijanie `ActionApproval` w trybie `FULL_AUTONOMY`).

## Proponowane Etapy Wdrożenia

### Etap 1: Rozszerzenie Konfiguracji (Backend)
Należy zmodyfikować schemat konfiguracji i przechowywania ustawień kognitywnych w `backend/config.py` i `.env` lub w bazie SQLite (tabela np. `settings`).

**Nowe klucze do dodania:**
* `COGNITION_PERSONA` (Opcje: "Analytical", "Balanced", "Creative")
* `COGNITION_AUTONOMY` (Integer: 1, 2, 3)
* `COGNITION_CREATIVITY` (Integer: 0-100, tłumaczone na `temperature` dla LLM od 0.0 do 1.0)
* `COGNITION_REFLECTION` (Boolean, do włączania/wyłączania AWM i cyklu snu)
* `COGNITION_CIRCADIAN_LOCK` (Boolean, blokada dynamicznego trybu dnia/nocy)

### Etap 2: Stworzenie Endpointów API w `main.py`
Potrzebujemy dwóch nowych endpointów do komunikacji z UI:
1. `GET /cognition/settings`: Zwracający aktualny stan zmiennych konfiguracyjnych.
2. `POST /cognition/settings`: Pozwalający przyciskowi `Commit_Neural_Config` w UI nadpisać konfigurację.

### Etap 3: Modyfikacja Agenta PydanticAI (`backend/agent.py`)
Parametry kognitywne muszą realnie wpływać na zachowanie agenta. Wymaga to dynamicznego budowania `system_prompt` na podstawie ustawień:

1. **Logical Drift (Temperature)**: Ustawianie parametru `temperature` w zależności od konfiguracji modelu (np. zmapowanie 60% w UI na 0.6 temp).
2. **Persona Injection**: Dodanie fragmentów tekstu do promptu systemowego:
   * **Analytical**: "Bądź maksymalnie zwięzły. Skup się wyłącznie na logice. Brak wyjaśnień nietechnicznych."
   * **Creative**: "Szukaj nieoczywistych powiązań. Twórz analogie i otwieraj hipotezy."
3. **Autonomy Engine**:
   * Jeśli Autonomy == 3 (FULL_AUTONOMY), pomijaj krok dodawania akcji typu `write_file` do słownika `pending_actions` (w `agent.py`) i bezpośrednio zapisuj pliki bez generowania zgłoszenia dla okna dialogowego `ActionApproval`.
   * Jeśli Autonomy == 1 (MANUAL_OVERRIDE), wymagaj zatwierdzania nawet dla bezpiecznych odczytów.

### Etap 4: Integracja Frontendu
W pliku `page.tsx` w komponencie `CognitionPage`:
1. Zastąpić wartości domyślne w `useState` użyciem hooka np. `useEffect`, który przy montowaniu wczyta stan z backendu po zapytaniu `GET`.
2. Dodać funkcję wysyłającą stan po kliknięciu "Commit_Neural_Config" (zapytanie `POST`).
3. Po prawidłowym zapisie, dodać w interfejsie drobną notyfikację np. Toast, że konfiguracja układu nerwowego przebiegła pomyślnie.

---
*Dokument wygenerowany przez Aether Core - Meta-Cognitive Directive: HYPOTHESIS & DOCS.*