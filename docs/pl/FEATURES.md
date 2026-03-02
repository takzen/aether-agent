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

## Neuromorphic Cognition (SNC)

Neuralny silnik kognitywny (Static/Dynamic Neural Cognition) pozwala na głęboką personalizację zachowania agenta i kontrolę jego decyzyjności.

-   **Profile Persony:** Możliwość wyboru między trybem Analitycznym, Zrównoważonym lub Kreatywnym. Każdy profil automatycznie kalibruje parametry kreatywności (Temperature) modelu.
-   **Digital Circadian Rhythm:** System cyklu dobowego, który płynnie zmienia osobowość agenta (Strateg rano, Wykonawca w dzień, Filozof wieczorem) w zależności od aktualnej godziny.
-   **Autonomy Engine:** Trzystopniowa skala zaufania (Manual, Co-Pilot, Full Autonomy), która określa uprawnienia agenta do samodzielnej modyfikacji plików systemowych.
-   **Custom Directives:** Możliwość ręcznego wstrzykiwania niskopoziomowych instrukcji stylu i zachowania, które są priorytetowo traktowane przez rdzeń modelu.

## System Umiejętności (Skills Management)

Aether Agent posiada modułową architekturę umiejętności, która pozwala na rozbudowę jego możliwości bez modyfikacji głównego kodu.

-   **Dynamiczne Ładowanie:** Umiejętności są ładowane do środowiska uruchomieniowego w locie (`inject_skill_prompt`).
-   **Wstrzykiwanie Kontekstu:** Kiedy umiejętność zostaje aktywowana, jej specyficzne instrukcje (formatowanie, narzędzia) i wyzwalacze (triggers) są bezpośrednio integrowane w system prompt agenta, dostosowując jego wektor działania.
-   **Zarządzanie:** Rejestr umiejętności może być na bieżąco przeglądany oraz włączany/wyłączany z poziomu panelu Dashboard w zakładce "Skills".

## System Harmonogramów (Cron Tasks)

Silnik czasu rzeczywistego wbudowany w backend z obsługą zadań w tle opartych na interfejsie Cron.

-   **Automatyzacja Zadań:** Pozwala na zaplanowanie cyklicznych operacji (takich jak optymalizacja bazy wektorowej, czyszczenie osieroconych logów czy manualne włączanie `Sleep Cycle`).
-   **Wyrażenia Cron:** Każde zadanie bazuje na ustandaryzowanych interwałach z użyciem wyrażeń Cron (np. `0 3 * * *` dla uruchomienia procesu o 3:00 w nocy).
-   **Widok Systemowy:** Skonsolidowany panel "Cron" pozwala monitorować statusy nadchodzących jak i zakończonych wywołań zadań (cron ticks) w czasie rzeczywistym.

---
*Dokumentacja funkcji Premium Projektu Aether.*
