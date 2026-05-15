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

function StatCard({ title, value, icon: Icon, loading, color = "blue" }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-pulse">
        <div className="flex items-start justify-between">
          <div className="h-4 w-24 rounded bg-slate-100" />
          <div className="h-10 w-10 rounded-xl bg-slate-50" />
        </div>
        <div className="mt-6 h-10 w-20 rounded-lg bg-slate-50" />
      </div>
    )
  }

  const iconColors = {
    blue: "text-blue-600 bg-blue-50 ring-blue-100",
    amber: "text-amber-600 bg-amber-50 ring-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 ring-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 ring-indigo-100",
  }

  const colorStyle = iconColors[color] || iconColors.blue

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</p>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-110 ${colorStyle}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900">{value ?? '0'}</div>
      </div>
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
            color="indigo"
          />
          <StatCard
            title="In process"
            value={statsLoading ? '—' : stats?.in_process}
            icon={Clock3}
            loading={statsLoading}
            color="amber"
          />
          <StatCard
            title="Completed"
            value={statsLoading ? '—' : stats?.completed}
            icon={CheckCircle2}
            loading={statsLoading}
            color="emerald"
          />
          <StatCard
            title="Pending today"
            value={statsLoading ? '—' : stats?.pending_today}
            icon={CalendarDays}
            loading={statsLoading}
            color="blue"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Recent applications</h2>
            <p className="mt-1 text-sm text-slate-500">Overview of the latest 10 submissions across the platform.</p>
          </div>

          <div className="flex flex-wrap gap-3 sm:items-center">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 min-w-[140px] appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Status' : s}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <div className="relative flex-1 sm:flex-initial">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="h-10 min-w-[160px] w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/10"
              >
                <option value="All">All Services</option>
                {serviceOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
              </div>
            </div>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition-all focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
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
                        <Badge color={(app.source || 'offline').toLowerCase() === 'online' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800 border border-slate-200'}>
                          {app.source || 'Offline'}
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