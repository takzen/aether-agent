# Funkcje Premium

Aether Agent nie jest zwykłym chatbotem. Został wyposażony w zaawansowane mechanizmy poznawcze i behawioralne, które pozwalają mu na proaktywne działanie i głęboką analizę kontekstu.

## Active World Model (AWM)

Active World Model to silnik proaktywności Aethera. Zamiast czekać na polecenia, agent stale analizuje strumień zdarzeń systemowych, logi oraz historię interakcji, aby budować wewnętrzną reprezentację stanu projektu.

-   **Analiza Logów:** Silnik co 30 minut (lub na żądanie komendą `/simulate`) przegląda ostatnie działania.
-   **Generowanie Wniosków:** Na podstawie analizy agent tworzy tzw. "System Insights" – sugestie dotyczące optymalizacji kodu, potencjalnych błędów lub kolejnych kroków w roadmapie.
-   **Proaktywność:** AWM pozwala agentowi wyjść z roli pasywnego asystenta i stać się partnerem w procesie deweloperskim.

## Sleep Cycle

Sleep Cycle (Cykl Snu) to proces optymalizacji wiedzy, który uruchamia się w okresach bezczynności lub po zakończeniu długich sesji roboczych.

-   **Konsolidacja Wspomnień:** Podczas "snu" agent przegląda krótkotrwałe wspomnienia (logi sesji) i destyluje z nich kluczowe informacje, które przenosi do pamięci długotrwałej (Vector Store).
-   **Defragmentacja Bazy Wiedzy:** System porządkuje powiązania między dokumentami i usuwa zdezaktualizowane dane.
-   **Oszczędność Zasobów:** Dzięki temu procesowi agent nie musi przeszukiwać tysięcy linii logów, aby przypomnieć sobie ustalenia z poprzedniego dnia.

## Concept Constellation

Concept Constellation to warstwa wizualnej i semantycznej topologii wiedzy. To grafowe ujęcie wszystkiego, co agent wie o Twoim projekcie.

-   **Semantyczne Powiązania:** Każdy dokument, wspomnienie czy fragment kodu jest punktem (węzłem) w konstelacji.
-   **Dynamiczne Relacje:** Relacje między pojęciami są budowane automatycznie na podstawie podobieństwa semantycznego (OpenAI Embeddings / FastEmbed).
-   **Neural Topology:** Użytkownik może przeglądać tę mapę w dedykowanym widoku "Topology", co pozwala zrozumieć, jak agent łączy ze sobą różne fakty i moduły systemu.

---
*Dokumentacja funkcji Premium Projektu Aether.*
