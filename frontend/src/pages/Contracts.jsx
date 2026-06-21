import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Eye, Play, Trash2, Loader2, X, FileText, CheckCircle,
  AlertTriangle, TrendingUp, HelpCircle, Download, ExternalLink, Calendar, Layers, Activity
} from 'lucide-react'
import { listContracts, deleteContract, analyzeContract, getContractDetails } from '../api/contracts'
import { useTheme } from '../context/ThemeContext'

// --- Constants & Styles ---
const HIGH_RISK_THRESHOLD = 60

function getRiskLevel(score) {
  if (score == null) return 'pending'
  if (score >= HIGH_RISK_THRESHOLD) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

function getRiskStyle(score) {
  if (score == null) return 'text-slate-400 bg-slate-700/20 border-slate-700/30'
  if (score >= HIGH_RISK_THRESHOLD) return 'text-rose-450 bg-rose-950/20 border-rose-900/30'
  if (score >= 40) return 'text-amber-450 bg-amber-950/20 border-amber-900/30'
  return 'text-emerald-450 bg-emerald-950/20 border-emerald-900/30'
}

function getStatusStyle(status) {
  switch (status?.toLowerCase()) {
    case 'analyzed':
    case 'approved':
    case 'completed':
    case 'analysis_complete':
      return 'text-emerald-450 bg-emerald-950/20 border-emerald-900/30'
    case 'processing':
    case 'analyzing':
      return 'text-yellow-450 bg-yellow-950/20 border-yellow-900/30'
    case 'uploaded':
      return 'text-blue-450 bg-blue-950/20 border-blue-900/30'
    case 'reviewed':
      return 'text-purple-450 bg-purple-950/20 border-purple-900/30'
    default:
      return 'text-slate-400 bg-slate-750/20 border-slate-700/30'
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function Contracts() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  // --- States ---
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')

  // Sorting
  const [sortField, setSortField] = useState('upload_date')
  const [sortOrder, setSortOrder] = useState('desc') // 'asc' | 'desc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Actions states
  const [analyzingId, setAnalyzingId] = useState(null)
  
  // Delete modal
  const [deletingContract, setDeletingContract] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // View drawer
  const [selectedContractId, setSelectedContractId] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  // Fetch contracts
  const fetchList = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await listContracts()
      setContracts(res?.contracts || [])
    } catch (err) {
      setError(err?.message || 'Failed to fetch contracts.')
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchList()
  }, [])

  // --- Actions ---
  const handleDelete = async () => {
    if (!deletingContract) return
    setIsDeleting(true)
    try {
      await deleteContract(deletingContract.id)
      setContracts(prev => prev.filter(c => c.id !== deletingContract.id))
      setDeletingContract(null)
      // Close detail drawer if the deleted contract was open
      if (selectedContractId === deletingContract.id) {
        setSelectedContractId(null)
        setDetailData(null)
      }
    } catch (err) {
      alert(err?.message || 'Failed to delete contract.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAnalyze = async (e, id) => {
    e.stopPropagation()
    setAnalyzingId(id)
    try {
      const res = await analyzeContract(id)
      // Update local contract in state
      setContracts(prev => prev.map(c => c.id === id ? res.contract : c))
      // If the current drawer details is this contract, refresh it
      if (selectedContractId === id) {
        loadDetails(id)
      }
    } catch (err) {
      alert(err?.message || 'Failed to analyze contract.')
    } finally {
      setAnalyzingId(null)
    }
  }

  const loadDetails = async (id) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      const data = await getContractDetails(id)
      setDetailData(data)
    } catch (err) {
      setDetailError(err?.message || 'Failed to load contract details.')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleOpenView = (id) => {
    setSelectedContractId(id)
    setDetailData(null)
    loadDetails(id)
  }

  const handleCloseView = () => {
    setSelectedContractId(null)
    setDetailData(null)
  }

  // --- Filtering and Sorting Logic ---
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      // Search
      const name = (c.original_filename || c.filename || '').toLowerCase()
      if (searchTerm && !name.includes(searchTerm.toLowerCase())) return false

      // Status Filter
      const status = (c.status || '').toLowerCase()
      if (statusFilter !== 'all') {
        if (statusFilter === 'analyzed') {
          if (!['analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'].includes(status)) return false
        } else if (statusFilter === 'processing') {
          if (!['processing', 'analyzing'].includes(status)) return false
        } else if (statusFilter === 'uploaded') {
          if (status !== 'uploaded') return false
        }
      }

      // Risk Filter
      if (riskFilter !== 'all') {
        const rLevel = getRiskLevel(c.risk_score)
        if (rLevel !== riskFilter) return false
      }

      return true
    })
  }, [contracts, searchTerm, statusFilter, riskFilter])

  // Sorting
  const sortedContracts = useMemo(() => {
    const list = [...filteredContracts]
    list.sort((a, b) => {
      let valA, valB

      if (sortField === 'name') {
        valA = (a.original_filename || a.filename || '').toLowerCase()
        valB = (b.original_filename || b.filename || '').toLowerCase()
      } else if (sortField === 'upload_date') {
        valA = a.upload_date ? new Date(a.upload_date).getTime() : 0
        valB = b.upload_date ? new Date(b.upload_date).getTime() : 0
      } else if (sortField === 'risk_score') {
        valA = a.risk_score != null ? a.risk_score : -1
        valB = b.risk_score != null ? b.risk_score : -1
      } else if (sortField === 'status') {
        valA = (a.status || '').toLowerCase()
        valB = (b.status || '').toLowerCase()
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [filteredContracts, sortField, sortOrder])

  // Pagination bounds
  const totalCount = sortedContracts.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedContracts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedContracts.slice(start, start + pageSize)
  }, [sortedContracts, currentPage, pageSize])

  // Adjust current page if filter shrinks total rows
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // --- Skeletons ---
  const SkeletonRow = () => (
    <tr className="border-b border-slate-800/40 animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-700/60" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-700/40" /></td>
      <td className="px-6 py-4"><div className="h-6 w-16 rounded-full bg-slate-700/50" /></td>
      <td className="px-6 py-4"><div className="h-6 w-20 rounded-full bg-slate-700/50" /></td>
      <td className="px-6 py-4"><div className="h-8 w-28 rounded bg-slate-700/40" /></td>
    </tr>
  )

  return (
    <div className="relative flex flex-col gap-6 w-full min-h-[500px]">
      
      {/* Drawer Overlay Backdrop */}
      {selectedContractId && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={handleCloseView}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.24em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Workspace</p>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Contracts Directory</h1>
          <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-1`}>
            Manage, review, and score risk across all active legal documents.
          </p>
        </div>
        <button
          onClick={() => navigate('/contract-analysis')}
          className="rounded-2xl bg-brand-500 hover:bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 self-start sm:self-center"
        >
          Upload New Contract
        </button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className={`rounded-3xl border p-5 shadow-dark-soft backdrop-blur-md transition duration-300 flex flex-col gap-4 ${
        isLight ? 'border-slate-200 bg-white/60' : 'border-slate-800 bg-slate-900/35'
      }`}>
        <div className="grid gap-4 md:grid-cols-12">
          {/* Search bar */}
          <div className="relative md:col-span-6">
            <Search className={`absolute left-3.5 top-3.5 h-4.5 w-4.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search contracts by name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-2xl border py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500/50 ${
                isLight 
                  ? 'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400' 
                  : 'border-slate-800 bg-slate-950/60 text-slate-200 placeholder:text-slate-500'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-2xl border px-3 py-2.5 text-xs outline-none transition cursor-pointer ${
                isLight 
                  ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100' 
                  : 'border-slate-800 bg-slate-950/65 text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="uploaded">Uploaded / Pending</option>
              <option value="processing">Analyzing...</option>
              <option value="analyzed">Analysis Complete</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Risk:</span>
            <select
              value={riskFilter}
              onChange={(e) => { setRiskFilter(e.target.value); setCurrentPage(1); }}
              className={`w-full rounded-2xl border px-3 py-2.5 text-xs outline-none transition cursor-pointer ${
                isLight 
                  ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100' 
                  : 'border-slate-800 bg-slate-950/65 text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <option value="all">All Risk Scores</option>
              <option value="high">High Risk (≥60%)</option>
              <option value="medium">Medium Risk (40-59%)</option>
              <option value="low">Low Risk (&lt;40%)</option>
              <option value="pending">Pending Scoring</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Listing Table */}
      <div className={`rounded-3xl border overflow-hidden shadow-dark-soft backdrop-blur-md transition duration-300 ${
        isLight ? 'border-slate-200 bg-white/70' : 'border-slate-800 bg-slate-900/20'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-slate-950/40'}`}>
                
                {/* Column Headers with Sort Actions */}
                <th 
                  onClick={() => handleSort('name')} 
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition select-none hover:text-white ${
                    sortField === 'name' ? 'text-brand-400' : (isLight ? 'text-slate-500' : 'text-slate-400')
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    Contract Name
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('upload_date')} 
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition select-none hover:text-white ${
                    sortField === 'upload_date' ? 'text-brand-400' : (isLight ? 'text-slate-500' : 'text-slate-400')
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    Upload Date
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('risk_score')} 
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition select-none hover:text-white ${
                    sortField === 'risk_score' ? 'text-brand-400' : (isLight ? 'text-slate-500' : 'text-slate-400')
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    Risk Score
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('status')} 
                  className={`px-6 py-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition select-none hover:text-white ${
                    sortField === 'status' ? 'text-brand-400' : (isLight ? 'text-slate-500' : 'text-slate-400')
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    Status
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </div>
                </th>

                <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => <SkeletonRow key={idx} />)
              ) : error ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-rose-450 text-sm">
                    <AlertTriangle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
                    {error}
                  </td>
                </tr>
              ) : paginatedContracts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center text-slate-500 text-sm">
                    No contracts found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedContracts.map((contract) => (
                  <tr 
                    key={contract.id}
                    onClick={() => handleOpenView(contract.id)}
                    className={`cursor-pointer transition-colors border-b border-slate-850/20 ${
                      selectedContractId === contract.id
                        ? (isLight ? 'bg-brand-50/40' : 'bg-brand-500/10')
                        : (isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/40')
                    }`}
                  >
                    {/* Contract Name */}
                    <td className="px-6 py-4.5 text-sm font-medium text-white max-w-[280px] truncate" title={contract.original_filename}>
                      <div className="flex items-center gap-3">
                        <FileText className={`h-4.5 w-4.5 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                        <span className={`${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          {contract.original_filename || contract.filename}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className={`px-6 py-4.5 text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {formatDate(contract.upload_date)}
                    </td>

                    {/* Risk Score */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskStyle(contract.risk_score)}`}>
                        {contract.risk_score != null ? `${contract.risk_score}%` : 'Pending'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusStyle(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenView(contract.id)}
                          title="View contract summary & details"
                          className={`p-2 rounded-xl transition ${
                            isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>

                        {/* Analyze Button */}
                        <button
                          type="button"
                          disabled={analyzingId != null || ['analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'].includes(contract.status?.toLowerCase())}
                          onClick={(e) => handleAnalyze(e, contract.id)}
                          title={['analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'].includes(contract.status?.toLowerCase()) ? 'Analysis Complete' : 'Run Risk Analysis'}
                          className={`p-2 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed ${
                            ['analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'].includes(contract.status?.toLowerCase())
                              ? 'text-emerald-500'
                              : (isLight ? 'text-brand-500 hover:bg-slate-100 hover:text-brand-700' : 'text-brand-400 hover:bg-slate-800 hover:text-brand-300')
                          }`}
                        >
                          {analyzingId === contract.id ? (
                            <Loader2 className="h-4.5 w-4.5 animate-spin" />
                          ) : ['analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'].includes(contract.status?.toLowerCase()) ? (
                            <CheckCircle className="h-4.5 w-4.5" />
                          ) : (
                            <Play className="h-4.5 w-4.5" />
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeletingContract(contract)}
                          title="Delete contract"
                          className={`p-2 rounded-xl transition ${
                            isLight ? 'text-slate-400 hover:bg-slate-100 hover:text-red-600' : 'text-slate-500 hover:bg-slate-800 hover:text-red-400'
                          }`}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {!loading && !error && totalCount > 0 && (
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-slate-950/20'
          }`}>
            <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Showing <span className="font-semibold text-white">{Math.min(totalCount, (currentPage - 1) * pageSize + 1)}</span> to{' '}
              <span className="font-semibold text-white">{Math.min(totalCount, currentPage * pageSize)}</span> of{' '}
              <span className="font-semibold text-white">{totalCount}</span> contract{totalCount !== 1 && 's'}
            </div>

            <div className="flex items-center gap-6">
              {/* Rows per page dropdown */}
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  className={`rounded-xl border px-2 py-1 text-xs outline-none cursor-pointer transition ${
                    isLight ? 'border-slate-200 bg-white text-slate-800' : 'border-slate-800 bg-slate-900 text-slate-300'
                  }`}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className={`p-1.5 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight 
                      ? 'border-slate-200 text-slate-650 hover:bg-slate-100' 
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-350'}`}>
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className={`p-1.5 rounded-xl border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                    isLight 
                      ? 'border-slate-200 text-slate-650 hover:bg-slate-100' 
                      : 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl transition duration-300 animate-slide-up ${
            isLight ? 'border-slate-200 bg-white text-slate-800' : 'border-slate-800 bg-slate-900 text-slate-200'
          }`}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Contract?</h3>
            <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-slate-400'} leading-relaxed`}>
              Are you sure you want to permanently delete <span className="font-semibold text-white">"{deletingContract.original_filename || deletingContract.filename}"</span>? 
              This action will delete all extracted clauses, NER entities, chat history, and the source file. It cannot be undone.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingContract(null)}
                className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                  isLight 
                    ? 'border-slate-200 text-slate-500 hover:bg-slate-100' 
                    : 'border-slate-700 text-slate-450 hover:bg-slate-850 hover:text-slate-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg transition flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Slide-out Drawer / Side Panel */}
      <div 
        className={`fixed top-0 right-0 bottom-0 z-50 w-full md:w-[480px] border-l shadow-2xl p-6 overflow-y-auto transition-transform duration-350 ease-out transform ${
          selectedContractId ? 'translate-x-0' : 'translate-x-full'
        } ${
          isLight ? 'border-slate-200 bg-white/95 backdrop-blur-md' : 'border-slate-850 bg-slate-950/95 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-850/60 pb-4 mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-brand-400" />
            Contract Quick View
          </h2>
          <button
            type="button"
            onClick={handleCloseView}
            className={`p-2 rounded-xl transition ${
              isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
            aria-label="Close details panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {detailLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-brand-400 animate-spin" />
            <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Fetching contract insights...</span>
          </div>
        ) : detailError ? (
          <div className="text-center py-10 text-rose-450 text-sm">
            <AlertTriangle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
            {detailError}
          </div>
        ) : detailData ? (
          <div className="space-y-6 animate-fade-in">
            {/* Document Metadata Panel */}
            <div className={`rounded-2xl border p-4 space-y-3.5 ${
              isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-850 bg-slate-900/10'
            }`}>
              <div className="space-y-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-550'}`}>Document Filename</span>
                <span className="text-sm font-semibold text-white break-all leading-snug">
                  {detailData.contract.original_filename || detailData.contract.filename}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/40 pt-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-550'}`}>Uploaded On</span>
                  <span className="text-xs font-semibold text-slate-350 flex items-center gap-1.5 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-400" />
                    {formatDate(detailData.contract.upload_date)}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-550'}`}>Total Pages</span>
                  <span className="text-xs font-semibold text-slate-350 mt-0.5 block">
                    {detailData.contract.total_pages || '—'} pages
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800/40 pt-3">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-550'}`}>Overall Risk</span>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold mt-1.5 ${getRiskStyle(detailData.contract.risk_score)}`}>
                    {detailData.contract.risk_score != null ? `${detailData.contract.risk_score}%` : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-slate-550'}`}>Review Status</span>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize mt-1.5 ${getStatusStyle(detailData.contract.status)}`}>
                    {detailData.contract.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate(`/contract-analysis?id=${detailData.contract.id}`)}
                className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-700 py-2.5 text-xs font-semibold text-white shadow-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Full Analysis Report
              </button>

              {detailData.contract.status?.toLowerCase() === 'uploaded' && (
                <button
                  type="button"
                  disabled={analyzingId != null}
                  onClick={(e) => handleAnalyze(e, detailData.contract.id)}
                  className="rounded-xl border border-brand-500/50 hover:bg-brand-500/10 px-4 py-2.5 text-xs font-semibold text-brand-400 transition"
                >
                  {analyzingId === detailData.contract.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Analyze'
                  )}
                </button>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2 border-t border-slate-850/60 pt-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-400" /> Contract Summary
              </h3>
              {detailData.contract.contract_summary ? (
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-650' : 'text-slate-350'}`}>
                  {detailData.contract.contract_summary}
                </p>
              ) : (
                <div className={`rounded-xl border p-4 text-center text-xs ${
                  isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-900 bg-slate-950/20 text-slate-450'
                }`}>
                  {detailData.contract.status?.toLowerCase() === 'uploaded' ? (
                    <span>Contract is uploaded. Click "Analyze" to extract summary and clauses.</span>
                  ) : (
                    <span>No summary available for this contract.</span>
                  )}
                </div>
              )}
            </div>

            {/* Contracting Entities (NER) */}
            {detailData.entities && detailData.entities.length > 0 && (
              <div className="space-y-3 border-t border-slate-850/60 pt-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-brand-400" /> Extracted Entities
                </h3>
                <div className="grid gap-2 grid-cols-2">
                  {detailData.entities.map((ent) => (
                    <div key={ent.id} className={`rounded-xl border p-3 ${
                      isLight ? 'border-slate-200 bg-slate-50/40 text-slate-700' : 'border-slate-850 bg-slate-900/10 text-slate-300'
                    }`}>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider">{ent.entity_type}</span>
                      <span className="text-xs font-semibold text-white truncate block mt-0.5" title={ent.entity_value}>{ent.entity_value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted Clauses (Brief List) */}
            {detailData.clauses && detailData.clauses.length > 0 && (
              <div className="space-y-3 border-t border-slate-850/60 pt-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-450 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-brand-400" /> High-Risk Clauses Checked
                </h3>
                <div className="space-y-2">
                  {detailData.clauses.map((clause) => {
                    const rLevel = clause.risk_level?.toLowerCase()
                    return (
                      <div key={clause.id} className={`rounded-xl border p-3 space-y-1.5 transition ${
                        isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-850 bg-slate-900/10'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{clause.clause_type}</span>
                          <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                            rLevel === 'high' 
                              ? 'text-rose-400 bg-rose-950/40 border border-rose-900/40' 
                              : rLevel === 'medium'
                              ? 'text-amber-400 bg-amber-950/40 border border-amber-900/40'
                              : 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/40'
                          }`}>
                            {clause.risk_level}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed italic line-clamp-2 ${isLight ? 'text-slate-500' : 'text-slate-450'}`}>
                          {clause.clause_text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-20 text-slate-500 text-sm">
            Please select a contract to view details.
          </div>
        )}
      </div>

    </div>
  )
}
