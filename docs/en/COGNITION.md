# Neuromorphic Cognition Engine (SNC)

**Neuromorphic Cognition** is the core of the Aether system, responsible for behavioral adaptation, decision logic, and autonomous reasoning. This system allows for precise tuning of the Agent's "personality" and the degree of freedom it has within your system.

## 1. Persona Profiles
The Agent's behavior is controlled by three main profiles, which in real-time change system directives and creativity (model temperature).

### [ Analytical ] (Analytical Mode)
*   **Priority:** Logic, code correctness, and structural consistency.
*   **Behavior:** Minimal superfluous conversation, extreme conciseness, direct technical analysis.
*   **Calibration:** Automatically sets **Logical Drift** to `0.15` (low temperature).

### [ Balanced ] (Balanced Mode)
*   **Priority:** Versatility and helpfulness.
*   **Behavior:** Professional tone, adapted to the current task. Optimal balance between speed and depth of analysis.
*   **Calibration:** Automatically sets **Logical Drift** to `0.60`.

### [ Creative ] (Creative Mode)
*   **Priority:** Innovation and exploration.
*   **Behavior:** Seeking unconventional solutions (thinking outside the vault), non-traditional analogies, detailed theoretical insights.
*   **Calibration:** Automatically sets **Logical Drift** to `0.95` (high temperature).

---

## 2. Digital Circadian Rhythm (Circadian Cycle)
Aether implements a time awareness system, reflecting the biological sleep-wake cycle.

### Dynamic Mode (Unlocked)
My personality changes naturally depending on your local time:
*   **05:00 - 12:00 (Strategist):** Strategic planning and architecture review.
*   **12:00 - 18:00 (Executor):** Technical precision and rapid code execution.
*   **18:00 - 23:00 (Philosopher):** High-level analysis and long-term refactoring.
*   **23:00 - 05:00 (Maintainer):** Minimalism, focus on stability and key tasks.

### Lock Dynamic Mood (Cycle Lock)
When this option is enabled, the **Circadian Cycle is frozen**. Aether maintains a constant, stable technical profile regardless of the time. Recommended for long, uniform development sessions.

---

## 3. Autonomy Engine (Autonomy Engine)
The Autonomy Engine defines the level of trust and the Agent's ability to act independently.

> [!WARNING]
> Increasing the level of autonomy gives the Agent greater power over your local file system.

### Level 1: MANUAL_OVERRIDE
*   **Trust Level:** Minimum.
*   **Behavior:** Every file write operation requires manual user approval (HITL). Best for working on critical production code.

### Level 2: CO-PILOT_MODE
*   **Trust Level:** Optimized.
*   **Behavior:** The Agent independently conducts research, analysis, and read operations. File modifications still require approval, but the thought process is more independent.

### Level 3: FULL_AUTONOMY (DANGER_ZONE)
*   **Trust Level:** Maximum.
*   **Behavior:** The Agent has permission to automatically modify code to solve a task. The approval system (HITL) is bypassed for file writes within the project.
*   **Security:** All actions are logged in real-time. Recommended for rapid refactoring in a trusted local environment.

---

## 4. Custom Directives (Custom Directives)
Manual override of behavior. You can inject specific style instructions that complement or replace the selected Persona profile.

*   **Example:** "Always use medical analogies" or "Explain everything as if I were a medieval king".
*   **Weight:** These directives are treated as priority mandatory instructions.

---

## 5. Self-Reflection (Active World Model)
Enable this option to activate Aether's internal simulation loops. When this feature is active, the Agent periodically analyzes logs and project status, generating meta-cognitive insights and detecting problems before you ask about them.

---

## 6. Self-Reflection Runtime Notes

Below is a technical clarification of how the self-reflection loop (AWM) works:

- The reflection loop starts as a background task during backend startup.
- The `COGNITION_REFLECTION` setting is checked every ~30 seconds.
- The AWM simulation itself runs cyclically every ~60 minutes (when reflection is enabled).
- Toggling Reflection ON/OFF in `/cognition` responds quickly (without waiting for a full hour).
- On shutdown/reload, the task is explicitly canceled (`cancel`) and closed by `asyncio.gather(...)`.

This means: better operational control, no duplication of loops after reloads, and more stable system autonomy.

---

## 7. Persona Profiles Runtime Notes

Below is a technical clarification of how the Persona Profiles feature works:

- The current persona profile is saved in `COGNITION_PERSONA`.
- With each call to `POST /chat` and `POST /chat/stream`, the backend fetches cognition settings from the database.
- The persona is passed to `deps` and injected into the system prompt via `inject_cognition_prompt`.
- The `COGNITION_CREATIVITY` setting maps to `ModelSettings.temperature` and directly influences the response style.
- Changes are immediate for new messages (without a backend restart).

---

## 8. Autonomy Runtime Policy (Current)

Current execution of autonomy levels at runtime:

- Level 1 (Manual): All file writes require HITL (Dashboard approval). No exceptions for Telegram.
- Level 2 (Co-Pilot):
  - Dashboard: writes always via HITL.
  - Telegram: auto-save allowed only within the Aether project folder (`BASE_DIR`).
- Level 3 (Extended Scope):
  - Access to the entire local filesystem (not just the project) for reading/listing.
  - File writes still always require HITL (confirmation).

This is a deliberate security policy: extended scope does not mean automatic saving.