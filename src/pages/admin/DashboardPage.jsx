// src/pages/admin/DashboardPage.jsx
import ApplicationDetailModal from '../../components/admin/ApplicationDetailModal'
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

const STATUS_OPTIONS = ['All', 'Submitted', 'In Process', 'On Hold', 'Completed', 'Rejected']
const PAYMENT_OPTIONS = ['Pending', 'Paid']

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-8 py-6 shadow-[0_16px_40px_rgba(2,6,23,0.08)]">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
          <Icon className="h-5 w-5 text-[#1e3a5f]" />
        </div>
      </div>
      <div className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
        {value ?? '—'}
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
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Overview</h1>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={statsLoading ? '—' : stats?.total_apps}
            icon={Layers3}
          />
          <StatCard
            title="In Process"
            value={statsLoading ? '—' : stats?.in_process}
            icon={Clock3}
          />
          <StatCard
            title="Completed"
            value={statsLoading ? '—' : stats?.completed}
            icon={CheckCircle2}
          />
          <StatCard
            title="Pending Today"
            value={statsLoading ? '—' : stats?.pending_today}
            icon={CalendarDays}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900">Recent Applications</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
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
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
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
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(2,6,23,0.08)]">
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
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
                      className="px-5 py-4 text-left text-sm font-bold text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {appsLoading ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10">
                      <div className="flex justify-center">
                        <LoadingSpinner label="Loading applications..." />
                      </div>
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-10">
                      <div className="text-center text-sm font-semibold text-slate-500">
                        No applications found.
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
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
                        {getAppCostDisplay(app)}
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
                          className="rounded-full bg-blue-100 px-5 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200"
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