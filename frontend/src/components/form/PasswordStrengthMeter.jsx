import { useMemo } from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'

function PasswordStrengthMeter({ password }) {
  const { theme } = useTheme()
  const isLight = theme === 'light'

  const checks = useMemo(() => [
    { label: 'Min 8 characters', valid: password.length >= 8 },
    { label: 'Upper + lower case', valid: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: 'Number included', valid: /\d/.test(password) },
    { label: 'Symbol included', valid: /[^A-Za-z0-9]/.test(password) },
  ], [password])

  const score = checks.filter((c) => c.valid).length

  // Don't render anything when password is empty
  if (!password) return null

  // Use raw hex colors to avoid CSS variable opacity issues
  const strengthConfig = {
    1: {
      label: 'Weak',
      barHex: '#ef4444',       // vivid red
      textHex: '#ef4444',
      badgeBg: 'rgba(239,68,68,0.12)',
    },
    2: {
      label: 'Fair',
      barHex: '#f59e0b',       // vivid amber/orange
      textHex: '#f59e0b',
      badgeBg: 'rgba(245,158,11,0.12)',
    },
    3: {
      label: 'Strong',
      barHex: '#3b82f6',       // vivid blue
      textHex: '#3b82f6',
      badgeBg: 'rgba(59,130,246,0.12)',
    },
    4: {
      label: 'Very strong',
      barHex: '#10b981',       // vivid emerald/green
      textHex: '#10b981',
      badgeBg: 'rgba(16,185,129,0.12)',
    },
  }

  // When score is 0 (typing started but no checks pass yet), show as Weak
  const config = strengthConfig[score] || strengthConfig[1]

  return (
    <div
      className={`rounded-3xl border p-4 text-sm shadow-sm backdrop-blur-xl ${
        isLight
          ? 'border-slate-200 bg-white shadow-slate-100/50 text-slate-600'
          : 'border-slate-800 bg-slate-950/70 text-slate-400 shadow-slate-950/30'
      }`}
      style={{ animation: 'fadeInMeter 0.25s ease-out' }}
    >
      <style>{`
        @keyframes fadeInMeter {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="flex items-center justify-between text-sm font-medium">
        <span className={isLight ? 'text-slate-700 font-semibold' : 'text-slate-200 font-semibold'}>
          Password strength
        </span>
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ backgroundColor: config.badgeBg, color: config.textHex }}
        >
          {config.label}
        </span>
      </div>

      <div className="mt-3 space-y-3">
        {/* Segmented progress bar */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className="h-2 flex-1 rounded-full"
              style={{
                backgroundColor: score >= segment
                  ? config.barHex
                  : isLight
                  ? '#e2e8f0'
                  : 'rgba(255,255,255,0.05)',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>

        {/* Horizontal checks list */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-2">
              <span
                className="inline-flex h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: check.valid
                    ? '#10b981'
                    : isLight
                    ? '#cbd5e1'
                    : '#334155',
                  boxShadow: check.valid ? '0 1px 3px rgba(16,185,129,0.3)' : 'none',
                  transition: 'background-color 0.2s ease',
                }}
              />
              <span
                className="text-xs"
                style={{
                  color: check.valid
                    ? (isLight ? '#1e293b' : '#e2e8f0')
                    : (isLight ? '#94a3b8' : '#64748b'),
                  fontWeight: check.valid ? 500 : 400,
                  transition: 'color 0.2s ease',
                }}
              >
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PasswordStrengthMeter
