"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Brain, Network, Clock, Database, X, Trash2, List, Zap, ChevronRight, FileText, Share2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Memories() {
    const [memories, setMemories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
    const [selectedMemory, setSelectedMemory] = useState<any | null>(null);

    const fetchMemories = async () => {
        try {
            const response = await fetch("http://localhost:8000/memories");
            const data = await response.json();
            if (data.status === "success") {
                setMemories(data.memories);
            }
        } catch (error) {
            console.error("Failed to fetch memories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteMemory = async (id: string) => {
        try {
            const response = await fetch(`http://localhost:8000/memories/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.status === "success") {
                setMemories(prev => prev.filter(m => m.id !== id));
                if (selectedMemory?.id === id) setSelectedMemory(null);
            }
        } catch (error) {
            console.error("Failed to delete memory", error);
        }
    };

    useEffect(() => {
        fetchMemories();
    }, []);

    // Layout configuration for the graph
    const CX = 400;
    const CY = 300;
    const R = 200;

    const graphNodes = useMemo(() => {
        return memories.map((mem, index) => {
            const angle = (index / memories.length) * Math.PI * 2;
            const radiusOffset = (index % 3 === 0) ? -40 : ((index % 2 === 0) ? 40 : 0);
            const actualR = R + radiusOffset;
            const x = CX + actualR * Math.cos(angle);
            const y = CY + actualR * Math.sin(angle);
            return { ...mem, x, y };
        });
    }, [memories]);

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Neural Memory Core</h1>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.MEM_GRAPH</span>
                                <span className="text-neutral-700">|</span>
                                <span>{memories.length} VECTORS LOADED</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-[#252525] p-1 rounded-lg border border-[#303030]">
                        <button
                            onClick={() => setViewMode("graph")}
                            className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === "graph" ? "bg-blue-500/20 text-blue-400" : "text-neutral-500 hover:text-neutral-300"}`}
                            title="Graph View"
                        >
                            <Network className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${viewMode === "list" ? "bg-blue-500/20 text-blue-400" : "text-neutral-500 hover:text-neutral-300"}`}
                            title="List View"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative flex">
                    <div className="flex-1 h-full overflow-y-auto bg-[#1e1e1e] relative">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <span className="text-neutral-500 animate-pulse font-mono text-xs flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Syncing neural nodes...
                                </span>
                            </div>
                        ) : viewMode === "graph" ? (
                            <div className="relative w-full h-full min-h-[600px] overflow-auto flex items-center justify-center bg-[#1e1e1e] cursor-crosshair">

                                {/* Info Legend */}
                                <div className="absolute top-6 left-6 bg-[#181818]/80 backdrop-blur-md border border-[#303030] p-4 rounded-xl shadow-2xl z-20 max-w-sm pointer-events-none">
                                    <h4 className="text-[11px] text-blue-400 font-mono font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Brain className="w-3.5 h-3.5" />
                                        System Architecture Legend
                                    </h4>
                                    <div className="space-y-3 text-[10px] font-sans">
                                        <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg">
                                            <strong className="text-blue-300 block mb-0.5">Vector Epigenetics (Qdrant)</strong>
                                            <span className="text-neutral-400 leading-tight block">Nodes on this graph. Semantic concepts & facts extracted across ALL conversations. Influences agent reasoning holistically.</span>
                                        </div>
                                        <div className="bg-[#303030]/50 border border-[#404040] p-2.5 rounded-lg">
                                            <strong className="text-purple-300 block mb-0.5">Chronicles (SQLite)</strong>
                                            <span className="text-neutral-400 leading-tight block">Not shown here. Linear, sequential logs of entire chat sessions found in the Chat interface sidebar.</span>
                                        </div>
                                        <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg">
                                            <strong className="text-green-300 block mb-0.5">The Library (Static Knowledge)</strong>
                                            <span className="text-neutral-400 leading-tight block">Top Node. Uploaded files, specs, and manifests (e.g., ROADMAP.md). Grounding truth for the agent.</span>
                                        </div>
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg border-dashed">
                                            <strong className="text-amber-300 block mb-0.5">Concept Constellations (Roadmap)</strong>
                                            <span className="text-neutral-400 leading-tight block">Bottom Node. Future graph memory & sleep-cycle re-consolidation.</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulated SVG Graph - Upgraded Visualization */}
                                <svg width="1000" height="700" className="absolute pointer-events-none" style={{ filter: "drop-shadow(0 0 12px rgba(59, 130, 246, 0.2))" }}>

                                    {/* --- Core System Nodes --- */}

                                    {/* Unifying Future Concept Constellation Orbit (Links everything together) */}
                                    <ellipse
                                        cx="400" cy="350"
                                        rx="250" ry="200"
                                        fill="none"
                                        stroke="#f59e0b"
                                        strokeWidth="1"
                                        strokeDasharray="4 8"
                                        className="opacity-30 animate-[spin_30s_linear_infinite]"
                                        style={{ transformOrigin: "400px 350px" }}
                                    />

                                    <g transform="translate(400, 150)">
                                        {/* Knowledge Base Node (Top) */}
                                        <circle cx="0" cy="0" r="28" fill="#181818" stroke="#10b981" strokeWidth="2" />
                                        <text x="0" y="-35" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">The Library</text>
                                        <text x="0" y="-24" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace" className="uppercase">Stored Files</text>

                                        {/* Connection to center */}
                                        <path d="M 0 28 L 0 160" stroke="#10b981" strokeWidth="2" strokeDasharray="3 6" className="animate-[pulse_3s_ease-in-out_infinite]" />
                                        <text x="60" y="80" textAnchor="middle" fill="#10b981" fontSize="9" fontFamily="monospace">Document Lookup</text>
                                    </g>

                                    <g transform="translate(400, 350)">
                                        {/* Aether Agent Node (Center) */}
                                        <circle cx="0" cy="0" r="35" fill="#181818" stroke="#a855f7" strokeWidth="2" />
                                        <text x="0" y="55" textAnchor="middle" fill="#a855f7" fontSize="12" fontFamily="monospace" fontWeight="bold">AETHER CORE</text>

                                        {/* Dynamic Core Pulse */}
                                        <circle cx="0" cy="0" r="45" fill="transparent" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" className="animate-[spin_10s_linear_infinite]" />
                                    </g>

                                    <g transform="translate(150, 350)">
                                        {/* SQLite Node (Left) */}
                                        <circle cx="0" cy="0" r="28" fill="#181818" stroke="#6b7280" strokeWidth="2" />
                                        <text x="0" y="48" textAnchor="middle" fill="#9ca3af" fontSize="10" fontFamily="monospace" fontWeight="bold">SQLite</text>
                                        <text x="0" y="-40" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="monospace" className="uppercase">Chronicles</text>

                                        {/* Connection to center */}
                                        <path d="M 28 0 L 210 0" stroke="#4b5563" strokeWidth="1" strokeDasharray="5 5" />
                                        <text x="120" y="-8" textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">Loads strict session context</text>
                                    </g>

                                    <g transform="translate(650, 350)">
                                        {/* Qdrant Node (Right) */}
                                        <circle cx="0" cy="0" r="28" fill="#181818" stroke="#3b82f6" strokeWidth="2" />
                                        <text x="0" y="48" textAnchor="middle" fill="#60a5fa" fontSize="10" fontFamily="monospace" fontWeight="bold">Qdrant</text>
                                        <text x="0" y="-40" textAnchor="middle" fill="#3b82f6" fontSize="9" fontFamily="monospace" className="uppercase">Vector DB</text>

                                        {/* Connection to center */}
                                        <path d="M -28 0 L -210 0" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                                        <text x="-120" y="-8" textAnchor="middle" fill="#3b82f6" fontSize="9" fontFamily="monospace">Injects dynamic semantic facts</text>
                                    </g>

                                    <g transform="translate(400, 550)">
                                        {/* Future Graph Node (Bottom) */}
                                        <circle cx="0" cy="0" r="28" fill="#181818" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" className="opacity-80" />
                                        <text x="0" y="48" textAnchor="middle" fill="#fcd34d" fontSize="9" fontFamily="monospace" fontWeight="bold">Graph Memory</text>
                                        <text x="0" y="-40" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace" className="uppercase">Future Roadmap</text>

                                        {/* Connection to center */}
                                        <path d="M 0 -28 L 0 -160" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 6" className="opacity-50 animate-pulse" />
                                        <text x="70" y="-80" textAnchor="middle" fill="#f59e0b" fontSize="8" fontFamily="monospace" className="opacity-70">Sleep-cycle prep</text>
                                    </g>

                                    {/* Connections to Vectors (Orbiting Qdrant) */}
                                    {graphNodes.map((node) => {
                                        // Offset logic to map coords relative to the visual SVG center instead of standard React state bounds
                                        const relX = node.x - CX + 650;
                                        const relY = node.y - CY + 350;

                                        return (
                                            <g key={`line-group-${node.id}`}>
                                                {/* Line from Qdrant to vector */}
                                                <line
                                                    x1={650} y1={350} x2={relX} y2={relY}
                                                    stroke={selectedMemory?.id === node.id ? "#60a5fa" : "#1e3a8a"}
                                                    strokeWidth={selectedMemory?.id === node.id ? 2 : 1}
                                                    strokeDasharray="2 4"
                                                    className="transition-all duration-300"
                                                />
                                                {/* If selected, line from Vector to Aether core for visual clarity */}
                                                {selectedMemory?.id === node.id && (
                                                    <line
                                                        x1={relX} y1={relY} x2={400} y2={350}
                                                        stroke="#a855f7"
                                                        strokeWidth="1.5"
                                                        strokeDasharray="4 4"
                                                        className="animate-pulse"
                                                    />
                                                )}
                                            </g>
                                        )
                                    })}
                                </svg>

                                {/* Nodes HTML Layer for interactions */}
                                <div className="relative w-[1000px] h-[700px]">

                                    {/* Aether Core HTML UI Overlay */}
                                    <div className="absolute top-[350px] left-[400px] -translate-x-1/2 -translate-y-1/2 text-purple-400 pointer-events-none flex flex-col items-center justify-center">
                                        <Brain className="w-8 h-8" />
                                    </div>

                                    {/* Knowledge Base HTML UI Overlay */}
                                    <div className="absolute top-[150px] left-[400px] -translate-x-1/2 -translate-y-1/2 text-green-400 pointer-events-none flex flex-col items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>

                                    {/* SQLite Core HTML UI Overlay */}
                                    <div className="absolute top-[350px] left-[150px] -translate-x-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex flex-col items-center justify-center">
                                        <Database className="w-6 h-6" />
                                    </div>

                                    {/* Qdrant Core HTML UI Overlay */}
                                    <div className="absolute top-[350px] left-[650px] -translate-x-1/2 -translate-y-1/2 text-blue-400 pointer-events-none flex flex-col items-center justify-center">
                                        <Network className="w-6 h-6" />
                                    </div>

                                    {/* Future Graph Core HTML UI Overlay */}
                                    <div className="absolute top-[550px] left-[400px] -translate-x-1/2 -translate-y-1/2 text-amber-500 pointer-events-none flex flex-col items-center justify-center opacity-80">
                                        <Share2 className="w-6 h-6" />
                                    </div>

                                    {/* Vector Memory Nodes */}
                                    {graphNodes.map((node) => {
                                        const relX = node.x - CX + 650;
                                        const relY = node.y - CY + 350;

                                        return (
                                            <motion.button
                                                key={node.id}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                onClick={() => setSelectedMemory(node)}
                                                style={{ left: relX, top: relY }}
                                                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-all ${selectedMemory?.id === node.id ? "bg-blue-500 scale-150 shadow-[0_0_15px_rgba(59,130,246,0.6)] z-20" : "bg-[#252525] border border-[#404040] hover:border-blue-400 hover:scale-125 z-10"}`}
                                            >
                                                <div className={`w-1 h-1 rounded-full ${selectedMemory?.id === node.id ? "bg-white" : "bg-neutral-500"}`} />
                                                {/* Label peek */}
                                                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity bg-[#181818] border border-[#303030] text-[9px] text-neutral-300 px-2 py-1 rounded w-32 truncate pointer-events-none font-mono shadow-xl">
                                                    {node.content}
                                                </div>
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            // List View
                            <div className="p-8 max-w-5xl mx-auto">
                                <div className="space-y-3">
                                    {memories.length === 0 ? (
                                        <div className="text-center py-20 text-neutral-500 flex flex-col items-center">
                                            <Brain className="w-12 h-12 mb-4 opacity-20" />
                                            <p>No vectors recorded.</p>
                                        </div>
                                    ) : (
                                        memories.map(mem => (
                                            <div key={mem.id} onClick={() => setSelectedMemory(mem)} className={`p-4 rounded-xl border transition-colors cursor-pointer flex justify-between items-center ${selectedMemory?.id === mem.id ? "bg-blue-500/10 border-blue-500/30" : "bg-[#181818] border-[#303030] hover:border-blue-500/20"}`}>
                                                <div className="min-w-0 pr-4">
                                                    <p className="text-sm text-neutral-200 line-clamp-1 truncate">{mem.content}</p>
                                                    <div className="flex gap-2 text-[10px] text-neutral-500 font-mono mt-1">
                                                        <span className="text-blue-400">{mem.category}</span>
                                                        <span className="text-neutral-700">•</span>
                                                        <span>{new Date(mem.timestamp).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Info Panel Overlay / Sidebar */}
                    <AnimatePresence>
                        {selectedMemory && (
                            <motion.div
                                initial={{ x: 320, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 320, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="w-80 border-l border-[#303030] bg-[#181818] flex flex-col absolute right-0 top-0 bottom-0 shadow-2xl z-30"
                            >
                                <div className="p-4 border-b border-[#303030] flex items-center justify-between bg-[#202020]">
                                    <h3 className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                                        <Database className="w-3.5 h-3.5 text-blue-400" />
                                        Vector Node Details
                                    </h3>
                                    <button onClick={() => setSelectedMemory(null)} className="p-1 text-neutral-500 hover:text-white transition-colors bg-white/5 rounded-md hover:bg-red-500/20">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-5 overflow-y-auto flex-1 space-y-6">
                                    <div>
                                        <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono mb-2">Decoded Content</div>
                                        <div className="text-sm text-neutral-200 leading-relaxed bg-[#252526] border border-[#3c3c3c] rounded-lg p-3 shadow-inner">
                                            {selectedMemory.content}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Category Route</div>
                                            <div className="text-[10px] font-mono text-blue-400 bg-blue-500/10 inline-block px-2 py-1 rounded border border-blue-500/20">
                                                {selectedMemory.category || "GENERAL"}
                                            </div>
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Vector ID Hash</div>
                                            <div className="text-[10px] font-mono text-neutral-400 truncate w-full" title={selectedMemory.id}>
                                                {selectedMemory.id.split('-')[0]}...
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono mb-1">Commit Timestamp</div>
                                        <div className="text-[11px] font-mono text-neutral-300 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-neutral-500" />
                                            {new Date(selectedMemory.timestamp).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 mt-8 relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                                        <div className="text-[10px] text-red-500 font-mono mb-3 uppercase tracking-wide font-bold">Danger Zone</div>
                                        <button
                                            onClick={() => deleteMemory(selectedMemory.id)}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-[11px] uppercase tracking-wider font-bold rounded transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Excision Protocol
                                        </button>
                                        <p className="text-[9px] text-neutral-500 mt-3 text-center leading-tight">
                                            Permanently erase this vector from the neural network. Cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Status Bar */}
                <div className="flex items-center justify-between px-6 py-2 border-t border-[#303030] bg-[#181818] text-[10px] font-mono text-neutral-500 uppercase tracking-widest shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span>NODE_INFRA: CONNECTED</span>
                        </div>
                        <span className="text-neutral-800">|</span>
                        <span>MEM_CORE: SYNCED</span>
                    </div>
                    <span>aether.core_stable_v1.0.4</span>
                </div>
            </main>
            <ThoughtStream steps={[]} />
        </div>
    );
}
