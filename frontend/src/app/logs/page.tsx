"use client";

import Sidebar from "@/components/Sidebar";
import { AlertCircle, CheckCircle2, Hash, Clock, Cpu, Zap, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Log {
    id: number;
    type: string;
    source: string;
    message: string;
    timestamp: string;
}

export default function AgentLogs() {
    const [currentTime, setCurrentTime] = useState("");
    const [logs, setLogs] = useState<Log[]>([]);
    const [filter, setFilter] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");

    const fetchLogs = async () => {
        try {
            const res = await fetch("http://localhost:8000/logs");
            const data = await res.json();
            if (data.status === "success") {
                setLogs(data.logs);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLogs();
        const logsInterval = setInterval(fetchLogs, 3000); // Poll every 3 seconds

        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
        }, 1000);
        return () => {
            clearInterval(timer);
            clearInterval(logsInterval);
        };
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(filter.toLowerCase()) ||
            log.source.toLowerCase().includes(filter.toLowerCase());
        const matchesTab = activeTab === "ALL" || log.source === activeTab;
        return matchesSearch && matchesTab;
    });

    const formatTime = (ts: string) => {
        if (!ts) return "--:--:--";
        try {
            // SQLite timestamp is usually YYYY-MM-DD HH:MM:SS
            const date = new Date(ts.replace(" ", "T"));
            if (isNaN(date.getTime())) return ts;
            return date.toLocaleTimeString('en-GB', { hour12: false }) + "." + String(date.getMilliseconds()).padStart(3, '0');
        } catch {
            return ts;
        }
    };



    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 border-l border-[#303030] select-none">

                {/* Header — VSCode Style */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white uppercase">System Execution Logs</h1>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.KERNEL_LOGS</span>
                                <span className="text-neutral-700">|</span>
                                <span>PID: 8392</span>
                                <span className="text-neutral-700">|</span>
                                <span>TRACE_STATUS: ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1.5 px-2.2 py-0.5 rounded border border-red-500/10 bg-red-500/5 text-red-500/80 text-[10px]">
                                <AlertCircle className="w-3 h-3" /> 1_ERR
                            </div>
                            <div className="flex items-center gap-1.5 px-2.2 py-0.5 rounded border border-yellow-500/10 bg-yellow-500/5 text-yellow-500/80 text-[10px]">
                                <AlertCircle className="w-3 h-3" /> 1_WARN
                            </div>
                            <div className="flex items-center gap-1.5 px-2.2 py-0.5 rounded border border-green-500/10 bg-green-500/5 text-green-500 text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> SYSTEM_OK
                            </div>
                        </div>
                        <div className="text-[10px] text-neutral-600 border-l border-white/10 pl-6 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {currentTime}
                        </div>
                    </div>
                </div>

                {/* Main Content Area — VSCode Editor Style */}
                <div className="flex-1 relative flex flex-col overflow-hidden bg-[#1e1e1e]">

                    {/* Tactical Elements (Removed for clarity/VSCode aesthetic) */}


                    {/* Filter Bar */}
                    <div className="px-6 py-2 border-b border-[#303030] bg-[#252526] flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-md px-2.5 py-1 focus-within:border-[#007acc]/50 transition-all">
                                <Search className="w-3 h-3 text-[#858585]" />
                                <input
                                    type="text"
                                    placeholder="Filter logs..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="bg-transparent border-none text-[10px] text-[#cccccc] focus:ring-0 w-32 placeholder:text-[#858585] focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] text-neutral-600 uppercase">Sources:</span>
                                <div className="flex gap-1">
                                    {['ALL', 'CORE', 'MEM', 'NET', 'WEB'].map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setActiveTab(tag)}
                                            className={`text-[9px] px-1.5 py-0.5 rounded transition-all ${activeTab === tag ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-neutral-600 hover:text-neutral-400'}`}>
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <span className="text-[9px] text-neutral-600">LIVE_TELEMETRY: ON</span>
                    </div>

                    {/* Logs Container */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-1 font-mono text-[11px] relative scrollbar-none">
                        {filteredLogs.map((log, idx) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                                className="group flex gap-4 py-1 border-l border-white/5 pl-4 hover:border-purple-500/30 hover:bg-white/[0.02] transition-all cursor-crosshair"
                            >
                                <span className="text-neutral-600 w-24 shrink-0 select-none">{formatTime(log.timestamp)}</span>
                                <span className={`w-20 shrink-0 font-bold ${log.type === 'info' ? 'text-blue-500/70' :
                                    log.type === 'success' ? 'text-green-500/70' :
                                        log.type === 'warning' ? 'text-yellow-500/70' : 'text-red-500/70'
                                    }`}>
                                    {log.type.toUpperCase()}
                                </span>
                                <span className="flex-1 text-neutral-400 group-hover:text-neutral-200 transition-colors">
                                    {log.message}
                                </span>
                                <span className="text-[9px] text-neutral-700 uppercase tracking-tighter shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <Hash className="w-2.5 h-2.5" /> {log.source}
                                </span>
                            </motion.div>
                        ))}

                        {/* Animated Cursor Entry */}
                        <div className="flex gap-4 py-1 border-l border-white/5 pl-4 opacity-50">
                            <span className="text-neutral-600 w-24 shrink-0">{currentTime}.995</span>
                            <span className="text-blue-500/50 w-20 shrink-0 font-bold uppercase tracking-widest">TRACE</span>
                            <span className="flex items-center gap-1">
                                <span className="text-neutral-500 italic">Listening for system events</span>
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                    className="w-1.5 h-3 bg-purple-500/50"
                                />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom Status Bar — VSCode Style */}
                <div className="flex items-center justify-between px-6 py-2 border-t border-[#303030] bg-[#181818] text-[10px] font-mono text-neutral-500 uppercase tracking-widest shrink-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span>NODE_INFRA: CONNECTED</span>
                        </div>
                        <span className="text-neutral-800">|</span>
                        <div className="flex items-center gap-2">
                            <Cpu className="w-3 h-3 text-neutral-700" />
                            <span>CPU: 12%</span>
                        </div>
                        <span className="text-neutral-800">|</span>
                        <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3 text-neutral-700" />
                            <span>UPTIME: 4H 21M</span>
                        </div>
                    </div>
                    <span>aether.core_stable_v1.0.4</span>
                </div>

            </main>
        </div>
    );
}
