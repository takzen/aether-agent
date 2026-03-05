"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Brain, MessageSquare, Terminal, Cpu, Database, Network, Moon, Sun, Activity } from "lucide-react";

const AetherLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-20" />
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" className="opacity-40" />
        <motion.path
            d="M50 20 L80 50 L50 80 L20 50 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
        />
    </svg>
);

export default function GuidePage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30">
            {/* Background Noise & Effects */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Glow Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
                <div className="max-w-[1400px] w-full mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">Main Engine</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <AetherLogo className="w-6 h-6 text-white" />
                        <span className="font-bold tracking-tighter text-lg uppercase">Documentation</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-24 px-8 border-b border-white/5">
                <div className="max-w-[1400px] mx-auto space-y-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]"
                    >
                        Decoding <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 text-nowrap">The Aether Core.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-neutral-400 font-light leading-relaxed max-w-2xl"
                    >
                        Technical breakdown of the Aether Agent architecture, cognitive engine, and persistent memory systems.
                    </motion.p>
                </div>
            </header>

            {/* Content Sections */}
            <main className="relative z-10 max-w-[1400px] w-full mx-auto px-8 py-32 space-y-40">

                {/* 1. Architecture Section */}
                <section id="architecture" className="space-y-12">
                    <div className="max-w-5xl space-y-6">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-purple-500 uppercase">01. Architecture</h2>
                        <h3 className="text-4xl font-bold tracking-tight">The Neural Stack.</h3>
                        <p className="text-neutral-400 leading-relaxed text-lg font-light">
                            Aether operates on a multi-layered memory and processing architecture. It bridges the gap between stateful persistence and high-speed neural processing.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl bg-[#050505] border border-white/5 space-y-2 hover:border-white/10 transition-colors">
                            <span className="text-white font-bold text-sm block">Vector Memory (Qdrant)</span>
                            <p className="text-sm text-neutral-500">Stores semantic memories and indexed knowledge base documents as High-Dimensional embeddings.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-[#050505] border border-white/5 space-y-2 hover:border-white/10 transition-colors">
                            <span className="text-white font-bold text-sm block">Relational Core (SQLite)</span>
                            <p className="text-sm text-neutral-500">Logs, session history, and the Concept Constellation graph that links facts into logical structures.</p>
                        </div>
                    </div>
                </section>

                {/* 2. Cognition Section */}
                <section id="cognition" className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-cyan-500 uppercase">02. Neuromorphic Cognition</h2>
                        <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Digital Circadian Rhythm.</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { time: "05:00 - 12:00", name: "Strategist", desc: "Focus on strategic planning and architecture review.", icon: Sun },
                            { time: "12:00 - 18:00", name: "Executor", desc: "Maximizes technical precision and code execution speed.", icon: Zap },
                            { time: "18:00 - 23:00", name: "Philosopher", desc: "Deep refactoring and high-level theoretical analysis.", icon: Brain },
                            { time: "23:00 - 05:00", name: "Maintainer", desc: "Focus on stability, minimalism, and system integrity.", icon: Moon }
                        ].map((cycle, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-[#050505] border border-white/5 space-y-4 hover:border-cyan-500/30 transition-all group">
                                <cycle.icon className="w-6 h-6 text-neutral-700 group-hover:text-cyan-400 transition-colors" />
                                <div className="space-y-1">
                                    <span className="text-[10px] font-mono text-neutral-600 block">{cycle.time}</span>
                                    <h4 className="font-bold text-white uppercase text-xs tracking-widest">{cycle.name}</h4>
                                </div>
                                <p className="text-neutral-500 text-xs leading-relaxed font-light">{cycle.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. Features Breakdown */}
                <section id="features" className="space-y-20">
                    <div className="max-w-5xl space-y-6">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-purple-500 uppercase">03. Advanced Systems</h2>
                        <h3 className="text-4xl font-bold tracking-tight">Beyond The Chatbot.</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex gap-6">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                    <Network className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg text-white">Active World Model (AWM)</h4>
                                    <p className="text-neutral-400 font-light leading-relaxed">
                                        Proactivity engine that cyclically analyzes system logs and interaction history to generate "System Insights" and detect project conflicts automatically.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg text-white">Modular Skills System</h4>
                                    <p className="text-neutral-400 font-light leading-relaxed">
                                        Skill instructions and triggers are stored in the Relational Core, allowing for dynamic context injection and optimized token usage without code changes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-6">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Moon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg text-white">Sleep Cycle Consolidation</h4>
                                    <p className="text-neutral-400 font-light leading-relaxed">
                                        Knowledge optimization process that distills daily session logs into long-term semantic shards during periods of system inactivity.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-pink-400" />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-lg text-white">Autonomy Engine / HITL</h4>
                                    <p className="text-neutral-400 font-light leading-relaxed">
                                        Three-level trust scale (Manual, Co-Pilot, Full Autonomy) with a strict Human-in-the-Loop system for critical file-system modifications.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Terminal Commands */}
                <section id="commands" className="space-y-12">
                    <div className="max-w-5xl space-y-6">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-green-500 uppercase">04. Terminal Commands</h2>
                        <h3 className="text-4xl font-bold tracking-tight">Dashboard Interceptor.</h3>
                        <p className="text-neutral-400 leading-relaxed text-lg font-light">
                            The terminal in the Aether Dashboard is a powerful diagnostic tool. Slash commands are interpreted locally by the Interceptor.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { cmd: "/logs [limit]", desc: "Displays the latest entries from the system event log.", usage: "Error diagnostics, viewing recent Agent actions." },
                            { cmd: "/clear", desc: "Clears all history visible in the terminal window.", usage: "Tidying up the workspace before a new task." },
                            { cmd: "/logclear", desc: "Permanently deletes all telemetry history from the database.", usage: "Refreshing the logs database. Irreversible." },
                            { cmd: "/simulate", desc: "Launches the Active World Model (AWM).", usage: "Generates proactive insights from the last 30 minutes." }
                        ].map((item, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-[#050505] border border-white/5 space-y-4 hover:border-white/10 transition-colors">
                                <div className="inline-flex px-3 py-1 rounded bg-green-500/10 border border-green-500/20 font-mono text-sm text-green-400">
                                    {item.cmd}
                                </div>
                                <p className="text-neutral-400 text-sm font-light leading-relaxed">{item.desc}</p>
                                <div className="text-[11px] text-neutral-500 font-mono uppercase tracking-widest"><span className="text-white/30">Usage:</span> {item.usage}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. API Reference */}
                <section id="api" className="space-y-12">
                    <div className="max-w-5xl space-y-6">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-orange-500 uppercase">05. API Reference</h2>
                        <h3 className="text-4xl font-bold tracking-tight">REST Endpoints.</h3>
                        <p className="text-neutral-400 leading-relaxed text-lg font-light">
                            The Aether backend exposes a heavily documented FastAPI REST interface. Below are the key endpoints for system integration.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { method: "POST", path: "/chat/stream", desc: "Primary streaming endpoint (NDJSON). Applies live cognition settings." },
                            { method: "GET", path: "/cognition/settings", desc: "Returns runtime parameters for persona, autonomy, and creativity." },
                            { method: "POST", path: "/system/simulate", desc: "Triggers the AWM simulation loop externally." },
                            { method: "POST", path: "/knowledge/vision-index/{file}", desc: "Multimodal vision indexing mapping PDF pages into the vector store." },
                            { method: "GET", path: "/cron/tasks", desc: "Lists available automated background task handlers." }
                        ].map((api, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#050505] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                <div className="flex items-center gap-3 shrink-0 sm:w-64">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${api.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                        api.method === 'POST' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            api.method === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        }`}>
                                        {api.method}
                                    </span>
                                    <span className="font-mono text-sm text-white">{api.path}</span>
                                </div>
                                <p className="text-sm text-neutral-500 font-light">{api.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-8 flex flex-col items-center gap-6">
                <div className="text-[10px] text-neutral-700 font-mono uppercase tracking-[0.2em]">
                    &copy; 2026 AETHER
                </div>
            </footer>
        </div>
    );
}
