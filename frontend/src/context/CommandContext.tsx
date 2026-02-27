"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

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
    // Lazy initialization for React 19 / Modern patterns
    // This loads the state during the initial render, so we don't need a useEffect to load it.
    const [messages, setMessages] = useState<DashboardMessage[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("aether_terminal_history");
            try {
                return saved ? JSON.parse(saved) : [];
            } catch {
                console.error("Failed to parse terminal history");
                return [];
            }
        }
        return [];
    });

    // Save to localStorage whenever messages change. 
    // Since state is initialized lazily, the first run of this effect will simply 
    // write back what was already in localStorage (or an empty array if nothing was there).
    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("aether_terminal_history", JSON.stringify(messages));
        }
    }, [messages]);

    const addMessage = useCallback((msg: DashboardMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem("aether_terminal_history");
        }
    }, []);

    const contextValue = useMemo(() => ({
        messages,
        setMessages,
        addMessage,
        clearMessages
    }), [messages, addMessage, clearMessages]);

    return (
        <CommandContext.Provider value={contextValue}>
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
