function PasswordStrengthMeter({ password }) {
  const checks = [
    { label: 'Min 8 characters', valid: password.length >= 8 },
    { label: 'Upper + lower case', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Number included', valid: /\d/.test(password) },
    { label: 'Symbol included', valid: /[^A-Za-z0-9]/.test(password) },
  ]

  const score = checks.filter((check) => check.valid).length
  const label =
    score === 4 ? 'Very strong' : score === 3 ? 'Strong' : score === 2 ? 'Fair' : 'Weak'

  const progressClass =
    score === 4
      ? 'bg-emerald-400'
      : score === 3
      ? 'bg-sky-400'
      : score === 2
      ? 'bg-amber-400'
      : 'bg-rose-400'

  return (
    <div className="rounded-3xl border border-slate-700/80 bg-slate-950/70 p-4 text-sm text-slate-300 shadow-sm shadow-slate-950/30 backdrop-blur-xl">
      <div className="flex items-center justify-between text-sm font-medium text-slate-100">
        <span>Password strength</span>
        <span className={progressClass}>{label}</span>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className={`${progressClass} h-full rounded-full transition-all duration-300`}
            style={{ width: `${(score / checks.length) * 100}%` }}
          />
        </div>
        <div className="grid gap-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-2">
              <span
                className={`inline-flex h-2.5 w-2.5 shrink-0 rounded-full ${
                  check.valid ? 'bg-emerald-400' : 'bg-slate-700'
                }`}
              />
              <span className={check.valid ? 'text-slate-200' : 'text-slate-500'}>{check.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PasswordStrengthMeter
