---
description: rozbudowa terminala o slash commands i funkcje Command Center
---

1. Analiza pliku `frontend/src/app/dashboard/page.tsx` w celu znalezienia funkcji `handleSend` oraz stanu `messages`.
2. Implementacja parsera komend (interceptora), który sprawdza czy `input` zaczyna się od `/`.
3. Dodanie obsługi komendy `/clear`, która resetuje stan `messages` w dashboardzie.
4. Dodanie obsługi komendy `/logs`, która wykonuje `fetch` do `http://localhost:8000/logs` i wyświetla wynik bezpośrednio w oknie terminala.
// turbo
5. Weryfikacja zmian poprzez wywołanie testowe `/clear` i `/logs` w dashboardzie (symulacja lub instruowanie użytkownika).
6. Aktualizacja logów systemowych w `aether.db` o pomyślnym wdrożeniu nowych modułów terminala.
