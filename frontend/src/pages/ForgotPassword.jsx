import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'

import { forgotPassword, resetPassword } from '../api/auth'
import { useTheme } from '../context/ThemeContext.jsx'
import PasswordStrengthMeter from '../components/form/PasswordStrengthMeter.jsx'

export default function ForgotPassword() {
  // Step 1: email verification
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 2: password reset (inline)
  const [verified, setVerified] = useState(false)
  const [token, setToken] = useState('')
  const [verifiedEmail, setVerifiedEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  // Step 1: Verify the email exists
  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await forgotPassword(email)
      setToken(response.token)
      setVerifiedEmail(response.email || email)
      setVerified(true)
    } catch (err) {
      console.error(err)
      setError(err.message || 'No account found with this email address.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset the password
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

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setResetLoading(true)
    setResetError('')
    try {
      await resetPassword({ email: verifiedEmail, token, password })
      setSuccess(true)
    } catch (err) {
      console.error(err)
      setResetError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  // Dynamic left panel content based on current step
  const getLeftPanelContent = () => {
    if (success) {
      return {
        title: 'Password updated successfully',
        description: 'Your credentials have been securely updated. You can now sign in with your new password to access your contract workspace.',
        cards: [
          { icon: <CheckCircle2 className="h-6 w-6" />, title: 'Credentials secured', text: 'Your new password is encrypted and stored securely with industry-standard hashing.' },
          { icon: <ShieldCheck className="h-6 w-6" />, title: 'Session refreshed', text: 'All previous sessions have been invalidated for your security.' },
        ],
      }
    }
    if (verified) {
      return {
        title: 'Account verified — set new password',
        description: 'Your identity has been confirmed. Choose a strong, unique password to protect your contract workspace.',
        cards: [
          { icon: <Lock className="h-6 w-6" />, title: 'Strong password', text: 'Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.' },
          { icon: <ShieldCheck className="h-6 w-6" />, title: 'Secure reset', text: 'This reset token is single-use and expires in 1 hour for your protection.' },
        ],
      }
    }
    return {
      title: 'Recover your contract workspace access',
      description: 'Enter your registered email address and we will verify your account to let you reset your credentials.',
      cards: [
        { icon: <ShieldCheck className="h-6 w-6" />, title: 'Secure Recovery', text: 'All password reset requests generate single-use, time-restricted security tokens.' },
        { icon: <Mail className="h-6 w-6" />, title: 'Audit Logging', text: 'Every password recovery request is cryptographically signed and logged for security auditing.' },
      ],
    }
  }

  const panel = getLeftPanelContent()

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-10 transition-colors duration-300 sm:px-6 lg:px-8 ${
      isLight ? 'bg-slate-50 text-slate-700' : 'bg-slate-950 text-slate-100'
    }`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent opacity-70" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent opacity-80 md:w-96" />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* ─── Left Panel ─── */}
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
                {panel.title}
              </h1>
              <p className={`mt-5 max-w-xl text-base leading-8 sm:text-lg ${
                isLight ? 'text-slate-600' : 'text-slate-300'
              }`}>
                {panel.description}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {panel.cards.map((card) => (
                <article key={card.title} className={`rounded-3xl border p-5 shadow-lg backdrop-blur ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 shadow-slate-100'
                    : 'border-slate-800 bg-slate-950/70 shadow-slate-950/30'
                }`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
                    {card.icon}
                  </div>
                  <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>{card.title}</h2>
                  <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Right Panel ─── */}
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

              {/* ─── Step 3: Success ─── */}
              {success ? (
                <>
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.35em] text-brand-500 dark:text-brand-400 font-semibold">Password Reset</p>
                    <h2 className={`text-3xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>All done!</h2>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Your password has been successfully updated.</p>
                  </div>

                  <div className={`rounded-3xl border p-5 text-sm shadow-xl backdrop-blur flex items-start gap-4 ${
                    isLight
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                  }`}>
                    <CheckCircle2 className={`h-6 w-6 shrink-0 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <div>
                      <p className={`font-semibold ${isLight ? 'text-emerald-800' : 'text-emerald-100'}`}>Password reset complete!</p>
                      <p className="mt-1 leading-relaxed">
                        You can now sign in with your new password to access your contract workspace.
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110"
                  >
                    Continue to Sign In <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : verified ? (
                /* ─── Step 2: Password Reset Form ─── */
                <>
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.35em] text-brand-500 dark:text-brand-400 font-semibold">Account Verified</p>
                    <h2 className={`text-3xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Set new password</h2>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Create a new password for <strong>{verifiedEmail}</strong>
                    </p>
                  </div>

                  <div className={`rounded-3xl border p-4 text-sm flex items-center gap-3 ${
                    isLight
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300'
                  }`}>
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                    <span>Email verified — <strong>{verifiedEmail}</strong></span>
                  </div>

                  <form className="space-y-6" onSubmit={handlePasswordSubmit} noValidate>
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
                          placeholder="Enter new password"
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
                        placeholder="Repeat new password"
                        className={`w-full rounded-3xl border px-4 py-3 outline-none transition duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                          isLight
                            ? 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white'
                            : 'border-slate-700/70 bg-slate-950/70 text-slate-100 placeholder-slate-500 focus:bg-slate-900/95'
                        }`}
                      />
                      {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{fieldErrors.confirmPassword}</p>}
                    </label>

                    {resetError && <p className="text-sm text-rose-500">{resetError}</p>}

                    <button
                      type="submit"
                      disabled={resetLoading || !password || !confirmPassword}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {resetLoading ? 'Updating Password…' : 'Update Password'}
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
                </>
              ) : (
                /* ─── Step 1: Email Verification ─── */
                <>
                  <div className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.35em] text-brand-500 dark:text-brand-400 font-semibold">Forgot Password</p>
                    <h2 className={`text-3xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Verify your account</h2>
                    <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Enter your workspace email to verify your identity and reset your password.</p>
                  </div>

                  <form className="space-y-6" onSubmit={handleEmailSubmit}>
                    <label className="block text-sm font-medium">
                      <span className={`mb-2 inline-flex items-center gap-2 font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                        <Mail className="h-4 w-4 text-brand-500 dark:text-brand-400" /> Email Address
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

                    {error && <p className="text-sm text-rose-500">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? 'Verifying…' : 'Verify Account'}
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="flex justify-center">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-brand-500 hover:text-brand-600 transition"
                      >
                        <ArrowLeft className="h-4 w-4" /> Back to login
                      </Link>
                    </div>
                  </form>
                </>
              )}

              <div className={`rounded-3xl border p-4 text-sm shadow-xl ${
                isLight
                  ? 'border-slate-200 bg-slate-50 text-slate-600 shadow-slate-100'
                  : 'border-slate-800 bg-slate-950/70 text-slate-400 shadow-slate-950/20'
              }`}>
                <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Need assistance?</p>
                <p className="mt-2 leading-relaxed">Contact your organization administrator to unlock accounts manually or modify workspace access rules.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
