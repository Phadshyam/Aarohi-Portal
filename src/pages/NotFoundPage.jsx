// src/pages/NotFoundPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-[0_18px_45px_rgba(2,6,23,0.10)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
          <FileQuestion className="h-7 w-7 text-slate-500" />
        </div>
        
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          We couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
          >
            Back to Home
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
