import React, { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

const MAX_CHARS = 500

export default function InputBar({ onSend, isLoading, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 96)}px` // max ~3 lines
  }, [text])

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = text.length
  const overLimit = charCount > MAX_CHARS
  const canSend = text.trim().length > 0 && !isLoading && !disabled && !overLimit

  return (
    <div className="border-t border-border bg-surface px-4 py-3">
      <div
        className={`flex items-end gap-2 rounded-xl border px-3 py-2 transition-colors ${
          overLimit
            ? 'border-red-500/50 bg-red-950/10'
            : 'border-border bg-bg focus-within:border-indigo-500/50'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Ask about leave policies… (Enter to send)"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none leading-relaxed py-1 disabled:opacity-50"
          style={{ minHeight: '24px', maxHeight: '96px' }}
        />

        <div className="flex items-center gap-2 pb-1 flex-shrink-0">
          {/* Character counter */}
          <span
            className={`text-xs font-mono tabular-nums ${
              overLimit ? 'text-red-400' : 'text-slate-600'
            }`}
          >
            {charCount}/{MAX_CHARS}
          </span>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
              canSend
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                : 'bg-surface border border-border text-slate-600 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-600 mt-1.5 text-center font-mono">
        Shift+Enter for newline · Based on Company Leave Policy v1.0
      </p>
    </div>
  )
}
