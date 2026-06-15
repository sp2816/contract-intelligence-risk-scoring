import React, { useState, useEffect } from 'react'
import { 
  Upload, File, ShieldAlert, CheckCircle, AlertTriangle, 
  HelpCircle, ChevronRight, RefreshCw, Layers, ArrowRight,
  Filter, Info, Eye, Download, FileCheck
} from 'lucide-react'

// Mock analysis steps
const ANALYSIS_STEPS = [
  { label: 'Securely uploading document to cloud sandbox', duration: 800 },
  { label: 'Extracting metadata, signing parties, and jurisdiction', duration: 1000 },
  { label: 'Running OCR scan and segmenting clauses', duration: 1200 },
  { label: 'Evaluating risk parameters and regulatory compliance', duration: 1500 },
  { label: 'Compiling recommendations and redline suggestions', duration: 1000 }
]

// Mock analysis report data
const MOCK_ANALYSIS_REPORT = {
  fileName: 'SaaS_Service_Agreement_Acme.pdf',
  fileSize: '1.2 MB',
  agreementType: 'Software-as-a-Service (SaaS) Agreement',
  parties: 'Acme Corp (Client) & DataCore Solutions Inc (Provider)',
  effectiveDate: 'October 15, 2024',
  governingLaw: 'State of Delaware',
  riskScore: 74,
  riskLabel: 'HIGH RISK',
  riskSummary: 'The agreement presents high risk due to broad limitation of liability exemptions favoring the Provider, unilateral termination clauses, and the total omission of a GDPR-compliant Data Protection Addendum (DPA) despite handling personal user data.',
  clauses: [
    {
      id: 'c1',
      name: 'Limitation of Liability',
      category: 'Liability',
      riskScore: 85,
      riskLevel: 'high',
      riskColor: 'rose',
      originalText: '"In no event shall Provider be liable for any indirect, incidental, special or consequential damages. Provider\'s total aggregate liability under this agreement shall be capped at the total amount paid by Client in the preceding three (3) months."',
      analysis: 'Highly unfavorable cap. Capping liability at 3 months of fees leaves Client exposed if service breaches occur early. Also lacks carve-outs for IP infringement or data breaches.',
      recommendation: 'Redline to a 12-month trailing fee cap. Ensure mutual carve-outs (exceptions) for indemnification obligations and breaches of confidentiality or data privacy laws.'
    },
    {
      id: 'c2',
      name: 'Indemnification Obligations',
      category: 'Indemnification',
      riskScore: 78,
      riskLevel: 'high',
      riskColor: 'rose',
      originalText: '"Client shall indemnify and defend Provider against any third-party claims, losses, or liabilities arising out of Client\'s use of the SaaS application, except to the extent caused by Provider\'s gross negligence."',
      analysis: 'One-sided indemnification. The Client has no reciprocal IP infringement indemnity from the Provider, which is standard in SaaS agreements to protect the client from patent/copyright claims.',
      recommendation: 'Demand a mutual IP infringement indemnity. The Provider must defend and hold the Client harmless if the SaaS platform violates a third party\'s intellectual property rights.'
    },
    {
      id: 'c3',
      name: 'Termination for Convenience',
      category: 'Termination',
      riskScore: 52,
      riskLevel: 'medium',
      riskColor: 'amber',
      originalText: '"Provider may terminate this agreement at any time for convenience upon thirty (30) days\' written notice to Client. Client may only terminate in the event of an uncured material breach by Provider."',
      analysis: 'Unilateral termination for convenience. The Provider can terminate the contract without cause, potentially disrupting Client business operations, while Client is locked in.',
      recommendation: 'Redline to remove Provider\'s termination for convenience entirely, or make it mutual with at least a ninety (90) day notice period and pro-rata refund of pre-paid fees.'
    },
    {
      id: 'c4',
      name: 'Intellectual Property Assignment',
      category: 'IP',
      riskScore: 18,
      riskLevel: 'low',
      riskColor: 'emerald',
      originalText: '"Provider retains all right, title, and interest in and to the SaaS application, documentation, and any system metadata. Client retains all rights in client-loaded data."',
      analysis: 'Standard intellectual property retention. Client data ownership is explicitly preserved, and the SaaS license is appropriately scoped as non-exclusive.',
      recommendation: 'Acceptable as written. Confirm that export provisions are defined in the transition services clause so Client data is retrievable upon termination.'
    }
  ],
  missingClauses: [
    {
      name: 'Data Protection Addendum (DPA)',
      importance: 'CRITICAL',
      importanceColor: 'text-rose-400 bg-rose-950/40 border-rose-900/50',
      reason: 'The agreement references handling European and California customer data, but lacks GDPR/CCPA standard contractual clauses (SCCs) or a DPA.',
      template: '"Data Processing. To the extent Provider processes Personal Data on behalf of Client, the parties shall execute and comply with the terms of the Data Protection Addendum (DPA) attached as Exhibit B, which is incorporated herein by reference."'
    },
    {
      name: 'Force Majeure Pandemic Carve-out',
      importance: 'HIGH',
      importanceColor: 'text-amber-400 bg-amber-950/40 border-amber-900/50',
      reason: 'The current Force Majeure clause lists "acts of God" but does not explicitly carve out government shut-downs, labor lockouts, or pandemics.',
      template: '"Force Majeure. Neither party shall be liable for delays caused by events beyond reasonable control, explicitly including pandemics, epidemics, and government mandates."'
    }
  ],
  recommendations: [
    'Execute a Data Protection Addendum (DPA) with Standard Contractual Clauses (SCCs) prior to contract signing.',
    'Negotiate Limitation of Liability aggregate cap from 3 months to 12 months trailing fees.',
    'Insert reciprocal Intellectual Property Infringement Indemnification clause from Provider.',
    'Align Termination clause to make notice periods mutual and ensure refunds for unused pre-paid service fees.'
  ]
}

