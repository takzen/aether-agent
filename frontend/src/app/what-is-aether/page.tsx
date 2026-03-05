"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Brain, Shield, Database, Terminal } from "lucide-react";

const AetherLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-20" />
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" className="opacity-40" />
        <motion.path
            d="M50 20 L80 50 L50 80 L20 50 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.circle
            cx="50"
            cy="50"
            r="8"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
        />
    </svg>
);

export default function WhatIsAetherPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30">
            {/* Background Noise */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Glow Orbs */}
            <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
                <div className="max-w-[1400px] w-full mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">Main Engine</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <AetherLogo className="w-6 h-6 text-white" />
                        <span className="font-bold tracking-tighter text-lg uppercase">What is Aether</span>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 max-w-[1400px] w-full mx-auto px-8 py-32 space-y-32">
                <header className="max-w-5xl space-y-8">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                        The Engineering <br />
                        <span className="text-neutral-500">Scaffold.</span>
                    </h1>
                    <p className="text-xl text-neutral-400 font-light leading-relaxed max-w-2xl">
                        Aether is not another chatbot. It is a stateful, fully autonomous persistence layer designed specifically for software engineers.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <section className="space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Stateful Memory</h2>
                        <p className="text-neutral-400 text-lg font-light leading-relaxed">
                            Unlike traditional stateless LLM interfaces, Aether retains a complete graph of your interactions. Vector embeddings are pushed to an isolated Qdrant vector database, while relational data maps out concept nodes. It remembers what you did last week.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <Terminal className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Deterministic Operations</h2>
                        <p className="text-neutral-400 text-lg font-light leading-relaxed">
                            We bypassed "AI hallucination" by strictly typing tool requests through Pydantic models. Aether utilizes concrete bash interfaces, system file-read capabilities, and explicit Git operations under a robust Human-in-the-Loop constraint.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-pink-400" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Absolute Data Sovereignty</h2>
                        <p className="text-neutral-400 text-lg font-light leading-relaxed">
                            Your proprietary code remains on your machine. The Open Core system guarantees that nothing gets pushed to closed-source training nodes without your explicit inference requests. Fully transparent. Totally private.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <Database className="w-6 h-6 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">Hybrid Cloud Infrastructure</h2>
                        <p className="text-neutral-400 text-lg font-light leading-relaxed">
                            Aether is designed to run bare-metal locally, or scale infinitely via the Aether Pro managed infrastructure. Backend workloads operate in isolated Hetzner environments connected directly to Vercel edge networks.
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-8 flex flex-col items-center gap-6 mt-12">
                <div className="text-[10px] text-neutral-700 font-mono uppercase tracking-[0.2em]">
                    &copy; 2026 AETHER
                </div>
            </footer>
        </div>
    );
}
