"""Pydantic models for API request and response schemas."""

from __future__ import annotations
from typing import Literal
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="User question")
    session_id: str = Field(default="default", description="Session identifier")


class ChatResponse(BaseModel):
    answer: str = Field(..., description="The HR policy answer")
    source: Literal["wisdom_tree", "rag", "fallback"] = Field(
        ..., description="Which pipeline produced the answer"
    )
    confidence: Literal["high", "medium", "low"] = Field(
        ..., description="Confidence level of the answer"
    )
    sources: list[str] = Field(
        default_factory=list,
        description="Source document chunks used (only populated for RAG answers)",
    )


class HealthResponse(BaseModel):
    status: str
    vector_store: str


class WisdomTreeTopic(BaseModel):
    pattern: str
    answer: str


class WisdomTreeResponse(BaseModel):
    topics: list[WisdomTreeTopic]
    count: int
