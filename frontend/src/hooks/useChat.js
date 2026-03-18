import { useState, useCallback, useRef, useEffect } from 'react'
import { sendMessage, checkHealth } from '../utils/api'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: "👋 Hello! I'm your HR Policy Assistant. Ask me anything about leave policies — paid leave, sick leave, maternity, paternity, bereavement, and more.",
  source: null,
  confidence: null,
  sources: [],
  timestamp: new Date(),
}

export function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking' | 'online' | 'offline'
  const sessionId = useRef(`session-${Date.now()}`)

  // Poll backend health on mount
  useEffect(() => {
    const ping = async () => {
      try {
        await checkHealth()
        setBackendStatus('online')
      } catch {
        setBackendStatus('offline')
      }
    }
    ping()
    const interval = setInterval(ping, 30_000)
    return () => clearInterval(interval)
  }, [])

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}-${Math.random()}`, timestamp: new Date(), ...msg },
    ])
  }, [])

  const sendUserMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      setError(null)
      addMessage({ role: 'user', text: text.trim() })
      setIsLoading(true)

      try {
        const data = await sendMessage(text.trim(), sessionId.current)
        addMessage({
          role: 'assistant',
          text: data.answer,
          source: data.source,
          confidence: data.confidence,
          sources: data.sources || [],
        })
      } catch (err) {
        const errorText =
          backendStatus === 'offline'
            ? "⚠️ The backend server appears to be offline. Please start it with `make dev-backend`."
            : `⚠️ Something went wrong: ${err.message}`
        addMessage({
          role: 'assistant',
          text: errorText,
          source: 'fallback',
          confidence: 'low',
          sources: [],
          isError: true,
        })
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, addMessage, backendStatus]
  )

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    backendStatus,
    sendUserMessage,
    clearChat,
  }
}
