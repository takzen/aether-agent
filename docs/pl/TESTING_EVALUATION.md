# Przewodnik Testow Ewaluacyjnych

Ten dokument opisuje, jak uruchamiac i interpretowac testy ewaluacyjne backendu w katalogu `backend/evaluation`.

Zakres tego dokumentu dotyczy tylko `backend/evaluation` (audit jakosci odpowiedzi LLM).
Testy aplikacyjne (unit/integration backendu) pozostaja w `backend/tests`.

## Cel

Testy ewaluacyjne sprawdzaja jakosc odpowiedzi (styl RAG) przy uzyciu dwoch niezaleznych sedziow:

1. `DeepEval + Gemini` do oceny zgodnosci semantycznej (`faithfulness`) i trafnosci odpowiedzi (`relevancy`).
2. `Vectara HHEM` do oceny spojnosci i ryzyka halucynacji.

To sa testy **audit/integration**, a nie testy jednostkowe. Moga wymagac sieci, kluczy API i pobierania modeli.

## Mapa plikow

- `backend/evaluation/test_deepeval_rag.py`
  - metryki `FaithfulnessMetric` i `AnswerRelevancyMetric`
  - sedzia: Gemini przez `google-genai`
- `backend/evaluation/test_vectara_hhem.py`
  - metryka spojnosci Vectara HHEM
  - model: `vectara/hallucination_evaluation_model`
- `backend/evaluation/test_dataset_schema.py`
  - walidacja schemy datasetu (id, pola wymagane, typy, progi 0..1)
- `backend/evaluation/dataset.py`
  - loader przypadkow z plikow `.json` i `.jsonl`
  - filtr przypadkow "ready" (bez `TODO`, z niepustym `gold_contexts`)
- `backend/evaluation/judges.py`
  - pomocnicze klasy/fabryki sedziow
  - cache instancji modelu Vectara na czas runa
- `backend/evaluation/conftest.py`
  - opcje CLI (`--run-audit`, `--audit-report-json`)
  - markery i domyslne `skip`
  - generowanie raportu JSON
- `backend/evaluation/example_rag_case.json` oraz `backend/evaluation/biology_mykology_backlog_30.jsonl`
  - dataset przypadkow RAG do audytu
  - rekordy z `expected_answer = "TODO"` lub pustym `gold_contexts` sa pomijane
- `backend/evaluation/behavioral_scenarios_25.jsonl`
  - backlog scenariuszy do oceny behawioralnej (manualnej lub pod automatyzacje)
- `backend/evaluation/behavioral_review_template_25.jsonl`
  - szablon wynikow review dla scenariuszy (`status`, `result`, `notes`, `evidence`)
- `backend/evaluation/run_audit.bat`
  - jednokomendowe uruchomienie audytu na Windows

## Markery i model uruchamiania

Testy maja markery:

- `audit`
- `integration`
- `slow`

Domyslne zachowanie:

- `pytest -q evaluation` -> testy sa wykryte, ale pomijane (`skipped`)
- aby je faktycznie uruchomic, trzeba podac `--run-audit`

## Wymagania

Zainstaluj zaleznosci backendu z `backend/pyproject.toml`.

W praktyce potrzebne sa:

- `pytest`
- `deepeval` (test DeepEval)
- `google-genai` (test DeepEval/Gemini)
- `torch` i `transformers` (test Vectara)

## Zmienne srodowiskowe

- `GOOGLE_API_KEY` jest wymagany dla testu DeepEval/Gemini
- opcjonalnie `DEEPEVAL_GEMINI_MODEL` aby nadpisac model (domyslnie `gemini-2.5-flash-lite`)
- jezeli brak klucza, test DeepEval zostanie poprawnie oznaczony jako `skipped`

Przyklad (PowerShell):

```powershell
$env:GOOGLE_API_KEY = "twoj_klucz_api"
$env:DEEPEVAL_GEMINI_MODEL = "gemini-2.5-flash-lite"
```

## Komendy uruchomienia

Uruchamiaj z katalogu repo:

```powershell
cd backend
```

Szybkie sprawdzenie (bez uruchamiania audytu):

```powershell
pytest -q evaluation
```

Walidacja datasetu (bez API i bez modeli zewnetrznych):

```powershell
pytest -q evaluation/test_dataset_schema.py
```

Pelny audyt:

```powershell
pytest -q evaluation --run-audit
```

Pelny audyt + zapis raportu JSON:

```powershell
pytest -q evaluation --run-audit --audit-report-json evaluation/audit-report.json
```

Tylko Vectara:

```powershell
pytest -q evaluation/test_vectara_hhem.py --run-audit --audit-report-json evaluation/audit-report.json
```

Tylko DeepEval:

```powershell
pytest -q evaluation/test_deepeval_rag.py --run-audit --audit-report-json evaluation/audit-report.json
```

Jedna komenda na Windows:

```powershell
.\evaluation\run_audit.bat
```

Wlasna sciezka raportu:

```powershell
.\evaluation\run_audit.bat evaluation\audit-report.json
```

## Jak dziala raport JSON

Opcja `--audit-report-json <sciezka>` zapisuje raport zawierajacy:

- metadane runa (`generated_at_utc`, `exitstatus`, `run_audit`)
- podsumowanie (`total`, `passed`, `failed`, `skipped`)
- przypadki testowe (`nodeid`, `outcome`, opcjonalnie `reason`)
- metadane przypadku (`metadata`), np. `deepeval_model`
- metryki (`name`, `score`, `threshold`, `passed`, `reason`) jesli test je dostarcza

Przykladowy plik:

- `backend/evaluation/audit-report.json`

## Logika pass/fail

`test_deepeval_rag.py`:

- metryki:
  - `faithfulness`
  - `answer_relevancy`
- progi sa czytane per-case z `generation_thresholds`
- fallback: `0.7` jesli brak klucza w rekordzie
- test nie przechodzi, gdy ktorykolwiek wynik spadnie ponizej progu

`test_vectara_hhem.py`:

- metryka: `consistency_score`
- prog jest czytany per-case z `generation_thresholds.hhem_consistency`
- fallback: `0.8` jesli brak klucza w rekordzie
- test nie przechodzi, gdy wynik spadnie ponizej progu

Uwaga:

- przypadki datasetu z `expected_answer = "TODO"` lub pustym `gold_contexts` sa pomijane przez testy auditowe

## Interpretacja wynikow

`skipped`:

- brak `--run-audit`, albo
- brak zaleznosci (np. `deepeval`), albo
- brak `GOOGLE_API_KEY` dla DeepEval

`failed`:

- wynik metryki ponizej progu, albo
- blad runtime/uslugi/modelu

`passed`:

- wszystkie asercje i progi spelnione

## Rozwiazywanie problemow

`ModuleNotFoundError`:

- doinstaluj brakujace pakiety w srodowisku backendu

DeepEval jest `skipped` mimo `--run-audit`:

- sprawdz `GOOGLE_API_KEY`
- sprawdz instalacje `deepeval` i `google-genai`

Pierwszy run Vectara jest wolny:

- to normalne (pobranie i zaladowanie modelu)

Ostrzezenia pytest o `asyncio_*`:

- to sygnal niezgodnosci wersji pluginu/srodowiska
- testow ewaluacyjnych zwykle nie blokuje, ale warto wyrownac wersje `pytest` i `pytest-asyncio`

Ostrzezenie o `.pytest_cache`:

- nie blokuje audytu
- zwykle problem uprawnien filesystemu
