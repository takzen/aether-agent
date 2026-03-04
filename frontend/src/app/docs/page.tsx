"use client";

import Sidebar from "@/components/Sidebar";
import { FileText, Search, Book, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import mermaid from "mermaid";

// Initialize Mermaid for Dark Mode
mermaid.initialize({
    startOnLoad: true,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "Inter, system-ui, sans-serif",
});

const Mermaid = ({ chart }: { chart: string }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.removeAttribute("data-processed");
            mermaid.contentLoaded();
        }
    }, [chart]);

    return (
        <div
            key={chart}
            ref={ref}
            className="mermaid flex justify-center bg-[#1a1a1b] p-8 rounded-3xl border border-[#303030] my-10 overflow-x-auto shadow-inner"
        >
            {chart}
        </div>
    );
};

export default function DocsPage() {
    const [docs, setDocs] = useState<string[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [lang, setLang] = useState<"en" | "pl">("en");

    const handleSelectDoc = useCallback(async (filename: string, language: string = lang) => {
        setSelectedDoc(filename);
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/system/docs/content/${filename}?lang=${language}`);
            const data = await res.json();
            if (data.status === "success") {
                setContent(data.content);
            }
        } catch {
            setContent("# Error\nFailed to load documentation content.");
        } finally {
            setLoading(false);
        }
    }, [lang]);

    useEffect(() => {
        setLoading(true);
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/system/docs?lang=${lang}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success" && data.docs) {
                    const sortedDocs = [...data.docs].sort((a, b) => {
                        if (a.toLowerCase() === "readme.md") return -1;
                        if (b.toLowerCase() === "readme.md") return 1;
                        return a.localeCompare(b);
                    });
                    setDocs(sortedDocs);
                    if (sortedDocs.length > 0) {
                        handleSelectDoc(sortedDocs[0], lang);
                    } else {
                        setContent("# Missing\nNo documentation found for this language.");
                        setSelectedDoc(null);
                    }
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Docs fetch error:", err);
                setLoading(false);
            });
    }, [handleSelectDoc, lang]);

    const filteredDocs = docs.filter(doc =>
        doc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10">

                <header className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-50">
                    <div className="flex items-center gap-3">
                        <Book className="w-4 h-4 text-cyan-400" />
                        <div>
                            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Documentation</h3>
                            <p className="text-[10px] text-neutral-500 font-mono">Read system guides, architecture notes and operational docs</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-[#252526] rounded-lg p-1 border border-[#303030]">
                            <button
                                onClick={() => setLang("en")}
                                className={`px-3 py-1 text-[11px] font-bold tracking-wider rounded-md transition-all ${lang === "en" ? "bg-cyan-500/20 text-cyan-400" : "text-neutral-500 hover:text-neutral-300"}`}
                            >
                                EN
                            </button>
                            <button
                                onClick={() => setLang("pl")}
                                className={`px-3 py-1 text-[11px] font-bold tracking-wider rounded-md transition-all ${lang === "pl" ? "bg-cyan-500/20 text-cyan-400" : "text-neutral-500 hover:text-neutral-300"}`}
                            >
                                PL
                            </button>
                        </div>
                        <div className="text-[10px] text-neutral-600 border-r border-white/10 pr-3 mr-1 font-mono hidden lg:block">
                            Docs: {docs.length}
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden bg-[#1e1e1e]">

                    <aside className="w-72 border-r border-[#303030] bg-[#181818]/50 flex flex-col shrink-0 overflow-hidden">
                        <div className="p-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg py-2 pl-10 pr-4 text-xs text-[#cccccc] focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-neutral-700"
                                />
                            </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-4 pb-10 space-y-1 scrollbar-none">
                            {filteredDocs.map((doc) => (
                                <button
                                    key={doc}
                                    onClick={() => handleSelectDoc(doc)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left group ${selectedDoc === doc
                                        ? "bg-[#252526] border border-[#303030] text-white shadow-xl"
                                        : "text-neutral-500 hover:text-neutral-300 hover:bg-[#252526]/30"
                                        }`}
                                >
                                    <div className={`p-1.5 rounded-lg border transition-colors ${selectedDoc === doc ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-neutral-800/50 border-white/5 text-neutral-700 group-hover:text-neutral-500"}`}>
                                        <FileText className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-[13px] font-medium truncate flex-1">{doc.replace(".md", "").replace(/_/g, " ")}</span>
                                    {selectedDoc === doc && <ChevronRight className="w-4 h-4 text-cyan-500/50" />}
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <div className="flex-1 overflow-hidden flex flex-col relative">
                        <div className="flex-1 overflow-y-auto p-12 scrollbar-none">
                            <div className="max-w-4xl mx-auto w-full">

                                <AnimatePresence mode="wait">
                                    {loading ? (
                                        <div className="flex items-center justify-center p-20">
                                            <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                                        </div>
                                    ) : (
                                        <motion.div
                                            key={selectedDoc}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-[#252526] border border-[#303030] rounded-3xl p-10 lg:p-16 shadow-2xl backdrop-blur-md"
                                        >
                                            <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                                                <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                                                    <Book className="w-6 h-6 text-cyan-400" />
                                                </div>
                                                <div>
                                                    <h1 className="text-3xl font-bold text-white tracking-tight">{selectedDoc?.replace(".md", "").replace(/_/g, " ")}</h1>
                                                </div>
                                            </div>

                                            <div className="prose prose-invert prose-neutral max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        h1: ({ children }) => <span className="hidden">{children}</span>,
                                                        h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-12 mb-6 tracking-tight flex items-center gap-4">
                                                            <div className="w-1 h-5 bg-cyan-500 rounded-full" />
                                                            {children}
                                                        </h2>,
                                                        h3: ({ children }) => <h3 className="text-base font-bold text-neutral-300 mt-10 mb-4 uppercase tracking-widest">{children}</h3>,
                                                        p: ({ children }) => <p className="text-neutral-400 text-lg leading-relaxed mb-8">{children}</p>,
                                                        ul: ({ children }) => <ul className="space-y-4 my-8 pl-6 border-l border-white/5">{children}</ul>,
                                                        li: ({ children }) => (
                                                            <li className="flex items-start gap-3 text-neutral-400 text-[17px]">
                                                                <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-cyan-500/30 shrink-0" />
                                                                <span>{children}</span>
                                                            </li>
                                                        ),
                                                        code: (props) => {
                                                            const { className, children } = props;
                                                            const isInline = !className;

                                                            // Handle Mermaid diagrams
                                                            if (className === "language-mermaid") {
                                                                return <Mermaid chart={String(children).trim()} />;
                                                            }

                                                            return isInline
                                                                ? <code className="bg-[#1e1e1e] text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5">{children}</code>
                                                                : <div className="my-10 rounded-2xl border border-[#303030] bg-[#1a1a1b] p-8 shadow-inner relative group">
                                                                    <pre className="font-mono text-sm leading-relaxed text-neutral-400 overflow-x-auto">
                                                                        {children}
                                                                    </pre>
                                                                </div>;
                                                        },
                                                        blockquote: ({ children }) => (
                                                            <blockquote className="border-l-4 border-purple-500/30 bg-purple-500/5 px-8 py-6 rounded-r-2xl my-12 italic text-neutral-400 text-xl leading-relaxed">
                                                                {children}
                                                            </blockquote>
                                                        )
                                                    }}
                                                >
                                                    {content}
                                                </ReactMarkdown>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
