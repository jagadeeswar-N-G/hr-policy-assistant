"""FastAPI route definitions for the HR Policy Assistant."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Request

from app.models import (
    ChatRequest,
    ChatResponse,
    HealthResponse,
    WisdomTreeResponse,
    WisdomTreeTopic,
)
from app.wisdom_tree import wisdom_tree_lookup, list_wisdom_tree_topics
from app.policy_store import get_retriever, is_vector_store_ready
from app.rag_chain import build_rag_chain, run_rag_query

logger = logging.getLogger(__name__)
router = APIRouter()


_rag_chain = None


def _get_rag_chain():
    global _rag_chain
    if _rag_chain is None:
        retriever = get_retriever()
        _rag_chain = build_rag_chain(retriever)
    return _rag_chain




@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check() -> HealthResponse:
    """Return the operational status of the API and vector store."""
    vs_status = "ready" if is_vector_store_ready() else "not_initialized"
    return HealthResponse(status="ok", vector_store=vs_status)


@router.get("/wisdom-tree", response_model=WisdomTreeResponse, tags=["Knowledge"])
async def get_wisdom_tree() -> WisdomTreeResponse:
    """Return all L1 topics covered by the Wisdom Tree decision engine."""
    topics_raw = list_wisdom_tree_topics()
    topics = [WisdomTreeTopic(**t) for t in topics_raw]
    return WisdomTreeResponse(topics=topics, count=len(topics))


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """Main chat endpoint.

    Pipeline:
    1. Wisdom Tree lookup (instant, deterministic, no LLM cost).
    2. RAG chain via Claude + FAISS if no L1 match.
    3. Fallback response if neither produces an answer.
    """
    question = request.message.strip()

    if not question:
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    logger.info("[session=%s] Question: %s", request.session_id, question[:120])

    wt_answer = wisdom_tree_lookup(question)
    if wt_answer:
        logger.info("[session=%s] Wisdom Tree hit", request.session_id)
        return ChatResponse(
            answer=wt_answer,
            source="wisdom_tree",
            confidence="high",
            sources=[],
        )

    try:
        chain = _get_rag_chain()
        rag_result = await run_rag_query(chain, question)
    except Exception as exc:  # noqa: BLE001
        logger.exception("RAG pipeline failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="The AI pipeline encountered an error. Please try again.",
        ) from exc

    if rag_result.is_fallback:
        return ChatResponse(
            answer=rag_result.answer,
            source="fallback",
            confidence="low",
            sources=[],
        )

    return ChatResponse(
        answer=rag_result.answer,
        source="rag",
        confidence="medium",
        sources=rag_result.source_chunks,
    )
