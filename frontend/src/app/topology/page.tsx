"use client";

import Sidebar from "@/components/Sidebar";
import MermaidRenderer from "@/components/MermaidRenderer";
import { Network, BookOpen, X } from "lucide-react";
import { useState } from "react";

type MermaidControls = {
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    scale: number;
};

export default function NeuralTopologyPage() {
    const [controls, setControls] = useState<MermaidControls | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mermaid-safe technical map in English/ASCII for stable parsing.
    const mermaidChart = `
flowchart LR
    START["USER_MESSAGE"] --> GAP["get_agent_response<br/>main API entry"]

    subgraph Configuration["1 Configuration Layer"]
        GAP --> SETS["sqlite_service.get_settings<br/>load cognition config"]
        SETS --> DEPS["Init deps<br/>persona autonomy<br/>reflection circadian lock"]
        DEPS --> TEMP["Creativity to temperature<br/>mapping 0.0 to 1.0"]
        TEMP --> MODEL["create_model_instance<br/>choose Gemini or Ollama"]
    end

    MODEL --> PROMPT_ENGINE["2 Dynamic System Prompt Builder"]

    subgraph PromptStream["System Prompt Lifecycle"]
        B_P["inject_base_prompt<br/>language control and<br/>CORE-X directives"] --> C_P["inject_cognition_prompt<br/>apply persona and<br/>autonomy levels"]
        C_P --> S_P["inject_skill_prompt<br/>runtime skill activation<br/>and triggers"]
        S_P --> D_P["inject_dynamic_context<br/>aggregate RAG and<br/>circadian state"]
    end

    PROMPT_ENGINE --> B_P

    subgraph RAG_Engine["3 Hybrid Context Injection"]
        D_P --> CIRC["Digital circadian rhythm<br/>cron based persona:<br/>strategist executor philosopher"]
        D_P --> MEM_S["memory_manager.search<br/>semantic retrieval"]
        D_P --> DOC_S["db_service.search_documents<br/>library retrieval"]
    end

    CIRC --> LLM_INPUT["Final prompt<br/>instructions + context<br/>+ user message"]
    MEM_S --> LLM_INPUT
    DOC_S --> LLM_INPUT

    LLM_INPUT --> AGENT_RUN["aether_agent.run<br/>execution loop"]
    AGENT_RUN --> TOOL_LOOP{"Tool call<br/>required"}

    subgraph ToolRegistry["4 Runtime Tool Modules"]
        T_FS["list_directory<br/>read_file<br/>project analysis"]
        T_WRITE["prepare_write_file<br/>human in the loop<br/>approval"]
        T_AUT["validate_path<br/>path safety validation"]
        T_WEB["web_search<br/>external Tavily uplink"]
        T_MEM["remember and recall<br/>semantic memory ops"]
        T_KNG["connect_concepts<br/>modify_concept<br/>graph growth"]
        T_SKB["search_knowledge_base<br/>deep RAG with search limit"]
    end

    TOOL_LOOP --> T_FS
    TOOL_LOOP --> T_WEB
    TOOL_LOOP --> T_MEM
    TOOL_LOOP --> T_KNG
    TOOL_LOOP --> T_SKB
    TOOL_LOOP --> T_WRITE

    T_WRITE -- Autonomy below 3 --> HITL["PENDING_ACTION<br/>waiting for approval"]
    T_WRITE -- Autonomy equals 3 --> AUTO_W["FILE_WRITTEN<br/>direct write"]

    T_FS --> TOOL_RES["Tool result returned<br/>to agent reasoning"]
    T_WEB --> TOOL_RES
    T_MEM --> TOOL_RES
    T_KNG --> TOOL_RES
    T_SKB --> TOOL_RES
    HITL --> TOOL_RES
    AUTO_W --> TOOL_RES

    TOOL_RES --> AGENT_RUN

    TOOL_LOOP -->|Final answer ready| CORE_X["5 CORE-X<br/>response shaping"]

    subgraph OutputSchema["AetherResponse model"]
        R_TXT["response:<br/>Markdown message"]
        R_CONF["confidence_score:<br/>reliability 0.0 to 1.0"]
        R_TYPE["reasoning_type:<br/>DOCS / MEMORY /<br/>WEB / HYPOTHESIS"]
    end

    CORE_X --> R_TXT
    CORE_X --> R_CONF
    CORE_X --> R_TYPE

    R_TXT --> POST_PROC["Async post processing<br/>add_log and history save"]
    R_CONF --> POST_PROC
    R_TYPE --> POST_PROC

    POST_PROC --> EXIT["SYSTEM_READY"]

    style START fill:#9333ea,stroke:#fff,stroke-width:2px,color:#fff
    style AGENT_RUN fill:#1a1a1b,stroke:#a855f7,stroke-width:4px,color:#fff
    style ToolRegistry fill:#1e1b4b,stroke:#9333ea,stroke-dasharray: 8 4
    style OutputSchema fill:#1e1b4b,stroke:#f59e0b,stroke-dasharray: 8 4
    style EXIT fill:#22c55e,stroke:#fff,stroke-width:3px,color:#fff
    style HITL fill:#ef4444,stroke:#fff,color:#fff
    `;

    const guideBlocks = [
        {
            num: 1,
            title: "Warstwa Konfiguracji (Init)",
            color: "cyan",
            text: `Punkt wejścia API — funkcja get_agent_response(). Backend FastAPI odczytuje z bazy SQLite (sqlite_service.get_settings) cały zrzut stanu kognitywnego: aktywną Personę (Analytical / Balanced / Creative), poziom Autonomii (1-3), flagę Self-Reflection, blokadę zegara dobowego oraz Custom Directives. Wartość kreatywności (0-100) jest dzielona przez 100 i przekazywana jako parametr temperature do ModelSettings. Na tej podstawie tworzona jest instancja modelu (Gemini Flash/Pro lub lokalna Ollama) z odpowiednimi hiperparametrami.`,
        },
        {
            num: 2,
            title: "Cykl Życia Promptu Systemowego",
            color: "purple",
            text: `Sekwencyjny potok czterech dekoratorów @system_prompt w PydanticAI. Pierwszym jest inject_base_prompt — odpowiada za wymuszenie języka odpowiedzi (PL/EN) i wstrzyknięcie reguł CORE-X (mechanizm Confidence, zasady markdown, dostęp do narzędzi). Drugim jest inject_cognition_prompt — nakłada profil Persony (concise/creative/balanced), kalibruje zachowanie wg poziomu Autonomii i aktywuje Active World Model jeśli Self-Reflection jest włączony. Trzecim jest inject_skill_prompt — dynamicznie ładuje z bazy SQLite skille użytkownika, filtruje je przez triggers i wstrzykuje jako dodatkowe instrukcje formatowania. Ostatni, inject_dynamic_context, łączy całość z kontekstem RAG.`,
        },
        {
            num: 3,
            title: "Silnik RAG i Kontekst Dobowy",
            color: "blue",
            text: `Wewnątrz inject_dynamic_context działają równolegle trzy mechanizmy. Digital Circadian Rhythm sprawdza bieżącą godzinę i wstrzykuje profil: Strateg (5-12), Wykonawca (12-18), Filozof (18-23) lub Maintainer (noc). Jeśli circadian_lock=true, tryb jest zamrożony na Neutral-Technical. Następnie memory_manager.search_relevant_memories wykonuje wyszukiwanie semantyczne w Qdrant z progiem similarity 0.55 (pamięć długoterminowa z przeszłych konwersacji). Równolegle db_service.search_documents odpytuje indeksowaną bazę dokumentów Markdown z progiem 0.5. Wyniki obu źródeł trafiają do promptu z tagami [TRUST: HIGH/MEDIUM/LOW].`,
        },
        {
            num: 4,
            title: "Rejestr Narzędzi (PydanticAI Loop)",
            color: "emerald",
            text: `Silnik PydanticAI uruchamia pętlę iteracyjną aether_agent.run(). Model sam decyduje, jakich narzędzi użyć: list_directory / read_file (analiza projektu), web_search (Tavily API), remember / recall (operacje na pamięci semantycznej), connect_concepts / modify_concept (graf wiedzy), search_knowledge_base (głęboki RAG z limitem). Kluczowe: jeśli agent wywołuje prepare_write_file przy Autonomii < 3, akcja jest blokowana statusem PENDING_ACTION (Human-in-the-Loop) i czeka na zatwierdzenie z UI. Przy Autonomii = 3 zapis wykonuje się natychmiast. Każdy wynik narzędzia wraca do pętli agenta jako kontekst do dalszych decyzji.`,
        },
        {
            num: 5,
            title: "Walidacja Odpowiedzi (CORE-X Output)",
            color: "amber",
            text: `Po zakończeniu pętli narzędziowej model generuje finalną odpowiedź w strukturze AetherResponse (Pydantic model). Zawiera ona: response (treść markdown), confidence_score (0.0-1.0 — ocena pewności oparta na źródle: DOCS=0.9+, MEMORY=0.7+, HYPOTHESIS=0.5+) oraz reasoning_type (DOCS/MEMORY/WEB/HYPOTHESIS). Mechanizm Confidence chroni użytkownika przed halucynacjami — agent raportuje na jakiej podstawie zbudował odpowiedź. Na końcu asynchronicznie uruchamiany jest post-processing: zapis do logów, aktualizacja historii konwersacji, a odpowiedź trafia przez WebSocket do terminala w UI.`,
        },
    ];

    const colorMap: Record<string, { badge: string; title: string; border: string }> = {
        cyan: {
            badge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-400",
            title: "text-cyan-400",
            border: "border-l-cyan-500/40",
        },
        purple: {
            badge: "bg-purple-500/15 border-purple-500/30 text-purple-400",
            title: "text-purple-400",
            border: "border-l-purple-500/40",
        },
        blue: {
            badge: "bg-blue-500/15 border-blue-500/30 text-blue-400",
            title: "text-blue-400",
            border: "border-l-blue-500/40",
        },
        emerald: {
            badge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-400",
            title: "text-emerald-400",
            border: "border-l-emerald-500/40",
        },
        amber: {
            badge: "bg-amber-500/15 border-amber-500/30 text-amber-400",
            title: "text-amber-400",
            border: "border-l-amber-500/40",
        },
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">
                {/* Header — consistent with Cognition/Settings */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <Network className="w-4 h-4 text-cyan-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Neural Topology</h3>
                            <p className="text-[10px] text-neutral-500 font-mono">Visualize internal architecture and data flow across agent modules</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-[#252525] px-1 py-1 rounded-lg border border-[#303030]">
                            <button
                                onClick={() => controls?.zoomOut()}
                                className="px-2 py-0.5 rounded text-neutral-500 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-mono font-bold"
                                title="Zoom out"
                            >
                                -
                            </button>
                            <div className="w-[1px] h-3 bg-[#303030]" />
                            <button
                                onClick={() => controls?.resetView()}
                                className="px-2 py-0.5 rounded text-neutral-500 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-mono font-bold"
                                title="Fit diagram"
                            >
                                FIT {Math.round((controls?.scale ?? 1) * 100)}%
                            </button>
                            <div className="w-[1px] h-3 bg-[#303030]" />
                            <button
                                onClick={() => controls?.zoomIn()}
                                className="px-2 py-0.5 rounded text-neutral-500 hover:text-white hover:bg-white/5 transition-colors text-[10px] font-mono font-bold"
                                title="Zoom in"
                            >
                                +
                            </button>
                        </div>
                        <div className="w-[1px] h-4 bg-[#303030]" />
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors flex items-center gap-1.5 ${isSidebarOpen
                                    ? "text-white bg-white/5"
                                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                                }`}
                            title="Toggle algorithm guide"
                        >
                            <BookOpen className="w-3 h-3" />
                            Guide
                        </button>
                        <div className="text-[10px] text-neutral-600 border-l border-white/10 pl-3 font-mono hidden lg:block">
                            Source: backend runtime pipeline
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-row relative bg-[#1e1e1e] overflow-hidden">
                    <div className="flex-1 relative">
                        <MermaidRenderer chart={mermaidChart} showToolbar={false} showFooterHint={false} onControlsReady={setControls} />
                    </div>

                    {/* Algorithm Guide Sidebar */}
                    <div
                        className={`shrink-0 flex flex-col border-l border-[#303030] bg-[#181818] overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-[420px]" : "w-0 border-l-0"
                            }`}
                    >
                        <div className="p-5 border-b border-[#303030] bg-[#181818] shrink-0 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                    <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Architektura Kognitywna</h4>
                                    <p className="text-[9px] text-neutral-500 mt-0.5">5 warstw potoku algorytmicznego</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-1 rounded hover:bg-white/5 transition-colors text-neutral-600 hover:text-neutral-400"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-none">
                            {guideBlocks.map((block) => {
                                const colors = colorMap[block.color];
                                return (
                                    <div
                                        key={block.num}
                                        className={`border-l-2 ${colors.border} pl-4 space-y-2`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center border ${colors.badge}`}
                                            >
                                                {block.num}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${colors.title}`}>
                                                {block.title}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-neutral-400 leading-[1.7] font-sans">
                                            {block.text}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
