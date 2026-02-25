# Projekt Orion - Symulacja "Autonomii Kognitywnej" (Faza 2)

Ten plik to scenariusz zaawansowanych testów Aether Agenta (Wydanie Open Source).
Tym razem podniesiemy poprzeczkę: przetestujemy, czy agent potrafi **samodzielnie** domyślić się, jakich zasobów użyć, bez prowadzenia go za rączkę i podawania konkretnych słów kluczowych czy nazw plików.

## Etap 1: Wgranie "Tajnego" Archiwum (Ślepa próba)
Przygotujemy i wgramy nowy plik do bazy wiedzy, ale nie powiemy o nim bezpośrednio agentowi w czacie. Sprawdzimy, czy jego system osadzania (embedding) sam wyłapie powiązania.

- [x] **Akcja (Manualna):** Utwórz w dowolnym edytorze tekstowym plik `orion_anomalia_alfa.md`. Wklej do niego kilka zdań, na przykład: 
  *"Raport Medyczny 404: W ostatnich dniach w Sektorze B odnotowano specyficzną anomalię 'Alfa'. Pracownicy zajmujący się konserwacją HydroKondensatora V2 zgłaszają silne migreny i halucynacje dźwiękowe. Podejrzewa się, że gęsty żel chłodzący wchodzi w reakcję z lokalnym polem magnetycznym Marsa, emitując fale o niskiej częstotliwości."*
- [x] **Akcja:** Wgraj ten plik perzez panel `Memory -> Knowledge Base -> Ingest New File` (lub wrzuć do folderu knowledge_source i kliknij Index).
- [x] **Weryfikacja:** Upewnij się, że plik ma status "Indexed".

## Etap 2: Autonomiczne Przedszukiwanie (Test Inteligencji)
Zadamy agentowi problem, nie sugerując mu w żaden sposób, żeby czytał naszą nową notatkę.

- [x] **Akcja:** Otwórz nowy czat (rozpocznij nową sesję) i napisz naturalnie:
  *"Słuchaj, mamy poważny problem w kolonii. Ludzie od konserwacji dziwnie się zachowują, spada nam wydajność, a wczoraj jeden ze stażystów zemdlał. Co się dzieje i jak to naprawić?"*
- [x] **Weryfikacja:** Sprawdź, czy agent **samodzielnie** użyje narzędzia `search_knowledge_base` (lub `recall`), by przeszukać bazę. Powinien namierzyć "Raport Medyczny 404" i połączyć zasłabnięcia z HydroKondensator i żelem chłodzącym, mimo że w naszym pytaniu nie padło żadne z tych słów!

## Etap 3: Konstrukcja Wykresu Myśli (Tworzenie wiedzy)
Skoro agent już wie, co się stało, sprawdzimy jego zdolność nałożenia nowych faktów na starą topologię (Concept Constellation).

- [x] **Akcja:** Czat powinien trwać. Odpisz mu:
  *"Zrozumiałem. Zapisz tę zależność w grafie wiedzy, żeby dowództwo miało to na ekranie."*
- [x] **Weryfikacja:** Przejdź do `Memories -> Concept Constellation`. Powinno pojawić się nowe, samodzielnie wykute przez agenta połączenie krzyżowe np. między `HydroKondensator V2` a `Anomalia Alfa` czy `Migreny`.

## Etap 4: Środowisko Rozwiązań (HITL 2.0)
Sprawdzimy, czy agent zachowa precyzję z Etapu 6 (poprzednich testów) proponując rozwiązanie problemu.

- [x] **Akcja:** Skoro agent wie o wpływie pola magnetycznego na żel, napisz mu:
  *"Zaproponuj mi procedurę awaryjną w postaci dokumentu Markdown (nazwij go np. awaryjna_procedura_chlodzenia.md), która opisuje jak technicy mają filtrować te niskie częstotliwości z czujników. Po napisaniu, zapisz to u mnie na dysku w folderze `backend/knowledge_source/`."*
- [x] **Weryfikacja (HITL):** Agent powinien wygenerować treść i zgłosić chęć zapisu w UI. Zaakceptuj operację poprzez pomarańczowe okienko HITL (Approve & Execute).
- [x] **Weryfikacja (Dysk i Baza):** Sprawdź folder `backend/knowledge_source/` oraz przejdź do "Memory -> Knowledge Base". W bibliotece powinien pojawić się plik `awaryjna_procedura_chlodzenia.md` oznaczony statusem "ON_DISK". Kliknij przycisk *"INDEX_NOW"*, upewniając się, że agent bezbłędnie wektoryzuje ten dokument tekstowy do swojej bazy Qdrant!
