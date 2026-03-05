"use client";

import { useState, useRef, useEffect, memo } from "react";
import Sidebar from "@/components/Sidebar";
import ThoughtStream, { ThoughtStep } from "@/components/ThoughtStream";
import { Send, Sparkles, Database, FileText, Brain, FolderSearch, Globe, Terminal, CheckCircle2, AlertTriangle, Check, X, History, Plus, MessageSquare, Trash2, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import MermaidRenderer from "@/components/MermaidRenderer";
import { createHighlighter } from "shiki";

interface AgentMessagePart {
    part_kind: string;
    tool_name: string;
    args?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface ChatStreamEvent {
    type: "status" | "tool_call" | "final" | "error";
    message?: string;
    tool_name?: string;
    args?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    tools?: { name: string; detail: string; icon: LucideIcon; count?: number; queries?: string[] }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingActions?: any[];
    confidence?: number;
    reasoning?: string;
    activeSkills?: { id?: string; name: string; matched_by?: string }[];
}

const parseTimestamp = (value?: string | null): Date => {
    if (!value) return new Date();
    const direct = new Date(value);
    if (!Number.isNaN(direct.getTime())) return direct;
    const normalized = value.includes(" ") ? value.replace(" ", "T") : value;
    const fallback = new Date(normalized);
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
};

const formatMessageTime = (value: Date): string => {
    if (Number.isNaN(value.getTime())) return "--:--";
    return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const mapToolVisual = (toolName: string, args?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    let detail = toolName;
    let icon: LucideIcon = Database;
    let message = `Executing tool: ${toolName}`;

    if (toolName === "read_file") {
        detail = args?.path || "File";
        icon = FileText;
        message = `Reading file: ${args?.path || "unknown path"}`;
    } else if (toolName === "search_knowledge_base") {
        detail = "The Library";
        icon = Database;
        message = `Searching knowledge base for '${args?.query || ""}'`;
    } else if (toolName === "recall") {
        detail = "Vector Memory";
        icon = Brain;
        message = `Recalling memories for '${args?.query || ""}'`;
    } else if (toolName === "list_directory") {
        detail = `FS: ${args?.path || "."}`;
        icon = FolderSearch;
        message = `Listing directory: ${args?.path || "."}`;
    } else if (toolName === "web_search") {
        detail = "Tavily Web Search";
        icon = Globe;
        message = `Web search: ${args?.query || ""}`;
    } else if (toolName === "connect_concepts") {
        detail = `${args?.source || "?"} -> ${args?.target || "?"}`;
        icon = Brain;
        message = `Forging synaptic link: ${detail}`;
    } else if (toolName === "modify_concept") {
        detail = `Refining: ${args?.name || "?"}`;
        icon = Sparkles;
        message = `Updating concept: ${args?.name || "?"}`;
    }

    return { detail, icon, message };
};

const SimpleHighlighter = ({ code }: { code: React.ReactNode }) => {
    const text = String(code).replace(/\n$/, "");

    type TokenSpec = {
        regex: RegExp;
        color: string;
        bold?: boolean;
        italic?: boolean;
    };
    type Match = {
        start: number;
        end: number;
        content: string;
        color: string;
        bold?: boolean;
        italic?: boolean;
    };

    // VS Code Dark+ inspired palette
    const tokens: TokenSpec[] = [
        { regex: /(?:#.*|\/\/.*|\/\*[\s\S]*?\*\/)/g, color: "#6A9955", italic: true }, // comments
        { regex: /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, color: "#CE9178" }, // strings
        { regex: /@[a-zA-Z_][a-zA-Z0-9_]*/g, color: "#DCDCAA" }, // decorators
        { regex: /\b(?:class|def|return|if|elif|else|for|while|in|is|not|and|or|async|await|import|from|const|let|var|function|export|default|interface|type|try|except|finally|with|as|raise|yield|match|case|switch|break|continue|new)\b/g, color: "#C586C0" }, // keywords
        { regex: /\b(?:str|int|float|list|dict|bool|set|tuple|None|True|False|void|string|number|boolean|any|unknown|never|Field|BaseModel|Agent|Message|ThoughtStep)\b/g, color: "#4EC9B0" }, // types/builtins
        { regex: /\b[A-Z][A-Za-z0-9_]*\b/g, color: "#4EC9B0" }, // class/type names
        { regex: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g, color: "#DCDCAA" }, // function calls
        { regex: /\b\d+(?:\.\d+)?\b/g, color: "#B5CEA8" }, // numbers
    ];

    const matches: Match[] = [];
    const occupied = new Array<boolean>(text.length).fill(false);

    // Apply in priority order and avoid overlaps (comments/strings first).
    for (const token of tokens) {
        const regex = new RegExp(token.regex.source, token.regex.flags.includes("g") ? token.regex.flags : `${token.regex.flags}g`);
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
            const start = m.index;
            const end = start + m[0].length;
            if (start === end) continue;

            let blocked = false;
            for (let i = start; i < end; i += 1) {
                if (occupied[i]) {
                    blocked = true;
                    break;
                }
            }
            if (blocked) continue;

            for (let i = start; i < end; i += 1) occupied[i] = true;
            matches.push({
                start,
                end,
                content: m[0],
                color: token.color,
                bold: token.bold,
                italic: token.italic
            });
        }
    }

    matches.sort((a, b) => a.start - b.start);

    const result: React.ReactNode[] = [];
    let currentPos = 0;
    matches.forEach((m, i) => {
        if (m.start > currentPos) {
            result.push(text.slice(currentPos, m.start));
        }
        result.push(
            <span key={i} style={{ color: m.color, fontWeight: m.bold ? 700 : 400, fontStyle: m.italic ? "italic" : "normal" }}>
                {m.content}
            </span>
        );
        currentPos = m.end;
    });
    if (currentPos < text.length) {
        result.push(text.slice(currentPos));
    }

    return <>{result}</>;
};

let shikiHighlighterPromise: ReturnType<typeof createHighlighter> | null = null;
const getShikiHighlighter = () => {
    if (!shikiHighlighterPromise) {
        shikiHighlighterPromise = createHighlighter({
            themes: ["dark-plus"],
            langs: [
                "txt",
                "python",
                "javascript",
                "typescript",
                "tsx",
                "json",
                "bash",
                "markdown",
                "yaml",
                "html",
                "css",
                "sql"
            ]
        });
    }
    return shikiHighlighterPromise;
};

const normalizeLang = (lang: string) => {
    const lower = (lang || "txt").toLowerCase();
    const map: Record<string, string> = {
        plaintext: "txt",
        text: "txt",
        py: "python",
        js: "javascript",
        ts: "typescript",
        shell: "bash",
        sh: "bash",
        zsh: "bash",
    };
    return map[lower] || lower;
};

const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const [copied, setCopied] = useState(false);
    const [highlightedHtml, setHighlightedHtml] = useState<string>("");
    const language = className ? className.replace(/language-/, "") : "code";
    const codeText = String(children).replace(/\n$/, "");

    const handleCopy = () => {
        navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        let active = true;
        const render = async () => {
            try {
                const highlighter = await getShikiHighlighter();
                let lang = normalizeLang(language);
                if (!highlighter.getLoadedLanguages().includes(lang)) {
                    lang = "txt";
                }
                const html = highlighter.codeToHtml(codeText, {
                    lang,
                    theme: "dark-plus",
                });
                if (active) setHighlightedHtml(html);
            } catch {
                if (active) setHighlightedHtml("");
            }
        };
        render();
        return () => {
            active = false;
        };
    }, [codeText, language]);

    return (
        <div className="group relative my-4 rounded-lg overflow-hidden border border-[#2a2d2e] bg-[#1e1e1e] shadow-xl">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#2a2d2e]">
                <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-purple-400" />
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">{language}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/50 hover:text-white transition-all border border-white/5"
                >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Database size={12} className="opacity-50" />}
                    {copied ? "COPIED" : "COPY"}
                </button>
            </div>
            <div className="p-4 overflow-x-auto custom-scrollbar font-mono text-[12px] text-[#d4d4d4] leading-relaxed whitespace-pre font-medium">
                {highlightedHtml ? (
                    <div
                        className="[&_.shiki]:!bg-transparent [&_.shiki]:!p-0 [&_.shiki]:!m-0"
                        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                    />
                ) : (
                    <SimpleHighlighter code={children} />
                )}
            </div>
        </div>
    );
};

const MarkdownMessage = memo(function MarkdownMessage({ content }: { content: string }) {
    return (
        <div className="text-sm text-neutral-300 leading-relaxed markdown-content">
            <ReactMarkdown
                components={{
                    h1: ({ ...props }) => <h1 className="text-lg font-bold text-neutral-100 mt-4 mb-2 uppercase tracking-wider border-b border-white/10 pb-1" {...props} />,
                    h2: ({ ...props }) => <h2 className="text-md font-bold text-neutral-200 mt-4 mb-2 uppercase tracking-tight" {...props} />,
                    h3: ({ ...props }) => <h3 className="text-sm font-bold text-white/90 mt-3 mb-1" {...props} />,
                    p: ({ ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                    ul: ({ ...props }) => <ul className="list-none space-y-1.5 mb-3" {...props} />,
                    li: ({ ...props }) => (
                        <li className="flex items-start gap-3 group">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 mt-[0.55rem] shrink-0 transition-all group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                            <span className="flex-1" {...props} />
                        </li>
                    ),
                    strong: ({ ...props }) => <strong className="text-white font-bold" {...props} />,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pre: ({ children }: any) => <>{children}</>,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code: ({ inline, children, className, ...props }: any) => {
                        const isMultiline = String(children).includes("\n");
                        if (inline || !isMultiline) {
                            return (
                                <code className="bg-white/5 text-neutral-200 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/10" {...props}>
                                    {children}
                                </code>
                            );
                        }
                        if (className === "language-mermaid") {
                            return <MermaidRenderer chart={String(children)} />;
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
});

export default function ChatPage() {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`;
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
    const [agentHistory, setAgentHistory] = useState<{ role: string; content: string; parts?: AgentMessagePart[] }[]>([]);
    const [chatError, setChatError] = useState<string | null>(null);
    const [lastRequestInput, setLastRequestInput] = useState("");

    // Session History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [sessions, setSessions] = useState<{ id: string, title: string, updated_at: string }[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const shouldAutoScrollRef = useRef(true);

    const fetchJson = async <T,>(url: string, init?: RequestInit): Promise<T | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
            const res = await fetch(url, { ...init, signal: controller.signal });
            if (!res.ok) return null;
            return await res.json() as T;
        } catch {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    const fetchSessions = async () => {
        const data = await fetchJson<{ status?: string; sessions?: { id: string, title: string, updated_at: string }[] }>(`${API_BASE}/sessions`);
        if (data?.status === "success" && Array.isArray(data.sessions)) {
            setSessions(data.sessions);
        } else {
            setSessions([]);
        }
    };

    const loadSession = async (sessionId: string) => {
        try {
            const data = await fetchJson<{ status?: string; messages?: { id: number; role: string; content: string; timestamp: string; metadata?: any }[] }>(`${API_BASE}/sessions/${sessionId}/messages`); // eslint-disable-line @typescript-eslint/no-explicit-any
            if (data?.status === "success") {
                const loadedMsgs = (data.messages || []).map((m: { id: number; role: string; content: string; timestamp: string; metadata?: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    let loadedTools: { name: string; detail: string; icon: LucideIcon; count: number; queries?: string[] }[] | undefined = undefined;
                    if (m.metadata?.used_tools && Array.isArray(m.metadata.used_tools)) {
                        const toolMap: { [key: string]: { name: string; detail: string; icon: LucideIcon; count: number; queries?: string[] } } = {};

                        m.metadata.used_tools.forEach((t: { name: string; detail?: string }) => {
                            const name = t.name;
                            const visual = mapToolVisual(name, {});
                            const icon = visual.icon;
                            const detail = t.detail || visual.detail || t.name;

                            if (toolMap[name]) {
                                toolMap[name].count += 1;
                                if (name === "connect_concepts" || name === "modify_concept") {
                                    toolMap[name].detail = `${toolMap[name].count} neural links established`;
                                }
                            } else {
                                toolMap[name] = { name, detail, icon, count: 1 };
                            }
                        });
                        loadedTools = Object.values(toolMap);
                    }

                    return {
                        id: m.id.toString(),
                        role: m.role as "user" | "assistant",
                        content: m.content,
                        timestamp: parseTimestamp(m.timestamp),
                        tools: loadedTools,
                        pendingActions: m.metadata?.pendingActions,
                        confidence: m.metadata?.confidence,
                        reasoning: m.metadata?.reasoning,
                        activeSkills: Array.isArray(m.metadata?.active_skills) ? m.metadata.active_skills : undefined
                    };
                });
                setMessages(loadedMsgs);
                setCurrentSessionId(sessionId);
                setAgentHistory([]); // Reset running local memory buffer
            } else {
                console.warn("Session load unavailable.");
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
            await fetchJson(`${API_BASE}/sessions/${sessionId}`, { method: "DELETE" });
            if (sessionId === currentSessionId) {
                startNewSession();
            }
            fetchSessions();
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        setMounted(true);
        fetchSessions();
        const params = new URLSearchParams(window.location.search);
        const prefill = params.get("prefill");
        if (prefill) setInput(prefill);
    }, []);


    useEffect(() => {
        if (scrollRef.current) {
            if (shouldAutoScrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [messages]);

    const handleChatScroll = () => {
        if (!scrollRef.current) return;
        const distanceFromBottom =
            scrollRef.current.scrollHeight - scrollRef.current.scrollTop - scrollRef.current.clientHeight;
        shouldAutoScrollRef.current = distanceFromBottom < 80;
    };

    const handleActionApproval = async (actionId: string, approved: boolean, messageId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/actions/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action_id: actionId, approved })
            });
            const data = await response.json();

            if (data.status !== "success") {
                alert(`Error executing action: ${data.message}`);
                console.error("Agent Action Error:", data.message);
                return;
            }

            // UsuniÄ™cie akcji z historii wiadomoĹ›ci w UI (lub ukrycie jako zatwierdzone)
            setMessages(prev => prev.map(m => {
                if (m.id === messageId && m.pendingActions) {
                    return {
                        ...m,
                        pendingActions: m.pendingActions.filter(a => a.id !== actionId)
                    };
                }
                return m;
            }));

            // Ciche doĹ‚Ä…czenie loga do chatu jako nowy powrĂłt z informacjÄ… dla usera
            if (approved) {
                const sysMsg: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: `[System] Action approved. ${data.message}`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, sysMsg]);
            } else {
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

    const handleSend = async (forcedInput?: string) => {
        const nextInput = (forcedInput ?? input).trim();
        if (!nextInput || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: nextInput,
            timestamp: new Date(),
        };

        shouldAutoScrollRef.current = true;
        setChatError(null);
        setLastRequestInput(nextInput);
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setThoughtSteps([
            { id: `${Date.now()}-start`, type: "thought", message: "Analyzing user request for context...", icon: Terminal, time: "just now" }
        ]);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: abortController.signal,
                body: JSON.stringify({
                    message: nextInput,
                    session_id: currentSessionId,
                    message_history: agentHistory.length > 0 ? agentHistory : undefined
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`Streaming request failed (${response.status})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let finalData: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
            const usedTools: { name: string; detail: string; icon: LucideIcon; count: number; queries?: string[] }[] = [];

            const applyToolEvent = (toolName: string, args?: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                const visual = mapToolVisual(toolName, args);
                const { detail, icon, message: messageStr } = visual;
                const query = typeof args?.query === "string" ? args.query.trim() : "";

                const existingTool = usedTools.find(t => t.name === toolName);
                if (existingTool) {
                    existingTool.count += 1;
                    if (query) {
                        const seen = new Set(existingTool.queries || []);
                        seen.add(query);
                        existingTool.queries = Array.from(seen).slice(-3);
                    }
                    if (toolName === "connect_concepts" || toolName === "modify_concept") {
                        existingTool.detail = `${existingTool.count} neural links established`;
                    } else if (toolName === "search_knowledge_base") {
                        existingTool.detail = `Knowledge Base (${existingTool.count})`;
                    }
                } else {
                    usedTools.push({
                        name: toolName,
                        detail: toolName === "search_knowledge_base" ? "Knowledge Base (1)" : detail,
                        icon,
                        count: 1,
                        queries: query ? [query] : []
                    });
                }

                setThoughtSteps(prev => [...prev, {
                    id: `${Date.now()}-${Math.random()}`,
                    type: "tool",
                    message: messageStr,
                    icon,
                    time: "just now"
                }]);
            };

            const processLine = (line: string) => {
                if (!line.trim()) return;
                let evt: ChatStreamEvent;
                try {
                    evt = JSON.parse(line);
                } catch {
                    return;
                }

                if (evt.type === "status" && typeof evt.message === "string") {
                    const statusMessage = evt.message;
                    setThoughtSteps(prev => [...prev, {
                        id: `${Date.now()}-${Math.random()}`,
                        type: "thought",
                        message: statusMessage,
                        icon: Terminal,
                        time: "just now"
                    }]);
                    return;
                }
                if (evt.type === "tool_call" && evt.tool_name) {
                    applyToolEvent(evt.tool_name, evt.args);
                    return;
                }
                if (evt.type === "final" && evt.data) {
                    finalData = evt.data;
                    return;
                }
                if (evt.type === "error") {
                    throw new Error(evt.message || "Agent stream error");
                }
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                lines.forEach(processLine);
            }
            if (buffer.trim()) {
                processLine(buffer);
            }

            if (!finalData || finalData.status !== "success") {
                throw new Error("Stream ended without successful final payload.");
            }

            setThoughtSteps(prev => [...prev, {
                id: `${Date.now()}-complete`,
                type: "complete",
                message: "Response synthesized with high confidence",
                icon: CheckCircle2,
                time: "just now"
            }]);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: finalData.response,
                timestamp: new Date(),
                tools: usedTools.length > 0 ? usedTools : undefined,
                pendingActions: finalData.pending_actions?.length > 0 ? finalData.pending_actions : undefined,
                confidence: finalData.confidence,
                reasoning: finalData.reasoning,
                activeSkills: Array.isArray(finalData.active_skills) && finalData.active_skills.length > 0 ? finalData.active_skills : undefined
            };
            setMessages((prev) => [...prev, assistantMessage]);
            if (finalData.new_messages) {
                setAgentHistory((prev) => [...prev, ...finalData.new_messages]);
            }
            if (finalData.session_id && finalData.session_id !== currentSessionId) {
                setCurrentSessionId(finalData.session_id);
                fetchSessions();
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                setThoughtSteps(prev => [...prev, {
                    id: `${Date.now()}-aborted`,
                    type: "thought",
                    message: "Generation stopped by user.",
                    icon: Terminal,
                    time: "just now"
                }]);
                return;
            }
            const message = error instanceof Error ? error.message : "Unknown error";
            setChatError(message);
            console.error("Failed to connect to Aether backend:", error);
        } finally {
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    };

    const handleStopGeneration = () => {
        abortControllerRef.current?.abort();
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">

            <Sidebar />

            <main className="flex-1 min-w-0 flex relative overflow-hidden bg-[#1e1e1e]">

                {/* Chat Column */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Chat Header â€” Standardized Style */}
                    <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
                        <div className="flex items-center gap-3 min-w-0">
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <div>
                                <h3 className="text-sm font-bold tracking-wider text-white uppercase">Chat</h3>
                                <p className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">Talk with Aether and run agent tasks</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap shrink-0">
                            <div className="text-[10px] text-neutral-600 border-r border-white/10 pr-3 mr-1 font-mono hidden lg:block">
                                Sessions: {sessions.length}
                            </div>
                            <button
                                onClick={startNewSession}
                                title="Start a new chat session"
                                aria-label="Start new chat session"
                                className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">New Session</span>
                            </button>
                            <button
                                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                                title={isHistoryOpen ? "Hide chat history panel" : "Show chat history panel"}
                                aria-label={isHistoryOpen ? "Hide chat history panel" : "Show chat history panel"}
                                className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <History className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{isHistoryOpen ? "Hide History Panel" : "Show History Panel"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Message Container */}
                    <div
                        ref={scrollRef}
                        onScroll={handleChatScroll}
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
                                            {/* Reasoning & Confidence Meta */}
                                            {msg.role === "assistant" && (msg.confidence !== undefined || msg.reasoning) && (
                                                <div className="flex gap-2 items-center mb-1">
                                                    {msg.confidence !== undefined && (
                                                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${msg.confidence >= 0.9 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                                                            msg.confidence >= 0.7 ? "bg-purple-500/10 border-purple-500/30 text-purple-400" :
                                                                "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                                            }`}>
                                                            {Math.round(msg.confidence * 100)}% RELIABILITY
                                                        </div>
                                                    )}
                                                    {msg.reasoning && (
                                                        <div className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 uppercase tracking-tighter">
                                                            SOURCE: {msg.reasoning}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {msg.role === "assistant" && msg.activeSkills && msg.activeSkills.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {msg.activeSkills.map((skill, idx) => (
                                                        <span
                                                            key={`${skill.id || skill.name}-${idx}`}
                                                            title={skill.matched_by ? `Matched by: ${skill.matched_by}` : "Global skill"}
                                                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                                                        >
                                                            Skill: {skill.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <MarkdownMessage content={msg.content} />
                                            <p className="text-[10px] text-neutral-600 font-mono mt-2 uppercase">
                                                {formatMessageTime(msg.timestamp)}
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
                                                                    {tool.count && tool.count > 1 && (
                                                                        <span className="px-1 py-0.5 rounded-sm bg-purple-500/20 text-purple-400 text-[8px] font-bold">
                                                                            x{tool.count}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-neutral-200 truncate max-w-[200px]">
                                                                    {tool.detail}
                                                                </div>
                                                                {tool.queries && tool.queries.length > 0 && (
                                                                    <div className="text-[10px] text-neutral-400 space-y-0.5 max-w-[220px]">
                                                                        {tool.queries.map((q, qIdx) => (
                                                                            <div key={`${tool.name}-q-${qIdx}`} className="truncate">- {q}</div>
                                                                        ))}
                                                                    </div>
                                                                )}
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
                                                <span className="text-[8px] font-bold text-white/60">You</span>
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

                    {/* Input Area â€” VSCode Style */}
                    <div className="px-4 md:px-6 py-4 shrink-0 bg-transparent relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-[#1e1e1e] to-transparent pointer-events-none -top-10" />
                        {chatError && (
                            <div className="mb-3 relative z-10 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300 flex items-center justify-between gap-3">
                                <span className="truncate">Connection error: {chatError}</span>
                                <button
                                    onClick={() => handleSend(lastRequestInput)}
                                    disabled={isLoading || !lastRequestInput}
                                    className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 disabled:opacity-40"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
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
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className="p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-all disabled:opacity-30 active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                            {isLoading && (
                                <button
                                    onClick={handleStopGeneration}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all active:scale-95"
                                    title="Stop generating"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
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
                                <div className="px-6 py-4 h-[68px] border-b border-[#303030] flex items-center justify-between shrink-0 bg-[#1e1e1e]">
                                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-cyan-500" />
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
                                            <div key={`session-${s.id}`} className="group flex items-center gap-1 relative mb-2">
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
