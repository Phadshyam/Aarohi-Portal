// src/pages/admin/RevenuePage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronDown, CalendarDays } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import DateRangePopover from '../../components/common/DateRangePopover'

function RevenueCard({ title, value, accent = 'text-[#1e3a5f]' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_30px_rgba(2,6,23,0.10)]">
      <p className="text-center text-xl font-extrabold text-slate-900">{title}</p>
      <p className={['mt-3 text-center text-2xl font-extrabold', accent].join(' ')}>
        {value}
      </p>
    </div>
  )
}


function getRowAmountDisplay(row) {
  // Paid => always show paid_amount (Policy 1)
  if (row?.payment_status === 'Paid') {
    const paid = Number(row?.paid_amount)
    return Number.isFinite(paid) ? formatCurrency(paid) : '—'
  }

  // Pending => show cost_text if present, else numeric cost, else —
  const costText = String(row?.cost_text || '').trim()
  if (costText) return costText

  const cost = Number(row?.cost)
  return Number.isFinite(cost) ? formatCurrency(cost) : '—'
}

export default function RevenuePage() {
  const navigate = useNavigate()
  const { admin } = useAuth()
  const isAdmin = String(admin?.role || '').toLowerCase() === 'admin'

  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTable, setLoadingTable] = useState(true)

  const [totalRevenue, setTotalRevenue] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [monthRevenue, setMonthRevenue] = useState(0)
  const [pendingKnownTotal, setPendingKnownTotal] = useState(0)
  const [pendingUnknownCount, setPendingUnknownCount] = useState(0)

  const pendingCardValue = useMemo(() => {
    const base = formatCurrency(pendingKnownTotal)
    if (pendingUnknownCount > 0) return `${base} + ${pendingUnknownCount} unknown`
    return base
  }, [pendingKnownTotal, pendingUnknownCount])

  // Pagination for table
  const PAGE_SIZE = 15
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  // Filters & Table State
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [dateOpen, setDateOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [serviceOptions, setServiceOptions] = useState([])
  const [tableRows, setTableRows] = useState([])
  
  const [topServices, setTopServices] = useState([])
  const [loadingTop, setLoadingTop] = useState(true)

  const fetchStats = async () => {
    try {
      setLoadingStats(true)

      const { data, error } = await supabase.rpc('get_revenue_stats')
      if (error) throw error

      setTotalRevenue(data?.totalRevenue || 0)
      setTodayRevenue(data?.todayRevenue || 0)
      setMonthRevenue(data?.monthRevenue || 0)
      setPendingKnownTotal(data?.pendingKnownTotal || 0)
      setPendingUnknownCount(data?.pendingUnknownCount || 0)
    } catch (err) {
      console.error('Revenue stats error:', err)
      toast.error(err.message || 'Failed to load revenue')
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('name')
        .order('name', { ascending: true })
      if (error) throw error
      setServiceOptions((data || []).map((s) => s.name))
    } catch (err) {
      console.error('Services list error:', err)
    }
  }

  const fetchTopServices = async () => {
    try {
      setLoadingTop(true)
      const { data, error } = await supabase.rpc('get_top_earning_services', { limit_val: 5 })
      if (!error) {
        setTopServices(data || [])
      }
    } catch (err) {
      console.error('Top services error:', err)
    } finally {
      setLoadingTop(false)
    }
  }

  const fetchTable = async () => {
    try {
      setLoadingTable(true)

      let query = supabase
        .from('applications')
        .select('application_id,name,service_name,cost,cost_text,paid_amount,payment_status,created_at', { count: 'exact' })
        .in('payment_status', ['Paid', 'Pending'])
        .order('created_at', { ascending: false })

      if (statusFilter === 'Paid') query = query.eq('payment_status', 'Paid')
      if (statusFilter === 'Pending') query = query.eq('payment_status', 'Pending')

      if (serviceFilter !== 'all') query = query.eq('service_name', serviceFilter)

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

      const { data, error, count: tableCount } = await query
      if (error) throw error

      setTableRows(data || [])
      setCount(tableCount || 0)
    } catch (err) {
      console.error('Revenue table error:', err)
      toast.error(err.message || 'Failed to load revenue table')
    } finally {
      setLoadingTable(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return
    fetchStats()
    fetchServices()
    fetchTopServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    fetchTable()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, startDate, endDate, serviceFilter, statusFilter, page])

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-extrabold text-amber-900">Access restricted</h1>
        <p className="mt-2 text-sm font-semibold text-amber-900">
          Revenue is visible to admins only.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/dashboard')}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#1e3a5f] px-5 text-sm font-semibold text-white hover:bg-[#16304f]"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Revenue</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <RevenueCard
          title="Total Revenue"
          value={loadingStats ? '—' : formatCurrency(totalRevenue)}
        />
        <RevenueCard
          title="Today’s Revenue"
          value={loadingStats ? '—' : formatCurrency(todayRevenue)}
        />
        <RevenueCard
          title="This Month"
          value={loadingStats ? '—' : formatCurrency(monthRevenue)}
        />
        <RevenueCard
          title="Pending Payments"
          value={loadingStats ? '—' : pendingCardValue}
          accent="text-amber-500"
        />
      </div>

      {/* Top Earning Services */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(2,6,23,0.06)]">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Top Earning Services</h2>
        {loadingTop ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : topServices.length === 0 ? (
          <p className="text-sm text-slate-500">No revenue data available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topServices.map((ts) => (
              <div key={ts.service_name} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100 transition hover:bg-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">{ts.service_name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ts.application_count} applications</p>
                </div>
                <div className="font-bold text-[#1e3a5f] text-right">
                  {formatCurrency(ts.total_revenue)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDateOpen((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            <span>Date Range</span>
            <ChevronDown className="h-4 w-4 text-slate-600" />
          </button>

          <DateRangePopover
            open={dateOpen}
            onClose={() => setDateOpen(false)}
            startDate={startDate}
            endDate={endDate}
            setStartDate={(v) => { setStartDate(v); setPage(1); }}
            setEndDate={(v) => { setEndDate(v); setPage(1); }}
          />
        </div>

        <div className="relative">
          <label htmlFor="serviceFilter" className="sr-only">Service Filter</label>
          <select
            id="serviceFilter"
            name="serviceFilter"
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            className="h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-5 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            <option value="all">Service</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        </div>

        <div className="relative">
          <label htmlFor="statusFilter" className="sr-only">Status Filter</label>
          <select
            id="statusFilter"
            name="statusFilter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 appearance-none rounded-lg border border-slate-200 bg-slate-50 px-5 pr-10 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          >
            <option value="Paid">Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr>
                {['Application ID', 'Name', 'Service', 'Amount', 'Payment', 'Date'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loadingTable ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-3.5 w-full max-w-[140px] rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-14">
                    <div className="text-center text-sm font-semibold text-slate-500">
                      No records found.
                    </div>
                  </td>
                </tr>
              ) : (
                tableRows.map((row) => (
                  <tr key={`${row.application_id}-${row.created_at}`} className="bg-white transition-colors duration-200 hover:bg-slate-50/80">
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {row.application_id}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {row.name}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {row.service_name}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {getRowAmountDisplay(row)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={row.payment_status}>{row.payment_status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-normal text-slate-700">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-500">
            Total Records: <span className="text-slate-800">{count}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || loadingTable}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-[#1e3a5f] hover:bg-slate-100 disabled:opacity-50"
            >
              &lt; Prev
            </button>
            <span className="text-sm font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loadingTable}
              className="rounded-lg px-3 py-1 text-sm font-semibold text-[#1e3a5f] hover:bg-slate-100 disabled:opacity-50"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}