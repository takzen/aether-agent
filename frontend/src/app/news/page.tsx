"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Rocket, Zap, Shield, GitCommit, Orbit } from "lucide-react";

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

const newsUpdates = [
    {
        version: "v1.5.0",
        date: "March 04, 2026",
        title: "Hybrid Cloud Integration & Edge Compute",
        description: "Separated architecture into fully remote brain core connected under an independent VPS container, and a fast frontend hosted globally on Vercel.",
        icon: Orbit,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        highlights: [
            "Hybrid Cloud Deploy (Vercel + Hetzner)",
            "Clerk Authentication API integration",
            "Zero-latency Reverse Proxy (Next.js Rewrites)"
        ]
    },
    {
        version: "v1.4.2",
        date: "March 02, 2026",
        title: "Evaluation Infrastructure",
        description: "Deployed the core evaluation engine modules including RAG evaluation testing and LLM judges to assure data precision.",
        icon: Shield,
        color: "text-cyan-400",
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        highlights: [
            "RAG precision analytics",
            "LLM judge integration"
        ]
    },
    {
        version: "v1.3.0",
        date: "February 28, 2026",
        title: "Neuromorphic Cognition Engine",
        description: "Official release of the cognition center. Aether now shifts its personality based on the local time and environment.",
        icon: BrainAlias,
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
        highlights: [
            "Digital Circadian Rhythm (Strategist, Executor)",
            "Persona Profiles (Analytical, Balanced, Creative)",
            "Safety-First Autonomy (Danger Zone)"
        ]
    }
];

// Reusing generic icon import workaround 
function BrainAlias(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
            <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
            <path d="M6 18a4 4 0 0 1-1.967-.516" />
            <path d="M19.967 17.484A4 4 0 0 1 18 18" />
        </svg>
    )
}

export default function NewsPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-purple-500/30">
            {/* Background Noise & Effects */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Glow Orbs */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
                <div className="max-w-[1400px] w-full mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">Main Engine</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <AetherLogo className="w-6 h-6 text-white" />
                        <span className="font-bold tracking-tighter text-lg uppercase">News</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-24 px-8 border-b border-white/5">
                <div className="max-w-[1400px] w-full mx-auto space-y-8 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]"
                    >
                        Engineering <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30 text-nowrap">Progress.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-neutral-400 font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        Follow the roadmap and latest architectural improvements deployed to the Aether core.
                    </motion.p>
                </div>
            </header>

            {/* Content Sections */}
            <main className="relative z-10 max-w-5xl w-full mx-auto px-8 py-32 space-y-16">

                {newsUpdates.map((update, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative pl-8 md:pl-0"
                    >
                        {/* Timeline Line (Desktop) */}
                        <div className="hidden md:block absolute left-[140px] top-12 bottom-[-4rem] w-px bg-white/10 last:bg-transparent" />

                        <div className="flex flex-col md:flex-row gap-8 md:gap-16">
                            {/* Date & Version */}
                            <div className="md:w-[140px] shrink-0 pt-2 flex flex-col items-start md:items-end text-left md:text-right relative">
                                <span className="text-white font-bold text-xl tracking-tight">{update.version}</span>
                                <span className="text-neutral-500 text-sm font-mono mt-1 block">{update.date}</span>

                                {/* Timeline Dot */}
                                <div className={`hidden md:flex absolute right-[-32px] top-3 w-4 h-4 rounded-full bg-[#020202] border-2 border-white/20 items-center justify-center`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${update.bg.replace("10", "100")}`} />
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="flex-1 rounded-3xl bg-[#050505] border border-white/5 p-8 md:p-10 space-y-6 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${update.bg} ${update.border} border`}>
                                        <update.icon className={`w-6 h-6 ${update.color}`} />
                                    </div>
                                    <h3 className="text-2xl font-bold tracking-tight text-white">{update.title}</h3>
                                </div>
                                <p className="text-neutral-400 font-light leading-relaxed text-lg">
                                    {update.description}
                                </p>
                                <div className="pt-4 border-t border-white/5">
                                    <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500 mb-4">Core Highlights</h4>
                                    <ul className="space-y-3">
                                        {update.highlights.map((highlight, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-neutral-300">
                                                <GitCommit className="w-4 h-4 text-neutral-600" />
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-8 flex flex-col items-center gap-6">
                <div className="text-[10px] text-neutral-700 font-mono uppercase tracking-[0.2em]">
                    &copy; 2026 AETHER
                </div>
            </footer>
        </div>
    );
}
