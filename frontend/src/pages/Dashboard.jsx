import React, { useState, useMemo } from 'react'
import { TrendingUp, AlertCircle, CheckCircle, BarChart3, Activity, Zap } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Sample data
const riskTrendData = [
  { month: 'Jan', avgRisk: 65, contracts: 12 },
  { month: 'Feb', avgRisk: 58, contracts: 15 },
  { month: 'Mar', avgRisk: 52, contracts: 18 },
  { month: 'Apr', avgRisk: 48, contracts: 22 },
  { month: 'May', avgRisk: 45, contracts: 25 },
  { month: 'Jun', avgRisk: 42, contracts: 28 },
]

const recentContractData = [
  { id: 1, name: 'Service Agreement - Acme Corp', date: '2024-06-10', riskScore: 28, status: 'Reviewed', category: 'Service' },
  { id: 2, name: 'NDA - Tech Ventures Inc', date: '2024-06-09', riskScore: 15, status: 'Approved', category: 'Legal' },
  { id: 3, name: 'License Agreement - DataFlow Ltd', date: '2024-06-08', riskScore: 62, status: 'Pending', category: 'License' },
  { id: 4, name: 'Partnership Agreement - Global Solutions', date: '2024-06-07', riskScore: 45, status: 'Under Review', category: 'Partnership' },
  { id: 5, name: 'Employment Contract - Internal', date: '2024-06-06', riskScore: 12, status: 'Approved', category: 'HR' },
]

const activityData = [
  { id: 1, event: 'AI Analysis Complete', contract: 'Service Agreement - Acme Corp', time: '2 hours ago', icon: 'check' },
  { id: 2, event: 'High Risk Alert', contract: 'License Agreement - DataFlow Ltd', time: '4 hours ago', icon: 'alert' },
  { id: 3, event: 'Contract Reviewed', contract: 'NDA - Tech Ventures Inc', time: '6 hours ago', icon: 'check' },
  { id: 4, event: 'Insights Generated', contract: 'Partnership Agreement', time: '8 hours ago', icon: 'zap' },
  { id: 5, event: 'AI Processing Started', contract: 'Employment Contract', time: '10 hours ago', icon: 'activity' },
]

const aiInsights = [
  { title: 'Liability Clauses', description: 'Found 3 potential liability issues across recent contracts', icon: 'alert', severity: 'high' },
  { title: 'Payment Terms', description: 'Identified 5 contracts with unusual payment schedules', icon: 'zap', severity: 'medium' },
  { title: 'Termination Rights', description: 'All reviewed contracts have standard termination clauses', icon: 'check', severity: 'low' },
]

// Metric Widget Component
function MetricWidget({ title, value, change, icon: Icon, color }) {
  const isPositive = change >= 0
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-dark-soft transition-all duration-300 hover:shadow-dark-glow dark:from-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-700/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">{title}</h3>
          <div className={`rounded-lg p-2 ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <p className="text-4xl font-bold text-white">{value}</p>
          <p className={`mt-1 text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{change}% from last month
          </p>
        </div>
      </div>
    </div>
  )
}

