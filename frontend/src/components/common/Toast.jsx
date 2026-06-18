import { useState, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'

/**
 * Toast notification component + hook.
 *
 * Usage:
 *   const { toasts, addToast, ToastContainer } = useToast()
 *   addToast('Account created!', 'success')
 *   // Render <ToastContainer /> once at root level
 */

let nextId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
      }
      return id
    },
    [removeToast],
  )

  function ToastContainer() {
    if (toasts.length === 0) return null

    return (
      <div className="fixed right-4 top-4 z-[9999] flex flex-col gap-3 sm:right-6 sm:top-6"
           role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    )
  }

  return { toasts, addToast, removeToast, ToastContainer }
}

// ─── Appearance maps ──────────────────────────────────────────────────────────

const ICON_MAP = {
  success: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

const STYLE_MAP_DARK = {
  success: 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200 shadow-emerald-500/10',
  error:   'border-rose-500/30 bg-rose-950/80 text-rose-200 shadow-rose-500/10',
  warning: 'border-amber-500/30 bg-amber-950/80 text-amber-200 shadow-amber-500/10',
  info:    'border-sky-500/30 bg-sky-950/80 text-sky-200 shadow-sky-500/10',
}

const STYLE_MAP_LIGHT = {
  success: 'border-emerald-500/30 bg-emerald-100 text-emerald-800 shadow-emerald-200',
  error:   'border-rose-500/30 bg-rose-100 text-rose-800 shadow-rose-200',
  warning: 'border-amber-500/30 bg-amber-100 text-amber-800 shadow-amber-200',
  info:    'border-sky-500/30 bg-sky-100 text-sky-800 shadow-sky-200',
}

const PROGRESS_MAP_DARK = {
  success: 'bg-emerald-400',
  error:   'bg-rose-400',
  warning: 'bg-amber-400',
  info:    'bg-sky-400',
}

const PROGRESS_MAP_LIGHT = {
  success: 'bg-emerald-400',
  error:   'bg-rose-400',
  warning: 'bg-amber-400',
  info:    'bg-sky-400',
}

// ─── ToastItem ────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }) {
  const { message, type = 'info' } = toast
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const styleMap = isDark ? STYLE_MAP_DARK : STYLE_MAP_LIGHT
  const progressMap = isDark ? PROGRESS_MAP_DARK : PROGRESS_MAP_LIGHT

  return (
    <div
      className={`relative flex w-80 items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl transition-all duration-300 animate-slide-in-right ${styleMap[type] ?? styleMap.info}`}
      role="alert"
    >
      <span className="mt-0.5">{ICON_MAP[type] ?? ICON_MAP.info}</span>
      <p className="flex-1 text-sm leading-relaxed">{message}</p>
      <button
        onClick={onDismiss}
        className="mt-0.5 shrink-0 rounded-full p-0.5 opacity-60 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* animated progress bar */}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 ${progressMap[type] ?? progressMap.info} origin-left`}
        style={{ animation: 'shrinkBar 5s linear forwards' }}
      />
    </div>
  )
}

export default useToast
