// src/utils/helpers.js

export function formatDate(isoString) {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatCurrency(amount) {
  const num = Number(amount || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num)
}

export function getStatusColor(status) {
  const s = String(status || '').toLowerCase()

  // Tailwind v4-friendly badge palette
  // (kept consistent for both application status and payment/source chips)
  switch (s) {
    // Application statuses
    case 'submitted':
      return 'bg-slate-100 text-slate-700 border border-slate-200'
    case 'in process':
      return 'bg-blue-100 text-blue-700 border border-blue-200'
    case 'on hold':
      return 'bg-amber-100 text-amber-800 border border-amber-200'
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'rejected':
      return 'bg-red-100 text-red-700 border border-red-200'

    // Payment statuses
    case 'paid':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'pending':
      return 'bg-slate-100 text-slate-700 border border-slate-200'

    // Source
    case 'online':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
    case 'offline':
      return 'bg-amber-100 text-amber-800 border border-amber-200'

    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200'
  }
}