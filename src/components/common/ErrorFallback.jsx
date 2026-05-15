// src/components/common/ErrorFallback.jsx
// Global error boundary fallback – shown when an unhandled JS error
// crashes the React tree. Gives the user a branded recovery option
// instead of a blank white screen.

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_45px_rgba(2,6,23,0.10)]">
        {/* Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="mt-5 text-xl font-extrabold text-slate-900">
          Something went wrong
        </h1>

        {/* Description */}
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          An unexpected error occurred. Please try refreshing the page.
          If the problem persists, contact support.
        </p>

        {/* Error details (collapsed by default in production) */}
        {error?.message ? (
          <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 text-left">
            <summary className="cursor-pointer px-4 py-2.5 text-xs font-semibold text-slate-600">
              Error details
            </summary>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all px-4 pb-3 pt-1 text-xs text-red-600/80">
              {error.message}
            </pre>
          </details>
        ) : null}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = '/'
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  )
}
