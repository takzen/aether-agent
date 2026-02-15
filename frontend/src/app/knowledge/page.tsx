"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Search, FileText, Upload, Filter, ExternalLink, Globe, Code } from "lucide-react";
import { motion } from "framer-motion";

const knowledgeItems = [
    { id: 1, type: "doc", title: "Project Aether Specs.pdf", added: "2 hours ago", size: "2.4 MB", icon: FileText },
    { id: 2, type: "web", title: "Supabase Vector Documentation", added: "Yesterday", url: "supabase.com/docs", icon: Globe },
    { id: 3, type: "code", title: "backend/agent.py", added: "3 days ago", lines: 450, icon: Code },
    { id: 4, type: "doc", title: "Meeting Notes - Q1 Roadmap", added: "1 week ago", size: "15 KB", icon: FileText },
    { id: 5, type: "web", title: "Gemini API Reference", added: "2 weeks ago", url: "ai.google.dev", icon: Globe },
];

export default function KnowledgeBase() {
    return (
        <div className="flex h-screen bg-[#1e1e1e] overflow-hidden font-sans text-foreground">

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">

                {/* Header — Aligned with Dashboard Style */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Knowledge Base</h1>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.KNOWLEDGE_CORE</span>
                                <span className="text-neutral-700">|</span>
                                <span>5 SOURCES ACTIVE</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono transition-colors flex items-center gap-2 text-neutral-400">
                            <Filter className="w-3.5 h-3.5" /> FILTER
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[11px] font-mono font-bold text-purple-400 transition-colors flex items-center gap-2">
                            <Upload className="w-3.5 h-3.5" /> ADD_SOURCE
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">

                    {/* Search Bar — VSCode Style */}
                    <div className="relative max-w-2xl bg-[#252526] border border-[#3c3c3c] rounded-xl px-4 py-3 focus-within:border-[#007acc]/50 transition-all flex items-center gap-3">
                        <span className="text-[#858585] font-mono text-[10px] font-bold shrink-0">QUERY_CORE:</span>
                        <input
                            type="text"
                            className="bg-transparent w-full text-[#cccccc] font-mono text-sm placeholder:text-[#858585] focus:outline-none"
                            placeholder="Explore documents, code, or neural nodes..."
                        />
                        <Search className="h-4 w-4 text-[#858585]" />
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {knowledgeItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative p-5 rounded-2xl bg-[#252526] border border-[#303030] hover:bg-[#2d2d2d] hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg">
                                    <ExternalLink className="w-3 h-3 text-purple-400" />
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 transition-colors shrink-0">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[13px] font-bold text-neutral-200 mb-1 line-clamp-1 group-hover:text-white transition-colors uppercase tracking-tight tracking-wide">{item.title}</h3>
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                                            <span className="text-purple-400/60">{item.type.toUpperCase()}</span>
                                            <span className="text-neutral-700">•</span>
                                            <span>{item.added.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {item.type === 'web' && (
                                    <div className="text-[10px] text-blue-400/60 truncate font-mono bg-blue-500/5 px-2 py-1 rounded inline-block mt-2">
                                        {item.url}
                                    </div>
                                )}
                                {item.type === 'doc' && (
                                    <div className="text-[10px] text-neutral-500 font-mono bg-white/5 px-2 py-1 rounded inline-block mt-2">
                                        SIZE: {item.size}
                                    </div>
                                )}
                                {item.type === 'code' && (
                                    <div className="text-[10px] text-green-400/60 font-mono bg-green-500/5 px-2 py-1 rounded inline-block mt-2">
                                        LINES: {item.lines}
                                    </div>
                                )}

                                {/* Card Status Strip */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}

                        {/* Connection Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-5 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-3 text-neutral-600 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer min-h-[140px]"
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-[11px] font-mono uppercase tracking-widest font-bold">Connect_Core_Source</span>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom Status Bar — Matches Dashboard */}
                <div className="flex items-center justify-between px-6 py-2 border-t border-white/5 bg-black/40 text-[10px] font-mono text-neutral-600 uppercase tracking-widest shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span>KNOWLEDGE_NODE: STABLE</span>
                        </div>
                        <span className="text-neutral-800">|</span>
                        <span>LATENCY: 0.8MS</span>
                    </div>
                    <span>aether.core_stable_v1.0.4</span>
                </div>

            </main>
            <ThoughtStream />
        </div>
    );
}
