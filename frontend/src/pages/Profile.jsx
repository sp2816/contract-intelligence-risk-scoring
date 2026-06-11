import { useAuth } from '../hooks/useAuth.jsx'

function Profile() {
  const { user } = useAuth()

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Profile</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Account details</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">User</h2>
              <p className="mt-2 text-sm text-slate-600">{user?.email || 'No email available'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Name</h3>
              <p className="mt-1 text-base text-slate-800">{user?.name || 'Guest user'}</p>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Security
          </h2>
          <p className="mt-3 text-sm text-slate-600">Manage authentication, session controls, and audit options from a central dashboard.</p>
        </aside>
      </div>
    </section>
  )
}

export default Profile
