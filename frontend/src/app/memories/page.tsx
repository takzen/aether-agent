"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Search, Brain, Clock, Zap, MessageSquare, Plus, Minus, Maximize, MousePointer2 } from "lucide-react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const memoryNodes = [
    { id: 1, type: "concept", label: "Aether Architecture", relevance: 0.98, x: 900, y: 900 },
    { id: 2, type: "fact", label: "Gemini 3 Performance", relevance: 0.85, x: 1100, y: 1050 },
    { id: 3, type: "concept", label: "RAG Pipeline", relevance: 0.92, x: 750, y: 1150 },
    { id: 4, type: "snippet", label: "vector_store.py", relevance: 0.76, x: 1300, y: 850 },
    { id: 5, type: "fact", label: "User Preference: Dark Mode", relevance: 0.65, x: 1250, y: 1250 },
    { id: 6, type: "concept", label: "React Syntax", relevance: 0.88, x: 1050, y: 750 },
];

export default function Memories() {
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: -600, y: -600 });

    // Smooth zoom handling
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY;
            setScale(prev => Math.min(Math.max(prev - delta * 0.01, 0.3), 3));
        }
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.3));
    const resetView = () => {
        setScale(1);
        setPosition({ x: -600, y: -600 });
    };

    return (
        <div className="flex h-screen bg-[#1e1e1e] overflow-hidden font-sans text-foreground relative select-none">

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">

                {/* Header — Tactical Dashboard Style */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Neural Memory Bank</h1>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.MEM_BANK_V3</span>
                                <span className="text-neutral-700">|</span>
                                <span>1,240 VECTORS LOADED</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Moved to Header to avoid overlap */}
                    <div className="flex-1 max-w-sm ml-8">
                        <div className="relative bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-purple-500/40 transition-all flex items-center gap-2.5">
                            <span className="text-purple-400/50 font-mono text-[9px] font-bold shrink-0">MEM_QUERY:</span>
                            <input
                                type="text"
                                className="bg-transparent w-full text-white font-mono text-[11px] placeholder:text-neutral-700 focus:outline-none"
                                placeholder="Trace fragment..."
                            />
                            <Search className="h-3.5 w-3.5 text-neutral-600" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-green-500/70 bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            LIVE_SYNC_ACTIVE
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex relative overflow-hidden bg-[#020202]">

                    {/* Visualization Canvas */}
                    <div
                        ref={containerRef}
                        onWheel={handleWheel}
                        className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#1e1e1e] via-[#252526] to-[#2d2d2d] cursor-crosshair"
                    >
                        {/* Tactical Grid Background (Fixed) */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

                        {/* Search Overlay (Command Style) */}
                        {/* Removed search bar from here as per instruction */}

                        {/* Zoom Controls Overlay */}
                        <div className="absolute bottom-6 left-6 z-40 flex flex-col gap-2">
                            <div className="flex flex-col bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                <button onClick={zoomIn} className="p-2.5 hover:bg-white/5 transition-colors text-neutral-400 hover:text-white border-b border-white/5"><Plus className="w-4 h-4" /></button>
                                <button onClick={zoomOut} className="p-2.5 hover:bg-white/5 transition-colors text-neutral-400 hover:text-white border-b border-white/5"><Minus className="w-4 h-4" /></button>
                                <button title="Recenter View" onClick={resetView} className="p-2.5 hover:bg-white/5 transition-colors text-neutral-400 hover:text-white"><Maximize className="w-4 h-4" /></button>
                            </div>
                            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[10px] font-mono text-neutral-500 flex items-center gap-2">
                                <MousePointer2 className="w-3 h-3" />
                                <span>ZOOM: {Math.round(scale * 100)}%</span>
                                <span className="text-neutral-700 ml-1">• CTRL + Scroll</span>
                            </div>
                        </div>

                        {/* Draggable Viewport Layer */}
                        <motion.div
                            drag
                            dragMomentum={false}
                            className="absolute inset-0 w-[2000px] h-[2000px] origin-center cursor-grab active:cursor-grabbing"
                            initial={position}
                            animate={{
                                scale,
                                x: position.x,
                                y: position.y
                            }}
                            onDragEnd={(_, info) => {
                                setPosition({ x: position.x + info.delta.x, y: position.y + info.delta.y });
                            }}
                        >
                            {/* Graph Simulation */}
                            <div className="relative w-full h-full">
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                    <line x1="900" y1="900" x2="1050" y2="750" stroke="white" strokeWidth="1" />
                                    <line x1="900" y1="900" x2="750" y2="1150" stroke="white" strokeWidth="1" />
                                    <line x1="1100" y1="1050" x2="900" y2="900" stroke="white" strokeWidth="1" />
                                    <line x1="1100" y1="1050" x2="1300" y2="850" stroke="white" strokeWidth="1" />
                                    <line x1="1250" y1="1250" x2="1100" y2="1050" stroke="white" strokeWidth="1" />
                                </svg>

                                {memoryNodes.map((node) => (
                                    <motion.div
                                        key={node.id}
                                        className="absolute pointer-events-auto"
                                        style={{ left: node.x, top: node.y }}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", delay: node.id * 0.05 }}
                                    >
                                        <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border backdrop-blur-md group hover:scale-105 transition-all z-10 ${node.type === 'concept' ? 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.1)]' :
                                            node.type === 'fact' ? 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/10'
                                            }`}>

                                            {/* Animated Pulse Ring */}
                                            <div className={`absolute inset-0 rounded-2xl animate-ping opacity-10 pointer-events-none ${node.type === 'concept' ? 'bg-purple-500' :
                                                node.type === 'fact' ? 'bg-blue-500' : ''
                                                }`} />

                                            <span className="text-[11px] font-bold font-mono text-white/90 whitespace-nowrap mb-1">{node.label}</span>
                                            <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <div className="h-1 w-12 bg-neutral-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-purple-500" style={{ width: `${node.relevance * 100}%` }} />
                                                </div>
                                                <span className="text-[8px] font-mono tracking-tighter text-neutral-400">{Math.round(node.relevance * 100)}% CONFIDENCE</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Context List — Tactical Style */}
                    <div className="w-[320px] border-l border-white/5 bg-black/40 backdrop-blur-2xl p-6 flex flex-col z-20">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Activity_Log</h3>
                            <Clock className="w-3 h-3 text-neutral-600" />
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto scrollbar-none">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="group p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] hover:border-purple-500/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-purple-400/70" />
                                            <span className="text-[9px] font-mono text-purple-400/60 uppercase tracking-tighter">Memory_Link</span>
                                        </div>
                                        <span className="text-[8px] font-mono text-neutral-600">2M_AGO</span>
                                    </div>
                                    <p className="text-[11px] text-neutral-400 leading-relaxed font-mono group-hover:text-neutral-200 transition-colors">
                                        Vector established between <span className="text-neutral-300">embedding_v4</span> and tactical schema nodes locally.
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Status Bar — Matches Dashboard */}
                <div className="flex items-center justify-between px-6 py-2 border-t border-white/5 bg-black/60 text-[10px] font-mono text-neutral-600 uppercase tracking-widest shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span>NODE_INFRA: CONNECTED</span>
                        </div>
                        <span className="text-neutral-800">|</span>
                        <span>MEM_CORE: OPTIMIZED</span>
                    </div>
                    <span>aether.core_stable_v1.0.4</span>
                </div>

            </main>
            <ThoughtStream />
        </div>
    );
}
