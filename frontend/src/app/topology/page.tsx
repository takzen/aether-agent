"use client";

import Sidebar from "@/components/Sidebar";
import { Brain, Network, Zap, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import NeuralTopologyView from "@/components/NeuralTopologyView";

export default function NeuralTopology() {
    const [memories, setMemories] = useState([]);
    const [isNightMode, setIsNightMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

        fetchMemories();
    }, []);

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isNightMode ? 'bg-amber-500' : 'bg-blue-500'} animate-pulse`} />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Neural Topology Scan</h3>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.NEURAL_MAP</span>
                                <span className="text-neutral-700">|</span>
                                <span>{isNightMode ? 'CONSOLIDATING_KNOWLEDGE' : 'MAPPING_GALLANT_ATLAS'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsNightMode(!isNightMode)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all font-mono text-[10px] font-bold uppercase tracking-tighter ${isNightMode
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                                    : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                }`}
                        >
                            {isNightMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            {isNightMode ? 'Sleep Cycle Active' : 'Day Mode'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-hidden relative flex bg-[#1e1e1e]">
                    {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-neutral-500 animate-pulse font-mono text-xs flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Initiating Neural Topography...
                            </span>
                        </div>
                    ) : (
                        <NeuralTopologyView memories={memories} isNightMode={isNightMode} />
                    )}

                    {/* Legendary Info Panel (Minimal) */}
                    <div className="absolute bottom-6 right-6 bg-[#181818]/60 backdrop-blur-sm border border-white/5 p-4 rounded-xl z-20 pointer-events-none">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                <span className="text-[10px] text-neutral-400 font-mono uppercase">Aether Core (Decision)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] text-neutral-400 font-mono uppercase">Neocortex (Semantic)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                <span className="text-[10px] text-neutral-400 font-mono uppercase">Hippocampus (Episodic)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="text-[10px] text-neutral-400 font-mono uppercase">Temporal (The Library)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
