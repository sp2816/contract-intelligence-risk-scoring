function Chatbot() {
  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Chatbot</p>
        <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">AI Contract Assistant</h1>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-soft">
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-900">Ask questions about the clause, risk limits, or compliance summary.</p>
          </div>
          <textarea
            rows="6"
            className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="Type your conversation here..."
          />
          <button className="self-end rounded-3xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700">
            Start conversation
          </button>
        </div>
      </div>
    </section>
  )
}

export default Chatbot
