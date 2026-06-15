import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await login({ email, password, remember: rememberMe })
      navigate(from, { replace: true })
    } catch (err) {
      console.error(err)
    }
  }


  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_38%)] opacity-70" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.15),_transparent_45%)] opacity-80 md:w-96" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <section className="relative flex-1 overflow-hidden rounded-[2rem] bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50 ring-1 ring-white/10 backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.35),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.18),_transparent_22%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/80 px-4 py-2 text-xs uppercase tracking-[0.35em] text-sky-300 shadow-sm shadow-slate-950/20">
                <Sparkles className="h-4 w-4 text-sky-300" />
                Enterprise AI Legal Platform
              </span>

              <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                AI Contract Intelligence & Risk Scoring
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Securely analyze contract risk, automate clause review, and gain board-ready insights with enterprise-grade AI workflows.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Trusted risk coverage</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Built for legal teams who need transparent, auditable AI outcomes and secure contract scoring.</p>
              </article>
              <article className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Instant alerts</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Receive risk and compliance signals directly to your inbox, so you never miss a critical contract issue.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="flex-1">
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-500/20 via-indigo-500/10 to-cyan-400/15 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Secure login</p>
                <h2 className="text-3xl font-semibold text-white">Sign in to your workspace</h2>
                <p className="text-sm text-slate-400">Use your secure credentials to access contract analysis, risk scoring, and enterprise reports.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 inline-flex items-center gap-2 text-slate-300">
                    <Mail className="h-4 w-4 text-sky-300" /> Email
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@company.com"
                    className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-sky-400 focus:bg-slate-900/95 focus:ring-2 focus:ring-sky-500/20"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-200">
                  <span className="mb-2 inline-flex items-center gap-2 text-slate-300">
                    <Lock className="h-4 w-4 text-sky-300" /> Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-sky-400 focus:bg-slate-900/95 focus:ring-2 focus:ring-sky-500/20"
                  />
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-sky-400 focus:ring-sky-300"
                    />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-sky-300 transition hover:text-sky-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && <p className="text-sm text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'Continue'}
                  <ArrowRight className="h-4 w-4" />
                </button>


              </form>

              <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-xl shadow-slate-950/20">
                <p className="font-medium text-slate-100">AI Contract Intelligence</p>
                <p className="mt-2 text-slate-400">Modern enterprise SaaS for legal teams with adaptive risk scoring, clause intelligence, and contract reliability insights.</p>
              </div>

              <p className="text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-sky-300 transition hover:text-sky-200 hover:underline underline-offset-4"
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
