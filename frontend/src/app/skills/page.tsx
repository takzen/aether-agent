"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Cpu, Plus, Trash2, FileText, ExternalLink, X, Loader2, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type AgentSkill = {
  id: string;
  name: string;
  purpose: string;
  triggers: string;
  instructions: string;
  agent_enabled?: boolean;
  cron_enabled?: boolean;
  created_at?: string;
  markdown_path?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function SkillsPage() {
  const [skills, setSkills] = useState<AgentSkill[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [triggers, setTriggers] = useState("");
  const [instructions, setInstructions] = useState("");
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; path: string; content: string; isLoading: boolean }>({
    isOpen: false,
    path: "",
    content: "",
    isLoading: false,
  });

  const loadSkills = async () => {
    setError(null);
    setIsLoaded(false);
    try {
      const res = await fetch(`${API_BASE}/skills`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.skills)) {
        setSkills(data.skills);
      } else {
        setSkills([]);
        setError(data.message || "Failed to load skills.");
      }
    } catch {
      setSkills([]);
      setError("Cannot connect to backend. Ensure API runs on http://localhost:8000.");
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const addSkill = async () => {
    if (!name.trim() || !instructions.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          purpose,
          triggers,
          instructions,
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Failed to create skill.");
      } else {
        setName("");
        setPurpose("");
        setTriggers("");
        setInstructions("");
        await loadSkills();
      }
    } catch {
      setError("Failed to create skill.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditSkill = (skill: AgentSkill) => {
    setEditingSkillId(skill.id);
    setName(skill.name || "");
    setPurpose(skill.purpose || "");
    setTriggers(skill.triggers || "");
    setInstructions(skill.instructions || "");
  };

  const cancelEdit = () => {
    setEditingSkillId(null);
    setName("");
    setPurpose("");
    setTriggers("");
    setInstructions("");
  };

  const saveSkillEdit = async () => {
    if (!editingSkillId || !name.trim() || !instructions.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/skills/${editingSkillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          purpose,
          triggers,
          instructions,
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Failed to update skill.");
      } else {
        cancelEdit();
        await loadSkills();
      }
    } catch {
      setError("Failed to update skill.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateRuntime = async (skill: AgentSkill, patch: { agent_enabled?: boolean; cron_enabled?: boolean }) => {
    try {
      const res = await fetch(`${API_BASE}/skills/${skill.id}/runtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_enabled: patch.agent_enabled ?? Boolean(skill.agent_enabled ?? true),
          cron_enabled: patch.cron_enabled ?? Boolean(skill.cron_enabled ?? true),
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Failed to update skill runtime.");
      } else {
        await loadSkills();
      }
    } catch {
      setError("Failed to update skill runtime.");
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/skills/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Failed to delete skill.");
      } else {
        await loadSkills();
      }
    } catch {
      setError("Failed to delete skill.");
    }
  };

  const previewSkillMarkdown = async (skill: AgentSkill) => {
    setPreviewModal({ isOpen: true, path: skill.markdown_path || "", content: "", isLoading: true });
    try {
      const res = await fetch(`${API_BASE}/skills/${skill.id}/markdown`);
      const data = await res.json();
      if (data.status === "success") {
        setPreviewModal({
          isOpen: true,
          path: data.path || skill.markdown_path || "",
          content: data.content || "",
          isLoading: false,
        });
      } else {
        setPreviewModal({
          isOpen: true,
          path: skill.markdown_path || "",
          content: `Error: ${data.message || "Failed to load markdown."}`,
          isLoading: false,
        });
      }
    } catch {
      setPreviewModal({
        isOpen: true,
        path: skill.markdown_path || "",
        content: "Error connecting to the backend server.",
        isLoading: false,
      });
    }
  };

  const agentEnabledCount = useMemo(() => skills.filter((s) => (s.agent_enabled ?? true)).length, [skills]);
  const cronEnabledCount = useMemo(() => skills.filter((s) => (s.cron_enabled ?? true)).length, [skills]);

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white uppercase">Agent Skills</h1>
              <p className="text-[10px] text-neutral-500 font-mono">Create and toggle reusable behavior modules</p>
            </div>
          </div>
          <div className="text-[10px] text-neutral-600 border-r border-white/10 pr-3 mr-1 font-mono hidden lg:block">
            Agent: {agentEnabledCount}/{skills.length} | Cron: {cronEnabledCount}/{skills.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#1e1e1e] p-6">
          <div className="grid grid-cols-12 gap-4">
            <section className="col-span-12 lg:col-span-4 bg-[#181818] border border-[#303030] rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">{editingSkillId ? "Edit Skill" : "Create Skill"}</h2>
              {error && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Skill name"
                className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />

              <input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose (optional)"
                className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />

              <input
                value={triggers}
                onChange={(e) => setTriggers(e.target.value)}
                placeholder="Trigger keywords (comma separated)"
                className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={"Skill instructions (Markdown allowed), e.g.\n# Daily Report\n## What Was Done\n- ...\n## Risks / Blockers\n- ...\n## Tweet Draft\n..."}
                className="w-full min-h-[160px] bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />

              <button
                onClick={editingSkillId ? saveSkillEdit : addSkill}
                disabled={!name.trim() || !instructions.trim() || isSaving}
                className="w-full text-[10px] font-mono px-2.5 py-2 rounded border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : editingSkillId ? "Save Changes" : "Add Skill"}
              </button>
              {editingSkillId && (
                <button
                  onClick={cancelEdit}
                  className="w-full text-[10px] font-mono px-2.5 py-2 rounded border border-white/20 text-neutral-300 hover:bg-white/5 transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </section>

            <section className="col-span-12 lg:col-span-8">
              <div className="bg-[#181818] border border-[#303030] rounded-2xl p-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Skill Library</h2>

                {!isLoaded ? (
                  <div className="text-xs text-neutral-500">Loading skills...</div>
                ) : skills.length === 0 ? (
                  <div className="text-xs text-neutral-500">No skills yet. Add your first one on the left.</div>
                ) : (
                  <div className="space-y-3">
                    {skills.map((skill) => (
                      <div key={skill.id} className="border border-white/10 rounded-xl p-3 bg-[#1e1e1e]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm text-white font-semibold flex items-center gap-2">
                              {skill.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full pointer-events-none select-none ${(skill.agent_enabled ?? true) ? "text-neutral-200 bg-white/10" : "text-neutral-500 bg-white/5"}`}>
                                Agent: {(skill.agent_enabled ?? true) ? "ON" : "OFF"}
                              </span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full pointer-events-none select-none ${(skill.cron_enabled ?? true) ? "text-neutral-200 bg-white/10" : "text-neutral-500 bg-white/5"}`}>
                                Cron: {(skill.cron_enabled ?? true) ? "ON" : "OFF"}
                              </span>
                            </div>
                            {skill.purpose && <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{skill.purpose}</div>}
                            {skill.triggers && <div className="text-[11px] text-neutral-500 mt-1 line-clamp-1">Triggers: {skill.triggers}</div>}
                            {skill.markdown_path && (
                              <div className="text-[10px] text-neutral-600 font-mono mt-1">File: {skill.markdown_path}</div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => previewSkillMarkdown(skill)}
                              className="text-[10px] font-mono px-2 py-1 rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors flex items-center gap-1"
                              title="Preview markdown file"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Preview
                            </button>
                            <button
                              onClick={() => startEditSkill(skill)}
                              className="text-[10px] font-mono px-2 py-1 rounded border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors flex items-center gap-1"
                              title="Edit skill"
                            >
                              <Pencil className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => updateRuntime(skill, { agent_enabled: !(skill.agent_enabled ?? true) })}
                              className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                              title="Toggle use in agent chats"
                            >
                              Agent: {(skill.agent_enabled ?? true) ? "ON" : "OFF"}
                            </button>
                            <button
                              onClick={() => updateRuntime(skill, { cron_enabled: !(skill.cron_enabled ?? true) })}
                              className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                              title="Toggle use in cron skill tasks"
                            >
                              Cron: {(skill.cron_enabled ?? true) ? "ON" : "OFF"}
                            </button>
                            <button
                              onClick={() => deleteSkill(skill.id)}
                              className="text-[10px] font-mono px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                              title="Delete skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

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
                  <h2 className="text-sm font-bold uppercase tracking-widest text-white">{previewModal.path || "Skill markdown"}</h2>
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
                    <span className="font-mono text-xs">LOADING MARKDOWN...</span>
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
