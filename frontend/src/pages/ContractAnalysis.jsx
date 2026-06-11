function ContractAnalysis() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contract Analysis</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">Automated contract review</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Clause intelligence</h2>
          <p className="mt-3 text-sm text-slate-600">Detect high-risk clauses and surface required revisions before approval.</p>
        </article>

        <article className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Risk scoring</h2>
          <p className="mt-3 text-sm text-slate-600">Use AI risk scoring to assign priority to contracts and expedite legal review.</p>
        </article>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900">Upload a contract</h2>
        <p className="mt-3 text-sm text-slate-600">Ready for production: add secure upload controls, preview, and analytics integrations.</p>
      </div>
    </section>
  )
}

export default ContractAnalysis
