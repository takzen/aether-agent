"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ThoughtStream, { ThoughtStep } from "@/components/ThoughtStream";
import { Send, Sparkles, Database, FileText, Brain, FolderSearch, Globe, Terminal, CheckCircle2, AlertTriangle, Check, X, History, Plus, MessageSquare, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools?: { name: string; detail: string; icon: any; latency: number }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingActions?: any[];
}

export default function ChatPage() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial",
            role: "assistant",
            content: "Welcome. Neural core active and synchronised. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [thoughtSteps, setThoughtSteps] = useState<ThoughtStep[]>([
        { id: 1, type: "thought", message: "Neural core active and waiting for instructions.", icon: Terminal, time: "just now" }
    ]);
    const [selectedModel] = useState<"gemini" | "ollama">("gemini");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [agentHistory, setAgentHistory] = useState<any[]>([]);

    // Session History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [sessions, setSessions] = useState<{ id: string, title: string, updated_at: string }[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchSessions = async () => {
        try {
            const res = await fetch("http://localhost:8000/sessions");
            const data = await res.json();
            if (data.status === "success") {
                setSessions(data.sessions);
            }
        } catch (e) {
            console.error("Failed to fetch sessions:", e);
        }
    };

    const loadSession = async (sessionId: string) => {
        try {
            const res = await fetch(`http://localhost:8000/sessions/${sessionId}/messages`);
            const data = await res.json();
            if (data.status === "success") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const loadedMsgs = data.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    timestamp: new Date(m.created_at),
                    pendingActions: m.metadata?.pendingActions
                }));
                setMessages(loadedMsgs);
                setCurrentSessionId(sessionId);
                setAgentHistory([]); // Reset running local memory buffer
            }
        } catch (e) {
            console.error("Failed to load session:", e);
        }
    };

    const startNewSession = () => {
        setMessages([{
            id: Date.now().toString(),
            role: "assistant",
            content: "Welcome back! Ready for a new conversation.",
            timestamp: new Date()
        }]);
        setCurrentSessionId(null);
        setAgentHistory([]);
        setThoughtSteps([{ id: Date.now(), type: "thought", message: "Memory buffer cleared. Waiting...", icon: Terminal, time: "just now" }]);
    };

    const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await fetch(`http://localhost:8000/sessions/${sessionId}`, { method: "DELETE" });
            if (sessionId === currentSessionId) {
                startNewSession();
            }
            fetchSessions();
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchSessions();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleActionApproval = async (actionId: string, approved: boolean, messageId: string) => {
        try {
            const response = await fetch("http://localhost:8000/actions/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action_id: actionId, approved })
            });
            const data = await response.json();

            // Usunięcie akcji z historii wiadomości w UI (lub ukrycie jako zatwierdzone)
            setMessages(prev => prev.map(m => {
                if (m.id === messageId && m.pendingActions) {
                    return {
                        ...m,
                        pendingActions: m.pendingActions.filter(a => a.id !== actionId)
                    };
                }
                return m;
            }));

            // Ciche dołączenie loga do chatu jako nowy powrót z informacją dla usera
            if (data.status === "success" && approved) {
                const sysMsg: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `[System] Action approved. ${data.message}`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, sysMsg]);
            } else if (data.status === "success" && !approved) {
                const sysMsg: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `[System] Action rejected.`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, sysMsg]);
            }
        } catch (error) {
            console.error("Failed to process approval", error);
        }
    };

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
        setThoughtSteps([
            { id: Date.now(), type: "thought", message: "Analyzing user request for context...", icon: Terminal, time: "just now" }
        ]);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: input,
                    model: selectedModel,
                    session_id: currentSessionId,
                    message_history: agentHistory.length > 0 ? agentHistory : undefined
                }),
            });

            const data = await response.json();

            if (data.status === "success") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const usedTools: { name: string; detail: string; icon: any; latency: number }[] = [];
                const newThoughts: ThoughtStep[] = [];
                if (data.new_messages) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data.new_messages.forEach((msg: any) => {
                        if (msg.parts) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            msg.parts.forEach((part: any, index: number) => {
                                if (part.part_kind === "tool-call") {
                                    let detail = "";
                                    let icon = Database;
                                    let messageStr = "";
                                    if (part.tool_name === "read_file" && part.args?.path) {
                                        detail = part.args.path;
                                        icon = FileText;
                                        messageStr = `Reading file: ${part.args.path}`;
                                    } else if (part.tool_name === "search_knowledge_base") {
                                        detail = "Knowledge Base";
                                        icon = Database;
                                        messageStr = `Searching knowledge base for '${part.args?.query || ""}'`;
                                    } else if (part.tool_name === "recall") {
                                        detail = "Vector Memory";
                                        icon = Brain;
                                        messageStr = `Recalling memories for '${part.args?.query || ""}'`;
                                    } else if (part.tool_name === "list_directory") {
                                        detail = "File System";
                                        icon = FolderSearch;
                                        messageStr = `Listing directory: ${part.args?.path || "."}`;
                                    } else if (part.tool_name === "web_search") {
                                        detail = "Tavily Web Search";
                                        icon = Globe;
                                        messageStr = `Web search: ${part.args?.query || ""}`;
                                    } else {
                                        detail = part.tool_name;
                                        messageStr = `Executing tool: ${part.tool_name}`;
                                    }

                                    if (!usedTools.find(t => t.name === part.tool_name && t.detail === detail)) {
                                        usedTools.push({
                                            name: part.tool_name,
                                            detail,
                                            icon,
                                            latency: Math.floor(Math.random() * 30 + 15) // mock latency 15-45ms
                                        });

                                        newThoughts.push({
                                            id: Date.now() + index,
                                            type: "tool",
                                            message: messageStr,
                                            icon: icon,
                                            time: "just now"
                                        });
                                    }
                                }
                            });
                        }
                    });
                }

                if (newThoughts.length > 0) {
                    setThoughtSteps(prev => [...prev, ...newThoughts]);
                }

                setThoughtSteps(prev => [...prev, {
                    id: Date.now() + 1000,
                    type: "complete",
                    message: "Response synthesized with high confidence",
                    icon: CheckCircle2,
                    time: "just now"
                }]);

                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response,
                    timestamp: new Date(),
                    tools: usedTools.length > 0 ? usedTools : undefined,
                    pendingActions: data.pending_actions?.length > 0 ? data.pending_actions : undefined
                };
                setMessages((prev) => [...prev, assistantMessage]);
                if (data.new_messages) {
                    setAgentHistory((prev) => [...prev, ...data.new_messages]);
                }
                if (data.session_id && data.session_id !== currentSessionId) {
                    setCurrentSessionId(data.session_id);
                    fetchSessions();
                }
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

            <main className="flex-1 min-w-0 flex relative overflow-hidden bg-[#1e1e1e]">

                {/* Chat Column */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Chat Header — Standardized Style */}
                    <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <div>
                                <h3 className="text-sm font-bold tracking-wider text-white uppercase">Aether Agent</h3>
                                <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                    <span>SYSTEM.NEURAL_CORE</span>
                                    <span className="text-neutral-700">|</span>
                                    <span>ACTIVE_SESSION</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono uppercase tracking-widest overflow-hidden">
                            {/* New Chat Button */}
                            <button
                                onClick={startNewSession}
                                className="flex items-center gap-1.5 px-3 h-7 rounded-sm border border-white/5 transition-all bg-black/40 text-neutral-400 hover:text-white hover:bg-white/10"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">New Chat</span>
                            </button>
                            {/* History Toggle */}
                            <button
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                className={`flex items-center gap-1.5 px-3 h-7 rounded-sm border border-white/5 transition-all
                                        ${isHistoryOpen ? "bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)] text-purple-400 font-bold border-purple-500/30" : "bg-black/40 text-neutral-400 hover:text-white hover:bg-white/10"}
                                    `}
                            >
                                <History className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">HISTORY Logs</span>
                            </button>
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

                                            {/* Human-in-the-Loop Actions */}
                                            {msg.pendingActions && msg.pendingActions.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    {msg.pendingActions.map((action) => (
                                                        <div key={action.id} className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-4 shadow-lg shadow-orange-500/5">
                                                            <div className="flex items-center gap-2 text-orange-400 font-bold mb-2">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                <span>Action Required: {action.type === "write_file" ? "File Modification" : action.type}</span>
                                                            </div>
                                                            <p className="text-sm text-neutral-300 mb-3 font-medium">
                                                                The agent wants to modify <code className="bg-black/40 px-1.5 py-0.5 rounded text-orange-300 font-mono text-xs">{action.display_path}</code>.
                                                            </p>

                                                            <div className="bg-[#1e1e1e] border border-white/5 rounded-lg p-3 text-[11px] text-neutral-400 font-mono mb-4 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                                                <pre>{action.content}</pre>
                                                            </div>

                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => handleActionApproval(action.id, true, msg.id)}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                    Approve & Execute
                                                                </button>
                                                                <button
                                                                    onClick={() => handleActionApproval(action.id, false, msg.id)}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
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


                </div >

                {/* Right History Drawer */}
                <AnimatePresence>
                    {
                        isHistoryOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 320, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                className="bg-[#181818] border-l border-[#303030] flex flex-col shrink-0 overflow-hidden font-mono z-20 h-full"
                            >
                                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#1e1e1e]">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <Database className="w-4 h-4 text-purple-500" />
                                        Chronicles
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={startNewSession}
                                            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                                            title="New Session"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setIsHistoryOpen(false)}
                                            className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                                            title="Close History"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
                                    {sessions.length === 0 ? (
                                        <div className="p-4 text-center text-xs text-neutral-600 italic">No previous sessions found.</div>
                                    ) : (
                                        sessions.map(s => (
                                            <div key={s.id} className="group flex items-center gap-1 relative">
                                                <button
                                                    onClick={() => loadSession(s.id)}
                                                    className={`w-full text-left px-3 py-3 rounded-lg flex flex-col gap-1 transition-all
                                                    ${s.id === currentSessionId
                                                            ? "bg-purple-500/10 border border-purple-500/20"
                                                            : "bg-transparent border border-transparent hover:bg-white/[0.02]"
                                                        }
                                                `}
                                                >
                                                    <div className="flex items-start gap-2 max-w-[90%]">
                                                        <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${s.id === currentSessionId ? "text-purple-400" : "text-neutral-600"}`} />
                                                        <span className={`text-[11px] font-sans truncate font-medium ${s.id === currentSessionId ? "text-purple-200" : "text-neutral-400"}`}>
                                                            {s.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-neutral-600 ml-5.5">
                                                        {new Date(s.updated_at).toLocaleString()}
                                                    </span>
                                                </button>

                                                <button
                                                    onClick={(e) => deleteSession(s.id, e)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                                                    title="Delete Session"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >
            </main >

            <ThoughtStream steps={thoughtSteps} />
        </div >
    );
}
