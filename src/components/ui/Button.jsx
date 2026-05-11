// src/components/ui/Button.jsx
import React from 'react'

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary: 'bg-[#1e3a5f] text-white hover:bg-[#16304f]',
  secondary:
    'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        base,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}