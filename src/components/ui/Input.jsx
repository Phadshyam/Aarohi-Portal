// src/components/ui/Input.jsx
import React from 'react'

export default function Input({
  label,
  error,
  hint,
  className = '',
  inputClassName = '',
  id,
  ...props
}) {
  const inputId =
    id || props.name || `input-${Math.random().toString(16).slice(2)}`

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        className={[
          'w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400',
          'border-slate-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : '',
          props.disabled ? 'bg-slate-50 text-slate-500' : '',
          inputClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}