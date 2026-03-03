# Inspiracje z Vexp (do wdrożenia w Aether dla Pisarzy)

**Źródło:** [vexp.dev](https://vexp.dev/docs#introduction)
**Data utworzenia:** 2026-03-03
**Domena projektu:** Cloud-based Agent do Syntezy Wiedzy i pracy z tekstem (dla pisarzy, badaczy).

Vexp to narzędzie stworzone stricte dla kodu analizujące jego składnię (AST), co *nie ma bezpośredniego przełożenia* na tekst naturalny. Jednakże koncepcje "oszczędności tokenów" i "pamięci sesyjnej" z Vexp możemy wspaniale przetłumaczyć na świat pisarzy i dokumentów:

## Odpowiedniki Vexp dla świata Syntezy Wiedzy

### 1. Semantic Skeletonization zamiast AST (Budowa Spisów Treści zamiast Szkieletów Klas)
* **Koncepcja Vexp:** Wrzuca do pamięci tylko nazwy funkcji, ignorując treść, żeby oszczędzić 70% miejsca.
* **Wersja dla Aether (Pisarze):** Jeśli użytkownik prosi o nawiązanie do innej powieści lub obszernego dokumentu badawczego (PDF / 100 stron), agent **nie zaczytuje** całego dokumentu. Posiada "Szkielet Semantyczny" zawartości – np. widzi tylko rozbicie na działy, nagłówki i 2-zdaniowe podsumowania rozdziałów wyciągnięte wcześniej w Qdrant. Zaciąga detale *tylko* tego nagłówka/paragrafu, o którym aktualnie dyskutujecie.

### 2. Pasywna detekcja zmian tekstu (Auto-Stale dla Notatek)
* **Koncepcja Vexp:** Agent oznacza stare notatki jako "przeterminowane" (stale), gdy ktoś zmieni skojarzony z nimi plik kodowy.
* **Wersja dla Aether (Pisarze):** Jeśli pisarz ręcznie przepisze spory fragment w module (np. `Rozdział_2.md`), system w tle widzi zmianę na podstawie hashowania (np. Blake3) i upewnia się, że wektory w Qdrant (pamięci krótko i długoterminowej) dla tego rozdziału dostają status "Przeterminowane". Zapobiega to sytuacji, gdy agent analizuje na podstawie niekatualnych wątków.

### 3. Progressive Nudge (Zapobieganie "halucynacyjnej pętli")
* **Koncepcja Vexp:** Jeśli agent tworzy coś w nieskończoność na boku, bo nie dowierza kodowi ("file thrashing"), blokuje go.
* **Wersja dla Aether (Pisarze):** W procesach kreatywnych i generacyjnych (np. Claude pisze wstęp 5 raz w kółko), dodanie "przerywacza". Jeśli LLM nie jest w stanie wygenerować satysfakcjonującego streszczenia po 3 poprawkach na podstawie wgranych plików (np. przez Telegram dokumentów) zostaje zablokowany uciekając przed over-thinkingiem, a user dostaje w dashboardzie prośbę o manualną interwencję.

---

Z technicznego punktu widzenia drzewa AST `tree-sitter` (duma Vexpa) nam się **nie przydadzą do niczego**, bo przetwarzamy języki naturalne i tekst, a nie składnię twardego programowania. Za to cała inżynieria RAG oparta o "podawanie streszczeń zamiast trzonu", jest wybitnie cenna.
