import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import NavigationProgress from './NavigationProgress.jsx'
import PageTransition from './PageTransition.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import routePaths from '../../utils/routes.js'
import { X, ShieldAlert, LayoutDashboard, MessageSquare, FileText, User, Files, BarChart3 } from 'lucide-react'

const mobileNavItems = [
  { label: 'Dashboard', path: routePaths.dashboard, icon: LayoutDashboard },
  { label: 'Contracts', path: routePaths.contracts, icon: Files },
  { label: 'Chatbot', path: routePaths.chatbot, icon: MessageSquare },
  { label: 'Contract Analysis', path: routePaths.contractAnalysis, icon: FileText },
  { label: 'Analytics', path: routePaths.analytics, icon: BarChart3 },
  { label: 'Profile', path: routePaths.profile, icon: User },
]

function AppShell() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isLight ? 'bg-slate-950 text-slate-700' : 'bg-slate-900 text-slate-100'
      }`}>
      <NavigationProgress />
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Mobile Menu Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-300 ${isLight ? 'bg-slate-500/30' : 'bg-slate-950/80'
              }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer content */}
          <aside className={`fixed bottom-0 left-0 top-0 flex w-72 flex-col gap-4 border-r p-6 shadow-2xl transition-transform duration-300 ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <p className={`text-xs uppercase tracking-[0.24em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Workspace</p>
                <h2 className={`text-lg font-bold ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>Main Navigation</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-full p-2 transition ${isLight ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
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
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                      ? 'bg-brand-500/20 text-brand-500 border border-brand-500/30'
                      : isLight
                        ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className={`rounded-3xl border p-5 text-sm backdrop-blur-md ${isLight ? 'border-slate-200 bg-slate-50 text-slate-600' : 'border-slate-800 bg-slate-950/50 text-slate-300'
              }`}>
              <p className={`font-semibold flex items-center gap-2 ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                <ShieldAlert className="h-4 w-4 text-brand-400" /> Platform tools
              </p>
              <p className={`mt-2 text-xs leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Use the secure AI templates and analytics to accelerate contract review and scoring.
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* Main Centered Layout */}
      <div className="mx-auto w-full flex-1 max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <main className="overflow-hidden w-full transition-colors duration-300">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}

export default AppShell
