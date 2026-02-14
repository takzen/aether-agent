"use client";

import { motion } from "framer-motion";

export default function NeuralHub() {
    return (
        <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Background Gradients */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[100px] neural-pulse" />
            <div className="absolute inset-20 bg-secondary/10 rounded-full blur-[80px] animate-pulse" />

            {/* Outer Ring */}
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-white/5 rounded-full"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full glow-primary" />
            </motion.div>

            {/* Inner Rotating Ring */}
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-10 border border-white/10 rounded-full border-dashed"
            />

            {/* Core Orb */}
            <div className="relative w-48 h-48 rounded-full bg-gradient-to-tr from-primary/40 to-secondary/40 backdrop-blur-3xl border border-white/20 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,191,255,0.2),transparent_70%)]" />

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-24 h-24 rounded-full bg-primary/20 blur-2xl"
                />

                <div className="z-10 text-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold mb-1 glow-primary">Aether</p>
                    <p className="text-2xl font-light tracking-widest text-white/80">READY</p>
                </div>

                {/* Floating Particles Simulation */}
                {typeof window !== 'undefined' && [...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -40, 0],
                            x: [0, (i % 2 === 0 ? 30 : -30), 0],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                        className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                        style={{
                            top: `${40 + Math.random() * 20}%`,
                            left: `${40 + Math.random() * 20}%`
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
