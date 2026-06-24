import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

// Helper to replace inline styles: bold, italic, code, links
const parseInline = (text) => {
  if (!text) return ''
  
  // Escape HTML tags to prevent XSS (since this is custom formatting)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Italics (*text*)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Inline code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 font-mono text-xs border border-slate-800">$1</code>')
  
  // Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-400 hover:text-brand-300 hover:underline">$1</a>')

  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// Subcomponent for interactive code block with a Copy button
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback for insecure contexts (HTTP without localhost)
      const textarea = document.createElement('textarea')
      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs sm:text-sm shadow-dark-soft">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-slate-400 border-b border-slate-850">
        <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-slate-800 hover:text-white transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code body */}
      <pre className="p-4 overflow-x-auto text-slate-350 leading-relaxed max-w-full">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export default function MarkdownRenderer({ content }) {
  if (!content) return null

  // Split content by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-4 text-slate-300 leading-relaxed text-sm md:text-base">
      {parts.map((part, index) => {
        // Render code block
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n([\s\S]*?)```/)
          const language = match ? match[1] : ''
          const code = match ? match[2].trim() : part.slice(3, -3).trim()
          return <CodeBlock key={index} code={code} language={language} />
        }

        // Render normal markdown blocks (headers, lists, quotes, paragraphs)
        const lines = part.split('\n')
        const elements = []
        let currentList = []
        let isOrdered = false

        const flushList = (key) => {
          if (currentList.length > 0) {
            elements.push(
              isOrdered ? (
                <ol key={`ol-${key}`} className="list-decimal pl-6 my-2 space-y-1.5 text-slate-300">
                  {currentList.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
                </ol>
              ) : (
                <ul key={`ul-${key}`} className="list-disc pl-6 my-2 space-y-1.5 text-slate-300">
                  {currentList.map((item, i) => <li key={i}>{parseInline(item)}</li>)}
                </ul>
              )
            )
            currentList = []
          }
        }

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const trimmed = line.trim()

          // Empty line
          if (trimmed === '') {
            flushList(i)
            continue
          }

          // Unordered list item
          const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)/)
          if (ulMatch) {
            if (isOrdered) flushList(i)
            isOrdered = false
            currentList.push(ulMatch[3])
            continue
          }

          // Ordered list item
          const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/)
          if (olMatch) {
            if (!isOrdered) flushList(i)
            isOrdered = true
            currentList.push(olMatch[3])
            continue
          }

          // Headings
          const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/)
          if (headingMatch) {
            flushList(i)
            const level = headingMatch[1].length
            const text = headingMatch[2]
            const headingClasses = {
              1: 'text-2xl font-bold text-white mt-6 mb-2 tracking-tight',
              2: 'text-xl font-bold text-white mt-5 mb-2 tracking-tight',
              3: 'text-lg font-bold text-slate-100 mt-4 mb-2',
              4: 'text-base font-bold text-slate-200 mt-3 mb-1',
              5: 'text-sm font-bold text-slate-300 mt-2 mb-1',
              6: 'text-xs font-bold text-slate-400 mt-2 mb-1 uppercase tracking-wider',
            }
            const Tag = `h${level}`
            elements.push(
              <Tag key={i} className={headingClasses[level]}>
                {parseInline(text)}
              </Tag>
            )
            continue
          }

          // Blockquote
          const quoteMatch = trimmed.match(/^>\s+(.*)/)
          if (quoteMatch) {
            flushList(i)
            elements.push(
              <blockquote key={i} className="border-l-4 border-slate-700 bg-slate-900/60 px-4 py-2.5 rounded-r-xl my-4 text-slate-400 italic">
                {parseInline(quoteMatch[1])}
              </blockquote>
            )
            continue
          }

          // Horizontal rule
          if (trimmed === '---' || trimmed === '***') {
            flushList(i)
            elements.push(<hr key={i} className="my-6 border-slate-800" />)
            continue
          }

          // Regular paragraph
          flushList(i)
          elements.push(
            <p key={i} className="my-2.5 text-slate-350 leading-relaxed">
              {parseInline(trimmed)}
            </p>
          )
        }

        flushList(lines.length)
        return <div key={index} className="markdown-block">{elements}</div>
      })}
    </div>
  )
}
