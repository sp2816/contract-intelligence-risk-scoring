// src/pages/Analytics.jsx
// ──────────────────────────────────────────────────────────────────────────────
// Advanced Analytics Visualization System — AI Startup Grade
//
// Charts: Line, Pie, Bar, Area (all Recharts, all responsive, all animated)
// Sections:
//   1. KPI Summary Cards (animated counters)
//   2. Risk Score Distribution (Bar Chart)
//   3. Monthly Trends (Area + Line hybrid)
//   4. Clause Intelligence (Pie + Legend)
//   5. Risk Velocity (Line Chart — rate of change)
//   6. Contract Pipeline (Horizontal Bar)
//   7. Compliance Heatmap (custom grid)
//
// FIX: Charts are gated behind useChartReady() from PageTransition context.
//      This ensures Recharts animations ALWAYS fire after the page is visible.
//      KPI values are gated behind loading === false to prevent data flicker.
// ──────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, Shield, FileText, CheckCircle, AlertTriangle,
  BarChart3, Activity, Zap, Eye, Clock, ArrowUpRight,
  ArrowDownRight, Minus, Sparkles, Target,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts'
import { fetchDashboardStats, listContracts, fetchClauseStats, fetchHeatmap, fetchInsight } from '../api/contracts'
import { useChartReady } from '../components/layout/PageTransition'

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────────────────────

