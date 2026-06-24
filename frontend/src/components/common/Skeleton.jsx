import React from 'react'

/**
 * Reusable loading skeleton with a pulsing animation.
 *
 * @param {object} props
 * @param {string} [props.className] - Extra Tailwind classes
 * @param {'text'|'circle'|'rect'} [props.variant='rect'] - Shape of the skeleton
 * @param {string} [props.width] - Optional width styling
 * @param {string} [props.height] - Optional height styling
 */
export default function Skeleton({ className = '', variant = 'rect', width, height }) {
  const getShapeClass = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full'
      case 'text':
        return 'rounded h-4 w-full mb-2'
      case 'rect':
      default:
        return 'rounded-2xl'
    }
  }

  return (
    <div
      className={`animate-pulse bg-slate-800/60 dark:bg-slate-800/40 border border-slate-700/10 ${getShapeClass()} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}
