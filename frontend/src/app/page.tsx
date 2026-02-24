"use client";

import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, Zap, Shield, Database, Cpu, Network, Lock, Github } from "lucide-react";
import { AetherLogo } from "@/components/AetherLogo";
import { useRef } from "react";

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

    // Content Reveal (unused but kept for future use)
    // const contentY = useTransform(smoothScroll, [0.1, 0.5], [100, 0]);
    // const contentOpacity = useTransform(smoothScroll, [0.1, 0.4], [0, 1]);

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
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                    <AetherLogo className="w-8 h-8" />
                    <span className="font-bold tracking-tighter text-xl">AETHER</span>
                </button>
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-4 pt-40 pb-32 scroll-mt-32"
                id="features"
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

                    <Spotlight className="lg:col-span-2 rounded-[2rem] p-6 flex flex-col group cursor-default relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-auto md:h-[380px]">
                        <div className="relative z-20 h-full flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Long-Term Memory</h2>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex-shrink-0">
                                    <span className="text-xl">🧠</span>
                                </div>
                            </div>
                            <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                Aether learns you with every conversation. You strictly never have to repeat yourself. It builds your digital profile automatically.
                            </p>

                            {/* Bottom: Animation Container (same pattern as Cards 2 & 3) */}
                            <div className="mt-auto rounded-xl bg-black/50 border border-white/5 relative overflow-hidden h-[180px]">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />

                                {/* Vector Space Grid */}
                                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-4 p-6 opacity-30">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-1.5 h-1.5 bg-neutral-600 rounded-full"
                                            initial={{ opacity: 0.2 }}
                                            animate={{
                                                opacity: [0.2, 0.8, 0.2],
                                                scale: [1, 1.5, 1],
                                                backgroundColor: ["#525252", "#a855f7", "#525252"]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 0.1,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Active Search Beam (Radar Scan) */}
                                <motion.div
                                    className="absolute top-1/2 left-1/2 w-[200px] h-[200px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-purple-500/15 to-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%)" }}
                                />

                                {/* Found Match Connection Line */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <motion.line
                                        x1="50%" y1="50%" x2="75%" y2="25%"
                                        stroke="rgba(168, 85, 247, 0.5)"
                                        strokeWidth="2"
                                        strokeDasharray="4,4"
                                        animate={{ strokeDashoffset: [0, -20] }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </svg>

                                {/* Central Core (Query Origin) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                    <div className="w-7 h-7 bg-white/10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,1)]" />
                                    </div>
                                    <motion.div
                                        className="absolute inset-[-4px] rounded-full border border-purple-500/20"
                                        animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    />
                                </div>

                                {/* Found Node Label */}
                                <motion.div
                                    className="absolute top-[15%] right-[10%] px-2.5 py-1 bg-black/90 border border-purple-500/50 rounded-lg text-[10px] text-white font-mono shadow-2xl z-20 whitespace-nowrap"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
                                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 0.9, 1] }}
                                >
                                    <div className="text-purple-400 text-[8px] uppercase tracking-wider mb-0.5">Similarity Match</div>
                                    <div className="font-bold">0.9248 SCORE</div>
                                </motion.div>
                            </div>
                        </div>
                    </Spotlight>

                    {/* Feature 2: Knowledge Base (Narrow) */}
                    <Spotlight className="lg:col-span-1 rounded-[2rem] p-6 flex flex-col relative group overflow-hidden cursor-default bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-auto md:h-[380px]">
                        <div className="relative z-20 h-full flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-3xl font-bold tracking-tight text-white">Your Knowledge Base</h2>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-shrink-0">
                                    <Database className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                Drop in your PDFs, notes, and research. Aether indexes them instantly.
                            </p>

                            {/* Compact Visualization: File Scanning */}
                            <div className="mt-auto rounded-xl bg-black/50 border border-white/5 relative overflow-hidden h-[140px] flex flex-col">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                                <motion.div
                                    className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500 blur-[2px] z-10 box-shadow-[0_0_15px_#3b82f6]"
                                    animate={{ top: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="p-3 space-y-2 font-mono text-[10px] text-neutral-500 overflow-hidden">
                                    {["specs_v2.pdf", "notes.md", "diagram.png", "budget.xlsx"].map((file, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-center justify-between border-b border-white/5 pb-1.5"
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
                    <Spotlight className="lg:col-span-1 rounded-[2rem] p-6 flex flex-col relative group overflow-hidden cursor-default bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-auto md:h-[380px]">
                        <div className="relative z-20 h-full flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-3xl font-bold tracking-tight text-white">Thought Stream</h2>
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)] flex-shrink-0">
                                    <Network className="w-6 h-6 text-green-400" />
                                </div>
                            </div>
                            <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                Trust is built on visibility. Watch the Chain of Thought in real-time.
                            </p>

                            {/* Compact Visualization: Terminal */}
                            <div className="mt-auto rounded-xl bg-[#0a0a0a] border border-white/10 relative overflow-hidden flex flex-col h-[180px] font-mono text-[10px] shadow-2xl">
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
                                        <div className="text-neutral-500 text-[9px] mb-2">{"// INITIATING REASONING CHAIN"}</div>

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

                                        <div className="text-neutral-500 text-[9px] mt-2 mb-2">{"// NEW CYCLE START"}</div>

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
                    <Spotlight className="lg:col-span-2 rounded-[2rem] p-6 flex flex-col group cursor-default relative overflow-hidden bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-auto md:h-[380px]">
                        <div className="relative z-20 h-full flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-3xl font-bold text-white tracking-tight">Hybrid Core</h2>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex-shrink-0">
                                    <Cpu className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                Switch between SOTA cloud models (Gemini 3) for reasoning and local weights (Llama 3) for privacy. You own the stack.
                            </p>

                            {/* Bottom: Model List Container (same pattern as Cards 2 & 3) */}
                            <div className="mt-auto rounded-xl bg-[#050505] border border-white/10 relative overflow-hidden h-[180px]">
                                {/* Background Grid Animation */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />

                                <div className="flex flex-col gap-1.5 w-full p-3 relative z-10">
                                    {/* Header */}
                                    <div className="flex justify-between items-center text-[8px] font-mono text-neutral-500 uppercase tracking-wider">
                                        <span>Available Models</span>
                                        <span>Status</span>
                                    </div>

                                    {/* Model 1: Gemini 3 */}
                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-3 h-3 text-blue-400" />
                                            <div>
                                                <div className="text-[10px] font-bold text-white">Gemini 3.1 Pro</div>
                                                <div className="text-[8px] text-neutral-500">Google • 1M Context</div>
                                            </div>
                                        </div>
                                        <span className="text-[8px] text-neutral-500 font-mono">READY</span>
                                    </div>


                                    {/* Model 3: Claude 3.5 */}
                                    <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between opacity-60">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-orange-500/20 flex items-center justify-center text-[8px] text-orange-400 font-bold">C</div>
                                            <div>
                                                <div className="text-[10px] font-bold text-white">Claude 4.6 Opus</div>
                                                <div className="text-[8px] text-neutral-500">Anthropic • Reason</div>
                                            </div>
                                        </div>
                                        <span className="text-[8px] text-neutral-500 font-mono">READY</span>
                                    </div>

                                    {/* Model 4: Llama 3 (Active) */}
                                    <div className="relative">
                                        <motion.div
                                            className="absolute -inset-[1px] rounded-lg bg-gradient-to-r from-green-500/50 via-emerald-500/50 to-green-500/50 opacity-30 blur-sm"
                                            animate={{ opacity: [0.3, 0.6, 0.3] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />
                                        <div className="p-1.5 rounded-lg bg-[#0a0a0a] border border-green-500/30 flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-3 h-3 text-green-400" />
                                                <div>
                                                    <div className="text-[10px] font-bold text-white flex items-center gap-1">
                                                        Llama 3.2
                                                        <span className="text-[7px] px-1 bg-green-500/20 text-green-400 rounded border border-green-500/20 uppercase">Local</span>
                                                    </div>
                                                    <div className="text-[8px] text-green-400/70">Meta • Private</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[7px] text-green-400 font-bold">ACTIVE</span>
                                                </div>
                                                <span className="text-[7px] text-neutral-500 font-mono">12ms</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Spotlight>
                </div>
            </motion.section>

            {/* --- HOW IT WORKS --- */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="max-w-7xl mx-auto px-4 py-32 relative"
            >
                <div className="text-center mb-20 space-y-4">
                    <h2 className="text-sm font-mono text-blue-400 uppercase tracking-[0.3em]">The Process</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">How It Works</h3>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        From raw input to structured intelligence — in four steps.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[60px] left-[12.5%] right-[12.5%] h-[1px] border-t border-dashed border-white/10 z-0" />

                    {[
                        {
                            step: "01",
                            icon: <Globe className="w-6 h-6" />,
                            title: "Upload",
                            desc: "Feed Aether your documents, notes, and context. PDF, Markdown, plain text — it ingests everything.",
                            boxClass: "bg-purple-500/5 border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/10",
                            badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                            iconClass: "text-purple-400"
                        },
                        {
                            step: "02",
                            icon: <Zap className="w-6 h-6" />,
                            title: "Process",
                            desc: "Content is chunked, embedded, and indexed into a vector knowledge graph with semantic links.",
                            boxClass: "bg-blue-500/5 border-blue-500/20 group-hover:border-blue-500/40 group-hover:bg-blue-500/10",
                            badgeClass: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                            iconClass: "text-blue-400"
                        },
                        {
                            step: "03",
                            icon: <Network className="w-6 h-6" />,
                            title: "Query",
                            desc: "Ask anything. Aether retrieves relevant context across all your data with precision recall.",
                            boxClass: "bg-green-500/5 border-green-500/20 group-hover:border-green-500/40 group-hover:bg-green-500/10",
                            badgeClass: "bg-green-500/20 text-green-400 border-green-500/30",
                            iconClass: "text-green-400"
                        },
                        {
                            step: "04",
                            icon: <Shield className="w-6 h-6" />,
                            title: "Remember",
                            desc: "Every interaction strengthens the model. Your digital profile evolves continuously.",
                            boxClass: "bg-orange-500/5 border-orange-500/20 group-hover:border-orange-500/40 group-hover:bg-orange-500/10",
                            badgeClass: "bg-orange-500/20 text-orange-400 border-orange-500/30",
                            iconClass: "text-orange-400"
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.5 }}
                            className="relative z-10 flex flex-col items-center text-center group"
                        >
                            <div className={`w-[120px] h-[120px] rounded-2xl border flex items-center justify-center mb-6 transition-all duration-500 relative ${item.boxClass}`}>
                                <span className={`absolute -top-2 -right-2 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                                    {item.step}
                                </span>
                                <div className={item.iconClass}>
                                    {item.icon}
                                </div>
                            </div>
                            <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                            <p className="text-sm text-neutral-500 leading-relaxed max-w-[200px]">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* --- STATS / METRICS BAR (commented out for future use) ---
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto px-4 py-16"
            >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/5">
                    {[
                        { value: "5", label: "Development Phases", suffix: "" },
                        { value: "3", label: "AI Models Supported", suffix: "+" },
                        { value: "57", label: "Engineered Tasks", suffix: "" },
                        { value: "100", label: "Local Privacy", suffix: "%" },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center justify-center py-4 cursor-default group"
                        >
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-4xl md:text-5xl font-bold text-white group-hover:text-purple-400 transition-colors duration-300">
                                    {stat.value}
                                </span>
                                <span className="text-2xl md:text-3xl font-bold text-purple-400">{stat.suffix}</span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mt-2">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
            */}

            {/* --- LIVE DEMO / TERMINAL PREVIEW --- */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto px-4 py-32 relative"
            >
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-sm font-mono text-green-400 uppercase tracking-[0.3em]">Live Preview</h2>
                    <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">See It In Action</h3>
                    <p className="text-neutral-400 max-w-2xl mx-auto">
                        A real conversation with Aether — watch how it thinks, retrieves, and responds.
                    </p>
                </div>

                {/* Terminal Window */}
                <div className="rounded-2xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                    {/* Title Bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                        <div className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/30 border border-green-500/50" />
                        <span className="ml-3 text-xs text-neutral-500 font-mono">aether — session_live</span>
                        <div className="ml-auto flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-green-500/70 font-mono">CONNECTED</span>
                        </div>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 space-y-5 font-mono text-sm min-h-[350px]">
                        {/* User Message */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                        >
                            <span className="text-purple-400">user@local</span>
                            <span className="text-neutral-600"> ~ </span>
                            <span className="text-neutral-500">$</span>
                            <span className="text-white ml-2">What did we discuss about the authentication system last week?</span>
                        </motion.div>

                        {/* Aether Processing */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.9 }}
                            className="space-y-1.5"
                        >
                            <div className="text-neutral-600 text-xs">
                                <span className="text-blue-400/60">[aether]</span> Searching memory vectors...
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-blue-400/60">[aether]</span>
                                <span className="text-neutral-600">Found</span>
                                <span className="text-green-400">3 relevant memories</span>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-500">similarity: 0.94</span>
                                <span className="text-neutral-600">•</span>
                                <span className="text-neutral-500">latency: 23ms</span>
                            </div>
                        </motion.div>

                        {/* Aether Response */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5 }}
                            className="rounded-lg bg-white/[0.02] border border-white/5 p-4 space-y-3"
                        >
                            <div className="flex items-center gap-2 text-xs text-green-400/80 mb-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <span className="font-bold">AETHER RESPONSE</span>
                            </div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.8 }}
                                className="text-neutral-300 leading-relaxed text-[13px]"
                            >
                                Last Tuesday, you outlined a <span className="text-purple-400">JWT-based auth flow</span> with refresh token rotation.
                                Key decisions:
                            </motion.p>
                            <motion.ul
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 2.2 }}
                                className="space-y-1 text-[13px]"
                            >
                                <li className="text-neutral-400">
                                    <span className="text-green-400 mr-2">→</span>
                                    Supabase Auth for session management
                                </li>
                                <li className="text-neutral-400">
                                    <span className="text-green-400 mr-2">→</span>
                                    RLS policies on all public tables
                                </li>
                                <li className="text-neutral-400">
                                    <span className="text-green-400 mr-2">→</span>
                                    Custom claims for role-based access (admin, editor, viewer)
                                </li>
                            </motion.ul>
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 2.6 }}
                                className="text-neutral-500 text-xs pt-2 border-t border-white/5"
                            >
                                Sources: conversation_feb_08.md • auth_architecture.pdf • notes_security.md
                            </motion.p>
                        </motion.div>

                        {/* Blinking Cursor */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 3.0 }}
                        >
                            <span className="text-purple-400">user@local</span>
                            <span className="text-neutral-600"> ~ </span>
                            <span className="text-neutral-500">$</span>
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
                                className="ml-2 inline-block w-2.5 h-4 bg-white/70 align-middle"
                            />
                        </motion.div>
                    </div>
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
