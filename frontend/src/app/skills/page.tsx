"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Cpu, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

type AgentSkill = {
  id: string;
  name: string;
  purpose: string;
  triggers: string;
  instructions: string;
  enabled: boolean;
  created_at?: string;
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
  const [enabledByDefault, setEnabledByDefault] = useState(true);

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
          enabled: enabledByDefault,
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
        setEnabledByDefault(true);
        await loadSkills();
      }
    } catch {
      setError("Failed to create skill.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSkill = async (id: string, nextEnabled: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/skills/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: nextEnabled }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Failed to update skill.");
      } else {
        await loadSkills();
      }
    } catch {
      setError("Failed to update skill.");
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

  const enabledCount = useMemo(() => skills.filter((s) => s.enabled).length, [skills]);

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white uppercase">Agent Skills</h1>
              <p className="text-[10px] text-neutral-500 font-mono">Create reusable behavior modules for the agent</p>
            </div>
          </div>
          <div className="text-[10px] text-neutral-600 border-r border-white/10 pr-3 mr-1 font-mono hidden lg:block">
            Skills: {enabledCount}/{skills.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#1e1e1e] p-6">
          <div className="grid grid-cols-12 gap-4">
            <section className="col-span-12 lg:col-span-4 bg-[#181818] border border-[#303030] rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Create Skill</h2>
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
                placeholder="Skill instructions..."
                className="w-full min-h-[160px] bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
              />

              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input type="checkbox" checked={enabledByDefault} onChange={(e) => setEnabledByDefault(e.target.checked)} />
                Enabled by default
              </label>

              <button
                onClick={addSkill}
                disabled={!name.trim() || !instructions.trim() || isSaving}
                className="w-full text-[10px] font-mono px-2.5 py-2 rounded border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> {isSaving ? "Saving..." : "Add Skill"}
              </button>
            </section>

            <section className="col-span-12 lg:col-span-8 bg-[#181818] border border-[#303030] rounded-2xl p-4">
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
                            <span className={`text-[10px] font-mono ${skill.enabled ? "text-emerald-300/80" : "text-neutral-500"}`}>
                              {skill.enabled ? "Enabled" : "Paused"}
                            </span>
                          </div>
                          {skill.purpose && <div className="text-[11px] text-neutral-400 mt-1">{skill.purpose}</div>}
                          {skill.triggers && <div className="text-[11px] text-neutral-500 mt-1">Triggers: {skill.triggers}</div>}
                          <div className="text-[11px] text-neutral-300 mt-2 whitespace-pre-wrap">{skill.instructions}</div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => toggleSkill(skill.id, !skill.enabled)}
                            className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                            title={skill.enabled ? "Disable skill" : "Enable skill"}
                          >
                            {skill.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                            {skill.enabled ? "Disable" : "Enable"}
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
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
