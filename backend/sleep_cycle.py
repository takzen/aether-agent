import json
import re
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext

from agent import model
from config import get_config
from local_db import sqlite_service


class MorningBrief(BaseModel):
    brief: str = Field(description="Short factual summary of telemetry.")
    points: list[str] = Field(description="2-4 concrete insights with log citations.")


sleep_agent = Agent(
    model=model,
    system_prompt="Identity: Aether NightCycleProcessor",
    retries=3,
    output_type=MorningBrief,
)


@sleep_agent.system_prompt
async def inject_sleep_language(ctx: RunContext[dict]) -> str:
    conf = get_config()
    lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
    if lang == "en":
        return (
            "You are Aether NightCycleProcessor. Respond in ENGLISH. "
            "Generate concise, factual operational summaries only."
        )
    return (
        "Jestes modulem Aether NightCycleProcessor. Odpowiadaj po polsku. "
        "Tworz zwiezle, faktograficzne podsumowania operacyjne."
    )


async def run_sleep_cycle():
    checkpoint_id = await sqlite_service.get_checkpoint("sleep_cycle")
    logs = await sqlite_service.get_logs(limit=120, from_id=checkpoint_id)

    if not logs:
        conf = get_config()
        lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
        if lang == "en":
            return {
                "brief": "No new telemetry since last cycle. Systems stable.",
                "points": ["No fresh events detected.", "Checkpoint synchronization active."],
            }
        return {
            "brief": "Brak nowej telemetrii od ostatniego cyklu. Systemy stabilne.",
            "points": ["Nie wykryto nowych zdarzen.", "Synchronizacja checkpointu aktywna."],
        }

    # Prevent recursive summaries: ignore sleep-cycle/report-generated logs.
    ignored_sources = {"SLEEP_CYCLE"}
    ignored_types = {"brief", "tweet", "awm"}
    actionable_logs = [
        log
        for log in logs
        if str(log.get("source", "")).upper() not in ignored_sources
        and str(log.get("type", "")).lower() not in ignored_types
    ]

    max_log_id_all = max(int(log["id"]) for log in logs if "id" in log)

    if not actionable_logs:
        conf = get_config()
        lang = conf.get("SYSTEM_LANGUAGE", "pl").lower().strip()
        if lang == "en":
            data = {
                "brief": f"Processed {len(logs)} system events. No actionable non-report telemetry in this cycle.",
                "points": [f"[log:{max_log_id_all}] Only maintenance/report events detected."],
            }
        else:
            data = {
                "brief": f"Przetworzono {len(logs)} zdarzen systemowych. Brak nowych operacyjnych zdarzen do podsumowania.",
                "points": [f"[log:{max_log_id_all}] Wykryto tylko zdarzenia raportowe lub utrzymaniowe."],
            }
        await sqlite_service.add_log("brief", "SLEEP_CYCLE", json.dumps(data, ensure_ascii=False))
        await sqlite_service.set_checkpoint("sleep_cycle", max_log_id_all)
        await sqlite_service.add_log("info", "SLEEP_CYCLE", f"Consolidated 0 actionable events up to ID {max_log_id_all}.")
        return data

    prompt = (
        "Analyze NEW telemetry since last checkpoint and return strict JSON.\n"
        "Rules:\n"
        "1) Use only facts explicitly present in logs.\n"
        "2) No metaphors or speculative claims.\n"
        "3) Every point must include citation in format [log:<id>].\n"
        "4) Keep concise and operational.\n"
        "JSON schema: {\"brief\": string, \"points\": [string, ...]}\n"
        "points count: 2-4.\n\n"
        "LOGS:\n"
    )

    max_log_id = checkpoint_id
    for log in actionable_logs:
        prompt += f"[{log['id']}|{str(log['type']).upper()}|{str(log['source'])}] {str(log['message'])}\n"
        if int(log["id"]) > max_log_id:
            max_log_id = int(log["id"])

    try:
        result = await sleep_agent.run(prompt)
        data = result.output.model_dump()

        points = data.get("points", []) if isinstance(data, dict) else []
        valid_points = isinstance(points, list) and all(isinstance(p, str) for p in points) and 2 <= len(points) <= 4
        log_ids = {int(log["id"]) for log in actionable_logs if "id" in log}
        cited_ok = True

        if valid_points:
            for point in points:
                cited = re.findall(r"\[log:(\d+)\]", point)
                if not cited:
                    cited_ok = False
                    break
                if any(int(cid) not in log_ids for cid in cited):
                    cited_ok = False
                    break
        else:
            cited_ok = False

        if not cited_ok:
            recent = list(reversed(actionable_logs))[:4]
            fallback_points: list[str] = []
            for item in recent:
                msg = str(item.get("message", "")).strip().replace("\n", " ")
                if len(msg) > 170:
                    msg = msg[:167].rstrip() + "..."
                fallback_points.append(f"[log:{item['id']}] {item['source']}/{item['type']}: {msg}")

            if not fallback_points:
                fallback_points = [f"[log:{max_log_id}] No actionable events found."]

            data = {
                "brief": f"Processed {len(actionable_logs)} actionable events (log range: {min(log_ids)}-{max(log_ids)}). Factual summary generated.",
                "points": fallback_points[:4],
            }

        await sqlite_service.add_log("brief", "SLEEP_CYCLE", json.dumps(data, ensure_ascii=False))
        await sqlite_service.set_checkpoint("sleep_cycle", max_log_id_all)
        await sqlite_service.add_log("info", "SLEEP_CYCLE", f"Consolidated {len(actionable_logs)} actionable events up to ID {max_log_id_all}.")
        return data

    except Exception as e:
        return {
            "brief": "Night cycle failed during summary generation.",
            "points": [f"Debug: {str(e)}", "Check model output and log formatting."],
        }
