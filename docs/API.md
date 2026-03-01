# API Reference

Aether backend exposes a REST API powered by FastAPI.
Default local URL: `http://localhost:8000`.

## Health and System

### `GET /ping`
Health check.

### `GET /stats`
Returns dashboard stats (documents, memories, reliability, sessions).

### `GET /config`
Reads backend runtime configuration.

### `POST /config`
Updates backend runtime configuration.

### `POST /system/clear`
Clears major system data (sessions, graph, logs, memory index state where applicable).

## Cognition

### `GET /cognition/settings`
Returns cognition settings (`persona`, `autonomy`, `creativity`, reflection and circadian flags).

### `POST /cognition/settings`
Updates cognition settings.

## Chat and Agent

### `POST /chat/stream`
Primary streaming chat endpoint (NDJSON stream).

Response stream event types include:
- `status`
- `tool_call`
- `token`
- `final`
- `error`

Final payload includes:
- `response`
- `confidence`
- `reasoning`
- `new_messages`
- `pending_actions`
- `active_skills` (debug list of skills matched for this request)

### `POST /chat`
Non-streaming chat endpoint.

### `POST /actions/approve`
Approves/rejects HITL actions (for guarded file writes).

## Sessions

### `GET /sessions`
Lists chat sessions.

### `POST /sessions`
Creates a new session.

### `GET /sessions/{session_id}/messages`
Returns messages for a session.

### `DELETE /sessions/{session_id}`
Deletes a session.

## Logs

### `GET /logs`
Returns logs (`limit`, `from_id` supported).

### `DELETE /logs`
Clears logs.

## Knowledge Base

### `GET /knowledge`
Lists known source files and index status.

### `POST /ingest`
Uploads a source file to knowledge storage.

### `POST /knowledge/index/{filename}`
Indexes an existing source file.

### `GET /knowledge/content/{filename}`
Reads raw source file content.

### `DELETE /knowledge/{filename}`
Deletes source from disk/index.

## Project Docs

### `GET /system/docs`
Lists markdown docs in `/docs`.

### `GET /system/docs/content/{filename}`
Returns markdown file content.

## Memories and Graph

### `GET /memories`
Lists memory records.

### `DELETE /memories/{memory_id}`
Deletes a memory record.

### `GET /graph`
Returns concept graph nodes and links.

### `POST /system/simulate`
Runs active world model simulation.

### `POST /system/sleep-cycle`
Runs sleep cycle process.

## Cron Scheduler

### `GET /cron/tasks`
Lists available cron task handlers.

### `GET /cron/jobs`
Lists scheduled jobs.

### `POST /cron/jobs`
Creates/updates a cron job.

### `POST /cron/jobs/{job_id}/toggle`
Enables/disables a cron job.

### `POST /cron/jobs/{job_id}/run`
Runs a cron job immediately.

### `DELETE /cron/jobs/{job_id}`
Deletes a cron job.

## Agent Skills

### `GET /skills`
Lists stored skills.

### `POST /skills`
Creates a skill.

Body:
```json
{
  "name": "Short answer mode",
  "purpose": "Keep responses concise",
  "triggers": "brief,short,quick",
  "instructions": "Respond in under 5 lines unless user asks for details.",
  "enabled": true
}
```

### `POST /skills/{skill_id}/toggle`
Enables/disables a skill.

### `DELETE /skills/{skill_id}`
Deletes a skill.
