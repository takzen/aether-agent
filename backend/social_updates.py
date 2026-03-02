from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from agent import model
from config import get_config
from local_db import sqlite_service


CHECKPOINT_KEY = "tweet_update"
DRAFTS_SETTING_KEY = "SOCIAL_TWEET_DRAFTS"
LATEST_DRAFT_SETTING_KEY = "SOCIAL_LATEST_TWEET_DRAFT"
WORKSPACE_SOCIAL_DIR = Path(__file__).resolve().parent.parent / "workspace" / "social"
WORKSPACE_DRAFTS_FILE = WORKSPACE_SOCIAL_DIR / "tweet_drafts.jsonl"
WORKSPACE_LATEST_FILE = WORKSPACE_SOCIAL_DIR / "latest_tweet.txt"


class TweetUpdate(BaseModel):
    tweet: str = Field(description="Final tweet draft text, ready to post.")
    highlights: List[str] = Field(description="2-4 factual highlights extracted from logs.")


tweet_agent = Agent(
    model=model,
    system_prompt="Identity: Aether Social Update",
    retries=3,
    output_type=TweetUpdate,
)


@tweet_agent.system_prompt
async def inject_tweet_language(ctx: RunContext[dict]) -> str:
    conf = get_config()
    lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
    if lang == "en":
        return (
            "You are Aether Social Update module. Respond only in ENGLISH. "
            "Write compact, factual, technical tweet drafts about project progress. "
            "Do not invent work that is not visible in logs."
        )
    return (
        "Jestes modulem Aether Social Update. Odpowiadaj tylko po polsku. "
        "Tworz krotkie, techniczne i rzeczowe drafty tweetow o postepie projektu. "
        "Nie zmyslaj rzeczy, ktorych nie ma w logach."
    )


def _parse_json_list(raw: str) -> List[Dict[str, Any]]:
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return []
    if not isinstance(parsed, list):
        return []
    return [item for item in parsed if isinstance(item, dict)]


async def run_tweet_update_cycle() -> Dict[str, Any]:
    checkpoint_id = await sqlite_service.get_checkpoint(CHECKPOINT_KEY)
    logs = await sqlite_service.get_logs(limit=250, from_id=checkpoint_id)

    if not logs:
        now_iso = datetime.now(timezone.utc).isoformat()
        fallback_tweet = (
            "Szybki update z poligonu Aethera: dzis bez nowych commitow w telemetrii. "
            "Jutro wracam z kolejnym raportem z prac. #AetherAgent #AI #BuildInPublic"
        )
        entry = {
            "tweet": fallback_tweet,
            "highlights": ["Brak nowych logow od poprzedniego checkpointu."],
            "generated_at": now_iso,
            "from_log_id": checkpoint_id,
            "to_log_id": checkpoint_id,
            "log_count": 0,
        }
        await _store_tweet_entry(entry)
        return entry

    # sqlite_service.get_logs returns newest first; reverse for timeline coherence.
    chronological = list(reversed(logs))
    filtered: List[Dict[str, Any]] = []
    for item in chronological:
        message = str(item.get("message", ""))
        source = str(item.get("source", ""))
        if source == "CRON" and "tweet" in message.lower():
            continue
        filtered.append(item)

    if not filtered:
        filtered = chronological

    # Keep prompt bounded but informative.
    window = filtered[-100:]
    prompt_lines = [
        "Na podstawie ponizszej telemetrii przygotuj 1 draft tweeta o postepie projektu Aether.",
        "Wymagania:",
        "- faktograficznie: tylko to, co wynika z logow",
        "- styl: krotki technical update, energia build-in-public",
        "- 3-6 hashtagow, z czego #AetherAgent i #AI obowiazkowo",
        "- max 500 znakow",
        "- mozesz uzyc emoji, ale oszczednie",
        "",
        "TELEMETRIA:",
    ]
    max_log_id = checkpoint_id
    for log in window:
        log_id = int(log.get("id", 0))
        if log_id > max_log_id:
            max_log_id = log_id
        prompt_lines.append(
            f"[{log_id}|{str(log.get('type', '')).upper()}|{str(log.get('source', ''))}] {str(log.get('message', ''))}"
        )

    result = await tweet_agent.run("\n".join(prompt_lines))
    data = result.output.model_dump()

    tweet = " ".join(str(data.get("tweet", "")).split()).strip()
    if len(tweet) > 500:
        tweet = tweet[:497].rstrip() + "..."

    entry = {
        "tweet": tweet,
        "highlights": [str(x).strip() for x in data.get("highlights", []) if str(x).strip()][:4],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "from_log_id": checkpoint_id,
        "to_log_id": max_log_id,
        "log_count": len(window),
    }

    await _store_tweet_entry(entry)
    await sqlite_service.set_checkpoint(CHECKPOINT_KEY, max_log_id)
    await sqlite_service.add_log(
        "info",
        "SOCIAL",
        f"Tweet draft prepared from {entry['log_count']} logs (ID {checkpoint_id} -> {max_log_id}).",
    )
    return entry


async def store_tweet_from_external_text(tweet_text: str, source: str = "external", metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
    clean = " ".join(str(tweet_text or "").split()).strip()
    if not clean:
        raise ValueError("Tweet text cannot be empty.")
    if len(clean) > 500:
        clean = clean[:497].rstrip() + "..."

    payload = metadata or {}
    entry = {
        "tweet": clean,
        "highlights": [f"Generated by {source}."],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "from_log_id": int(payload.get("from_log_id", 0) or 0),
        "to_log_id": int(payload.get("to_log_id", 0) or 0),
        "log_count": int(payload.get("log_count", 0) or 0),
        "source": source,
        "meta": payload,
    }
    await _store_tweet_entry(entry)
    return entry


async def _store_tweet_entry(entry: Dict[str, Any]) -> None:
    settings = await sqlite_service.get_settings()
    existing = _parse_json_list(str(settings.get(DRAFTS_SETTING_KEY, "[]")))
    history = [entry] + existing
    history = history[:30]
    await sqlite_service.set_setting(DRAFTS_SETTING_KEY, json.dumps(history, ensure_ascii=False))
    await sqlite_service.set_setting(LATEST_DRAFT_SETTING_KEY, entry.get("tweet", ""))
    await sqlite_service.add_log("tweet", "SOCIAL", json.dumps(entry, ensure_ascii=False))
    _store_tweet_entry_in_workspace(entry)


def _store_tweet_entry_in_workspace(entry: Dict[str, Any]) -> None:
    WORKSPACE_SOCIAL_DIR.mkdir(parents=True, exist_ok=True)
    WORKSPACE_DRAFTS_FILE.open("a", encoding="utf-8").write(json.dumps(entry, ensure_ascii=False) + "\n")
    WORKSPACE_LATEST_FILE.write_text(str(entry.get("tweet", "")), encoding="utf-8")
