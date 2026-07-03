function CheckboxField({ label, checked, onChange, error, description }) {
  return (
    <div className="space-y-2 text-sm">
      <label className="inline-flex items-start gap-3 text-slate-200">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950/80 text-brand-500 focus:ring-brand-500"
        />
        <span className="leading-6">
          <span className="font-medium text-slate-100">{label}</span>
          {description && <span className="block text-slate-500">{description}</span>}
        </span>
      </label>
      {error && <p className="text-sm text-rose-400">{error}</p>}
    </div>
  )
}

export default CheckboxField
