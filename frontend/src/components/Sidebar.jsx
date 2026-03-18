import React from 'react'
import {
  CalendarDays,
  RefreshCw,
  Stethoscope,
  Baby,
  Heart,
  Flower2,
  Sun,
  Minus,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react'

const TOPICS = [
  { label: 'Paid Leave', icon: CalendarDays, query: 'How many paid leave days do I get?' },
  { label: 'Carry Forward', icon: RefreshCw, query: 'What is the carry forward policy?' },
  { label: 'Sick Leave', icon: Stethoscope, query: 'How does sick leave work?' },
  { label: 'Maternity Leave', icon: Flower2, query: 'What is maternity leave entitlement?' },
  { label: 'Paternity Leave', icon: Baby, query: 'What is paternity leave entitlement?' },
  { label: 'Bereavement', icon: Heart, query: 'How does bereavement leave work?' },
  { label: 'Public Holidays', icon: Sun, query: 'What are the public holiday rules?' },
  { label: 'Leave Without Pay', icon: Minus, query: 'What is Leave Without Pay (LWP)?' },
]

export default function Sidebar({ onTopicClick, isOpen, onToggle }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-20
          flex flex-col bg-surface border-r border-border
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0 lg:w-14'}
          overflow-hidden
        `}
      >
        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-slate-400 hover:text-slate-200 z-30 shadow-lg"
        >
          {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border flex-shrink-0">
          <BookOpen size={16} className="text-indigo-400 flex-shrink-0" />
          {isOpen && (
            <span className="text-sm font-semibold text-slate-200 truncate">
              Policy Topics
            </span>
          )}
        </div>

        {/* Topics list */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {TOPICS.map(({ label, icon: Icon, query }) => (
            <button
              key={label}
              onClick={() => onTopicClick(query)}
              title={label}
              className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-indigo-500/10 transition-all duration-150 text-left group"
            >
              <Icon
                size={15}
                className="flex-shrink-0 group-hover:text-indigo-400 transition-colors"
              />
              {isOpen && (
                <span className="text-sm truncate">{label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        {isOpen && (
          <div className="px-4 py-3 border-t border-border flex-shrink-0">
            <p className="text-xs text-slate-600 font-mono leading-relaxed">
              Powered by
              <br />
              <span className="text-indigo-500">LangChain</span> +{' '}
              <span className="text-violet-500">Claude</span>
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
