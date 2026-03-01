# Changelog

All notable changes to the Aether Agent project will be documented in this file.

## [1.4.1] - 2026-03-01
### Added
- **Intelligent Responsive Layout**: Major update to Dashboard, Sidebar, and Memories for small screens (Tablets/Mini).
  - **Dynamic Sidebar**: Automatically collapses to a minimalist icon-only mode (w-20) with perfectly centered icons on screens below 1280px.
  - **Compact Header Stats**: Dashboard statistics now use an icons-only display on m-resolutions to prevent text overflow and layout breakages.
  - **Neural Canvas Optimization**: Memories page now hides search/filter bars on tablet views to maximize the neural graph workspace.
- **Improved Alignment**: Perfectly right-aligned statistics on Desktop and centered icons in the collapsed Sidebar.

## [1.3.0] - 2026-02-28
### Added
- **Neuromorphic Cognition Engine**: Official release of the `/cognition` center.
  - **Persona Profiles**: Analytical, Balanced, and Creative profiles with automatic temperature calibration.
  - **Custom Directives**: Manual neural override for persistent style and behavioral instructions.
  - **Digital Circadian Rhythm**: Time-aware personality shifts (Strategist, Executor, Philosopher).
  - **Safety-First Autonomy**: Visual "Danger Zone" indicators and multi-tier autonomy levels (Manual, Co-Pilot, Full).
- **Premium Mermaid Rendering**: Integrated advanced diagram visualization with interactive Pan & Zoom (Neural Focus Mode).
- **Tool Call Aggregation**: Consecutive identical tool calls are now grouped with a counter (e.g., `connect_concepts x5`), reducing UI clutter.
- **Glassmorphic Code Blocks**: Refined code display with a premium minimalist glassmorphism aesthetic.

### Fixed
- **ESLint Compliance**: Achieved a 100% clean build by resolving all `no-explicit-any` and `unused-vars` errors across the frontend.
- **Hydration & SSR Stability**: Refactored `CommandContext` state initialization to prevent Next.js hydration mismatches.
- **List Alignment**: Fixed vertical centering of list bullets and added hover glow effects.

## [1.2.1] - 2026-02-28
### Added
- **Cognition Center (Draft)**: A new premium UI section (`/cognition`) for fine-tuning agent personality, autonomy levels, and neural behaviors.
- **UI Synchronization**: Fully aligned the "Settings" and "Cognition" pages to a unified VSCode-style system (borders, ribbons, and button styles).

### Fixed
- **Terminal Aesthetics**: Unified terminal input font and prompt size with the main chat module for a cleaner, professional look.
- **Next.js Stability**: Fixed `ReferenceError` caused by missing `AnimatePresence` and `useState/useEffect` imports in new components.

## [1.2.0] - 2026-02-27
### Added
- **Knowledge Base / Docs**: Full implementation of the `/docs` route with Mermaid diagram support.
- **New Documentation**: Added `FEATURES.md` (Premium system descriptions) and `API.md` (FastAPI technical reference).
- **React 19 Compatibility**: Complete refactor of `CommandContext` to resolve hydration errors and comply with the `set-state-in-effect` rule.
- **Enhanced Terminal**: Implemented minimalist UI, improved `/logs` with unique React keys to fix "Duplicate Key" errors, and added `/logclear` to wipe system telemetry history.
- **Backend Optimizations**: Added `limit` and `from_id` support to the `/logs` API for flexible telemetry fetches.

### Fixed
- **Hydration Errors**: Resolved Next.js SSR mismatch issues in the dashboard views.
- **Command Leakage**: Slash commands no longer fall through to the LLM when typed with arguments or typos.

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
