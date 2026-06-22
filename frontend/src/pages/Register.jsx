import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Mail, Lock, User, ShieldCheck, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_30%)] opacity-70" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-80 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_40%)] opacity-80" />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_28%)]" />
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3 rounded-3xl border border-slate-700/70 bg-slate-950/50 px-4 py-3 text-sm text-sky-300 shadow-sm shadow-slate-950/20">
                <Sparkles className="h-4 w-4" />
                AI legal platform built for modern enterprise teams
              </div>
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Start faster</p>
                <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Create your account and unlock contract intelligence
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                  Tailored for legal, compliance, and risk teams, this platform combines AI contract insights with enterprise-grade security and collaborative workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <article className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">Secure enterprise access</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Keep your contract scoring environment protected with role-aware sign-in and audit-ready compliance controls.</p>
                </article>
                <article className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/20 backdrop-blur-xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-white">Organization-ready</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">Create a centralized workspace for teams to manage contracts, risk scoring, and legal review efficiently.</p>
                </article>
              </div>
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-10">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-cyan-400/15 blur-3xl" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Register</p>
                <h2 className="text-3xl font-semibold text-white">Build your AI legal workspace</h2>
                <p className="text-sm text-slate-400">Complete your registration to access contract analytics, risk scoring, and secure team workflows.</p>
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
                  <div className="space-y-4">
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
                    <PasswordStrengthMeter password={password} />
                  </div>

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

                <CheckboxField
                  label="I agree to the terms and conditions"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  error={fieldErrors.terms}
                  description={
                    <span>
                      By signing up, you agree to our{' '}
                      <a href="/terms" className="font-semibold text-sky-300 hover:text-sky-200">
                        terms of service
                      </a>
                      .
                    </span>
                  }
                />

                {formError && <p className="text-sm text-rose-400">{formError}</p>}
                {error && <p className="text-sm text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <div className="rounded-3xl border border-slate-700/60 bg-slate-950/70 p-5 text-sm text-slate-300 shadow-xl shadow-slate-950/20">
                <p className="font-semibold text-slate-100">Already have an account?</p>
                <p className="mt-2">
                  <Link to="/login" className="font-semibold text-sky-300 hover:text-sky-200">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Register
