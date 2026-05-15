// src/pages/admin/ApplicationsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import ApplicationDetailModal from '../../components/admin/ApplicationDetailModal'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  FileText,
  Plus,
  Search,
  X,
  Download,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useServices } from '../../context/ServicesContext'
import DateRangePopover from '../../components/common/DateRangePopover'

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
      <span className="text-sm font-medium text-slate-600">Pending</span>
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
      <span className="text-sm font-medium text-emerald-600">Paid</span>
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
  const [sourceFilter, setSourceFilter] = useState('all')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [dateOpen, setDateOpen] = useState(false)

  const [loading, setLoading] = useState(false)
  const [apps, setApps] = useState([])
  const [count, setCount] = useState(0)

  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)

  const { services: servicesData } = useServices()
  const services = useMemo(() => (servicesData || []).map(s => s.name), [servicesData])

  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Export State
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportStart, setExportStart] = useState('')
  const [exportEnd, setExportEnd] = useState('')
  const [exportLoading, setExportLoading] = useState(false)

  const totalPages = useMemo(() => Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)), [count])
  const pages = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('applications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        setRefresh((prev) => prev + 1)
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Debounce search 300ms
  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearchTerm(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [searchInput])

  const fetchApplications = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      if (serviceFilter !== 'all') query = query.eq('service_name', serviceFilter)
      if (sourceFilter !== 'all') query = query.eq('source', sourceFilter.toLowerCase())

      if (searchTerm) {
        // Sanitize: strip characters that could manipulate PostgREST filter grammar
        const safe = searchTerm.replace(/[^a-zA-Z0-9\s\-]/g, '')
        if (safe) {
          query = query.or(
            `name.ilike.%${safe}%,` +
              `phone.ilike.%${safe}%,` +
              `application_id.ilike.%${safe}%`
          )
        }
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
  }, [statusFilter, serviceFilter, sourceFilter, searchTerm, startDate, endDate, page, refresh])

  const handleExportConfirm = async () => {
    if (exportStart && exportEnd) {
      if (new Date(exportStart) > new Date(exportEnd)) {
        toast.error('From date cannot be greater than To date')
        return
      }
    }

    try {
      setExportLoading(true)

      let query = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') query = query.eq('status', statusFilter)
      if (serviceFilter !== 'all') query = query.eq('service_name', serviceFilter)
      if (sourceFilter !== 'all') query = query.eq('source', sourceFilter.toLowerCase())

      if (searchTerm) {
        const safe = searchTerm.replace(/[^a-zA-Z0-9\s\-]/g, '')
        if (safe) {
          query = query.or(
            `name.ilike.%${safe}%,` +
            `phone.ilike.%${safe}%,` +
            `application_id.ilike.%${safe}%`
          )
        }
      }

      if (exportStart) {
        const startIso = new Date(`${exportStart}T00:00:00`).toISOString()
        query = query.gte('created_at', startIso)
      }
      if (exportEnd) {
        const endIso = new Date(`${exportEnd}T23:59:59.999`).toISOString()
        query = query.lte('created_at', endIso)
      }

      const { data, error } = await query
      if (error) throw error

      if (!data || !data.length) {
        toast.error('No records found to export in this date range')
        return
      }

      const headers = ['Application ID', 'Date', 'Name', 'Phone', 'Service', 'Cost', 'Paid Amount', 'Status', 'Payment Status', 'Source']
      const rows = data.map(app => [
        app.application_id || '',
        app.created_at ? new Date(app.created_at).toLocaleDateString() : '',
        app.name || '',
        app.phone || '',
        app.service_name || '',
        app.cost_text || app.cost || '',
        app.paid_amount || '0',
        app.status || '',
        app.payment_status || '',
        app.source || ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `applications-${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Export successful')
      setExportModalOpen(false)
    } catch (err) {
      console.error('Export CSV error:', err)
      toast.error('Failed to export CSV')
    } finally {
      setExportLoading(false)
    }
  }

  const openModal = (app) => {
    setSelected(app)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelected(null)
  }

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Applications</h1>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
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
              className="h-10 min-w-[160px] rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="all">All Services</option>
              {services.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value)
                setPage(1)
              }}
              className="h-10 min-w-[140px] rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            >
              <option value="all">All Sources</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
            </select>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDateOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                <CalendarDays className="h-4 w-4 text-slate-500" />
                Date range
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
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
            >
              <Plus className="h-4 w-4" />
              Add application
            </button>

            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200/90 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="relative w-full min-w-0 xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, phone, or application ID…"
              className="h-10 w-full rounded-lg border border-slate-200/90 bg-slate-50/80 pl-9 pr-3 text-sm font-normal text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr>
                {[
                  'Application ID',
                  'Name',
                  'Phone',
                  'Service',
                  'Cost',
                  'Created date',
                  'Payment status',
                  'Application status',
                  'Source',
                  'Actions',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white">
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-3.5 w-full max-w-[120px] rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : apps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                        <FileText className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-800">No applications match</p>
                      <p className="mt-1 max-w-sm text-sm font-normal text-slate-500">
                        Try different filters or add a new application.
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate('/admin/add')}
                          className="inline-flex h-10 items-center rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
                        >
                          Add application
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchInput('')
                            setStatusFilter('all')
                            setServiceFilter('all')
                            setSourceFilter('all')
                            setStartDate('')
                            setEndDate('')
                            setPage(1)
                          }}
                          className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                        >
                          Reset filters
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                apps.map((app) => (
                  <tr key={app.id} className="bg-white transition-colors duration-200 hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {app.application_id}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {app.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {app.phone}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {app.service_name}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {getApplicationCostDisplay(app)}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={app.payment_status}>{app.payment_status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={app.status}>{app.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge color={app.source === 'online' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800 border border-slate-200'}>
                        {app.source || 'offline'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => openModal(app)}
                        className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1e3a5f] shadow-sm transition-all duration-200 hover:border-[#1e3a5f]/25 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
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

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-slate-500">
            Total: <span className="font-semibold text-slate-800">{count}</span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-sm font-medium text-[#1e3a5f]">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="rounded-lg px-3 py-1.5 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:cursor-not-allowed disabled:opacity-40"
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
                      'h-8 min-w-[2rem] rounded-lg px-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20',
                      p === page ? 'bg-[#1e3a5f] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100',
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
              className="rounded-lg px-3 py-1.5 transition-colors duration-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Export Applications</h2>
              <button 
                onClick={() => setExportModalOpen(false)} 
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mt-2">
              Select a date range to export. Current filters (status, service, search) will apply.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">From Date</label>
                <input
                  type="date"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">To Date</label>
                <input
                  type="date"
                  value={exportEnd}
                  onChange={(e) => setExportEnd(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-800 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                />
              </div>
              <button
                type="button"
                onClick={handleExportConfirm}
                disabled={exportLoading}
                className="mt-6 w-full rounded-lg bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:opacity-50"
              >
                {exportLoading ? 'Exporting...' : 'Download CSV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}