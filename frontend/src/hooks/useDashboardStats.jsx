// src/hooks/useDashboardStats.jsx
// ──────────────────────────────────────────────────────────────────────────────
// Custom hook that fetches all data needed by the Dashboard page.
//
// Features
//   • Parallel fetch: stats + full contracts list (for trend chart)
//   • Exponential back-off retry (up to 3 attempts, retries on network / 5xx)
//   • Provides { stats, contracts, loading, error, retry }
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { fetchDashboardStats, listContracts } from '../api/contracts'

// ── Retry Configuration ───────────────────────────────────────────────────────

/** HTTP status codes that warrant a retry (transient errors). */
const RETRYABLE_STATUS = new Set([0, 429, 500, 502, 503, 504])

const MAX_ATTEMPTS  = 3
const BASE_DELAY_MS = 600   // first retry after 600 ms
const MAX_DELAY_MS  = 8000  // cap at 8 s

/**
 * Wraps an async function with exponential back-off retry.
 *
 * @template T
 * @param {() => Promise<T>} fn
 * @param {number} [maxAttempts]
 * @returns {Promise<T>}
 */
async function withRetry(fn, maxAttempts = MAX_ATTEMPTS) {
  let lastErr

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err

      const isLastAttempt = attempt === maxAttempts
      const isRetryable   = RETRYABLE_STATUS.has(err?.status ?? 0)

      if (isLastAttempt || !isRetryable) throw err

      // Exponential back-off: 600 → 1200 → 2400 … capped at MAX_DELAY_MS
      // ±20 % random jitter to spread concurrent retries
      const base  = BASE_DELAY_MS * 2 ** (attempt - 1)
      const jitter = base * 0.2 * (Math.random() - 0.5)
      const delay  = Math.min(base + jitter, MAX_DELAY_MS)

      console.warn(
        `[useDashboardStats] Attempt ${attempt}/${maxAttempts} failed ` +
        `(status=${err?.status ?? 0}). Retrying in ${Math.round(delay)} ms…`
      )

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastErr
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Fetches dashboard KPI stats and full contract list in parallel.
 *
 * @returns {{
 *   stats:     object | null,
 *   contracts: object[],
 *   loading:   boolean,
 *   error:     string | null,
 *   retry:     () => void
 * }}
 */
export function useDashboardStats() {
  const [stats,     setStats]     = useState(null)
  const [contracts, setContracts] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch both endpoints in parallel; both are independently retried.
      const [statsData, contractsData] = await Promise.all([
        withRetry(() => fetchDashboardStats()),
        withRetry(() => listContracts()),
      ])

      setStats(statsData)
      setContracts(contractsData?.contracts ?? [])
    } catch (err) {
      const message =
        err?.message ||
        'Failed to load dashboard data. Please check your connection and try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    load()
  }, [load])

  return { stats, contracts, loading, error, retry: load }
}

export default useDashboardStats
