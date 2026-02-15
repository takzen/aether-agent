"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { User, Lock, Bell, Moon, Database, LogOut, ChevronRight, Shield, Cpu, Zap, Clock, Save, Settings2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Settings() {
    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex h-screen bg-[#020202] overflow-hidden font-mono text-neutral-400 select-none">
            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10 border-l border-white/5">

                {/* Header — Tactical Dashboard Style */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Neural System Configuration</h1>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.CONFIG_V4</span>
                                <span className="text-neutral-700">|</span>
                                <span>LAST_MODIFIED: 15.02.2026</span>
                                <span className="text-neutral-700">|</span>
                                <span className="text-green-500/80">ENCRYPTION: AES-256</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded hover:bg-purple-500/20 text-[10px] text-purple-400 transition-all uppercase tracking-widest font-bold">
                            <Save className="w-3.5 h-3.5" /> Commit_Changes
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative flex flex-col overflow-hidden bg-[#020202]">

                    {/* Tactical Elements */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.03] via-transparent to-blue-500/[0.03] pointer-events-none" />

                    <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-none max-w-5xl mx-auto w-full">

                        {/* Section: Operator Profile */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-l-2 border-purple-500/30 pl-6 py-2 bg-white/[0.01]">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Operator_ID</h2>
                                <span className="text-[9px] text-neutral-700">UUID: 8F2D-4B1A-9C3E-7L0P</span>
                            </div>

                            <div className="flex items-center gap-8 bg-white/[0.02] border border-white/5 p-8 rounded-2xl backdrop-blur-md">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600/20 to-blue-600/20 border border-white/10 flex items-center justify-center p-1">
                                        <div className="w-full h-full bg-[#050505] rounded-xl flex items-center justify-center text-3xl font-bold text-white font-sans group-hover:scale-95 transition-transform duration-500 shadow-2xl">TK</div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center border border-black group-hover:rotate-12 transition-transform cursor-pointer">
                                        <Settings2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">Takzen <span className="text-purple-500 text-xs ml-2 opacity-50 px-2 py-0.5 border border-purple-500/20 rounded">PRO_MEMBER</span></h3>
                                    <p className="text-sm text-neutral-500 font-mono uppercase tracking-tighter">Active Sequence: 1,492 Days • System Integrity: 99.8%</p>
                                    <div className="flex gap-4 pt-4">
                                        <button className="text-[10px] text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded border border-white/5">Update_Vitals</button>
                                        <button className="text-[10px] text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1.5 uppercase tracking-widest border border-red-500/10 px-2.5 py-1 rounded">Terminate_Session</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Section: AI Configuration */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-blue-500/30 pl-6 py-2 bg-white/[0.01]">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Intelligence_Params</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blue-500/20 transition-all group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg"><Database className="w-5 h-5 text-blue-400" /></div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Neural Model Cluster</h4>
                                                <p className="text-[10px] text-neutral-500">GEMINI_3_ULTRA (CLOUD_SYNC)</p>
                                            </div>
                                        </div>
                                        <button className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] uppercase font-bold text-neutral-400 hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/30 transition-all flex items-center justify-center gap-2">
                                            Switch_Core <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-green-500/20 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-green-500/10 rounded-lg"><Shield className="w-5 h-5 text-green-400" /></div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Local Privacy Shield</h4>
                                                <p className="text-[10px] text-neutral-500">HYBRID_OVERRIDE: ENABLED</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-5 bg-green-500/20 border border-green-500/30 rounded-full flex items-center px-1">
                                            <div className="w-3 h-3 bg-green-500 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section: System Telemetry */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-yellow-500/30 pl-6 py-2 bg-white/[0.01]">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">System_Telemetry</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-yellow-500/20 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg"><Bell className="w-5 h-5 text-yellow-400" /></div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Interface Alerts</h4>
                                                <p className="text-[10px] text-neutral-500">HAPTIC & AUDIO_GATES: ON</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-5 bg-yellow-500/20 border border-yellow-500/30 rounded-full flex items-center justify-end px-1">
                                            <div className="w-3 h-3 bg-yellow-400 rounded-sm" />
                                        </div>
                                    </div>

                                    <div className="p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:border-purple-500/20 transition-all flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform"><Zap className="w-5 h-5 text-purple-400" /></div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Performance Mode</h4>
                                                <p className="text-[10px] text-neutral-500">LATENCY_OPTIMIZER_X4</p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-5 bg-white/5 border border-white/10 rounded-full flex items-center px-1">
                                            <div className="w-3 h-3 bg-white/20 rounded-sm" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Bottom Status Bar — Tactical Style */}
                <div className="flex items-center justify-between px-6 py-2 border-t border-white/5 bg-black/60 text-[10px] font-mono text-neutral-600 uppercase tracking-widest shrink-0 z-50">
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
            <ThoughtStream />
        </div>
    );
}
