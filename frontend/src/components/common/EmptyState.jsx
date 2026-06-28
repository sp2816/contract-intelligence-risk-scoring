import React from 'react'

/**
 * Reusable empty state component with an optional action button and icons.
 *
 * @param {object} props
 * @param {React.ComponentType} [props.icon] - Lucide icon class
 * @param {string} props.title - Main header text
 * @param {string} props.description - Supportive text description
 * @param {string} [props.actionLabel] - Button label
 * @param {Function} [props.onAction] - Button click handler
 * @param {string} [props.className] - Container layout class
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 ${className}`}>
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900/50 dark:bg-slate-950/40 text-slate-400 border border-slate-800/80 shadow-md">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-white leading-snug">{title}</h3>
        <p className="text-sm text-slate-450 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-600 active:scale-[0.98] transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
