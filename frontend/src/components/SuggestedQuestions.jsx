import React from 'react'
import { Sparkles } from 'lucide-react'

const SUGGESTED = [
  'How many paid leave days do I get?',
  'Can I carry forward unused leave?',
  'When do I need a medical certificate?',
  'How long is maternity leave?',
  'What is paternity leave entitlement?',
  'How does bereavement leave work?',
]

export default function SuggestedQuestions({ onSelect }) {
  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-indigo-400" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
          Suggested questions
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-surface text-slate-300 hover:border-indigo-500/50 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all duration-150"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
