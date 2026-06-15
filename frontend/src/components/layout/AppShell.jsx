import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import routePaths from '../../utils/routes.js'
import { X, ShieldAlert } from 'lucide-react'

const mobileNavItems = [
  { label: 'Dashboard', path: routePaths.dashboard },
  { label: 'Chatbot', path: routePaths.chatbot },
  { label: 'Contract Analysis', path: routePaths.contractAnalysis },
  { label: 'Profile', path: routePaths.profile },
]

function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMenuOpen={isMobileMenuOpen} />
      
      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <aside className="fixed bottom-0 left-0 top-0 flex w-72 flex-col gap-4 border-r border-slate-800 bg-slate-900 p-6 shadow-2xl transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
                <h2 className="text-lg font-bold text-slate-100">Main Navigation</h2>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-2 mt-6">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive 
                        ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5 text-sm text-slate-300 backdrop-blur-md">
              <p className="font-semibold text-slate-200 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-brand-400" /> Platform tools
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Use the secure AI templates and analytics to accelerate contract review and scoring.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <main className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/40 p-6 shadow-dark-soft backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/40">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell

