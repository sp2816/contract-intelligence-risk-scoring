import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { User as UserIcon, Shield, Mail, Key, Bell, Sun, Moon, Layout, Check, Loader2 } from 'lucide-react'

function Profile() {
  const { user, updatePrefs } = useAuth()
  
  // Local state for preferences
  const [theme, setTheme] = useState(user?.preferences?.theme || 'dark')
  const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true)
  const [defaultView, setDefaultView] = useState(user?.preferences?.defaultView || 'dashboard')
  
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Sync state if user changes (e.g. initial load)
  useEffect(() => {
    if (user) {
      if (user.preferences) {
        setTheme(user.preferences.theme || 'dark')
        setNotifications(user.preferences.notifications ?? true)
        setDefaultView(user.preferences.defaultView || 'dashboard')
      }
    }
  }, [user])

  // Apply theme class to document element (demonstrating real-time user preference action)
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode')
      document.documentElement.style.colorScheme = 'light'
    } else {
      document.documentElement.classList.remove('light-mode')
      document.documentElement.style.colorScheme = 'dark'
    }
  }, [theme])

  const handleSavePreferences = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    setError('')

    try {
      await updatePrefs({
        theme,
        notifications,
        defaultView
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
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Settings</p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Account details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Account Details Panel */}
          <div className="rounded-[2rem] border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-dark-soft md:p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{user?.fullname || 'Legal Counsel'}</h2>
                  <p className="text-sm text-brand-400">Enterprise Workspace Member</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
                    <Mail className="h-4 w-4 text-slate-500" /> Email Address
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-200">{user?.email || 'N/A'}</p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
                    <Key className="h-4 w-4 text-slate-500" /> Account Status
                  </div>
                  <p className="mt-2 text-base font-semibold text-emerald-400">Active & Connected</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Preferences Form */}
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-dark-soft backdrop-blur-md md:p-8">
            <h2 className="text-xl font-bold text-white mb-6">User Preferences</h2>
            
            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Theme Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4 text-sky-400" /> : <Sun className="h-4 w-4 text-sky-400" />}
                    Workspace Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition duration-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                  >
                    <option value="dark">Dark Theme (Recommended)</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>

                {/* Default View Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <Layout className="h-4 w-4 text-sky-400" /> Default Dashboard View
                  </label>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 outline-none transition duration-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10"
                  >
                    <option value="dashboard">Overview Dashboard</option>
                    <option value="chatbot">Legal Chatbot</option>
                    <option value="contract-analysis">Contract Analysis</option>
                  </select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500/20"
                />
                <label htmlFor="notifications" className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-2 select-none">
                  <Bell className="h-4 w-4 text-slate-400" />
                  Enable real-time email alerts for high-risk clauses detected in uploaded contracts.
                </label>
              </div>

              {/* Feedback States */}
              {error && <p className="text-sm text-rose-400">{error}</p>}
              {success && (
                <p className="text-sm text-emerald-400 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Preferences successfully saved to your profile!
                </p>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:brightness-110 px-6 py-3 text-sm font-semibold text-white transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <aside className="rounded-[2rem] border border-slate-800 bg-slate-950/60 p-6 shadow-dark-soft backdrop-blur-md flex flex-col justify-between h-fit gap-6">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-white">Security & Audit</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Manage authentication credentials, configure single sign-on (SSO), and inspect audit trail logs from the corporate console.
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/40 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Configure Credentials
          </button>
        </aside>
      </div>
    </section>
  )
}

export default Profile

