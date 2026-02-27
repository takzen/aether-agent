"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface DashboardMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    isInitial?: boolean;
    extra?: string[];
    sources?: string[];
}

interface CommandContextType {
    messages: DashboardMessage[];
    setMessages: React.Dispatch<React.SetStateAction<DashboardMessage[]>>;
    addMessage: (msg: DashboardMessage) => void;
    clearMessages: () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<DashboardMessage[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("aether_terminal_history");
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse terminal history", e);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("aether_terminal_history", JSON.stringify(messages));
        }
    }, [messages, isInitialized]);

    const addMessage = (msg: DashboardMessage) => {
        setMessages((prev) => [...prev, msg]);
    };

    const clearMessages = () => {
        setMessages([]);
        localStorage.removeItem("aether_terminal_history");
    };

    return (
        <CommandContext.Provider value={{ messages, setMessages, addMessage, clearMessages }}>
            {children}
        </CommandContext.Provider>
    );
}

export function useCommand() {
    const context = useContext(CommandContext);
    if (context === undefined) {
        throw new Error("useCommand must be used within a CommandProvider");
    }
    return context;
}
