"use client";

import Sidebar from "@/components/Sidebar";
import { Zap, Shield, Cpu, Clock, Activity, MessageSquare, Send, Brain, Database, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface DashboardMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isInitial?: boolean;
  extra?: string[];
  sources?: string[];
}

export default function Home() {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<DashboardMessage[]>([]);

  const [stats, setStats] = useState({ memories: 0, documents: 0, reliability: 100, sessions: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [modelName, setModelName] = useState("Loading...");

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
      .catch(err => console.error("Stats error:", err));

    const fetchConfig = () => {
      fetch("http://localhost:8000/config")
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            const raw = data.config.MODEL_OVERRIDE || "gemini-3.1-pro";
            const formatted = raw
              .replace("ollama:", "")
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase());
            setModelName(formatted);
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
      .catch(err => console.error("Activity error:", err));

    // Fetch Morning Brief (Night Cycle Output)
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
        }
      })
      .catch(err => console.error("Morning Brief fetch error:", err));

    return () => window.removeEventListener("configUpdated", fetchConfig);
  }, []);

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

    const userMsg: DashboardMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const aiMsg: DashboardMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errorMsg: DashboardMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${data.message}`,
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: DashboardMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Error connecting to backend.",
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">

      <Sidebar />

      <main className="flex-1 flex min-w-0 relative overflow-hidden bg-background">
        <div className="flex-1 flex flex-col min-w-0 relative z-10 p-6 gap-4">

          {/* System Info Strip */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-5 py-3 bg-[#181818] border border-[#303030] rounded-xl shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] font-mono text-green-400 uppercase">Online</span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
              <span><Shield className="w-3 h-3 inline mr-1 text-green-400/60" />Memories: {stats.memories}</span>
              <span className="text-neutral-700">•</span>
              <span><Database className="w-3 h-3 inline mr-1 text-blue-400/60" />Docs: {stats.documents}</span>
              <span className="text-neutral-700">•</span>
              <span><MessageSquare className="w-3 h-3 inline mr-1 text-cyan-400/60" />Sessions: {stats.sessions}</span>
              <span className="text-neutral-700">•</span>
              <span><Activity className="w-3 h-3 inline mr-1 text-purple-400/60" />{stats.reliability}%</span>
            </div>
            <span className="text-neutral-700">|</span>
            <span className="text-[11px] font-mono text-neutral-500">{modelName}</span>
          </motion.div>


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
                <span className="ml-2 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">aether — session_live</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] text-green-500/70 font-mono font-bold tracking-tighter">CONNECTED</span>
                  <button
                    onClick={triggerSleepCycle}
                    disabled={isProcessing}
                    className="ml-3 text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-0.5 rounded transition-colors font-mono disabled:opacity-50"
                  >
                    FORCE SLEEP CYCLE
                  </button>
                  <Link href="/chat" className="ml-2 text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded transition-colors text-neutral-400 font-mono">
                    OPEN TECHNICAL CHAT
                  </Link>
                </div>
              </div>

              {/* Terminal Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                {messages.map((msg) => (
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
                        {/* Status lines (only for AI) */}
                        <div className="space-y-1 opacity-70">
                          <div className="text-blue-400/80">
                            <span>[aether]</span> <span className="text-neutral-500 italic">Evaluating system context & logs...</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                            <span className="text-blue-400/50">[aether]</span>
                            <span className="text-green-400/60">Report synthesized</span>
                            <span>•</span>
                            <span>sys.time: {msg.isInitial ? "07:12:00" : "now"}</span>
                          </div>
                        </div>

                        {/* Main Response Box */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 text-[10px] text-green-400/70 font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>Aether Morning Brief / Terminal Return</span>
                          </div>
                          <div className="text-neutral-300 space-y-3">
                            <p>{msg.content}</p>
                            {msg.extra && (
                              <ul className="space-y-1 text-neutral-400">
                                {msg.extra.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5">
                                    <span className="text-purple-600 mt-1">→</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {msg.sources && (
                              <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-neutral-600">
                                {msg.sources.map((src, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 border border-white/5 rounded">{src}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
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
                <div className="flex items-center gap-2 bg-[#3c3c3c]/30 border border-[#3c3c3c] rounded-lg px-4 py-2 focus-within:border-[#007acc]/50 transition-all bg-[#252526]">
                  <span className="text-purple-400/50 font-mono text-[10px] font-bold">AETHER_CMD:</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Execute system command or run task..."
                    className="flex-1 bg-transparent text-[#cccccc] font-mono text-sm placeholder:text-[#858585] focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSend();
                    }}
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
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
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

          {/* Bottom Bar */}
          <div className="flex items-center justify-between px-2 text-[10px] font-mono text-neutral-600 uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400/60">Online</span>
              </div>
              <span className="text-neutral-700">•</span>
              <span>Command Center</span>
            </div>
            <span>Aether v0.1.0-alpha</span>
          </div>

        </div>

      </main>
    </div>
  );
}
