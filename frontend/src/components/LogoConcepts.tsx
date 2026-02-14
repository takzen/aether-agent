"use client";

import { motion } from "framer-motion";

export const AetherLogoPrism = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <defs>
                <linearGradient id="prismGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
            </defs>
            <motion.path
                d="M50 15 L85 80 L15 80 Z"
                fill="none"
                stroke="url(#prismGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.circle
                cx="50" cy="55" r="8"
                fill="#fff"
                className="blur-[2px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity }}
            />
        </svg>
    </div>
);

export const AetherLogoVoid = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
            <motion.circle
                cx="50" cy="50" r="35"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="4"
                strokeDasharray="10 10"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
                cx="50" cy="50" r="25"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
                cx="50" cy="50" r="8"
                fill="#fff"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </svg>
    </div>
);

export const AetherLogoWave = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
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
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
                d="M20 90 Q35 30 50 60 T80 30"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-50"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
            />
        </svg>
    </div>
);
