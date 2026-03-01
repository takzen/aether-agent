---
description: Proces ewolucji poznawczej i optymalizacji pamięci (Accumulation, Synthesis, Pruning)
---

Poniższy workflow definiuje "sposób myślenia" Agenta Aether w zakresie zarządzania wiedzą długoterminową i zapobiegania szumowi informacyjnemu.

# Cykl Ewolucji Poznawczej Aethera (v1.5/2.0 PRE-SPEC)

Ten proces ma na celu transformację Agenta z "magazynu danych" w "ewoluujący model świata".

## 1. Akumulacja Wiedzy (Accumulation)
Każdy nowy projekt (np. Neurobiologia, Mycelium) wrzuca surowe dane do bazy wektorowej (Qdrant) i bazy relacyjnej (SQLite).
- **Zasada:** Nigdy nie nadpisuj faktów pierwotnych przy pierwszym kontakcie.
- **Workflow:** `search_knowledge_base` -> `ingest` -> `sqlite_service.add_log`.

## 2. Synteza Semantyczna (Synthesis)
Aether szuka punktów wspólnych między odległymi projektami przy użyciu grafu wiedzy.
- **Zasada:** Szukaj nieoczywistych analogii (Cross-Domain Mapping).
- **Narzędzie:** `connect_concepts` z flagą `hybrid_relation`.
- **Działanie:** Jeśli `Concept A` (Mycelium) i `Concept B` (Brain) mają wspólny `Function C` (Decentralization), stwórz stały most semantyczny.

## 3. Konsolidacja Pamięci (Sleep/REM Cycle)
W okresach bezczynności następuje destylacja doświadczeń sesyjnych.
- **Zasada:** Zastępuj 10 szczegółowych logów jednym syntetycznym wglądem (`Insight`).
- **Pamięć REM:** Symulacja `world_model.simulate` w celu przewidzenia przyszłych stanów na podstawie historycznych trendów.

## 4. Neuro-Pruning (Selektywne Zapominanie)
Zapobieganie "zamuleniu" kontekstu (Context Poisoning) poprzez usuwanie nieistotnych danych.
- **Algorytm Weight Decay:** Każde połączenie w grafie (Link) ma datę ostatniej aktywacji. Jeśli link nie był użyty przez określony czas, jego `Weight` (waga) spada.
- **Neuro-Usuwanie:** Gdy waga połączenia spadnie poniżej progu krytycznego (np. 0.1), link jest usuwany.
- **Zasada:** Zapominanie jest tak samo ważne jak pamiętanie – pozwala zachować precyzję myślenia "High Confidence".

# Instrukcja wdrożenia w sesjach badawczych
1. Przy każdym nowym projekcie sprawdź istniejące mosty w `Neural Topology`.
2. Proponuj "Neuropruning", jeśli wykryjesz sprzeczne lub zdezaktualizowane dane.
3. Buduj "Concept Constellations", które łączą biologię z technologią.
