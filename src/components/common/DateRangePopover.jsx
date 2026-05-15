// src/components/common/DateRangePopover.jsx
import React, { useEffect, useRef } from 'react'

export default function DateRangePopover({ open, onClose, startDate, endDate, setStartDate, setEndDate }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={ref}
      className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
    >
      <p className="text-sm font-semibold text-slate-900">Select date range</p>

      <div className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-normal text-slate-700 transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-normal text-slate-700 transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => {
              setStartDate('')
              setEndDate('')
              onClose?.()
            }}
            className="text-sm font-semibold text-slate-600 hover:underline"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16304f]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
