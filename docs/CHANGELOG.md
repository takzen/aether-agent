# Changelog

All notable changes to Aether Agent are documented here.

## [1.4.0] - 2026-03-01

### Added
- New `Skills` page under `Cron` in the frontend sidebar (`/skills`).
- Backend skills persistence with SQLite table `agent_skills`.
- Skills API:
  - `GET /skills`
  - `POST /skills`
  - `POST /skills/{skill_id}/toggle`
  - `DELETE /skills/{skill_id}`
- Agent runtime integration for skills:
  - Enabled skills are injected into the system prompt.
  - Trigger matching is supported (`triggers` field).
  - Global skills are supported (empty trigger list).
- Chat debug metadata for active skills:
  - `active_skills` in chat final payload.
  - Active skill badges shown in chat UI.

### Changed
- Frontend UX harmonization across pages (headers, action buttons, labels).
- Topology page controls moved to header and made consistent with the rest of UI.
- Chat timestamp handling hardened to prevent `Invalid Date` rendering.

### Fixed
- Mermaid parse stability improved by sanitizing diagram content and using ASCII-safe topology labels.
- Multiple UTF-8/content consistency issues in frontend copy and labels.

## [1.3.0] - 2026-02-28

### Added
- Cognition center (`/cognition`) for persona/autonomy tuning.
- Improved Mermaid rendering in docs/chat contexts.
- Tool aggregation in chat traces.

### Fixed
- Hydration and frontend consistency fixes.
- ESLint/type cleanup in selected modules.

## [1.2.0] - 2026-02-27

### Added
- Docs route and markdown rendering.
- Knowledge base UX upgrades and log utilities.

## [1.1.0] - 2026-02-27

### Added
- Active world model simulation.
- Concept graph memory integration.
- Electron desktop shell.
