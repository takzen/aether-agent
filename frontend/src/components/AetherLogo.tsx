"use client";

import { motion } from "framer-motion";

export const AetherLogo = ({ className = "w-12 h-12" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center ${className} perspective-[200px]`}>
        {/* Bardzo delikatne, ledwie widoczne tło 
            "nie dominuje systemu - tylko unosi się w tle"
        */}
        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-[25px] animate-pulse" />

        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 overflow-visible drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            <defs>
                {/* Szklisty, opalizujący gradient (fiolet/cyan, ale bardzo transparentny) */}
                <linearGradient id="butterflyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
                    <stop offset="50%" stopColor="rgba(59, 130, 246, 0.2)" />
                    <stop offset="100%" stopColor="rgba(236, 72, 153, 0.1)" />
                </linearGradient>
                <linearGradient id="butterflyBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
                </linearGradient>
            </defs>

            <g transform="translate(50, 50)">
                {/* 
                  Lewe skrzydło 
                */}
                <motion.g
                    initial={{ scaleX: 1, rotateZ: 0 }}
                    animate={{ scaleX: [1, 0.4, 1], rotateZ: [0, 5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "0px 0px" }}
                >
                    <path
                        d="M 0 -25 C -45 -60, -70 -10, -20 5 C -60 15, -45 60, 0 35 Z"
                        fill="url(#butterflyGlow)"
                        stroke="url(#butterflyBorder)"
                        strokeWidth="0.5"
                    />
                    {/* Delikatne żyłki wewnątrz skrzydła */}
                    <path d="M 0 -25 Q -25 -15 -20 5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
                    <path d="M -20 5 Q -25 25 0 35" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
                    <path d="M 0 5 L -40 -15" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" fill="none" />
                    <path d="M 0 15 L -35 35" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" fill="none" />
                </motion.g>

                {/* 
                  Prawe skrzydło 
                */}
                <motion.g
                    initial={{ scaleX: 1, rotateZ: 0 }}
                    animate={{ scaleX: [1, 0.4, 1], rotateZ: [0, -5, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "0px 0px" }}
                >
                    <path
                        d="M 0 -25 C 45 -60, 70 -10, 20 5 C 60 15, 45 60, 0 35 Z"
                        fill="url(#butterflyGlow)"
                        stroke="url(#butterflyBorder)"
                        strokeWidth="0.5"
                    />
                    {/* Delikatne żyłki wewnątrz skrzydła */}
                    <path d="M 0 -25 Q 25 -15 20 5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
                    <path d="M 20 5 Q 25 25 0 35" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" fill="none" />
                    <path d="M 0 5 L 40 -15" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" fill="none" />
                    <path d="M 0 15 L 35 35" stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" fill="none" />
                </motion.g>

                {/* Subtelny korpus (świetlisty punkt w środku) */}
                <ellipse cx="0" cy="5" rx="1.5" ry="14" fill="rgba(255,255,255,0.5)" className="blur-[1px]" />
                <circle cx="0" cy="-18" r="2.5" fill="rgba(255,255,255,0.9)" />
            </g>
        </svg>
    </div>
);
