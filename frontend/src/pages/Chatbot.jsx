import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Send, Plus, Trash2, Edit3, Check, X, Copy,
  Menu, Sparkles, Bot, User, MessageSquare,
  Scale, FileText, ShieldAlert, BookOpen, Search, AlertCircle
} from 'lucide-react'
import MarkdownRenderer from '../components/common/MarkdownRenderer.jsx'
import { getToken } from '../utils/tokenManager'
import {
  getSessions,
  getSessionMessages,
  createSession,
  renameSession,
  deleteSession
} from '../api/chat'

// Import reusable components
import Skeleton from '../components/common/Skeleton.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import ErrorState from '../components/common/ErrorState.jsx'

// Default suggested prompts (for empty state)
const SUGGESTED_PROMPTS = [
  {
    title: 'Analyze NDA Risk',
    desc: 'What are standard risk caps & exceptions for mutual NDAs?',
    prompt: 'Can you analyze standard risk limits and exceptions for mutual Non-Disclosure Agreements (NDAs)? Outline high risk red flags to watch out for.',
    icon: ShieldAlert,
    iconColor: 'text-rose-400 bg-rose-950/40'
  },
  {
    title: 'Boilerplate Liability Cap',
    desc: 'Provide standard limitation of liability clause drafting.',
    prompt: 'Provide a boilerplate Limitation of Liability clause under Delaware law that balances buyer and seller obligations, with drafting recommendations.',
    icon: Scale,
    iconColor: 'text-amber-400 bg-amber-950/40'
  },
  {
    title: 'Draft Force Majeure',
    desc: 'Draft a clause addressing pandemic & supply chain disruption.',
    prompt: 'Please draft a robust Force Majeure clause for a commercial supply agreement that explicitly covers global pandemics, government lockdowns, and supply chain disruptions.',
    icon: FileText,
    iconColor: 'text-blue-400 bg-blue-950/40'
  },
  {
    title: 'IP Rights Review',
    desc: 'Compare work-for-hire vs assignment of copyrights.',
    prompt: 'Explain the legal difference between "work-made-for-hire" and "assignment of copyrights" under US IP laws in SaaS contractor agreements.',
    icon: BookOpen,
    iconColor: 'text-emerald-400 bg-emerald-950/40'
  }
]

// Quick suggested questions for active conversations
const QUICK_SUGGESTIONS = [
  'Summarize the key risks',
  'Draft a compliance checklist',
  'What are the termination conditions?',
  'Explain indemnification obligations',
  'Compare with industry standards',
]

