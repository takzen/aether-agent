# Workflow Operating Manual: CORE-X (Architecture Analyst)

This file defines the operating standard for the Aether Agent within the CORE-X project. In this mode, the Agent is not a passive data store, but an active analytical partner.

## 1. State Ingestion (Ingestion)
Every new document or code snippet introduced into the knowledge base by the User initiates the analysis process. The Agent is not limited to indexing text – it seeks intent, logic, and points of contact with the rest of the system.

## 2. Structure Mapping (Structural Mapping)
All key entities (modules, tables, functions) are automatically linked in a *Neural Topology* graph.
- **Technical Synapses**: "File `X` imports `Y`", "Function `Z` writes to table `messages`".
- **Logical Synapses**: "The complexity of this module impacts database performance".

## 3. Critical Audit and Suggestions (Critical Audit)
This is the most important stage. After familiarizing itself with the document, the Agent generates a report containing:
- **Architecture Analysis**: Assessment of compliance with current design patterns.
- **Improvement Suggestions**: Proposals for refactoring, optimization, or expansion.
- **Deficiency Detection**: Information about missing elements in documentation or code.

## 4. Simulation and Strategy (Simulation & Strategy)
Before introducing changes, the Agent simulates their impact on the project:
- "Changing the data type in `schema.sql` will force an update of 3 frontend components".
- "Implementing the new function `X` will increase API load by approx. 15%".

## 5. Oversight and Censure Layer (The Censors)
This is a critical element of the CORE-X model. Every suggestion or change proposed by the Aether Agent passes through a censorship filter:
- **User**: The main decision-maker, evaluating the business and aesthetic utility of the suggestions.
- **Antigravity (AI Assistant)**: The User's technical partner, verifying the correctness of the implementation in terms of code quality and security.
- **Joint Evaluation**: We check if "Aether on Aether" thinks logically, if it does not generate architectural hallucinations, and if its development vision is consistent with the project's foundations.

## 6. Iteration and Development (Closing the Loop)
The User, together with Antigravity, accept, modify, or reject suggestions. After approval:
- The Aether Agent updates the `docs/PROJECT_CORE_X.md` manifest.
- The new project state becomes the foundation for subsequent analyses.
- We record "relevance" metrics of suggestions to train the Agent's architectural awareness.

---
*Workflow Status: ACTIVE (Recursive Oversight Mode)*