function Dashboard() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Executive overview</h1>
        </div>
        <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-soft">
          6 active contract reviews · 3 AI workflows
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Risk snapshot</h2>
          <p className="mt-3 text-sm text-slate-600">Monitor your contract portfolio risk across categories, likelihood, and open review items.</p>
        </article>
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">AI adoption</h2>
          <p className="mt-3 text-sm text-slate-600">Track how your team is using AI-enabled scoring and contract insights in real time.</p>
        </article>
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Compliance health</h2>
          <p className="mt-3 text-sm text-slate-600">Get a quick view of flagged clauses, missing clauses, and governance compliance trends.</p>
        </article>
      </div>
    </section>
  )
}

export default Dashboard
