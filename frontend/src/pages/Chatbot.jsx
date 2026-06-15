import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, Plus, Trash2, Edit3, Check, X, 
  Menu, Sparkles, Bot, User, MessageSquare,
  Scale, FileText, ShieldAlert, BookOpen
} from 'lucide-react'
import MarkdownRenderer from '../components/common/MarkdownRenderer.jsx'

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

// Mock responses database
const getMockAIResponse = (userQuery) => {
  const query = userQuery.toLowerCase()
  
  if (query.includes('nda') || query.includes('disclosure') || query.includes('confidential')) {
    return `### **Mutual NDA Risk Analysis Report**

Based on standard enterprise legal benchmarks, here is an automated risk assessment for Mutual Non-Disclosure Agreements (NDAs):

#### **1. High-Risk Red Flags (Must Redline)**
*   **Unilateral Obligations**: Ensure that confidentiality rules bind **both** parties equally. A one-sided NDA is highly unfavorable.
*   **Definition of Confidential Information**: Watch out for rules requiring marked written tags (e.g., *"Must be marked as Confidential"*). Verbal disclosures should be covered if confirmed in writing within **30 days**.
*   **Survival Period**: Standard term is **2 to 5 years** from disclosure. Be cautious of *"perpetual"* survival terms, unless dealing with trade secrets.
*   **Intellectual Property Rights**: Beware of hidden clauses that imply licensing or assignment of patent/technology rights. NDAs should explicitly state **no licenses are granted**.

---

#### **2. Standard Permitted Exceptions**
A standard NDA must exclude information that:
1. Is or becomes publicly known through no breach of the receiving party.
2. Was already in the receiving party's possession before receipt.
3. Is independently developed without reference to the confidential info.
4. Is rightfully obtained from a third party without confidentiality breaches.

\`\`\`markdown
[REDLINE SUGGESTION]
"No License. Nothing in this Agreement shall be construed to grant Receiving Party any license, title, or interest in Disclosing Party's Intellectual Property Rights, which shall remain solely with the Disclosing Party."
\`\`\`
`
  }

  if (query.includes('liability') || query.includes('cap') || query.includes('limit')) {
    return `### **Boilerplate Limitation of Liability (LoL) Drafting Guide**

In commercial agreements, the Limitation of Liability is the most critical risk-transfer mechanism. Here is a balanced, board-ready draft and analysis:

#### **1. Recommended Boilerplate Clause (Delaware Law)**

\`\`\`javascript
/**
 * LIMITATION OF LIABILITY.
 * EXCEPT FOR (A) A PARTY'S BREACH OF CONFIDENTIALITY OBLIGATIONS (SECTION 8), 
 * (B) A PARTY'S INDEMNIFICATION OBLIGATIONS (SECTION 11), OR (C) GROSS 
 * NEGLIGENCE OR WILLFUL MISCONDUCT:
 * 
 * 1. NEITHER PARTY WILL BE LIABLE FOR ANY CONSEQUENTIAL, INDIRECT, SPECIAL, 
 *    PUNITIVE, OR INCIDENTAL DAMAGES ARISING OUT OF THIS AGREEMENT.
 * 2. EACH PARTY'S TOTAL AGGREGATE LIABILITY UNDER THIS AGREEMENT SHALL BE 
 *    LIMITED TO THE GREATER OF (X) FIFTY THOUSAND DOLLARS ($50,000) OR 
 *    (Y) THE FEES PAID BY CUSTOMER TO PROVIDER IN THE TWELVE (12) MONTHS 
 *    PRECEDING THE CLAIM.
 */
\`\`\`

---

#### **2. Key Negotation Guidelines**
*   **Mutual vs Unilateral**: Always make LoL mutual unless provider risk is disproportionately higher.
*   **Carve-outs (Exceptions)**: Never allow a total liability limit to apply to:
    *   *Confidentiality breaches* (especially data breaches).
    *   *IP Indemnification* claims (if your code infringes, you must cover the defense).
    *   *Gross negligence / willful misconduct*.
*   **Super Caps**: For data protection, implement a "Super Cap" (e.g., *2x or 3x the annual contract value*) instead of an unlimited carve-out to keep liability predictable.`
  }

  if (query.includes('force majeure') || query.includes('pandemic') || query.includes('disruption')) {
    return `### **Force Majeure Boilerplate Clause & Analysis**

A modern Force Majeure clause must account for supply chain dependencies and pandemics. Below is a legally resilient template:

#### **1. Boilerplate Draft**
\`\`\`markdown
"Force Majeure. Neither party shall be liable for delay or failure to perform its obligations (excluding payment obligations) due to events beyond its reasonable control, including acts of God, strikes, war, terrorism, government regulations, orders, embargoes, pandemics, epidemics, natural disasters, or labor strikes. 

The affected party shall:
(i) Promptly notify the other party in writing, stating the expected duration;
(ii) Exercise commercially reasonable efforts to mitigate the delay or failure. 

If a Force Majeure event continues uninterrupted for more than forty-five (45) consecutive days, either party may terminate this Agreement immediately upon written notice, without penalty."
\`\`\`

---

#### **2. Essential Drafting Checklist**
*   **Exclusion of Payments**: Explicitly write that Force Majeure **does not excuse payment obligations** for services already delivered.
*   **Mitigation Duty**: The affected party must show they tried to avoid the issue (e.g. disaster recovery, alternative supplier search).
*   **Termination Threshold**: Allow termination if the blockage lasts too long (e.g., 30–60 days) to prevent either party from being trapped indefinitely.
*   **Pandemic Exclusions**: Explicitly add *"pandemics, epidemics, and government lock-downs"* to avoid courts claiming covid-style events were foreseeable.`
  }

  if (query.includes('ip') || query.includes('work-made-for-hire') || query.includes('copyright') || query.includes('assignment')) {
    return `### **Intellectual Property Rights: Work-for-Hire vs Assignment**

Understanding how IP transfers between contractor and client is critical to avoiding litigation.

| Concept | Work-Made-For-Hire | Assignment of IP |
| :--- | :--- | :--- |
| **Legal Basis** | US Copyright Act § 101 | General Contract Law (Assignment) |
| **Ownership Timing** | Vest directly in the client from creation | Vests in contractor first, then transfers to client |
| **Scope Limitation** | Only applies to employees OR 9 specific works | Appliable to any intellectual creations |
| **Revocability** | Non-revocable by author | Subject to termination rights after 35 years |

---

#### **1. Best Practice Drafting Strategy**
Because "Work-for-Hire" has strict statutory definitions, relying on it alone for contractors is a high risk. Standard boilerplate must include **both** concepts in a "Belt and Suspenders" approach:

\`\`\`markdown
"Ownership. Developer agrees that all deliverables created under this Agreement are 'work-made-for-hire' to the extent permitted by law. 
To the extent any deliverables do not qualify as work-made-for-hire, Developer hereby irrevocably and perpetually assigns and transfers to Client all right, title, and interest in such deliverables, including all copyrights, patents, and trade secrets."
\`\`\`

---

#### **2. Audit Warning**
Check all developer contracts for *"Assigns in the future"* clauses (e.g., *"Developer agrees to assign..."*). This is an agreement to agree. Ensure the transfer uses **present assignment language**: **"Developer hereby assigns..."**`
  }

  // Fallback response
  return `### **AI Legal Assistant Workspace**

I am ready to assist you with contract analysis, drafting guidelines, risk limits, and regulatory compliance.

Here are some commands or inquiries you can run:
*   **"Analyze NDA risk limits"** (reviews confidentiality exclusions, terms, and red flags)
*   **"Limit of liability clause drafting"** (provides Delaware templates, Super Caps, and indemnification guidelines)
*   **"Boilerplate Force Majeure clause"** (evaluates supply chain delays and epidemics)
*   **"IP Rights work-for-hire comparison"** (reviews copyright assignments and present transfers)

> **Corporate Disclaimer**: *This chatbot provides AI-driven automated legal contract suggestions based on best practices. It does not constitute formal legal counsel. Please verify critical documents with corporate legal counsel.*`
}

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
    // Default chat
    return [
      {
        id: 'chat-1',
        title: 'NDA Review Guidelines',
        messages: [
          { sender: 'user', text: 'Can you analyze standard risk limits and exceptions for mutual Non-Disclosure Agreements (NDAs)? Outline high risk red flags to watch out for.', time: '2:15 PM' },
          { sender: 'assistant', text: getMockAIResponse('nda'), time: '2:15 PM' }
        ]
      },
      {
        id: 'chat-2',
        title: 'Boilerplate Liability Cap',
        messages: [
          { sender: 'user', text: 'Provide a boilerplate Limitation of Liability clause under Delaware law', time: 'Yesterday' },
          { sender: 'assistant', text: getMockAIResponse('liability'), time: 'Yesterday' }
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

  const handleSend = (textToSend) => {
    const text = textToSend || inputText
    if (!text.trim() || !activeChat) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = { sender: 'user', text: text.trim(), time: now }
    
    // Add user message
    const updatedMessages = [...activeChat.messages, userMsg]
    const updatedChats = chats.map(c => 
      c.id === activeChat.id 
        ? { 
            ...c, 
            messages: updatedMessages,
            // Auto rename title if it was default
            title: c.title.startsWith('Legal Session') ? text.slice(0, 24) + (text.length > 24 ? '...' : '') : c.title 
          } 
        : c
    )
    
    setChats(updatedChats)
    setInputText('')
    setIsGenerating(true)

    // Simulate AI response stream
    setTimeout(() => {
      const aiReplyText = getMockAIResponse(text)
      const aiMsg = { sender: 'assistant', text: aiReplyText, time: now }
      
      setChats(prevChats => 
        prevChats.map(c => 
          c.id === activeChat.id 
            ? { ...c, messages: [...updatedMessages, aiMsg] } 
            : c
        )
      )
      setIsGenerating(false)
    }, 1200)
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
