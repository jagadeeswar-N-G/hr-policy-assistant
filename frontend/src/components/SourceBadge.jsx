import React from 'react'
import { Zap, Search, MessageCircle } from 'lucide-react'

const BADGE_CONFIG = {
  wisdom_tree: {
    label: 'Instant Answer',
    icon: Zap,
    className: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
  },
  rag: {
    label: 'AI Search',
    icon: Search,
    className: 'bg-violet-500/15 text-violet-300 border border-violet-500/30',
  },
  fallback: {
    label: 'General',
    icon: MessageCircle,
    className: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
  },
}

export default function SourceBadge({ source }) {
  if (!source) return null
  const config = BADGE_CONFIG[source] || BADGE_CONFIG.fallback
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium ${config.className}`}
    >
      <Icon size={10} strokeWidth={2.5} />
      {config.label}
    </span>
  )
}
