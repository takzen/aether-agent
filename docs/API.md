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

## Workspace Browser

### `GET /workspace/files`
Lists files recursively from `/workspace`.

### `POST /workspace/upload`
Uploads a file directly into `/workspace`.

### `GET /workspace/content?path=<relative_path>`
Returns raw text content for a file inside `/workspace`.
Path must be relative to `/workspace`.

### `DELETE /workspace/content?path=<relative_path>`
Deletes a file inside `/workspace`.

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
Includes built-in `tweet_update` and (on first boot) auto-created jobs:
- `Aether Tweet Update 07:00` (`0 7 * * *`, `Europe/Warsaw`)
- `Aether Tweet Update 19:00` (`0 19 * * *`, `Europe/Warsaw`)
Also supports `skill_task` payload:
- `skill_id` (required): id from `GET /skills`
- `instruction` (optional): runtime instruction
- `store_as_tweet` (optional, bool): store output into tweet drafts

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

## Social Updates

### `GET /social/tweet-drafts`
Returns latest generated tweet drafts.

Query params:
- `limit` (optional, default `10`, max `50`)

## Agent Skills

### `GET /skills`
Lists stored skills.
Includes `markdown_path` for each skill file in `workspace/skills/library`.

### `GET /skills/templates`
Lists skill templates from `workspace/skills/templates`.

### `POST /skills/templates/apply`
Loads one template and returns parsed fields for skill form:
- `name`
- `purpose`
- `triggers`
- `instructions`

### `GET /skills/{skill_id}/markdown`
Returns markdown content and path for one skill file.

### `POST /skills`
Creates a skill.

Body:
```json
{
  "name": "Short answer mode",
  "purpose": "Keep responses concise",
  "triggers": "brief,short,quick",
  "instructions": "Respond in under 5 lines unless user asks for details."
}
```

### `PUT /skills/{skill_id}`
Updates a skill (`name`, `purpose`, `triggers`, `instructions`).

### `POST /skills/{skill_id}/runtime`
Updates where a skill can run:
- `agent_enabled` (bool): allow skill in regular agent chats
- `cron_enabled` (bool): allow skill in cron `skill_task`

### `DELETE /skills/{skill_id}`
Deletes a skill.
