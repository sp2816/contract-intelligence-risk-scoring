// src/components/layout/PageTransition.jsx
// ──────────────────────────────────────────────────────────────────────────────
// Wraps routed page content with a smooth fade-in + slide-up entrance.
//
// KEY FIX: exposes a `chartReady` flag via React context.  Pages that contain
// Recharts charts should gate their chart rendering behind `useChartReady()`.
// This guarantees chart animations ALWAYS play after the page is fully visible.
// ──────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// ── Context ───────────────────────────────────────────────────────────────────

const ChartReadyContext = createContext(false)

/** Returns true once the page-enter transition has finished. */
export function useChartReady() {
  return useContext(ChartReadyContext)
}

// ── How long the page-enter CSS animation takes (ms) ─────────────────────────
// Must match the `animate-page-enter` Tailwind animation duration.
const PAGE_ENTER_DURATION_MS = 220

function PageTransition({ children }) {
  const location = useLocation()
  const [renderKey, setRenderKey]     = useState(location.pathname)
  const [chartReady, setChartReady]   = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    // New route detected — reset chart gate immediately
    setChartReady(false)
    setRenderKey(location.pathname)

    // Clear any pending timer from a previous navigation
    if (timerRef.current) clearTimeout(timerRef.current)

    // Unlock charts after the CSS transition completes
    timerRef.current = setTimeout(() => {
      setChartReady(true)
    }, PAGE_ENTER_DURATION_MS + 50) // +50ms grace buffer

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [location.pathname])

  return (
    <ChartReadyContext.Provider value={chartReady}>
      <div key={renderKey} className="animate-page-enter w-full">
        {children}
      </div>
    </ChartReadyContext.Provider>
  )
}

export default PageTransition
