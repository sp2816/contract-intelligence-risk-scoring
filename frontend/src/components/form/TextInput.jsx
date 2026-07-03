function TextInput({
  label,
  name,
  icon: Icon,
  type = 'text',
  value,
  placeholder,
  onChange,
  error,
  autoComplete,
  note,
}) {
  const baseClasses =
    'w-full rounded-[1.75rem] border border-slate-700/90 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition duration-200 focus:border-brand-500 focus:bg-slate-900/90 focus:ring-2 focus:ring-brand-500/20'
  const iconPadding = Icon ? 'pl-12' : 'pl-4'
  const errorClasses = error
    ? 'border-rose-400/80 focus:border-rose-300 focus:ring-rose-400/20'
    : ''

  return (
    <label className="block">
      <span className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
        {label}
      </span>
      <div className="relative mt-3">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-brand-500 dark:text-brand-400">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={onChange}
          className={`${baseClasses} ${iconPadding} ${errorClasses}`}
        />
      </div>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </label>
  )
}

export default TextInput
