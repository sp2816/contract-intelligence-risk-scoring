import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'

import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem('remembered_email') || '')
  const [password, setPassword] = useState(() => localStorage.getItem('remembered_password') || '')
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('remember_me') === 'true')
  const { login, loading, error } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const saveRememberedDetails = () => {
    if (rememberMe) {
      localStorage.setItem('remembered_email', email)
      localStorage.setItem('remembered_password', password)
      localStorage.setItem('remember_me', 'true')
    } else {
      localStorage.removeItem('remembered_email')
      localStorage.removeItem('remembered_password')
      localStorage.setItem('remember_me', 'false')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      saveRememberedDetails()
      await login({ email, password, remember: rememberMe })
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-10 transition-colors duration-300 sm:px-6 lg:px-8 ${
      isLight ? 'bg-slate-50 text-slate-700' : 'bg-slate-950 text-slate-100'
    }`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent opacity-70" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent opacity-80 md:w-96" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <section className={`relative flex-1 overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl sm:p-10 lg:p-12 ${
          isLight
            ? 'bg-white border-slate-200/80 shadow-slate-100 shadow-xl'
            : 'bg-slate-900/80 border-white/10 shadow-slate-950/50'
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(175,23,99,0.1),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.08),_transparent_22%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.35em] font-semibold ${
                isLight
                  ? 'border-brand-200 bg-brand-50 text-brand-600'
                  : 'border-slate-800 bg-slate-900/80 text-brand-400'
              }`}>
                <Sparkles className="h-4 w-4" />
                Enterprise AI Legal Platform
              </span>

              <h1 className={`mt-8 text-4xl font-semibold tracking-tight sm:text-5xl ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                AI Contract Intelligence & Risk Scoring
              </h1>
              <p className={`mt-5 max-w-xl text-base leading-8 sm:text-lg ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>
                Securely analyze contract risk, automate clause review, and gain board-ready insights with enterprise-grade AI workflows.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className={`rounded-3xl border p-5 shadow-lg backdrop-blur ${
                isLight
                  ? 'border-slate-200 bg-slate-50 shadow-slate-100'
                  : 'border-slate-800 bg-slate-950/70 shadow-slate-950/30'
              }`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Trusted risk coverage</h2>
                <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Built for legal teams who need transparent, auditable AI outcomes and secure contract scoring.</p>
              </article>
              <article className={`rounded-3xl border p-5 shadow-lg backdrop-blur ${
                isLight
                  ? 'border-slate-200 bg-slate-50 shadow-slate-100'
                  : 'border-slate-800 bg-slate-950/70 shadow-slate-950/30'
              }`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Instant alerts</h2>
                <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Receive risk and compliance signals directly to your inbox, so you never miss a critical contract issue.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="flex-1">
          <div className={`relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl sm:p-10 ${
            isLight
              ? 'bg-white border-slate-200/80 shadow-slate-100'
              : 'bg-white/5 border-white/10 shadow-slate-950/40'
          }`}>
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-500/20 via-indigo-500/10 to-brand-300/15 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <button
                onClick={() => navigate('/landing')}
                className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-400'
                }`}
              >
                <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                Back to home
              </button>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-brand-500 dark:text-brand-400 font-semibold">Secure login</p>
                <h2 className={`text-3xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Sign in to your workspace</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Use your secure credentials to access contract analysis, risk scoring, and enterprise reports.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium">
                  <span className={`mb-2 inline-flex items-center gap-2 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Mail className="h-4 w-4 text-brand-500 dark:text-brand-400" /> Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@company.com"
                    className={`w-full rounded-3xl border px-4 py-3 outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                        : 'border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:bg-slate-900/95'
                    }`}
                  />
                </label>

                <label className="block text-sm font-medium">
                  <span className={`mb-2 inline-flex items-center gap-2 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <Lock className="h-4 w-4 text-brand-500 dark:text-brand-400" /> Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className={`w-full rounded-3xl border px-4 py-3 outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                      isLight
                        ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                        : 'border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:bg-slate-900/95'
                    }`}
                  />
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className={`inline-flex items-center gap-3 text-sm cursor-pointer ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className={`h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 focus:ring-2 ${
                        isLight ? 'bg-white' : 'bg-slate-900 border-slate-600'
                      }`}
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 transition"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && <p className="text-sm text-rose-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {loading ? 'Signing in…' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className={`rounded-3xl border p-4 text-sm shadow-xl ${
                isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-600 shadow-slate-100'
                  : 'border-slate-800 bg-slate-950/70 text-slate-400 shadow-slate-950/20'
              }`}>
                <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>AI Contract Intelligence</p>
                <p className="mt-2 leading-relaxed">Modern enterprise SaaS for legal teams with adaptive risk scoring, clause intelligence, and contract reliability insights.</p>
              </div>

              <p className={`text-center text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-brand-500 transition hover:text-brand-600 hover:underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
