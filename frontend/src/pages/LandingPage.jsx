// src/pages/LandingPage.jsx
// ──────────────────────────────────────────────────────────────────────────────
// ContractMind — Premium Landing Page
//
// Sections: Hero, Trusted By, Features, Benefits, Product Preview,
//           How It Works, Testimonials, FAQ, Final CTA, Footer
//
// Design: Extends the existing ContractMind design system (CSS variables,
//         Tailwind config, lucide-react icons, Inter font, light/dark mode).
// ──────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import {
  Shield, ShieldCheck, ShieldAlert, Zap, FileText, BarChart3,
  MessageSquare, Lock, Eye, Scale, Activity, TrendingUp,
  CheckCircle, ChevronDown, ChevronRight, ArrowRight, Star,
  Upload, Search, Brain, Sparkles, Globe, Clock, Users,
  Layers, AlertTriangle, Bot, Sun, Moon, Menu, X,
  Check, Play, Monitor, Smartphone, Tablet
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// Scroll Reveal Hook (IntersectionObserver)
// ─────────────────────────────────────────────────────────────────────────────

function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px', ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, isVisible]
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = '', duration = 1500, isVisible }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isVisible) return
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [isVisible, value, duration])

  return <>{count}{suffix}</>
}

// ─────────────────────────────────────────────────────────────────────────────
// Landing Navbar
// ─────────────────────────────────────────────────────────────────────────────

