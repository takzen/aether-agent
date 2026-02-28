"use client";

import Sidebar from "@/components/Sidebar";
import MermaidRenderer from "@/components/MermaidRenderer";
import { motion } from "framer-motion";

export default function NeuralTopology() {
    const mermaidChart = `
flowchart TD
    %% Inicjalizacja
    Start([Skierowanie zapytania/Zadanie]) --> Router{Analiza wymagań zadania}
    
    %% Główne ścieżki decyzyjne
    Router -->|Pliki i kod| FS_Router{Operacje na plikach?}
    Router -->|Baza wiedzy i pamięć| KB_Router{Typ wiedzy?}
    Router -->|Świat zewnętrzny| Ext[web_search]
    Router -->|Zarządzanie czasem| Time[get_current_time]
    
    %% Pod-drzewo: System plików
    FS_Router -->|Eksploracja struktury| FS1[list_directory]
    FS_Router -->|Analiza zawartości pliku| FS2[read_file]
    FS_Router -->|Modyfikacja/Tworzenie| FS3[prepare_write_file]
    
    %% Pod-drzewo: Baza wiedzy
    KB_Router -->|Pamięć o użytkowniku / przeszłość| Mem_Router{Akcja na pamięci?}
    KB_Router -->|Wewnętrzna dokumentacja projektu| Doc[search_knowledge_base]
    KB_Router -->|Relacje semantyczne / Graf| Graph_Router{Operacja na grafie?}
    
    %% Pamięć długotrwała
    Mem_Router -->|Pobieranie kontekstu| M1[recall]
    Mem_Router -->|Zapisywanie nowych faktów| M2[remember]
    
    %% Graf wiedzy (Concept Constellations)
    Graph_Router -->|Odkrywanie powiązań| G1[query_graph]
    Graph_Router -->|Tworzenie nowych węzłów| G2[connect_concepts]
    Graph_Router -->|Modyfikacja węzłów| G3[modify_concept]
    
    %% Ewaluacja po użyciu narzędzia
    FS1 --> Eval
    FS2 --> Eval
    FS3 --> Eval
    Ext --> Eval
    Time --> Eval
    Doc --> Eval
    M1 --> Eval
    M2 --> Eval
    G1 --> Eval
    G2 --> Eval
    G3 --> Eval
    
    Eval[Ewaluacja pobranych danych i aktualizacja kontekstu] --> Decision{Dane wystarczające?}
    
    %% Cykl lub Zakończenie
    Decision -->|Nie, brakuje danych| Router
    Decision -->|Tak| Final([Wywołanie final_result z Confidence Score])
    
    %% Stylowanie węzłów
    classDef tool fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;
    classDef decision fill:#0f172a,stroke:#a855f7,stroke-width:2px,color:#f8fafc;
    classDef endpoint fill:#020617,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    
    class FS1,FS2,FS3,Ext,Time,Doc,M1,M2,G1,G2,G3 tool;
    class Router,FS_Router,KB_Router,Mem_Router,Graph_Router,Decision,Eval decision;
    class Start,Final endpoint;
    `;

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden bg-[#1e1e1e]">
                <div className="flex-1 overflow-auto flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-[1600px] h-full flex items-center justify-center"
                    >
                        <MermaidRenderer chart={mermaidChart} />
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
