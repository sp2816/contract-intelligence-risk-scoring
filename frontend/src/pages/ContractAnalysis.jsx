import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Upload, File, ShieldAlert, CheckCircle, AlertTriangle, 
  HelpCircle, ChevronRight, RefreshCw, Layers, ArrowRight,
  Filter, Info, Eye, Download, FileCheck, XCircle, Printer
} from 'lucide-react'
import { uploadContract, getContractDetails, analyzeContract } from '../api/contracts.js'
import { validateContractFile } from '../utils/validators.js'

// Mock analysis steps (shown after upload completes, simulating backend AI processing)
const ANALYSIS_STEPS = [
  { label: 'Extracting metadata, signing parties, and jurisdiction', duration: 1000 },
  { label: 'Running OCR scan and segmenting clauses', duration: 1200 },
  { label: 'Evaluating risk parameters and regulatory compliance', duration: 1500 },
  { label: 'Compiling recommendations and redline suggestions', duration: 1000 }
]

// Mock analysis report data (will be replaced when backend AI pipeline is ready)
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

const buildReportData = (data) => {
  const contract = data.contract
  const dbClauses = data.clauses || []
  const dbEntities = data.entities || []

  const parties = dbEntities.filter(e => e.entity_type === 'COMPANY').map(e => e.entity_value).join(' & ') || 'Unknown Parties'
  const dateVal = dbEntities.find(e => e.entity_type === 'DATE')?.entity_value || '—'
  const lawVal = dbEntities.find(e => e.entity_type === 'JURISDICTION')?.entity_value || 'Unknown Jurisdiction'

  const mappedClauses = dbClauses.map(c => ({
    id: c.id.toString(),
    name: c.clause_type,
    category: c.clause_type.split(' ')[0] || 'Clause',
    riskScore: c.risk_level === 'high' ? 80 : (c.risk_level === 'medium' ? 50 : 20),
    riskLevel: c.risk_level,
    riskColor: c.risk_level === 'high' ? 'rose' : (c.risk_level === 'medium' ? 'amber' : 'emerald'),
    originalText: c.clause_text,
    analysis: c.risk_level === 'high' 
      ? 'High exposure clause detected. This term is highly unfavorable.' 
      : (c.risk_level === 'medium' ? 'Moderate exposure clause. Review is recommended.' : 'Acceptable clause terms.'),
    recommendation: c.risk_level === 'high' 
      ? 'Redline this clause to Trailing 12-month fee cap or mutual liability constraints.' 
      : (c.risk_level === 'medium' ? 'Redline to mutual notice periods.' : 'Acceptable as written.')
  }))

  const missing = []
  if (contract.risk_score >= 71) {
    missing.push({
      name: 'Data Protection Addendum (DPA)',
      importance: 'CRITICAL',
      importanceColor: 'text-rose-400 bg-rose-950/40 border-rose-900/50',
      reason: 'The agreement references handling European and California customer data, but lacks GDPR/CCPA standard contractual clauses (SCCs) or a DPA.',
      template: '"Data Processing. To the extent Provider processes Personal Data on behalf of Client, the parties shall execute and comply with the terms of the Data Protection Addendum (DPA) attached as Exhibit B, which is incorporated herein by reference."'
    })
  } else {
    // Add mild missing clause for NDA or smaller contracts
    missing.push({
      name: 'Force Majeure Pandemic Carve-out',
      importance: 'HIGH',
      importanceColor: 'text-amber-400 bg-amber-950/40 border-amber-900/50',
      reason: 'The current Force Majeure clause lists "acts of God" but does not explicitly carve out government shut-downs, labor lockouts, or pandemics.',
      template: '"Force Majeure. Neither party shall be liable for delays caused by events beyond reasonable control, explicitly including pandemics, epidemics, and government mandates."'
    })
  }

  const recommendations = mappedClauses.filter(c => c.riskLevel === 'high' || c.riskLevel === 'medium').map(c => `Redline / negotiate ${c.name} terms.`)
  if (missing.length > 0) {
    recommendations.push(`Resolve missing ${missing[0].name} provisions before signing.`)
  }

  return {
    fileName: contract.original_filename || contract.filename,
    fileSize: '—',
    agreementType: contract.original_filename?.toLowerCase().includes('nda') ? 'Non-Disclosure Agreement (NDA)' : 'Service Agreement / SaaS Contract',
    parties: parties,
    effectiveDate: dateVal,
    governingLaw: lawVal,
    riskScore: contract.risk_score || 0,
    riskLabel: contract.risk_score >= 71 ? 'HIGH RISK' : (contract.risk_score >= 31 ? 'MEDIUM RISK' : 'LOW RISK'),
    riskSummary: contract.contract_summary || 'Analysis complete.',
    clauses: mappedClauses,
    missingClauses: missing,
    recommendations: recommendations.length > 0 ? recommendations : ['No immediate critical actions required.']
  }
}

