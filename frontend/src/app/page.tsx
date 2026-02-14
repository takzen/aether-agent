"use client";

import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, Zap, Shield, Database, Cpu, Network } from "lucide-react";
import { AetherLogo } from "@/components/AetherLogo";
import { useRef, useState, useEffect } from "react";

function Spotlight({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`relative group border border-white/10 bg-neutral-900/50 overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(120, 50, 255, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const smoothScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

    // Orb Animations
    const orbScale = useTransform(smoothScroll, [0, 0.5], [1, 2.5]);
    const orbOpacity = useTransform(smoothScroll, [0, 0.3], [1, 0]);
    const orbY = useTransform(smoothScroll, [0, 0.5], [0, 500]);

    // Content Reveal
    const contentY = useTransform(smoothScroll, [0.1, 0.5], [100, 0]);
    const contentOpacity = useTransform(smoothScroll, [0.1, 0.4], [0, 1]);

    return (
        <div ref={containerRef} className="bg-[#020202] text-white min-h-[300vh] selection:bg-purple-500/30 font-sans overflow-x-hidden">

            {/* --- CINEMATIC BACKGROUND --- */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 inset-x-0 z-50 flex justify-between items-center px-8 py-6 mix-blend-difference text-white">
                <div className="flex items-center gap-2">
                    <AetherLogo className="w-8 h-8" />
                    <span className="font-bold tracking-tighter text-xl">AETHER</span>
                </div>
                <div className="flex gap-4 items-center">
                    <Link href="https://github.com/takzen/aether-agent" target="_blank" className="hidden md:block text-neutral-400 hover:text-white transition-colors">GitHub</Link>
                    <Link href="/dashboard" className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:scale-105 transition-transform">
                        Launch Console
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION: THE ORB --- */}
            <section className="relative h-screen flex flex-col items-center justify-center perspective-1000 overflow-hidden">

                <motion.div
                    style={{ scale: orbScale, opacity: orbOpacity, y: orbY }}
                    className="absolute z-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px]"
                >
                    {/* THE CORE - Multiple spinning layers */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-blue-600/30 rounded-full blur-[80px] animate-pulse" />
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[10%] border border-white/10 rounded-full border-t-white/50 border-r-transparent"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[20%] border border-white/10 rounded-full border-b-white/50 border-l-transparent"
                    />
                    <motion.div
                        animate={{ rotate: 180 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[30%] border border-dashed border-white/20 rounded-full"
                    />
                    {/* Inner Glow */}
                    <div className="absolute inset-[35%] bg-white/5 rounded-full blur-2xl flex items-center justify-center">
                        <div className="w-full h-full bg-white/10 rounded-full animate-ping opacity-20" />
                    </div>
                </motion.div>

                <div className="relative z-10 text-center space-y-6 mix-blend-normal">
                    <motion.h1
                        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1 }}
                        className="text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40"
                    >
                        SECOND <br /> BRAIN.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-xl md:text-2xl text-neutral-400 max-w-xl mx-auto uppercase tracking-[0.2em]"
                    >
                        Infinite Memory • Local Privacy
                    </motion.p>
                </div>

                <motion.div
                    style={{ opacity: orbOpacity }}
                    className="absolute bottom-12 flex flex-col items-center gap-2 text-neutral-500 animate-bounce"
                >
                    <span className="text-xs uppercase tracking-widest">Scroll to Initialize</span>
                    <ArrowRight className="rotate-90 w-4 h-4" />
                </motion.div>
            </section>


            {/* --- FEATURES: BENTO GRID WITH SPOTLIGHT --- */}
            <motion.section
                style={{ y: contentY, opacity: contentOpacity }}
                className="relative z-10 max-w-7xl mx-auto px-6 py-32"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">

                    {/* Feature 1: Large Card */}
                    <Spotlight className="md:col-span-2 rounded-[2rem] p-10 flex flex-col justify-between group cursor-default">
                        <div className="space-y-4 relative z-20">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/20">
                                <Cpu className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-4xl font-medium text-white tracking-tight">Neural Processing</h2>
                            <p className="text-lg text-neutral-400 max-w-md">
                                Aether isn't just a chatbot. It's a cognitive engine. Utilizing Gemini 1.5 Flash, it processes thousands of context tokens in milliseconds.
                            </p>
                        </div>
                        {/* Visual for F1 */}
                        <div className="relative h-32 w-full mt-8 overflow-hidden rounded-xl border border-white/5 bg-black/50 flex items-center gap-2 px-4 font-mono text-xs text-green-400 select-none">
                            <span className="animate-pulse">&gt;&gt;&gt; PROCESSING REQUEST...</span>
                            {/* Simulated code streams */}
                            <div className="absolute right-0 top-0 bottom-0 w-2/3 bg-gradient-to-l from-[#020202] to-transparent z-10" />
                            <div className="absolute right-4 top-4 text-neutral-600 text-[10px] space-y-1 text-right">
                                <div>CTX: 128k</div>
                                <div>LAT: 12ms</div>
                                <div>VEC: OK</div>
                            </div>
                        </div>
                    </Spotlight>

                    {/* Feature 2: Vertical Card */}
                    <Spotlight className="md:col-span-1 rounded-[2rem] p-10 flex flex-col relative group overflow-hidden cursor-default">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                        <div className="relative z-20 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                                <Database className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-2xl font-medium tracking-tight">Total Recall</h3>
                            <p className="text-neutral-400">
                                Vector search ensures Aether never forgets a detail. It learns from every interaction.
                            </p>
                        </div>
                        <div className="mt-auto relative h-48 w-full">
                            {/* Abstract Graph Nodes */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1.5 h-1.5 bg-white rounded-full box-shadow-[0_0_10px_white]"
                                    initial={{ opacity: 0.2 }}
                                    animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                                    transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
                                    style={{
                                        top: Math.random() * 80 + "%",
                                        left: Math.random() * 80 + "%",
                                    }}
                                />
                            ))}
                            <svg className="absolute inset-0 w-full h-full opacity-30">
                                <path d="M20,100 C50,50 150,150 200,50" stroke="white" fill="none" strokeWidth="1" strokeDasharray="4 4" />
                                <path d="M100,150 C120,100 80,50 180,20" stroke="white" fill="none" strokeWidth="1" opacity="0.5" />
                            </svg>
                        </div>
                    </Spotlight>

                    {/* Feature 3: Card */}
                    <Spotlight className="md:col-span-1 rounded-[2rem] p-10 flex flex-col justify-between cursor-default">
                        <div className="space-y-4 relative z-20">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/20">
                                <Shield className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-3xl font-medium tracking-tight">Local First</h3>
                            <p className="text-neutral-400">Switch to Llama 3 instantly. Your sensitive data stays encrypted on your machine.</p>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-6">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-green-500 shadow-[0_0_10px_#22c55e]"
                            />
                        </div>
                    </Spotlight>

                    {/* Feature 4: Wide Card */}
                    <Spotlight className="md:col-span-2 rounded-[2rem] p-10 flex items-center overflow-hidden cursor-default">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full relative z-20">
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/20">
                                    <Network className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h3 className="text-3xl font-medium tracking-tight">Autonomous Agents</h3>
                                <p className="text-neutral-400">
                                    Delegate complex workflows. Research, email drafting, and scheduling happen in the background while you focus.
                                </p>
                                <Link href="/dashboard" className="inline-flex items-center gap-2 text-white border-b border-white/30 pb-1 hover:border-white transition-all hover:gap-3 mt-2">
                                    Explore Workflows <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="relative h-full min-h-[160px] bg-[#0A0A0A] rounded-xl border border-white/10 p-5 font-mono text-xs text-neutral-500 shadow-inner">
                                <div className="typing-effect space-y-2">
                                    <div className="text-purple-400">$ init agent --mode=research</div>
                                    <div>&gt; Connection established [SECURE]</div>
                                    <div>&gt; Scraping active sources...</div>
                                    <div className="flex items-center gap-2">
                                        <span>&gt; Processing</span>
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    </div>
                                    <div className="text-green-400 mt-2">&gt;&gt; Report generated successfully.</div>
                                </div>
                            </div>
                        </div>
                    </Spotlight>
                </div>
            </motion.section>

            {/* --- FOOTER CTA --- */}
            <section className="h-[80vh] flex flex-col items-center justify-center relative border-t border-white/5 bg-[#050505]">
                <div className="absolute inset-0 bg-gradient-to-b from-[#020202] to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />

                <div className="relative z-10 text-center space-y-8">
                    <h2 className="text-5xl md:text-9xl font-bold tracking-tighter opacity-10 hover:opacity-30 transition-opacity duration-700 cursor-default select-none">
                        AETHER
                    </h2>
                    <Link href="/dashboard" className="px-12 py-6 bg-white text-black text-xl font-bold rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] flex items-center gap-4 group">
                        ENTER SYSTEM <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <footer className="absolute bottom-8 text-neutral-600 text-xs uppercase tracking-widest">
                    &copy; 2026 Takzen • Aether Intelligence Layer
                </footer>
            </section>

        </div>
    );
}
