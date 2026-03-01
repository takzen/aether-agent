"use client";

import Sidebar from "@/components/Sidebar";
import { Sparkles, Brain, Zap, Shield, Eye, Lock, RefreshCw, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CognitionPage() {
    const [persona, setPersona] = useState("Balanced");
    const [autonomy, setAutonomy] = useState(2); // 1: Manual, 2: Semi-Auto, 3: Full
    const [creativity, setCreativity] = useState(60);
    const [isReflectionEnabled, setIsReflectionEnabled] = useState(true);
    const [isCircadianLocked, setIsCircadianLocked] = useState(false);
    const [customDirectives, setCustomDirectives] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const personaDescriptions: Record<string, string> = {
        "Analytical": "Logic-first approach. Prioritizes code correctness and structural integrity. Minimal small talk.",
        "Balanced": "Default behavior. Adapts tone to the task at hand. Optimal mix of speed and depth.",
        "Creative": "Thinking outside the vault. Explores unconventional solutions and detailed theoretical analogies."
    };

    const autonomyOptions = [
        { id: 1, label: "Manual Approval", icon: Shield, desc: "Agent only acts on direct confirmation. High safety." },
        { id: 2, label: "Co-Pilot", icon: Zap, desc: "Balanced. Agent handles safe reads and analysis independently." },
        { id: 3, label: "Full Autonomy", icon: Sparkles, desc: "Danger zone active. Full cognitive freedom, including file changes without approval." }
    ] as const;

    const autonomyClasses: Record<number, { active: string; icon: string; accent: string }> = {
        1: {
            active: "bg-cyan-500/5 border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.2)] opacity-100",
            icon: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
            accent: "text-cyan-400"
        },
        2: {
            active: "bg-purple-500/5 border-purple-500/30 shadow-[0_0_20px_rgba(0,0,0,0.2)] opacity-100",
            icon: "bg-purple-500/20 border-purple-500/30 text-purple-400",
            accent: "text-purple-500"
        },
        3: {
            active: "bg-rose-500/5 border-rose-500/30 shadow-[0_0_20px_rgba(0,0,0,0.2)] opacity-100",
            icon: "bg-rose-500/20 border-rose-500/30 text-rose-400",
            accent: "text-rose-500"
        }
    };

    // Load settings from backend
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch("http://localhost:8000/cognition/settings");
                const data = await response.json();
                if (data.status === "success") {
                    setPersona(data.settings.persona);
                    setAutonomy(data.settings.autonomy);
                    setCreativity(data.settings.creativity);
                    setIsReflectionEnabled(data.settings.reflection);
                    setIsCircadianLocked(data.settings.circadian_lock);
                    setCustomDirectives(data.settings.custom_directives || "");
                }
            } catch (error) {
                console.error("Failed to fetch cognition settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleCommit = async () => {
        setIsSaving(true);
        try {
            const response = await fetch("http://localhost:8000/cognition/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    persona,
                    autonomy,
                    creativity,
                    reflection: isReflectionEnabled,
                    circadian_lock: isCircadianLocked,
                    custom_directives: customDirectives
                })
            });
            const data = await response.json();
            if (data.status === "success") {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save cognition settings:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePersonaChange = (p: string) => {
        setPersona(p);
        // Automatically calibrate Logical Drift (Temperature) based on persona
        if (p === "Analytical") setCreativity(15);
        else if (p === "Balanced") setCreativity(60);
        else if (p === "Creative") setCreativity(95);
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">
                {/* Header — VSCode Style Sync */}
                <header className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Cognition</h3>
                            <p className="text-[10px] text-neutral-500 font-mono">Tune persona, autonomy and cognitive behavior parameters</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleCommit}
                            disabled={isSaving || isLoading}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${autonomy === 3
                                ? 'border-rose-500/40 text-rose-300 hover:bg-rose-500/10'
                                : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10'
                                }`}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                            {isSaving ? "Saving..." : "Save Cognition Settings"}
                        </button>
                    </div>
                </header>

                {/* Main Content Area — Settings Style Sync */}
                <div className="flex-1 relative flex flex-col overflow-hidden bg-[#1e1e1e]">


                    <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-none max-w-5xl mx-auto w-full font-sans">

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                                <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Hydrating Synaptic Pathways...</span>
                            </div>
                        ) : (
                            <>
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
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-mono text-neutral-500">{isReflectionEnabled ? "On" : "Off"}</span>
                                                <button
                                                    onClick={() => setIsReflectionEnabled(!isReflectionEnabled)}
                                                    className={`w-12 h-6 rounded-full transition-all duration-500 relative shadow-inner overflow-hidden ${isReflectionEnabled ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-[#1a1a1b] border border-white/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg transition-all duration-500 ease-out flex items-center justify-center ${isReflectionEnabled ? 'left-7' : 'left-1'}`}>
                                                        {isReflectionEnabled && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />}
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="p-6 rounded-2xl bg-[#252526] border border-[#303030] hover:border-cyan-500/30 transition-all group backdrop-blur-md"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
                                                <Zap className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Neural Speed</h4>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-neutral-500 italic font-sans">Flash model usage vs Pro</span>
                                            <span className="text-[9px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded tracking-tighter uppercase">Optimized</span>
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
                                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Persona Profiles</h2>
                                        </div>
                                        <div className="bg-[#252526] border border-[#303030] p-8 rounded-2xl space-y-8 min-h-[420px] backdrop-blur-md shadow-xl">
                                            <div className="flex gap-2 p-1 bg-[#1a1a1b] rounded-xl border border-white/5">
                                                {["Analytical", "Balanced", "Creative"].map((p) => (
                                                    <button
                                                        key={p}
                                                        onClick={() => handlePersonaChange(p)}
                                                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${persona === p ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-neutral-500 hover:text-neutral-300'}`}
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
                                                    <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl border-l-4 border-l-purple-500 font-sans shadow-inner">
                                                        <p className="text-[11px] text-neutral-300 leading-relaxed italic">
                                                            &quot;{personaDescriptions[persona]}&quot;
                                                        </p>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <div className="flex flex-col gap-4 p-4 bg-[#1a1a1b] rounded-xl border border-[#303030] hover:border-white/5 transition-colors group">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Lock className={`w-4 h-4 transition-colors ${isCircadianLocked ? 'text-blue-400' : 'text-neutral-600'}`} />
                                                                    <span className="text-[10px] text-neutral-400 font-sans uppercase tracking-wider">Digital Circadian Rhythm</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-mono text-neutral-500">{isCircadianLocked ? "On" : "Off"}</span>
                                                                    <button
                                                                        onClick={() => setIsCircadianLocked(!isCircadianLocked)}
                                                                        className={`w-10 h-5 rounded-full transition-colors relative ${isCircadianLocked ? 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'bg-neutral-800'}`}
                                                                    >
                                                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isCircadianLocked ? 'left-6' : 'left-1'}`} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-[9px] text-neutral-500 font-sans leading-relaxed border-t border-white/5 pt-3">
                                                                {isCircadianLocked
                                                                    ? "Cycle locked: Agent keeps a stable technical mode regardless of time."
                                                                    : "Cycle active: Personality flows dynamically (Strategist AM, Executor day, Philosopher PM)."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </AnimatePresence>

                                            {/* Custom Neural Handlers */}
                                            <section className="pt-4 space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Custom Directives</h3>
                                                </div>
                                                <textarea
                                                    value={customDirectives}
                                                    onChange={(e) => setCustomDirectives(e.target.value)}
                                                    placeholder="Enter additional instructions for style, tone, or specific rules (e.g., 'Always use medical analogies' or 'Be extremely polite')..."
                                                    className="w-full h-32 bg-[#1a1a1b] border border-white/5 rounded-xl p-4 text-[11px] text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none font-sans leading-relaxed"
                                                />
                                            </section>
                                        </div>
                                    </section>

                                    {/* Autonomy Engine */}
                                    <section className="space-y-6">
                                        <div className="flex items-center justify-between border-l-2 border-cyan-500/30 pl-6 py-2 bg-[#252526]/50">
                                            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Autonomy Engine</h2>
                                        </div>
                                        <div className="bg-[#252526] border border-[#303030] p-8 rounded-2xl space-y-4 min-h-[420px] backdrop-blur-md shadow-xl">
                                            {autonomyOptions.map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setAutonomy(opt.id)}
                                                    className={`w-full min-h-[100px] p-4 rounded-xl border transition-all duration-300 text-left flex items-start gap-4 ${autonomy === opt.id
                                                        ? autonomyClasses[opt.id].active
                                                        : 'bg-[#1a1a1b] border-white/5 hover:border-white/10 opacity-60 hover:opacity-90'}`}
                                                >
                                                    <div className={`p-2 border rounded-lg shrink-0 transition-colors ${autonomy === opt.id
                                                        ? autonomyClasses[opt.id].icon
                                                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-500'}`}>
                                                        <opt.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h5 className={`text-[11px] font-bold tracking-wide ${autonomy === opt.id ? 'text-white' : 'text-neutral-300'}`}>
                                                            {opt.label} {autonomy === opt.id && <span className={`ml-1 ${autonomyClasses[opt.id].accent} font-black text-xs`}>!!!</span>}
                                                        </h5>
                                                        <p className="text-[9px] text-neutral-500 font-sans italic leading-tight">{opt.desc}</p>
                                                    </div>
                                                </button>
                                            ))}

                                            <div className={`mt-4 p-4 rounded-xl transition-all duration-500 flex items-start gap-4 border ${autonomy === 3
                                                ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse'
                                                : autonomy === 2
                                                    ? 'bg-purple-500/5 border-purple-500/10'
                                                    : 'bg-cyan-500/5 border-cyan-500/10'
                                                }`}>
                                                <div className={`p-2 rounded-lg shrink-0 ${autonomy === 3 ? 'bg-rose-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                                                    <Shield className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h6 className={`text-[9px] font-black uppercase tracking-widest ${autonomy === 3 ? 'text-rose-400' : 'text-neutral-400'}`}>
                                                        {autonomy === 3 ? "Critical System Warning" : "Safety Protocol Insights"}
                                                    </h6>
                                                    <p className={`text-[10px] font-sans leading-relaxed ${autonomy === 3 ? 'text-rose-200/80 font-bold' : 'text-neutral-500'}`}>
                                                        {autonomy === 3
                                                            ? "WARNING: Full Autonomy mode allows me to modify code without your explicit approval. Please use only in trusted environments. All changes are logged."
                                                            : "In Levels 1 and 2, I will always ask for your confirmation before writing any changes to files."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Notification Toast */}
                    <AnimatePresence>
                        {showToast && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="fixed bottom-10 right-10 bg-[#181818] border border-emerald-500/30 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-4 z-[9999] backdrop-blur-xl"
                            >
                                <div className="p-2 bg-emerald-500/10 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-bold text-white uppercase tracking-widest">Neural Calibration Successful</h4>
                                    <p className="text-[10px] text-neutral-500 italic mt-0.5">Aether Core updated with new cognitive directives.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
