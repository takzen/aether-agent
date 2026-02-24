"use client";

import Sidebar from "@/components/Sidebar";
import { Database, Cpu, Save, Globe } from "lucide-react";
import { useState, useEffect } from "react";

export default function Settings() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTime, setCurrentTime] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        GEMINI_API_KEY: "",
        TAVILY_API_KEY: "",
        QDRANT_URL: "",
        QDRANT_API_KEY: "",
        MODEL_OVERRIDE: ""
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
        }, 1000);

        // Fetch current config from backend
        fetch("http://localhost:8000/config")
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setConfig(data.config);
                }
            })
            .catch(err => console.error("Error fetching config:", err));

        return () => clearInterval(timer);
    }, []);



    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("http://localhost:8000/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            const data = await res.json();
            if (data.status === "success") {
                window.dispatchEvent(new Event("configUpdated"));
                alert("Configuration saved successfully! Environment reloaded.");
            } else {
                alert("Error saving: " + data.message);
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to connect to backend.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">

                {/* Header — VSCode Style */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Neural System Configuration</h3>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.CONFIG_V1</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-3 py-1.5 border rounded text-[10px] transition-all uppercase tracking-widest font-bold ${isSaving ? 'bg-neutral-800 border-neutral-700 text-neutral-600' : 'bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 text-purple-400'}`}>
                            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} /> {isSaving ? 'Committing...' : 'Commit_Changes'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area — VSCode Style */}
                <div className="flex-1 relative flex flex-col overflow-hidden bg-[#1e1e1e]">

                    <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-none max-w-5xl mx-auto w-full">

                        {/* Section: Operational Secrets */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-l-2 border-purple-500/30 pl-6 py-2 bg-[#252526]/50">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">API_Configuration</h2>

                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-2 bg-[#252526] border border-[#303030] p-6 rounded-2xl backdrop-blur-md">
                                    <label className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                                        <Database className="w-4 h-4 text-purple-400" />
                                        GEMINI_API_KEY
                                    </label>
                                    <p className="text-[10px] text-neutral-500 italic font-sans mb-2">Required for primary cognitive reasoning using Google&apos;s Gemini models.</p>
                                    <input
                                        type="password"
                                        value={config.GEMINI_API_KEY}
                                        onChange={(e) => setConfig({ ...config, GEMINI_API_KEY: e.target.value })}
                                        placeholder="AIzaSy..."
                                        className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 bg-[#252526] border border-[#303030] p-6 rounded-2xl backdrop-blur-md">
                                    <label className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                        TAVILY_API_KEY
                                    </label>
                                    <p className="text-[10px] text-neutral-500 italic font-sans mb-2">Required for giving the agent live internet access and search capabilities.</p>
                                    <input
                                        type="password"
                                        value={config.TAVILY_API_KEY}
                                        onChange={(e) => setConfig({ ...config, TAVILY_API_KEY: e.target.value })}
                                        placeholder="tvly-..."
                                        className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Section: AI Configuration */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-blue-500/30 pl-6 py-2 bg-[#252526]/50">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Intelligence_Params</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-5 bg-[#252526] border border-[#303030] rounded-xl relative">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-2 bg-blue-500/10 rounded-lg"><Cpu className="w-5 h-5 text-blue-400" /></div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Neural Model Cluster</h4>
                                                <p className="text-[10px] text-neutral-500">SELECT RUNTIME ENGINE</p>
                                            </div>
                                        </div>
                                        <select
                                            value={config.MODEL_OVERRIDE}
                                            onChange={(e) => setConfig({ ...config, MODEL_OVERRIDE: e.target.value })}
                                            className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors uppercase cursor-pointer"
                                        >
                                            <optgroup label="Google Gemini (SOTA 2026)" className="bg-[#1e1e1e]">
                                                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Latest Preview)</option>
                                                <option value="gemini-3-pro">Gemini 3 Pro (Visionary)</option>
                                                <option value="gemini-3-flash">Gemini 3 Flash (Fast & Lean)</option>
                                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Stable Legacy)</option>
                                            </optgroup>
                                            <optgroup label="Local Models (Private)" className="bg-[#1e1e1e]">
                                                <option value="ollama:llama3.2">Ollama: Llama 3.2</option>
                                                <option value="ollama:mistral">Ollama: Mistral</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Database Sync */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-yellow-500/30 pl-6 py-2 bg-[#252526]/50">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Vector_Memory</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-5 bg-[#252526] border border-[#303030] rounded-xl flex flex-col gap-4">
                                        <div>
                                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">Qdrant Cloud Mode</h4>
                                            <p className="text-[10px] text-neutral-500 leading-tight">Leave blank to force fallback to <span className="text-yellow-400">Local Embedded Qdrant</span> mode (No server needed, 100% private).</p>
                                        </div>

                                        <input
                                            type="text"
                                            value={config.QDRANT_URL}
                                            onChange={(e) => setConfig({ ...config, QDRANT_URL: e.target.value })}
                                            placeholder="https://...cloud.qdrant.io (Optional)"
                                            className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                        />
                                        <input
                                            type="password"
                                            value={config.QDRANT_API_KEY}
                                            onChange={(e) => setConfig({ ...config, QDRANT_API_KEY: e.target.value })}
                                            placeholder="Qdrant API Key (Optional)"
                                            className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                        />
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
