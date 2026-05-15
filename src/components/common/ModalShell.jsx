// src/components/common/ModalShell.jsx
import React from 'react'
import { X } from 'lucide-react'

/**
 * Scroll-safe modal shell:
 * - Overlay scrolls on very small screens
 * - Modal container constrained to 90vh
 * - Body scrolls, header/footer stay visible
 */
export default function ModalShell({ open, title, onClose, children, footer, maxWidthClass = 'max-w-2xl' }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-4"
      onClick={onClose}
    >
      <div  
        className={[
          'bg-white rounded-xl shadow-xl w-full mx-4 my-auto max-h-[90vh] flex flex-col',
          maxWidthClass,
          'overflow-y-auto',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="w-full text-center text-2xl font-extrabold text-slate-900">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer ? (
          <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
