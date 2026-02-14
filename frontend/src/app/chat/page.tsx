"use client";

import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ThoughtStream from "@/components/ThoughtStream";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function ChatPage() {
    const [mounted, setMounted] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    if (!mounted) return null;

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            if (data.status === "success") {
                const assistantMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: data.response,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                console.error("Agent error:", data.message);
            }
        } catch (error) {
            console.error("Failed to connect to Aether backend:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
            {/* CINEMATIC BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
            </div>

            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Chat Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 glow-primary">
                            <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Personal Intelligence</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Neural Core Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-muted-foreground">LATENCY: 12ms</span>
                    </div>
                </div>

                {/* Message Container */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                            <Sparkles className="w-12 h-12 text-primary" />
                            <div className="space-y-2">
                                <h3 className="text-xl font-light">How can Aether assist you today?</h3>
                                <p className="text-sm max-w-xs mx-auto">I'm ready to manage your knowledge, automate tasks, or just explore ideas.</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex gap-4 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${msg.role === "user"
                                            ? "bg-secondary/10 border-secondary/20 text-secondary"
                                            : "bg-primary/10 border-primary/20 text-primary glow-primary"
                                            }`}>
                                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>

                                        <div className={`p-4 rounded-2xl glass ${msg.role === "user" ? "bg-white/5" : "bg-primary/5"
                                            }`}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-2">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                <span>•</span>
                                                {msg.role === "assistant" ? "Neural Response" : "Human Input"}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                        >
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="glass p-4 rounded-2xl flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 glass border-t border-white/5 relative z-10">
                    <div className="max-w-4xl mx-auto relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />
                        <div className="relative flex items-center gap-2 glass-dark p-2 rounded-2xl border border-white/10">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Send a command or ask Aether..."
                                className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm placeholder:text-muted-foreground outline-none"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 glow-primary"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <p className="text-center mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
                        Aether v1.0 • PydanticAI Logic Layer
                    </p>
                </div>
            </main>

            <ThoughtStream />
        </div>
    );
}
