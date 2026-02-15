"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Search, Brain, Clock, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const memoryNodes = [
    { id: 1, type: "concept", label: "Aether Architecture", relevance: 0.98, x: 200, y: 150 },
    { id: 2, type: "fact", label: "Gemini 3 Performance", relevance: 0.85, x: 400, y: 250 },
    { id: 3, type: "concept", label: "RAG Pipeline", relevance: 0.92, x: 100, y: 300 },
    { id: 4, type: "snippet", label: "vector_store.py", relevance: 0.76, x: 600, y: 100 },
    { id: 5, type: "fact", label: "User Preference: Dark Mode", relevance: 0.65, x: 500, y: 400 },
    { id: 6, type: "concept", label: "React Syntax", relevance: 0.88, x: 300, y: 50 },
];

export default function Memories() {
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground relative">

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Neural Memory Bank</h1>
                        <p className="text-sm text-neutral-400">Visualizing 1,240 stored vectors and associations.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Live Sync
                        </div>
                        <input
                            type="text"
                            placeholder="Search memory..."
                            className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Visualization Canvas */}
                <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#020202] to-[#0A0A0A]">

                    {/* Graph Simulation */}
                    <div className="absolute inset-0">
                        {/* Connecting Lines (Simulated) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                            <line x1="200" y1="150" x2="300" y2="50" stroke="white" strokeWidth="1" />
                            <line x1="200" y1="150" x2="100" y2="300" stroke="white" strokeWidth="1" />
                            <line x1="400" y1="250" x2="200" y2="150" stroke="white" strokeWidth="1" />
                            <line x1="400" y1="250" x2="600" y2="100" stroke="white" strokeWidth="1" />
                            <line x1="500" y1="400" x2="400" y2="250" stroke="white" strokeWidth="1" />
                        </svg>

                        {memoryNodes.map((node) => (
                            <motion.div
                                key={node.id}
                                className="absolute cursor-pointer"
                                style={{ left: node.x, top: node.y }}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", delay: node.id * 0.1 }}
                                drag
                                dragConstraints={{ left: 0, right: 800, top: 0, bottom: 600 }}
                            >
                                <div className={`relative flex items-center justify-center p-4 rounded-full border border-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] group hover:scale-110 transition-transform z-10 ${node.type === 'concept' ? 'bg-purple-500/10 border-purple-500/30' :
                                    node.type === 'fact' ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-neutral-800/50'
                                    }`}>
                                    <span className="text-xs font-medium text-white whitespace-nowrap">{node.label}</span>

                                    {/* Pulse Ring */}
                                    <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${node.type === 'concept' ? 'bg-purple-500' : 'bg-cyan-500'
                                        }`} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Context List */}
                    <div className="absolute right-0 top-0 bottom-0 w-80 border-l border-white/5 bg-black/20 backdrop-blur-xl p-6 overflow-y-auto">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 sticky top-0 bg-transparent">Recent Context</h3>

                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="group p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <Brain className="w-4 h-4 text-purple-400" />
                                        <span className="text-[10px] text-neutral-500">2 min ago</span>
                                    </div>
                                    <p className="text-sm text-neutral-300 line-clamp-2">
                                        Explored the relationship between vector embeddings and semantic search in Postgres...
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </main>
            <ThoughtStream />
        </div>
    );
}
