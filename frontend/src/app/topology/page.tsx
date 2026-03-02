"use client";

import Sidebar from "@/components/Sidebar";
import MermaidRenderer from "@/components/MermaidRenderer";
import { Network } from "lucide-react";
import { useState } from "react";

type MermaidControls = {
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    scale: number;
};

export default function NeuralTopologyPage() {
    const [controls, setControls] = useState<MermaidControls | null>(null);
    // Mermaid-safe technical map in English/ASCII for stable parsing.
    const mermaidChart = `
flowchart LR
    START["USER_MESSAGE"] --> GAP["get_agent_response<br/>main API entry"]

    subgraph Configuration["1 Configuration Layer"]
        GAP --> SETS["sqlite_service.get_settings<br/>load cognition config"]
        SETS --> DEPS["Init deps<br/>persona autonomy<br/>reflection circadian lock"]
        DEPS --> TEMP["Creativity to temperature<br/>mapping 0.1 to 1.0"]
        TEMP --> MODEL["create_model_instance<br/>choose Gemini or Ollama"]
    end

    MODEL --> PROMPT_ENGINE["2 Dynamic System Prompt Builder"]

    subgraph PromptStream["System Prompt Lifecycle"]
        B_P["inject_base_prompt<br/>language control and<br/>CORE-X directives"]
        C_P["inject_cognition_prompt<br/>apply persona and<br/>autonomy levels"]
        S_P["inject_skill_prompt<br/>runtime skill activation<br/>and triggers"]
        D_P["inject_dynamic_context<br/>aggregate RAG and<br/>circadian state"]
    end

    PROMPT_ENGINE --> B_P
    B_P --> C_P
    C_P --> S_P
    S_P --> D_P

    subgraph RAG_Engine["Hybrid Context Injection"]
        D_P --> CIRC["Digital circadian rhythm<br/>cron based persona:<br/>strategist executor philosopher"]
        D_P --> MEM_S["memory_manager.search<br/>semantic retrieval"]
        D_P --> DOC_S["db_service.search_documents<br/>library retrieval"]
    end

    CIRC --> LLM_INPUT["Final prompt<br/>instructions + context<br/>+ user message"]
    MEM_S --> LLM_INPUT
    DOC_S --> LLM_INPUT

    LLM_INPUT --> AGENT_RUN["aether_agent.run<br/>execution loop"]
    AGENT_RUN --> TOOL_LOOP{"Tool call<br/>required"}

    subgraph ToolRegistry["3 Runtime Tool Modules"]
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

    TOOL_LOOP -->|Final answer ready| CORE_X["4 CORE-X<br/>response shaping"]

    subgraph OutputSchema["AetherResponse model"]
        R_TXT["response:<br/>Markdown message"]
        R_CONF["confidence_score:<br/>reliability 0.1 to 1.0"]
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

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">
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
                        <div className="text-[10px] text-neutral-600 border-l border-white/10 pl-3 font-mono hidden lg:block">
                            Source: backend runtime pipeline
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">
                    <MermaidRenderer chart={mermaidChart} showToolbar={false} showFooterHint={false} onControlsReady={setControls} />
                </div>
            </main>
        </div>
    );
}
