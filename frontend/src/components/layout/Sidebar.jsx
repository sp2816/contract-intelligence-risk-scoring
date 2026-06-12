import { NavLink } from 'react-router-dom'
import routePaths from '../../utils/routes.js'

const navItems = [
  { label: 'Dashboard', path: routePaths.dashboard },
  { label: 'Chatbot', path: routePaths.chatbot },
  { label: 'Contract Analysis', path: routePaths.contractAnalysis },
  { label: 'Profile', path: routePaths.profile },
]

function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-2 border-r border-slate-800 bg-slate-900 p-5 lg:flex dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
        <h2 className="text-xl font-semibold text-slate-100">Main Navigation</h2>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-3xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300 dark:border-slate-700 dark:bg-slate-800">
        <p className="font-semibold text-slate-200">Platform tools</p>
        <p className="mt-2 text-sm text-slate-400">Use the secure AI templates and analytics to accelerate contract review and scoring.</p>
      </div>
    </aside>
  )
}

export default Sidebar
