// src/components/admin/ApplicationDetailModal.jsx
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronDown, Loader2, Pencil, X } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { formatCurrency, formatDate } from '../../utils/helpers'
import Toggle from '../common/Toggle'

const STATUS_OPTIONS = ['Submitted', 'In Process', 'On Hold', 'Completed', 'Rejected']
const PAYMENT_OPTIONS = ['Pending', 'Paid']

function getAppCostDisplay(app) {
  const t = String(app?.cost_text || '').trim()
  if (t) return t

  const n = Number(app?.cost)
  if (Number.isFinite(n)) return formatCurrency(n)

  return '—'
}

function TogglePayment({ value, onChange }) {
  const isPaid = value === 'Paid'
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
      <Toggle
        checked={isPaid}
        onChange={() => onChange(isPaid ? 'Pending' : 'Paid')}
      />
      <span>{value}</span>
    </div>
  )
}

export default function ApplicationDetailModal({ open, application, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(application?.status || 'Submitted')
  const [paymentStatus, setPaymentStatus] = useState(application?.payment_status || 'Pending')
  const [paidAmount, setPaidAmount] = useState('')

  useEffect(() => {
    if (!open) return

    setStatus(application?.status || 'Submitted')
    setPaymentStatus(application?.payment_status || 'Pending')

    const initial =
      application?.paid_amount !== null && application?.paid_amount !== undefined
        ? String(application.paid_amount)
        : application?.cost !== null && application?.cost !== undefined
          ? String(application.cost)
          : ''

    setPaidAmount(initial)
  }, [open, application])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handlePaymentChange = (next) => {
    setPaymentStatus(next)

    // Policy 1: when switching to Paid, auto-fill if empty
    if (next === 'Paid') {
      setPaidAmount((prev) => {
        const p = String(prev || '').trim()
        if (p) return prev

        if (application?.paid_amount !== null && application?.paid_amount !== undefined) {
          return String(application.paid_amount)
        }
        if (application?.cost !== null && application?.cost !== undefined) {
          return String(application.cost)
        }
        return ''
      })
    }
  }

  const handleSave = async () => {
    if (!application?.id) return

    if (!STATUS_OPTIONS.includes(status)) {
      toast.error('Please select a valid status')
      return
    }
    if (!PAYMENT_OPTIONS.includes(paymentStatus)) {
      toast.error('Please select a valid payment status')
      return
    }

    // Policy 1 enforcement
    let paidAmountValue = null
    if (paymentStatus === 'Paid') {
      const n = Number(String(paidAmount || '').trim())
      if (!Number.isFinite(n) || n <= 0) {
        toast.error('Paid Amount is required and must be a valid number')
        return
      }
      paidAmountValue = n
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('applications')
        .update({
          status,
          payment_status: paymentStatus,
          paid_amount: paymentStatus === 'Paid' ? paidAmountValue : null,
        })
        .eq('id', application.id)

      if (error) throw error

      toast.success('Application updated!')
      onSaved?.()
      onClose?.()
    } catch (err) {
      console.error('Update application error:', err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !application) return null

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm bg-opacity-50" />

      <div className="absolute inset-0 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
        <div
          className="my-auto w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(2,6,23,0.25)] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-[#1e3a5f]" />
              <h3 className="text-base font-extrabold text-slate-900">Application Details</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ['Application ID', application.application_id],
                ['Name', application.name],
                ['Contact / Phone', application.phone],
                ['Service', application.service_name],
                ['Cost / Fees', getAppCostDisplay(application)],
                ['Created Date', formatDate(application.created_at)],
                ['Completed Date', application.completed_at ? formatDate(application.completed_at) : '—'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Source</p>
                <div className="mt-2">
                  <Badge 
                    color={(application.source || 'offline').toLowerCase() === 'online' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-700 border border-slate-200'}
                  >
                    {application.source || 'Offline'}
                  </Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Application Status</p>
                <div className="relative mt-2">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
                <div className="mt-3">
                  <Badge status={status}>{status}</Badge>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Payment Status</p>
                <div className="mt-2">
                  <TogglePayment value={paymentStatus} onChange={handlePaymentChange} />
                </div>
                <div className="mt-3">
                  <Badge status={paymentStatus}>{paymentStatus}</Badge>
                </div>

                {paymentStatus === 'Paid' ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-500">Paid Amount</p>
                    <input
                      type="number"
                      step="0.01"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                      placeholder="Enter paid amount"
                    />
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      Required when Payment Status is <span className="font-extrabold">Paid</span>.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={onClose} disabled={saving}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}