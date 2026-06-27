import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import { Menu, X, Search, Bell, User as UserIcon, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react'

function Navbar({ onToggleMobileMenu, isMobileMenuOpen, onToggleSidebar, isSidebarCollapsed }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const isLight = theme === 'light'

  return (
    <header className={`sticky top-0 z-30 border-b backdrop-blur-xl transition-colors duration-300 ${isLight
        ? 'border-slate-200 bg-white/95'
        : 'border-slate-800 bg-slate-900/90'
      }`}>
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle */}
          {user && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className={`inline-flex items-center justify-center rounded-xl p-2 transition lg:hidden ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}

          {/* Desktop Sidebar Toggle */}
          {user && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`hidden lg:inline-flex items-center justify-center rounded-xl p-2 transition ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          )}

          <div className="rounded-2xl bg-brand-500 px-3 py-1 text-sm font-semibold text-white shadow-dark-soft ml-2 lg:ml-0">
            AI Contract
          </div>
          <span className={`hidden text-sm sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Risk Platform</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Search */}
              <div className={`hidden md:flex items-center rounded-full px-3 py-1.5 border focus-within:border-brand-500/50 transition-colors ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/50 border-slate-700/50'
                }`}>
                <Search className={`h-4 w-4 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
                <input
                  type="search"
                  placeholder="Search contracts..."
                  className={`bg-transparent border-none outline-none text-sm ml-2 w-48 placeholder:text-slate-500 ${isLight ? 'text-slate-800' : 'text-slate-200'
                    }`}
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
                className={`p-2 rounded-full transition ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <button className={`relative p-2 transition rounded-full ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-900' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                <Bell className="h-5 w-5" />
                <span className={`absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 border-2 ${isLight ? 'border-white' : 'border-slate-900'}`}></span>
              </button>

              {/* User Profile */}
              <Link
                to="/profile"
                className={`flex items-center gap-2 ml-2 pl-4 border-l transition-opacity duration-200 hover:opacity-80 ${isLight ? 'border-slate-200' : 'border-slate-800'
                  }`}
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className={`text-sm font-medium ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{user.fullname || user.name}</span>
                  <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Admin</span>
                </div>
                <div className={`h-9 w-9 rounded-full flex items-center justify-center border font-bold text-brand-400 ${isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-800 border-slate-700'
                  }`}>
                  {(user.fullname || user.name) ? (user.fullname || user.name).charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                </div>
              </Link>
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
