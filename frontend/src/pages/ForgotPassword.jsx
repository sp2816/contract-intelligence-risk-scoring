import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ShieldCheck, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import { forgotPassword } from '../api/auth'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    try {
      const response = await forgotPassword(email)
      setMessage(response.message || 'If the email exists, a password reset link has been generated.')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to request password reset.')
    } finally {
      setLoading(false)
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
                Recover your contract workspace access
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Enter your registered email address and we will generate a secure recovery token to let you reset your credentials.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Secure Recovery</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">All password reset requests generate single-use, time-restricted security tokens.</p>
              </article>
              <article className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <Mail className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Audit Logging</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Every password recovery request is cryptographically signed and logged for security auditing.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="flex-1">
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-500/20 via-indigo-500/10 to-cyan-400/15 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Forgot Password</p>
                <h2 className="text-3xl font-semibold text-white">Request reset link</h2>
                <p className="text-sm text-slate-400">Fill in your workspace email to generate a secure reset link.</p>
              </div>

              {message ? (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/40 p-5 text-sm text-emerald-300 shadow-xl backdrop-blur">
                    <p className="font-semibold text-emerald-100">Recovery email sent successfully!</p>
                    <p className="mt-2 leading-relaxed">
                      {message}
                    </p>
                    <p className="mt-2 font-medium text-emerald-400">
                      Note: Since this is a local development server, the reset link is logged directly to the backend terminal console and the file <code>backend/instance/auth_failures.log</code>.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-slate-900 border border-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Sign In
                  </Link>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <label className="block text-sm font-medium text-slate-200">
                    <span className="mb-2 inline-flex items-center gap-2 text-slate-300">
                      <Mail className="h-4 w-4 text-sky-300" /> Email Address
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

                  {error && <p className="text-sm text-rose-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Generating Link…' : 'Generate Recovery Link'}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex justify-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200 transition"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to login
                    </Link>
                  </div>
                </form>
              )}

              <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4 text-sm text-slate-400 shadow-xl shadow-slate-950/20">
                <p className="font-semibold text-slate-350">Need assistance?</p>
                <p className="mt-1">Contact your organization administrator to unlock accounts manually or modify workspace access rules.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
