"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-cyan-500/30">
            {/* Background Noise */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Glow Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
                <div className="max-w-[1400px] w-full mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">Main Engine</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <AetherLogo className="w-6 h-6 text-white" />
                        <span className="font-bold tracking-tighter text-lg uppercase">Privacy Policy</span>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 max-w-[1400px] w-full mx-auto px-8 py-32 space-y-24">
                <header className="max-w-5xl space-y-6">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                        Zero <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30">Telemetry.</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 font-light leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">Core Principle</h2>
                        <p className="text-lg text-neutral-400">
                            The Aether Agent architecture is built on the foundation of absolute privacy. Your source code, system configurations, and interaction logs never leave your designated environment unless explicitly transmitted to the underlying LLM provider (OpenAI, Anthropic, etc.) for inference processing.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">Data Storage</h2>
                        <p className="text-lg text-neutral-400">
                            We use localized storage mechanisms for the core agent logic:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-neutral-400 text-lg">
                            <li><strong className="text-white">Relational Data (SQLite):</strong> All session logs, command history, and custom directives are stored locally on the host machine.</li>
                            <li><strong className="text-white">Vector Memory (Qdrant):</strong> Semantic indices and RAG embeddings are isolated within your specific Qdrant instance.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">Aether Pro Hosting</h2>
                        <p className="text-lg text-neutral-400">
                            For users utilizing the managed Aether Pro infrastructure, backend containers are deployed on secure, isolated Hetzner environments. We do not index, read, or monetize any data processed by your instance.
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
