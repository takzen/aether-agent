# Przewodnik Terminala (Slash Commands)

Terminal w Dashboardzie Aethera to nie tylko czat – to potężne narzędzie diagnostyczne i operacyjne. Poniżej znajduje się lista dostępnych poleceń.

## Dostępne Komendy

### `/logs [limit]`
Wyświetla ostatnie wpisy z systemowego dziennika zdarzeń (System Logs).
- **Przykład:** `/logs 20`
- **Zastosowanie:** Diagnostyka błędów, podgląd ostatnich akcji Agenta.

### `/clear`
Czyści całą historię widoczną w oknie terminala.
- **Zastosowanie:** Uporządkowanie przestrzeni roboczej przed nowym zadaniem.

### `/simulate`
Uruchamia **Active World Model (AWM)**. Agent analizuje logi z ostatnich 30 minut i generuje proaktywne wnioski o kierunku prac.
- **Status:** Wymaga min. 5 logów do poprawnego działania.
- **Wynik:** Insight (wniosek) + Suggested Action (rekomendacja).

### `/release`
Inicjuje proces wydania nowej wersji (Release Workflow).
- **Działanie:** Podbija wersję w plikach, tworzy tag gita i aktualizuje CHANGELOG.

## 💡 Funkcje Autouzupełniania
- Wpisz `/`, aby wywołać listę sugestii.
- Użyj strzałek **Góra/Dół**, aby nawigować po liście.
- Naciśnij **Enter**, aby wybrać komendę.
- Naciśnij **Esc**, aby zamknąć listę.

---
*Uwaga: Komendy są interpretowane lokalnie przez Interceptor w Dashboardzie.*