export default function ContractAnalysis() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'uploading' | 'analyzing' | 'completed'
  const [progress, setProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [clauseFilter, setClauseFilter] = useState('all')

  // Handle file select/drag events
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileChange = (e) => {
    const files = e.target.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (selectedFile) => {
    // Validate file type (PDF/Word/Text)
    const ext = selectedFile.name.split('.').pop().toLowerCase()
    if (!['pdf', 'docx', 'txt', 'doc'].includes(ext)) {
      alert('Unsupported file format. Please upload a PDF, DOCX, or TXT file.')
      return
    }
    setFile({
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
    })
    startAnalysis()
  }

  // Simulate step-by-step progress analysis
  const startAnalysis = () => {
    setStatus('uploading')
    setProgress(0)
    setCurrentStepIndex(0)
  }

  useEffect(() => {
    if (status !== 'uploading') return

    let currentStep = 0
    let stepTimer = null

    const executeNextStep = () => {
      if (currentStep >= ANALYSIS_STEPS.length) {
        setProgress(100)
        setTimeout(() => {
          setStatus('completed')
        }, 500)
        return
      }

      setCurrentStepIndex(currentStep)
      
      // Interpolate progress percentage
      const startProg = Math.round((currentStep / ANALYSIS_STEPS.length) * 100)
      const endProg = Math.round(((currentStep + 1) / ANALYSIS_STEPS.length) * 100)
      let currentProg = startProg

      const progressInterval = setInterval(() => {
        if (currentProg < endProg) {
          currentProg += 1
          setProgress(Math.min(currentProg, 99))
        } else {
          clearInterval(progressInterval)
        }
      }, ANALYSIS_STEPS[currentStep].duration / (endProg - startProg))

      stepTimer = setTimeout(() => {
        clearInterval(progressInterval)
        currentStep += 1
        executeNextStep()
      }, ANALYSIS_STEPS[currentStep].duration)
    }

    executeNextStep()

    return () => {
      clearTimeout(stepTimer)
    }
  }, [status])

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setProgress(0)
    setCurrentStepIndex(0)
  }

  // Filtered Key Clauses
  const filteredClauses = MOCK_ANALYSIS_REPORT.clauses.filter(clause => {
    if (clauseFilter === 'all') return true
    return clause.riskLevel === clauseFilter
  })

  // Circular progress calculations for the SVG Gauge
  const radius = 55
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  // Animate the risk score value fill
  const strokeDashoffset = circumference - (Math.min(progress === 100 ? MOCK_ANALYSIS_REPORT.riskScore : progress, 100) / 100) * circumference

  // Circular gauge color class
  const getRiskGaugeColor = (score) => {
    if (score >= 66) return 'stroke-rose-500'
    if (score >= 36) return 'stroke-amber-500'
    return 'stroke-emerald-500'
  }

  const getRiskTextColor = (score) => {
    if (score >= 66) return 'text-rose-400'
    if (score >= 36) return 'text-amber-400'
    return 'text-emerald-400'
  }

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'high':
        return 'text-rose-400 bg-rose-950/40 border-rose-900/50'
      case 'medium':
        return 'text-amber-400 bg-amber-950/40 border-amber-900/50'
      case 'low':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Legal Risk Guard</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">AI Contract Analysis</h1>
        </div>
        {status === 'completed' && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Analyze another contract
          </button>
        )}
      </div>

      {/* IDLE state: Drag and drop Zone */}
      {status === 'idle' && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed p-10 md:p-16 text-center transition duration-300 min-h-[400px] ${
            dragging 
              ? 'border-brand-500 bg-brand-500/5 shadow-dark-glow scale-[0.99]' 
              : 'border-slate-800 bg-slate-900/20 hover:border-slate-700/80 hover:bg-slate-900/30'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-850 text-brand-400 border border-slate-800 shadow-lg mb-6 group-hover:scale-105 transition-transform">
            <Upload className={`h-8 w-8 ${dragging ? 'animate-bounce' : ''}`} />
          </div>

          <h2 className="text-xl font-bold text-white md:text-2xl">Upload contract for review</h2>
          <p className="mt-3 text-sm text-slate-400 max-w-md leading-relaxed">
            Drag and drop your contract PDF, DOCX, or TXT file here, or browse from your desktop. Documents are fully encrypted.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <label className="cursor-pointer rounded-2xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition">
              Select Document File
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.docx,.txt,.doc"
                onChange={handleFileChange} 
              />
            </label>
            <span className="text-xs text-slate-550">Supported: PDF, DOCX, TXT (Max 15MB)</span>
          </div>

          {/* Quick Mock Sample Button */}
          <button
            type="button"
            onClick={() => {
              setFile({ name: 'SaaS_Service_Agreement_Acme.pdf', size: '1.2 MB' })
              startAnalysis()
            }}
            className="mt-10 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition hover:border-slate-700"
          >
            <File className="h-3.5 w-3.5 text-brand-400" />
            Analyze a mock SaaS agreement template
          </button>
        </div>
      )}

      {/* UPLOADING & ANALYZING state: Progress Tracker */}
      {status === 'uploading' && (
        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/40 p-6 md:p-10 shadow-xl backdrop-blur-md max-w-3xl mx-auto w-full space-y-8 animate-slide-up">
          <div className="flex items-center justify-between border-b border-slate-850 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 animate-spin">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg truncate max-w-md">{file?.name}</h3>
                <p className="text-xs text-slate-500 mt-1">Contract analysis process is executing...</p>
              </div>
            </div>
            <span className="text-3xl font-black text-brand-400 tracking-tight">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-850">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-sky-400 transition-all duration-300 shadow-glow" 
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps list */}
          <div className="space-y-4 pt-4">
            {ANALYSIS_STEPS.map((step, index) => {
              const isDone = index < currentStepIndex
              const isActive = index === currentStepIndex
              
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition duration-300 ${
                    isActive 
                      ? 'border-brand-500/40 bg-brand-500/5 shadow-dark-soft' 
                      : isDone 
                        ? 'border-slate-800/80 bg-slate-950/20 opacity-80' 
                        : 'border-slate-900/60 bg-transparent opacity-40'
                  }`}
                >
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400 fill-emerald-950/40" />
                    ) : isActive ? (
                      <div className="h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-slate-700 bg-slate-900" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-xs text-brand-400 font-semibold uppercase tracking-wider animate-pulse-soft">
                      Processing
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* COMPLETED state: Detailed Risk Assessment Dashboard */}
      {status === 'completed' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Executive Row: Risk Wheel, Metadata & Summary */}
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            
            {/* Risk Gauge Panel */}
            <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-dark-soft flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">AI Risk Gauge</span>
              
              <div className="relative flex items-center justify-center">
                {/* SVG Circle Gauge */}
                <svg className="h-36 w-36 transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-slate-900 fill-none"
                    strokeWidth={strokeWidth}
                  />
                  {/* Fill */}
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className={`${getRiskGaugeColor(MOCK_ANALYSIS_REPORT.riskScore)} fill-none transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Text overlay */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{MOCK_ANALYSIS_REPORT.riskScore}%</span>
                  <span className={`text-[10px] font-bold mt-0.5 tracking-wider uppercase ${getRiskTextColor(MOCK_ANALYSIS_REPORT.riskScore)}`}>
                    {MOCK_ANALYSIS_REPORT.riskLabel}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <h4 className="text-sm font-bold text-slate-200">{MOCK_ANALYSIS_REPORT.fileName}</h4>
                <p className="text-xs text-slate-500">{MOCK_ANALYSIS_REPORT.fileSize} • Reviewed via LexAI</p>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 border border-slate-800">
                <FileCheck className="h-3.5 w-3.5 text-brand-400" />
                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Audit Pass</span>
              </div>
            </div>

            {/* Document Details & Executive Summary */}
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/30 p-6 shadow-dark-soft backdrop-blur-md space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Agreement Class</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block leading-tight">{MOCK_ANALYSIS_REPORT.agreementType}</span>
                </div>
                <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Contracting Entities</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block leading-tight">{MOCK_ANALYSIS_REPORT.parties}</span>
                </div>
                <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Governing Laws & Date</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block leading-tight">{MOCK_ANALYSIS_REPORT.governingLaw} ({MOCK_ANALYSIS_REPORT.effectiveDate})</span>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Executive Summary</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{MOCK_ANALYSIS_REPORT.riskSummary}</p>
              </div>
            </div>

          </div>

          {/* Section: Key Clauses with filter */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-400" />
                <h2 className="text-xl font-bold text-white">Extracted Clause Analysis</h2>
              </div>
              
              {/* Clause filters */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-850 bg-slate-950/40 p-1 self-start">
                <button
                  type="button"
                  onClick={() => setClauseFilter('all')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All ({MOCK_ANALYSIS_REPORT.clauses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setClauseFilter('high')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'high' ? 'bg-rose-950/45 text-rose-400 shadow' : 'text-slate-400 hover:text-slate-250'}`}
                >
                  High Risk ({MOCK_ANALYSIS_REPORT.clauses.filter(c => c.riskLevel === 'high').length})
                </button>
                <button
                  type="button"
                  onClick={() => setClauseFilter('medium')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'medium' ? 'bg-amber-950/45 text-amber-450 shadow' : 'text-slate-400 hover:text-slate-250'}`}
                >
                  Med Risk ({MOCK_ANALYSIS_REPORT.clauses.filter(c => c.riskLevel === 'medium').length})
                </button>
                <button
                  type="button"
                  onClick={() => setClauseFilter('low')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'low' ? 'bg-emerald-950/45 text-emerald-450 shadow' : 'text-slate-400 hover:text-slate-250'}`}
                >
                  Low Risk ({MOCK_ANALYSIS_REPORT.clauses.filter(c => c.riskLevel === 'low').length})
                </button>
              </div>
            </div>

            {/* Clause cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {filteredClauses.map((clause) => (
                <div 
                  key={clause.id}
                  className="rounded-3xl border border-slate-800 bg-slate-900/20 p-5 shadow-lg backdrop-blur hover:border-slate-700/80 transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between border-b border-slate-850 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">{clause.name}</h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5 block">{clause.category}</span>
                      </div>
                      <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getRiskBadgeColor(clause.riskLevel)}`}>
                        {clause.riskLevel} • {clause.riskScore}%
                      </span>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-3 mt-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Original Clause Text</span>
                        <blockquote className="mt-1.5 text-xs text-slate-400 bg-slate-950/50 rounded-xl p-3 border border-slate-850/80 leading-relaxed italic">
                          {clause.originalText}
                        </blockquote>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">AI Vulnerability Check</span>
                        <p className="mt-1 text-xs text-slate-300 leading-relaxed">{clause.analysis}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Recommendation */}
                  <div className="mt-4 pt-3 border-t border-slate-850 bg-brand-500/5 border-l-2 border-l-brand-500/60 rounded-r-xl p-3">
                    <span className="text-[10px] font-extrabold text-brand-400 uppercase tracking-wider block">Redline Recommendation</span>
                    <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-medium">{clause.recommendation}</p>
                  </div>
                </div>
              ))}

              {filteredClauses.length === 0 && (
                <div className="col-span-2 text-center py-10 rounded-3xl border border-slate-850 bg-slate-900/10 text-slate-500 text-sm">
                  No clauses found matching the selected risk level filter.
                </div>
              )}
            </div>
          </div>

          {/* Two column Grid: Missing Clauses & Redline Action Checklist */}
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Omitted / Missing Clauses */}
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/45 p-6 shadow-dark-soft space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-bold text-white">Omitted / Missing Clauses</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                We detected the total omission of the following standard terms. Failing to include these can lead to compliance audits or disputes.
              </p>

              <div className="space-y-4 pt-2">
                {MOCK_ANALYSIS_REPORT.missingClauses.map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-850 bg-slate-900/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold border ${item.importanceColor}`}>
                        {item.importance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-450 leading-relaxed">{item.reason}</p>
                    <div className="mt-2 bg-slate-950/80 rounded-xl p-2.5 border border-slate-850 text-[11px] font-mono text-sky-300">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block mb-1">Standard Reference Template</span>
                      {item.template}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redline Actions checklist */}
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/35 p-6 shadow-dark-soft space-y-4 backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Priority Action Checklist</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Perform these redlines in order of severity prior to route signing.
              </p>

              <div className="space-y-3 pt-2">
                {MOCK_ANALYSIS_REPORT.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-3 items-start p-3 bg-slate-900/50 border border-slate-850 rounded-2xl hover:border-slate-700 transition">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-slate-350 leading-relaxed font-medium pt-0.5">{rec}</p>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-700 py-2.5 text-xs font-semibold text-white shadow transition flex items-center justify-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" /> Export Redlines PDF
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-slate-700 hover:bg-slate-850 px-3 py-2.5 text-xs font-semibold text-slate-300 transition"
                  aria-label="Print report"
                >
                  Print Report
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
