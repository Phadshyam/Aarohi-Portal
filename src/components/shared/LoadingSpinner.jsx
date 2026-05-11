// src/components/shared/LoadingSpinner.jsx
import React from 'react'

export default function LoadingSpinner({
  size = 'md',
  className = '',
  label,
}) {
  const sizeClass =
    size === 'sm'
      ? 'h-4 w-4 border-2'
      : size === 'lg'
        ? 'h-8 w-8 border-4'
        : 'h-6 w-6 border-3'

  return (
    <div className={['inline-flex items-center gap-2', className].join(' ')}>
      <div
        className={[
          'animate-spin rounded-full border-slate-200 border-t-[#1e3a5f]',
          sizeClass,
        ].join(' ')}
        aria-hidden="true"
      />
      {label ? (
        <span className="text-sm font-medium text-slate-600">{label}</span>
      ) : null}
    </div>
  )
}