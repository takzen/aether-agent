# Project: CORE-X (Aether on Aether)

## Project Overview
CORE-X is an internal initiative aimed at leveraging the Aether Agent to analyze, document, and expand its own architecture. This is a "Recursive AI" approach to project development.

## Main Architectural Pillars
1.  **Backend (Python/FastAPI)**:
    -   `main.py`: Orchestrator and API entry point.
    -   `local_db.py`: SQLite synchronization layer for sessions and graph memory.
    -   `agent.py`: Agent logic based on PydanticAI and tool definitions.
    -   `world_model.py`: Simulation and future state prediction module.

2.  **Frontend (Next.js/React)**:
    -   `NeuralTopologyView.tsx`: Main visualization of graph memory (Neural Topology).
    -   `CommandCenter`: Central dashboard for system interactions and slash commands.
    -   `Memories`: Visualization and recall of data from the vector store (Qdrant).

3.  **Data Engines**:
    -   **SQLite**: Structural relational data (Sessions, System logs).
    -   **Qdrant**: Multidimensional vector embeddings for semantic knowledge retrieval.
    -   **Knowledge Base**: Markdown/Text sources processed into chunks.

## Project Goal
Improving the agent's recursive understanding to enable it to autonomously build its own functionalities and maintain the dependency graph in Neural Topology.