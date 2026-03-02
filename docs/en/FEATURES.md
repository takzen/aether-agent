# Premium Features

Aether Agent is not an ordinary chatbot. It is equipped with advanced cognitive and behavioral mechanisms that allow it to act proactively and deeply analyze context.

## Active World Model (AWM)

The Active World Model is Aether's proactivity engine. Instead of waiting for commands, the agent constantly analyzes the stream of system events, logs, and interaction history to build an internal representation of the project's state.

-   **Log Analysis:** The engine reviews recent activities every 30 minutes (or on demand with the `/simulate` command).
-   **Insight Generation:** Based on the analysis, the agent creates so-called "System Insights" – suggestions regarding code optimization, potential errors, or next steps in the roadmap.
-   **Proactivity:** AWM allows the agent to move beyond the role of a passive assistant and become a partner in the development process.

## Sleep Cycle

The Sleep Cycle is a knowledge optimization process that activates during periods of inactivity or after long work sessions.

-   **Memory Consolidation:** During "sleep," the agent reviews short-term memories (session logs) and distills key information from them, transferring it to long-term memory (Vector Store).
-   **Knowledge Base Defragmentation:** The system organizes links between documents and removes outdated data.
-   **Resource Saving:** Thanks to this process, the agent does not have to search through thousands of lines of logs to recall findings from the previous day.

## Concept Constellation

Concept Constellation is a layer of visual and semantic knowledge topology. It is a graph-based representation of everything the agent knows about your project.

-   **Semantic Links:** Every document, memory, or code snippet is a point (node) in the constellation.
-   **Dynamic Relationships:** Relationships between concepts are built automatically based on semantic similarity (OpenAI Embeddings / FastEmbed).
-   **Neural Topology:** The user can view this map in a dedicated "Topology" view, which allows understanding how the agent connects different facts and system modules.

## Neuromorphic Cognition (SNC)

The Neural Cognitive Engine (Static/Dynamic Neural Cognition) allows for deep personalization of the agent's behavior and control over its decision-making.

-   **Persona Profiles:** Ability to choose between Analytical, Balanced, or Creative modes. Each profile automatically calibrates the model's creativity parameters (Temperature).
-   **Digital Circadian Rhythm:** A diurnal cycle system that smoothly changes the agent's personality (Strategist in the morning, Executor during the day, Philosopher in the evening) depending on the current time.
-   **Autonomy Engine:** A three-level trust scale (Manual, Co-Pilot, Full Autonomy) that defines the agent's permissions to independently modify system files.
-   **Custom Directives:** The ability to manually inject low-level style and behavior instructions that are prioritized by the model's core.

## Skills Management

Aether Agent features a modular skills architecture that extends its capabilities without the need to modify the core codebase.

-   **Dynamic Loading:** Skills are loaded into the runtime environment on the fly (`inject_skill_prompt`).
-   **Context Injection:** When a skill is activated, its specific instructions (formatting, tools) and triggers are directly integrated into the agent's system prompt, giving it new expertise or particular operational vectors.
-   **Management:** The registry of skills can be viewed, toggled on, and off safely from the Dashboard's "Skills" tab.

## Scheduled Operations (Cron Tasks)

A background task engine built into the backend system based on a Cron interface.

-   **Task Automation:** Allows for scheduling recurring backend operations such as vector database optimization, log defragmentation, or running the internal `Sleep Cycle` loop.
-   **Expressive Intervals:** Each task is based on standardized Cron expressions (e.g., `0 3 * * *` for 3:00 AM).
-   **System View:** A consolidated "Cron" panel provides visibility into upcoming and completed schedule executions (cron ticks) in real time.

---
*Documentation of Aether Project Premium Features.*