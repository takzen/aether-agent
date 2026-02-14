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
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
            {/* CINEMATIC BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Knowledge Base</h1>
                        <p className="text-sm text-neutral-400">Manage external data sources and documents.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm font-medium transition-colors flex items-center gap-2 text-neutral-300">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Add Source
                        </button>
                    </div>
                </div>

                {/* Search & Grid */}
                <div className="flex-1 overflow-y-auto p-8">

                    {/* Search Bar */}
                    <div className="relative mb-8 max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-neutral-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-white/10 transition-all font-light"
                            placeholder="Search documents, code snippets, and web pages..."
                        />
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {knowledgeItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink className="w-4 h-4 text-neutral-400" />
                                </div>

                                <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center mb-4 border border-white/5 text-neutral-300 group-hover:text-white transition-colors">
                                    <item.icon className="w-5 h-5" />
                                </div>

                                <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">{item.title}</h3>

                                <div className="flex items-center justify-between text-xs text-neutral-500 mt-4">
                                    <span className="uppercase tracking-wider font-semibold">{item.type}</span>
                                    <span>{item.added}</span>
                                </div>

                                {item.type === 'web' && (
                                    <div className="mt-2 text-xs text-cyan-400/80 truncate font-mono">{item.url}</div>
                                )}
                                {item.type === 'doc' && (
                                    <div className="mt-2 text-xs text-neutral-600 font-mono">{item.size}</div>
                                )}

                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] group-hover:animate-shine pointer-events-none" />
                            </motion.div>
                        ))}

                        {/* Add New Placeholder */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-neutral-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all cursor-pointer min-h-[200px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <Upload className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-medium">Connect New Data Source</span>
                        </motion.div>
                    </div>

                </div>

            </main>
            <ThoughtStream />
        </div>
    );
}

// Add this to tailwind layer later if needed, simulating with keyframes effectively or just a simple transition
