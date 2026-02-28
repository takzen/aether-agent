# Project: CORE-X (Aether on Aether)

## Project Overview
CORE-X is an internal initiative to use the Aether Agent to analyze, document, and expand its own architecture. This is a "Recursive AI" approach to project development.

## Core Architectural Pillars
1. **Backend (Python/FastAPI)**:
    - `main.py`: The orchestrator and API entry point.
    - `local_db.py`: The SQLite synchronization layer for sessions and graph memory.
    - `agent.py`: PydanticAI based agent logic and tool definitions.
    - `world_model.py`: Simulation and future-state prediction module.

2. **Frontend (Next.js/React)**:
    - `NeuralTopologyView.tsx`: The primary visualization for graph memory.
    - `CommandCenter`: The central dashboard for system interactions and slash commands.
    - `Memories`: Vector storage (Qdrant) visualization and recall.

3. **Data Engines**:
    - **SQLite**: Structured relational data (Sessions, Blogs, Logs).
    - **Qdrant**: High-dimensional vector embeddings for semantic recall.
    - **Knowledge Base**: Markdown/Text sources processed into chunks.

## Project Goal
Improve the recursive understanding of the agent to allow it to build its own features autonomously and maintain its dependency graph in the Neural Topology.
