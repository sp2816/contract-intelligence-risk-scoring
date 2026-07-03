import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { changePassword } from '../api/auth'
import { useTheme } from '../context/ThemeContext.jsx'
import { User as UserIcon, Shield, Mail, Key, Bell, Sun, Moon, Layout, Check, Loader2, Eye, EyeOff } from 'lucide-react'

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
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

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

  const handlePasswordChange = async () => {

    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {

      setUpdatingPassword(true)

      await changePassword({
          currentPassword,
          newPassword
      })

      setPasswordSuccess('Password updated successfully.')

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordSuccess('')
      }, 1500)

    } catch (err) {

      setPasswordError(
        err.response?.data?.message || 'Unable to change password'
      )

    } finally {

      setUpdatingPassword(false)

    }
  }

  return (
    <section className="space-y-6">
      <div className="animate-slide-up">
        <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Settings</p>
        <h1 className={`mt-2 text-3xl font-extrabold sm:text-4xl tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Account Details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {/* Account Details Panel */}
          <div 
            className={`animate-slide-up rounded-[2rem] border p-6 md:p-8 transition-all duration-300 ${
              isLight
                ? 'border-slate-200 bg-white shadow-sm'
                : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 shadow-dark-soft hover:border-slate-700/80'
            }`}
            style={{ animationDelay: '80ms' }}
          >
            <div className="space-y-6">
              <div className={`flex items-center gap-4 border-b pb-6 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                  <UserIcon className="h-8 w-8" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{user?.fullname || 'Legal Counsel'}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-500 mt-0.5">Enterprise Workspace Member</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className={`rounded-2xl border p-5 transition-all duration-300 hover:border-slate-750 ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-slate-900/40'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Mail className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-brand-500'}`} /> Email Address
                  </div>
                  <p className={`mt-2.5 text-base font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{user?.email || 'N/A'}</p>
                </div>

                <div className={`rounded-2xl border p-5 transition-all duration-300 hover:border-slate-750 ${
                  isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800/80 bg-slate-900/40'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    <Key className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-brand-500'}`} /> Account Status
                  </div>
                  <p className="mt-2.5 text-base font-bold text-emerald-500">Active &amp; Connected</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Preferences Form */}
          <div 
            className={`animate-slide-up rounded-[2rem] border p-6 md:p-8 backdrop-blur-md transition-all duration-300 ${
              isLight
                ? 'border-slate-200 bg-white shadow-sm'
                : 'border-slate-800 bg-slate-900/40 shadow-dark-soft hover:border-slate-700/80'
            }`}
            style={{ animationDelay: '160ms' }}
          >
            <h2 className={`text-xl font-bold mb-6 tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>User Preferences</h2>

            <form onSubmit={handleSavePreferences} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Theme Selector */}
                <div>
                  <label className={`block text-sm font-medium mb-2.5 flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    {localTheme === 'dark' ? <Moon className="h-4 w-4 text-brand-500" /> : <Sun className="h-4 w-4 text-amber-500" />}
                    Workspace Theme
                  </label>
                  <select
                    value={localTheme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3.5 outline-none transition duration-250 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 cursor-pointer ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-800'
                        : 'border-slate-750 bg-slate-950 text-slate-200'
                    }`}
                  >
                    <option value="dark">Dark Theme (Recommended)</option>
                    <option value="light">Light Theme</option>
                  </select>
                </div>

                {/* Default View Selector */}
                <div>
                  <label className={`block text-sm font-medium mb-2.5 flex items-center gap-2 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                    <Layout className="h-4 w-4 text-brand-500" /> Default Dashboard View
                  </label>
                  <select
                    value={defaultView}
                    onChange={(e) => setDefaultView(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3.5 outline-none transition duration-250 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 cursor-pointer ${
                      isLight
                        ? 'border-slate-300 bg-slate-50 text-slate-800'
                        : 'border-slate-750 bg-slate-950 text-slate-200'
                    }`}
                  >
                    <option value="dashboard">Overview Dashboard</option>
                    <option value="chatbot">Legal Chatbot</option>
                    <option value="contract-analysis">Contract Analysis</option>
                  </select>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className={`flex items-center gap-3.5 rounded-2xl border p-4.5 transition-colors ${
                isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/40'
              }`}>
                <input
                  type="checkbox"
                  id="notifications"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 bg-slate-950 text-brand-500 focus:ring-brand-500/20 cursor-pointer"
                />
                <label htmlFor="notifications" className={`text-sm font-medium cursor-pointer flex items-center gap-2 select-none leading-relaxed ${
                  isLight ? 'text-slate-600' : 'text-slate-300'
                }`}>
                  <Bell className={`h-4 w-4 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                  Enable real-time email alerts for high-risk clauses detected in uploaded contracts.
                </label>
              </div>

              {/* Feedback States */}
              {error && <p className="text-sm font-semibold text-rose-500">{error}</p>}
              {success && (
                <p className="text-sm font-semibold text-emerald-500 flex items-center gap-2">
                  <Check className="h-4 w-4" /> Preferences successfully saved to your profile!
                </p>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:brightness-110 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/10 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
        <aside 
          className={`animate-slide-up rounded-[2rem] border p-6 backdrop-blur-md flex flex-col justify-between h-fit gap-6 transition-all duration-300 ${
            isLight
              ? 'border-slate-200 bg-white shadow-sm'
              : 'border-slate-800 bg-slate-950/60 shadow-dark-soft hover:border-slate-700/80'
          }`}
          style={{ animationDelay: '240ms' }}
        >
          <div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-500`}>
              <Shield className="h-5 w-5" />
            </div>
            <h2 className={`mt-4 text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Security &amp; Audit</h2>
            <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Manage authentication credentials, configure single sign-on (SSO), and inspect audit trail logs from the corporate console.
            </p>
          </div>
          <button
            type="button" onClick={() => setShowPasswordModal(true)}
            className={`w-full rounded-2xl border py-2.5 text-xs font-semibold transition ${
              isLight
                ? 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                : 'border-slate-750 bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Configure Credentials
          </button>
        </aside>
      </div>

      {
    showPasswordModal && (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

    <div className={`w-full max-w-md rounded-3xl p-8 ${
    isLight
    ? "bg-white"
    : "bg-slate-900 border border-slate-700"
    }`}>

    <h2 className="text-xl font-bold mb-6">
    Change Password
    </h2>

    <div className="space-y-4">

    <div className="relative">

    <input
    type={showCurrent ? "text" : "password"}
    placeholder="Current Password"
    value={currentPassword}
    onChange={(e)=>setCurrentPassword(e.target.value)}
    className="w-full rounded-xl border px-4 py-3 bg-transparent pr-12"
    />

    <button
    type="button"
    onClick={()=>setShowCurrent(!showCurrent)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
    >
    {showCurrent ? <EyeOff size={18}/> : <Eye size={18}/>}
    </button>

    </div>

    <div className="relative">

    <input
    type={showNew ? "text" : "password"}
    placeholder="New Password"
    value={newPassword}
    onChange={(e)=>setNewPassword(e.target.value)}
    className="w-full rounded-xl border px-4 py-3 bg-transparent pr-12"
    />

    <button
    type="button"
    onClick={()=>setShowNew(!showNew)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
    >
    {showNew ? <EyeOff size={18}/> : <Eye size={18}/>}
    </button>

    </div>

    <div className="relative">

    <input
    type={showConfirm ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e)=>setConfirmPassword(e.target.value)}
    className="w-full rounded-xl border px-4 py-3 bg-transparent pr-12"
    />

    <button
    type="button"
    onClick={()=>setShowConfirm(!showConfirm)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
    >
    {showConfirm ? <EyeOff size={18}/> : <Eye size={18}/>}
    </button>

    </div>

    {passwordError &&
    <p className="text-red-500 text-sm">
    {passwordError}
    </p>
    }

    {passwordSuccess &&
    <p className="text-green-500 text-sm">
    {passwordSuccess}
    </p>
    }

    <div className="flex justify-end gap-3 pt-3">

    <button

    onClick={()=>{
    setShowPasswordModal(false)
    }}

    className="px-4 py-2 rounded-xl border"
    >

    Cancel

    </button>

    <button

    onClick={handlePasswordChange}

    disabled={updatingPassword}

    className="px-5 py-2 rounded-xl bg-brand-500 text-white"

    >

    {updatingPassword
    ? "Updating..."
    : "Update Password"}

    </button>

    </div>

    </div>

    </div>

    </div>

    )
    }
    </section>
  )
}

export default Profile
