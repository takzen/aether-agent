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

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-neutral-500/30">
            {/* Background Noise */}
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
                <div className="max-w-[1400px] w-full mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <ArrowLeft className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-50 group-hover:opacity-100 transition-opacity">Main Engine</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <AetherLogo className="w-6 h-6 text-white" />
                        <span className="font-bold tracking-tighter text-lg uppercase">Terms of Service</span>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 max-w-[1400px] w-full mx-auto px-8 py-32 space-y-24">
                <header className="max-w-5xl space-y-6">
                    <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                        Operational<br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/30">Terms.</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 font-light leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">1. Provision of Service</h2>
                        <p className="text-lg text-neutral-400">
                            The Aether Agent open-source software is provided &quot;AS IS&quot;, without warranty of any kind, express or implied. In no event shall the developers be held liable for any claim, damages, or other liability arising out of the software&apos;s autonomous file execution operations.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">2. Aether Pro Subscriptions</h2>
                        <p className="text-lg text-neutral-400">
                            Access to the managed infrastructure via Aether Pro provides dedicated VPS backend isolation and priority compute resources. Service availability is targeted at high-uptime but fundamentally relies on underlying Hetzner processing availability.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xs font-bold tracking-[0.3em] text-neutral-500 uppercase">3. Autonomous Responsibilities</h2>
                        <p className="text-lg text-neutral-400">
                            By elevating the Agent to `FULL_AUTONOMY` within the Autonomy Engine Settings, you are explicitly granting system-wide filesystem access to the agent sandbox. We heavily suggest utilizing the built-in Human-In-The-Loop (HITL) manual overrides for sensitive backend environments.
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
