"use client";

import Sidebar from "@/components/Sidebar";
import { Search, FileText, Upload, ExternalLink, Code, Loader2, Trash, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import NotificationModal from "@/components/modals/NotificationModal";

export default function KnowledgeBase() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [items, setItems] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal States
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | number | null; filename: string | null }>({
        isOpen: false,
        id: null,
        filename: null
    });
    const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
        isOpen: false,
        title: "",
        message: "",
        type: "success"
    });

    // Filtered items based on search query
    const filteredItems = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Fetch documents on mount
    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8000/knowledge");
            const data = await res.json();
            if (data.status === "success") {
                // Map DB documents to UI format
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const dbItems = data.documents.map((doc: any, index: number) => ({
                    id: `db-${index}-${doc.filename}`,
                    type: doc.filename.endsWith('.py') || doc.filename.endsWith('.js') || doc.filename.endsWith('.ts') ? 'code' : 'doc',
                    title: doc.filename,
                    added: doc.status === 'indexed' ? 'READY' : 'ON_DISK',
                    size: doc.size || "Unknown",
                    icon: doc.filename.endsWith('.py') || doc.filename.endsWith('.js') || doc.filename.endsWith('.ts') ? Code : FileText,
                    lines: doc.metadata?.total_chunks || 0
                }));

                setItems(dbItems);
            }
        } catch (err) {
            console.error("Failed to fetch documents:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/ingest", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (data.status === "success") {
                // Refresh list from DB
                await fetchDocuments();

                setNotification({
                    isOpen: true,
                    title: "FILE INDEXED",
                    message: `Successfully processed and indexed "${file.name}".`,
                    type: "success"
                });
            } else {
                setNotification({
                    isOpen: true,
                    title: "UPLOAD FAILED",
                    message: data.message || "Unknown error occurred.",
                    type: "error"
                });
            }
        } catch (err) {
            console.error("Upload error:", err);
            setNotification({
                isOpen: true,
                title: "CONNECTION ERROR",
                message: "Could not connect to the backend server.",
                type: "error"
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const initiateDelete = (e: React.MouseEvent, id: number, filename: string) => {
        e.stopPropagation();
        setDeleteModal({ isOpen: true, id, filename });
    };

    const confirmDelete = async () => {
        if (!deleteModal.filename || deleteModal.id === null) return;

        try {
            const res = await fetch(`http://localhost:8000/knowledge/${deleteModal.filename}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.status === "success") {
                setItems(prev => prev.filter(item => item.id !== deleteModal.id));
                setNotification({
                    isOpen: true,
                    title: "SOURCE DELETED",
                    message: `"${deleteModal.filename}" has been removed from the knowledge base.`,
                    type: "success"
                });
            } else {
                setNotification({
                    isOpen: true,
                    title: "DELETE FAILED",
                    message: data.message,
                    type: "error"
                });
            }
        } catch (err) {
            console.error("Delete error:", err);
            setNotification({
                isOpen: true,
                title: "CONNECTION ERROR",
                message: "Could not connect to the backend server.",
                type: "error"
            });
        }
    };

    const handleIndex = async (e: React.MouseEvent, filename: string) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:8000/knowledge/index/${filename}`, {
                method: "POST",
            });
            const data = await res.json();
            if (data.status === "success") {
                await fetchDocuments();
                setNotification({
                    isOpen: true,
                    title: "INDEXING_COMPLETE",
                    message: `"${filename}" is now synchronized with Aether's neural core.`,
                    type: "success"
                });
            } else {
                setNotification({
                    isOpen: true,
                    title: "INDEXING_FAILED",
                    message: data.message,
                    type: "error"
                });
            }
        } catch (err) {
            console.error("Indexing error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">

            <Sidebar />

            <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10">

                {/* Header — Aligned with Dashboard Style */}
                <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                        <div>
                            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Knowledge Base</h1>
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                <span>SYSTEM.KNOWLEDGE_CORE</span>
                                <span className="text-neutral-700">|</span>
                                <span>{items.length} SOURCES ACTIVE</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".md,.txt,.pdf"
                        />

                        <button
                            onClick={handleFileClick}
                            disabled={isUploading}
                            className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-[11px] font-mono font-bold text-purple-400 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {isUploading ? "INDEXING..." : "ADD_SOURCE"}
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">

                    {/* Search Bar — VSCode Style */}
                    <div className="relative max-w-2xl bg-[#252526] border border-[#3c3c3c] rounded-xl px-4 py-3 focus-within:border-[#007acc]/50 transition-all flex items-center gap-3">
                        <span className="text-[#858585] font-mono text-[10px] font-bold shrink-0">QUERY_CORE:</span>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent w-full text-[#cccccc] font-mono text-sm placeholder:text-[#858585] focus:outline-none"
                            placeholder="Explore documents, code, or neural nodes..."
                        />
                        <Search className="h-4 w-4 text-[#858585]" />
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? (
                            <div className="col-span-full py-20 text-center text-neutral-500 font-mono text-xs animate-pulse">
                                SYNCHRONizing_KNOWLEDGE_CORE...
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-neutral-500 font-mono text-xs">
                                {searchQuery ? "NO_MATCHES_FOUND" : "KNOWLEDGE_CORE_EMPTY"}
                            </div>
                        ) : filteredItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative p-5 rounded-2xl bg-[#252526] border border-[#303030] hover:bg-[#2d2d2d] hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-1 rounded-lg">
                                    <button
                                        onClick={(e) => initiateDelete(e, item.id, item.title)}
                                        className="p-1.5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded transition-colors"
                                        title="Delete Source"
                                    >
                                        <Trash className="w-3.5 h-3.5" />
                                    </button>
                                    <div className="p-1.5 hover:bg-white/10 text-purple-400 rounded transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 group-hover:bg-purple-500/20 transition-colors shrink-0">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 pr-16 text-left">
                                        <h3 className="text-[13px] font-bold text-neutral-200 mb-1 line-clamp-1 group-hover:text-white transition-colors uppercase tracking-tight tracking-wide" title={item.title}>
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                                            <span className={`px-2 py-0.5 rounded ${item.added === 'READY' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                {item.added}
                                            </span>
                                            <span className="text-neutral-700">•</span>
                                            <span>{item.type.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    {item.type === 'doc' && (
                                        <div className="text-[10px] text-neutral-500 font-mono bg-white/5 px-2 py-1 rounded inline-block">
                                            SIZE: {item.size}
                                        </div>
                                    )}
                                    {item.type === 'code' && (
                                        <div className="text-[10px] text-green-400/60 font-mono bg-green-500/5 px-2 py-1 rounded inline-block">
                                            CHUNKS: {item.lines}
                                        </div>
                                    )}

                                    {item.added === 'ON_DISK' && (
                                        <button
                                            onClick={(e) => handleIndex(e, item.title)}
                                            className="text-[10px] font-bold font-mono text-purple-400 hover:text-white bg-purple-500/10 hover:bg-purple-500 px-3 py-1 rounded transition-all flex items-center gap-2 border border-purple-500/30"
                                        >
                                            <Zap className="w-3 h-3" /> INDEX_NOW
                                        </button>
                                    )}
                                </div>

                                {/* Card Status Strip */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                        ))}

                        {/* Connection Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={handleFileClick}
                            className={`p-5 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-3 text-neutral-600 hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/5 transition-all cursor-pointer min-h-[140px] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </div>
                            <span className="text-[11px] font-mono uppercase tracking-widest font-bold">
                                {isUploading ? "Indexing..." : "Connect_Core_Source"}
                            </span>
                        </motion.div>
                    </div>
                </div>



            </main>

            {/* Modals */}
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmDelete}
                title="DELETE_SOURCE_CONFIRMATION"
                message={`Are you sure you want to permanently delete "${deleteModal.filename}"? This action cannot be undone and will remove all associated vector embeddings.`}
                confirmText="DELETE PERMANENTLY"
                isDestructive={true}
            />

            <NotificationModal
                isOpen={notification.isOpen}
                onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
        </div>
    );
}
