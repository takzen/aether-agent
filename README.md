# Aether Agent

Aether Agent is a local-first AI workspace built with FastAPI (backend) and Next.js (frontend).
It combines chat, memory, knowledge indexing, cognition tuning, cron automation, and reusable skills.

## Current Product Surface

- Command Center (`/dashboard`)
- Chat (`/chat`)
- Knowledge Base (`/knowledge`)
- Memories (`/memories`)
- Neural Topology (`/topology`)
- Agent Logs (`/logs`)
- Cron Scheduler (`/cron`)
- Agent Skills (`/skills`)
- Cognition (`/cognition`)
- Settings (`/settings`)
- Documentation (`/docs`)

## Tech Stack

- Backend: Python 3.12+, FastAPI, PydanticAI, SQLite
- Frontend: Next.js 16, React, Tailwind CSS, Framer Motion
- Memory: Qdrant + SQLite graph/session store
- Integrations: Gemini, Ollama, Tavily, Telegram, MCP

## Quick Start

### 1) Prerequisites

- Python 3.12+
- Node.js 20+
- `pnpm`
- API keys as needed (`GEMINI_API_KEY`, `TAVILY_API_KEY`)

### 2) Backend

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python main.py
```

### 3) Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:8000`.

## Environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_key
TAVILY_API_KEY=your_key
QDRANT_URL=
QDRANT_API_KEY=
MODEL_OVERRIDE=gemini-2.5-pro
SYSTEM_LANGUAGE=en
```

## Documentation

See the `docs/` folder:

- `docs/README.md` - documentation index
- `docs/API.md` - API reference
- `docs/ARCHITECTURE.md` - architecture map
- `docs/COGNITION.md` - cognition model
- `docs/COMMANDS.md` - command usage
- `docs/FEATURES.md` - feature overview
- `docs/CHANGELOG.md` - project changelog

## License

Apache-2.0
