import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Mail, Lock, User, ShieldCheck, Sparkles, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import TextInput from '../components/form/TextInput.jsx'
import PasswordStrengthMeter from '../components/form/PasswordStrengthMeter.jsx'
import CheckboxField from '../components/form/CheckboxField.jsx'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const { register, loading, error } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const navigate = useNavigate()

  const passwordValidations = useMemo(() => ({
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  }), [password])

  const validate = () => {
    const nextErrors = {}

    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!email.trim()) nextErrors.email = 'Email address is required.'
    else if (!emailPattern.test(email)) nextErrors.email = 'Enter a valid email address.'
    
    if (!password) nextErrors.password = 'Password is required.'
    else if (password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    if (!confirmPassword) nextErrors.confirmPassword = 'Please confirm your password.'
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    if (!acceptedTerms) nextErrors.terms = 'You must agree to the terms and conditions.'

    setFieldErrors(nextErrors)
    setFormError(Object.keys(nextErrors).length ? 'Please fix the highlighted fields before continuing.' : '')
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    try {
      await register({ name: fullName, email, password, organization })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setFormError('Registration failed. Please try again.')
    }
  }

  return (
    <div className={`relative min-h-screen overflow-hidden px-4 py-10 transition-colors duration-300 sm:px-6 lg:px-8 ${
      isLight ? 'bg-slate-50 text-slate-700' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Background Orbs */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent opacity-70" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent opacity-80" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className={`relative overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl sm:p-10 lg:p-12 ${
            isLight
              ? 'bg-white border-slate-200/80 shadow-slate-100 shadow-xl'
              : 'bg-slate-900/80 border-white/10 shadow-slate-950/40'
          }`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(175,23,99,0.1),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.08),_transparent_28%)]" />
            <div className="relative z-10 space-y-8">
              <div className={`flex items-center gap-3 rounded-3xl border px-4 py-3 text-sm font-semibold ${
                isLight
                  ? 'border-brand-200 bg-brand-50 text-brand-600 shadow-sm'
                  : 'border-slate-800 bg-slate-950/50 text-brand-400 shadow-sm shadow-slate-950/20'
              }`}>
                <Sparkles className="h-4 w-4" />
                AI legal platform built for modern enterprise teams
              </div>
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-brand-500 dark:text-brand-400 font-semibold">Start faster</p>
                <h1 className={`text-4xl font-semibold tracking-tight sm:text-5xl ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  Create your account and unlock contract intelligence
                </h1>
                <p className={`max-w-xl text-base leading-8 sm:text-lg ${
                  isLight ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Tailored for legal, compliance, and risk teams, this platform combines AI contract insights with enterprise-grade security and collaborative workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <article className={`rounded-3xl border p-5 shadow-lg backdrop-blur-xl ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 shadow-slate-100'
                    : 'border-slate-800 bg-slate-950/70 shadow-slate-950/20'
                }`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Secure enterprise access</h2>
                  <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Keep your contract scoring environment protected with role-aware sign-in and audit-ready compliance controls.</p>
                </article>
                <article className={`rounded-3xl border p-5 shadow-lg backdrop-blur-xl ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 shadow-slate-100'
                    : 'border-slate-800 bg-slate-950/70 shadow-slate-950/20'
                }`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 dark:text-brand-400">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-800' : 'text-white'}`}>Organization-ready</h2>
                  <p className={`mt-2 text-sm leading-6 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Create a centralized workspace for teams to manage contracts, risk scoring, and legal review efficiently.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="flex-1">
            <div className={`relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl sm:p-10 ${
              isLight
                ? 'bg-white border-slate-200/80 shadow-slate-100 shadow-xl'
                : 'bg-white/5 border-white/10 shadow-slate-950/40'
            }`}>
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-500/15 via-indigo-500/10 to-brand-300/15 blur-3xl" />
              <div className="relative z-10 space-y-8">
                <button
                  onClick={() => navigate('/login')}
                  className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 hover:shadow-md ${
                    isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-600'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-400'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  Back to sign in
                </button>

                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.35em] text-brand-500 dark:text-brand-400 font-semibold">Register</p>
                  <h2 className={`text-3xl font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Build your AI legal workspace</h2>
                  <p className={`text-sm ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Complete your registration to access contract analytics, risk scoring, and secure team workflows.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextInput
                      label="Full name"
                      name="fullName"
                      icon={User}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Alex Morgan"
                      error={fieldErrors.fullName}
                      autoComplete="name"
                    />

                    <TextInput
                      label="Organization"
                      name="organization"
                      icon={Briefcase}
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                      placeholder="Acme Legal"
                      error={fieldErrors.organization}
                      autoComplete="organization"
                    />
                  </div>

                  <TextInput
                    label="Email"
                    name="email"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    error={fieldErrors.email}
                    autoComplete="email"
                  />

                  <div className="grid gap-6 sm:grid-cols-2">
                    <TextInput
                      label="Password"
                      name="password"
                      icon={Lock}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Create password"
                      error={fieldErrors.password}
                      autoComplete="new-password"
                    />

                    <TextInput
                      label="Confirm password"
                      name="confirmPassword"
                      icon={Lock}
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat password"
                      error={fieldErrors.confirmPassword}
                      autoComplete="new-password"
                    />
                  </div>

                  <PasswordStrengthMeter password={password} />

                  <CheckboxField
                    label="I agree to the terms and conditions"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    error={fieldErrors.terms}
                    description={
                      <span>
                        By signing up, you agree to our{' '}
                        <a href="/terms" className="font-semibold text-brand-500 hover:text-brand-600 transition">
                          terms of service
                        </a>
                        .
                      </span>
                    }
                  />

                  {formError && <p className="text-sm text-rose-500">{formError}</p>}
                  {error && <p className="text-sm text-rose-500">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {loading ? 'Creating account…' : 'Create account'}
                  </button>
                </form>

                <div className={`rounded-3xl border p-5 text-sm shadow-xl ${
                  isLight
                    ? 'border-slate-200 bg-slate-50 text-slate-600 shadow-slate-100'
                    : 'border-slate-800 bg-slate-950/70 text-slate-400 shadow-slate-950/20'
                }`}>
                  <p className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>Already have an account?</p>
                  <p className="mt-2">
                    <Link to="/login" className="font-semibold text-brand-500 hover:text-brand-600 transition hover:underline underline-offset-4">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Register
