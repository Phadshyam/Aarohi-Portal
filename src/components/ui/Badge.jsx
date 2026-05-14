// src/components/ui/Badge.jsx
import React from 'react'
import { getStatusColor } from '../../utils/helpers'

export default function Badge({
  children,
  className = '',
  color, // optional custom classes
  status, // optional: will map using getStatusColor
  ...props
}) {
  const computedColor = color || (status ? getStatusColor(status) : '')

  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        computedColor || 'bg-slate-100 text-slate-700 border border-slate-200',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}