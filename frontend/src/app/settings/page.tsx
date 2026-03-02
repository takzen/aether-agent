"use client";

import Sidebar from "@/components/Sidebar";
import { Database, Cpu, Save, Globe, AlertTriangle, Trash2, RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import NotificationModal from "@/components/modals/NotificationModal";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

export default function Settings() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [currentTime, setCurrentTime] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        GEMINI_API_KEY: "",
        TAVILY_API_KEY: "",
        QDRANT_URL: "",
        QDRANT_API_KEY: "",
        MODEL_OVERRIDE: "",
        SYSTEM_LANGUAGE: "pl"
    });
    const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success"
    });
    const [isClearing, setIsClearing] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

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
                setNotification({
                    isOpen: true,
                    title: "System Configured",
                    message: "Configuration saved successfully! Environment reloaded.",
                    type: "success"
                });
            } else {
                setNotification({
                    isOpen: true,
                    title: "Configuration Error",
                    message: "Error saving: " + data.message,
                    type: "error"
                });
            }
        } catch (err) {
            console.error("Save error:", err);
            setNotification({
                isOpen: true,
                title: "Connection Error",
                message: "Failed to connect to backend.",
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearSystem = async () => {
        setIsClearing(true);
        setIsClearModalOpen(false);
        try {
            const res = await fetch("http://localhost:8000/system/clear", {
                method: "POST"
            });
            const data = await res.json();
            if (data.status === "success") {
                setNotification({
                    isOpen: true,
                    title: "System Purged",
                    message: "All sessions, graph data and logs have been permanently deleted.",
                    type: "success"
                });
            } else {
                setNotification({
                    isOpen: true,
                    title: "Purge Failed",
                    message: data.message || "Unknown error occurred.",
                    type: "error"
                });
            }
        } catch (err) {
            console.error(err);
            setNotification({
                isOpen: true,
                title: "Connection Error",
                message: "Could not reach the Aether Kernel.",
                type: "error"
            });
        } finally {
            setIsClearing(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10 select-none">

                {/* Header — VSCode Style */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Settings</h3>
                            <p className="text-[10px] text-neutral-500 font-mono">Configure model providers, keys and system behavior</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors flex items-center gap-1.5 disabled:opacity-50 ${isSaving ? 'border-neutral-700 text-neutral-600 bg-neutral-800' : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200'}`}>
                            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} /> {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Main Content Area — VSCode Style */}
                <div className="flex-1 relative flex flex-col overflow-hidden bg-[#1e1e1e]">

                    <div className="flex-1 overflow-y-auto p-10 space-y-12 relative z-10 scrollbar-none max-w-5xl mx-auto w-full">

                        {/* Section: Operational Secrets */}
                        <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-purple-500/30 pl-6 py-2 bg-[#252526]/50">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">API Configuration</h2>

                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-4 bg-[#252526] border border-[#303030] p-6 rounded-2xl backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-lg shrink-0">
                                            <Database className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">GEMINI_API_KEY</h4>
                                            <p className="text-[10px] text-neutral-500 italic font-sans">Required for primary cognitive reasoning using Google&apos;s Gemini models.</p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                                        value={config.GEMINI_API_KEY}
                                        onChange={(e) => setConfig({ ...config, GEMINI_API_KEY: e.target.value })}
                                        placeholder="AIzaSy..."
                                        className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>

                                <div className="flex flex-col gap-4 bg-[#252526] border border-[#303030] p-6 rounded-2xl backdrop-blur-md">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg shrink-0">
                                            <Globe className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">TAVILY_API_KEY</h4>
                                            <p className="text-[10px] text-neutral-500 italic font-sans">Required for giving the agent live internet access and search capabilities.</p>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                                        value={config.TAVILY_API_KEY}
                                        onChange={(e) => setConfig({ ...config, TAVILY_API_KEY: e.target.value })}
                                        placeholder="tvly-..."
                                        className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Section: AI Configuration */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-cyan-500/30 pl-6 py-2 bg-[#252526]/50">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Intelligence Parameters</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-5 bg-[#252526] border border-[#303030] rounded-xl relative">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg shrink-0">
                                                <Cpu className="w-5 h-5 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Neural Model Cluster</h4>
                                                <p className="text-[10px] text-neutral-500">Select runtime model</p>
                                            </div>
                                        </div>
                                        <select
                                            value={config.MODEL_OVERRIDE}
                                            onChange={(e) => setConfig({ ...config, MODEL_OVERRIDE: e.target.value })}
                                            className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer"
                                        >
                                            <optgroup label="Google Gemini (SOTA 2026)" className="bg-[#1e1e1e]">
                                                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Recommended)</option>
                                                <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                                                <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
                                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Stable)</option>
                                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                            </optgroup>
                                            <optgroup label="Local Models (Private)" className="bg-[#1e1e1e]">
                                                <option value="ollama:llama3.2">Ollama: Llama 3.2</option>
                                                <option value="ollama:mistral">Ollama: Mistral</option>
                                                <option value="ollama:qwen2.5:7b-instruct">Ollama: Qwen 2.5 7B Instruct</option>
                                                <option value="ollama:qwen3-vl:4b">Ollama: Qwen3-VL 4B</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Section: Database Sync */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between border-l-2 border-yellow-500/30 pl-6 py-2 bg-[#252526]/50">
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Vector Memory</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-6 bg-[#252526] border border-[#303030] rounded-2xl flex flex-col gap-4">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg shrink-0">
                                                <Database className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider mb-0.5">Qdrant Cloud Mode</h4>
                                                <p className="text-[10px] text-neutral-500 leading-tight">Leave blank to force fallback to <span className="text-yellow-400">Local Embedded Qdrant</span> mode (No server needed, 100% private).</p>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            value={config.QDRANT_URL}
                                            onChange={(e) => setConfig({ ...config, QDRANT_URL: e.target.value })}
                                            placeholder="https://...cloud.qdrant.io (Optional)"
                                            className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                        />
                                        <input
                                            type="text"
                                            style={{ WebkitTextSecurity: "disc" } as React.CSSProperties}
                                            value={config.QDRANT_API_KEY}
                                            onChange={(e) => setConfig({ ...config, QDRANT_API_KEY: e.target.value })}
                                            placeholder="Qdrant API Key (Optional)"
                                            className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Section: Danger Zone */}
                        <section className="space-y-6 pt-10">
                            <div className="flex items-center justify-between border-l-2 border-red-500/30 pl-6 py-2 bg-[#252526]/50">
                                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500/70">Danger Zone</h2>
                            </div>

                            <div className="p-6 bg-[#252526] border border-red-500/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md relative overflow-hidden group">
                                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-[12px] font-bold text-white uppercase tracking-wider mb-1">System Purge</h4>
                                        <p className="text-[11px] text-neutral-500 leading-relaxed max-w-md">
                                            Removes all chat sessions, graph connections (Neural Topology), and system logs.
                                            <span className="text-red-500/70 font-bold ml-1">This action cannot be undone.</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsClearModalOpen(true)}
                                    disabled={isClearing}
                                    className={`relative z-10 px-6 py-3 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 border ${isClearing
                                        ? "bg-neutral-800 border-neutral-700 text-neutral-500"
                                        : "bg-red-500/10 border-red-500/30 hover:bg-red-500 text-red-500 hover:text-white"
                                        }`}
                                >
                                    {isClearing ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    {isClearing ? "Purging..." : "Purge System"}
                                </button>
                            </div>
                        </section>

                    </div>
                </div>



            </main>

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />

            <ConfirmationModal
                isOpen={isClearModalOpen}
                onClose={() => setIsClearModalOpen(false)}
                onConfirm={handleClearSystem}
                title="System Purge Confirmation"
                message="Are you absolutely sure? This operation will clear all operational memory, chat history, and the Neural Topology graph. The system will return to its factory state."
                confirmText="PURGE ALL DATA"
                isDestructive={true}
            />
        </div>
    );
}


