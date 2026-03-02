"use client";

import Sidebar from "@/components/Sidebar";
import { Search, FileText, ExternalLink, Trash, FolderOpen, X, Loader2, RefreshCcw, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import NotificationModal from "@/components/modals/NotificationModal";

type WorkspaceFile = {
  path: string;
  size: string;
  size_bytes: number;
  modified_at: string;
  extension: string;
};

type WorkspaceItem = {
  id: string;
  type: "code" | "doc";
  title: string;
  added: "WORKSPACE";
  size: string;
  icon: typeof FileText;
  lines: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function WorkspacePage() {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; path: string | null }>({
    isOpen: false,
    id: null,
    path: null,
  });
  const [notification, setNotification] = useState<{ isOpen: boolean; title: string; message: string; type: "success" | "error" }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; path: string | null; content: string; isLoading: boolean }>({
    isOpen: false,
    path: null,
    content: "",
    isLoading: false,
  });

  const filteredItems = items.filter((item) => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const fetchWorkspaceFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/workspace/files`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.files)) {
        const mapped: WorkspaceItem[] = (data.files as WorkspaceFile[]).map((f, idx) => {
          const ext = (f.extension || "").toLowerCase();
          const isCode = [".py", ".js", ".ts", ".tsx", ".jsx", ".json", ".yaml", ".yml", ".toml", ".ini", ".sh", ".ps1"].includes(ext);
          return {
            id: `ws-${idx}-${f.path}`,
            type: isCode ? "code" : "doc",
            title: f.path,
            added: "WORKSPACE",
            size: f.size,
            icon: FileText,
            lines: 0,
          };
        });
        setItems(mapped);
      } else {
        setItems([]);
        setNotification({
          isOpen: true,
          title: "LOAD FAILED",
          message: data.message || "Failed to load workspace files.",
          type: "error",
        });
      }
    } catch {
      setItems([]);
      setNotification({
        isOpen: true,
        title: "CONNECTION ERROR",
        message: "Could not connect to the backend server.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceFiles();
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
      const res = await fetch(`${API_BASE}/workspace/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") {
        await fetchWorkspaceFiles();
        setNotification({
          isOpen: true,
          title: "FILE UPLOADED",
          message: `Successfully saved "${file.name}" to workspace.`,
          type: "success",
        });
      } else {
        setNotification({
          isOpen: true,
          title: "UPLOAD FAILED",
          message: data.message || "Unknown error occurred.",
          type: "error",
        });
      }
    } catch {
      setNotification({
        isOpen: true,
        title: "CONNECTION ERROR",
        message: "Could not connect to the backend server.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const initiateDelete = (e: React.MouseEvent, id: string, path: string) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, id, path });
  };

  const confirmDelete = async () => {
    if (!deleteModal.path || !deleteModal.id) return;
    try {
      const res = await fetch(`${API_BASE}/workspace/content?path=${encodeURIComponent(deleteModal.path)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.status === "success") {
        setItems((prev) => prev.filter((item) => item.id !== deleteModal.id));
        setNotification({
          isOpen: true,
          title: "FILE DELETED",
          message: `"${deleteModal.path}" has been removed from workspace.`,
          type: "success",
        });
      } else {
        setNotification({
          isOpen: true,
          title: "DELETE FAILED",
          message: data.message || "Failed to delete file.",
          type: "error",
        });
      }
    } catch {
      setNotification({
        isOpen: true,
        title: "CONNECTION ERROR",
        message: "Could not connect to the backend server.",
        type: "error",
      });
    }
  };

  const handlePreview = async (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setPreviewModal({ isOpen: true, path, content: "", isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/workspace/content?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.status === "success") {
        setPreviewModal({ isOpen: true, path, content: data.content, isLoading: false });
      } else {
        setPreviewModal({ isOpen: true, path, content: `Error: ${data.message}`, isLoading: false });
      }
    } catch {
      setPreviewModal({ isOpen: true, path, content: "Error connecting to the backend server.", isLoading: false });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden z-10">
        <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold tracking-wider text-white uppercase">Workspace</h3>
              <p className="text-[10px] text-neutral-500 font-mono">Browse notes, reports and generated outputs from /workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-neutral-600 border-r border-white/10 pr-3 mr-1 font-mono hidden lg:block">
              Files: {items.length}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={handleFileClick}
              disabled={isUploading}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              {isUploading ? "Uploading..." : "Add Workspace File"}
            </button>
            <button
              onClick={fetchWorkspaceFiles}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          <div className="relative max-w-2xl bg-[#252526] border border-[#3c3c3c] rounded-xl px-4 py-3 focus-within:border-purple-500/50 transition-all flex items-center gap-3">
            <Search className="h-4 w-4 text-[#858585]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-[#cccccc] text-sm placeholder:text-[#858585] focus:outline-none"
              placeholder="Search workspace files..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-neutral-500 font-mono text-xs animate-pulse">SCANNING WORKSPACE...</div>
            ) : filteredItems.length === 0 ? (
              <div className="col-span-full py-20 text-center text-neutral-500 font-mono text-xs">
                {searchQuery ? "NO MATCHES FOUND" : "WORKSPACE EMPTY"}
              </div>
            ) : (
              filteredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative p-4 rounded-xl bg-[#252526] border border-[#303030] hover:bg-[#2d2d2d] hover:border-cyan-500/30 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-1 rounded-lg">
                    <button
                      onClick={(e) => initiateDelete(e, item.id, item.title)}
                      className="p-1.5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded transition-colors"
                      title="Delete File"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handlePreview(e, item.title)}
                      className="p-1.5 hover:bg-white/10 text-cyan-400 rounded transition-colors"
                      title="Preview File"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 pr-24 text-left">
                      <h3 className="text-[13px] font-bold text-neutral-200 mb-1 truncate group-hover:text-white transition-colors tracking-tight" title={item.title}>
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-500">
                        <span className="inline-flex items-center text-[10px] font-mono text-cyan-300/80">Workspace</span>
                        <span className="text-neutral-700">|</span>
                        <span>{item.type === "code" ? "Code" : "Document"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-[10px] text-neutral-500 font-mono bg-white/5 px-2 py-1 rounded inline-block">
                      Size: {item.size}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))
            )}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleFileClick}
                className={`p-4 rounded-xl border border-dashed border-white/5 flex flex-col items-center justify-center gap-2.5 text-neutral-600 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all cursor-pointer min-h-[124px] ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </div>
                <span className="text-[11px] font-mono uppercase tracking-widest font-bold">
                  {isUploading ? "Uploading..." : "Add Another File"}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title="DELETE FILE CONFIRMATION"
        message={`Are you sure you want to permanently delete "${deleteModal.path}" from workspace? This action cannot be undone.`}
        confirmText="DELETE PERMANENTLY"
        isDestructive={true}
      />

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />

      <AnimatePresence>
        {previewModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-[#1e1e1e]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">{previewModal.path}</h2>
                </div>
                <button
                  onClick={() => setPreviewModal((prev) => ({ ...prev, isOpen: false }))}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-[#1e1e1e] scrollbar-thin scrollbar-thumb-white/10">
                {previewModal.isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                    <span className="font-mono text-xs">DECRYPTING DATA...</span>
                  </div>
                ) : (
                  <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap leading-relaxed">{previewModal.content}</pre>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
