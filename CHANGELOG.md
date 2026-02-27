# Changelog

All notable changes to the Aether Agent project will be documented in this file.

## [1.1.1] - 2026-02-27
### Added
- **Global Terminal Persistence**: The Dashboard terminal now uses `CommandContext` and `localStorage` to persist messages across page navigations and refreshes.
- **Slash Commands**: Implemented `/clear`, `/logs [limit]`, and `/simulate` commands in the dashboard terminal.
- **Agent Rules & Workflows**: Established `_agent/GEMINI.md` and `_agent/workflows/` for better agent guidance and automated processes.
- **Aether Aesthetics Skill**: Created a dedicated skill for Premium UI design principles.

### Fixed
- **Stability**: Reverted experimental LLM timeout settings that caused `TypeError` in backend startup.
- **LLM ReadTimeout**: Initial attempt to fix timeout was rolled back; looking for more compatible solution for `pydantic-ai`.
- **Terminal Reset**: Fixed issue where terminal history was lost when switching between dashboard and other views.

## [1.1.0] - 2026-02-27 (Initial Baseline)
### Added
- **Active World Model**: Background simulation engine for context reflection.
- **Concept Constellations**: Neural graph memory in SQLite.
- **Desktop Shell**: Electron wrapper for Aether Agent.
- **Morning Brief**: Post-sleep cycle system summary.