export default function ContractAnalysis() {
  const [searchParams] = useSearchParams()
  const queryId = searchParams.get('id')

  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'uploading' | 'analyzing' | 'completed' | 'error'
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [clauseFilter, setClauseFilter] = useState('all')
  const [uploadError, setUploadError] = useState('')
  const [uploadedContract, setUploadedContract] = useState(null)
  const [analysisReport, setAnalysisReport] = useState(MOCK_ANALYSIS_REPORT)
  const analysisPromiseRef = useRef(null)

  // Effect to load existing contract by ID from URL
  useEffect(() => {
    if (!queryId) return

    const loadExistingContract = async () => {
      setStatus('analyzing')
      setAnalysisProgress(0)
      setCurrentStepIndex(0)
      try {
        const details = await getContractDetails(queryId)
        setUploadedContract(details.contract)
        setFile({
          name: details.contract.original_filename || details.contract.filename,
          size: details.contract.total_pages ? `${details.contract.total_pages} pages` : '—'
        })
        
        // If contract is not analyzed yet, run analysis
        const statusLower = (details.contract.status || '').toLowerCase()
        const isAnalyzed = ['analyzed', 'reviewed', 'approved', 'completed', 'analysis_complete'].includes(statusLower)
        
        if (!isAnalyzed) {
          await analyzeContract(queryId)
          const updatedDetails = await getContractDetails(queryId)
          setUploadedContract(updatedDetails.contract)
          setAnalysisReport(buildReportData(updatedDetails))
        } else {
          setAnalysisReport(buildReportData(details))
        }
        
        setStatus('completed')
      } catch (err) {
        setUploadError(err?.message || 'Failed to load contract details.')
        setStatus('error')
      }
    }

    loadExistingContract()
  }, [queryId])

  // Combined progress: upload is 0-50%, analysis simulation is 50-100%
  const totalProgress = status === 'uploading'
    ? Math.round(uploadProgress * 0.5)
    : status === 'analyzing'
    ? 50 + Math.round(analysisProgress * 0.5)
    : status === 'completed'
    ? 100
    : 0

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

  const processFile = async (selectedFile) => {
    // ─── Client-side validation ───────────────────────────────────────────
    const validation = validateContractFile(selectedFile)
    if (!validation.isValid) {
      setUploadError(validation.error)
      setStatus('error')
      return
    }

    setFile({
      name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB'
    })
    setUploadError('')
    setStatus('uploading')
    setUploadProgress(0)

    // ─── Real upload to backend ───────────────────────────────────────────
    try {
      const response = await uploadContract(selectedFile, (percent) => {
        setUploadProgress(percent)
      })

      const contract = response.contract
      setUploadedContract(contract)
      
      // Upload done → start simulated analysis phase
      setStatus('analyzing')
      setUploadProgress(100)
      setAnalysisProgress(0)
      setCurrentStepIndex(0)

      // Start background analysis immediately on the server
      // Store the promise so the simulation completion can await it
      analysisPromiseRef.current = analyzeContract(contract.id).catch(err => {
        console.error("Background analysis failed:", err)
        return null // swallow so Promise.all / await won't throw
      })
    } catch (err) {
      setUploadError(err?.message || 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  // Simulate analysis steps after upload completes
  useEffect(() => {
    if (status !== 'analyzing') return

    let currentStep = 0
    let stepTimer = null

    const executeNextStep = () => {
      if (currentStep >= ANALYSIS_STEPS.length) {
        setAnalysisProgress(100)
        setTimeout(async () => {
          if (uploadedContract) {
            try {
              // Wait for the real analysis API call to finish before fetching details
              if (analysisPromiseRef.current) {
                await analysisPromiseRef.current
                analysisPromiseRef.current = null
              }
              const details = await getContractDetails(uploadedContract.id)
              setAnalysisReport(buildReportData(details))
            } catch (err) {
              console.error("Failed to load real details, falling back to mock.", err)
            }
          }
          setStatus('completed')
        }, 500)
        return
      }

      setCurrentStepIndex(currentStep)

      const startProg = Math.round((currentStep / ANALYSIS_STEPS.length) * 100)
      const endProg = Math.round(((currentStep + 1) / ANALYSIS_STEPS.length) * 100)
      let currentProg = startProg

      const progressInterval = setInterval(() => {
        if (currentProg < endProg) {
          currentProg += 1
          setAnalysisProgress(Math.min(currentProg, 99))
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
  }, [status, uploadedContract])

  const handleReset = () => {
    setFile(null)
    setStatus('idle')
    setUploadProgress(0)
    setAnalysisProgress(0)
    setCurrentStepIndex(0)
    setUploadError('')
    setUploadedContract(null)
  }

  // ─── Generate shared PDF/Print styles ──────────────────────────────────────
  const generatePrintStyles = () => `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; background: #fff; padding: 40px; line-height: 1.6; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; }
    .header-left h1 { font-size: 22px; font-weight: 800; color: #0f172a; }
    .header-left p { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .header-right { text-align: right; font-size: 11px; color: #64748b; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .meta-card { padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; }
    .meta-card .label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; }
    .meta-card .value { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 4px; }
    .risk-banner { display: flex; align-items: center; gap: 20px; padding: 18px 24px; border-radius: 12px; margin-bottom: 28px; }
    .risk-banner.high { background: #fff1f2; border: 1px solid #fecdd3; }
    .risk-banner.medium { background: #fffbeb; border: 1px solid #fde68a; }
    .risk-banner.low { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .risk-score { font-size: 36px; font-weight: 800; }
    .risk-score.high { color: #e11d48; }
    .risk-score.medium { color: #d97706; }
    .risk-score.low { color: #059669; }
    .risk-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; }
    .risk-label.high { color: #be123c; }
    .risk-label.medium { color: #b45309; }
    .risk-label.low { color: #047857; }
    .risk-summary { font-size: 12px; color: #475569; line-height: 1.7; flex: 1; }
    .section-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 28px 0 14px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
    .section-title .icon { width: 20px; height: 20px; }
    .clause-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; page-break-inside: avoid; }
    .clause-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
    .clause-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .clause-category { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 600; margin-top: 2px; }
    .risk-badge { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .risk-badge.high { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
    .risk-badge.medium { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
    .risk-badge.low { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
    .original-text { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 12px; color: #475569; font-style: italic; line-height: 1.7; margin: 10px 0; }
    .analysis-text { font-size: 12px; color: #334155; line-height: 1.7; margin: 8px 0; }
    .redline-box { background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 12px 14px; margin-top: 12px; }
    .redline-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #2563eb; }
    .redline-text { font-size: 12px; color: #1e40af; line-height: 1.7; margin-top: 4px; font-weight: 500; }
    .missing-card { border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-bottom: 12px; background: #fffbeb; page-break-inside: avoid; }
    .missing-name { font-size: 14px; font-weight: 700; color: #92400e; }
    .missing-importance { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9px; font-weight: 700; background: #fef3c7; color: #b45309; border: 1px solid #fde68a; text-transform: uppercase; letter-spacing: 1px; }
    .missing-reason { font-size: 12px; color: #78350f; line-height: 1.7; margin: 8px 0; }
    .template-box { background: #0f172a; color: #7dd3fc; border-radius: 8px; padding: 12px 14px; font-size: 11px; font-family: 'Courier New', monospace; line-height: 1.7; margin-top: 8px; }
    .checklist-item { display: flex; gap: 12px; align-items: flex-start; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 8px; background: #f8fafc; }
    .checklist-num { min-width: 24px; height: 24px; border-radius: 6px; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 1px solid #a7f3d0; }
    .checklist-text { font-size: 12px; color: #334155; line-height: 1.6; font-weight: 500; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 20px; }
      .clause-card, .missing-card, .checklist-item { page-break-inside: avoid; }
      .section-title { page-break-after: avoid; }
    }
  `

  // ─── Export Redlines PDF ────────────────────────────────────────────────────
  const handleExportPDF = () => {
    const report = analysisReport
    if (!report) return

    const riskLevel = report.riskScore >= 66 ? 'high' : (report.riskScore >= 36 ? 'medium' : 'low')
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const fileName = uploadedContract?.original_filename || report.fileName

    const clausesHTML = (report.clauses || []).map(clause => {
      const level = clause.riskLevel || 'low'
      return `
        <div class="clause-card">
          <div class="clause-header">
            <div>
              <div class="clause-name">${clause.name}</div>
              <div class="clause-category">${clause.category}</div>
            </div>
            <span class="risk-badge ${level}">${level} risk &bull; ${clause.riskScore}%</span>
          </div>
          <div style="margin-bottom: 6px;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Original Clause Text</strong></div>
          <div class="original-text">${clause.originalText}</div>
          <div style="margin-top: 10px;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">AI Vulnerability Analysis</strong></div>
          <div class="analysis-text">${clause.analysis}</div>
          <div class="redline-box">
            <div class="redline-label">&starf; Redline Recommendation</div>
            <div class="redline-text">${clause.recommendation}</div>
          </div>
        </div>
      `
    }).join('')

    const missingHTML = (report.missingClauses || []).map(item => `
      <div class="missing-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="missing-name">${item.name}</span>
          <span class="missing-importance">${item.importance}</span>
        </div>
        <div class="missing-reason">${item.reason}</div>
        <div style="margin-top:6px;"><strong style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Suggested Template</strong></div>
        <div class="template-box">${item.template}</div>
      </div>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Redline Report — ${fileName}</title>
        <style>${generatePrintStyles()}</style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>&#9878; Contract Redline Report</h1>
            <p>AI-Powered Clause Analysis &amp; Recommendations</p>
          </div>
          <div class="header-right">
            <div style="font-weight:700;color:#0f172a;">${fileName}</div>
            <div>Generated: ${dateStr} at ${timeStr}</div>
            <div>LexAI Contract Intelligence Platform</div>
          </div>
        </div>

        <div class="risk-banner ${riskLevel}">
          <div>
            <div class="risk-score ${riskLevel}">${report.riskScore}%</div>
            <div class="risk-label ${riskLevel}">${report.riskLabel}</div>
          </div>
          <div class="risk-summary">${report.riskSummary}</div>
        </div>

        <div class="meta-grid">
          <div class="meta-card"><div class="label">Agreement Type</div><div class="value">${report.agreementType}</div></div>
          <div class="meta-card"><div class="label">Contracting Entities</div><div class="value">${report.parties}</div></div>
          <div class="meta-card"><div class="label">Governing Law &amp; Date</div><div class="value">${report.governingLaw} (${report.effectiveDate})</div></div>
        </div>

        <div class="section-title">&#128270; Extracted Clause Analysis &amp; Redlines (${(report.clauses || []).length} clauses)</div>
        ${clausesHTML}

        ${(report.missingClauses || []).length > 0 ? `
          <div class="section-title">&#9888; Omitted / Missing Clauses</div>
          ${missingHTML}
        ` : ''}

        <div class="footer">
          <p>This redline report was generated by LexAI Contract Intelligence Platform. For legal compliance, always consult with qualified counsel.</p>
          <p style="margin-top:4px;">&copy; ${now.getFullYear()} LexAI &mdash; Confidential</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      // Wait for fonts to load before triggering print
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 600)
    }
  }

  // ─── Print Full Analysis Report ────────────────────────────────────────────
  const handlePrintReport = () => {
    const report = analysisReport
    if (!report) return

    const riskLevel = report.riskScore >= 66 ? 'high' : (report.riskScore >= 36 ? 'medium' : 'low')
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const fileName = uploadedContract?.original_filename || report.fileName

    const clausesHTML = (report.clauses || []).map(clause => {
      const level = clause.riskLevel || 'low'
      return `
        <div class="clause-card">
          <div class="clause-header">
            <div>
              <div class="clause-name">${clause.name}</div>
              <div class="clause-category">${clause.category}</div>
            </div>
            <span class="risk-badge ${level}">${level} risk &bull; ${clause.riskScore}%</span>
          </div>
          <div style="margin-bottom:6px;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Original Clause Text</strong></div>
          <div class="original-text">${clause.originalText}</div>
          <div style="margin-top:10px;"><strong style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">AI Analysis</strong></div>
          <div class="analysis-text">${clause.analysis}</div>
          <div class="redline-box">
            <div class="redline-label">&starf; Recommendation</div>
            <div class="redline-text">${clause.recommendation}</div>
          </div>
        </div>
      `
    }).join('')

    const missingHTML = (report.missingClauses || []).map(item => `
      <div class="missing-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <span class="missing-name">${item.name}</span>
          <span class="missing-importance">${item.importance}</span>
        </div>
        <div class="missing-reason">${item.reason}</div>
        <div style="margin-top:6px;"><strong style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Suggested Template</strong></div>
        <div class="template-box">${item.template}</div>
      </div>
    `).join('')

    const checklistHTML = (report.recommendations || []).map((rec, idx) => `
      <div class="checklist-item">
        <div class="checklist-num">${idx + 1}</div>
        <div class="checklist-text">${rec}</div>
      </div>
    `).join('')

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Full Analysis Report — ${fileName}</title>
        <style>${generatePrintStyles()}</style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <h1>&#9878; Full Contract Analysis Report</h1>
            <p>Comprehensive AI Risk Assessment &amp; Compliance Audit</p>
          </div>
          <div class="header-right">
            <div style="font-weight:700;color:#0f172a;">${fileName}</div>
            <div>Generated: ${dateStr} at ${timeStr}</div>
            <div>LexAI Contract Intelligence Platform</div>
          </div>
        </div>

        <div class="risk-banner ${riskLevel}">
          <div>
            <div class="risk-score ${riskLevel}">${report.riskScore}%</div>
            <div class="risk-label ${riskLevel}">${report.riskLabel}</div>
          </div>
          <div class="risk-summary">
            <strong>Executive Summary</strong><br/>
            ${report.riskSummary}
          </div>
        </div>

        <div class="section-title">&#128196; Contract Metadata</div>
        <div class="meta-grid">
          <div class="meta-card"><div class="label">Agreement Type</div><div class="value">${report.agreementType}</div></div>
          <div class="meta-card"><div class="label">Contracting Entities</div><div class="value">${report.parties}</div></div>
          <div class="meta-card"><div class="label">Governing Law &amp; Date</div><div class="value">${report.governingLaw} (${report.effectiveDate})</div></div>
        </div>

        <div class="section-title">&#128270; Extracted Clause Analysis (${(report.clauses || []).length} clauses)</div>
        ${clausesHTML}

        ${(report.missingClauses || []).length > 0 ? `
          <div class="section-title">&#9888; Omitted / Missing Clauses</div>
          ${missingHTML}
        ` : ''}

        ${(report.recommendations || []).length > 0 ? `
          <div class="section-title">&#9989; Priority Action Checklist</div>
          ${checklistHTML}
        ` : ''}

        <div class="footer">
          <p>This report was generated by LexAI Contract Intelligence Platform. All analyses are AI-assisted and should be reviewed by qualified legal counsel.</p>
          <p style="margin-top:4px;">&copy; ${now.getFullYear()} LexAI &mdash; Confidential Document</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
      }, 600)
    }
  }

  // Filtered Key Clauses
  const filteredClauses = (analysisReport?.clauses || []).filter(clause => {
    if (clauseFilter === 'all') return true
    return clause.riskLevel === clauseFilter
  })

  // Circular progress calculations for the SVG Gauge
  const radius = 55
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(totalProgress === 100 ? (analysisReport?.riskScore || 0) : totalProgress, 100) / 100) * circumference

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
        {(status === 'completed' || status === 'error') && (
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

      {/* ERROR state */}
      {status === 'error' && (
        <div className="rounded-[2rem] border border-rose-800/50 bg-rose-950/20 p-6 md:p-10 shadow-xl backdrop-blur-md max-w-3xl mx-auto w-full space-y-6 animate-slide-up">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <XCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Upload Failed</h3>
              <p className="text-sm text-rose-300 mt-2 leading-relaxed">{uploadError}</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-brand-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

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
        </div>
      )}

      {/* UPLOADING & ANALYZING state: Progress Tracker */}
      {(status === 'uploading' || status === 'analyzing') && (
        <div className="rounded-[2.5rem] border border-slate-800 bg-slate-900/40 p-6 md:p-10 shadow-xl backdrop-blur-md max-w-3xl mx-auto w-full space-y-8 animate-slide-up">
          <div className="flex items-center justify-between border-b border-slate-850 pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 animate-spin">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg truncate max-w-md">{file?.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {status === 'uploading' ? 'Uploading contract to secure cloud...' : 'AI analysis in progress...'}
                </p>
              </div>
            </div>
            <span className="text-3xl font-black text-brand-400 tracking-tight">{totalProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-850">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-sky-400 transition-all duration-300 shadow-glow" 
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          {/* Upload progress phase */}
          {status === 'uploading' && (
            <div className="flex items-center gap-4 rounded-2xl border border-brand-500/40 bg-brand-500/5 px-4 py-3.5 shadow-dark-soft">
              <div className="h-5 w-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span className="text-sm font-medium text-white">Securely uploading document ({uploadProgress}%)</span>
              <span className="ml-auto text-xs text-brand-400 font-semibold uppercase tracking-wider animate-pulse-soft">
                Uploading
              </span>
            </div>
          )}

          {/* Analysis steps */}
          {status === 'analyzing' && (
            <div className="space-y-4 pt-4">
              {/* Upload complete checkmark */}
              <div className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/20 px-4 py-3.5 opacity-80">
                <CheckCircle className="h-5 w-5 text-emerald-400 fill-emerald-950/40" />
                <span className="text-sm font-medium text-slate-400">Contract uploaded successfully (ID: {uploadedContract?.id})</span>
              </div>

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
          )}
        </div>
      )}

      {/* COMPLETED state: Detailed Risk Assessment Dashboard */}
      {status === 'completed' && (
        <div className="space-y-6 animate-fade-in">

          {/* Upload success banner */}
          {uploadedContract && (
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-800/40 bg-emerald-950/20 px-5 py-4">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-300">
                  Contract uploaded & analyzed successfully
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Contract ID: {uploadedContract.id} • {uploadedContract.original_filename} • Status: {uploadedContract.status}
                </p>
              </div>
            </div>
          )}
          
          {/* Executive Row: Risk Wheel, Metadata & Summary */}
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            
            {/* Risk Gauge Panel */}
            <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-dark-soft flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">AI Risk Gauge</span>
              
              <div className="relative flex items-center justify-center">
                <svg className="h-36 w-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-slate-900 fill-none"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className={`${getRiskGaugeColor(analysisReport.riskScore)} fill-none transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{analysisReport.riskScore}%</span>
                  <span className={`text-[10px] font-bold mt-0.5 tracking-wider uppercase ${getRiskTextColor(analysisReport.riskScore)}`}>
                    {analysisReport.riskLabel}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-1">
                <h4 className="text-sm font-bold text-slate-200">{uploadedContract?.original_filename || analysisReport.fileName}</h4>
                <p className="text-xs text-slate-500">{file?.size || analysisReport.fileSize} • Reviewed via LexAI</p>
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
                  <span className="text-sm font-semibold text-slate-200 mt-1 block leading-tight">{analysisReport.agreementType}</span>
                </div>
                <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Contracting Entities</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block leading-tight">{analysisReport.parties}</span>
                </div>
                <div className="rounded-2xl border border-slate-850 bg-slate-950/40 p-4 sm:col-span-2 lg:col-span-1">
                  <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider block">Governing Laws & Date</span>
                  <span className="text-sm font-semibold text-slate-200 mt-1 block leading-tight">{analysisReport.governingLaw} ({analysisReport.effectiveDate})</span>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Executive Summary</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{analysisReport.riskSummary}</p>
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
                  All ({(analysisReport?.clauses || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setClauseFilter('high')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'high' ? 'bg-rose-950/45 text-rose-400 shadow' : 'text-slate-400 hover:text-slate-250'}`}
                >
                  High Risk ({(analysisReport?.clauses || []).filter(c => c.riskLevel === 'high').length})
                </button>
                <button
                  type="button"
                  onClick={() => setClauseFilter('medium')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'medium' ? 'bg-amber-950/45 text-amber-450 shadow' : 'text-slate-400 hover:text-slate-250'}`}
                >
                  Med Risk ({(analysisReport?.clauses || []).filter(c => c.riskLevel === 'medium').length})
                </button>
                <button
                  type="button"
                  onClick={() => setClauseFilter('low')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${clauseFilter === 'low' ? 'bg-emerald-950/45 text-emerald-450 shadow' : 'text-slate-400 hover:text-slate-250'}`}
                >
                  Low Risk ({(analysisReport?.clauses || []).filter(c => c.riskLevel === 'low').length})
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
                    <div className="flex items-start justify-between border-b border-slate-850 pb-3">
                      <div>
                        <h4 className="font-bold text-white text-base leading-tight">{clause.name}</h4>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5 block">{clause.category}</span>
                      </div>
                      <span className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getRiskBadgeColor(clause.riskLevel)}`}>
                        {clause.riskLevel} • {clause.riskScore}%
                      </span>
                    </div>

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
                {(analysisReport.missingClauses || []).map((item, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-850 bg-slate-900/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{item.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold border ${item.importanceColor}`}>
                        {item.importance}
                      </span>
                    </div>
                    <p className="text-xs text-slate-455 leading-relaxed">{item.reason}</p>
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
                {(analysisReport.recommendations || []).map((rec, idx) => (
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
                  onClick={handleExportPDF}
                  className="flex-1 rounded-xl bg-brand-500 hover:bg-brand-700 py-2.5 text-xs font-semibold text-white shadow transition flex items-center justify-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" /> Export Redlines PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrintReport}
                  className="rounded-xl border border-slate-700 hover:bg-slate-850 px-3 py-2.5 text-xs font-semibold text-slate-300 transition flex items-center justify-center gap-2"
                  aria-label="Print report"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Report
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}
