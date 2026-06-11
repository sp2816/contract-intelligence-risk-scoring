import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <Sidebar />
        <main className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppShell
