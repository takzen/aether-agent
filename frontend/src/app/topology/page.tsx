"use client";

import Sidebar from "@/components/Sidebar";
import MermaidRenderer from "@/components/MermaidRenderer";

export default function NeuralTopologyPage() {
    // Ultra-Detailed Technical Map - Sanitized and simplified styles for Mermaid 11.1
    // Fixed: Removed 'rgba' from style definitions as it causes parse errors in some Mermaid versions.
    // Fixed: Using hex colors for all style definitions.
    const mermaidChart = `
flowchart LR
    %% Entry Layer
    START(["USER_MESSAGE"]) --> GAP["get_agent_response: Glowne wejscie API"]
    
    subgraph Configuration ["1. Konfiguracja Neuralna"]
        GAP --> SETS["sqlite_service.get_settings: Pobranie konfiguracji Cognition"]
        SETS --> DEPS["Inicjalizacja deps: persona, autonomia, reflection, circadian_lock"]
        DEPS --> TEMP["Kreatywnosc to temperature: Mapowanie 0.1 - 1.0"]
        TEMP --> MODEL["create_model_instance: Inicjalizacja Gemini lub Ollama"]
    end

    MODEL --> PROMPT_ENGINE["2. Budowa Dynamicznego Promptu Systemowego"]

    subgraph PromptStream ["System Prompt Functions Lifecycle"]
        B_P["inject_base_prompt: Kontrola jezyka pl/en + dyrektywy CORE-X"]
        C_P["inject_cognition_prompt: Aplikacja persony i autonomii 1-3"]
        D_P["inject_dynamic_context: Agregacja danych RAG i stanów"]
    end

    PROMPT_ENGINE --> B_P
    B_P --> C_P
    C_P --> D_P

    subgraph RAG_Engine ["Hybrid Neural Context Injection"]
        D_P --> CIRC["Digital Circadian Rhythm: Strateg/Wykonawca/Filozof"]
        D_P --> MEM_S["memory_manager.search: Wyszukiwanie semantyczne"]
        D_P --> DOC_S["db_service.search_documents: Przeszukiwanie Biblioteki"]
    end

    CIRC --> LLM_INPUT["Finalny Prompt: Instrukcje + Kontekst + Wiadomosc"]
    MEM_S --> LLM_INPUT
    DOC_S --> LLM_INPUT

    %% Execution Loop
    LLM_INPUT --> AGENT_RUN["aether_agent.run: Egzekucja w petli PydanticAI"]
    
    AGENT_RUN --> TOOL_LOOP{"Decyzja o uzyciu narzedzia?"}

    subgraph ToolRegistry ["3. Dostepne Moduly Operacyjne"]
        T_FS["list_directory / read_file: Analiza projektu"]
        T_WRITE["prepare_write_file: HITL Approval Flow"]
        T_AUT["validate_path: Walidacja bezpieczenstwa sciezek"]
        T_WEB["web_search: Zewnetrzny uplink via Tavily API"]
        T_MEM["remember / recall: Zarzadzanie pamiecia semantyczna"]
        T_KNG["connect_concepts / query_graph: Rozbudowa Grafu"]
        T_SKB["search_knowledge_base: Gleboki RAG z limitem search_count"]
    end

    TOOL_LOOP --> T_FS
    TOOL_LOOP --> T_WEB
    TOOL_LOOP --> T_MEM
    TOOL_LOOP --> T_KNG
    TOOL_LOOP --> T_SKB
    TOOL_LOOP --> T_WRITE
    
    T_WRITE -- Autonomia ponizej 3 --> HITL["PENDING_ACTION: Oczekiwanie na decyzje"]
    T_WRITE -- Autonomia rowna 3 --> AUTO_W["FILE_WRITTEN: Bezposredni zapis"]
    
    T_FS --> TOOL_RES["Wynik narzedzia to Agent Reasoning"]
    T_WEB --> TOOL_RES
    T_MEM --> TOOL_RES
    T_KNG --> TOOL_RES
    T_SKB --> TOOL_RES
    HITL --> TOOL_RES
    AUTO_W --> TOOL_RES
    
    TOOL_RES --> AGENT_RUN

    %% Output Layer
    TOOL_LOOP -->|Gotowa odpowiedź| CORE_X["4. Strukturyzacja CORE-X Engine"]
    
    subgraph OutputSchema ["AetherResponse Model"]
        R_TXT["response: Markdown message"]
        R_CONF["confidence_score: Ocena wiarygodnosci 0.1 - 1.0"]
        R_TYPE["reasoning_type: DOCS / MEMORY / WEB / HYPOTHESIS"]
    end

    CORE_X --> R_TXT
    CORE_X --> R_CONF
    CORE_X --> R_TYPE
    
    R_TXT --> POST_PROC["Asynchroniczna asymilacja: add_log + history save"]
    R_CONF --> POST_PROC
    R_TYPE --> POST_PROC
    
    POST_PROC --> EXIT(["SYSTEM_READY"])

    %% Technical Styles - Fixed: Using HEX only, no RGBA
    style START fill:#9333ea,stroke:#fff,stroke-width:2px,color:#fff
    style AGENT_RUN fill:#1a1a1b,stroke:#a855f7,stroke-width:4px,color:#fff
    style ToolRegistry fill:#1e1b4b,stroke:#9333ea,stroke-dasharray: 8 4
    style OutputSchema fill:#1e1b4b,stroke:#f59e0b,stroke-dasharray: 8 4
    style EXIT fill:#22c55e,stroke:#fff,stroke-width:3px,color:#fff
    style HITL fill:#ef4444,stroke:#fff,color:#fff
    `;

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Neural Topology</h3>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.AGENT_INTERNAL_ARCHITECTURE_DEEP</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area - Scrollable */}
                <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">
                    <MermaidRenderer chart={mermaidChart} />
                </div>
            </main>
        </div>
    );
}
