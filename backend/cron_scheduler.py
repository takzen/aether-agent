from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import uuid4
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from local_db import sqlite_service


SUPPORTED_TASKS: Dict[str, Dict[str, str]] = {
    "sleep_cycle": {
        "label": "Sleep Cycle",
        "description": "Runs Night Cycle consolidation and refreshes Morning Brief.",
    },
    "awm_simulation": {
        "label": "AWM Simulation",
        "description": "Runs Active World Model simulation against recent telemetry.",
    },
    "agent_task": {
        "label": "Agent Task",
        "description": "Runs a custom prompt through Aether Agent.",
    },
    "skill_task": {
        "label": "Skill Task",
        "description": "Runs a selected enabled skill on fresh telemetry.",
    },
    "tweet_update": {
        "label": "Tweet Update",
        "description": "Generates a social update draft from new project telemetry.",
    },
}

SETTINGS_KEY = "CRON_JOBS"
DEFAULT_TWEET_BOOTSTRAP_KEY = "CRON_DEFAULT_TWEET_JOBS_BOOTSTRAPPED"

DEFAULT_TWEET_JOBS: List[Dict[str, str]] = [
    {
        "id": "tweet-update-0700",
        "name": "Aether Tweet Update 07:00",
        "schedule": "0 7 * * *",
        "timezone": "Europe/Warsaw",
    },
    {
        "id": "tweet-update-1900",
        "name": "Aether Tweet Update 19:00",
        "schedule": "0 19 * * *",
        "timezone": "Europe/Warsaw",
    },
]


