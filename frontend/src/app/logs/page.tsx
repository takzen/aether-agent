"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Terminal, AlertCircle, CheckCircle, Info, Hash, Clock, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const mockLogs = [
    { id: 1, type: "info", timestamp: "14:20:05.120", message: "System initialized. Core modules loaded.", source: "main.py" },
    { id: 2, type: "info", timestamp: "14:20:05.340", message: "Connecting to Supabase instance...", source: "database.py" },
    { id: 3, type: "success", timestamp: "14:20:05.890", message: "Database connection established (Pool: 5/10)", source: "database.py" },
    { id: 4, type: "info", timestamp: "14:20:06.010", message: "Loading vector index 'memories_embedding_idx'...", source: "vector_store.py" },
    { id: 5, type: "warning", timestamp: "14:20:06.450", message: "Index rebuild recommended. Fragmentation > 15%", source: "maintenance_worker" },
    { id: 6, type: "info", timestamp: "14:20:08.110", message: "Agent 'Gemini-Pro' listening on port 8000", source: "server.py" },
    { id: 7, type: "error", timestamp: "14:22:15.300", message: "Rate limit warning: 45 req/min aimed at Google API", source: "llm_client.py" },
    { id: 8, type: "info", timestamp: "14:22:16.000", message: "Backoff strategy applied. Retrying in 200ms...", source: "llm_client.py" },
    { id: 9, type: "success", timestamp: "14:22:16.250", message: "Request successful. Context tokens: 4096", source: "llm_client.py" },
];

export default function AgentLogs() {
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground font-mono">
            {/* CINEMATIC BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-sans">System Logs</h1>
                        <p className="text-sm text-neutral-400 font-sans">Real-time execution trace & debugging.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
                            <AlertCircle className="w-3 h-3" /> 1 Error
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-500">
                            <AlertCircle className="w-3 h-3" /> 1 Warning
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-500">
                            <CheckCircle className="w-3 h-3" /> System OK
                        </div>
                    </div>
                </div>

                {/* Logs Terminal */}
                <div className="flex-1 overflow-y-auto bg-[#0a0a0a]/90 p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="space-y-1">
                        {mockLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 hover:bg-white/5 p-1 rounded transition-colors group text-xs md:text-sm">
                                <span className="text-neutral-500 w-24 shrink-0">{log.timestamp}</span>

                                <span className={`w-20 shrink-0 font-bold ${log.type === 'info' ? 'text-blue-400' :
                                        log.type === 'success' ? 'text-green-400' :
                                            log.type === 'warning' ? 'text-yellow-400' : 'text-red-500'
                                    }`}>
                                    [{log.type.toUpperCase()}]
                                </span>

                                <span className="flex-1 text-neutral-300 group-hover:text-white transition-colors break-all">
                                    {log.message}
                                </span>

                                <span className="text-neutral-600 w-32 text-right shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {log.source}
                                </span>
                            </div>
                        ))}
                        {/* Typing Cursor */}
                        <div className="flex gap-4 p-1 animate-pulse">
                            <span className="text-neutral-500 w-24 shrink-0">14:23:01.005</span>
                            <span className="text-blue-400 w-20 shrink-0 font-bold">[INFO]</span>
                            <span className="text-neutral-300">_</span>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="h-12 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center px-6 gap-6 text-[10px] text-neutral-500 font-sans uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> CPU: 12%
                    </div>
                    <div className="flex items-center gap-2">
                        <Hash className="w-3 h-3" /> PID: 8392
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Uptime: 4h 21m
                    </div>
                </div>

            </main>
        </div>
    );
}
