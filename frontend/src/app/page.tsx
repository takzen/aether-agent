"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Bot, Cpu, Shield, Zap, Globe, Database } from "lucide-react";

import { AetherLogo } from "@/components/AetherLogo";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] opacity-40 animate-pulse [animation-delay:2s]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-md border-b border-white/5 bg-background/50">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <AetherLogo className="w-10 h-10" />
                    <span className="font-bold tracking-tight text-lg group-hover:text-primary transition-colors">AETHER</span>
                </div>
                <div className="flex gap-4">
                    {/* Placeholder for Auth/Login */}
                    <Link href="/dashboard" className="px-5 py-2 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                        Log In
                    </Link>
                    <Link href="/dashboard" className="px-5 py-2 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all glow-primary flex items-center gap-2">
                        Launch Console <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </nav>

            <main className="relative z-10 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl space-y-8 flex flex-col items-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        SYSTEM V1.0 STABLE • GEMINI 3 FLASH CORE ONLINE
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.1]">
                        Your Second Brain. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-300 to-secondary">Running on Aether.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        The proactive, privacy-first personal intelligence layer.
                        Automate tasks, manage knowledge, and extend your cognitive capabilities with a neural interface that lives where you do.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 mb-16">
                        <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:scale-105 active:scale-95 transition-transform glow-primary flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5 fill-current" /> Initialize Core
                        </Link>
                        <Link href="https://github.com/takzen/aether-agent" target="_blank" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-medium text-lg transition-colors flex items-center justify-center gap-2">
                            <Globe className="w-5 h-5" /> View Source
                        </Link>
                    </div>
                </motion.div>

                {/* Feature Highlights - High Impact */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

                    {/* Feature 1: Memory */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-1 text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-[#050510] rounded-[22px] p-8 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary glow-primary">
                                    <Database className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">RAG Architecture</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Total Recall.</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Aether doesn't just process; it remembers. Every document, chat, and idea is indexed in a vector database for instant retrieval. It's infinite context for your life.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 2: Privacy */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-1 text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-[#050510] rounded-[22px] p-8 flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary glow-secondary">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">Local First</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Your Data. Your Rules.</h3>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Switch between cloud intelligence (Gemini 3) and local privacy (Llama 3) instantly. Your most sensitive thoughts never have to leave your machine.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Feature 3: Full Width - Proactivity */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-1 text-left"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative h-full bg-[#050510] rounded-[22px] p-10 md:p-12 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium uppercase tracking-wider">
                                    <Zap className="w-3 h-3" /> Autonomous Agents
                                </div>
                                <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-200">
                                    Proactive Intelligence.
                                </h3>
                                <p className="text-xl text-muted-foreground max-w-xl">
                                    Aether doesn't wait for commands. It anticipates needs. From scheduling research to drafting emails while you sleep, it's an agent that works 24/7.
                                </p>
                            </div>

                            {/* Visual Representation of Agent Activity */}
                            <div className="relative w-full md:w-1/3 aspect-square max-w-[300px]">
                                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative z-10 w-full h-full border border-white/10 rounded-2xl bg-black/40 backdrop-blur-xl flex items-center justify-center">
                                    <Bot className="w-24 h-24 text-white/80" />
                                    {/* Orbiting Elements */}
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-4 border border-dashed border-white/20 rounded-full"
                                    />
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-12 border border-dotted border-white/40 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Footer */}
                <footer className="mt-32 border-t border-white/5 pt-12 text-sm text-muted-foreground">
                    <p>© 2026 Aether Intelligence Layer. Built with obsession.</p>
                </footer>

            </main>
        </div>
    );
}
