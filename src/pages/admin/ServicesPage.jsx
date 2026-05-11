// src/pages/admin/ServicesPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, X } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative inline-flex h-6 w-12 items-center rounded-full transition',
        checked ? 'bg-emerald-500' : 'bg-slate-300',
        disabled ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
      aria-label="Toggle active status"
    >
      <span
        className={[
          'inline-block h-5 w-5 rounded-full bg-white shadow transition',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  )
}

function parseBullets(text) {
  const v = String(text || '').trim()
  if (!v) return []
  if (v.includes('\n')) {
    return v
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => s.replace(/^[•\-]\s*/, ''))
  }
  return v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^[•\-]\s*/, ''))
}

function parseProcedures(text) {
  const v = String(text || '').trim()
  if (!v) return []
  return v
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\d+\.\s*/, ''))
}

/**
 * Scroll-safe modal shell:
 * - Overlay scrolls on very small screens
 * - Modal container constrained to 90vh
 * - Body scrolls, header/footer stay visible
 */
function ModalShell({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidthClass = 'max-w-2xl',
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-4"
      onClick={onClose}
    >
      <div
        className={[
          'bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 my-auto max-h-[90vh] flex flex-col',
          maxWidthClass,
          'overflow-y-auto',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* PART A: HEADER (sticky) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="w-full text-center text-2xl font-extrabold text-slate-900">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* PART B: BODY (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* PART C: FOOTER (sticky) */}
        {footer ? (
          <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ViewServiceModal({ open, service, onClose, onEdit, canEdit }) {
  const docs = useMemo(() => parseBullets(service?.documents), [service?.documents])
  const procs = useMemo(() => parseProcedures(service?.procedures), [service?.procedures])

  if (!open || !service) return null

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Service Details"
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex w-full items-center justify-center gap-5">
          {canEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-lg bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f]"
            >
              Edit Service
            </button>
          ) : null}

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-6 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="mx-auto max-w-lg space-y-5 text-sm">
        <div>
          <p className="font-extrabold text-slate-900">Service Name</p>
          <p className="mt-1 text-base font-semibold text-slate-500">{service.name}</p>
        </div>

        <div>
          <p className="font-extrabold text-slate-900">Description</p>
          <p className="mt-1 text-base font-semibold text-slate-500">
            {service.description || '—'}
          </p>
        </div>

        <div>
          <p className="font-extrabold text-slate-900">Required Documents</p>
          {docs.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-base font-semibold text-slate-500">
              {docs.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-base font-semibold text-slate-500">—</p>
          )}
        </div>

        <div>
          <p className="font-extrabold text-slate-900">Procedures</p>
          {procs.length ? (
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-base font-semibold text-slate-500">
              {procs.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-base font-semibold text-slate-500">—</p>
          )}
        </div>

        <div>
          <p className="font-extrabold text-slate-900">Service Cost</p>
          <p className="mt-1 text-base font-semibold text-slate-500">
            {formatCurrency(service.cost)}
          </p>
        </div>

        <div>
          <p className="font-extrabold text-slate-900">Completion Duration</p>
          <p className="mt-1 text-base font-semibold text-slate-500">
            {service.duration || '—'}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <p className="font-extrabold text-slate-900">Status</p>
          <span className="text-slate-900">➡</span>
          <p
            className={
              service.is_active
                ? 'text-base font-extrabold text-emerald-600'
                : 'text-base font-extrabold text-red-600'
            }
          >
            {service.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>
    </ModalShell>
  )
}

function ServiceFormModal({ open, mode, service, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    documents: '',
    procedures: '',
    cost: '',
    duration: '',
    is_active: true,
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && service) {
      setForm({
        name: service.name || '',
        description: service.description || '',
        documents: service.documents || '',
        procedures: service.procedures || '',
        cost: service.cost ?? '',
        duration: service.duration || '',
        is_active: Boolean(service.is_active),
      })
    } else {
      setForm({
        name: '',
        description: '',
        documents: '',
        procedures: '',
        cost: '',
        duration: '',
        is_active: true,
      })
    }
  }, [open, mode, service])

  const title = mode === 'edit' ? "Edit Service Detail's" : 'Add New Service'
  const primaryLabel = mode === 'edit' ? 'Save Changes' : 'Create Service'

  const handleSave = async () => {
    const name = form.name.trim()
    if (!name || name.length < 2) return toast.error('Service name is required')

    const costNum = Number(form.cost)
    if (Number.isNaN(costNum) || costNum < 0) return toast.error('Enter a valid cost')

    try {
      setSaving(true)

      if (mode === 'edit') {
        const { data, error } = await supabase
          .from('services')
          .update({
            name,
            description: form.description?.trim() || '',
            documents: form.documents?.trim() || '',
            procedures: form.procedures?.trim() || '',
            cost: costNum,
            duration: form.duration?.trim() || '',
            is_active: Boolean(form.is_active),
          })
          .eq('id', service.id)
          .select()
          .single()

        if (error) throw error
        toast.success('Service updated!')
        onSaved?.(data)
      } else {
        const { data, error } = await supabase
          .from('services')
          .insert({
            name,
            description: form.description?.trim() || '',
            documents: form.documents?.trim() || '',
            procedures: form.procedures?.trim() || '',
            cost: costNum,
            duration: form.duration?.trim() || '',
            is_active: true,
          })
          .select()
          .single()

        if (error) throw error
        toast.success('Service created!')
        onSaved?.(data)
      }

      onClose?.()
    } catch (err) {
      console.error('Save service error:', err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!service?.id) return
    const ok = window.confirm('Are you sure?')
    if (!ok) return

    try {
      setSaving(true)
      const { error } = await supabase.from('services').delete().eq('id', service.id)
      if (error) throw error

      toast.success('Service deleted!')
      onSaved?.()
      onClose?.()
    } catch (err) {
      console.error('Delete service error:', err)
      toast.error(err.message || 'Failed to delete service')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={title}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="flex w-full items-center justify-between">
          {mode === 'edit' ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-lg bg-red-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Delete
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-11 min-w-[150px] items-center justify-center rounded-lg bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : primaryLabel}
            </button>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-lg space-y-5">
        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Service Name
          </label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="Enter service name"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="min-h-[60px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="Enter description"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Required Documents
          </label>
          <textarea
            value={form.documents}
            onChange={(e) => setForm((p) => ({ ...p, documents: e.target.value }))}
            className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder={'• Document 1\n• Document 2'}
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Procedures
          </label>
          <textarea
            value={form.procedures}
            onChange={(e) => setForm((p) => ({ ...p, procedures: e.target.value }))}
            className="min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder={'1. Step one\n2. Step two'}
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Service Cost
          </label>
          <input
            value={form.cost}
            onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
            type="number"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="199"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Completion Duration
          </label>
          <input
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="2–3 Working Days"
            disabled={saving}
          />
        </div>
      </div>
    </ModalShell>
  )
}

export default function ServicesPage() {
  const { admin } = useAuth()
  const isAdmin = String(admin?.role || '').toLowerCase() === 'admin'

  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')

  const [togglingId, setTogglingId] = useState(null)

  const [selected, setSelected] = useState(null)
  const [viewOpen, setViewOpen] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('services').select('*').order('name')
      if (error) throw error
      setServices(data || [])
    } catch (err) {
      console.error('Fetch services error:', err)
      toast.error(err.message || 'Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return services
    return services.filter((s) => {
      const hay = `${s.name || ''} ${s.description || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [services, search])

  const handleToggle = async (service) => {
    if (!isAdmin) {
      toast.error('Only admin can update services')
      return
    }

    try {
      setTogglingId(service.id)

      const { error } = await supabase
        .from('services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id)

      if (error) throw error

      await fetchServices()
    } catch (err) {
      console.error('Toggle service error:', err)
      toast.error(err.message || 'Failed to update status')
    } finally {
      setTogglingId(null)
    }
  }

  const openView = (service) => {
    setSelected(service)
    setViewOpen(true)
  }

  const openEdit = (service) => {
    if (!isAdmin) {
      toast.error('Only admin can edit services')
      return
    }
    setSelected(service)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Services Management</h1>

      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1e3a5f] px-8 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
          >
            + Add Service
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead>
              <tr>
                {['Status', 'Service Name', 'Cost', 'Status', 'Actions'].map((h, idx) => (
                  <th
                    key={`${h}-${idx}`}
                    className="px-6 py-5 text-left text-lg font-extrabold text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#1e3a5f]" />
                        Loading services...
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16">
                    <div className="text-center text-sm font-semibold text-slate-500">
                      No services found.
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="px-6 py-5 text-center text-lg font-extrabold text-slate-900">
                      {idx + 1}.
                    </td>

                    <td className="px-6 py-5 text-center text-lg font-extrabold text-slate-900">
                      {s.name}
                    </td>

                    <td className="px-6 py-5 text-center text-lg font-extrabold text-slate-900">
                      {formatCurrency(s.cost)}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <Toggle
                        checked={Boolean(s.is_active)}
                        disabled={!isAdmin || togglingId === s.id}
                        onChange={() => handleToggle(s)}
                      />
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openView(s)}
                          className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-200"
                        >
                          View
                        </button>

                        {isAdmin ? (
                          <button
                            type="button"
                            onClick={() => openEdit(s)}
                            className="rounded-lg bg-[#1e3a5f] px-6 py-2 text-sm font-extrabold text-white hover:bg-[#16304f]"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View modal */}
      <ViewServiceModal
        open={viewOpen}
        service={selected}
        onClose={() => setViewOpen(false)}
        canEdit={isAdmin}
        onEdit={() => {
          if (!isAdmin) {
            toast.error('Only admin can edit services')
            return
          }
          setViewOpen(false)
          setEditOpen(true)
        }}
      />

      {/* Edit modal (admin only UI; RLS also enforces) */}
      <ServiceFormModal
        open={editOpen}
        mode="edit"
        service={selected}
        onClose={() => setEditOpen(false)}
        onSaved={() => fetchServices()}
      />

      {/* Add modal (admin only UI; RLS also enforces) */}
      <ServiceFormModal
        open={addOpen}
        mode="add"
        service={null}
        onClose={() => setAddOpen(false)}
        onSaved={() => fetchServices()}
      />
    </div>
  )
}