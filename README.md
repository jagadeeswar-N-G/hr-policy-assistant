# HR Policy Internal Assistant

A production-grade internal HR chatbot that answers employee questions about company leave policies using a two-tier AI pipeline: a rule-based **Wisdom Tree** for instant L1 answers and a **LangChain RAG** pipeline backed by Openai for deeper queries.

---
##system Design

<img width="1037" height="581" alt="image" src="https://github.com/user-attachments/assets/47966a9a-f37c-476d-93ce-52c1fc8d5606" />

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                     │
│   Sidebar ─── ChatWindow ─── InputBar ─── SourceBadge       │
│                    │                                        │
│              useChat (hook) ──► api.js (fetch)              │
└──────────────────────────┬──────────────────────────────────┘
                           │  HTTP POST /api/chat
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│                                                             │
│  POST /api/chat                                             │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────┐     match?     ┌──────────────────┐   │
│  │  Wisdom Tree    │────────YES────►│  Instant Answer  │   │
│  │  (keyword L1)   │                │  source=wisdom   │   │
│  └────────┬────────┘                └──────────────────┘   │
│           │ no match                                        │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            LangChain RAG Pipeline                   │   │
│  │                                                     │   │
│  │  Question ──► FAISS Retriever ──► Top-3 Chunks      │   │
│  │                    │                   │            │   │
│  │    HuggingFace      │                   ▼            │   │
│  │    Embeddings ──────┘         Claude (Anthropic)    │   │
│  │  (all-MiniLM-L6-v2)          claude-3-5-haiku      │   │
│  │                                        │            │   │
│  │                                        ▼            │   │
│  │                              Answer + source_docs   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  GET /api/health          GET /api/wisdom-tree              │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |
| OPenAI API Key | Required |

---

## Setup

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd hr-assistant

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env and add your ANTHROPIC_API_KEY
```

### 2. Install dependencies

```bash
make install
```

Or manually:

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 3. Run the application

```bash
make dev           # Starts both backend and frontend concurrently
# OR
make dev-backend   # FastAPI only  → http://localhost:8000
make dev-frontend  # Vite only     → http://localhost:5173
```

### 4. Open in browser

Navigate to **http://localhost:5173**

---


## Project Structure

```
hr-assistant/
├── Makefile
├── README.md
├── backend/
│   ├── main.py                 # FastAPI app + lifespan + middleware
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── __init__.py
│       ├── config.py           # Pydantic settings from .env
│       ├── models.py           # Request / response schemas
│       ├── policy_store.py     # FAISS vector store singleton
│       ├── wisdom_tree.py      # L1 keyword-match decision tree
│       ├── rag_chain.py        # LangChain RetrievalQA + Claude
│       └── router.py           # /api/chat, /api/health, /api/wisdom-tree
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── ChatWindow.jsx
        │   ├── MessageBubble.jsx
        │   ├── InputBar.jsx
        │   ├── SourceBadge.jsx
        │   ├── SuggestedQuestions.jsx
        │   └── Sidebar.jsx
        ├── hooks/
        │   └── useChat.js
        └── utils/
            └── api.js
```
