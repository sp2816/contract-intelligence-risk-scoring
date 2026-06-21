import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { resetPassword } from '../api/auth'
import PasswordStrengthMeter from '../components/form/PasswordStrengthMeter.jsx'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const validate = () => {
    const nextErrors = {}
    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      await resetPassword({
        email,
        token,
        password
      })
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to reset password. The link might be invalid or expired.')
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
                Reset your password
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Enter your new password to regain access. Make sure it is secure and meets the required password strength criteria.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Cryptographic validation</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Tokens are cryptographically generated and are only valid for 1 hour.</p>
              </article>
              <article className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30 backdrop-blur">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">Complex credentials</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">Enter a strong combination of letters, numbers, and symbols to ensure protection.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="flex-1">
          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-500/20 via-indigo-500/10 to-cyan-400/15 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Security reset</p>
                <h2 className="text-3xl font-semibold text-white">Create new credentials</h2>
                <p className="text-sm text-slate-400">Set up your new password for <strong>{email || 'your account'}</strong></p>
              </div>

              {success ? (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/40 p-5 text-sm text-emerald-300 shadow-xl backdrop-blur flex items-start gap-4">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-100">Password reset complete!</p>
                      <p className="mt-1 leading-relaxed">
                        Your password has been successfully updated. You can now use your new password to log in.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200"
                  >
                    Continue to Sign In <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : !token ? (
                <div className="rounded-3xl border border-rose-500/30 bg-rose-950/40 p-5 text-sm text-rose-350 shadow-xl backdrop-blur">
                  <p className="font-semibold text-rose-100">Missing reset token</p>
                  <p className="mt-2">
                    A valid token is required to reset your password. Please click the recovery link in the email or log console.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center gap-2 text-sm text-sky-300 hover:text-sky-200 transition"
                    >
                      <ArrowLeft className="h-4 w-4" /> Request new recovery link
                    </Link>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-slate-200">
                      <span className="mb-2 inline-flex items-center gap-2 text-slate-300">
                        <Lock className="h-4 w-4 text-sky-300" /> New Password
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        placeholder="New password"
                        className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-sky-400 focus:bg-slate-900/95 focus:ring-2 focus:ring-sky-500/20"
                      />
                      {fieldErrors.password && <p className="mt-1 text-xs text-rose-450">{fieldErrors.password}</p>}
                    </label>
                    <PasswordStrengthMeter password={password} />
                  </div>

                  <label className="block text-sm font-medium text-slate-200">
                    <span className="mb-2 inline-flex items-center gap-2 text-slate-300">
                      <Lock className="h-4 w-4 text-sky-300" /> Confirm New Password
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      placeholder="Repeat password"
                      className="w-full rounded-3xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition duration-200 focus:border-sky-400 focus:bg-slate-900/95 focus:ring-2 focus:ring-sky-500/20"
                    />
                    {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-rose-450">{fieldErrors.confirmPassword}</p>}
                  </label>

                  {error && <p className="text-sm text-rose-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Updating Password…' : 'Update Password'}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex justify-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition"
                    >
                      <ArrowLeft className="h-4 w-4" /> Cancel and return to login
                    </Link>
                  </div>
                </form>
              )}

              <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-4 text-sm text-slate-400 shadow-xl shadow-slate-950/20">
                <p className="font-semibold text-slate-350">Security Tip</p>
                <p className="mt-1">Use a unique password not shared with other accounts, containing at least 8 characters, casing variation, and special symbols.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
