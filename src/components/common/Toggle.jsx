// src/components/common/Toggle.jsx
import React from 'react'

export default function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25 focus:ring-offset-2',
        checked ? 'bg-emerald-500' : 'bg-slate-300',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
      aria-label="Toggle active status"
    >
      <span
        className={[
          'inline-block h-5 w-5 rounded-full bg-white shadow transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}
