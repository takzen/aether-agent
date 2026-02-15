"use client";

import { Terminal, Search, Code, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockedSteps = [
    { id: 1, type: "thought", message: "Analyzing user request for context...", icon: Terminal, time: "12s ago" },
    { id: 2, type: "search", message: "Searching knowledge base for 'Aether design system'", icon: Search, time: "8s ago" },
    { id: 3, type: "tool", message: "Executing tool: get_current_time()", icon: Code, time: "3s ago" },
    { id: 4, type: "complete", message: "Response synthesized with 98% confidence", icon: CheckCircle2, time: "just now" },
];

export default function ThoughtStream() {
    return (
        <div className="w-80 h-full bg-[#181818] border-l border-[#303030] flex flex-col hidden xl:flex z-20">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Thought Stream</h3>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {mockedSteps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="flex gap-3 relative"
                        >
                            {index !== mockedSteps.length - 1 && (
                                <div className="absolute left-4 top-8 w-[1px] h-full bg-white/5" />
                            )}

                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.type === 'complete' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted-foreground'
                                }`}>
                                <step.icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 pt-1">
                                <p className={`text-xs font-medium leading-relaxed ${step.type === 'complete' ? 'text-green-400' : 'text-foreground'
                                    }`}>
                                    {step.message}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1">{step.time}</p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-black/20 text-[10px] font-mono text-muted-foreground truncate italic">
                {">"} system.aether.core_stable_v1.0.4
            </div>
        </div>
    );
}
