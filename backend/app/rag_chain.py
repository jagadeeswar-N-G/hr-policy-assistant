"""Modern LangChain RAG chain using LCEL (Runnable API).

Replaces deprecated RetrievalQA with create_retrieval_chain.
Returns structured results including the answer text and source chunks.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_core.vectorstores import VectorStoreRetriever

from app.config import settings

logger = logging.getLogger(__name__)


HR_PROMPT_TEMPLATE = """You are an internal HR policy assistant for a company.
Answer questions accurately and concisely based ONLY on the provided policy context below.
If the answer is not explicitly covered in the context, respond with exactly:
"I don't have information on that — please contact HR directly."
Never make up policy details, invent numbers, or speculate beyond what the context states.
Use markdown formatting (bold key numbers/dates) to improve readability.

Context:
{context}

Question: {input}

Answer:"""

HR_PROMPT = ChatPromptTemplate.from_template(HR_PROMPT_TEMPLATE)

_FALLBACK_PHRASES = [
    "i don't have information",
    "please contact hr",
    "not in the context",
    "i cannot find",
    "not mentioned",
]


@dataclass
class RAGResult:
    answer: str
    source_chunks: list[str]
    is_fallback: bool


def _is_fallback_answer(answer: str) -> bool:
    lower = answer.lower()
    return any(phrase in lower for phrase in _FALLBACK_PHRASES)


def build_rag_chain(retriever: VectorStoreRetriever):
    """Construct a modern retrieval chain."""

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0,
        max_tokens=512,
    )

    qa_chain = create_stuff_documents_chain(llm, HR_PROMPT)
    rag_chain = create_retrieval_chain(retriever, qa_chain)

    return rag_chain


async def run_rag_query(chain, question: str) -> RAGResult:
    """Run a question through the RAG chain."""

    logger.info("Running RAG query: %s", question[:80])

    try:
        result = await chain.ainvoke({"input": question})
    except Exception as exc:
        logger.exception("RAG chain error: %s", exc)
        raise

    answer: str = result.get("answer", "").strip()

    source_docs = result.get("context", [])
    source_chunks: list[str] = [
        doc.page_content.strip() for doc in source_docs if doc.page_content.strip()
    ]

    is_fallback = _is_fallback_answer(answer)

    logger.info(
        "RAG answer ready (fallback=%s, chunks=%d)", is_fallback, len(source_chunks)
    )

    return RAGResult(
        answer=answer,
        source_chunks=source_chunks,
        is_fallback=is_fallback,
    )
