// src/components/layout/NavigationProgress.jsx
// ──────────────────────────────────────────────────────────────────────────────
// A sleek top-of-page progress bar that animates during client-side route
// transitions.  Inspired by NProgress / YouTube's red loading strip.
//
// How it works
//   1. On `location` change  →  bar starts at 0 %, ramps quickly to ~85 %
//   2. After a configurable "minimum visible" delay  →  bar completes to 100 %
//   3. After completing  →  bar fades out and resets
//
// The component is entirely CSS-driven (no extra dependencies).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

// ─── Tunables ────────────────────────────────────────────────────────────────
const MIN_VISIBLE_MS = 320      // minimum time the bar stays visible
const COMPLETE_DELAY_MS = 280   // pause at 100 % before hiding
const TICK_MS = 200             // interval between incremental advances

function NavigationProgress() {
  const location = useLocation()
  const [progress, setProgress] = useState(0)     // 0-100
  const [visible, setVisible] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const tickRef = useRef(null)
  const hideRef = useRef(null)
  const prevPathRef = useRef(location.pathname + location.search)

  // ── Clear all timers ──────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    if (hideRef.current) clearTimeout(hideRef.current)
    tickRef.current = null
    hideRef.current = null
  }, [])

  // ── Start loading ─────────────────────────────────────────────────────────
  const start = useCallback(() => {
    cleanup()
    setIsComplete(false)
    setProgress(15) // instant jump to 15 %
    setVisible(true)

    // Incrementally advance — slow down as we approach 85 %
    tickRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev
        const remaining = 85 - prev
        const step = Math.max(0.5, remaining * 0.12)
        return Math.min(prev + step, 85)
      })
    }, TICK_MS)
  }, [cleanup])

  // ── Finish loading ────────────────────────────────────────────────────────
  const finish = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current)
    tickRef.current = null

    setProgress(100)
    setIsComplete(true)

    hideRef.current = setTimeout(() => {
      setVisible(false)
      // After fade-out transition, reset
      setTimeout(() => {
        setProgress(0)
        setIsComplete(false)
      }, 300) // matches CSS opacity transition
    }, COMPLETE_DELAY_MS)
  }, [])

  // ── React to location changes ─────────────────────────────────────────────
  useEffect(() => {
    const currentPath = location.pathname + location.search
    if (currentPath === prevPathRef.current) return // same path, skip

    prevPathRef.current = currentPath
    start()

    // Simulate the "page ready" after min-visible + small buffer
    const readyTimer = setTimeout(() => {
      finish()
    }, MIN_VISIBLE_MS)

    return () => {
      clearTimeout(readyTimer)
      cleanup()
    }
  }, [location, start, finish, cleanup])

  if (!visible && progress === 0) return null

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ height: '3px' }}
    >
      {/* Track */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: 'transparent',
        }}
      />

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #818cf8, #6366f1, #a78bfa)',
          borderRadius: '0 2px 2px 0',
          transition: isComplete
            ? 'width 200ms ease-out, opacity 300ms ease-out 200ms'
            : 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: visible ? 1 : 0,
          boxShadow: '0 0 12px rgba(99, 102, 241, 0.5), 0 0 4px rgba(99, 102, 241, 0.3)',
        }}
      />

      {/* Pulsing glow dot at the tip */}
      {visible && !isComplete && (
        <div
          style={{
            position: 'absolute',
            top: '-1px',
            right: `${100 - progress}%`,
            width: '80px',
            height: '5px',
            background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6))',
            borderRadius: '0 2px 2px 0',
            transform: 'rotate(0deg)',
            animation: 'navProgressPulse 1.5s ease-in-out infinite',
          }}
        />
      )}
    </div>
  )
}

export default NavigationProgress
