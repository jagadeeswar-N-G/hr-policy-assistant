import React, { useState } from 'react'
import { Shield, Menu, Trash2, AlertTriangle } from 'lucide-react'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import Sidebar from './components/Sidebar'
import { useChat } from './hooks/useChat'

function StatusDot({ status }) {
  const styles = {
    checking: 'bg-yellow-400 animate-pulse',
    online: 'bg-emerald-400',
    offline: 'bg-red-400 animate-pulse',
  }
  const labels = {
    checking: 'Connecting…',
    online: 'Online',
    offline: 'Offline',
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles[status]}`} />
      <span className="text-xs font-mono text-slate-500 hidden sm:inline">
        {labels[status]}
      </span>
    </div>
  )
}

export default function App() {
  const { messages, isLoading, backendStatus, sendUserMessage, clearChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleSend = (text) => sendUserMessage(text)
  const handleTopicClick = (query) => sendUserMessage(query)

  return (
    <div className="flex h-screen bg-bg text-slate-200 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onTopicClick={handleTopicClick}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <Shield size={15} className="text-indigo-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-100 leading-none">
                  HR Policy Assistant
                </h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Leave Policy v1.0
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusDot status={backendStatus} />

            {backendStatus === 'offline' && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono">
                <AlertTriangle size={11} />
                Backend offline
              </div>
            )}

            <button
              onClick={clearChat}
              title="Clear chat"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </header>

        {/* Chat area */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggestedClick={handleSend}
        />

        {/* Input */}
        <InputBar
          onSend={handleSend}
          isLoading={isLoading}
          disabled={backendStatus === 'offline'}
        />
      </div>
    </div>
  )
}
