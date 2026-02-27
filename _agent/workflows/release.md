---
description: proces wydania nowej wersji aplikacji (wersjonowanie i tagowanie)
---

1. Ustalenie nowej wersji aplikacji (np. v1.1.1).
2. Aktualizacja wersji i daty w plikach systemowych:
   - `frontend/src/components/Sidebar.tsx` (szukaj "AETHER v")
   - `README.md`, `CHANGELOG.md` oraz `docs/README.md`
   - `backend/pyproject.toml` (pole version)
   - `frontend/package.json` (pole version)
   - `desktop/package.json` (pole version)
3. Wykonanie commitu ze zmianami wersji:
   ```bash
   git add . && git commit -m "chore: bump version to v[WERSJA]"
   ```
// turbo
4. Stworzenie tagu gita:
   ```bash
   git tag -a v[WERSJA] -m "Release v[WERSJA]"
   ```
5. Wyślij komunikat do Aethera o nowym wydaniu w `aether.db`.
6. Poinformuj użytkownika o zakończeniu procesu wydawniczego.
