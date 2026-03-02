"use client";

import Sidebar from "@/components/Sidebar";
import { Shield, Activity, MessageSquare, Send, Brain, Database, Check, Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useCommand, DashboardMessage } from "@/context/CommandContext";
import ReactMarkdown from "react-markdown";
import { createHighlighter, type BundledLanguage, type SpecialLanguage } from "shiki";

let shikiHighlighterPromise: ReturnType<typeof createHighlighter> | null = null;
const getShikiHighlighter = () => {
  if (!shikiHighlighterPromise) {
    shikiHighlighterPromise = createHighlighter({
      themes: ["dark-plus"],
      langs: ["txt", "python", "javascript", "typescript", "tsx", "json", "bash", "markdown", "yaml", "html", "css", "sql", "diff"]
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
    patch: "diff",
  };
  return map[lower] || lower;
};

interface ChatStreamEvent {
  type: "status" | "tool_call" | "final" | "error" | "token";
  message?: string;
  tool_name?: string;
  args?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  data?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  content?: string;
}

const DashboardCodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const [tokenLines, setTokenLines] = useState<{ content: string; color?: string; fontStyle?: number }[][]>([]);
  const language = className ? className.replace(/language-/, "") : "txt";
  const codeText = String(children).replace(/\n$/, "");
  const normalizedLanguage = normalizeLang(language);
  const isDiff = normalizedLanguage === "diff";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  useEffect(() => {
    let active = true;
    const render = async () => {
      try {
        const highlighter = await getShikiHighlighter();
        let lang = normalizedLanguage as BundledLanguage | SpecialLanguage;
        if (!highlighter.getLoadedLanguages().includes(lang)) {
          lang = "txt";
        }
        const highlighted = highlighter.codeToTokens(codeText, { lang, theme: "dark-plus" }).tokens;
        if (active) setTokenLines(highlighted);
      } catch {
        if (active) {
          const fallback = codeText.split("\n").map((line) => [{ content: line }]);
          setTokenLines(fallback);
        }
      }
    };
    render();
    return () => { active = false; };
  }, [codeText, normalizedLanguage]);

  return (
    <div className="group relative my-3 rounded-lg overflow-hidden border border-[#2a2d2e] bg-[#1e1e1e] shadow-lg">
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#2a2d2e]">
        <div className="flex items-center gap-2">
          <Terminal size={11} className="text-[#569cd6]" />
          <span className="text-[10px] font-bold text-[#9cdcfe] uppercase tracking-widest">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWrapLines(prev => !prev)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 hover:text-white transition-all border border-white/10"
          >
            {wrapLines ? "NO WRAP" : "WRAP"}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white/60 hover:text-white transition-all border border-white/10"
          >
            {copied ? <Check size={11} className="text-emerald-400" /> : <Database size={11} className="opacity-50" />}
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>
      <div className={`p-3 ${wrapLines ? "overflow-x-hidden" : "overflow-x-auto"} custom-scrollbar font-mono text-[12px] text-[#d4d4d4] leading-6`}>
        <div className="min-w-full">
          {tokenLines.map((line, idx) => {
            const rawLine = line.map(t => t.content).join("");
            const diffClass = isDiff
              ? rawLine.startsWith("+")
                ? "bg-emerald-500/10"
                : rawLine.startsWith("-")
                  ? "bg-red-500/10"
                  : "bg-transparent"
              : "bg-transparent";
            return (
              <div key={`${idx}-${rawLine.length}`} className={`flex ${diffClass}`}>
                <span className="w-10 select-none text-right pr-3 text-[#858585] border-r border-[#2a2d2e] mr-3 shrink-0">
                  {idx + 1}
                </span>
                <span className={`${wrapLines ? "whitespace-pre-wrap break-words" : "whitespace-pre"}`}>
                  {line.length > 0 ? line.map((token, tokenIdx) => (
                    <span
                      key={`${idx}-${tokenIdx}-${token.content.length}`}
                      style={{
                        color: token.color || "#d4d4d4",
                        fontStyle: token.fontStyle === 1 || token.fontStyle === 3 ? "italic" : "normal",
                        fontWeight: token.fontStyle === 2 || token.fontStyle === 3 ? 700 : 400,
                      }}
                    >
                      {token.content}
                    </span>
                  )) : " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages, setMessages, clearMessages, isLoaded } = useCommand();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState(-1);
  const [renderMarkdown, setRenderMarkdown] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [activityFilter, setActivityFilter] = useState<"all" | "errors" | "memory" | "sessions">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
    // Second try after a short delay for heavy renders
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages, isProcessing]);

  const COMMANDS = [
    { cmd: "/logs", desc: "View system logs" },
    { cmd: "/clear", desc: "Clear terminal window" },
    { cmd: "/logclear", desc: "Clear system logs database" },
    { cmd: "/simulate", desc: "Run world model simulation" }
  ];
  const LOG_LIMIT_SUGGESTIONS = ["10", "50", "100"];

  const [stats, setStats] = useState({ memories: 0, documents: 0, reliability: 100, sessions: 0 });
  const [activities, setActivities] = useState<{ text: string; time: string; color: string; icon?: string }[]>([]);
  const [modelName, setModelName] = useState("Loading...");
  const [config, setConfig] = useState<{ [key: string]: string }>({ SYSTEM_LANGUAGE: 'pl' });

  const updateSuggestions = (val: string) => {
    // Dynamic argument hints for /logs [limit]
    // Trigger for: "/logs", "/logs ", "/logs 1", etc.
    const logsArgMatch = val.match(/^\/logs(?:\s+(\d*))?$/i);
    if (logsArgMatch) {
      const typedLimit = logsArgMatch[1] || "";
      const filteredLimits = LOG_LIMIT_SUGGESTIONS
        .filter((limit) => limit.startsWith(typedLimit))
        .map((limit) => `/logs ${limit}`);
      setSuggestions(filteredLimits);
      setActiveSuggestionIndex(0);
      return;
    }

    // Command name autocomplete
    if (val.startsWith("/") && !val.includes(" ")) {
      const filtered = COMMANDS
        .map(c => c.cmd)
        .filter(c => c.toLowerCase().startsWith(val.toLowerCase()));
      setSuggestions(filtered);
      setActiveSuggestionIndex(0);
      return;
    }

    setSuggestions([]);
  };

  const getSeverity = (message: DashboardMessage) => {
    if (message.isLogEntry) {
      if (message.logType === "error") return "error";
      if (message.logType === "warning") return "warn";
      if (message.logType === "success") return "success";
      return "info";
    }
    const content = (message.content || "").toLowerCase();
    if (/\b(error|failed|exception|traceback)\b/.test(content)) return "error";
    if (/\b(warn|warning|caution)\b/.test(content)) return "warn";
    if (/\b(success|completed|done|ok)\b/.test(content)) return "success";
    return "info";
  };

  const severityStyles: Record<string, string> = {
    info: "border-cyan-500/50 bg-cyan-500/[0.03]",
    warn: "border-amber-500/50 bg-amber-500/[0.03]",
    error: "border-red-500/50 bg-red-500/[0.04]",
    success: "border-emerald-500/50 bg-emerald-500/[0.03]",
  };

  const getActivityKind = (activity: { text: string; icon?: string }) => {
    const t = (activity.text || "").toLowerCase();
    if (/\berror|failed|exception|warning|warn\b/.test(t)) return "errors";
    if (activity.icon === "Brain" || /\bmemory|memories|recall|concept\b/.test(t)) return "memory";
    if (activity.icon === "MessageSquare" || /\bsession|chat|conversation|message\b/.test(t)) return "sessions";
    return "all";
  };

  const filteredActivities = activities.filter((activity) => {
    if (activityFilter === "all") return true;
    return getActivityKind(activity) === activityFilter;
  });

  const handleActivityClick = (activity: { text: string; icon?: string }) => {
    const kind = getActivityKind(activity);
    if (kind === "sessions") {
      router.push("/chat");
      return;
    }
    router.push("/logs");
  };

  useEffect(() => {
    // Fetch stats
    fetch("http://localhost:8000/stats")
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          setStats({
            memories: data.stats.memories_count,
            documents: data.stats.documents_count,
            reliability: data.stats.reliability || 100,
            sessions: data.stats.sessions_count || 0
          });
        }
      })
      .catch(() => console.error("Stats error"));

    const fetchConfig = () => {
      fetch("http://localhost:8000/config")
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            setConfig(data.config);
            const raw = data.config.MODEL_OVERRIDE || "gemini-3.1-pro";
            const currentLang = data.config.SYSTEM_LANGUAGE || "pl";
            const formatted = raw
              .replace("ollama:", "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
            setModelName(formatted);

            // Update welcome message if empty
            if (messages.length === 0) {
              setMessages([{
                id: "init-welcome",
                role: "assistant",
                content: currentLang === 'en' ? "Aether Core initialized. All systems nominal. How can I assist you today?" : "Rdzeń Aether zainicjowany. Wszystkie systemy sprawne. W czym mogę Ci dzisiaj pomóc?",
                isInitial: true
              }]);
            }
          }
        })
        .catch(() => setModelName("Aether Core"));
    };

    fetchConfig();
    window.addEventListener("configUpdated", fetchConfig);

    // Fetch recent activity
    fetch("http://localhost:8000/recent_activity")
      .then(res => res.json())
      .then(data => {
        setActivities(data.activities);
      })
      .catch(() => console.error("Activity error"));

    // Fetch Morning Brief (Night Cycle Output) ONLY if messages are empty
    if (messages.length === 0) {
      fetch("http://localhost:8000/system/morning-brief")
        .then(res => res.json())
        .then(data => {
          if (data.status === "success" && data.report) {
            setMessages([{
              id: "initial-" + Date.now(),
              role: "assistant",
              content: data.report.brief,
              extra: data.report.points,
              sources: ["aether.sleep_cycle", "system.logs"],
              isInitial: true
            }]);
          } else {
            // Fallback for empty/error brief
            setMessages([{
              id: "startup-" + Date.now(),
              role: "assistant",
              content: config.SYSTEM_LANGUAGE === 'en' ? "Aether Core initialized. All systems nominal. How can I assist you today?" : "Rdzeń Aether zainicjowany. Wszystkie systemy sprawne. W czym mogę Ci dzisiaj pomóc?",
              isInitial: true
            }]);
          }
        })
        .catch(() => {
          setMessages([{
            id: "error-" + Date.now(),
            role: "assistant",
            content: "System connection established. Dashboard online.",
            isInitial: true
          }]);
        });
    }

    return () => window.removeEventListener("configUpdated", fetchConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  useEffect(() => {
    try {
      const savedShow = localStorage.getItem("aether_dashboard_show_activity");
      const savedFilter = localStorage.getItem("aether_dashboard_activity_filter");
      if (savedShow !== null) {
        setShowActivity(savedShow === "1");
      }
      if (savedFilter === "all" || savedFilter === "errors" || savedFilter === "memory" || savedFilter === "sessions") {
        setActivityFilter(savedFilter);
      }
    } catch {
      // ignore localStorage issues
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aether_dashboard_show_activity", showActivity ? "1" : "0");
      localStorage.setItem("aether_dashboard_activity_filter", activityFilter);
    } catch {
      // ignore localStorage issues
    }
  }, [showActivity, activityFilter]);

  useEffect(() => {
    const onGlobalKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key.toLowerCase() === "l") {
        e.preventDefault();
        clearMessages();
        const lang = config.SYSTEM_LANGUAGE || "pl";
        setMessages([{
          id: "welcome-" + Date.now(),
          role: "assistant",
          content: lang === "en" ? "Cleared. Ready for the next task." : "Wyczyszczone. Gotowy na kolejny krok.",
          isInitial: true
        }]);
      }
    };
    window.addEventListener("keydown", onGlobalKey);
    return () => window.removeEventListener("keydown", onGlobalKey);
  }, [clearMessages, config.SYSTEM_LANGUAGE, setMessages]);

  const handleUpdateConfig = async (key: string, value: string) => {
    // 1. Get latest state and calculate new values
    setConfig(prev => {
      const updatedConfig = { ...prev, [key]: value };

      // 2. Send to backend using the freshly calculated config
      fetch("http://localhost:8000/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConfig)
      }).then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            window.dispatchEvent(new Event("configUpdated"));
          }
        }).catch(err => console.error("Config save error:", err));

      return updatedConfig;
    });
  };

  const triggerSleepCycle = async () => {
    setIsProcessing(true);
    try {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "user",
        content: "EXECUTE SYSTEM OVERRIDE: run_sleep_cycle()"
      }]);
      const res = await fetch("http://localhost:8000/system/sleep-cycle", { method: "POST" });
      const data = await res.json();
      if (data.status === "success" && data.report) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.report.brief,
          extra: data.report.points,
          sources: ["aether.sleep_cycle", "analysis.engine"]
        }]);
      } else {
        throw new Error(data.message || "Unknown error");
      }
    } catch (err: unknown) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error running night cycle: ${err instanceof Error ? err.message : "Unknown error"}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input.trim();
    setInput("");
    setSuggestions([]);
    setHistoryCursor(-1);
    setCommandHistory(prev => [currentInput, ...prev.filter(v => v !== currentInput)].slice(0, 100));

    // 1. Handle Slash Commands
    if (currentInput.startsWith("/")) {
      const [command, ...args] = currentInput.slice(1).split(" ");

      if (command === "clear") {
        clearMessages();
        const lang = config.SYSTEM_LANGUAGE || "pl";
        setMessages([{
          id: "welcome-" + Date.now(),
          role: "assistant",
          content: lang === 'en' ? "Cleared. Ready for the next task." : "Wyczyszczone. Gotowy na kolejny krok.",
          isInitial: true
        }]);
        return;
      }

      if (command === "logs") {
        setIsProcessing(true);
        try {
          const limit = args[0] || "15";
          const res = await fetch(`http://localhost:8000/logs?limit=${limit}`);
          const data = await res.json();

          if (data.status === "success" && data.logs) {
            const now = Date.now();
            data.logs.reverse().forEach((l: { id: number; message: string; type: string }, idx: number) => {
              setMessages(prev => [...prev, {
                id: `log-${l.id}-${now}-${idx}`,
                role: "assistant",
                content: l.message,
                isLogEntry: true,
                logType: l.type,
                sources: ["system.logs"]
              }]);
            });
          }
        } catch (err) {
          console.error("Log fetch error:", err);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      if (command === "logclear") {
        setIsProcessing(true);
        try {
          await fetch("http://localhost:8000/logs", { method: "DELETE" });
          setMessages(prev => [...prev, {
            id: "logclear-" + Date.now(),
            role: "assistant",
            content: config.SYSTEM_LANGUAGE === 'en' ? "Logs cleared." : "Logi wyczyszczone.",
            sources: ["system.core"]
          }]);
        } catch {
          console.error("Log clear error");
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      if (command === "simulate") {
        setIsProcessing(true);
        try {
          const res = await fetch("http://localhost:8000/system/simulate", { method: "POST" });
          const data = await res.json();
          if (data.status === "success") {
            setMessages(prev => [...prev, {
              id: "sim-" + Date.now(),
              role: "assistant",
              content: data.insight.insight,
              extra: data.insight.suggested_action ? [data.insight.suggested_action] : [],
              sources: ["world_model.simulation"]
            }]);
          }
        } catch {
          console.error("Sim error");
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      // Catch-all for unknown slash commands
      return;
    }

    // 2. Default Chat Behavior
    const userMsg: DashboardMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: currentInput,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const streamingMessageId = "ai-stream-" + Date.now();
      setMessages(prev => [...prev, {
        id: streamingMessageId,
        role: "assistant",
        content: "",
      }]);

      const response = await fetch("http://localhost:8000/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
      let streamedContent = "";
      const toolEvents: string[] = [];

      const processLine = (line: string) => {
        if (!line.trim()) return;
        let evt: ChatStreamEvent;
        try {
          evt = JSON.parse(line);
        } catch {
          return;
        }

        if (evt.type === "token" && typeof evt.content === "string") {
          streamedContent += evt.content;
          const rendered = [streamedContent, ...toolEvents].filter(Boolean).join("\n\n");
          setMessages(prev => prev.map(msg => msg.id === streamingMessageId ? { ...msg, content: rendered } : msg));
          return;
        }

        if (evt.type === "tool_call" && evt.tool_name) {
          const query = evt.args?.query || evt.args?.path || evt.args?.name || "";
          const toolInfo = query ? `${evt.tool_name}: ${query}` : evt.tool_name;
          toolEvents.push(`\`[tool]\` ${toolInfo}`);
          const rendered = [streamedContent, ...toolEvents].filter(Boolean).join("\n\n");
          setMessages(prev => prev.map(msg => msg.id === streamingMessageId ? { ...msg, content: rendered } : msg));
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

      setMessages(prev => prev.map(msg =>
        msg.id === streamingMessageId
          ? {
            ...msg,
            content: finalData.response || streamedContent || "No response generated."
          }
          : msg
      ));
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Unknown error"}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    updateSuggestions(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      clearMessages();
      const lang = config.SYSTEM_LANGUAGE || "pl";
      setMessages([{
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: lang === "en" ? "Cleared. Ready for the next task." : "Wyczyszczone. Gotowy na kolejny krok.",
        isInitial: true
      }]);
      return;
    }

    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      inputRef.current?.focus();
      return;
    }

    if (e.key === "Enter") {
      // If suggestions are visible, autocomplete the command
      if (suggestions.length > 0) {
        const nextInput = suggestions[activeSuggestionIndex] + " ";
        setInput(nextInput);
        updateSuggestions(nextInput);
      } else {
        handleSend();
      }
    } else if (e.key === "ArrowUp") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (commandHistory.length > 0) {
        e.preventDefault();
        const nextIndex = Math.min(historyCursor + 1, commandHistory.length - 1);
        setHistoryCursor(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (commandHistory.length > 0) {
        e.preventDefault();
        const nextIndex = historyCursor - 1;
        if (nextIndex < 0) {
          setHistoryCursor(-1);
          setInput("");
        } else {
          setHistoryCursor(nextIndex);
          setInput(commandHistory[nextIndex]);
        }
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">

      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-background">
        {/* Standardized Header */}
        <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">Command Center</h3>
              <p className="text-[10px] text-neutral-500 font-mono">Monitor system state and execute terminal commands</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 xl:gap-4 text-[10px] font-mono whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-cyan-400/80">
                <Database className="w-3 h-3" /> <span className="hidden xl:inline">Documents:</span> {stats.documents}
              </span>
              <span className="text-neutral-700 select-none hidden sm:inline">|</span>
              <span className="flex items-center gap-1.5 text-purple-400/80">
                <Brain className="w-3 h-3" /> <span className="hidden xl:inline">Memories:</span> {stats.memories}
              </span>
              <span className="text-neutral-700 select-none hidden md:inline">|</span>
              <span className="flex items-center gap-1.5 text-cyan-400/80">
                <MessageSquare className="w-3 h-3" /> <span className="hidden xl:inline">Sessions:</span> {stats.sessions}
              </span>
              <span className="text-neutral-700 select-none hidden lg:inline">|</span>
              <span className="flex items-center gap-1.5 text-green-500/80">
                <Shield className="w-3 h-3" /> <span className="hidden xl:inline">Reliability:</span> {stats.reliability}%
              </span>
            </div>
            <div className="text-[10px] text-neutral-600 border-l border-white/10 pl-4 font-mono hidden lg:block">
              {modelName}
            </div>
            <button
              onClick={() => setShowActivity(prev => !prev)}
              title="Toggle right panel with recent system activity"
              aria-label="Toggle recent activity panel"
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {showActivity ? "Hide Activity Panel" : "Show Activity Panel"}
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 relative z-10 p-6 gap-4 overflow-y-auto">


          {/* Row 3: Chat + Activity */}
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0 min-w-0">

            {/* Left: Command Center / Morning Brief (Terminal Style) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`${showActivity ? "col-span-8" : "col-span-12"} bg-[#1e1e1e] border border-[#303030] rounded-2xl flex flex-col overflow-hidden shadow-2xl`}
              style={{ fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, 'Courier New', monospace" }}
            >
              {/* Terminal Title Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02] shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
                </div>
                <span className="ml-2 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">aether - root@dashboard</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => setRenderMarkdown(prev => !prev)}
                    className="text-[9px] bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 px-2 py-0.5 rounded transition-colors font-mono"
                  >
                    {renderMarkdown ? "Rendered" : "Raw"}
                  </button>
                  <span className="text-[9px] text-neutral-600 font-mono hidden xl:inline">Ctrl+K focus | Ctrl+L clear</span>
                  <div className="flex bg-white/5 p-0.5 rounded border border-white/10 ml-3">
                    <button
                      onClick={() => handleUpdateConfig("SYSTEM_LANGUAGE", "pl")}
                      className={`text-[9px] px-2 py-0.5 rounded transition-all ${config.SYSTEM_LANGUAGE === 'pl' ? 'bg-purple-500 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      PL
                    </button>
                    <button
                      onClick={() => handleUpdateConfig("SYSTEM_LANGUAGE", "en")}
                      className={`text-[9px] px-2 py-0.5 rounded transition-all ${config.SYSTEM_LANGUAGE === 'en' ? 'bg-purple-500 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                    >
                      EN
                    </button>
                  </div>

                  <button
                    onClick={triggerSleepCycle}
                    disabled={isProcessing}
                    className="ml-2 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded transition-colors font-mono disabled:opacity-50"
                  >
                    FORCE SLEEP
                  </button>
                </div>
              </div>

              {/* Terminal Content */}
              <div
                ref={terminalScrollRef}
                className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-[13px] leading-7 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent"
              >
                {isLoaded && messages.map((msg) => (
                  <div key={msg.id} className="space-y-4">
                    {msg.role === "user" ? (
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold shrink-0">user@local</span>
                        <span className="text-neutral-600">~</span>
                        <span className="text-neutral-500">$</span>
                        <span className="text-neutral-200 ml-1">{msg.content}</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Improved Log Entry Rendering */}
                        {msg.isLogEntry ? (
                          <div className={`flex items-start gap-2 py-2 border-l-2 pl-3 ${msg.logType === 'error' ? 'border-red-500/50 bg-red-500/5' :
                            msg.logType === 'warning' ? 'border-yellow-500/50 bg-yellow-500/5' :
                              msg.logType === 'success' ? 'border-green-500/50 bg-green-500/5' : 'border-blue-500/50 bg-blue-500/5'
                            }`}>
                            <span className={`text-[10px] font-bold uppercase min-w-[50px] ${msg.logType === 'error' ? 'text-red-400' :
                              msg.logType === 'warning' ? 'text-yellow-400' :
                                msg.logType === 'success' ? 'text-green-400' : 'text-blue-400'
                              }`}>
                              [{msg.logType || 'info'}]
                            </span>
                            <span className="text-neutral-400 text-[11px] leading-tight flex-1">
                              {(() => {
                                try {
                                  if (msg.content.includes('{"brief":')) {
                                    const parsed = JSON.parse(msg.content);
                                    return parsed.brief;
                                  }
                                } catch { }
                                return msg.content;
                              })()}
                            </span>
                          </div>
                        ) : (
                          /* Main Response (Clean & Minimal) */
                          <div className={`space-y-2 p-2 ${severityStyles[getSeverity(msg)]}`}>
                            {/* Small simple badge for only major stuff */}
                            {(msg.isInitial || (msg.sources && (msg.sources.includes("aether.sleep_cycle") || msg.sources.includes("world_model.simulation")))) && (
                              <div className="flex items-center gap-2 mb-1 opacity-50">
                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                  {msg.isInitial ? "Brief" : "System Insight"}
                                </span>
                              </div>
                            )}
                            <div className="text-neutral-300 leading-relaxed">
                              {renderMarkdown ? (
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="whitespace-pre-wrap mb-2">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc ml-5 space-y-1 text-neutral-300">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal ml-5 space-y-1 text-neutral-300">{children}</ol>,
                                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                                    em: ({ children }) => <em className="text-neutral-200 italic">{children}</em>,
                                    code: ({ className, children, ...props }) => {
                                      const inline = !className;
                                      if (inline) {
                                        return (
                                          <code className="px-1.5 py-0.5 rounded bg-[#252526] border border-[#3c3c3c] text-[#ce9178] text-[12px]">
                                            {children}
                                          </code>
                                        );
                                      }
                                      return (
                                        <DashboardCodeBlock className={className} {...props}>
                                          {children}
                                        </DashboardCodeBlock>
                                      );
                                    },
                                  }}
                                >
                                  {typeof msg.content === "string" ? msg.content : "Data structure error"}
                                </ReactMarkdown>
                              ) : (
                                <pre className="whitespace-pre-wrap break-words text-neutral-300">{typeof msg.content === "string" ? msg.content : "Data structure error"}</pre>
                              )}
                              {msg.extra && (
                                <ul className="mt-3 space-y-1 text-neutral-400 border-l border-white/10 pl-4">
                                  {msg.extra.map((item, idx) => (
                                    <li key={idx} className="text-xs">{item}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isProcessing && !messages.some(m => m.id.startsWith("ai-stream-")) && (
                  <div className="space-y-2 animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold">user@local</span>
                      <span className="text-neutral-600">~</span>
                      <span className="text-neutral-500">$</span>
                      <div className="w-2 h-4 bg-purple-400/50" />
                    </div>
                    <div className="text-[11px] text-neutral-600 font-mono italic">
                      [aether] system.routing_neural_request...
                    </div>
                  </div>
                )}
              </div>

              {/* Terminal Input Area */}
              <div className="px-4 py-3 border-t border-[#303030] bg-[#1e1e1e] shrink-0">
                <div className="relative flex items-center gap-2 bg-[#3c3c3c]/30 border border-[#3c3c3c] rounded-lg px-4 py-2 focus-within:border-purple-500/50 transition-all bg-[#252526]">
                  {suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg overflow-hidden shadow-2xl z-50">
                      {suggestions.map((s, i) => {
                        const baseCommand = s.split(" ")[0];
                        const cmdInfo = COMMANDS.find(c => c.cmd === baseCommand);
                        const isLogsLimitSuggestion = s.startsWith("/logs ");
                        const suggestionLabel = isLogsLimitSuggestion ? s.replace("/logs ", "") : s;
                        const suggestionDesc = isLogsLimitSuggestion ? "Format: /logs [limit]" : cmdInfo?.desc;
                        return (
                          <div
                            key={s}
                            onClick={() => {
                              const nextInput = s + " ";
                              setInput(nextInput);
                              updateSuggestions(nextInput);
                            }}
                            className={`px-4 py-2 cursor-pointer flex justify-between items-center ${i === activeSuggestionIndex ? "bg-purple-500/20 text-purple-400" : "text-[#858585] hover:bg-white/5"}`}
                          >
                            <span className="font-mono text-sm">{suggestionLabel}</span>
                            <span className="text-[10px] opacity-60 italic">{suggestionDesc}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <span className="text-purple-400/50 font-mono text-sm font-bold">user@local:</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder={config.SYSTEM_LANGUAGE === 'en'
                      ? "Execute system command or run task..."
                      : "Wydaj komendę systemową lub zleć zadanie..."
                    }
                    className="flex-1 bg-transparent text-[#cccccc] text-sm placeholder:text-[#858585] focus:outline-none"
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isProcessing}
                    className="p-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400/60 hover:text-purple-400 transition-colors disabled:opacity-20"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Right: Recent Activity */}
            {showActivity && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="col-span-4 bg-[#252526] border border-[#303030] rounded-2xl flex flex-col overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                  <Link href="/logs" className="text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors font-mono">
                    View All {"->"}
                  </Link>
                </div>
                <div className="px-3 py-2 border-b border-white/5 flex items-center gap-1.5">
                  <button onClick={() => setActivityFilter("all")} className={`text-[10px] px-2 py-1 rounded border ${activityFilter === "all" ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"}`}>All</button>
                  <button onClick={() => setActivityFilter("errors")} className={`text-[10px] px-2 py-1 rounded border ${activityFilter === "errors" ? "bg-red-500/20 border-red-500/30 text-red-300" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"}`}>Errors</button>
                  <button onClick={() => setActivityFilter("memory")} className={`text-[10px] px-2 py-1 rounded border ${activityFilter === "memory" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"}`}>Memory</button>
                  <button onClick={() => setActivityFilter("sessions")} className={`text-[10px] px-2 py-1 rounded border ${activityFilter === "sessions" ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300" : "bg-white/5 border-white/10 text-neutral-400 hover:text-white"}`}>Sessions</button>
                </div>
                <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-white/5">
                  {filteredActivities.map((activity, i) => {
                    let Icon = Activity;
                    if (activity.icon === "Brain") Icon = Brain;
                    if (activity.icon === "MessageSquare") Icon = MessageSquare;

                    return (
                      <motion.button
                        key={`${activity.time}-${i}-${activity.text.slice(0, 12)}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.04 }}
                        onClick={() => handleActivityClick(activity)}
                        className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer"
                        title="Open related view"
                      >
                        <Icon className={`w-3.5 h-3.5 ${activity.color} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-neutral-300 leading-relaxed block truncate">{activity.text}</span>
                          <span className="text-[10px] text-neutral-600 font-mono">{activity.time}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                  {filteredActivities.length === 0 && (
                    <div className="px-5 py-8 text-center text-xs text-neutral-500 italic">No activity in this filter.</div>
                  )}
                </div>
              </motion.div>
            )}
          </div>



        </div>

      </main>
    </div>
  );
}



