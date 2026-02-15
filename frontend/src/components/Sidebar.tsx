"use client";

import { Home, Brain, Database, Settings, Activity, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AetherLogo } from "@/components/AetherLogo";

const menuItems = [
    { icon: Home, label: "Command Center", href: "/dashboard" }, // Updated href to match dashboard route
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: Database, label: "Knowledge Base", href: "/knowledge" },
    { icon: Brain, label: "Memories", href: "/memories" },
    { icon: Activity, label: "Agent Logs", href: "/logs" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 h-screen bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-20">
            <div className="flex items-center gap-3 mb-10 pl-2">
                <AetherLogo className="w-6 h-6 text-white" />
                <h1 className="text-lg font-bold tracking-widest text-white">
                    AETHER
                </h1>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                ? "bg-white/10 text-white"
                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? "text-white" : "group-hover:text-white transition-colors"}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-5 bg-white rounded-r-full"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-purple-400">AI</span>
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">Gemini 3.1 Pro</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Online</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
