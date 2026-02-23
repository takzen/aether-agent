"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Send, Sparkles, Database, FileText, Brain, FolderSearch, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    tools?: { name: string; detail: string; icon: any; latency: number }[];
}

export default function ChatPage() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Welcome back! Your neural core is active and all systems are online. I have 3 new memories stored since your last session.",
            timestamp: new Date(new Date().setHours(14, 30))
        },
        {
            id: "2",
            role: "user",
            content: "What's the latest from my knowledge base?",
            timestamp: new Date(new Date().setHours(14, 31))
        },
        {
            id: "3",
            role: "assistant",
            content: "I found 3 recently indexed documents in your knowledge base:\n\nProject architecture overview\nAuthentication system design\nAPI endpoint documentation",
            timestamp: new Date(new Date().setHours(14, 31))
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!mounted) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (data.status === "success") {
                const usedTools: { name: string; detail: string; icon: any; latency: number }[] = [];
                if (data.new_messages) {
                    data.new_messages.forEach((msg: any) => {
                        if (msg.parts) {
                            msg.parts.forEach((part: any) => {
                                if (part.part_kind === "tool-call") {
                                    let detail = "";
                                    let icon = Database;
                                    if (part.tool_name === "read_file" && part.args?.path) {
                                        detail = part.args.path;
                                        icon = FileText;
                                    } else if (part.tool_name === "search_knowledge_base") {
                                        detail = "Knowledge Base";
                                        icon = Database;
                                    } else if (part.tool_name === "recall") {
                                        detail = "Vector Memory";
                                        icon = Brain;
                                    } else if (part.tool_name === "list_directory") {
                                        detail = "File System";
                                        icon = FolderSearch;
                                    } else if (part.tool_name === "web_search") {
                                        detail = "Tavily Web Search";
                                        icon = Globe;
                                    } else {
                                        detail = part.tool_name;
                                    }

                                    if (!usedTools.find(t => t.name === part.tool_name && t.detail === detail)) {
                                        usedTools.push({
                                            name: part.tool_name,
                                            detail,
                                            icon,
                                            latency: Math.floor(Math.random() * 30 + 15) // mock latency 15-45ms
                                        });
                                    }
                                }
                            });
                        }
                    });
                }

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response,
                    timestamp: new Date(),
                    tools: usedTools.length > 0 ? usedTools : undefined
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                console.error("Agent error:", data.message);
            }
        } catch (error) {
            console.error("Failed to connect to Aether backend:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">

            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden bg-[#1e1e1e]">
                {/* Chat Container */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 max-w-5xl mx-auto w-full flex flex-col overflow-hidden"
                >
                    {/* Chat Header — VSCode Style */}
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <h3 className="text-sm font-bold text-white">Aether Agent</h3>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
                                <span>Core Online</span>
                            </div>
                            <span>•</span>
                            <span>Latency: 12ms</span>
                        </div>
                    </div>

                    {/* Message Container */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <Sparkles className="w-10 h-10 text-purple-400" />
                                <div className="space-y-1.5">
                                    <h3 className="text-lg font-light text-white">Neural Core Ready</h3>
                                    <p className="text-xs text-neutral-500 max-w-xs mx-auto">Input command or query to begin processing.</p>
                                </div>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                                                <span className="text-[8px] font-bold text-purple-400">AI</span>
                                            </div>
                                        )}

                                        <div className={`max-w-[75%] px-4 py-3 ${msg.role === "user"
                                            ? "bg-purple-500/10 border border-purple-500/20 rounded-xl rounded-tr-sm"
                                            : "bg-white/[0.03] border border-white/5 rounded-xl rounded-tl-sm"
                                            }`}>
                                            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                                                {msg.content.split(/(\d+ new memories|\d+ recently indexed documents|Project architecture overview|Authentication system design|API endpoint documentation)/).map((part, i) => {
                                                    if (part === "3 new memories") return <span key={i} className="text-purple-400 font-medium">{part}</span>;
                                                    if (part === "3 recently indexed documents") return <span key={i} className="text-blue-400 font-medium">{part}</span>;
                                                    if (["Project architecture overview", "Authentication system design", "API endpoint documentation"].includes(part)) {
                                                        return <span key={i} className="flex items-center gap-2 mt-1.5 first:mt-2"><span className="w-1 h-1 rounded-full bg-blue-400" />{part}</span>;
                                                    }
                                                    return part;
                                                })}
                                            </div>
                                            <p className="text-[10px] text-neutral-600 font-mono mt-2 uppercase">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>

                                            {/* Tool Calls Visualization */}
                                            {msg.tools && msg.tools.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                                                    {msg.tools.map((tool, idx) => {
                                                        const Icon = tool.icon;
                                                        return (
                                                            <div key={idx} className="flex flex-col gap-1.5 bg-black/40 border border-white/5 rounded-lg px-3 py-2 min-w-[140px]">
                                                                <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono flex-1">
                                                                    <Icon className="w-3 h-3 text-purple-400" />
                                                                    <span>{tool.name}</span>
                                                                </div>
                                                                <div className="text-xs text-neutral-200 truncate max-w-[200px]">
                                                                    {tool.detail}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[9px] text-neutral-600 font-mono mt-0.5">
                                                                    <div className="w-1 h-1 rounded-full bg-green-500/50" />
                                                                    lat: {tool.latency}ms
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === "user" && (
                                            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                                                <span className="text-[8px] font-bold text-white/60">TK</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}

                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3"
                            >
                                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 animate-pulse">
                                    <span className="text-[8px] font-bold text-purple-400">AI</span>
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Input Area — VSCode Style */}
                    <div className="px-4 md:px-6 py-4 shrink-0 bg-transparent relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e] to-transparent pointer-events-none -top-10" />
                        <div className="flex items-center gap-2 bg-[#252526] border border-white/10 rounded-xl px-4 py-3 focus-within:border-purple-500/50 transition-all duration-300 relative z-10 shadow-lg shadow-black/20">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-transparent text-[#cccccc] text-sm placeholder:text-[#858585] focus:outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-all disabled:opacity-30 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar — System Status */}
                <div className="flex items-center justify-between px-6 py-4 text-[10px] font-mono text-neutral-600 uppercase tracking-widest shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500/30 animate-pulse" />
                            <span className="text-green-500/40">Secured Node</span>
                        </div>
                        <span className="text-neutral-800">•</span>
                        <span>Neural Core v0.1.0</span>
                    </div>
                    <div className="hidden md:block">
                        Ready for instructions // <span className="text-neutral-700">Aether Terminal</span>
                    </div>
                </div>
            </main>

            <ThoughtStream />
        </div>
    );
}
