import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { User as UserIcon, Shield, Mail, Key, Bell, Sun, Moon, Layout, Check, Loader2 } from 'lucide-react'

function Profile() {
  const { user, updatePrefs } = useAuth()
  const { theme, setTheme } = useTheme()

  const isLight = theme === 'light'

  // Local state for preferences
  const [localTheme, setLocalTheme] = useState(user?.preferences?.theme || theme)
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true)
  const [defaultView, setDefaultView] = useState(user?.preferences?.defaultView || 'dashboard')

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Sync if user object changes (e.g. after initial auth load)
  useEffect(() => {
    if (user?.preferences) {
      const savedTheme = user.preferences.theme || 'dark'
      setLocalTheme(savedTheme)
      setTheme(savedTheme)
      setNotifications(user.preferences.notifications ?? true)
      setDefaultView(user.preferences.defaultView || 'dashboard')
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // When the dropdown changes, apply theme globally in real time
  const handleThemeChange = (value) => {
    setLocalTheme(value)
    setTheme(value)
  }

  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    try {
      await updatePrefs({
        theme: localTheme,
        notifications,
        defaultView,
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err?.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <p className={`text-sm uppercase tracking-[0.3em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Settings</p>
        <h1 className={`text-3xl font-semibold sm:text-4xl ${isLight ? 'text-slate-900' : 'text-white'}`}>Account details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Account Details Panel */}
          <div className={`rounded-[2rem] border p-6 md:p-8 transition-colors duration-300 ${
            isLight
              ? 'border-slate-200 bg-white shadow-sm'
              : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-dark-soft'
          }`}>
            <div className="space-y-6">
              <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.fullname || 'Legal Counsel'}</h2>
                  <p className="text-sm text-brand-400">Enterprise Workspace Member</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className={`rounded-2xl border p-5 transition-colors ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/50'
                }`}>
                  <div className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Mail className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} /> Email Address
                  </div>
                  <p className={`mt-2 text-base font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{user?.email || 'N/A'}</p>
                </div>

                <div className={`rounded-2xl border p-5 transition-colors ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-900/50'
                }`}>
                  <div className={`flex items-center gap-2 text-sm font-medium uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Key className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} /> Account Status
                  </div>
                  <p className="mt-2 text-base font-semibold text-emerald-500">Active &amp; Connected</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Preferences Form */}
          <div className={`rounded-[2rem] border p-6 md:p-8 backdrop-blur-md transition-colors duration-300 ${
            isLight
              ? 'border-slate-200 bg-white shadow-sm'
              : 'border-slate-800 bg-slate-900/40 shadow-dark-soft'
          }`}>
            <h2 className={`text-xl font-bold mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>User Preferences</h2>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Theme Selector */}
                <div>
                  <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {localTheme === 'dark' ? <Moon className="h-4 w-4 text-sky-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
                    Workspace Theme
                  </label>
                  <select
                    value={localTheme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-800'
                        : 'border-slate-700 bg-slate-950 text-slate-200'
                    }`}
                  >
                    <option value="dark">Dark Theme (Recommended)</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>

                {/* Default View Selector */}
                <div>
                  <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    <Layout className="h-4 w-4 text-sky-500" /> Default Dashboard View
                  </label>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none transition duration-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-800'
                        : 'border-slate-700 bg-slate-950 text-slate-200'
                    }`}
                  >
                    <option value="dashboard">Overview Dashboard</option>
                    <option value="chatbot">Legal Chatbot</option>
                    <option value="contract-analysis">Contract Analysis</option>
                  </select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className={`flex items-center gap-3 rounded-2xl border p-4 transition-colors ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/40'
              }`}>
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/20"
                />
                <label htmlFor="notifications" className={`text-sm font-medium cursor-pointer flex items-center gap-2 select-none ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  <Bell className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                  Enable real-time email alerts for high-risk clauses detected in uploaded contracts.
                </label>
              </div>

              {/* Feedback States */}
              {error && <p className="text-sm text-rose-500">{error}</p>}
              {success && (
                <p className="text-sm text-emerald-500 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Preferences successfully saved to your profile!
                </p>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 px-6 py-3 text-sm font-semibold text-white transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving changes...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Security Info Sidebar */}
        <aside className={`rounded-[2rem] border p-6 backdrop-blur-md flex flex-col justify-between h-fit gap-6 transition-colors duration-300 ${
          isLight
            ? 'border-slate-200 bg-white shadow-sm'
            : 'border-slate-800 bg-slate-950/60 shadow-dark-soft'
        }`}>
          <div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-300'
            }`}>
              <Shield className="h-5 w-5" />
            </div>
            <h2 className={`mt-4 text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Security &amp; Audit</h2>
            <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Manage authentication credentials, configure single sign-on (SSO), and inspect audit trail logs from the corporate console.
            </p>
          </div>
          <button
            type="button"
            className={`w-full rounded-2xl border py-2.5 text-xs font-semibold transition ${
              isLight
                ? 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Configure Credentials
          </button>
        </aside>
      </div>
    </section>
  )
}

export default Profile