// Chart Card Component
function ChartCard({ title, description, children }) {
  return (
    <div className="animate-slide-up rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-dark-soft transition-all duration-300 hover:border-slate-600 dark:from-slate-800 dark:to-slate-900">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// Recent Contracts Table
function RecentContractsTable() {
  const getRiskColor = (score) => {
    if (score >= 60) return 'text-red-400 bg-red-900/20'
    if (score >= 40) return 'text-yellow-400 bg-yellow-900/20'
    return 'text-emerald-400 bg-emerald-900/20'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-400 bg-emerald-900/20'
      case 'Pending':
        return 'text-yellow-400 bg-yellow-900/20'
      case 'Under Review':
        return 'text-blue-400 bg-blue-900/20'
      default:
        return 'text-slate-400 bg-slate-700/20'
    }
  }

  return (
    <ChartCard title="Recent Contracts" description="Latest contract analyses and risk assessments">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Contract</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Risk Score</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentContractData.map((contract) => (
              <tr key={contract.id} className="border-b border-slate-700/50 transition-colors hover:bg-slate-800/50">
                <td className="px-4 py-4 text-sm font-medium text-slate-200">{contract.name}</td>
                <td className="px-4 py-4 text-sm text-slate-400">{contract.date}</td>
                <td className="px-4 py-4 text-sm text-slate-400">{contract.category}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRiskColor(contract.riskScore)}`}>
                    {contract.riskScore}%
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(contract.status)}`}>
                    {contract.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartCard>
  )
}

// Activity Timeline
function ActivityTimeline() {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'check':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case 'zap':
        return <Zap className="h-5 w-5 text-yellow-400" />
      case 'activity':
        return <Activity className="h-5 w-5 text-blue-400" />
      default:
        return <Activity className="h-5 w-5 text-slate-400" />
    }
  }

  return (
    <ChartCard title="Activity Timeline" description="Recent contract processing and analysis events">
      <div className="space-y-4">
        {activityData.map((item, index) => (
          <div key={item.id} className="flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/50">
                {getActivityIcon(item.icon)}
              </div>
              {index !== activityData.length - 1 && <div className="mt-2 h-8 w-0.5 bg-gradient-to-b from-slate-600 to-slate-700"></div>}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-slate-200">{item.event}</p>
              <p className="text-xs text-slate-500">{item.contract}</p>
              <p className="mt-1 text-xs text-slate-600">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

// AI Insights Panel
function AIInsightsPanel() {
  const getInsightColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/30 bg-red-900/10'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-900/10'
      case 'low':
        return 'border-emerald-500/30 bg-emerald-900/10'
      default:
        return 'border-slate-500/30 bg-slate-900/10'
    }
  }

  const getInsightIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="h-5 w-5" />
      case 'check':
        return <CheckCircle className="h-5 w-5" />
      case 'zap':
        return <Zap className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  return (
    <ChartCard title="AI Insights" description="Intelligent analysis and recommendations from contract reviews">
      <div className="space-y-3">
        {aiInsights.map((insight, index) => (
          <div key={index} className={`flex gap-4 rounded-xl border p-4 transition-all duration-300 hover:border-opacity-50 ${getInsightColor(insight.severity)}`}>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              insight.severity === 'high' ? 'text-red-400' : insight.severity === 'medium' ? 'text-yellow-400' : 'text-emerald-400'
            }`}>
              {getInsightIcon(insight.icon)}
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-200">{insight.title}</p>
              <p className="mt-1 text-sm text-slate-400">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

// Main Dashboard Component
export default function Dashboard() {
  const stats = [
    { title: 'Total Contracts', value: 156, change: 12, icon: BarChart3, color: 'bg-blue-600' },
    { title: 'Contracts Analyzed', value: 142, change: 28, icon: CheckCircle, color: 'bg-emerald-600' },
    { title: 'Avg Risk Score', value: '38%', change: -15, icon: TrendingUp, color: 'bg-purple-600' },
    { title: 'High Risk Alerts', value: 8, change: -25, icon: AlertCircle, color: 'bg-red-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Contract Intelligence
            </h1>
            <p className="mt-3 text-slate-400">AI-powered risk scoring and contract analysis</p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} style={{ animationDelay: `${index * 100}ms` }} className="animate-slide-up">
                <MetricWidget {...stat} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Risk Trend Chart */}
          <ChartCard 
            title="Risk Trend Analysis" 
            description="Average risk score and contract volume over the past 6 months"
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={riskTrendData}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="avgRisk" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRisk)" name="Avg Risk Score" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Two Column Layout */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Contracts */}
            <RecentContractsTable />

            {/* AI Insights */}
            <AIInsightsPanel />
          </div>

          {/* Activity Timeline */}
          <ActivityTimeline />
        </div>
      </div>
    </div>
  )
}
