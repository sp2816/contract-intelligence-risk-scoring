import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-brand-500 px-3 py-1 text-sm font-semibold text-white shadow-dark-soft">
            AI Contract Intelligence
          </div>
          <span className="hidden text-sm text-slate-400 sm:inline">Risk Scoring Platform</span>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-300 sm:block">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
