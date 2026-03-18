import React, { useState } from 'react'
import { ChevronDown, ChevronUp, BookOpen, Bot } from 'lucide-react'
import SourceBadge from './SourceBadge'

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date instanceof Date ? date : new Date(date))
}

/** Render markdown-style **bold** text as <strong> */
function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-indigo-300 font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function UserBubble({ message }) {
  return (
    <div className="flex justify-end gap-3 animate-fade-up">
      <div className="max-w-[75%]">
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#fff',
          }}
        >
          {message.text}
        </div>
        <p className="text-right text-xs text-slate-500 mt-1 font-mono">
          {formatTime(message.timestamp)}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-xs font-bold text-indigo-300">You</span>
      </div>
    </div>
  )
}

function AssistantBubble({ message }) {
  const [showSources, setShowSources] = useState(false)
  const hasSources = message.sources && message.sources.length > 0

  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="w-8 h-8 rounded-full bg-indigo-900/40 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bot size={14} className="text-indigo-400" />
      </div>
      <div className="max-w-[80%] space-y-1.5">
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed border ${
            message.isError
              ? 'bg-red-950/30 border-red-800/40 text-red-300'
              : 'bg-card border-border text-slate-200'
          }`}
        >
          <p className="prose-hr">{renderMarkdown(message.text)}</p>
        </div>

        {/* Footer: badge + timestamp */}
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={message.source} />
          <span className="text-xs text-slate-500 font-mono">
            {formatTime(message.timestamp)}
          </span>

          {/* Sources toggle */}
          {hasSources && (
            <button
              onClick={() => setShowSources((v) => !v)}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono"
            >
              <BookOpen size={10} />
              {showSources ? 'Hide' : 'View'} sources
              {showSources ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          )}
        </div>

        {/* Collapsible source chunks */}
        {hasSources && showSources && (
          <div className="space-y-1.5 mt-1">
            {message.sources.map((chunk, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-slate-400 font-mono leading-relaxed"
              >
                <span className="text-indigo-500 mr-1">§{idx + 1}</span>
                {chunk}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessageBubble({ message }) {
  if (message.role === 'user') return <UserBubble message={message} />
  return <AssistantBubble message={message} />
}
