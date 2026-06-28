import { NavLink } from 'react-router-dom'
import routePaths from '../../utils/routes.js'
import { LayoutDashboard, MessageSquare, FileText, User, LogOut, Files, BarChart3 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

const navItems = [
  { label: 'Dashboard', path: routePaths.dashboard, icon: LayoutDashboard },
  { label: 'Contracts', path: routePaths.contracts, icon: Files },
  { label: 'Chatbot', path: routePaths.chatbot, icon: MessageSquare },
  { label: 'Contract Analysis', path: routePaths.contractAnalysis, icon: FileText },
  { label: 'Analytics', path: routePaths.analytics, icon: BarChart3 },
  { label: 'Profile', path: routePaths.profile, icon: User },
]

function Sidebar({ isCollapsed }) {
  const { logout } = useAuth()
  const { theme } = useTheme()
  const isLight = theme === 'light'

  return (
    <aside
      className={`hidden shrink-0 flex-col gap-2 border-r lg:flex transition-all duration-300 ${isCollapsed ? 'w-20 items-center py-5 px-2' : 'w-72 p-5'
        } ${isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-900'}`}
    >
      <div className={`mb-8 space-y-2 ${isCollapsed ? 'text-center' : ''}`}>
        {!isCollapsed && (
          <p className={`text-xs uppercase tracking-[0.24em] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Workspace</p>
        )}
        <h2 className={`font-semibold ${isCollapsed ? 'text-sm' : 'text-xl'} ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
          {isCollapsed ? 'CI' : 'Main Navigation'}
        </h2>
      </div>

      <nav className="flex flex-1 flex-col gap-2 w-full">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                ? 'bg-brand-500/20 text-brand-500'
                : isLight
                  ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              } ${isCollapsed ? 'justify-center px-0' : ''}`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={`mt-auto w-full pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={logout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition hover:text-red-400 ${isCollapsed ? 'justify-center px-0' : ''
            } ${isLight ? 'text-slate-500 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
