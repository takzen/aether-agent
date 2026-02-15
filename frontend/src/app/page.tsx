"use client";

import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, Zap, Shield, Database, Cpu, Network, Lock, Github } from "lucide-react";
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
        <div ref={containerRef} className="bg-[#020202] text-white min-h-screen selection:bg-purple-500/30 font-sans overflow-x-hidden">

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
                <div className="flex gap-8 items-center">
                    <div className="hidden md:flex items-center gap-2 group cursor-default">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.3em] group-hover:text-green-500 transition-colors">System: Online</span>
                    </div>
                    <Link href="https://github.com/takzen/aether-agent" target="_blank" className="hidden lg:block text-neutral-400 hover:text-white transition-colors text-sm font-medium">GitHub</Link>
                    <Link href="/dashboard" className="px-6 py-2 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all text-sm font-medium backdrop-blur-md">
                        Access Terminal
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


            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-7xl mx-auto px-6 py-32"
            >
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-sm font-mono text-purple-400 uppercase tracking-[0.3em]">The Architecture</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Personal Intelligence Layer</h3>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        Aether is not a chatbot. It is an engineering scaffold designed to think, remember, and process your world.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Feature 1: Long-term Memory (The Core) */}

                    <Spotlight className="lg:col-span-2 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 group cursor-default relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-[380px]">

                        {/* Left Side: Content */}
                        <div className="flex-1 flex flex-col justify-center z-20">
                            <div className="space-y-6">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <span className="text-xl">🧠</span>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Long-Term Memory</h2>
                                    <p className="text-lg text-neutral-400 leading-relaxed font-light mb-4">
                                        Aether learns you with every conversation. You strictly never have to repeat yourself. It builds your digital profile automatically.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Dedicated Animation Container */}
                        <div className="flex-1 rounded-2xl bg-black/50 border border-white/5 relative overflow-hidden flex items-center justify-center h-full">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                            {/* The Vector Search Animation */}
                            <div className="relative w-full h-full p-4">
                                {/* Vector Space Grid */}
                                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-8 p-12 opacity-30">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 bg-neutral-600 rounded-full relative"
                                            initial={{ opacity: 0.2 }}
                                            animate={{
                                                opacity: [0.2, 0.8, 0.2],
                                                scale: [1, 1.5, 1],
                                                backgroundColor: ["#525252", "#a855f7", "#525252"]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: Math.random() * 2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Active Search Beam (Radar Scan) */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-1/2 -translate-y-1/2"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" }}
                                />

                                {/* Found Match Connection */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <motion.line
                                        x1="50%" y1="50%" x2="70%" y2="30%"
                                        stroke="rgba(168, 85, 247, 0.4)"
                                        strokeWidth="2"
                                        strokeDasharray="5,5"
                                        animate={{ strokeDashoffset: [0, -20] }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <motion.line
                                        x1="50%" y1="50%" x2="30%" y2="70%"
                                        stroke="rgba(168, 85, 247, 0.2)"
                                        strokeWidth="1"
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </svg>

                                {/* Central Core (Query Origin) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-6 h-6 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse flex items-center justify-center">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full" />
                                    </div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-purple-600/10 rounded-full blur-xl" />
                                </div>

                                {/* Floating Labels - Search Context */}
                                <motion.div
                                    className="absolute top-[20%] right-[20%] px-3 py-1.5 bg-black/80 border border-purple-500/50 rounded-lg text-[10px] text-white font-mono shadow-lg z-20"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
                                >
                                    <div className="text-purple-300 text-[8px] uppercase tracking-wider mb-0.5">Similarity Match</div>
                                    <div className="font-bold">0.9248 SCORE</div>
                                </motion.div>

                                <motion.div
                                    className="absolute bottom-[20%] left-[20%] px-3 py-1.5 bg-black/80 border border-white/10 rounded-lg text-[10px] text-neutral-400 font-mono z-10"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    &gt; QUERY_EMBEDDING...
                                </motion.div>
                            </div>
                        </div>
                    </Spotlight>

                    {/* Feature 2: Knowledge Base (Narrow) */}
                    <Spotlight className="lg:col-span-1 rounded-[2rem] p-6 flex flex-col relative group overflow-hidden cursor-default bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-[380px]">
                        <div className="relative z-20 space-y-6 h-full flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                                <Database className="w-6 h-6 text-blue-400" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-white">Your Knowledge Base</h2>
                                <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                    Drop in your PDFs, notes, and research. Aether indexes them instantly.
                                </p>
                            </div>

                            {/* Compact Visualization: File Scanning */}
                            <div className="mt-auto rounded-xl bg-black/50 border border-white/5 relative overflow-hidden h-[140px] flex flex-col">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 blur-[2px] z-10 box-shadow-[0_0_15px_#3b82f6]"
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="p-4 space-y-3 font-mono text-[10px] text-neutral-500 overflow-hidden">
                                    {["specs_v2.pdf", "notes.md", "diagram.png", "budget.xlsx", "user_profile.json", "contract_final.pdf"].map((file, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-center justify-between border-b border-white/5 pb-2"
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.2 }}
                                        >
                                            <span className="text-neutral-400 truncate max-w-[100px]">{file}</span>
                                            <span className="text-blue-500">OK</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Spotlight>

                    {/* Feature 3: Transparent Thought Stream (Narrow) */}
                    <Spotlight className="lg:col-span-1 rounded-[2rem] p-6 flex flex-col relative group overflow-hidden cursor-default bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-[380px]">
                        <div className="relative z-20 space-y-6 h-full flex flex-col">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                                <Network className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold tracking-tight text-white">Thought Stream</h2>
                                <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                    Trust is built on visibility. Watch the Chain of Thought in real-time.
                                </p>
                            </div>

                            {/* Compact Visualization: Terminal */}
                            <div className="mt-auto rounded-xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden flex flex-col h-[140px] font-mono text-[10px] shadow-2xl">
                                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/5 z-20">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                    <span className="ml-2 text-neutral-500 text-xs">thought_stream.log</span>
                                </div>

                                <div className="p-4 space-y-1 overflow-hidden relative flex-1">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]/20 pointer-events-none z-10" />

                                    <motion.div
                                        className="flex flex-col gap-1.5"
                                        animate={{ y: [0, -120] }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="text-neutral-500 text-[9px] mb-2">// INITIATING REASONING CHAIN</div>

                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:01]</span>
                                            <span className="text-neutral-300">Parsing user intent...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:02]</span>
                                            <span className="text-purple-400">Context retrieved: 4 chunks</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:03]</span>
                                            <span className="text-neutral-400">Filtering irrelevant nodes...</span>
                                        </div>
                                        <div className="flex gap-2 pl-4 border-l border-neutral-800">
                                            <span className="text-neutral-600">&gt; Node A: Valid (0.91)</span>
                                        </div>
                                        <div className="flex gap-2 pl-4 border-l border-neutral-800">
                                            <span className="text-neutral-600">&gt; Node B: Discarded</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:05]</span>
                                            <span className="text-orange-400">Formulating hypothesis...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:08]</span>
                                            <span className="text-green-400">Generating final response.</span>
                                        </div>

                                        <div className="text-neutral-500 text-[9px] mt-2 mb-2">// NEW CYCLE START</div>

                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:12]</span>
                                            <span className="text-neutral-300">Await input...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:13]</span>
                                            <span className="text-purple-400">Detecting pattern match</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-blue-500">[00:15]</span>
                                            <span className="text-neutral-400">Optimizing query path...</span>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </Spotlight>

                    {/* Feature 4: Hybrid Core (Wide) */}
                    <Spotlight className="lg:col-span-2 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 group cursor-default relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-[380px]">

                        {/* Left Side: Content */}
                        <div className="flex-1 flex flex-col justify-center z-20">
                            <div className="space-y-8">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                                    <Cpu className="w-7 h-7 text-purple-400" />
                                </div>
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Hybrid Core</h2>
                                    <p className="text-lg text-neutral-400 leading-relaxed font-light mb-4">
                                        Switch between SOTA cloud models (Gemini 3) for reasoning and local weights (Llama 3) for privacy. You own the stack.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Visualization (Rich Mission Control) */}
                        <div className="flex-1 rounded-2xl bg-[#050505] border border-white/10 relative overflow-hidden flex flex-col items-center justify-center h-full shadow-2xl">
                            {/* Background Grid Animation */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent opacity-50"
                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                transition={{ duration: 4, repeat: Infinity }}
                            />

                            <div className="flex flex-col gap-3 w-full max-w-sm p-6 relative z-10">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-1 text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                                    <span>Available Models</span>
                                    <span>Status</span>
                                </div>

                                {/* Model 1: Gemini 3 */}
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-4 h-4 text-blue-400" />
                                        <div>
                                            <div className="text-xs font-bold text-white">Gemini 3 Ultra</div>
                                            <div className="text-[9px] text-neutral-500">Google DeepMind • 1M Context</div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-neutral-500 font-mono">READY</span>
                                </div>

                                {/* Model 2: GPT-4o */}
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-sm bg-green-500/20 flex items-center justify-center text-[10px] text-green-400 font-bold">O</div>
                                        <div>
                                            <div className="text-xs font-bold text-white">GPT-4o</div>
                                            <div className="text-[9px] text-neutral-500">OpenAI • Omni Model</div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-neutral-500 font-mono">READY</span>
                                </div>

                                {/* Model 3: Claude 3.5 */}
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-orange-500/20 flex items-center justify-center text-[10px] text-orange-400 font-bold">C</div>
                                        <div>
                                            <div className="text-xs font-bold text-white">Claude 3.5 Sonnet</div>
                                            <div className="text-[9px] text-neutral-500">Anthropic • Reasoning</div>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-neutral-500 font-mono">READY</span>
                                </div>

                                {/* Divider */}
                                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent my-1" />

                                {/* Model 4: Llama 3 (Active) */}
                                <div className="relative">
                                    <motion.div
                                        className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50 opacity-30 blur-sm"
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    <div className="p-3 rounded-lg bg-[#0a0a0a] border border-green-500/30 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-3">
                                            <Lock className="w-4 h-4 text-green-400" />
                                            <div>
                                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                                    Llama 3
                                                    <span className="text-[8px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/20">LOCAL</span>
                                                </div>
                                                <div className="text-[9px] text-green-400/70">Meta • 8B Parameters • Private</div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-[9px] text-green-400 font-bold">ACTIVE</span>
                                            </div>
                                            <span className="text-[9px] text-neutral-500">12ms</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Spotlight>
                </div>
            </motion.section>

            {/* --- FOOTER (COMPACT & PROFESSIONAL) --- */}
            <section className="relative w-full border-t border-white/10 bg-[#050505] py-16 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

                {/* Footer Glow - Subtle */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-purple-900/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center space-y-8 max-w-4xl px-6">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            Not just a wrapper. <span className="text-neutral-500">Structured Engineering.</span>
                        </h2>
                        <p className="text-base text-neutral-400 leading-relaxed max-w-xl mx-auto">
                            Aether is an engineering scaffold that turns raw algorithms into a capable, personal agent.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] text-sm">
                            <span>Initialize Aether</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link href="https://github.com/takzen/aether-agent" className="px-6 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors text-sm">
                            <Github className="w-4 h-4" />
                            <span>View Source</span>
                        </Link>
                    </div>
                </div>

                <div className="mt-16 w-full px-6 flex flex-col md:flex-row justify-between items-center text-neutral-600 text-[10px] uppercase tracking-widest font-mono border-t border-white/5 pt-6 max-w-7xl">
                    <span>&copy; 2026 Aether Protocol</span>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="flex items-center gap-2 text-neutral-500">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            System Healthy
                        </span>
                        <span className="text-neutral-500">v0.1.0-alpha</span>
                    </div>
                </div>
            </section>

        </div>
    );
}
