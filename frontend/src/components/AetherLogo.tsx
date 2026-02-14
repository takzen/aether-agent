"use client";

import { motion } from "framer-motion";

export const AetherLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-[20px] animate-pulse" />
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
            </defs>
            <motion.path
                d="M20 80 Q35 20 50 50 T80 20"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
                d="M20 90 Q35 30 50 60 T80 30"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="5"
                strokeLinecap="round"
                className="opacity-40"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />
        </svg>
    </div>
);
