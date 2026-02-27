"use client";

import Sidebar from "@/components/Sidebar";
import { Shield, Activity, MessageSquare, Send, Brain, Database } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCommand, DashboardMessage } from "@/context/CommandContext";

export default function Home() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages, setMessages, clearMessages, isLoaded } = useCommand();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const COMMANDS = [
    { cmd: "/logs", desc: "Podgląd logów systemowych" },
    { cmd: "/clear", desc: "Wyczyść okno terminala" },
    { cmd: "/logclear", desc: "Wyczyść bazę logów systemowych" },
    { cmd: "/simulate", desc: "Uruchom symulację modelu świata" }
  ];

  const [stats, setStats] = useState({ memories: 0, documents: 0, reliability: 100, sessions: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activities, setActivities] = useState<any[]>([]);
  const [modelName, setModelName] = useState("Loading...");
  const [config, setConfig] = useState<{ [key: string]: string }>({ SYSTEM_LANGUAGE: 'pl' });

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: `Error running night cycle: ${err.message}`
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const currentInput = input.trim();
    setInput("");

    // 1. Handle Slash Commands
    if (currentInput.startsWith("/")) {
      const [command, ...args] = currentInput.slice(1).split(" ");

      if (command === "clear") {
        clearMessages();
        const lang = config.SYSTEM_LANGUAGE || "pl";
        setMessages([{
          id: "welcome-" + Date.now(),
          role: "assistant",
          content: lang === 'en' ? "Aether Core initialized. Terminal cleared." : "Rdzeń Aether zainicjowany. Terminal wyczyszczony.",
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
            data.logs.reverse().forEach((l: any, idx: number) => {
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
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setMessages(prev => [...prev, {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: data.response,
        }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    // Only show suggestions if we are at the very beginning of a command and haven't typed a space yet
    if (val.startsWith("/") && !val.includes(" ")) {
      const filtered = COMMANDS
        .map(c => c.cmd)
        .filter(c => c.toLowerCase().startsWith(val.toLowerCase()));
      setSuggestions(filtered);
      setActiveSuggestionIndex(0);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // If suggestions are visible, autocomplete the command
      if (suggestions.length > 0) {
        setInput(suggestions[activeSuggestionIndex] + " ");
        setSuggestions([]);
      } else {
        handleSend();
      }
    } else if (e.key === "ArrowUp") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === "ArrowDown") {
      if (suggestions.length > 0) {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
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
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <div>
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">Command Center</h3>
              <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                <span>Core Interface & Command Control</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[10px] font-mono whitespace-nowrap">
              <span className="flex items-center gap-1.5 text-blue-400/80">
                <Database className="w-3 h-3" /> DOCS: {stats.documents}
              </span>
              <span className="text-neutral-700 select-none">•</span>
              <span className="flex items-center gap-1.5 text-purple-400/80">
                <Brain className="w-3 h-3" /> MEMS: {stats.memories}
              </span>
              <span className="text-neutral-700 select-none">•</span>
              <span className="flex items-center gap-1.5 text-cyan-400/80">
                <MessageSquare className="w-3 h-3" /> SESS: {stats.sessions}
              </span>
              <span className="text-neutral-700 select-none">•</span>
              <span className="flex items-center gap-1.5 text-green-500/80">
                <Shield className="w-3 h-3" /> {stats.reliability}%
              </span>
            </div>
            <div className="text-[10px] text-neutral-600 border-l border-white/10 pl-4 font-mono hidden lg:block">
              {modelName}
            </div>
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
              className="col-span-8 bg-[#1e1e1e] border border-[#303030] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Terminal Title Bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02] shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
                </div>
                <span className="ml-2 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">aether — root@dashboard</span>
                <div className="ml-auto flex items-center gap-1.5">
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
              <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
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
                          <div className={`flex items-start gap-2 py-0.5 border-l-2 pl-3 ${msg.logType === 'error' ? 'border-red-500/50 bg-red-500/5' :
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
                                } catch (e) { }
                                return msg.content;
                              })()}
                            </span>
                          </div>
                        ) : (
                          /* Main Response (Clean & Minimal) */
                          <div className="space-y-2">
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
                              <p className="whitespace-pre-wrap">{typeof msg.content === "string" ? msg.content : "Data structure error"}</p>
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

                {isProcessing && (
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
                <div className="relative flex items-center gap-2 bg-[#3c3c3c]/30 border border-[#3c3c3c] rounded-lg px-4 py-2 focus-within:border-[#007acc]/50 transition-all bg-[#252526]">
                  {suggestions.length > 0 && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg overflow-hidden shadow-2xl z-50">
                      {suggestions.map((s, i) => {
                        const cmdInfo = COMMANDS.find(c => c.cmd === s);
                        return (
                          <div
                            key={s}
                            onClick={() => {
                              setInput(s + " ");
                              setSuggestions([]);
                            }}
                            className={`px-4 py-2 cursor-pointer flex justify-between items-center ${i === activeSuggestionIndex ? "bg-purple-500/20 text-purple-400" : "text-[#858585] hover:bg-white/5"}`}
                          >
                            <span className="font-mono text-sm">{s}</span>
                            <span className="text-[10px] opacity-60 italic">{cmdInfo?.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <span className="text-purple-400/50 font-mono text-[10px] font-bold">AETHER_CMD:</span>
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Execute system command or run task..."
                    className="flex-1 bg-transparent text-[#cccccc] font-mono text-sm placeholder:text-[#858585] focus:outline-none"
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="col-span-4 bg-[#252526] border border-[#303030] rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                <Link href="/logs" className="text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors font-mono">
                  View All →
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-white/5">
                {activities.map((activity, i) => {
                  let Icon = Activity;
                  if (activity.icon === "Brain") Icon = Brain;
                  if (activity.icon === "MessageSquare") Icon = MessageSquare;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="px-5 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors cursor-default"
                    >
                      <Icon className={`w-3.5 h-3.5 ${activity.color} shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-neutral-300 leading-relaxed block truncate">{activity.text}</span>
                        <span className="text-[10px] text-neutral-600 font-mono">{activity.time}</span>
                      </div>
                    </motion.div>
                  )
                })}
                {activities.length === 0 && (
                  <div className="px-5 py-8 text-center text-xs text-neutral-500 italic">No recent activity detected.</div>
                )}
              </div>
            </motion.div>
          </div>



        </div>

      </main>
    </div>
  );
}
