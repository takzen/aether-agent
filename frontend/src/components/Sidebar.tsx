"use client";

import { Home, Brain, Database, Settings, Activity, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const menuItems = [
    { icon: Home, label: "Command Center", href: "/" },
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: Database, label: "Knowledge Base", href: "/knowledge" },
    { icon: Brain, label: "Memories", href: "/memories" },
    { icon: Activity, label: "Agent Logs", href: "/logs" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen glass border-r border-white/10 flex flex-col p-6 z-50">
            <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 glow-primary">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>
                <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    AETHER
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                                    ? "bg-primary/10 text-primary border border-primary/20"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "glow-primary" : "group-hover:scale-110 transition-transform"}`} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="glass-dark p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/40 flex items-center justify-center glow-secondary">
                        <span className="text-xs font-bold text-secondary">A.I.</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold">Gemini 3</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Core</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
