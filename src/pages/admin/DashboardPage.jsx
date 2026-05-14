// src/pages/admin/DashboardPage.jsx
import ApplicationDetailModal from '../../components/admin/ApplicationDetailModal'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../utils/helpers'

const STATUS_OPTIONS = ['All', 'Submitted', 'In Process', 'On Hold', 'Completed', 'Rejected']
const PAYMENT_OPTIONS = ['Pending', 'Paid']

function StatCard({ title, value, icon: Icon, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white px-7 py-9 shadow-[0_2px_10px_rgba(0,0,0,0.04)] animate-pulse">
        <div className="flex items-start justify-between">
          <div className="h-4 w-32 rounded-md bg-slate-200" />
          <div className="h-11 w-11 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-6 h-9 w-20 rounded-lg bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-7 py-9 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
          <Icon className="h-5 w-5 text-[#1e3a5f]" />
        </div>
      </div>
      <div className="mt-5 text-4xl font-bold tracking-tight text-slate-900">{value ?? '—'}</div>
    </div>
  )
}

function getAppCostDisplay(app) {
  const t = String(app?.cost_text || '').trim()
  if (t) return t

  const n = Number(app?.cost)
  if (Number.isFinite(n)) return formatCurrency(n)

  return '—'
}

export default function DashboardPage() {
  const [statsLoading, setStatsLoading] = useState(true)
  const [stats, setStats] = useState(null)

  const [appsLoading, setAppsLoading] = useState(true)
  const [applications, setApplications] = useState([])

  const [serviceOptions, setServiceOptions] = useState([])

  const [statusFilter, setStatusFilter] = useState('All')
  const [serviceFilter, setServiceFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('') // yyyy-mm-dd

  const [selectedApp, setSelectedApp] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const openModal = (app) => {
    setSelectedApp(app)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedApp(null)
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const { data, error } = await supabase.rpc('get_dashboard_stats')
      if (error) throw error
      setStats(data || null)
    } catch (err) {
      console.error('Stats error:', err)
      toast.error(err.message || 'Failed to load dashboard stats')
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchServicesForFilter = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('name')
        .order('name', { ascending: true })

      if (error) throw error
      setServiceOptions((data || []).map((s) => s.name))
    } catch (err) {
      console.error('Services filter error:', err)
    }
  }

  const fetchApplications = async () => {
    try {
      setAppsLoading(true)

      let q = supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'All') q = q.eq('status', statusFilter)
      if (serviceFilter !== 'All') q = q.eq('service_name', serviceFilter)

      if (dateFilter) {
        const start = new Date(`${dateFilter}T00:00:00`)
        const end = new Date(`${dateFilter}T23:59:59.999`)
        q = q.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
      }

      q = q.limit(10)

      const { data, error } = await q
      if (error) throw error

      setApplications(data || [])
    } catch (err) {
      console.error('Applications error:', err)
      toast.error(err.message || 'Failed to load applications')
    } finally {
      setAppsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchServicesForFilter()
  }, [])

  useEffect(() => {
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, serviceFilter, dateFilter])

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Dashboard overview</h1>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total applications"
            value={statsLoading ? '—' : stats?.total_apps}
            icon={Layers3}
            loading={statsLoading}
          />
          <StatCard
            title="In process"
            value={statsLoading ? '—' : stats?.in_process}
            icon={Clock3}
            loading={statsLoading}
          />
          <StatCard
            title="Completed"
            value={statsLoading ? '—' : stats?.completed}
            icon={CheckCircle2}
            loading={statsLoading}
          />
          <StatCard
            title="Pending today"
            value={statsLoading ? '—' : stats?.pending_today}
            icon={CalendarDays}
            loading={statsLoading}
          />
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Recent applications</h2>

            <div className="flex flex-wrap gap-2 sm:items-center sm:justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 min-w-[140px] rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Status' : s}
                  </option>
                ))}
              </select>

              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="h-10 min-w-[160px] flex-1 rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 sm:flex-initial"
              >
                <option value="All">All Services</option>
                {serviceOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-200/90 bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
                <tr>
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
                      className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {appsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse bg-white">
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} className="px-5 py-3.5">
                          <div className="h-3.5 w-full max-w-[120px] rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-14">
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                          <Layers3 className="h-6 w-6" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-800">No applications found</p>
                        <p className="mt-1 max-w-sm text-sm font-normal text-slate-500">
                          Adjust filters or pick another date to see results.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
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
                        {getAppCostDisplay(app)}
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
        </div>
      </div>

    <ApplicationDetailModal
      open={modalOpen}
      application={selectedApp}
      onClose={closeModal}
      onSaved={fetchApplications}
    />

    </div>
  )
}