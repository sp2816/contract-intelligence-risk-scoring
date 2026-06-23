import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, Plus, Trash2, Edit3, Check, X, 
  Menu, Sparkles, Bot, User, MessageSquare,
  Scale, FileText, ShieldAlert, BookOpen
} from 'lucide-react'
import MarkdownRenderer from '../components/common/MarkdownRenderer.jsx'
import { getToken } from '../utils/tokenManager'

// Local storage key
const CHAT_STORAGE_KEY = 'lexai-chatbot-history'

// Default suggested prompts
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


export default function Chatbot() {
  const [chats, setChats] = useState(() => {
    const stored = window.localStorage.getItem(CHAT_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error(e)
      }
    }
    return [
      {
        id: 'chat-1',
        title: 'NDA Review Guidelines',
        messages: [
          { sender: 'user', text: 'Can you analyze standard risk limits and exceptions for mutual Non-Disclosure Agreements (NDAs)? Outline high risk red flags to watch out for.', time: '2:15 PM' },
          { sender: 'assistant', text: '### **Mutual NDA Risk Analysis Report**\n\nBased on standard enterprise legal benchmarks, here is an automated risk assessment for Mutual Non-Disclosure Agreements (NDAs)...', time: '2:15 PM' }
        ]
      },
      {
        id: 'chat-2',
        title: 'Boilerplate Liability Cap',
        messages: [
          { sender: 'user', text: 'Provide a boilerplate Limitation of Liability clause under Delaware law', time: 'Yesterday' },
          { sender: 'assistant', text: '### **Boilerplate Limitation of Liability (LoL) Drafting Guide**\n\nIn commercial agreements, the Limitation of Liability is the most critical risk-transfer mechanism...', time: 'Yesterday' }
        ]
      }
    ]
  })

  const [activeChatId, setActiveChatId] = useState('chat-1')
  const [inputText, setInputText] = useState('')
  const [chatbotStyle, setChatbotStyle] = useState('enterprise') // 'chatgpt' | 'claude' | 'enterprise'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editingChatId, setEditingChatId] = useState(null)
  const [editChatTitle, setEditChatTitle] = useState('')

  const chatEndRef = useRef(null)

  // Sync with local storage
  useEffect(() => {
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats))
  }, [chats])

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats, activeChatId, isGenerating])

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0] || null

  const handleNewChat = () => {
    const newId = `chat-${Date.now()}`
    const newChatObj = {
      id: newId,
      title: `Legal Session ${chats.length + 1}`,
      messages: []
    }
    setChats([newChatObj, ...chats])
    setActiveChatId(newId)
    setEditingChatId(newId)
    setEditChatTitle(newChatObj.title)
  }

  const handleDeleteChat = (id, e) => {
    e.stopPropagation()
    const updated = chats.filter(c => c.id !== id)
    setChats(updated)
    if (activeChatId === id && updated.length > 0) {
      setActiveChatId(updated[0].id)
    }
  }

  const handleStartRename = (chat, e) => {
    e.stopPropagation()
    setEditingChatId(chat.id)
    setEditChatTitle(chat.title)
  }

  const handleSaveRename = (id, e) => {
    if (e) e.stopPropagation()
    if (!editChatTitle.trim()) return
    setChats(chats.map(c => c.id === id ? { ...c, title: editChatTitle.trim() } : c))
    setEditingChatId(null)
  }

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText
    if (!text.trim() || !activeChat) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { sender: 'user', text: text.trim(), time: now }
    
    const aiMsgId = Date.now().toString()
    const initialAiMsg = { id: aiMsgId, sender: 'assistant', text: '', time: now, isStreaming: true }
    
    const updatedMessages = [...activeChat.messages, userMsg, initialAiMsg]
    
    let currentTitle = activeChat.title
    if (currentTitle.startsWith('Legal Session')) {
      currentTitle = text.slice(0, 24) + (text.length > 24 ? '...' : '')
    }

    setChats(prevChats => prevChats.map(c => 
      c.id === activeChat.id 
        ? { ...c, messages: updatedMessages, title: currentTitle } 
        : c
    ))
    
    setInputText('')
    setIsGenerating(true)

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
      const token = getToken()
      
      const response = await fetch(`${baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text.trim() })
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }

      setIsGenerating(false) // Hide the bouncing dots once stream starts
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let aiText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        // SSE sends lines like: data: {"content": "foo"}\n\n
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr.trim() === '[DONE]') break
            try {
              const data = JSON.parse(dataStr)
              if (data.content) {
                aiText += data.content
                
                // Update the chat with accumulated text
                setChats(prevChats => prevChats.map(c => {
                  if (c.id !== activeChat.id) return c
                  const newMsgs = [...c.messages]
                  const lastMsg = newMsgs[newMsgs.length - 1]
                  if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.id === aiMsgId) {
                    lastMsg.text = aiText
                  }
                  return { ...c, messages: newMsgs }
                }))
              }
            } catch (e) {
              // Ignore partial JSON parsing errors which can happen if chunks are cut off
            }
          }
        }
      }
      
      // Stream finished
      setChats(prevChats => prevChats.map(c => {
        if (c.id !== activeChat.id) return c
        const newMsgs = [...c.messages]
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.id === aiMsgId) {
          lastMsg.isStreaming = false
        }
        return { ...c, messages: newMsgs }
      }))

    } catch (error) {
      console.error('Chat API Error:', error)
      setIsGenerating(false)
      
      // Update the AI message to show error
      setChats(prevChats => prevChats.map(c => {
        if (c.id !== activeChat.id) return c
        const newMsgs = [...c.messages]
        const lastMsg = newMsgs[newMsgs.length - 1]
        if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.id === aiMsgId) {
          lastMsg.text = '⚠️ Error: Unable to connect to the AI Legal Assistant. Please try again.'
          lastMsg.isStreaming = false
        }
        return { ...c, messages: newMsgs }
      }))
    }
  }

  // Get style variables based on current selection
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
          wrapper: 'bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden',
          sidebar: 'bg-slate-900 border-r border-slate-800/80',
          messageList: 'bg-slate-950',
          userBubble: 'bg-indigo-950/40 border border-indigo-900/60 text-indigo-200 rounded-3xl rounded-tr-md px-5 py-3.5 self-end max-w-[80%] shadow-md shadow-indigo-950/10',
          aiBubble: 'bg-slate-900/60 border border-slate-800 text-slate-300 rounded-3xl rounded-tl-md px-5 py-3.5 self-start max-w-[85%] shadow-sm',
          avatarAi: 'bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-full p-2',
          avatarUser: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full p-2',
          header: 'border-b border-slate-800 bg-slate-950/80'
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

  return (
    <div className="flex flex-col gap-6 h-full min-h-[calc(100vh-12rem)]">
      {/* Page header and Style Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Legal Intelligence</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">AI Legal Assistant</h1>
        </div>

        {/* Style Switcher */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-800 bg-slate-950/60 p-1 backdrop-blur-sm self-start">
          <button
            type="button"
            onClick={() => setChatbotStyle('chatgpt')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition ${chatbotStyle === 'chatgpt' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ChatGPT Style
          </button>
          <button
            type="button"
            onClick={() => setChatbotStyle('claude')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition ${chatbotStyle === 'claude' ? 'bg-indigo-950 border border-indigo-900/50 text-indigo-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Claude Style
          </button>
          <button
            type="button"
            onClick={() => setChatbotStyle('enterprise')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold tracking-wide transition ${chatbotStyle === 'enterprise' ? 'bg-slate-900 border border-slate-750 text-amber-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Enterprise legal
          </button>
        </div>
      </div>

      {/* Main chat workspace */}
      <div className={`${s.wrapper} grid grid-cols-1 lg:grid-cols-[260px_1fr] flex-grow min-h-[550px] h-[650px] shadow-2xl`}>
        
        {/* Toggle Sidebar Button (mobile only) */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden absolute z-20 top-32 left-8 bg-slate-900 border border-slate-850 p-2 rounded-xl text-slate-400 hover:text-white"
          aria-label="Toggle history sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Chat history sidebar */}
        <aside className={`${s.sidebar} flex flex-col gap-4 p-4 ${isSidebarOpen ? 'flex' : 'hidden lg:flex'} h-full overflow-hidden`}>
          <button
            type="button"
            onClick={handleNewChat}
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition"
          >
            <Plus className="h-4 w-4" />
            New legal draft
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-2">History Sessions</p>
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id)
                  // On mobile, close history list on selection
                  if (window.innerWidth < 1024) setIsSidebarOpen(false)
                }}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium cursor-pointer transition ${
                  chat.id === activeChatId 
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' 
                    : 'text-slate-450 hover:bg-slate-900 hover:text-slate-255'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editChatTitle}
                      onChange={(e) => setEditChatTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => handleSaveRename(chat.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(chat.id)
                        if (e.key === 'Escape') setEditingChatId(null)
                      }}
                      className="bg-slate-950 text-white rounded border border-slate-700 px-1 py-0.5 w-full outline-none focus:border-brand-500"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{chat.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingChatId === chat.id ? (
                    <button
                      type="button"
                      onClick={(e) => handleSaveRename(chat.id, e)}
                      className="p-1 hover:text-brand-400"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleStartRename(chat, e)}
                      className="p-1 hover:text-slate-200"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="p-1 hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Active conversation panel */}
        <section className="flex flex-col h-full overflow-hidden">
          {activeChat ? (
            <>
              {/* Message List */}
              <div className={`${s.messageList} flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col`}>
                {activeChat.messages.length === 0 ? (
                  /* Empty state: Suggested prompts */
                  <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto space-y-8 py-8">
                    <div className="text-center space-y-3">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        <Bot className="h-7 w-7" />
                      </div>
                      <h2 className="text-xl font-bold text-white md:text-2xl">Enterprise Legal Workspace</h2>
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
                            className="text-left rounded-2xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900/60 p-4 transition shadow hover:border-slate-700/80 group"
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconColor} mb-3 group-hover:scale-110 transition-transform`}>
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-450 leading-relaxed">{item.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  /* Render messages */
                  <div className="space-y-6 flex flex-col">
                    {activeChat.messages.map((msg, idx) => {
                      const isAi = msg.sender === 'assistant'
                      return (
                        <div
                          key={idx}
                          className={`flex gap-4 items-start ${isAi ? 'self-start' : 'self-end flex-row-reverse'} max-w-full`}
                        >
                          <div className={isAi ? s.avatarAi : s.avatarUser}>
                            {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          </div>
                          <div className={isAi ? s.aiBubble : s.userBubble}>
                            <div className="flex items-center gap-2 mb-1 justify-between">
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                {isAi ? 'AI Legal Assistant' : 'You'}
                              </span>
                              <span className="text-[9px] text-slate-600">{msg.time}</span>
                            </div>
                            <div className="overflow-x-auto max-w-full">
                              {isAi ? (
                                <MarkdownRenderer content={msg.text} />
                              ) : (
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
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
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    aria-label="Send message"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
                <p className="text-[10px] text-center text-slate-550 mt-2">
                  Secured Legal LLM workspace. Conversations are fully encrypted and sandboxed.
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-slate-500">
              Select or create a new legal chat to start.
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
