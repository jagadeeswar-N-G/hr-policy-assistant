import React, { useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import SuggestedQuestions from './SuggestedQuestions'

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="w-8 h-8 rounded-full bg-indigo-900/40 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-indigo-400">HR</span>
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}

export default function ChatWindow({ messages, isLoading, onSuggestedClick }) {
  const bottomRef = useRef(null)

  // Only show suggested questions when just the welcome message is present
  const showSuggested = messages.length === 1 && messages[0].id === 'welcome'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {showSuggested && (
        <div className="max-w-3xl mx-auto">
          <SuggestedQuestions onSelect={onSuggestedClick} />
        </div>
      )}
    </div>
  )
}