const PALETTE = {
  emerald: { main: '#10b981', light: '#34d399', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
  amber: { main: '#f59e0b', light: '#fbbf24', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  rose: { main: '#f43f5e', light: '#fb7185', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)' },
  blue: { main: '#3b82f6', light: '#60a5fa', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
  violet: { main: '#8b5cf6', light: '#a78bfa', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)' },
  cyan: { main: '#06b6d4', light: '#22d3ee', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' },
  slate: { main: '#64748b', light: '#94a3b8', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.2)' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated Counter — only starts counting once value is valid
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = '', prefix = '', duration = 1000 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (value == null || isNaN(value)) return
    const target = Number(value)
    const startTime = performance.now()

    function tick(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4) // easeOutQuart
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  return <>{prefix}{count}{suffix}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Loaders
// ─────────────────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6">
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="h-3 w-24 rounded-full bg-slate-800" />
          <div className="h-8 w-8 rounded-lg bg-slate-800" />
        </div>
        <div className="h-8 w-16 rounded-lg bg-slate-800" />
        <div className="h-2 w-32 rounded-full bg-slate-800/50" />
      </div>
    </div>
  )
}

function SkeletonChart({ height = 300 }) {
  return (
    <div className="animate-pulse">
      <div className="rounded-xl bg-slate-800/40" style={{ height }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Panel Card
// ─────────────────────────────────────────────────────────────────────────────

function ChartPanel({ title, subtitle, icon: Icon, iconColor, children, className = '', badge }) {
  return (
    <div className={`group rounded-2xl border border-slate-800/60 bg-gradient-to-br
      from-slate-900/80 to-slate-900/40 p-6 backdrop-blur-sm transition-all duration-500
      hover:border-slate-700/80 hover:shadow-lg hover:shadow-slate-950/50 ${className}`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: iconColor ? `${iconColor}12` : PALETTE.blue.bg, border: `1px solid ${iconColor || PALETTE.blue.main}25` }}
            >
              <Icon className="h-4 w-4" style={{ color: iconColor || PALETTE.blue.main }} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
            {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="rounded-lg bg-slate-800/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-700/80 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 6px ${entry.color}60` }} />
          <span className="text-xs text-slate-400">{entry.name}</span>
          <span className="ml-auto text-xs font-bold text-white">{entry.value}{typeof entry.value === 'number' && entry.name?.toLowerCase().includes('risk') ? '%' : ''}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Metric Card
// ─────────────────────────────────────────────────────────────────────────────

function KPICard({ label, value, suffix = '', trend, trendLabel, icon: Icon, color, delay = 0 }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-800/60
        bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-5 backdrop-blur-sm
        transition-all duration-500 hover:border-slate-700/80 hover:shadow-lg hover:shadow-slate-950/50
        animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow accent */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0
          transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }}
      />

      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${color}12`, border: `1px solid ${color}25` }}
          >
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>

        <p className="text-3xl font-extrabold tracking-tight text-white">
          <AnimatedCounter value={value} suffix={suffix} />
        </p>

        {trend != null && (
          <div className="mt-2 flex items-center gap-1.5">
            {trend > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
            ) : trend < 0 ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
            ) : (
              <Minus className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-slate-500'}`}>
              {Math.abs(trend)}%
            </span>
            <span className="text-[10px] text-slate-600">{trendLabel || 'vs last month'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Compliance Heatmap
// ─────────────────────────────────────────────────────────────────────────────

const COMPLIANCE_AREAS = [
  { name: 'Data Privacy', key: 'privacy' },
  { name: 'IP Protection', key: 'ip' },
  { name: 'Liability Caps', key: 'liability' },
  { name: 'Termination', key: 'termination' },
  { name: 'Force Majeure', key: 'force_majeure' },
  { name: 'Indemnification', key: 'indemnity' },
]

function ComplianceHeatmap({ data }) {
  
  const getHeatColor = (score) => {
    if (score <= 30) return { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' }
    if (score <= 70) return { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' }
    return { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', text: '#fb7185' }
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {data.map((item, i) => {
        const colors = getHeatColor(item.score)
        return (
          <div
            key={item.key}
            className="group rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: colors.bg, borderColor: colors.border, animationDelay: `${i * 80}ms` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.name}</p>
            {item.clauses === 0 ? (

              <div className="mt-3">
                  <p className="text-sm font-semibold text-slate-500">
                      No clauses
                  </p>
                  <p className="text-xs text-slate-600">
                      analyzed
                  </p>
              </div>

          ) : (

              <>
                  <p className="mt-2 text-2xl font-bold text-white">
                      {item.score}%
                  </p>

                  <p className="text-xs text-slate-400">
                      {item.risk} Risk
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                      {item.clauses} clause{item.clauses !== 1 ? "s" : ""}
                  </p>
              </>

          )}
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-800/60">
              <div
                className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                style={{ width: `${item.score}%`, backgroundColor: colors.text }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Analytics Component
// ─────────────────────────────────────────────────────────────────────────────

export default function Analytics() {
  // ── Data loading state ─────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [contracts, setContracts] = useState([])
  const [heatmapData, setHeatmapData] = useState([])
  const [clauseIntelligence, setClauseIntelligence] = useState([])
  const [insight, setInsight] = useState("")
  const [showAllClauses, setShowAllClauses] = useState(false)

  // ── Chart gate: true once page-enter transition finishes ───────────────────
  // This is the core fix — charts only mount AFTER the page is fully visible,
  // so their entrance animations always play at full opacity.
  const chartReady = useChartReady()

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [
          statsData,
          listData,
          clauseData,
          heatmap,
          insightData
      ] = await Promise.all([
          fetchDashboardStats(),
          listContracts(),
          fetchClauseStats(),
          fetchHeatmap(),
          fetchInsight()
      ])

      setClauseIntelligence(clauseData)
      setStats(statsData)
      setContracts(listData?.contracts ?? [])
      setHeatmapData(heatmap)
      setInsight(insightData.text)
    } catch (err) {
      console.error('Analytics load error:', err)
      setError(err?.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // ── Computed Data ──────────────────────────────────────────────────────────

  const riskDistribution = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 }
    contracts.forEach(c => {
      if (c.risk_score == null) return
      if (c.risk_score <= 30) counts.low++
      else if (c.risk_score <= 70) counts.medium++
      else counts.high++
    })
    return [
      { name: 'Low (0–30)', value: counts.low, fill: PALETTE.emerald.main },
      { name: 'Medium (31–70)', value: counts.medium, fill: PALETTE.amber.main },
      { name: 'High (71–100)', value: counts.high, fill: PALETTE.rose.main },
    ]
  }, [contracts])

  const monthlyTrends = useMemo(() => {
    const map = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    contracts.forEach(c => {
      if (!c.upload_date) return
      const d = new Date(c.upload_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = months[d.getMonth()]

      if (!map[key]) map[key] = { month: label, uploads: 0, totalScore: 0, scored: 0, ts: d.getTime() }
      map[key].uploads++
      if (c.risk_score != null) { map[key].totalScore += c.risk_score; map[key].scored++ }
    })

    const entries = Object.values(map)
      .sort((a, b) => a.ts - b.ts)
      .slice(-8)
      .map(m => ({ month: m.month, uploads: m.uploads, avgRisk: m.scored > 0 ? Math.round(m.totalScore / m.scored) : null }))

    
    return entries
  }, [contracts])

  const riskVelocity = useMemo(() => {
    if (monthlyTrends.length < 2) return []
    return monthlyTrends.map((m, i) => ({
      month: m.month,
      velocity: i === 0 ? 0 : (m.avgRisk || 0) - (monthlyTrends[i - 1].avgRisk || 0),
      cumulative: m.avgRisk || 0,
    }))
  }, [monthlyTrends])

  const pipelineData = useMemo(() => {
    const statusMap = {}
    contracts.forEach(c => {
      const status = c.status || 'unknown'
      statusMap[status] = (statusMap[status] || 0) + 1
    })
    const statusColors = {
      uploaded: PALETTE.blue.main,
      processing: PALETTE.amber.main,
      analyzed: PALETTE.emerald.main,
      analysis_complete: PALETTE.emerald.main,
      completed: PALETTE.emerald.main,
      reviewed: PALETTE.violet.main,
      approved: PALETTE.cyan.main,
    }
    return Object.entries(statusMap).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
      count,
      fill: statusColors[status.toLowerCase()] || PALETTE.slate.main,
    }))
  }, [contracts])

  // ── KPI Metrics — only derived when loading is complete to prevent flicker ─
  // Using null-guard instead of default 0 so AnimatedCounter starts fresh each time
  const total = loading ? null : (stats?.total_contracts ?? 0)
  const analyzed = loading ? null : (stats?.analyzed_count ?? 0)
  const avgRisk = loading ? null : Math.round(stats?.avg_risk_score ?? 0)
  const highRisk = loading ? null : (stats?.high_risk_count ?? 0)

  // ── Error State ────────────────────────────────────────────────────────────

  if (error && !loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-rose-500/20 bg-rose-950/10 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-rose-400" />
          <h3 className="text-lg font-bold text-rose-300">Analytics Unavailable</h3>
          <p className="mt-2 text-sm text-rose-400/80">{error}</p>
          <button
            onClick={loadData}
            className="mt-6 rounded-xl bg-rose-500/20 px-6 py-2.5 text-sm font-semibold text-rose-300
              transition hover:bg-rose-500/30 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Whether to show chart content (both data loaded AND transition done) ───
  const showCharts = !loading && chartReady

  return (
    <div className="space-y-8 pb-12">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-500">
              Intelligence Suite
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Contract Analytics
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
            Real-time insights across your contract portfolio. AI-powered risk scoring, clause intelligence, and compliance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          <Clock className="h-3 w-3" />
          <span className="uppercase tracking-wider">
            Last updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <KPICard label="Total Contracts" value={total} icon={FileText} color={PALETTE.blue.main} trend={12} delay={0} />
            <KPICard label="Analyzed" value={analyzed} icon={CheckCircle} color={PALETTE.emerald.main} trend={8} trendLabel="completion rate" delay={80} />
            <KPICard label="Avg Risk Score" value={avgRisk} suffix="%" icon={Target} color={PALETTE.amber.main} trend={-3} trendLabel="vs last quarter" delay={160} />
            <KPICard label="High Risk Flags" value={highRisk} icon={ShieldAlert} color={PALETTE.rose.main} trend={highRisk > 0 ? 5 : 0} delay={240} />
          </>
        )}
      </div>

      {/* ── Row 1: Risk Distribution (Bar) + Clause Intelligence (Pie) ─ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Bar Chart — Risk Distribution */}
        <ChartPanel
          title="Risk Score Distribution"
          subtitle="Contract breakdown by risk classification"
          icon={BarChart3}
          iconColor={PALETTE.emerald.main}
          badge="Bar Chart"
        >
          {!showCharts ? <SkeletonChart height={280} /> : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                  <Bar dataKey="value" name="Contracts" radius={[8, 8, 0, 0]}
                    animationBegin={0} animationDuration={1400} animationEasing="ease-out"
                  >
                    {riskDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        {/* Pie Chart — Clause Intelligence */}
        <ChartPanel
          title="Clause Intelligence"
          subtitle="Most frequently flagged clause categories"
          icon={Eye}
          iconColor={PALETTE.violet.main}
          badge="Pie Chart"
        >
          {!showCharts ? <SkeletonChart height={280} /> : (
            <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col xl:flex-row sm:gap-6 lg:gap-4 xl:gap-6">
              <div className="relative">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie
                      data={clauseIntelligence}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1400}
                      animationEasing="ease-out"
                      strokeWidth={0}
                    >
                      {clauseIntelligence.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-white">{clauseIntelligence.reduce((sum, c) => sum + c.value, 0)}</span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500">clauses</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pl-10">
                {clauseIntelligence.slice(0, 5).map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }} />
                    <div>
                      <p className="text-l font-semibold text-slate-300">{item.name}</p>
                      <p className="text-[10px] text-slate-600">{item.value} clause{item.value !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
                {clauseIntelligence.length > 5 && (
                  <button
                    onClick={() => setShowAllClauses(true)}
                    className="mt-3 text-xs font-semibold text-brand-500 hover:text-brand-400 transition"
                  >
                    Show all ({clauseIntelligence.length})
                  </button>
                )}
              </div>
            </div>
          )}
          {showAllClauses && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

              <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl max-h-[420px] overflow-y-auto">

                <div className="mb-5 flex items-center justify-between">

                  <h2 className="text-xl font-bold text-white">
                    All Clause Categories
                  </h2>

                  <button
                    onClick={() => setShowAllClauses(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    ✕
                  </button>

                </div>

                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-2">

                  {clauseIntelligence.map((item) => (

                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">

                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />

                        <span className="text-sm text-white">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-sm font-semibold text-slate-400">
                        {item.value}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>
          )}
        </ChartPanel>
      </div>

      {/* ── Row 2: Monthly Trends (Area) + Risk Velocity (Line) ────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Area Chart — Monthly Trends */}
        <ChartPanel
          title="Upload Activity & Risk Trends"
          subtitle="Contract volume and average risk over time"
          icon={Activity}
          iconColor={PALETTE.blue.main}
          badge="Area Chart"
        >
          {!showCharts ? <SkeletonChart height={300} /> : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="gradUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.blue.main} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={PALETTE.blue.main} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={PALETTE.rose.main} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={PALETTE.rose.main} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="uploads" name="Uploads" stroke={PALETTE.blue.main} fill="url(#gradUploads)" strokeWidth={2.5} animationBegin={0} animationDuration={1400} />
                  <Area type="monotone" dataKey="avgRisk" name="Avg Risk %" stroke={PALETTE.rose.main} fill="url(#gradRisk)" strokeWidth={2.5} connectNulls animationBegin={0} animationDuration={1700} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        {/* Line Chart — Risk Velocity */}
        <ChartPanel
          title="Risk Velocity"
          subtitle="Rate of risk score change month-over-month"
          icon={TrendingUp}
          iconColor={PALETTE.amber.main}
          badge="Line Chart"
        >

          {!showCharts ? (
              <SkeletonChart height={300} />
          ) : riskVelocity.length < 2 ? (

              <div className="flex h-[300px] flex-col items-center justify-center text-center">

                  <TrendingUp className="mb-4 h-12 w-12 text-slate-600" />

                  <h3 className="text-lg font-semibold text-slate-300">
                      Not enough historical data
                  </h3>

                  <p className="mt-2 max-w-xs text-sm text-slate-500">
                      Risk Velocity compares month-to-month changes.
                      Analyze contracts over at least two different months
                      to view this trend.
                  </p>

              </div>

          ) : (

              <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={riskVelocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="velocity" name="Risk Change (Δ)" stroke={PALETTE.amber.main} strokeWidth={2.5} dot={{ fill: PALETTE.amber.main, r: 4, strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, strokeWidth: 3 }} animationBegin={0} animationDuration={1400} />
                  <Line type="monotone" dataKey="cumulative" name="Cumulative Risk %" stroke={PALETTE.violet.main} strokeWidth={2} strokeDasharray="5 5" dot={false} animationBegin={0} animationDuration={1700} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}         
        </ChartPanel>
      </div>

      {/* ── Row 3: Pipeline (Horizontal Bar) + Compliance Heatmap ──── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Horizontal Bar — Contract Pipeline */}
        <ChartPanel
          title="Contract Pipeline"
          subtitle="Distribution by processing status"
          icon={Zap}
          iconColor={PALETTE.cyan.main}
          badge="Bar Chart"
        >
          {!showCharts ? <SkeletonChart height={260} /> : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical" barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="status" stroke="#475569" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.05)' }} />
                  <Bar dataKey="count" name="Contracts" radius={[0, 6, 6, 0]} animationBegin={0} animationDuration={1400}>
                    {pipelineData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartPanel>

        {/* Compliance Heatmap */}
        <ChartPanel
          title="Compliance Risk Heatmap"
          subtitle="AI-assessed risk across compliance domains"
          icon={Shield}
          iconColor={PALETTE.emerald.main}
          badge="Heatmap"
        >
          {!showCharts ? <SkeletonChart height={260} /> : (
            <ComplianceHeatmap data={heatmapData} />
          )}
        </ChartPanel>
      </div>

      {/* ── Footer Insight Banner ──────────────────────────────────────── */}
      {!loading && (
        <div className="animate-slide-up rounded-2xl border border-slate-700 bg-slate-900/70 shadow-lg shadow-slate-950/40 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
              <Sparkles className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">AI Insight</h4>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {insight}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