function LandingNavbar({ isLight, toggleTheme }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? isLight
            ? 'border-slate-200 bg-white/95 shadow-sm'
            : 'border-slate-800 bg-slate-900/95 shadow-lg shadow-slate-950/20'
          : isLight
            ? 'border-transparent bg-transparent'
            : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/landing" className="flex items-center gap-2 select-none hover:opacity-90 transition">
          <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="landingLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <path
              d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
              fill="url(#landingLogoGrad)"
              stroke="url(#landingLogoGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-brand-500">Contract</span>
            <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>Mind</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 ${
                isLight
                  ? 'text-slate-600 hover:text-brand-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
            className={`p-2 rounded-full transition ${
              isLight
                ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <Link
            to="/login"
            className={`hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl transition ${
              isLight
                ? 'text-slate-700 hover:bg-slate-100'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:shadow-xl hover:shadow-brand-500/30 hover:brightness-110"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-xl transition ${
              isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}>
          <nav className="flex flex-col p-4 gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-xl transition ${
                  isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-xl text-center transition ${
                  isLight ? 'text-slate-700 hover:bg-slate-100' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 text-sm font-semibold rounded-full text-center text-white bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/20"
              >
                Get Started 
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Wrapper
// ─────────────────────────────────────────────────────────────────────────────

function Section({ id, className = '', children }) {
  const [ref, isVisible] = useScrollReveal()

  return (
    <section
      id={id}
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </section>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Heading
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({ badge, title, subtitle, isLight }) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
      {badge && (
        <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] font-semibold mb-6 ${
          isLight
            ? 'border-brand-200 bg-brand-50 text-brand-600'
            : 'border-slate-700/80 bg-slate-800/80 text-brand-400'
        }`}>
          <Sparkles className="h-3.5 w-3.5" />
          {badge}
        </span>
      )}
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${
        isLight ? 'text-slate-900' : 'text-white'
      }`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Mockup (Pure CSS/SVG)
// ─────────────────────────────────────────────────────────────────────────────

function DashboardMockup({ isLight, device = 'desktop' }) {
  const isMobile = device === 'mobile'

  return (
    <div className={`relative rounded-2xl border overflow-hidden shadow-2xl transition-all duration-500 ease-out ${
      isLight
        ? 'border-slate-200 bg-white shadow-slate-200/60'
        : 'border-slate-700/50 bg-slate-900 shadow-slate-950/60'
    }`}>
      {/* Title Bar */}
      <div className={`flex items-center gap-2 px-4 py-3 border-b ${
        isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'
      }`}>
        <div className="flex gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className={`flex-1 mx-4 sm:mx-8 h-6 rounded-lg overflow-hidden ${
          isLight ? 'bg-slate-100' : 'bg-slate-800/60'
        }`}>
          <div className="flex items-center justify-center h-full gap-1.5 px-3">
            <Lock className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
            <span className={`text-[10px] font-medium tracking-wide truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              {isMobile ? 'contractmind.ai' : 'https://contractmind.ai/dashboard'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 sm:p-6 transition-all duration-300">
        {/* KPI Row */}
        <div className={`grid gap-3 mb-4 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-3'
        }`}>
          {[
            { label: 'Total Contracts', value: '247', color: 'text-blue-400', bg: isLight ? 'bg-blue-50' : 'bg-blue-500/10' },
            { label: 'Risk Score', value: '32%', color: 'text-emerald-400', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-500/10' },
            { label: 'Flagged Clauses', value: '18', color: 'text-amber-400', bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10' },
          ].map((kpi) => (
            <div key={kpi.label} className={`rounded-xl p-3 transition-all duration-300 ${kpi.bg}`}>
              <p className={`text-[10px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.label}</p>
              <p className={`text-lg font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className={`rounded-xl p-4 mb-4 ${isLight ? 'bg-slate-50' : 'bg-slate-800/40'}`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>Risk Trend Analysis</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-700 text-slate-400'}`}>Last 30 days</span>
          </div>
          <svg viewBox="0 0 300 80" className="w-full h-auto" preserveAspectRatio="none">
            <style>{`
              .chart-line {
                stroke-dasharray: 350;
                stroke-dashoffset: 350;
                animation: drawLine 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              }
              .chart-fill {
                opacity: 0;
                animation: fadeInFill 1.5s ease-out 1.2s forwards;
              }
              @keyframes drawLine {
                to {
                  stroke-dashoffset: 0;
                }
              }
              @keyframes fadeInFill {
                to {
                  opacity: 1;
                }
              }
            `}</style>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isLight ? '#6366f1' : '#818cf8'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isLight ? '#6366f1' : '#818cf8'} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="chart-fill" d="M0,60 C30,55 50,40 80,45 C110,50 130,30 160,25 C190,20 210,35 240,20 C270,15 290,10 300,12 L300,80 L0,80 Z"
              fill="url(#chartGrad)" />
            <path className="chart-line" d="M0,60 C30,55 50,40 80,45 C110,50 130,30 160,25 C190,20 210,35 240,20 C270,15 290,10 300,12"
              fill="none" stroke={isLight ? '#6366f1' : '#818cf8'} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Table Placeholder */}
        <div className={`rounded-xl overflow-hidden ${isLight ? 'bg-slate-50' : 'bg-slate-800/40'}`}>
          {isMobile ? (
            <div className="divide-y divide-slate-250 dark:divide-slate-800/30">
              {[
                { name: 'SaaS Agreement', status: 'Analyzed', risk: 'Low', score: '24%', riskBg: isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400' },
                { name: 'NDA Template', status: 'Reviewed', risk: 'Medium', score: '56%', riskBg: isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-emerald-400' },
                { name: 'License Deal', status: 'Flagged', risk: 'High', score: '81%', riskBg: isLight ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400' },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between p-3 text-[10px]">
                  <div>
                    <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{row.name}</span>
                    <span className="block text-[8px] text-slate-500 dark:text-slate-400 mt-0.5">{row.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold ${row.riskBg}`}>{row.risk}</span>
                    <span className={`font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{row.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-4 gap-2 px-3 py-2 text-[9px] font-semibold uppercase tracking-wider ${
                isLight ? 'text-slate-500 border-b border-slate-200' : 'text-slate-500 border-b border-slate-700'
              }`}>
                <span>Contract</span><span>Status</span><span>Risk</span><span>Score</span>
              </div>
              {[
                { name: 'SaaS Agreement', status: 'Analyzed', risk: 'Low', score: '24%', statusColor: 'text-emerald-400', riskBg: isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400' },
                { name: 'NDA Template', status: 'Reviewed', risk: 'Medium', score: '56%', statusColor: 'text-amber-400', riskBg: isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400' },
                { name: 'License Deal', status: 'Flagged', risk: 'High', score: '81%', statusColor: 'text-red-400', riskBg: isLight ? 'bg-red-100 text-red-700' : 'bg-red-500/20 text-red-400' },
              ].map((row) => (
                <div key={row.name} className={`grid grid-cols-4 gap-2 px-3 py-2.5 text-[10px] ${
                  isLight ? 'border-b border-slate-100' : 'border-b border-slate-800/50'
                }`}>
                  <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>{row.name}</span>
                  <span className={row.statusColor}>{row.status}</span>
                  <span><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${row.riskBg}`}>{row.risk}</span></span>
                  <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>{row.score}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Accordion Item
// ─────────────────────────────────────────────────────────────────────────────

function FAQItem({ question, answer, isOpen, onToggle, isLight }) {
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
      isOpen
        ? isLight
          ? 'border-brand-200 bg-brand-50/30 shadow-sm'
          : 'border-brand-500/30 bg-brand-500/5 shadow-lg shadow-brand-500/5'
        : isLight
          ? 'border-slate-200 bg-white hover:border-slate-300'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
    }`}>
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-5 sm:p-6 text-left"
      >
        <span className={`text-sm sm:text-base font-semibold pr-4 ${
          isLight ? 'text-slate-800' : 'text-slate-100'
        }`}>
          {question}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
          isOpen ? 'rotate-180' : ''
        } ${isLight ? 'text-brand-500' : 'text-brand-400'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`px-5 sm:px-6 pb-5 sm:pb-6 text-sm leading-relaxed ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>
          {answer}
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN LANDING PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'
  const [openFAQ, setOpenFAQ] = useState(null)
  const [statsRef, statsVisible] = useScrollReveal()
  const [activeDevice, setActiveDevice] = useState('desktop')

  // Set page title for SEO
  useEffect(() => {
    document.title = 'ContractMind — AI Contract Intelligence & Risk Scoring Platform'
    return () => { document.title = 'ContractMind' }
  }, [])

  // ── Data ──────────────────────────────────────────────────────────────────

  const features = [
    { icon: Brain, title: 'AI-Powered Analysis', desc: 'Legal-BERT NLP models automatically classify clauses, detect risk patterns, and surface critical issues in seconds.', color: 'text-brand-500', bg: isLight ? 'bg-brand-50' : 'bg-brand-500/10' },
    { icon: ShieldCheck, title: 'Risk Scoring Engine', desc: 'Proprietary scoring algorithm evaluates contracts across 50+ risk factors and returns board-ready risk assessments.', color: 'text-emerald-500', bg: isLight ? 'bg-emerald-50' : 'bg-emerald-500/10' },
    { icon: MessageSquare, title: 'RAG Chatbot', desc: 'Ask natural-language questions about your contracts. The AI retrieves context and generates accurate, cited answers.', color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-500/10' },
    { icon: Eye, title: 'Clause Intelligence', desc: 'Automatically identifies and classifies key clauses — indemnity, liability, termination, confidentiality, and more.', color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Visual analytics with trend charts, risk breakdowns, and portfolio-level insights for your entire contract library.', color: 'text-brand-500', bg: isLight ? 'bg-brand-50' : 'bg-brand-500/10' },
    { icon: Lock, title: 'Enterprise Security', desc: 'End-to-end encryption, role-based access control, and SOC 2 compliance for your most sensitive legal documents.', color: 'text-red-500', bg: isLight ? 'bg-red-50' : 'bg-red-500/10' },
    { icon: Zap, title: 'Instant Processing', desc: 'Upload PDFs, DOCX, or plain text and receive full analysis within seconds — no manual review required.', color: 'text-amber-500', bg: isLight ? 'bg-amber-50' : 'bg-amber-500/10' },
    { icon: Globe, title: 'Multi-Jurisdiction', desc: 'Supports analysis across US, UK, EU, and APAC legal frameworks with jurisdiction-specific risk weighting.', color: 'text-blue-500', bg: isLight ? 'bg-blue-50' : 'bg-blue-500/10' },
  ]

  const steps = [
    { icon: Upload, title: 'Upload Contracts', desc: 'Drag and drop your PDF, DOCX, or text files. Batch upload is supported.' },
    { icon: Brain, title: 'AI Analyzes', desc: 'Our Legal-BERT models extract entities, classify clauses, and compute risk scores automatically.' },
    { icon: BarChart3, title: 'Review Insights', desc: 'Explore interactive dashboards, risk breakdowns, and flagged clauses at a glance.' },
    { icon: CheckCircle, title: 'Take Action', desc: 'Export reports, ask the AI chatbot questions, and make informed contract decisions.' },
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'General Counsel', company: 'TechVentures Inc.', text: 'ContractMind cut our contract review time by 70%. The risk scoring is incredibly accurate and the AI chatbot saves us hours of manual clause searching.', rating: 5, initials: 'SC' },
    { name: 'James Morton', role: 'VP of Legal Operations', company: 'GlobalCorp', text: 'We process 200+ contracts monthly. ContractMind\'s batch analysis and analytics dashboard give our team the oversight we never had before. Game-changer.', rating: 5, initials: 'JM' },
    { name: 'Priya Sharma', role: 'Senior Legal Analyst', company: 'Apex Partners', text: 'The clause intelligence is remarkable. It catches risk patterns that even experienced reviewers miss. The RAG chatbot feels like having a legal expert on call 24/7.', rating: 5, initials: 'PS' },
  ]



  const faqs = [
    { q: 'How does the AI risk scoring work?', a: 'ContractMind uses fine-tuned Legal-BERT models to classify every clause in your contract against 50+ risk categories. Each clause receives a confidence score, and our proprietary algorithm aggregates these into an overall risk score from 0-100, where higher scores indicate greater risk exposure.' },
    { q: 'What file formats are supported?', a: 'We support PDF, DOCX, DOC, and plain text files. Our OCR engine can also extract text from scanned PDFs. You can upload individual files or use batch upload for processing multiple contracts at once.' },
    { q: 'Is my data secure?', a: 'Absolutely. All documents are encrypted at rest (AES-256) and in transit (TLS 1.3). We maintain SOC 2 Type II compliance, and your data is never used to train our models. Enterprise customers can opt for on-premise deployment for complete data sovereignty.' },
    { q: 'Can I ask questions about my contracts?', a: 'Yes! Our RAG (Retrieval-Augmented Generation) chatbot lets you ask natural-language questions about any uploaded contract. It retrieves relevant passages and generates accurate, contextualized answers with source citations.' },
    { q: 'How accurate is the clause classification?', a: 'Our Legal-BERT classifier achieves 94% accuracy across 15+ clause categories including indemnification, limitation of liability, termination, confidentiality, and IP assignment. The model is continuously improved with new training data from anonymized contract corpora.' },
     ]

  const trustedLogos = [
    'Acme Legal', 'TechVentures', 'GlobalCorp', 'Apex Partners', 'Sterling & Co', 'NovaTech'
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isLight ? 'bg-white text-slate-700' : 'bg-slate-950 text-slate-100'
    }`}>
      <LandingNavbar isLight={isLight} toggleTheme={toggleTheme} />

      {/* ════════════════════════ 1. HERO ════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -top-24 -left-24 h-96 w-96 rounded-full blur-3xl animate-float ${
            isLight ? 'bg-brand-200/30' : 'bg-brand-500/10'
          }`} />
          <div className={`absolute top-32 -right-32 h-80 w-80 rounded-full blur-3xl animate-float ${
            isLight ? 'bg-blue-200/30' : 'bg-blue-500/8'
          }`} style={{ animationDelay: '2s' }} />
          <div className={`absolute -bottom-20 left-1/3 h-72 w-72 rounded-full blur-3xl animate-float ${
            isLight ? 'bg-emerald-200/20' : 'bg-emerald-500/5'
          }`} style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-in-up">
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.3em] font-semibold mb-8 ${
                isLight
                  ? 'border-brand-200 bg-brand-50 text-brand-600'
                  : 'border-slate-700/80 bg-slate-800/80 text-brand-400 shadow-sm shadow-slate-950/20'
              }`}>
                <Sparkles className="h-4 w-4" />
                AI-Powered Legal Intelligence
              </span>

              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                Smarter Contract
                <span className="block bg-gradient-to-r from-brand-500 via-brand-400 to-blue-500 bg-clip-text text-transparent">
                  Risk Analysis
                </span>
              </h1>

              <p className={`mt-6 text-lg sm:text-xl leading-relaxed max-w-xl ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Upload any contract and get instant AI-powered risk scoring, clause classification, 
                and actionable insights. Built for modern legal teams who need speed without sacrificing accuracy.
              </p>

              {/* Stats */}
              <div ref={statsRef} className="flex flex-wrap gap-8 mt-8">
                {[
                  { value: 500, suffix: '+', label: 'Legal Teams' },
                  { value: 94, suffix: '%', label: 'Accuracy' },
                  { value: 70, suffix: '%', label: 'Time Saved' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className={`text-2xl sm:text-3xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} isVisible={statsVisible} />
                    </p>
                    <p className={`text-sm mt-1 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-brand-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/40 hover:brightness-110 hover:-translate-y-0.5"
                >
                  Start Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className={`inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                    isLight
                      ? 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <Play className="h-4 w-4" />
                  See How It Works
                </a>
              </div>
            </div>

            {/* Right: Dashboard Mockup */}
            <div className="animate-fade-in-up lg:animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className={`absolute inset-0 rounded-2xl blur-2xl ${
                  isLight ? 'bg-brand-200/20' : 'bg-brand-500/10'
                }`} />
                <div className="relative">
                  <DashboardMockup isLight={isLight} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ 2. TRUSTED BY ════════════════════════ */}
      <Section id="trusted-by" className={`py-12 sm:py-16 border-y ${
        isLight ? 'border-slate-100 bg-slate-50/50' : 'border-slate-900 bg-slate-950/50'
      }`}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <p className={`text-center text-sm font-medium tracking-wide uppercase mb-8 ${
            isLight ? 'text-slate-500' : 'text-slate-500'
          }`}>
            Trusted by 500+ legal teams worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
            {trustedLogos.map((name, i) => (
              <div
                key={name}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${
                  isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-600 hover:text-slate-400'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Shield className="h-5 w-5 opacity-50" />
                <span className="text-sm font-semibold tracking-wide whitespace-nowrap">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 3. FEATURES ════════════════════════ */}
      <Section id="features" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Features"
            title="Everything You Need for Intelligent Contract Review"
            subtitle="A complete AI-powered platform that transforms how legal teams analyze, score, and manage contract risk."
            isLight={isLight}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-brand-100/40'
                    : 'border-slate-800 bg-slate-900/60 hover:border-brand-500/30 hover:shadow-brand-500/5'
                }`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-2xl mb-4 transition-transform duration-300 group-hover:scale-110 ${feature.bg}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className={`text-base font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 4. BENEFITS ════════════════════════ */}
      <Section id="benefits" className={`py-20 sm:py-28 ${
        isLight ? 'bg-slate-50/80' : 'bg-slate-900/30'
      }`}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Why ContractMind"
            title="The Unfair Advantage for Legal Teams"
            subtitle="Stop spending weeks on manual contract review. Let AI handle the heavy lifting while your team focuses on strategic decisions."
            isLight={isLight}
          />

          <div className="space-y-20 sm:space-y-28">
            {/* Benefit 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold mb-6 ${
                  isLight ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                }`}>
                  <Zap className="h-3.5 w-3.5" />
                  10x Faster
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Review Contracts in Seconds, Not Days
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Our AI reads and classifies every clause instantly. What used to take a team of lawyers days now takes seconds. Upload, analyze, decide.
                </p>
                <ul className="space-y-3">
                  {['Automated clause detection & classification', 'Instant risk scoring across 50+ factors', 'Batch processing for contract portfolios'].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 mt-0.5 shrink-0 ${isLight ? 'text-emerald-500' : 'text-emerald-400'}`} />
                      <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl border p-6 ${
                isLight ? 'border-slate-200 bg-white shadow-lg shadow-slate-100' : 'border-slate-800 bg-slate-900/60 shadow-2xl shadow-slate-950/40'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-emerald-50' : 'bg-emerald-500/10'
                  }`}>
                    <Activity className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>Processing Speed</p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Average analysis time</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Traditional Review</span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>3-5 days</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div className="h-full rounded-full bg-red-400/70 w-[95%] transition-all duration-1000" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className={`text-xs font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>ContractMind AI</span>
                      <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>~30 seconds</span>
                    </div>
                    <div className={`h-3 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[8%] transition-all duration-1000" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className={`rounded-2xl border p-6 ${
                  isLight ? 'border-slate-200 bg-white shadow-lg shadow-slate-100' : 'border-slate-800 bg-slate-900/60 shadow-2xl shadow-slate-950/40'
                }`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      isLight ? 'bg-blue-50' : 'bg-blue-500/10'
                    }`}>
                      <Bot className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>AI Chatbot</p>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Ask anything about your contracts</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {/* Chat bubbles */}
                    <div className="flex justify-end">
                      <div className={`rounded-2xl rounded-br-md px-4 py-2.5 text-sm max-w-[80%] ${
                        isLight ? 'bg-brand-500 text-white' : 'bg-brand-600 text-white'
                      }`}>
                        What are the termination clauses in the SaaS agreement?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className={`rounded-2xl rounded-bl-md px-4 py-2.5 text-sm max-w-[80%] ${
                        isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-200'
                      }`}>
                        The SaaS agreement contains 2 termination clauses: (1) Either party may terminate with 30 days written notice, (2) Immediate termination for material breach...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold mb-6 ${
                  isLight ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                }`}>
                  <MessageSquare className="h-3.5 w-3.5" />
                  AI Assistant
                </div>
                <h3 className={`text-2xl sm:text-3xl font-bold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Ask Questions, Get Instant Answers
                </h3>
                <p className={`text-base leading-relaxed mb-6 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Don't dig through pages of legalese. Ask our RAG-powered chatbot any question about your contracts and get accurate, cited responses in real time.
                </p>
                <ul className="space-y-3">
                  {['Natural language queries across all contracts', 'Source citations for every answer', 'Context-aware follow-up conversations'].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className={`h-5 w-5 mt-0.5 shrink-0 ${isLight ? 'text-blue-500' : 'text-blue-400'}`} />
                      <span className={`text-sm ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 5. PRODUCT PREVIEW ════════════════════════ */}
      <Section id="product-preview" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Product Preview"
            title="A Dashboard Built for Legal Intelligence"
            subtitle="Get a bird's-eye view of your contract portfolio with real-time risk analytics, trend analysis, and AI-powered insights."
            isLight={isLight}
          />

          <div className="relative mx-auto transition-all duration-500 ease-in-out" style={{
            maxWidth: activeDevice === 'desktop' ? '1024px' : activeDevice === 'tablet' ? '640px' : '320px'
          }}>
            {/* Glow backdrop */}
            <div className={`absolute -inset-4 rounded-3xl blur-3xl pointer-events-none ${
              isLight ? 'bg-brand-100/40' : 'bg-brand-500/8'
            }`} />

            {/* Device Frame */}
            <div className={`relative rounded-3xl border-2 p-2 sm:p-3 transition-all duration-500 ease-in-out ${
              isLight
                ? 'border-slate-200 bg-slate-100 shadow-2xl shadow-slate-200/60'
                : 'border-slate-700/40 bg-slate-800/40 shadow-2xl shadow-slate-950/60'
            }`}>
              <DashboardMockup isLight={isLight} device={activeDevice} />
            </div>
          </div>

          {/* Device Controls (outside the resizing container) */}
          <div className="flex items-center justify-center gap-3 mt-8 relative z-10">
            {[
              { icon: Monitor, type: 'desktop', label: 'Desktop' },
              { icon: Tablet, type: 'tablet', label: 'Tablet' },
              { icon: Smartphone, type: 'mobile', label: 'Mobile' },
            ].map((dev) => (
              <button
                key={dev.type}
                onClick={() => setActiveDevice(dev.type)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 ${
                  activeDevice === dev.type
                    ? isLight
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white text-slate-950 shadow-md shadow-white/10'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-slate-50 border border-slate-200'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 bg-slate-900/50 border border-slate-800/60'
                }`}
              >
                <dev.icon className="h-3.5 w-3.5" />
                {dev.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 6. HOW IT WORKS ════════════════════════ */}
      <Section id="how-it-works" className={`py-20 sm:py-28 ${
        isLight ? 'bg-slate-50/80' : 'bg-slate-900/30'
      }`}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="How It Works"
            title="Four Simple Steps to Smarter Contracts"
            subtitle="Go from uploaded document to actionable intelligence in under a minute."
            isLight={isLight}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className={`hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-px ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`} />

            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {/* Step Number */}
                <div className={`relative z-10 inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-6 text-lg font-bold transition-transform duration-300 hover:scale-110 ${
                  isLight
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-200'
                    : 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/20'
                }`}>
                  {i + 1}
                </div>

                <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl mb-4 ${
                  isLight ? 'bg-slate-100' : 'bg-slate-800/60'
                }`}>
                  <step.icon className={`h-5 w-5 ${isLight ? 'text-brand-500' : 'text-brand-400'}`} />
                </div>

                <h3 className={`text-base font-semibold mb-2 ${
                  isLight ? 'text-slate-800' : 'text-slate-100'
                }`}>
                  {step.title}
                </h3>
                <p className={`text-sm leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 7. TESTIMONIALS ════════════════════════ */}
      <Section id="testimonials" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Testimonials"
            title="Loved by Legal Teams Everywhere"
            subtitle="Hear from the professionals who transformed their contract workflow with ContractMind."
            isLight={isLight}
          />

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`relative rounded-2xl border p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isLight
                    ? 'border-slate-200 bg-white hover:shadow-slate-100'
                    : 'border-slate-800 bg-slate-900/60 hover:shadow-slate-950/40'
                }`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold ${
                    isLight
                      ? 'bg-brand-100 text-brand-600'
                      : 'bg-brand-500/20 text-brand-400'
                  }`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>{t.name}</p>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.role}, {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>



      {/* ════════════════════════ 9. FAQ ════════════════════════ */}
      <Section id="faq" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="FAQ"
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about ContractMind. Can't find what you're looking for? Contact us."
            isLight={isLight}
          />

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
                isLight={isLight}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 10. FINAL CTA ════════════════════════ */}
      <Section id="cta" className="py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className={`relative overflow-hidden rounded-3xl p-10 sm:p-16 text-center ${
            isLight
              ? 'bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700'
              : 'bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800'
          }`}>
            {/* Background decorations */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                Ready to Transform Your
                <br className="hidden sm:block" />
                Contract Review Process?
              </h2>
              <p className="mt-5 text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                Join 500+ legal teams already using ContractMind to analyze contracts faster, 
                score risk accurately, and make better decisions.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-brand-600 shadow-xl shadow-brand-900/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  Start Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════ 11. FOOTER ════════════════════════ */}
      <footer className={`border-t py-16 sm:py-20 ${
        isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
      }`}>
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 mb-12">
            {/* Brand Column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="footerLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                    fill="url(#footerLogoGrad)"
                    stroke="url(#footerLogoGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-brand-500">Contract</span>
                  <span className={isLight ? 'text-slate-800' : 'text-slate-100'}>Mind</span>
                </span>
              </div>
              <p className={`text-sm leading-relaxed max-w-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                AI-powered contract intelligence and risk scoring platform for modern legal teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}>Product</h4>
              <ul className="space-y-2.5">
                {['Features', 'Security', 'Integrations', 'API'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className={`text-sm transition hover:underline underline-offset-4 ${
                      isLight ? 'text-slate-600 hover:text-brand-600' : 'text-slate-400 hover:text-brand-400'
                    }`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}>Company</h4>
              <ul className="space-y-2.5">
                {['About', 'Blog', 'Careers', 'Contact', 'Partners'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm transition hover:underline underline-offset-4 ${
                      isLight ? 'text-slate-600 hover:text-brand-600' : 'text-slate-400 hover:text-brand-400'
                    }`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}>Legal</h4>
              <ul className="space-y-2.5">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'SOC 2'].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm transition hover:underline underline-offset-4 ${
                      isLight ? 'text-slate-600 hover:text-brand-600' : 'text-slate-400 hover:text-brand-400'
                    }`}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              © {new Date().getFullYear()} ContractMind. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Social placeholders using Lucide icons */}
              {[Globe, MessageSquare, Users].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className={`p-2 rounded-full transition ${
                    isLight
                      ? 'text-slate-400 hover:text-brand-500 hover:bg-slate-100'
                      : 'text-slate-500 hover:text-brand-400 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
