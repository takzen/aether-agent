"use client";

import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { User, Lock, Bell, Moon, Database, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
            {/* CINEMATIC BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-20">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Settings</h1>
                        <p className="text-sm text-neutral-400">Configure your personal intelligence layer.</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full space-y-12">

                    {/* Section: Profile */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-1">
                                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-2xl font-bold text-white">TK</div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Takzen</h3>
                                <p className="text-neutral-400 text-sm">Pro Plan • Active since Dec 2025</p>
                            </div>
                            <button className="ml-auto px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors">Edit Profile</button>
                        </div>
                    </section>

                    {/* Section: AI Configuration */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-white/5 pb-2">AI Configuration</h3>

                        <div className="bg-white/5 border border-white/5 rounded-2xl divide-y divide-white/5">
                            <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Database className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="font-medium text-white">Model Selection</div>
                                        <div className="text-sm text-neutral-400">Currently using Gemini 1.5 Flash (Cloud)</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-neutral-600" />
                            </div>

                            <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Lock className="w-5 h-5 text-green-400" />
                                    <div>
                                        <div className="font-medium text-white">Local Privacy Mode</div>
                                        <div className="text-sm text-neutral-400">Process sensitive data on-device (Llama 3)</div>
                                    </div>
                                </div>
                                {/* Toggle Switch Mock */}
                                <div className="w-12 h-6 bg-white/10 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-neutral-400 rounded-full transition-all" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: System */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 border-b border-white/5 pb-2">System</h3>

                        <div className="bg-white/5 border border-white/5 rounded-2xl divide-y divide-white/5">
                            <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <Bell className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <div className="font-medium text-white">Notifications</div>
                                        <div className="text-sm text-neutral-400">Manage alerts and daily digests</div>
                                    </div>
                                </div>
                                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                                </div>
                            </div>

                            <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <LogOut className="w-5 h-5 text-red-400" />
                                    <div>
                                        <div className="font-medium text-red-400 group-hover:text-red-300">Sign Out</div>
                                        <div className="text-sm text-neutral-500">Terminate current session</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            </main>
        </div>
    );
}
