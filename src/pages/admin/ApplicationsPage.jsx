// src/pages/admin/ApplicationsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import ApplicationDetailModal from '../../components/admin/ApplicationDetailModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  Plus,
  Search,
  X,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

const PAGE_SIZE = 10

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'Submitted', label: 'Submitted' },
  { value: 'In Process', label: 'In Process' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
]

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1])
  return Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
}

function getApplicationCostDisplay(app) {
  const t = String(app?.cost_text || '').trim()
  if (t) return t

  const n = Number(app?.cost)
  if (Number.isFinite(n)) return formatCurrency(n)

  return '—'
}

function TogglePayment({ value, onChange }) {
  const isPaid = value === 'Paid'
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-slate-600">Pending</span>
      <button
        type="button"
        onClick={() => onChange(isPaid ? 'Pending' : 'Paid')}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          isPaid ? 'bg-[#1e3a5f]' : 'bg-slate-300',
        ].join(' ')}
        aria-label="Toggle payment status"
      >
        <span
          className={[
            'inline-block h-5 w-5 rounded-full bg-white shadow transition',
            isPaid ? 'translate-x-5' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
      <span className="text-sm font-bold text-emerald-600">Paid</span>
    </div>
  )
}

function DateRangePopover({ open, onClose, startDate, endDate, setStartDate, setEndDate }) {
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
      className="absolute right-0 top-[calc(100%+8px)] z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <p className="text-sm font-extrabold text-slate-900">Select Date Range</p>

      <div className="mt-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            To
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
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

export default function ApplicationsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialQ = searchParams.get('q') || ''

  const [searchInput, setSearchInput] = useState(initialQ)
  const [searchTerm, setSearchTerm] = useState(initialQ)

  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [dateOpen, setDateOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [apps, setApps] = useState([])
  const [count, setCount] = useState(0)

  const [page, setPage] = useState(1)

  const [services, setServices] = useState([])

  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const totalPages = useMemo(() => Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)), [count])
  const pages = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages])

  // Debounce search 300ms
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchTerm(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('name')
          .order('name', { ascending: true })

        if (error) throw error
        setServices((data || []).map((s) => s.name))
      } catch (err) {
        console.error('Fetch services error:', err)
      }
    }
    fetchServices()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      if (serviceFilter !== 'all') query = query.eq('service_name', serviceFilter)

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,` +
            `phone.ilike.%${searchTerm}%,` +
            `application_id.ilike.%${searchTerm}%`
        )
      }

      if (startDate) {
        const startIso = new Date(`${startDate}T00:00:00`).toISOString()
        query = query.gte('created_at', startIso)
      }
      if (endDate) {
        const endIso = new Date(`${endDate}T23:59:59.999`).toISOString()
        query = query.lte('created_at', endIso)
      }

      const from = (page - 1) * PAGE_SIZE
      const to = page * PAGE_SIZE - 1

      query = query.range(from, to)

      const { data, error, count: total } = await query
      if (error) throw error

      setApps(data || [])
      setCount(total || 0)
    } catch (err) {
      console.error('Fetch applications error:', err)
      toast.error(err.message || 'Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, serviceFilter, searchTerm, startDate, endDate, page])

  const openModal = (app) => {
    setSelected(app)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">Applications</h1>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value)
              setPage(1)
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            <option value="all">All Services</option>
            {services.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDateOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <CalendarDays className="h-4 w-4 text-slate-500" />
              Select Date
            </button>

            <DateRangePopover
              open={dateOpen}
              onClose={() => setDateOpen(false)}
              startDate={startDate}
              endDate={endDate}
              setStartDate={(v) => {
                setStartDate(v)
                setPage(1)
              }}
              setEndDate={(v) => {
                setEndDate(v)
                setPage(1)
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin/add')}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Top bar: Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by Name, Phone or Application ID..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full">
            <thead>
              <tr className="bg-white">
                {[
                  'Application ID',
                  'Name',
                  'Phone',
                  'Service',
                  'Cost',
                  'Created Date',
                  'Payment Status',
                  'Application Status',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-sm font-extrabold text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12">
                    <div className="flex justify-center">
                      <LoadingSpinner label="Loading applications..." />
                    </div>
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12">
                    <div className="text-center text-sm font-semibold text-slate-500">
                      No applications found.
                    </div>
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr key={app.id} className="bg-white">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {app.application_id}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {app.name}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {app.phone}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {app.service_name}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {getApplicationCostDisplay(app)}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={app.payment_status}>{app.payment_status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge status={app.status}>{app.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openModal(app)}
                        className="rounded-full bg-blue-100 px-5 py-2 text-sm font-extrabold text-blue-700 hover:bg-blue-200"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: total + pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-500">
            Total: <span className="font-extrabold text-slate-700">{count}</span>
          </div>

          <div className="flex items-center justify-end gap-2 text-sm font-semibold text-[#1e3a5f]">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              &lt; Prev
            </button>

            {pages.map((p, idx) => {
              const prev = pages[idx - 1]
              const showDots = prev && p - prev > 1
              return (
                <React.Fragment key={p}>
                  {showDots ? (
                    <span className="px-1 text-slate-400">…</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={[
                      'h-8 w-8 rounded-md',
                      p === page ? 'bg-[#1e3a5f] text-white' : 'hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                </React.Fragment>
              )
            })}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

    <ApplicationDetailModal
      open={modalOpen}
      application={selected}
      onClose={closeModal}
      onSaved={fetchApplications}
    />

    </div>
  )
}