const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

/**
 * Send a chat message to the backend.
 * @param {string} message
 * @param {string} sessionId
 * @returns {Promise<{answer:string, source:string, confidence:string, sources:string[]}>}
 */
export async function sendMessage(message, sessionId = 'default') {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

/**
 * Check backend health.
 * @returns {Promise<{status:string, vector_store:string}>}
 */
export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/health`, {
    method: 'GET',
    signal: AbortSignal.timeout(5000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/**
 * Fetch Wisdom Tree topics.
 * @returns {Promise<{topics:Array, count:number}>}
 */
export async function fetchWisdomTree() {
  const response = await fetch(`${BASE_URL}/wisdom-tree`)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