class CronSchedulerService:
    def __init__(self) -> None:
        self.scheduler = AsyncIOScheduler()
        self._jobs: List[Dict[str, Any]] = []
        self._started = False

    async def start(self) -> None:
        if self._started:
            return
        self.scheduler.start()
        self._started = True
        await self._reload_from_storage()
        await self._ensure_default_tweet_jobs()
        await sqlite_service.add_log("info", "CRON", "Cron scheduler started.")

    async def stop(self) -> None:
        if not self._started:
            return
        self.scheduler.shutdown(wait=False)
        self._started = False

    async def list_jobs(self) -> List[Dict[str, Any]]:
        return [self._to_public(job) for job in self._jobs]

    async def list_tasks(self) -> List[Dict[str, str]]:
        return [
            {"key": key, "label": meta["label"], "description": meta["description"]}
            for key, meta in SUPPORTED_TASKS.items()
        ]

    async def upsert_job(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        validated = self._validate_payload(payload)
        job_id = payload.get("id") or str(uuid4())

        now = self._now_iso()
        existing = next((j for j in self._jobs if j["id"] == job_id), None)
        if existing:
            existing.update(validated)
            existing["updated_at"] = now
            job = existing
        else:
            job = {
                "id": job_id,
                "name": validated["name"],
                "trigger_type": validated["trigger_type"],
                "schedule": validated["schedule"],
                "run_at": validated["run_at"],
                "timezone": validated["timezone"],
                "task": validated["task"],
                "payload": validated["payload"],
                "enabled": validated["enabled"],
                "last_run_at": None,
                "last_status": "idle",
                "last_error": None,
                "created_at": now,
                "updated_at": now,
            }
            self._jobs.append(job)

        self._sync_scheduler_job(job)
        await self._save_to_storage()
        return self._to_public(job)

    async def delete_job(self, job_id: str) -> bool:
        idx = next((i for i, j in enumerate(self._jobs) if j["id"] == job_id), None)
        if idx is None:
            return False

        self._remove_scheduler_job(job_id)
        self._jobs.pop(idx)
        await self._save_to_storage()
        return True

    async def toggle_job(self, job_id: str, enabled: bool) -> Dict[str, Any] | None:
        job = next((j for j in self._jobs if j["id"] == job_id), None)
        if not job:
            return None

        job["enabled"] = bool(enabled)
        job["updated_at"] = self._now_iso()
        self._sync_scheduler_job(job)
        await self._save_to_storage()
        return self._to_public(job)

    async def run_now(self, job_id: str) -> Dict[str, Any] | None:
        job = next((j for j in self._jobs if j["id"] == job_id), None)
        if not job:
            return None
        await self._execute_job(job_id)
        await self._save_to_storage()
        return self._to_public(job)

    async def _execute_job(self, job_id: str) -> None:
        job = next((j for j in self._jobs if j["id"] == job_id), None)
        if not job:
            return

        try:
            await sqlite_service.add_log("info", "CRON", f"Executing cron job '{job['name']}' ({job['task']}).")

            if job["task"] == "sleep_cycle":
                from sleep_cycle import run_sleep_cycle

                await run_sleep_cycle()
            elif job["task"] == "awm_simulation":
                from world_model import run_active_world_model_simulation

                await run_active_world_model_simulation()
            elif job["task"] == "agent_task":
                from agent import aether_agent

                prompt = str((job.get("payload") or {}).get("prompt", "")).strip()
                if not prompt:
                    raise ValueError("Agent Task requires payload.prompt.")
                await aether_agent.run(
                    user_prompt=prompt,
                    deps={"user_message": prompt, "search_count": 0},
                )
            elif job["task"] == "skill_task":
                await self._run_skill_task(job)
            elif job["task"] == "tweet_update":
                from social_updates import run_tweet_update_cycle

                await run_tweet_update_cycle()
            else:
                raise ValueError(f"Unsupported task '{job['task']}'")

            job["last_run_at"] = self._now_iso()
            job["last_status"] = "success"
            job["last_error"] = None
            if job.get("trigger_type", "cron") == "date":
                job["enabled"] = False
            await sqlite_service.add_log("success", "CRON", f"Cron job '{job['name']}' completed successfully.")
        except Exception as exc:
            job["last_run_at"] = self._now_iso()
            job["last_status"] = "error"
            job["last_error"] = str(exc)
            if job.get("trigger_type", "cron") == "date":
                job["enabled"] = False
            await sqlite_service.add_log("error", "CRON", f"Cron job '{job['name']}' failed: {exc}")
        finally:
            await self._save_to_storage()

    async def _reload_from_storage(self) -> None:
        settings = await sqlite_service.get_settings()
        raw = settings.get(SETTINGS_KEY, "[]")

        parsed: List[Dict[str, Any]]
        try:
            data = json.loads(raw)
            parsed = data if isinstance(data, list) else []
        except json.JSONDecodeError:
            parsed = []

        self._jobs = []
        for item in parsed:
            if not isinstance(item, dict):
                continue
            try:
                restored = {
                    "id": str(item["id"]),
                    "name": str(item["name"]),
                    "trigger_type": str(item.get("trigger_type", "cron")),
                    "schedule": str(item["schedule"]),
                    "run_at": item.get("run_at"),
                    "timezone": str(item.get("timezone", "UTC")),
                    "task": str(item["task"]),
                    "payload": item.get("payload") if isinstance(item.get("payload"), dict) else {},
                    "enabled": bool(item.get("enabled", True)),
                    "last_run_at": item.get("last_run_at"),
                    "last_status": item.get("last_status", "idle"),
                    "last_error": item.get("last_error"),
                    "created_at": str(item.get("created_at") or self._now_iso()),
                    "updated_at": str(item.get("updated_at") or self._now_iso()),
                }
                self._validate_payload(restored)
                self._jobs.append(restored)
                self._sync_scheduler_job(restored)
            except Exception:
                continue

    async def _save_to_storage(self) -> None:
        payload = json.dumps(self._jobs, ensure_ascii=False)
        await sqlite_service.set_setting(SETTINGS_KEY, payload)

    async def _ensure_default_tweet_jobs(self) -> None:
        settings = await sqlite_service.get_settings()
        bootstrap_done = str(settings.get(DEFAULT_TWEET_BOOTSTRAP_KEY, "false")).lower() == "true"
        if bootstrap_done:
            return

        # If user already has custom tweet jobs, do not duplicate defaults.
        if any(j.get("task") == "tweet_update" for j in self._jobs):
            await sqlite_service.set_setting(DEFAULT_TWEET_BOOTSTRAP_KEY, "true")
            return

        now = self._now_iso()
        for template in DEFAULT_TWEET_JOBS:
            restored = {
                "id": template["id"],
                "name": template["name"],
                "trigger_type": "cron",
                "schedule": template["schedule"],
                "run_at": None,
                "timezone": template["timezone"],
                "task": "tweet_update",
                "payload": {},
                "enabled": True,
                "last_run_at": None,
                "last_status": "idle",
                "last_error": None,
                "created_at": now,
                "updated_at": now,
            }
            self._validate_payload(restored)
            self._jobs.append(restored)
            self._sync_scheduler_job(restored)

        await self._save_to_storage()
        await sqlite_service.set_setting(DEFAULT_TWEET_BOOTSTRAP_KEY, "true")
        await sqlite_service.add_log("info", "CRON", "Bootstrapped default tweet update jobs (07:00, 19:00 Europe/Warsaw).")

    def _validate_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        name = str(payload.get("name", "")).strip()
        trigger_type = str(payload.get("trigger_type", "cron")).strip() or "cron"
        schedule = str(payload.get("schedule", "")).strip()
        run_at = payload.get("run_at")
        task = str(payload.get("task", "")).strip()
        raw_payload = payload.get("payload")
        payload_obj = raw_payload if isinstance(raw_payload, dict) else {}
        tz_name = str(payload.get("timezone", "UTC")).strip() or "UTC"
        enabled = bool(payload.get("enabled", True))

        if not name:
            raise ValueError("Job name is required.")
        if trigger_type not in {"cron", "date"}:
            raise ValueError("Invalid trigger type.")
        if task not in SUPPORTED_TASKS:
            raise ValueError("Unsupported task.")
        if task == "agent_task":
            prompt = str(payload_obj.get("prompt", "")).strip()
            if not prompt:
                raise ValueError("Agent Task requires a prompt.")
        if task == "skill_task":
            skill_id = str(payload_obj.get("skill_id", "")).strip()
            if not skill_id:
                raise ValueError("Skill Task requires payload.skill_id.")

        try:
            tz = ZoneInfo(tz_name)
        except Exception as exc:
            raise ValueError("Invalid timezone.") from exc

        normalized_run_at = None
        if trigger_type == "cron":
            if not schedule:
                raise ValueError("Cron expression is required.")
            try:
                CronTrigger.from_crontab(schedule, timezone=tz)
            except Exception as exc:
                raise ValueError("Invalid cron expression. Use standard 5-field crontab format.") from exc
        else:
            if not run_at:
                raise ValueError("run_at is required for one-time trigger.")
            try:
                dt = datetime.fromisoformat(str(run_at))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=tz)
                normalized_run_at = dt.isoformat()
            except Exception as exc:
                raise ValueError("Invalid run_at datetime.") from exc

        return {
            "name": name,
            "trigger_type": trigger_type,
            "schedule": schedule,
            "run_at": normalized_run_at,
            "timezone": tz_name,
            "task": task,
            "payload": payload_obj,
            "enabled": enabled,
        }

    async def _run_skill_task(self, job: Dict[str, Any]) -> None:
        from agent import aether_agent
        from social_updates import store_tweet_from_external_text

        payload = job.get("payload") or {}
        skill_id = str(payload.get("skill_id", "")).strip()
        if not skill_id:
            raise ValueError("Skill Task requires payload.skill_id.")

        skill = await sqlite_service.get_agent_skill(skill_id)
        if not skill:
            raise ValueError("Skill Task failed: skill not found.")

        # Respect runtime mode toggles: a skill can be enabled for agent but disabled for cron.
        try:
            settings = await sqlite_service.get_settings()
            raw = str(settings.get("SKILL_RUNTIME_MODES", "{}"))
            parsed = json.loads(raw)
            runtime = parsed.get(skill_id, {}) if isinstance(parsed, dict) else {}
            if not bool(runtime.get("cron_enabled", True)):
                await sqlite_service.add_log(
                    "info",
                    "CRON",
                    f"Skill task '{job['name']}' skipped: skill '{skill.get('name', skill_id)}' has cron mode disabled.",
                )
                return
        except Exception:
            pass

        checkpoint_key = f"skill_task::{job['id']}"
        checkpoint_id = await sqlite_service.get_checkpoint(checkpoint_key)
        logs = await sqlite_service.get_logs(limit=200, from_id=checkpoint_id)
        chronological = list(reversed(logs))
        window = chronological[-120:]

        max_log_id = checkpoint_id
        telemetry_lines: List[str] = []
        for log in window:
            log_id = int(log.get("id", 0))
            if log_id > max_log_id:
                max_log_id = log_id
            telemetry_lines.append(
                f"[{log_id}|{str(log.get('type', '')).upper()}|{str(log.get('source', ''))}] {str(log.get('message', ''))}"
            )

        if not telemetry_lines:
            telemetry_lines.append("[NO_NEW_LOGS] No fresh telemetry since previous checkpoint.")

        instruction = str(payload.get("instruction", "")).strip()
        base_prompt = instruction or "Prepare a concise progress report from telemetry."
        composed_prompt = (
            f"{base_prompt}\n\n"
            "Use only facts visible in telemetry. If data is sparse, say it explicitly.\n\n"
            "TELEMETRY:\n"
            + "\n".join(telemetry_lines)
        )

        result = await aether_agent.run(
            user_prompt=composed_prompt,
            deps={
                "user_message": "cron skill execution",
                "search_count": 0,
                "execution_mode": "cron",
                "force_skill_ids": [skill_id],
            },
        )

        text = str(getattr(result.output, "response", "") or "").strip()
        if not text:
            raise ValueError("Skill Task returned empty response.")

        if bool(payload.get("store_as_tweet", False)):
            await store_tweet_from_external_text(
                tweet_text=text,
                source="skill_task",
                metadata={
                    "job_id": job["id"],
                    "skill_id": skill_id,
                    "skill_name": str(skill.get("name", "")),
                    "from_log_id": checkpoint_id,
                    "to_log_id": max_log_id,
                    "log_count": len(window),
                },
            )

        await sqlite_service.set_checkpoint(checkpoint_key, max_log_id)
        await sqlite_service.add_log(
            "success",
            "CRON",
            f"Skill task '{job['name']}' executed using skill '{skill.get('name', skill_id)}' ({len(window)} logs).",
        )

    def _sync_scheduler_job(self, job: Dict[str, Any]) -> None:
        aps_id = self._aps_job_id(job["id"])
        self._remove_scheduler_job(job["id"])

        if not job["enabled"]:
            return

        if job.get("trigger_type", "cron") == "date":
            run_date = datetime.fromisoformat(str(job["run_at"]))
            self.scheduler.add_job(
                self._execute_job,
                trigger="date",
                run_date=run_date,
                args=[job["id"]],
                id=aps_id,
                replace_existing=True,
                coalesce=True,
                max_instances=1,
                misfire_grace_time=60,
            )
        else:
            trigger = CronTrigger.from_crontab(job["schedule"], timezone=ZoneInfo(job["timezone"]))
            self.scheduler.add_job(
                self._execute_job,
                trigger=trigger,
                args=[job["id"]],
                id=aps_id,
                replace_existing=True,
                coalesce=True,
                max_instances=1,
                misfire_grace_time=60,
            )

    def _remove_scheduler_job(self, job_id: str) -> None:
        aps_id = self._aps_job_id(job_id)
        try:
            self.scheduler.remove_job(aps_id)
        except Exception:
            pass

    def _to_public(self, job: Dict[str, Any]) -> Dict[str, Any]:
        out = dict(job)
        aps_job = self.scheduler.get_job(self._aps_job_id(job["id"])) if self._started else None
        out["next_run_at"] = aps_job.next_run_time.isoformat() if aps_job and aps_job.next_run_time else None
        return out

    @staticmethod
    def _aps_job_id(job_id: str) -> str:
        return f"cron::{job_id}"

    @staticmethod
    def _now_iso() -> str:
        return datetime.now(timezone.utc).isoformat()


cron_service = CronSchedulerService()
