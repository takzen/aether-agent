"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Clock3, Play, Pause, Trash2, Plus, RefreshCcw } from "lucide-react";

type CronTask = {
  key: string;
  label: string;
  description: string;
};

type CronJob = {
  id: string;
  name: string;
  trigger_type?: "cron" | "date";
  schedule: string;
  run_at?: string | null;
  timezone: string;
  task: string;
  payload?: { prompt?: string; skill_id?: string; instruction?: string; store_as_tweet?: boolean };
  enabled: boolean;
  last_run_at?: string | null;
  next_run_at?: string | null;
  last_status?: string | null;
  last_error?: string | null;
};

type TweetDraft = {
  tweet: string;
  highlights?: string[];
  generated_at?: string;
  from_log_id?: number;
  to_log_id?: number;
  log_count?: number;
};

type Skill = {
  id: string;
  name: string;
  enabled: boolean;
  cron_enabled?: boolean;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}`;

export default function CronPage() {
  const [tasks, setTasks] = useState<CronTask[]>([]);
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [schedule, setSchedule] = useState("0 3 * * *");
  const [scheduleMode, setScheduleMode] = useState<"simple" | "advanced">("simple");
  const [repeatMode, setRepeatMode] = useState<"daily" | "weekly" | "monthly" | "once">("daily");
  const [timeOfDay, setTimeOfDay] = useState("03:00");
  const [runAtLocal, setRunAtLocal] = useState("");
  const [weekday, setWeekday] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [timezone, setTimezone] = useState("Europe/Warsaw");
  const [task, setTask] = useState("sleep_cycle");
  const [enabled, setEnabled] = useState(true);
  const [agentPrompt, setAgentPrompt] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [skillInstruction, setSkillInstruction] = useState("Przygotuj raport statusowy projektu do social media.");
  const [storeAsTweet, setStoreAsTweet] = useState(true);
  const [latestTweetDraft, setLatestTweetDraft] = useState<TweetDraft | null>(null);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const taskOptions = useMemo(() => tasks.map((t) => ({ value: t.key, label: t.label })), [tasks]);
  const taskMetaByKey = useMemo(() => {
    const out: Record<string, CronTask> = {};
    tasks.forEach((t) => {
      out[t.key] = t;
    });
    return out;
  }, [tasks]);

  useEffect(() => {
    if (scheduleMode !== "simple") return;
    if (repeatMode === "once") return;
    const [hhRaw, mmRaw] = timeOfDay.split(":");
    const hh = Number.isFinite(Number(hhRaw)) ? Number(hhRaw) : 3;
    const mm = Number.isFinite(Number(mmRaw)) ? Number(mmRaw) : 0;

    if (repeatMode === "daily") {
      setSchedule(`${mm} ${hh} * * *`);
      return;
    }
    if (repeatMode === "weekly") {
      setSchedule(`${mm} ${hh} * * ${weekday}`);
      return;
    }
    setSchedule(`${mm} ${hh} ${dayOfMonth} * *`);
  }, [scheduleMode, repeatMode, timeOfDay, weekday, dayOfMonth]);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tasksRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/cron/tasks`),
        fetch(`${API_BASE}/cron/jobs`),
      ]);

      const tasksData = await tasksRes.json();
      const jobsData = await jobsRes.json();

      if (tasksData.status === "success") {
        setTasks(tasksData.tasks || []);
        if ((tasksData.tasks || []).length > 0 && !task) {
          setTask(tasksData.tasks[0].key);
        }
      }

      if (jobsData.status === "success") {
        setJobs(jobsData.jobs || []);
      }

      try {
        const skillsRes = await fetch(`${API_BASE}/skills`);
        const skillsData = await skillsRes.json();
        if (skillsData.status === "success" && Array.isArray(skillsData.skills)) {
          const enabledSkills = (skillsData.skills as Skill[]).filter((s) => (s.cron_enabled ?? true));
          setSkills(enabledSkills);
          if (!selectedSkillId && enabledSkills.length > 0) {
            setSelectedSkillId(enabledSkills[0].id);
          }
        } else {
          setSkills([]);
        }
      } catch {
        setSkills([]);
      }

      try {
        const draftsRes = await fetch(`${API_BASE}/social/tweet-drafts?limit=1`);
        const draftsData = await draftsRes.json();
        if (draftsData.status === "success" && Array.isArray(draftsData.drafts) && draftsData.drafts.length > 0) {
          setLatestTweetDraft(draftsData.drafts[0] as TweetDraft);
        } else {
          setLatestTweetDraft(null);
        }
      } catch {
        setLatestTweetDraft(null);
      }

      if (tasksData.status !== "success" || jobsData.status !== "success") {
        setError(tasksData.message || jobsData.message || "Failed to load cron data.");
      }
    } catch {
      setError("Cannot connect to backend. Ensure API runs on http://localhost:8000.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createJob = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/cron/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          trigger_type: scheduleMode === "simple" && repeatMode === "once" ? "date" : "cron",
          schedule,
          run_at: scheduleMode === "simple" && repeatMode === "once" ? runAtLocal : null,
          timezone,
          task,
          enabled,
          payload:
            task === "agent_task"
              ? { prompt: agentPrompt }
              : task === "skill_task"
                ? {
                    skill_id: selectedSkillId,
                    instruction: skillInstruction,
                    store_as_tweet: storeAsTweet,
                  }
                : {},
        }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setError(data.message || "Failed to create cron job.");
      } else {
        setName("");
        setAgentPrompt("");
        setSkillInstruction("Przygotuj raport statusowy projektu do social media.");
        setRunAtLocal("");
        await load();
      }
    } catch {
      setError("Failed to create cron job.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleJob = async (job: CronJob) => {
    try {
      setActionStatus({ type: "info", message: `${job.enabled ? "Pausing" : "Resuming"} "${job.name}"...` });
      const res = await fetch(`${API_BASE}/cron/jobs/${job.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !job.enabled }),
      });
      const data = await res.json();
      if (data.status !== "success") {
        setActionStatus({ type: "error", message: data.message || "Failed to toggle cron job." });
      } else {
        setActionStatus({ type: "success", message: `Job "${job.name}" updated.` });
      }
      await load();
    } catch {
      setActionStatus({ type: "error", message: "Failed to toggle cron job." });
    }
  };

  const runNow = async (job: CronJob) => {
    try {
      setRunningJobId(job.id);
      setActionStatus({ type: "info", message: `Running "${job.name}"...` });
      const res = await fetch(`${API_BASE}/cron/jobs/${job.id}/run`, { method: "POST" });
      const data = await res.json();
      if (data.status !== "success") {
        setActionStatus({ type: "error", message: data.message || `Job "${job.name}" failed.` });
      } else {
        setActionStatus({ type: "success", message: `Job "${job.name}" completed.` });
      }
      await load();
    } catch {
      setActionStatus({ type: "error", message: `Job "${job.name}" failed to run.` });
    } finally {
      setRunningJobId(null);
    }
  };

  const deleteJob = async (job: CronJob) => {
    try {
      setActionStatus({ type: "info", message: `Deleting "${job.name}"...` });
      const res = await fetch(`${API_BASE}/cron/jobs/${job.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status !== "success") {
        setActionStatus({ type: "error", message: data.message || "Failed to delete cron job." });
      } else {
        setActionStatus({ type: "success", message: `Job "${job.name}" deleted.` });
      }
      await load();
    } catch {
      setActionStatus({ type: "error", message: "Failed to delete cron job." });
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#1e1e1e] overflow-hidden font-sans text-foreground">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col relative overflow-hidden">
        <div className="px-6 py-4 border-b border-[#303030] flex items-center justify-between bg-[#181818] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Clock3 className="w-4 h-4 text-cyan-400" />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white uppercase">Cron Scheduler</h1>
              <p className="text-[10px] text-neutral-500 font-mono">Plan and execute autonomous background tasks</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-neutral-600 border-r border-white/10 pr-3 mr-1 font-mono hidden lg:block">
              Jobs: {jobs.length}
            </div>
            <button
              onClick={load}
              className="text-[10px] font-mono px-2.5 py-1 rounded border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        <div className="flex-1 relative overflow-y-auto bg-[#1e1e1e]">
          <div className="p-6 space-y-4">
            {error && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</div>}
            {actionStatus && (
              <div
                className={`text-xs rounded-lg px-3 py-2 border ${
                  actionStatus.type === "error"
                    ? "text-red-300 bg-red-500/10 border-red-500/30"
                    : actionStatus.type === "success"
                      ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
                      : "text-cyan-300 bg-cyan-500/10 border-cyan-500/30"
                }`}
              >
                {actionStatus.message}
              </div>
            )}

            <div className="grid grid-cols-12 gap-4">
              <section className="col-span-12 lg:col-span-4 bg-[#181818] border border-[#303030] rounded-2xl p-4 space-y-3">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Create Job</h2>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Job name"
                  className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />

                <input
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Cron expression (e.g. 0 3 * * *)"
                  className={`w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50 ${scheduleMode === "simple" ? "opacity-70" : ""}`}
                  disabled={scheduleMode === "simple"}
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScheduleMode("simple")}
                    className={`text-[10px] font-mono px-2 py-1 rounded border ${scheduleMode === "simple" ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "border-white/10 text-neutral-300 hover:bg-white/5"}`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setScheduleMode("advanced")}
                    className={`text-[10px] font-mono px-2 py-1 rounded border ${scheduleMode === "advanced" ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "border-white/10 text-neutral-300 hover:bg-white/5"}`}
                  >
                    Advanced (Cron)
                  </button>
                </div>

                {scheduleMode === "simple" && (
                  <div className="space-y-2 rounded-lg border border-white/10 p-3 bg-[#161616]">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Repeat</label>
                    <select
                      value={repeatMode}
                      onChange={(e) => setRepeatMode(e.target.value as "daily" | "weekly" | "monthly" | "once")}
                      className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="once">One-time</option>
                    </select>

                    {repeatMode !== "once" ? (
                      <>
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Time</label>
                        <input
                          type="time"
                          value={timeOfDay}
                          onChange={(e) => setTimeOfDay(e.target.value)}
                          className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </>
                    ) : (
                      <>
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Date and time</label>
                        <input
                          type="datetime-local"
                          value={runAtLocal}
                          onChange={(e) => setRunAtLocal(e.target.value)}
                          className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </>
                    )}

                    {repeatMode === "weekly" && (
                      <>
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Day of week</label>
                        <select
                          value={weekday}
                          onChange={(e) => setWeekday(e.target.value)}
                          className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        >
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                          <option value="0">Sunday</option>
                        </select>
                      </>
                    )}

                    {repeatMode === "monthly" && (
                      <>
                        <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Day of month</label>
                        <input
                          type="number"
                          min={1}
                          max={31}
                          value={dayOfMonth}
                          onChange={(e) => setDayOfMonth(e.target.value)}
                          className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                        />
                      </>
                    )}
                  </div>
                )}

                <input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="Timezone (e.g. Europe/Warsaw)"
                  className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                />

                <select
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                >
                  {taskOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {taskMetaByKey[task]?.description && (
                  <div className="text-[11px] text-neutral-400 leading-relaxed">
                    {taskMetaByKey[task].description}
                  </div>
                )}

                {task === "agent_task" && (
                  <textarea
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder="Agent prompt (what should Aether do on each run?)"
                    className="w-full min-h-[100px] bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  />
                )}

                {task === "skill_task" && (
                  <div className="space-y-2 rounded-lg border border-white/10 p-3 bg-[#161616]">
                    <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Skill</label>
                    <select
                      value={selectedSkillId}
                      onChange={(e) => setSelectedSkillId(e.target.value)}
                      className="w-full bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    >
                      {skills.length === 0 && <option value="">No enabled skills</option>}
                      {skills.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <textarea
                      value={skillInstruction}
                      onChange={(e) => setSkillInstruction(e.target.value)}
                      placeholder="Runtime instruction for this skill execution"
                      className="w-full min-h-[84px] bg-[#1e1e1e] border border-[#404040] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                    />
                    <label className="flex items-center gap-2 text-xs text-neutral-300">
                      <input
                        type="checkbox"
                        checked={storeAsTweet}
                        onChange={(e) => setStoreAsTweet(e.target.checked)}
                      />
                      Store output as tweet draft
                    </label>
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs text-neutral-300">
                  <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Enabled
                </label>

                <button
                  disabled={
                    !name.trim()
                    || isSaving
                    || isLoading
                    || (task === "agent_task" && !agentPrompt.trim())
                    || (task === "skill_task" && !selectedSkillId.trim())
                    || (scheduleMode === "simple" && repeatMode === "once" && !runAtLocal.trim())
                  }
                  onClick={createJob}
                  className="w-full text-[10px] font-mono px-2.5 py-2 rounded border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Job
                </button>
              </section>

              <section className="col-span-12 lg:col-span-8 bg-[#181818] border border-[#303030] rounded-2xl p-4">
                <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Scheduled Jobs</h2>

                <div className="space-y-3">
                  {jobs.length === 0 && !isLoading && (
                    <div className="text-xs text-neutral-500">No cron jobs defined yet.</div>
                  )}

                  {jobs.map((job) => (
                    <div key={job.id} className="border border-white/10 rounded-xl p-3 bg-[#1e1e1e]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm text-white font-semibold flex items-center gap-2">
                            {job.name}
                            <span className={`text-[10px] font-mono ${job.enabled ? "text-emerald-300/80" : "text-neutral-500"}`}>
                              {job.enabled ? "Enabled" : "Paused"}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {job.trigger_type === "date" ? `One-time @ ${job.run_at || "-"}` : `${job.schedule} (${job.timezone})`}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-1">
                            Task: {taskMetaByKey[job.task]?.label || job.task}
                          </div>
                          {taskMetaByKey[job.task]?.description && (
                            <div className="text-[11px] text-neutral-500">{taskMetaByKey[job.task].description}</div>
                          )}
                          <div className="text-[11px] text-neutral-500">Next: {job.next_run_at || "-"}</div>
                          <div className="text-[11px] text-neutral-500">Last: {job.last_run_at || "-"}</div>
                          {job.last_error && <div className="text-[11px] text-red-300 mt-1">Error: {job.last_error}</div>}
                          <div className="mt-2 rounded-lg border border-white/10 bg-[#181818] p-2">
                            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Task Preview</div>
                            {job.task === "agent_task" && job.payload?.prompt ? (
                              <pre className="text-[11px] text-neutral-300 whitespace-pre-wrap break-words font-mono">
                                {job.payload.prompt}
                              </pre>
                            ) : job.task === "skill_task" ? (
                              <div className="space-y-1">
                                <div className="text-[11px] text-neutral-400">
                                  Skill ID: <span className="font-mono text-neutral-300">{job.payload?.skill_id || "-"}</span>
                                </div>
                                <div className="text-[11px] text-neutral-300 whitespace-pre-wrap break-words">
                                  {job.payload?.instruction || "No runtime instruction"}
                                </div>
                                <div className="text-[10px] text-neutral-500">
                                  Store as tweet: {job.payload?.store_as_tweet ? "yes" : "no"}
                                </div>
                              </div>
                            ) : job.task === "tweet_update" ? (
                              <div className="space-y-1">
                                <div className="text-[11px] text-neutral-300 whitespace-pre-wrap break-words">
                                  {latestTweetDraft?.tweet || "Brak draftu jeszcze. Uruchom job, aby wygenerowac podglad."}
                                </div>
                                {latestTweetDraft?.generated_at && (
                                  <div className="text-[10px] text-neutral-500 font-mono">
                                    Generated: {latestTweetDraft.generated_at}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-neutral-500">Ten task nie ma dedykowanego podgladu payloadu.</div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => runNow(job)}
                            disabled={runningJobId === job.id}
                            className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                          >
                            <Play className="w-3.5 h-3.5" /> {runningJobId === job.id ? "Running..." : "Run"}
                          </button>

                          <button
                            onClick={() => toggleJob(job)}
                            className="text-[10px] font-mono px-2 py-1 rounded border border-white/10 text-neutral-300 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1"
                          >
                            {job.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            {job.enabled ? "Pause" : "Resume"}
                          </button>

                          <button
                            onClick={() => deleteJob(job)}
                            className="text-[10px] font-mono px-2 py-1 rounded border border-red-500/30 text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

