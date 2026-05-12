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

function DateRangePopover({
  open,
  onClose,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) {
  if (!open) return null

  return (
    <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="text-sm font-extrabold text-slate-900">Date Range</p>

      <div className="mt-3 grid grid-cols-1 gap-3">
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

  // paidApps used for stat calculations (paid_amount + created_at)
  const [paidApps, setPaidApps] = useState([])

  // pending stats
  const [pendingKnownTotal, setPendingKnownTotal] = useState(0)
  const [pendingUnknownCount, setPendingUnknownCount] = useState(0)

  const [tableRows, setTableRows] = useState([])

  const [serviceOptions, setServiceOptions] = useState([])
  const [serviceFilter, setServiceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('Paid')

  const [dateOpen, setDateOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const todayKey = useMemo(() => new Date().toDateString(), [])
  const currentMonth = useMemo(() => new Date().getMonth(), [])
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  // ✅ Revenue is based on paid_amount (Policy 1)
  const totalRevenue = useMemo(() => {
    return (paidApps || []).reduce((sum, a) => sum + Number(a.paid_amount || 0), 0)
  }, [paidApps])

  const todayRevenue = useMemo(() => {
    return (paidApps || [])
      .filter((a) => new Date(a.created_at).toDateString() === todayKey)
      .reduce((sum, a) => sum + Number(a.paid_amount || 0), 0)
  }, [paidApps, todayKey])

  const monthRevenue = useMemo(() => {
    return (paidApps || [])
      .filter((a) => {
        const d = new Date(a.created_at)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((sum, a) => sum + Number(a.paid_amount || 0), 0)
  }, [paidApps, currentMonth, currentYear])

  const pendingCardValue = useMemo(() => {
    const base = formatCurrency(pendingKnownTotal)
    if (pendingUnknownCount > 0) return `${base} + ${pendingUnknownCount} unknown`
    return base
  }, [pendingKnownTotal, pendingUnknownCount])

  const fetchStats = async () => {
    try {
      setLoadingStats(true)

      // Paid: only what we need for sums
      const { data: paidData, error: paidError } = await supabase
        .from('applications')
        .select('paid_amount, created_at')
        .eq('payment_status', 'Paid')
        .order('created_at', { ascending: false })

      if (paidError) throw paidError
      setPaidApps(paidData || [])

      // Pending: use numeric cost for known sum, and count unknown (text/no numeric)
      const { data: pendingData, error: pendingError } = await supabase
        .from('applications')
        .select('cost, cost_text')
        .eq('payment_status', 'Pending')

      if (pendingError) throw pendingError

      const pendingSum = (pendingData || []).reduce((sum, a) => {
        const n = Number(a.cost)
        return sum + (Number.isFinite(n) ? n : 0)
      }, 0)

      const unknown = (pendingData || []).filter((a) => {
        const hasNumeric = Number.isFinite(Number(a.cost))
        const hasText = String(a.cost_text || '').trim().length > 0
        return !hasNumeric && hasText
      }).length

      setPendingKnownTotal(pendingSum)
      setPendingUnknownCount(unknown)
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

  const fetchTable = async () => {
    try {
      setLoadingTable(true)

      let query = supabase
        .from('applications')
        .select('application_id,name,service_name,cost,cost_text,paid_amount,payment_status,created_at')
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

      const { data, error } = await query
      if (error) throw error

      setTableRows(data || [])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  useEffect(() => {
    if (!isAdmin) return
    fetchTable()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, startDate, endDate, serviceFilter, statusFilter])

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
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>

        <div className="relative">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            <thead>
              <tr>
                {['Application ID', 'Name', 'Service', 'Amount', 'Payment', 'Date'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-5 text-left text-lg font-extrabold text-slate-600"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loadingTable ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14">
                    <div className="flex justify-center">
                      <LoadingSpinner label="Loading revenue..." />
                    </div>
                  </td>
                </tr>
              ) : tableRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14">
                    <div className="text-center text-sm font-semibold text-slate-500">
                      No records found.
                    </div>
                  </td>
                </tr>
              ) : (
                tableRows.map((row) => (
                  <tr key={`${row.application_id}-${row.created_at}`}>
                    <td className="px-6 py-5 text-lg font-extrabold text-slate-900">
                      {row.application_id}
                    </td>
                    <td className="px-6 py-5 text-lg font-extrabold text-slate-900">
                      {row.name}
                    </td>
                    <td className="px-6 py-5 text-lg font-extrabold text-slate-900">
                      {row.service_name}
                    </td>
                    <td className="px-6 py-5 text-lg font-extrabold text-slate-900">
                      {getRowAmountDisplay(row)}
                    </td>
                    <td className="px-6 py-5">
                      <Badge status={row.payment_status}>{row.payment_status}</Badge>
                    </td>
                    <td className="px-6 py-5 text-lg font-extrabold text-slate-900">
                      {formatDate(row.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs font-semibold text-slate-400">
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Filters apply to the table.
          </span>
        </div>
      </div>
    </div>
  )
}