"use client";

import { Home, Brain, Database, Settings, Activity, MessageSquare, Network, BookOpen, Sparkles, Clock3, Cpu, FolderOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { AetherLogo } from "@/components/AetherLogo";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const DynamicUserButton = dynamic(
    () => import("@clerk/nextjs").then((mod) => mod.UserButton),
    { ssr: false, loading: () => <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 animate-pulse" /> }
);

const menuItems = [
    { icon: Home, label: "Command Center", href: "/dashboard" }, // Updated href to match dashboard route
    { icon: MessageSquare, label: "Chat", href: "/chat" },
    { icon: Database, label: "Knowledge Base", href: "/knowledge" },
    { icon: FolderOpen, label: "Workspace", href: "/workspace" },
    { icon: Brain, label: "Memories", href: "/memories" },
    { icon: Network, label: "Neural Topology", href: "/topology" },
    { icon: Activity, label: "Agent Logs", href: "/logs" },
    { icon: Clock3, label: "Cron", href: "/cron" },
    { icon: Cpu, label: "Skills", href: "/skills" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: Sparkles, label: "Cognition", href: "/cognition" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [modelName, setModelName] = useState("Loading...");

    useEffect(() => {
        const fetchConfig = () => {
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/config`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === "success") {
                        const raw = data.config.MODEL_OVERRIDE || "gemini-3.1-pro";
                        const formatted = raw
                            .replace("ollama:", "")
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (c: string) => c.toUpperCase());
                        setModelName(formatted);
                    }
                })
                .catch(() => setModelName("Aether Core"));
        };

        fetchConfig();

        window.addEventListener("configUpdated", fetchConfig);
        return () => window.removeEventListener("configUpdated", fetchConfig);
    }, [pathname]); // Refresh when navigating or event fired

    return (
        <div className="w-20 xl:w-64 h-screen bg-[#181818] border-r border-[#303030] flex flex-col p-4 xl:p-6 z-20 shrink-0 transition-all duration-300 overflow-hidden">
            <Link href="/dashboard" className="flex items-center gap-3 mb-10 xl:pl-2 justify-center xl:justify-start hover:opacity-80 transition-opacity font-sans">
                <AetherLogo className="w-6 h-6 text-white shrink-0" />
                <h1 className="text-lg font-bold tracking-widest text-white hidden xl:block">
                    AETHER
                </h1>
            </Link>

            <nav className="flex-1 space-y-1 font-sans">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-center xl:justify-start gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                ? "bg-white/10 text-white"
                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "group-hover:text-white transition-colors"}`} />
                            <span className="text-sm font-medium hidden xl:block truncate">{item.label}</span>
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

            <div className="mt-auto pt-6 border-t border-white/5 font-sans flex flex-col gap-4">
                <Link
                    href="/docs"
                    className={`flex items-center justify-center xl:justify-start gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${pathname === "/docs" ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"
                        }`}
                >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium hidden xl:block truncate">Documentation</span>
                </Link>

                <div className="p-2 xl:p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center xl:justify-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center shrink-0">
                        {process.env.NEXT_PUBLIC_ENABLE_AUTH === "true" ? (
                            <DynamicUserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-8 h-8 rounded-full border border-purple-500/30",
                                        userButtonPopoverCard: "bg-neutral-900 border border-white/10 shadow-2xl",
                                        userButtonPopoverActionButton: "hover:bg-white/5 text-neutral-300",
                                        userButtonPopoverActionButtonText: "text-neutral-300",
                                        userButtonPopoverFooter: "hidden"
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-purple-400">AI</span>
                            </div>
                        )}
                    </div>
                    <div className="hidden xl:block min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{modelName}</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Online</p>
                    </div>
                </div>
                <div className="text-center">
                    <span className="text-[10px] text-neutral-600 font-mono tracking-widest hidden min-[1367px]:inline">AETHER v1.5.0</span>
                </div>
            </div>
        </div>
    );
}
