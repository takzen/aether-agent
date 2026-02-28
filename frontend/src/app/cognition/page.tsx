"use client";

import Sidebar from "@/components/Sidebar";
import { Sparkles, Brain, Zap, Shield, Eye, Lock, RefreshCw, BarChart } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CognitionPage() {
    const [persona, setPersona] = useState("Balanced");
    const [autonomy, setAutonomy] = useState(2); // 1: Manual, 2: Semi-Auto, 3: Full
    const [creativity, setCreativity] = useState(60);
    const [isReflectionEnabled, setIsReflectionEnabled] = useState(true);
    const [isCircadianLocked, setIsCircadianLocked] = useState(false);

    const personaDescriptions: Record<string, string> = {
        "Analytical": "Logic-first approach. Prioritizes code correctness and structural integrity. Minimal small talk.",
        "Balanced": "Default behavior. Adapts tone to the task at hand. Optimal mix of speed and depth.",
        "Creative": "Thinking outside the vault. Explores unconventional solutions and detailed theoretical analogies."
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">
                {/* Header — VSCode Style Sync */}
                <header className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Neural Cognition Center</h3>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>STATUS.CALIBRATING</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 text-purple-400 rounded text-[10px] transition-all uppercase tracking-widest font-bold active:scale-95">
                            <RefreshCw className="w-3.5 h-3.5" /> Commit_Neural_Config
                        </button>
                    </div>
                </header>

                {/* Main Content Area — Settings Style Sync */}
                <div className="flex-1 relative flex flex-col overflow-hidden bg-[#1e1e1e]">

                    <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-none max-w-5xl mx-auto w-full font-sans">

                        {/* Top Row: Neural Health Monitors */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-2xl bg-[#252526] border border-[#303030] hover:border-purple-500/30 transition-all group backdrop-blur-md"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                        <Brain className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Self-Reflection</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-neutral-500 italic font-sans">Autonomous overnight thinking</span>
                                    <button
                                        onClick={() => setIsReflectionEnabled(!isReflectionEnabled)}
                                        className={`w-10 h-5 rounded-full transition-colors relative ${isReflectionEnabled ? 'bg-purple-500' : 'bg-neutral-800'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isReflectionEnabled ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-2xl bg-[#252526] border border-[#303030] hover:border-blue-500/30 transition-all group backdrop-blur-md"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                        <Zap className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Neural Speed</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-neutral-500 italic font-sans">Flash model usage vs Pro</span>
                                    <span className="text-[9px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded tracking-tighter uppercase">Optimized</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 rounded-2xl bg-[#252526] border border-[#303030] hover:border-yellow-500/30 transition-all group backdrop-blur-md"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                        <Eye className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Context Eye</h4>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-neutral-500 italic font-sans">Auto project scanning</span>
                                    <span className="text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded tracking-tighter uppercase">Live</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Main Tuning Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Persona Configuration */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-purple-500/30 pl-6 py-2 bg-[#252526]/50">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Persona_Profiles</h2>
                                </div>
                                <div className="bg-[#252526] border border-[#303030] p-8 rounded-2xl space-y-8 min-h-[420px] backdrop-blur-md">
                                    <div className="flex gap-2 p-1 bg-[#1a1a1b] rounded-xl border border-white/5">
                                        {["Analytical", "Balanced", "Creative"].map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPersona(p)}
                                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${persona === p ? 'bg-purple-600 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={persona}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 10 }}
                                            className="space-y-6"
                                        >
                                            <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl border-l-4 border-l-purple-500 font-sans">
                                                <p className="text-xs text-neutral-300 leading-relaxed italic">
                                                    &quot;{personaDescriptions[persona]}&quot;
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                                                        <span>LOGICAL_DRIFT</span>
                                                        <span>{creativity}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={creativity}
                                                        onChange={(e) => setCreativity(parseInt(e.target.value))}
                                                        className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none"
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between p-4 bg-[#1a1a1b] rounded-xl border border-[#303030] hover:border-white/5 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Lock className="w-4 h-4 text-purple-400/50" />
                                                        <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider">Lock Dynamic Mood</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsCircadianLocked(!isCircadianLocked)}
                                                        className={`w-10 h-5 rounded-full transition-colors relative ${isCircadianLocked ? 'bg-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'bg-neutral-800'}`}
                                                    >
                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isCircadianLocked ? 'left-6' : 'left-1'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </section>

                            {/* Autonomy Engine */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-blue-500/30 pl-6 py-2 bg-[#252526]/50">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Autonomy_Engine</h2>
                                </div>
                                <div className="bg-[#252526] border border-[#303030] p-8 rounded-2xl space-y-6 min-h-[420px] backdrop-blur-md">
                                    <div className="space-y-4">
                                        {[
                                            { id: 1, label: "MANUAL_OVERRIDE", icon: Shield, desc: "Agent only acts on direct confirmation. High safety." },
                                            { id: 2, label: "CO-PILOT_MODE", icon: Zap, desc: "Balanced. Agent handles safe reads and analysis independently." },
                                            { id: 3, label: "FULL_AUTONOMY", icon: Sparkles, desc: "Full cognitive freedom. can modify files based on task." }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setAutonomy(opt.id)}
                                                className={`w-full p-4 rounded-xl border transition-all text-left flex items-start gap-4 ${autonomy === opt.id ? 'bg-purple-500/5 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.05)]' : 'bg-[#1a1a1b] border-white/5 hover:border-white/10 opacity-70 hover:opacity-100'}`}
                                            >
                                                <div className={`p-2 border rounded-lg shrink-0 transition-colors ${autonomy === opt.id ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' : 'bg-neutral-800/50 border-neutral-700 text-neutral-500'}`}>
                                                    <opt.icon className="w-4 h-4" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h5 className={`text-[11px] font-bold uppercase tracking-wider ${autonomy === opt.id ? 'text-white' : 'text-neutral-400'}`}>{opt.label} {autonomy === opt.id && "√"}</h5>
                                                    <p className="text-[10px] text-neutral-500 font-sans italic leading-tight">{opt.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3">
                                        <BarChart className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                        <p className="text-[10px] text-purple-400/80 leading-relaxed font-sans">
                                            Note: High autonomy requires Gemini 3.1 Pro for safety reasons. Local models throttle to Co-Pilot mode.
                                        </p>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
