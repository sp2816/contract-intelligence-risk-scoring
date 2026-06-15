import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-500">404 error</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-4 text-sm text-slate-600">The route you’re trying to access doesn’t exist or requires authentication.</p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}

export default NotFound
