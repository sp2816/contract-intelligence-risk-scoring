import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { resetPassword } from '../api/auth'
import { useTheme } from '../context/ThemeContext.jsx'
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
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

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
                Reset your password
              </h1>
              <p className={`mt-5 max-w-xl text-base leading-8 sm:text-lg ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>
                Enter your new password to regain access. Make sure it is secure and meets the required password strength criteria.
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
                <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Cryptographic validation</h2>
                <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Tokens are cryptographically generated and are only valid for 1 hour.</p>
              </article>
              <article className={`rounded-3xl border p-5 shadow-lg backdrop-blur ${
                isLight
                  ? 'border-slate-200 bg-slate-50 shadow-slate-100'
                  : 'border-slate-800 bg-slate-950/70 shadow-slate-950/30'
              }`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
                  <Lock className="h-6 w-6" />
                </div>
                <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Complex credentials</h2>
                <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Enter a strong combination of letters, numbers, and symbols to ensure protection.</p>
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
                <p className="text-sm uppercase tracking-[0.35em] text-brand-500 dark:text-brand-400 font-semibold">Security reset</p>
                <h2 className={`text-3xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Create new credentials</h2>
                <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Set up your new password for <strong>{email || 'your account'}</strong></p>
              </div>

              {success ? (
                <div className="space-y-6">
                  <div className={`rounded-3xl border p-5 text-sm shadow-xl backdrop-blur flex items-start gap-4 ${
                    isLight
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                  }`}>
                    <CheckCircle2 className={`h-6 w-6 shrink-0 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <div>
                      <p className={`font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-100'}`}>Password reset complete!</p>
                      <p className="mt-1 leading-relaxed">
                        Your password has been successfully updated. You can now use your new password to log in.
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110"
                  >
                    Continue to Sign In <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : !token ? (
                <div className={`rounded-3xl border p-5 text-sm shadow-xl backdrop-blur ${
                  isLight
                    ? 'border-rose-300 bg-rose-50 text-rose-700'
                    : 'border-rose-500/30 bg-rose-950/40 text-rose-350'
                }`}>
                  <p className={`font-semibold ${isLight ? 'text-rose-800' : 'text-rose-100'}`}>Missing reset token</p>
                  <p className="mt-2">
                    A valid token is required to reset your password. Please click the recovery link in the email or log console.
                  </p>
                  <div className="mt-4">
                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition"
                    >
                      <ArrowLeft className="h-4 w-4" /> Request new recovery link
                    </Link>
                  </div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="space-y-4">
                    <label className="block text-sm font-medium">
                      <span className={`mb-2 inline-flex items-center gap-2 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Lock className="h-4 w-4 text-brand-500 dark:text-brand-400" /> New Password
                      </span>
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        placeholder="New password"
                        className={`w-full rounded-3xl border px-4 py-3 outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                          isLight
                            ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                            : 'border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:bg-slate-900/95'
                        }`}
                      />
                      {fieldErrors.password && <p className="mt-1 text-xs text-rose-500">{fieldErrors.password}</p>}
                    </label>
                    <PasswordStrengthMeter password={password} />
                  </div>

                  <label className="block text-sm font-medium">
                    <span className={`mb-2 inline-flex items-center gap-2 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      <Lock className="h-4 w-4 text-brand-500 dark:text-brand-400" /> Confirm New Password
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      required
                      placeholder="Repeat password"
                      className={`w-full rounded-3xl border px-4 py-3 outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                        isLight
                          ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                          : 'border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:bg-slate-900/95'
                      }`}
                    />
                    {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{fieldErrors.confirmPassword}</p>}
                  </label>

                  {error && <p className="text-sm text-rose-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Updating Password…' : 'Update Password'}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex justify-center">
                    <Link
                      to="/login"
                      className={`inline-flex items-center gap-2 text-sm transition ${isLight ? 'text-slate-500 hover:text-slate-700' : 'text-slate-400 hover:text-slate-300'}`}
                    >
                      <ArrowLeft className="h-4 w-4" /> Cancel and return to login
                    </Link>
                  </div>
                </form>
              )}

              <div className={`rounded-3xl border p-4 text-sm shadow-xl ${
                isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-600 shadow-slate-100'
                  : 'border-slate-800 bg-slate-950/70 text-slate-400 shadow-slate-950/20'
              }`}>
                <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Security Tip</p>
                <p className="mt-2 leading-relaxed">Use a unique password not shared with other accounts, containing at least 8 characters, casing variation, and special symbols.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
