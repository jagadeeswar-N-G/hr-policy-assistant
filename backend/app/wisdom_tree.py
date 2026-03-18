"""Wisdom Tree — rule-based L1 decision engine for common HR FAQ questions.

Intercepts well-known questions before they reach the LLM to provide
instant, deterministic answers with zero latency and no API cost.
"""

from __future__ import annotations

# ---------------------------------------------------------------------------
# L1 Knowledge Base
# Each key is a lowercase keyword/phrase to match; value is the markdown answer.
# ---------------------------------------------------------------------------
WISDOM_TREE: dict[str, str] = {
    "how many paid leave": (
        "Employees are entitled to **20 days** of paid leave per year. "
        "The leave year runs from January 1 to December 31."
    ),
    "paid leave days": (
        "Employees are entitled to **20 days** of paid leave per year. "
        "The leave year runs from January 1 to December 31."
    ),
    "carry forward": (
        "You can carry forward up to **5 days** of unused paid leave to the next year. "
        "Any unused leave beyond 5 days will lapse at year end."
    ),
    "carry over": (
        "You can carry forward up to **5 days** of unused paid leave to the next year. "
        "Any unused leave beyond 5 days will lapse at year end."
    ),
    "sick leave certificate": (
        "A medical certificate is required if sick leave exceeds **2 consecutive days**. "
        "The certificate must be submitted to HR within **48 hours** of returning to work."
    ),
    "medical certificate": (
        "A medical certificate is required if sick leave exceeds **2 consecutive days**. "
        "Submit it to HR within **48 hours** of returning to work."
    ),
    "maternity": (
        "Maternity leave entitlement is **26 weeks (paid)**. "
        "It applies to full-time female employees who have completed **80+ days of service**. "
        "Leave can begin up to 8 weeks before the expected delivery date. "
        "An additional **12 weeks of unpaid** leave may be granted on request."
    ),
    "paternity": (
        "Paternity leave is **5 days (paid)**, to be taken within **30 days** of the child's birth."
    ),
    "bereavement": (
        "Bereavement leave: **3 days** for immediate family (spouse, children, parents) "
        "and **1 day** for extended family (siblings, in-laws, grandparents)."
    ),
    "public holiday": (
        "Employees are entitled to all gazetted public holidays (approximately 10–12 per year). "
        "If required to work on a public holiday, **compensatory leave** will be granted."
    ),
    "leave without pay": (
        "Leave Without Pay (LWP) is granted at the discretion of the **reporting manager and HR**. "
        "It must be applied for when your paid/sick leave balance is exhausted."
    ),
    "lwp": (
        "Leave Without Pay (LWP) is granted at the discretion of the **reporting manager and HR**. "
        "It must be applied for when your paid/sick leave balance is exhausted."
    ),
    "how many sick leave": (
        "Employees are entitled to **10 days** of sick leave per year. "
        "Sick leave does **not** carry forward to the next year."
    ),
    "sick leave days": (
        "Employees are entitled to **10 days** of sick leave per year. "
        "Sick leave does **not** carry forward."
    ),
    "advance notice leave": (
        "Leave must be applied for at least **3 working days in advance**, except in emergencies."
    ),
    "notice for leave": (
        "Leave must be applied for at least **3 working days in advance**, except in emergencies."
    ),
}


def wisdom_tree_lookup(query: str) -> str | None:
    """Return an instant answer if the query matches a known L1 pattern.

    Args:
        query: The raw user question string.

    Returns:
        A pre-written answer string if a pattern matches, otherwise None.
    """
    query_lower = query.lower().strip()
    for pattern, answer in WISDOM_TREE.items():
        if pattern in query_lower:
            return answer
    return None


def list_wisdom_tree_topics() -> list[dict[str, str]]:
    """Return all Wisdom Tree patterns and answers for the /api/wisdom-tree endpoint."""
    return [{"pattern": k, "answer": v} for k, v in WISDOM_TREE.items()]
