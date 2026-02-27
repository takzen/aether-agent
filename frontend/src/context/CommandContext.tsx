"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

export interface DashboardMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    isInitial?: boolean;
    extra?: string[];
    sources?: string[];
    isLogEntry?: boolean;
    logType?: string;
}

interface CommandContextType {
    messages: DashboardMessage[];
    setMessages: React.Dispatch<React.SetStateAction<DashboardMessage[]>>;
    addMessage: (msg: DashboardMessage) => void;
    clearMessages: () => void;
    isLoaded: boolean;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export function CommandProvider({ children }: { children: React.ReactNode }) {
    const [messages, setMessages] = useState<DashboardMessage[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial load - SSR safe
    useEffect(() => {
        const saved = localStorage.getItem("aether_terminal_history");
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch {
                console.error("Failed to parse terminal history");
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever messages change, only after initial load
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("aether_terminal_history", JSON.stringify(messages));
        }
    }, [messages, isLoaded]);

    const addMessage = useCallback((msg: DashboardMessage) => {
        setMessages((prev) => [...prev, msg]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        localStorage.removeItem("aether_terminal_history");
    }, []);

    const contextValue = useMemo(() => ({
        messages,
        setMessages,
        addMessage,
        clearMessages,
        isLoaded
    }), [messages, addMessage, clearMessages, isLoaded]);

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
