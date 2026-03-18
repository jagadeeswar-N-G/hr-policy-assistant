"""HR Policy Assistant — FastAPI application entry point.

Startup sequence:
1. Load environment / settings.
2. Build FAISS vector store from policy document (runs once).
3. Mount API router with CORS enabled.
4. Add request-logging middleware.
"""

from __future__ import annotations

import logging
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.policy_store import get_retriever
from app.router import router


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  —  %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)



@asynccontextmanager
async def lifespan(app: FastAPI):  # type: ignore[type-arg]
    logger.info("=== HR Policy Assistant starting up ===")
    logger.info("Initialising FAISS vector store …")
    get_retriever()          # warm up the singleton
    logger.info("Vector store ready. Application is live.")
    yield
    logger.info("=== HR Policy Assistant shutting down ===")



app = FastAPI(
    title="HR Policy Assistant API",
    description=(
        "Internal HR chatbot backend. Answers employee leave-policy questions "
        "via a two-tier pipeline: Wisdom Tree (rule-based L1) → LangChain RAG (Claude + FAISS)."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.middleware("http")
async def log_requests(request: Request, call_next) -> Response:  # type: ignore[return]
    req_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()
    logger.info("[%s] → %s %s", req_id, request.method, request.url.path)

    response: Response = await call_next(request)

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "[%s] ← %s %s  %.1f ms",
        req_id,
        response.status_code,
        request.url.path,
        elapsed_ms,
    )
    return response



app.include_router(router, prefix="/api")
