import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { Menu, X, Search, Bell, User as UserIcon, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

function Navbar({ onToggleMobileMenu, isMobileMenuOpen, onToggleSidebar, isSidebarCollapsed }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle button */}
          {user && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition lg:hidden"
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
              className="hidden lg:inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          )}

          <div className="rounded-2xl bg-brand-500 px-3 py-1 text-sm font-semibold text-white shadow-dark-soft ml-2 lg:ml-0">
            AI Contract
          </div>
          <span className="hidden text-sm text-slate-400 sm:inline">Risk Platform</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Search */}
              <div className="hidden md:flex items-center rounded-full bg-slate-800/50 px-3 py-1.5 border border-slate-700/50 focus-within:border-brand-500/50 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search contracts..." 
                  className="bg-transparent border-none outline-none text-sm text-slate-200 ml-2 w-48 placeholder:text-slate-500"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-white transition rounded-full hover:bg-slate-800">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 border-2 border-slate-900"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-800">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-medium text-slate-200">{user.name}</span>
                  <span className="text-xs text-slate-500">Admin</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-brand-400 font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}
                </div>
              </div>
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
