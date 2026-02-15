"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Zap, Shield, Cpu, Clock, Activity, MessageSquare, Send, Brain, Database, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  const [messages, setMessages] = useState<DashboardMessage[]>([
    {
      id: "initial-1",
      role: "user",
      content: "What did we discuss about the authentication system last week?",
      isInitial: true
    },
    {
      id: "initial-2",
      role: "assistant",
      content: "Last Tuesday, you outlined a JWT-based auth flow with refresh token rotation.",
      extra: [
        "Supabase Auth for session management",
        "RLS policies on all public tables",
        "Custom claims for role-based access"
      ],
      sources: ["conversation_feb_08.md", "auth_architecture.pdf"],
      isInitial: true
    }
  ]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: DashboardMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    // Mock AI "Processing" flow
    setTimeout(() => {
      const aiMsg: DashboardMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've analyzed the query "${userMsg.content}". Routing through neural core... Results matching context find 2 significant associations in recent logs.`,
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">

      <Sidebar />

      <main className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 flex flex-col relative z-10 p-6 gap-4">

          {/* System Info Strip */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 px-5 py-3 bg-white/[0.02] border border-white/5 rounded-xl shrink-0"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] font-mono text-green-400 uppercase">Online</span>
            </div>
            <span className="text-neutral-700">|</span>
            <div className="flex items-center gap-4 text-[11px] font-mono text-neutral-400">
              <span><Shield className="w-3 h-3 inline mr-1 text-green-400/60" />AES-256</span>
              <span className="text-neutral-700">•</span>
              <span><Zap className="w-3 h-3 inline mr-1 text-yellow-400/60" />12ms</span>
              <span className="text-neutral-700">•</span>
              <span><Cpu className="w-3 h-3 inline mr-1 text-blue-400/60" />1.2 TB</span>
              <span className="text-neutral-700">•</span>
              <span><Activity className="w-3 h-3 inline mr-1 text-purple-400/60" />99.9%</span>
            </div>
            <span className="text-neutral-700">|</span>
            <span className="text-[11px] font-mono text-neutral-500">Gemini 3.1 Pro</span>
          </motion.div>


          {/* Row 3: Chat + Activity */}
          <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">

            {/* Left: Chat with Agent (Terminal Style) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-8 bg-[#0a0a0a] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
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
                  <Link href="/chat" className="ml-3 text-[9px] bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-0.5 rounded transition-colors text-neutral-400 font-mono">
                    PRO TERMINAL
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
                            <span>[aether]</span> <span className="text-neutral-500 italic">Accessing neural associations...</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                            <span className="text-blue-400/50">[aether]</span>
                            <span className="text-green-400/60">Search complete</span>
                            <span>•</span>
                            <span>lat: {msg.isInitial ? "23ms" : "41ms"}</span>
                          </div>
                        </div>

                        {/* Main Response Box */}
                        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 text-[10px] text-green-400/70 font-bold uppercase tracking-widest border-b border-white/5 pb-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span>Aether Terminal Output</span>
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
              <div className="px-4 py-3 border-t border-white/5 bg-black/40 shrink-0">
                <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 focus-within:border-purple-500/40 transition-all">
                  <span className="text-purple-400/50 font-mono text-[10px] font-bold">AETHER_CMD:</span>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter command..."
                    className="flex-1 bg-transparent text-white font-mono text-sm placeholder:text-neutral-700 focus:outline-none"
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
              className="col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-bold text-white">Recent Activity</h3>
                <Link href="/logs" className="text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors font-mono">
                  View All →
                </Link>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {[
                  { icon: Brain, text: "Memory stored: 'Project architecture notes'", time: "2m ago", color: "text-purple-400" },
                  { icon: Database, text: "Knowledge base indexed 3 documents", time: "15m ago", color: "text-blue-400" },
                  { icon: Clock, text: "Daily briefing generated", time: "1h ago", color: "text-green-400" },
                  { icon: MessageSquare, text: "Chat session completed (12 turns)", time: "2h ago", color: "text-cyan-400" },
                  { icon: Zap, text: "Tool executed: web_search('AI news')", time: "3h ago", color: "text-yellow-400" },
                  { icon: Shield, text: "Security audit passed", time: "5h ago", color: "text-green-400" },
                  { icon: Globe, text: "Webhook delivered to Telegram", time: "6h ago", color: "text-blue-400" },
                ].map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="px-5 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors cursor-default"
                  >
                    <activity.icon className={`w-3.5 h-3.5 ${activity.color} shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-neutral-300 leading-relaxed block truncate">{activity.text}</span>
                      <span className="text-[10px] text-neutral-600 font-mono">{activity.time}</span>
                    </div>
                  </motion.div>
                ))}
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

        <ThoughtStream />
      </main>
    </div>
  );
}
