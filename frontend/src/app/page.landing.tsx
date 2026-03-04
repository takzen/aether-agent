"use client";

import { motion, useScroll, useTransform, useSpring, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Globe, Zap, Shield, Database, Cpu, Network, Lock, Github, Send } from "lucide-react";
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
                <div className="flex gap-4 md:gap-6 items-center">
                    <Link href="https://github.com/takzen/aether-agent" target="_blank" className="hidden lg:flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium group">
                        <Github className="w-4 h-4" />
                        <span>Open Source Core</span>
                    </Link>
                    <div className="hidden lg:block w-px h-4 bg-white/10" />
                    <Link href="/dashboard" className="px-6 py-2.5 bg-white text-black hover:bg-purple-100 rounded-full transition-all text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-2">
                        <span>AETHER PRO</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </nav>

            {/* --- HERO SECTION: AETHER HYPER-CORE --- */}
            <section className="relative h-screen flex flex-col items-center justify-center perspective-1000 overflow-hidden">
                <motion.div
                    style={{ scale: orbScale, opacity: orbOpacity, y: orbY }}
                    className="absolute z-0 w-[500px] h-[500px] md:w-[800px] md:h-[800px] pointer-events-none"
                >
                    {/* Tło luminescencyjne */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 via-transparent to-blue-600/20 rounded-full blur-[90px] animate-pulse" />

                    {/* Pierścienie Obwodowe */}
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-[5%] border border-white/[0.03] rounded-full border-t-purple-500/40" />
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-[15%] border border-white/[0.05] rounded-full border-b-cyan-500/40" />
                    <motion.div animate={{ rotate: 180 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-[25%] border border-dashed border-white/10 rounded-full" />

                    {/* Węzły Wektorowe (Neuronowe Ścieżki Pamięci) */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible opacity-60">
                        {Array.from({ length: 12 }).map((_, i) => {
                            const angle = (i * Math.PI * 2) / 12;
                            // Dynamika odległości satelitów
                            const distMain = 38;
                            const distSub = 25;
                            return (
                                <g key={i}>
                                    {/* Linia Główna z Centrum */}
                                    <line
                                        x1="50%" y1="50%"
                                        x2={`${50 + Math.cos(angle) * distMain}%`} y2={`${50 + Math.sin(angle) * distMain}%`}
                                        stroke="rgba(168,85,247,0.3)" strokeWidth="1" strokeDasharray="2 4"
                                    />
                                    {/* Główny Węzeł Sfery */}
                                    <motion.circle
                                        cx={`${50 + Math.cos(angle) * distMain}%`} cy={`${50 + Math.sin(angle) * distMain}%`} r="3" fill="rgba(168,85,247,0.8)"
                                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0.9, 0.4] }}
                                        transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                                    />
                                    {/* Sub-Ścieżki i Nody Satelitarne */}
                                    <line
                                        x1={`${50 + Math.cos(angle) * distMain}%`} y1={`${50 + Math.sin(angle) * distMain}%`}
                                        x2={`${50 + Math.cos(angle + 0.3) * distSub}%`} y2={`${50 + Math.sin(angle + 0.3) * distSub}%`}
                                        stroke="rgba(6,182,212,0.2)" strokeWidth="0.5"
                                    />
                                    <circle cx={`${50 + Math.cos(angle + 0.3) * distSub}%`} cy={`${50 + Math.sin(angle + 0.3) * distSub}%`} r="1.5" fill="rgba(6,182,212,0.6)" />
                                </g>
                            )
                        })}
                    </svg>

                    {/* Fale Tętniące Wewnątrz Rdzenia */}
                    <div className="absolute inset-[35%] bg-white/5 rounded-full blur-2xl flex items-center justify-center">
                        <div className="w-full h-full bg-purple-500/20 rounded-full animate-ping opacity-30" />
                    </div>

                    {/* Wewnętrzny Motyl: Ukryty za światłem */}
                    <div className="absolute inset-[30%] flex items-center justify-center pointer-events-none drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]">
                        <motion.div
                            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <AetherLogo className="w-full h-full opacity-80 mix-blend-screen" />
                        </motion.div>
                    </div>
                </motion.div>

                <div className="relative z-10 text-center space-y-8 mix-blend-normal mt-[5vh]">

                    <motion.h1
                        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{ duration: 1, type: "spring", damping: 20 }}
                        className="text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 drop-shadow-2xl relative"
                    >
                        SECOND <br /> BRAIN
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="text-lg md:text-2xl text-neutral-400 max-w-2xl mx-auto uppercase tracking-[0.2em] font-light flex items-center justify-center gap-4 flex-wrap"
                    >
                        <span>Cloud Intelligence</span>
                        <span className="text-purple-500/50">•</span>
                        <span>Secure Architecture</span>
                        <span className="text-purple-500/50">•</span>
                        <span className="text-neutral-300">Autonomy</span>
                    </motion.p>
                </div>

                <motion.div
                    style={{ opacity: orbOpacity }}
                    className="absolute bottom-12 flex flex-col items-center gap-3 text-neutral-600 animate-bounce cursor-pointer font-mono"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em]">Initialize Sequence</span>
                    <ArrowRight className="rotate-90 w-4 h-4 text-purple-400" />
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

                    {/* Feature 3: Command Terminal (Narrow) */}
                    <Spotlight className="lg:col-span-1 rounded-[2rem] p-6 flex flex-col relative group overflow-hidden cursor-default bg-neutral-900/40 backdrop-blur-xl border border-white/10 h-auto md:h-[380px]">
                        <div className="relative z-20 h-full flex flex-col">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h2 className="text-3xl font-bold tracking-tight text-white">Command Terminal</h2>
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)] flex-shrink-0">
                                    <Network className="w-6 h-6 text-green-400" />
                                </div>
                            </div>
                            <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                Intercept the logic. Use slash commands like <span className="text-neutral-300 font-mono">/logs</span> and <span className="text-neutral-300 font-mono">/simulate</span>.
                            </p>

                            {/* Compact Visualization: Terminal */}
                            <div className="mt-auto rounded-xl bg-[#0a0a0a] border border-transparent relative overflow-hidden flex flex-col h-[180px] font-mono text-[10px] shadow-2xl">
                                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/5 bg-white/5 z-20 shadow-md">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                    <span className="ml-2 text-neutral-500 text-xs tracking-wider font-bold">AETHER - ROOT@DASHBOARD</span>
                                </div>

                                <div className="p-4 space-y-1 overflow-hidden relative flex-1">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]/20 pointer-events-none z-10" />

                                    <motion.div
                                        className="flex flex-col gap-1.5"
                                        animate={{ y: [0, -120] }}
                                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className="text-neutral-500 text-[9px] mb-2">{"// SECURE TUNNEL ESTABLISHED"}</div>

                                        <div className="flex gap-2">
                                            <span className="text-green-500">guest@aether</span>
                                            <span className="text-neutral-300">~ % /cognition --set Strategist</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-purple-400">&gt; Persona updated to [Strategist].</span>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <span className="text-green-500">guest@aether</span>
                                            <span className="text-neutral-300">~ % /simulate "morning_brief"</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-neutral-500">[00:03]</span>
                                            <span className="text-orange-400">NightCycleProcessor activated...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-neutral-500">[00:04]</span>
                                            <span className="text-blue-400">Consolidating 14 orphaned memories.</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-neutral-500">[00:06]</span>
                                            <span className="text-cyan-400">Active World Model logic triggered.</span>
                                        </div>

                                        <div className="text-neutral-500 text-[9px] mt-2 mb-2">{"// BACKGROUND AGENT TRACE"}</div>

                                        <div className="flex gap-2">
                                            <span className="text-neutral-500">[00:12]</span>
                                            <span className="text-neutral-300">System Tool: connect_concepts x5</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className="text-neutral-500">[00:15]</span>
                                            <span className="text-green-400">Morning Intelligence Brief generated.</span>
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
                                <h2 className="text-3xl font-bold text-white tracking-tight">Hybrid Cloud Engine</h2>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex-shrink-0">
                                    <Cpu className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <p className="text-lg text-neutral-400 leading-relaxed font-light">
                                Fast Vercel edge deployment combined with a secure, dedicated Docker instance running on Hetzner VPS for deep reasoning.
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

                                    {/* Model 4: Dedicated Backend */}
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
                                                        Aether Pro Core
                                                        <span className="text-[7px] px-1 bg-green-500/20 text-green-400 rounded border border-green-500/20 uppercase">Hetzner VPS</span>
                                                    </div>
                                                    <div className="text-[8px] text-green-400/70">Linux • Docker • SQLite</div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                                    <span className="text-[7px] text-green-400 font-bold">ACTIVE</span>
                                                </div>
                                                <span className="text-[7px] text-neutral-500 font-mono">159.xx VPS</span>
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
                            icon: <Send className="w-6 h-6" />,
                            title: "Bridge",
                            desc: "Connect via Telegram or Web UI. Forward images, drop voice notes, or text directly to your agent.",
                            boxClass: "bg-purple-500/5 border-purple-500/20 group-hover:border-purple-500/40 group-hover:bg-purple-500/10",
                            badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                            iconClass: "text-purple-400"
                        },
                        {
                            step: "02",
                            icon: <Zap className="w-6 h-6" />,
                            title: "Process",
                            desc: "Content is analyzed, chunked, embedded, and indexed into a vector memory graph with semantic links.",
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

                {/* Terminal Window - Deep Black Premium Style */}
                <div className="rounded-2xl bg-[#050505] border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)] flex flex-col">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.03]">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
                        </div>
                        <span className="ml-2 text-[10px] text-neutral-500 font-mono uppercase tracking-widest">aether - root@dashboard</span>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 space-y-6 font-mono text-[13px] min-h-[400px] leading-relaxed">
                        {/* User Message - Realistic CLI Input */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="flex items-start gap-2"
                        >
                            <span className="text-purple-400 font-bold shrink-0">user@local</span>
                            <span className="text-neutral-600">~</span>
                            <span className="text-neutral-500">$</span>
                            <span className="text-neutral-200 ml-1">/simulate --context "latest_project_sync"</span>
                        </motion.div>

                        {/* Aether Processing - Realistic Log Output */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.9 }}
                            className="space-y-2 pt-2"
                        >
                            <div className="flex items-start gap-2 py-1.5 border-l-2 border-purple-500/50 bg-purple-500/5 pl-3">
                                <span className="text-[10px] font-bold uppercase text-purple-400 min-w-[50px]">[BRIDGE]</span>
                                <span className="text-neutral-400 text-[11px] leading-tight">Incoming sync from @takzen (Telegram).</span>
                            </div>
                            <div className="flex items-start gap-2 py-1.5 border-l-2 border-blue-500/50 bg-blue-500/5 pl-3">
                                <span className="text-[10px] font-bold uppercase text-blue-400 min-w-[50px]">[INFO]</span>
                                <span className="text-neutral-400 text-[11px] leading-tight">System simulation engine initialized.</span>
                            </div>
                            <div className="flex items-start gap-2 py-1.5 border-l-2 border-green-500/50 bg-green-500/5 pl-3">
                                <span className="text-[10px] font-bold uppercase text-green-400 min-w-[50px]">[CORE]</span>
                                <span className="text-neutral-400 text-[11px] leading-tight">Analyzing context similarity: 0.94 | latency: 23ms</span>
                            </div>
                        </motion.div>

                        {/* Aether Response - System Insight Style */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5 }}
                            className="space-y-2 p-3 border border-cyan-500/50 bg-cyan-500/[0.03] rounded-lg"
                        >
                            <div className="flex items-center gap-2 mb-1 opacity-50">
                                <div className="w-1 h-1 rounded-full bg-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">System Insight</span>
                            </div>
                            <div className="text-neutral-300 leading-relaxed text-[13px]">
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 1.8 }}
                                    className="mb-2"
                                >
                                    Analysis of <strong className="text-white font-semibold">latest_project_sync</strong> completed. The core architecture is successfully migrating to a hybrid cloud model.
                                </motion.p>
                                <motion.ul
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 2.2 }}
                                    className="list-disc ml-5 space-y-1 text-neutral-400"
                                >
                                    <li>Vercel Edge Deployment: <span className="text-green-400 opacity-80">STABLE</span></li>
                                    <li>Hetzner VPS Backend: <span className="text-green-400 opacity-80">ACTIVE (159.xx)</span></li>
                                    <li>Knowledge Base: <span className="text-purple-400 opacity-80">1,242 concepts indexed</span></li>
                                </motion.ul>
                            </div>
                        </motion.div>

                        {/* Prompt Input State */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 2.8 }}
                            className="flex items-center gap-2 pt-2"
                        >
                            <span className="text-purple-400 font-bold">user@local</span>
                            <span className="text-neutral-600">~</span>
                            <span className="text-neutral-500">$</span>
                            <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
                                className="inline-block w-2.5 h-4 bg-white/70 align-middle"
                            />
                        </motion.div>
                    </div>

                    {/* Terminal Input Area Mock - Deep Contrast */}
                    <div className="px-4 py-3 border-t border-white/5 bg-black/40 shrink-0">
                        <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-2 opacity-50">
                            <span className="text-purple-400/50 font-mono text-xs font-bold whitespace-nowrap">user@local:</span>
                            <div className="text-neutral-600 text-xs font-mono">Execute system command or run task...</div>
                            <div className="ml-auto">
                                <Send className="w-3 h-3 text-purple-400/30" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* --- CTA & FOOTER --- */}
            <section className="relative w-full border-t border-white/10 bg-[#020202] pt-32 pb-12 flex flex-col items-center justify-center overflow-hidden font-sans">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

                {/* Środkowy blask na dolnej krawędzi */}
                <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-center">

                    {/* Główny blok Call To Action */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center space-y-8 mb-32"
                    >
                        <AetherLogo className="w-16 h-16 mx-auto opacity-70 mb-4" />
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30">
                            Initialize Engine.
                        </h2>
                        <p className="text-lg text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Aether is an engineering scaffold that turns raw algorithms into a capable, personal agent. Fully transparent. Totally private.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                            <Link href="/dashboard" className="px-12 py-5 bg-white text-black font-bold rounded-xl flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] group uppercase tracking-tighter text-lg">
                                <span>AETHER PRO ➔</span>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Siatka Linków Stopki - Uproszczona */}
                    <div className="w-full flex flex-col md:flex-row justify-between items-start gap-12 border-t border-white/10 pt-16 pb-16">
                        <div className="flex flex-col gap-6 max-w-sm">
                            <span className="font-bold tracking-tighter text-2xl text-white flex items-center gap-3">
                                <AetherLogo className="w-6 h-6" /> AETHER
                            </span>
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Premium autonomous agent architecture with long-term memory, hybrid cloud reasoning (Hetzner + Vercel). Built for the modern builder.
                            </p>
                        </div>

                        <div className="flex gap-16">
                            <div className="flex flex-col gap-4">
                                <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-2 opacity-50">Resources</h4>
                                <Link href="https://github.com/takzen/aether-agent" className="text-neutral-400 hover:text-white transition-colors text-sm">Repository</Link>
                                <Link href="/guide" className="text-neutral-400 hover:text-white transition-colors text-sm">System Manual</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="text-white text-xs font-bold tracking-widest uppercase mb-2 opacity-50">Platform</h4>
                                <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors text-sm">Access Pro</Link>
                                <span className="text-neutral-600 text-sm">v1.5.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Najniższy Panel i Prawa Autorskie */}
                    <div className="w-full flex flex-col items-center justify-center text-neutral-600 text-[10px] uppercase tracking-widest font-mono border-t border-white/5 pt-8 pb-4">
                        <span>&copy; AETHER</span>
                    </div>

                </div>
            </section>

        </div>
    );
}
