# Dziennik zmian

Wszystkie znaczące zmiany w Aether Agent są tutaj udokumentowane.

## [1.4.2] - 2026-03-02

### Dodano
- **Infrastruktura Oceny**: Dodano moduły silnika oceny, w tym testowanie oceny RAG i sędziów LLM.

## [1.4.1] - 2026-03-01

### Dodano
- **Inteligentny Responsywny Układ**: Duża aktualizacja Pulpitu, Paska bocznego i Wspomnień dla małych ekranów (Tabletów/Mini).
  - **Dynamiczny Pasek Boczny**: Automatycznie zwija się do minimalistycznego trybu tylko z ikonami (w-20) z idealnie wyśrodkowanymi ikonami na ekranach poniżej 1280px.
  - **Kompaktowe Statystyki Nagłówka**: Statystyki Pulpitu używają teraz wyświetlania tylko z ikonami w rozdzielczościach m, aby zapobiec przepełnieniu tekstu i uszkodzeniom układu.
  - **Optymalizacja Płótna Neuronowego**: Strona Wspomnienia ukrywa teraz paski wyszukiwania/filtrowania w widokach tabletowych, aby zmaksymalizować przestrzeń roboczą wykresu neuronowego.
- **Ulepszone Wyrównanie**: Idealnie wyrównane do prawej statystyki na Pulpicie i wyśrodkowane ikony w zwiniętym Pasku bocznym.

## [1.4.0] - 2026-03-01

### Dodano
- Nowa strona `Umiejętności` w sekcji `Cron` na pasku bocznym frontend'u (`/skills`).
- Trwałość umiejętności backendu z tabelą SQLite `agent_skills`.
- API Umiejętności:
  - `GET /skills`
  - `POST /skills`
  - `POST /skills/{skill_id}/toggle`
  - `DELETE /skills/{skill_id}`
- Integracja umiejętności w środowisku uruchomieniowym Agenta:
  - Włączone umiejętności są wstrzykiwane do promptu systemowego.
  - Obsługiwane jest dopasowywanie wyzwalaczy (pole `triggers`).
  - Obsługiwane są umiejętności globalne (pusta lista wyzwalaczy).
- Metadane debugowania czatu dla aktywnych umiejętności:
  - `active_skills` w końcowym ładunku czatu.
  - Odznaki aktywnych umiejętności wyświetlane w interfejsie użytkownika czatu.

### Zmieniono
- Harmonizacja UX frontend'u na różnych stronach (nagłówki, przyciski akcji, etykiety).
- Kontrolki strony Topologii przeniesione do nagłówka i ujednolicone z resztą interfejsu użytkownika.
- Ulepszono obsługę sygnatur czasowych czatu, aby zapobiec renderowaniu `Invalid Date`.

### Naprawiono
- Poprawiono stabilność parsowania Mermaid poprzez oczyszczanie zawartości diagramów i użycie bezpiecznych dla ASCII etykiet topologii.
- Wiele problemów z spójnością UTF-8/zawartości w tekście i etykietach frontend'u.

## [1.3.0] - 2026-02-28

### Dodano
- Centrum poznawcze (`/cognition`) do strojenia osobowości/autonomii.
- Ulepszone renderowanie Mermaid w kontekstach dokumentacji/czatu.
- Agregacja narzędzi w śladach czatu.

### Naprawiono
- Poprawki nawodnienia i spójności frontend'u.
- Czyszczenie ESLint/typów w wybranych modułach.

## [1.2.0] - 2026-02-27

### Dodano
- Trasa dokumentacji i renderowanie markdown.
- Ulepszenia UX bazy wiedzy i narzędzia logowania.

## [1.1.0] - 2026-02-27

### Dodano
- Aktywna symulacja modelu świata.
- Integracja pamięci wykresu koncepcji.
- Powłoka desktopowa Electron.