export default function Chatbot() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [errorSessions, setErrorSessions] = useState(null)
  const [errorMessages, setErrorMessages] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const [inputText, setInputText] = useState('')
  const [chatbotStyle, setChatbotStyle] = useState('enterprise') // 'chatgpt' | 'claude' | 'enterprise'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingSessionId, setEditingSessionId] = useState(null)
  const [editSessionTitle, setEditSessionTitle] = useState('')
  const [copiedMsgIdx, setCopiedMsgIdx] = useState(null)

  const chatEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const isUserAtBottomRef = useRef(true)
  const isSendingRef = useRef(false)
  const activeSessionRef = useRef(null)

  const MAX_MESSAGE_LENGTH = 10000

  // Auto-scroll: only scroll when user is near the bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior, block: 'end' })
    }
  }, [])

  // Track if user is scrolled to bottom
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const threshold = 120
    isUserAtBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < threshold
  }, [])

  // Scroll to bottom on new messages if user is at the bottom
  useEffect(() => {
    if (isUserAtBottomRef.current) {
      scrollToBottom(isGenerating ? 'instant' : 'smooth')
    }
  }, [messages, isGenerating, scrollToBottom])

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions()
  }, [])

  // Load messages when active session changes
  useEffect(() => {
    activeSessionRef.current = activeSessionId
    if (activeSessionId) {
      loadMessages(activeSessionId)
    } else {
      setMessages([])
    }
  }, [activeSessionId])

  // Close mobile sidebar on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const loadSessions = async () => {
    setIsLoadingSessions(true)
    setErrorSessions(null)
    try {
      const data = await getSessions()
      setSessions(data)
      if (data.length > 0 && !activeSessionRef.current) {
        setActiveSessionId(data[0].id)
      }
    } catch (err) {
      console.error('Error loading sessions:', err)
      setErrorSessions('Failed to load chat history. Please try again.')
    } finally {
      setIsLoadingSessions(false)
    }
  }

  const loadMessages = async (sessionId) => {
    setIsLoadingMessages(true)
    setErrorMessages(null)
    try {
      const data = await getSessionMessages(sessionId)
      setMessages(data)
      // Scroll to bottom after loading
      setTimeout(() => scrollToBottom('instant'), 100)
    } catch (err) {
      console.error('Error loading messages:', err)
      setErrorMessages('Failed to load messages for this conversation.')
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const handleNewChat = async () => {
    setErrorSessions(null)
    try {
      const nextTitle = `Legal Session ${sessions.length + 1}`
      const newSessionObj = await createSession(nextTitle)
      setSessions(prev => [newSessionObj, ...prev])
      setActiveSessionId(newSessionObj.id)
      setEditingSessionId(newSessionObj.id)
      setEditSessionTitle(newSessionObj.session_title)
      // Close mobile sidebar after creating
      if (window.innerWidth < 1024) setIsSidebarOpen(false)
    } catch (err) {
      console.error('Error creating new session:', err)
      setErrorSessions('Failed to create new session. Please try again.')
    }
  }

  const handleDeleteChat = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteSession(id)
      const updated = sessions.filter(s => s.id !== id)
      setSessions(updated)
      if (activeSessionId === id) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id)
        } else {
          setActiveSessionId(null)
        }
      }
    } catch (err) {
      console.error('Error deleting session:', err)
    }
  }

  const handleStartRename = (session, e) => {
    e.stopPropagation()
    setEditingSessionId(session.id)
    setEditSessionTitle(session.session_title || '')
  }

  const handleSaveRename = async (id, e) => {
    if (e) e.stopPropagation()
    if (!editSessionTitle.trim()) return
    try {
      const updatedSession = await renameSession(id, editSessionTitle.trim())
      setSessions(prev => prev.map(s => s.id === id ? { ...s, session_title: updatedSession.session_title } : s))
      setEditingSessionId(null)
    } catch (err) {
      console.error('Error renaming session:', err)
    }
  }

  const handleCopyResponse = async (text, idx) => {
    try {
      // Strip markdown for clean copy
      const cleanText = text
        .replace(/```[\s\S]*?```/g, (match) => {
          const code = match.replace(/```\w*\n?/, '').replace(/```$/, '')
          return code.trim()
        })
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/^\s*#{1,6}\s+/gm, '')
        .replace(/^\s*[-*+]\s+/gm, '• ')
        .replace(/^\s*\d+\.\s+/gm, '')

      try {
        await navigator.clipboard.writeText(cleanText)
      } catch {
        // Fallback for insecure contexts (HTTP)
        const textarea = document.createElement('textarea')
        textarea.value = cleanText
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedMsgIdx(idx)
      setTimeout(() => setCopiedMsgIdx(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText
    if (!text.trim() || isGenerating || isSendingRef.current) return

    // Validate message length (BUG-007)
    if (text.length > MAX_MESSAGE_LENGTH) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        message: `⚠️ Message too long (${text.length.toLocaleString()} characters). Maximum is ${MAX_MESSAGE_LENGTH.toLocaleString()} characters.`,
        created_at: new Date().toISOString()
      }])
      return
    }

    isSendingRef.current = true
    let currentSessionId = activeSessionId

    // UI Feedback: Append user message instantly
    const userMsg = { sender: 'user', message: text.trim(), created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsGenerating(true)
    isUserAtBottomRef.current = true

    // AbortController for 30s timeout (BUG-001)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const token = getToken()

      const response = await fetch(`${baseUrl}/chat/stream`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text.trim(),
          session_id: currentSessionId
        })
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let aiText = ''
      let isFirstChunk = true
      let streamDone = false

      // Unique placeholder ID to avoid collision on rapid sends (BUG-011)
      const tempAiMsgId = `temp-ai-msg-${Date.now()}`
      setMessages(prev => [...prev, { id: tempAiMsgId, sender: 'assistant', message: '', created_at: new Date().toISOString() }])

      while (true) {
        const { value, done } = await reader.read()
        if (done || streamDone) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            // [DONE] now breaks both inner and outer loops (BUG-005)
            if (dataStr.trim() === '[DONE]') { streamDone = true; break }
            try {
              const data = JSON.parse(dataStr)
              if (data.content) {
                aiText += data.content
                
                // If it's a new session, update activeSessionId and refresh sessions list
                if (isFirstChunk && data.session_id && !currentSessionId) {
                  currentSessionId = data.session_id
                  setActiveSessionId(currentSessionId)
                  loadSessions()
                  isFirstChunk = false
                }

                // Real-time append chunks to the final AI message placeholder
                setMessages(prev => prev.map(m => m.id === tempAiMsgId ? { ...m, message: aiText } : m))
              }
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }

      setIsGenerating(false)
      // Re-load the session messages properly to align timestamps/IDs, and refresh list to show updated title
      if (currentSessionId) {
        loadMessages(currentSessionId)
        loadSessions()
      }

    } catch (error) {
      clearTimeout(timeoutId)
      console.error('Chat API error:', error)
      setIsGenerating(false)
      // Context-specific error messaging (BUG-001)
      const errorMessage = error.name === 'AbortError'
        ? '⚠️ The server took too long to respond. Please check your connection and try again.'
        : '⚠️ Error: Unable to communicate with the Legal Assistant. Please check your connection and retry.'
      setMessages(prev => [...prev, {
        sender: 'assistant',
        message: errorMessage,
        created_at: new Date().toISOString()
      }])
    } finally {
      isSendingRef.current = false
    }
  }

  // Helper to group sessions by date (Today, Yesterday, Previous 7 Days, Older)
  const getGroupedSessions = () => {
    const filtered = sessions.filter(s => 
      (s.session_title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const groups = {
      today: { label: 'Today', items: [] },
      yesterday: { label: 'Yesterday', items: [] },
      last7Days: { label: 'Previous 7 Days', items: [] },
      older: { label: 'Older', items: [] }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const sevenDaysAgoStart = new Date(todayStart)
    sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 7)

    filtered.forEach(session => {
      const createdTime = new Date(session.created_at)
      if (createdTime >= todayStart) {
        groups.today.items.push(session)
      } else if (createdTime >= yesterdayStart) {
        groups.yesterday.items.push(session)
      } else if (createdTime >= sevenDaysAgoStart) {
        groups.last7Days.items.push(session)
      } else {
        groups.older.items.push(session)
      }
    })

    return Object.values(groups).filter(g => g.items.length > 0)
  }

  // Get style class variables based on selection
  const getStyleClasses = () => {
    switch (chatbotStyle) {
      case 'chatgpt':
        return {
          wrapper: 'bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden',
          sidebar: 'bg-slate-950 border-r border-slate-850',
          messageList: 'bg-slate-900',
          userBubble: 'bg-slate-800 text-slate-100 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm self-end max-w-[80%]',
          aiBubble: 'bg-transparent text-slate-200 px-4 py-3 self-start max-w-[90%]',
          avatarAi: 'bg-emerald-600 text-white rounded-lg p-1.5',
          avatarUser: 'bg-slate-700 text-slate-100 rounded-lg p-1.5',
          header: 'border-b border-slate-800 bg-slate-900/80'
        }
      case 'claude':
        return {
          wrapper: 'bg-slate-950 border border-slate-850 rounded-3xl overflow-hidden',
          sidebar: 'bg-slate-900 border-r border-slate-800/80',
          messageList: 'bg-slate-950',
          userBubble: 'bg-indigo-950/40 border border-indigo-900/60 text-indigo-200 rounded-3xl rounded-tr-md px-5 py-3.5 self-end max-w-[80%] shadow-md shadow-indigo-950/10',
          aiBubble: 'bg-slate-900/60 border border-slate-800 text-slate-300 rounded-3xl rounded-tl-md px-5 py-3.5 self-start max-w-[85%] shadow-sm',
          avatarAi: 'bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-full p-2',
          avatarUser: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full p-2',
          header: 'border-b border-slate-850 bg-slate-950/80'
        }
      case 'enterprise':
      default:
        return {
          wrapper: 'bg-slate-900/40 border border-slate-800/80 rounded-[2rem] overflow-hidden backdrop-blur-md',
          sidebar: 'bg-slate-950/80 border-r border-slate-800/60',
          messageList: 'bg-slate-900/10',
          userBubble: 'bg-slate-950 border-l-4 border-amber-500/70 text-slate-200 rounded-2xl rounded-tr-none px-5 py-3.5 shadow-lg shadow-slate-950/30 self-end max-w-[80%]',
          aiBubble: 'bg-slate-900/80 border border-amber-500/15 text-slate-300 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-md shadow-slate-950/20 self-start max-w-[85%]',
          avatarAi: 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-xl p-2 font-bold shadow-md shadow-amber-500/10',
          avatarUser: 'bg-gradient-to-br from-sky-400 to-blue-500 text-white rounded-xl p-2 shadow-md shadow-sky-500/10',
          header: 'border-b border-slate-800 bg-slate-900/50 backdrop-blur-md'
        }
    }
  }

  const s = getStyleClasses()
  const groupedSessions = getGroupedSessions()

  return (
    <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-12rem)] relative">
      {/* Page header and Style Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Legal Intelligence</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">AI Legal Assistant</h1>
        </div>

        {/* Style Switcher */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-1 backdrop-blur-sm self-start">
          {['chatgpt', 'claude', 'enterprise'].map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setChatbotStyle(style)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide capitalize transition ${
                chatbotStyle === style 
                  ? style === 'claude' 
                    ? 'bg-indigo-950 border border-indigo-900/50 text-indigo-300 shadow'
                    : style === 'enterprise'
                    ? 'bg-slate-900 border border-slate-750 text-amber-400 shadow'
                    : 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {style === 'chatgpt' ? 'ChatGPT Style' : style === 'claude' ? 'Claude Style' : 'Enterprise Legal'}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat workspace */}
      <div className={`${s.wrapper} grid grid-cols-1 lg:grid-cols-[280px_1fr] flex-grow min-h-[550px] h-[650px] shadow-2xl relative`}>
        
        {/* Toggle Sidebar Button (mobile only) */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden absolute z-20 top-4 left-4 bg-slate-900 border border-slate-800 p-2 rounded-xl text-slate-400 hover:text-white transition"
          aria-label="Toggle history sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* ========== Mobile Sidebar Overlay Drawer ========== */}
        <div
          className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
            isSidebarOpen ? 'visible' : 'invisible pointer-events-none'
          }`}
        >
          {/* Blur backdrop */}
          <div
            className={`absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ${
              isSidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Sliding drawer */}
          <aside
            className={`absolute top-0 left-0 bottom-0 w-[300px] max-w-[85vw] bg-slate-950 border-r border-slate-800/60 flex flex-col gap-4 p-5 shadow-2xl transition-transform duration-300 ease-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Chat History</p>
                <p className="text-sm font-semibold text-slate-200 mt-0.5">Conversations</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNewChat}
              className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New legal draft
            </button>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile sessions list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {renderSessionsList(groupedSessions, isLoadingSessions, errorSessions, searchQuery, activeSessionId, editingSessionId, editSessionTitle, setEditSessionTitle, setActiveSessionId, setIsSidebarOpen, handleStartRename, handleSaveRename, handleDeleteChat, setEditingSessionId, loadSessions, true)}
            </div>
          </aside>
        </div>

        {/* ========== Desktop Sidebar ========== */}
        <aside className={`${s.sidebar} hidden lg:flex flex-col gap-4 p-4 h-full overflow-hidden`}>
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            New legal draft
          </button>

          {/* Search bar inside sidebar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {renderSessionsList(groupedSessions, isLoadingSessions, errorSessions, searchQuery, activeSessionId, editingSessionId, editSessionTitle, setEditSessionTitle, setActiveSessionId, setIsSidebarOpen, handleStartRename, handleSaveRename, handleDeleteChat, setEditingSessionId, loadSessions, false)}
          </div>
        </aside>

        {/* Active conversation panel */}
        <section className="flex flex-col h-full overflow-hidden">
          {isLoadingMessages ? (
            <div className="flex-1 flex flex-col justify-center items-center space-y-4">
              <Skeleton className="h-10 w-3/4 max-w-md" />
              <Skeleton className="h-12 w-2/3 max-w-md" />
              <Skeleton className="h-16 w-3/4 max-w-md" />
            </div>
          ) : errorMessages ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <ErrorState 
                title="Error Loading Conversation" 
                message={errorMessages} 
                onRetry={() => activeSessionId && loadMessages(activeSessionId)} 
              />
            </div>
          ) : activeSessionId ? (
            <>
              {/* Message List */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className={`${s.messageList} flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col scroll-smooth`}
              >
                {messages.length === 0 ? (
                  /* Empty state: Suggested prompts */
                  <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto space-y-8 py-8">
                    <div className="text-center space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Bot className="h-7 w-7" />
                      </div>
                      <h2 className="text-xl font-bold text-white md:text-2xl font-display">Enterprise Legal Workspace</h2>
                      <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                        Ask analysis questions, draft clauses, examine guidelines, or redline critical compliance issues instantly.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {SUGGESTED_PROMPTS.map((item, idx) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSend(item.prompt)}
                            className="text-left rounded-2xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 p-4 transition shadow hover:border-slate-700/80 group active:scale-[0.98]"
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconColor} mb-3 group-hover:scale-110 transition-transform`}>
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Render messages */
                  <div className="space-y-6 flex flex-col">
                    {messages.map((msg, idx) => {
                      const isAi = msg.sender === 'assistant'
                      const displayTime = msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                      return (
                        <div
                          key={idx}
                          className={`flex gap-4 items-start ${isAi ? 'self-start' : 'self-end flex-row-reverse'} max-w-full group/msg`}
                        >
                          <div className={`shrink-0 ${isAi ? s.avatarAi : s.avatarUser}`}>
                            {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>
                          <div className={`relative ${isAi ? s.aiBubble : s.userBubble}`}>
                            <div className="flex items-center gap-2 mb-1 justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                {isAi ? 'AI Legal Assistant' : 'You'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {displayTime && <span className="text-[9px] text-slate-600">{displayTime}</span>}
                                {/* Copy button for AI messages */}
                                {isAi && msg.message && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopyResponse(msg.message, idx)}
                                    className={`p-1 rounded-md transition-all duration-200 ${
                                      copiedMsgIdx === idx 
                                        ? 'text-emerald-400 bg-emerald-500/10' 
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 opacity-0 group-hover/msg:opacity-100'
                                    }`}
                                    title="Copy response"
                                  >
                                    {copiedMsgIdx === idx ? (
                                      <Check className="h-3 w-3" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="overflow-x-auto max-w-full">
                              {isAi ? (
                                <MarkdownRenderer content={msg.message} />
                              ) : (
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}

                    {/* Generating Loader */}
                    {isGenerating && (
                      <div className="flex gap-4 items-start self-start">
                        <div className={s.avatarAi}>
                          <Bot className="h-4 w-4 animate-bounce" />
                        </div>
                        <div className={`${s.aiBubble} rounded-2xl`}>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                            AI is assessing
                          </span>
                          <div className="flex items-center gap-1.5 py-1">
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/20 backdrop-blur-sm">
                {/* Quick Suggested Questions (shown when conversation has messages) */}
                {messages.length > 0 && !isGenerating && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1 max-w-4xl mx-auto scrollbar-hide">
                    {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(suggestion)}
                        className="shrink-0 flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition active:scale-[0.97] whitespace-nowrap"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500/70" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex gap-2 max-w-4xl mx-auto items-center"
                >
                  <textarea
                    rows="1"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Ask a clause review question or draft compliance requirements..."
                    className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-100 placeholder-slate-500 px-4 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isGenerating || !inputText.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-[0.95]"
                    aria-label="Send message"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
                <p className="text-[10px] text-center text-slate-500 mt-2">
                  Secured Legal LLM workspace. Conversations are fully encrypted and sandboxed.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <EmptyState 
                icon={MessageSquare}
                title="No Session Active" 
                description="Create a new legal conversation or select a previous one from the sidebar."
                actionLabel="New legal draft"
                onAction={handleNewChat}
              />
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

// ========== Helper: Render sessions list (shared between desktop + mobile sidebar) ==========
function renderSessionsList(
  groupedSessions, isLoadingSessions, errorSessions, searchQuery, 
  activeSessionId, editingSessionId, editSessionTitle, setEditSessionTitle, 
  setActiveSessionId, setIsSidebarOpen, handleStartRename, handleSaveRename, 
  handleDeleteChat, setEditingSessionId, loadSessions, isMobile
) {
  if (isLoadingSessions) {
    return (
      <div className="space-y-3 px-1 mt-2">
        <Skeleton height="32px" className="w-full" />
        <Skeleton height="32px" className="w-full" />
        <Skeleton height="32px" className="w-full" />
      </div>
    )
  }

  if (errorSessions) {
    return (
      <div className="text-center py-4 px-2">
        <p className="text-xs text-rose-400 mb-2">{errorSessions}</p>
        <button
          onClick={loadSessions}
          className="text-xs text-brand-400 underline hover:text-brand-300"
        >
          Retry Loading
        </button>
      </div>
    )
  }

  if (groupedSessions.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-xs">
        {searchQuery ? 'No matching conversations' : 'No chat history'}
      </div>
    )
  }

  return groupedSessions.map((group) => (
    <div key={group.label} className="space-y-1">
      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-1.5 mt-2">
        {group.label}
      </p>
      {group.items.map((session) => (
        <div
          key={session.id}
          onClick={() => {
            setActiveSessionId(session.id)
            if (isMobile) setIsSidebarOpen(false)
          }}
          className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium cursor-pointer transition ${
            session.id === activeSessionId 
              ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
              : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
            {editingSessionId === session.id ? (
              <input
                type="text"
                value={editSessionTitle}
                onChange={(e) => setEditSessionTitle(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onBlur={() => handleSaveRename(session.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(session.id)
                  if (e.key === 'Escape') setEditingSessionId(null)
                }}
                className="bg-slate-950 text-white rounded border border-slate-700 px-1.5 py-0.5 w-full outline-none focus:border-brand-500"
                autoFocus
              />
            ) : (
              <span className="truncate">{session.session_title || 'Legal Session'}</span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {editingSessionId === session.id ? (
              <button
                type="button"
                onClick={(e) => handleSaveRename(session.id, e)}
                className="p-1 hover:text-brand-400 text-slate-400"
              >
                <Check className="h-3 w-3" />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => handleStartRename(session, e)}
                className="p-1 hover:text-slate-200 text-slate-500"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => handleDeleteChat(session.id, e)}
              className="p-1 hover:text-rose-400 text-slate-500"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  ))
}
