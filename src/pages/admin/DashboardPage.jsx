// src/pages/admin/DashboardPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Layers3,
  Pencil,
  X,
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

function Toggle({ value, onChange }) {
  const isPaid = value === 'Paid'
  return (
    <button
      type="button"
      onClick={() => onChange(isPaid ? 'Pending' : 'Paid')}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      aria-label="Toggle payment status"
    >
      <span
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          isPaid ? 'bg-emerald-500' : 'bg-slate-300',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 rounded-full bg-white shadow transition',
            isPaid ? 'translate-x-5' : 'translate-x-1',
          ].join(' ')}
        />
      </span>
      <span>{value}</span>
    </button>
  )
}

function ApplicationDetailModal({ open, application, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(application?.status || 'Submitted')
  const [paymentStatus, setPaymentStatus] = useState(application?.payment_status || 'Pending')

  useEffect(() => {
    if (!open) return
    setStatus(application?.status || 'Submitted')
    setPaymentStatus(application?.payment_status || 'Pending')
  }, [open, application])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleSave = async () => {
    if (!application?.id) return
    if (!STATUS_OPTIONS.includes(status) || status === 'All') {
      toast.error('Please select a valid status')
      return
    }
    if (!PAYMENT_OPTIONS.includes(paymentStatus)) {
      toast.error('Please select a valid payment status')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase
        .from('applications')
        .update({
          status,
          payment_status: paymentStatus,
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
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(2,6,23,0.25)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
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

        <div className="px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Application ID</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {application.application_id}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{application.name}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Contact / Phone</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{application.phone}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Service</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {application.service_name}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Cost</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900">
                {formatCurrency(application.cost)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Created Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(application.created_at)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Completed Date</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {application.completed_at ? formatDate(application.completed_at) : '—'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Application Status</p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="mt-3">
                <Badge status={status}>{status}</Badge>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Payment Status</p>
              <div className="mt-2">
                <Toggle value={paymentStatus} onChange={setPaymentStatus} />
              </div>
              <div className="mt-3">
                <Badge status={paymentStatus}>{paymentStatus}</Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
  )
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
      // non-blocking
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

        {/* Stat cards */}
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

      {/* Recent Applications */}
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
                        {formatCurrency(app.cost)}
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