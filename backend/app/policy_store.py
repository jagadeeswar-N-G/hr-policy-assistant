"""Policy document ingestion and FAISS vector store setup.

The vector store is built once at module import time and cached as a singleton.
All subsequent requests reuse the same in-memory FAISS index.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.vectorstores import VectorStoreRetriever

from app.config import settings

logger = logging.getLogger(__name__)

POLICY_TEXT: str = """
COMPANY LEAVE POLICY — v1.0

1. PAID LEAVE
   - Employees are entitled to 20 days of paid leave per year.
   - The leave year runs from January 1 to December 31.
   - Leave must be applied for at least 3 working days in advance (except emergencies).

2. CARRY FORWARD
   - Unused paid leave can be carried forward to the next year.
   - Maximum carry-forward limit: 5 days.
   - Any unused leave beyond 5 days will lapse at year end.

3. SICK LEAVE
   - Employees are entitled to 10 days of sick leave per year.
   - Sick leave does not carry forward.
   - A medical certificate is required if sick leave exceeds 2 consecutive days.
   - The certificate must be submitted to HR within 48 hours of returning to work.

4. MATERNITY LEAVE
   - Maternity leave entitlement: 26 weeks (paid).
   - Applicable to all full-time female employees who have completed 80 days of service.
   - Maternity leave can begin up to 8 weeks before the expected delivery date.
   - Additional unpaid leave of up to 12 weeks may be granted on request.

5. PATERNITY LEAVE
   - Paternity leave entitlement: 5 days (paid).
   - Must be taken within 30 days of the child's birth.

6. BEREAVEMENT LEAVE
   - 3 days for immediate family (spouse, children, parents).
   - 1 day for extended family (siblings, in-laws, grandparents).

7. LEAVE WITHOUT PAY (LWP)
   - Granted at the discretion of the reporting manager and HR.
   - Must be applied for if paid/sick leave balance is exhausted.

8. PUBLIC HOLIDAYS
   - Employees are entitled to all gazetted public holidays (approximately 10–12 per year).
   - If required to work on a public holiday, compensatory leave will be granted.
"""


def _build_vector_store() -> VectorStoreRetriever:
    """Build and return a FAISS retriever from the policy document.

    This function is intentionally NOT cached with lru_cache so that
    the module-level singleton pattern below remains explicit and testable.
    """
    logger.info("Building FAISS vector store from policy document …")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
    )
    docs = splitter.create_documents([POLICY_TEXT])
    logger.info("Split policy into %d chunks", len(docs))

    embeddings = HuggingFaceEmbeddings(model_name=settings.embedding_model)
    vectorstore = FAISS.from_documents(docs, embeddings)

    logger.info("FAISS vector store ready with %d vectors", vectorstore.index.ntotal)
    return vectorstore.as_retriever(search_kwargs={"k": settings.retriever_k})


_retriever_singleton: VectorStoreRetriever | None = None


def get_retriever() -> VectorStoreRetriever:
    """Return the cached FAISS retriever, building it on first call."""
    global _retriever_singleton
    if _retriever_singleton is None:
        _retriever_singleton = _build_vector_store()
    return _retriever_singleton


def is_vector_store_ready() -> bool:
    """Check whether the singleton has been initialised."""
    return _retriever_singleton is not None
