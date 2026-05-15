import React, { useMemo } from 'react'
import { X } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'

function parseBullets(text) {
  const v = String(text || '').trim()
  if (!v) return []
  if (v.includes('\n')) {
    return v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^[•\-]\s*/, ''))
  }
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^[•\-]\s*/, ''))
}

function parseProcedures(text) {
  const v = String(text || '').trim()
  if (!v) return []
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\d+\.\s*/, ''))
}

function getCostDisplay(service) {
  const t = String(service?.cost_text || '').trim()
  if (t) return t

  const n = Number(service?.cost)
  if (Number.isFinite(n)) return formatCurrency(n)

  return '—'
}

export default function ServiceDetailsModal({ open, service, onClose, onApply }) {
  const docs = useMemo(() => parseBullets(service?.documents), [service?.documents])
  const procs = useMemo(() => parseProcedures(service?.procedures), [service?.procedures])

  if (!open || !service) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/55 backdrop-blur-sm px-4 py-6 backdrop-blur-[2px] transition-opacity duration-200 sm:py-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="my-auto flex max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg origin-top scale-100 transform flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)] transition duration-200 ease-out motion-reduce:transition-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <h3 className="pr-4 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Service details</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-600 transition-colors duration-200 hover:border-slate-200 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Service name</p>
            <p className="mt-1.5 text-base font-bold leading-snug text-slate-900">{service.name}</p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Description</p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">{service.description || '—'}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost / fees</p>
              <p className="mt-1.5 text-base font-extrabold text-slate-900">{getCostDisplay(service)}</p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
              <p className="mt-1.5 text-base font-extrabold text-slate-900">{service.duration || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Required documents</p>
            {docs.length ? (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium text-slate-600">
                {docs.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-500">—</p>
            )}
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Procedures</p>
            {procs.length ? (
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-medium text-slate-600">
                {procs.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-500">—</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200/90 bg-white/95 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="order-2 inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-50 sm:order-1 sm:flex-initial"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onApply}
            className="order-1 inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(30,58,95,0.35)] transition duration-200 hover:bg-[#16304f] sm:order-2 sm:flex-initial sm:min-w-[200px]"
          >
            Apply for this service
          </button>
        </div>
      </div>
    </div>
  )
}
