"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Zap, Shield, Cpu, Clock, Activity, MessageSquare, Send, Brain, Database, Globe } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [message, setMessage] = useState("");

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

            {/* Left: Chat with Agent */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="col-span-8 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-white">Aether Agent</h3>
                </div>
                <Link href="/chat" className="text-[10px] text-purple-400/60 hover:text-purple-400 transition-colors font-mono">
                  Full Chat →
                </Link>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* System welcome */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-purple-400">AI</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      Welcome back! Your neural core is active and all systems are online. I have <span className="text-purple-400 font-medium">3 new memories</span> stored since your last session.
                    </p>
                    <p className="text-[10px] text-neutral-600 font-mono mt-2">Today, 14:30</p>
                  </div>
                </div>

                {/* User message */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-neutral-200 leading-relaxed">
                      What&apos;s the latest from my knowledge base?
                    </p>
                    <p className="text-[10px] text-neutral-600 font-mono mt-2">Today, 14:31</p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-white/60">TK</span>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <span className="text-[8px] font-bold text-purple-400">AI</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      I found <span className="text-blue-400 font-medium">3 recently indexed documents</span> in your knowledge base:
                    </p>
                    <ul className="mt-2 space-y-1.5 text-xs text-neutral-400">
                      <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" />Project architecture overview</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" />Authentication system design</li>
                      <li className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-blue-400" />API endpoint documentation</li>
                    </ul>
                    <p className="text-[10px] text-neutral-600 font-mono mt-2">Today, 14:31</p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="px-4 py-3 border-t border-white/5 shrink-0">
                <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-purple-500/30 transition-colors">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-white text-sm placeholder:text-neutral-600 focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && message.trim()) {
                        window.location.href = `/chat?q=${encodeURIComponent(message)}`;
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (message.trim()) {
                        window.location.href = `/chat?q=${encodeURIComponent(message)}`;
                      }
                    }}
                    className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
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
