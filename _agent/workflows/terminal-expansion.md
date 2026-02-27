---
description: rozbudowa terminala o slash commands i funkcje Command Center
---

1. [x] Analiza pliku `frontend/src/app/dashboard/page.tsx` w celu znalezienia funkcji `handleSend` oraz stanu `messages`.
2. [x] Implementacja parsera komend (interceptora), który sprawdza czy `input` zaczyna się od `/`.
3. [x] Dodanie obsługi komendy `/clear`, która resetuje stan `messages` w dashboardzie.
4. [x] Dodanie obsługi komendy `/logs`, która wykonuje `fetch` do `http://localhost:8000/logs` i wyświetla wynik bezpośrednio w oknie terminala.
// turbo
5. [x] Weryfikacja zmian poprzez wywołanie testowe `/clear` i `/logs` w dashboardzie (symulacja lub instruowanie użytkownika).
6. [x] Aktualizacja logów systemowych w `aether.db` o pomyślnym wdrożeniu nowych modułów terminala.
