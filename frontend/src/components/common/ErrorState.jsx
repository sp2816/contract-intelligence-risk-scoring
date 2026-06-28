import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

/**
 * Reusable error state component featuring a retry option.
 *
 * @param {object} props
 * @param {string} [props.title='Something went wrong'] - Error heading
 * @param {string} props.message - Descriptive details of the error
 * @param {Function} [props.onRetry] - Function to run on retry click
 * @param {string} [props.className] - Layout classes
 */
export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4 border border-rose-500/20 bg-rose-500/5 rounded-[2rem] backdrop-blur-sm ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-950/40 text-rose-400 border border-rose-900/40 shadow-inner">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-bold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-350 dark:text-rose-300/80 leading-relaxed max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 px-4 py-2 text-xs font-semibold shadow transition active:scale-[0.98]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retry
        </button>
      )}
    </div>
  )
}
