// src/pages/admin/ServicesPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, X, Plus, Package } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import {
  ICON_OPTIONS,
  SERVICE_CATEGORIES,
  iconKeyToIcon,
  normalizeBadges,
} from '../../utils/serviceCardConfig'

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={[
        'relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25 focus:ring-offset-2',
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
 * Converts a text cost to a numeric value ONLY if it is a clean number.
 * Examples:
 *  - "200" -> 200
 *  - "₹200" -> 200 (we strip ₹ and commas)
 *  - "As per requirements" -> null
 *  - "200-500" -> null
 */
function parseCostTextToNumber(costText) {
  const raw = String(costText || '').trim()
  if (!raw) return null

  const normalized = raw.replace(/₹/g, '').replace(/,/g, '').trim()

  // Accept only pure numbers (int/decimal)
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null

  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

function getCostDisplay(service) {
  const t = String(service?.cost_text || '').trim()
  if (t) return t

  const n = Number(service?.cost)
  return Number.isFinite(n) ? formatCurrency(n) : '—'
}

/**
 * Scroll-safe modal shell:
 * - Overlay scrolls on very small screens
 * - Modal container constrained to 90vh
 * - Body scrolls, header/footer stay visible
 */
function ModalShell({ open, title, onClose, children, footer, maxWidthClass = 'max-w-2xl' }) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-4"
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
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer ? (
          <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ServiceCardPreview({ service }) {
  const Icon = iconKeyToIcon(service?.icon_key)
  const badges = normalizeBadges(service?.badges, 2)
  const summary = String(service?.description || '').trim()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(2,6,23,0.08)]">
      <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
        Live Preview (Homepage Card)
      </p>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
          <Icon className="h-5 w-5 text-[#1e3a5f]" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-extrabold text-slate-900 leading-snug [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
            {service?.name || 'Service Name'}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500 truncate">
            {summary ? summary : 'Short summary will appear here.'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex min-h-[28px] flex-wrap gap-2">
        {badges.map((b, idx) => {
          const styles = [
            'bg-blue-50 text-blue-700 border border-blue-200',
            'bg-amber-50 text-amber-800 border border-amber-200',
            'bg-indigo-50 text-indigo-700 border border-indigo-200',
            'bg-emerald-50 text-emerald-700 border border-emerald-200',
          ]
          return (
            <span
              key={`${b}-${idx}`}
              className={[
                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold',
                styles[idx % styles.length],
              ].join(' ')}
            >
              {b}
            </span>
          )
        })}
      </div>

      <div className="mt-4 pt-4">
        <div className="h-px w-full bg-slate-100" />
        <p className="mt-3 text-xs font-semibold text-slate-400">
          Tap to view full details
        </p>
      </div>
    </div>
  )
}

function ViewServiceModal({ open, service, onClose, onEdit, canEdit }) {
  const docs = useMemo(() => parseBullets(service?.documents), [service?.documents])
  const procs = useMemo(() => parseProcedures(service?.procedures), [service?.procedures])
  const Icon = iconKeyToIcon(service?.icon_key)
  const categoryLabel =
    SERVICE_CATEGORIES.find((c) => c.key === service?.category_key)?.label || '—'
  const badges = normalizeBadges(service?.badges, 2)

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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
            <Icon className="h-5 w-5 text-[#1e3a5f]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Homepage Category</p>
            <p className="text-sm font-extrabold text-slate-900">{categoryLabel}</p>
          </div>
        </div>

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
          <p className="font-extrabold text-slate-900">Badges (max 2)</p>
          {badges.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((b, idx) => (
                <span
                  key={`${b}-${idx}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-700"
                >
                  {b}
                </span>
              ))}
            </div>
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
          <p className="font-extrabold text-slate-900">Service Cost / Fees</p>
          <p className="mt-1 text-base font-semibold text-slate-500">
            {getCostDisplay(service)}
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
    cost: '', // now treated as TEXT input in UI
    duration: '',
    is_active: true,

    category_key: 'business',
    icon_key: 'idcard',
    badges: [],
    sort_order: 9999,
  })

  const [badgeInput, setBadgeInput] = useState('')

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && service) {
      setForm({
        name: service.name || '',
        description: service.description || '',
        documents: service.documents || '',
        procedures: service.procedures || '',
        // prefer cost_text, fallback to numeric cost
        cost: String(service.cost_text || (service.cost ?? '')),
        duration: service.duration || '',
        is_active: Boolean(service.is_active),

        category_key: service.category_key || 'business',
        icon_key: service.icon_key || 'idcard',
        badges: normalizeBadges(service.badges, 2),
        sort_order: Number.isFinite(Number(service.sort_order))
          ? Number(service.sort_order)
          : 9999,
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

        category_key: 'business',
        icon_key: 'idcard',
        badges: [],
        sort_order: 9999,
      })
    }

    setBadgeInput('')
  }, [open, mode, service])

  const title = mode === 'edit' ? "Edit Service Detail's" : 'Add New Service'
  const primaryLabel = mode === 'edit' ? 'Save Changes' : 'Create Service'

  const addBadge = () => {
    const v = badgeInput.trim()
    if (!v) return

    setForm((p) => {
      const existing = normalizeBadges(p.badges, 10)
      if (existing.length >= 2) {
        toast.error('Max 2 badges allowed')
        return p
      }
      const dup = existing.some((b) => b.toLowerCase() === v.toLowerCase())
      if (dup) {
        toast.error('Badge already added')
        return p
      }
      return { ...p, badges: [...existing, v].slice(0, 2) }
    })

    setBadgeInput('')
  }

  const removeBadge = (badge) => {
    setForm((p) => ({
      ...p,
      badges: normalizeBadges(p.badges, 10).filter((b) => b !== badge),
    }))
  }

  const handleSave = async () => {
    const name = form.name.trim()
    if (!name || name.length < 2) return toast.error('Service name is required')

    // cost as TEXT (required)
    const costText = String(form.cost || '').trim()
    if (!costText) return toast.error('Enter service cost/fees (text allowed)')

    const sortOrderNum = Number(form.sort_order)
    if (Number.isNaN(sortOrderNum) || sortOrderNum < 0) {
      return toast.error('Enter a valid homepage order (0 or greater)')
    }

    const allowedCategory = SERVICE_CATEGORIES.some((c) => c.key === form.category_key)
    if (!allowedCategory) return toast.error('Select a valid category')

    const allowedIcon = ICON_OPTIONS.some((i) => i.key === form.icon_key)
    if (!allowedIcon) return toast.error('Select a valid icon')

    const badges = normalizeBadges(form.badges, 2)

    // numeric cost is optional (only if costText is a pure number)
    const numericCost = parseCostTextToNumber(costText)

    try {
      setSaving(true)

      const payload = {
        name,
        description: form.description?.trim() || '',
        documents: form.documents?.trim() || '',
        procedures: form.procedures?.trim() || '',
        cost_text: costText,
        cost: numericCost, // can be null
        duration: form.duration?.trim() || '',
        is_active: Boolean(form.is_active),

        category_key: form.category_key,
        icon_key: form.icon_key,
        badges,
        sort_order: sortOrderNum,
      }

      if (mode === 'edit') {
        const { data, error } = await supabase
          .from('services')
          .update(payload)
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
            ...payload,
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
      <div className="mx-auto max-w-lg space-y-6">
        {/* Core fields */}
        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">Service Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="Enter service name"
            disabled={saving}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            className="min-h-[70px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="Enter description"
            disabled={saving}
          />
          <p className="mt-1 text-xs font-semibold text-slate-400">
            This same text will be used as the card summary (one line) on homepage.
          </p>
        </div>

        {/* Homepage Card Settings */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-extrabold text-slate-900">Homepage Card Settings</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">Category</label>
              <select
                value={form.category_key}
                onChange={(e) => setForm((p) => ({ ...p, category_key: e.target.value }))}
                disabled={saving}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                {SERVICE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">Icon</label>
              <select
                value={form.icon_key}
                onChange={(e) => setForm((p) => ({ ...p, icon_key: e.target.value }))}
                disabled={saving}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i.key} value={i.key}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">
                Homepage Order
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
                disabled={saving}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                placeholder="1"
              />
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Lower number shows first in <span className="font-extrabold">All Services</span>.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">
                Badges (max 2)
              </label>

              <div className="flex gap-2">
                <input
                  value={badgeInput}
                  onChange={(e) => setBadgeInput(e.target.value)}
                  disabled={saving || normalizeBadges(form.badges, 10).length >= 2}
                  className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="e.g. Popular"
                />
                <button
                  type="button"
                  onClick={addBadge}
                  disabled={
                    saving ||
                    !badgeInput.trim() ||
                    normalizeBadges(form.badges, 10).length >= 2
                  }
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1e3a5f] px-4 text-sm font-extrabold text-white hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {normalizeBadges(form.badges, 2).length ? (
                  normalizeBadges(form.badges, 2).map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-700"
                    >
                      {b}
                      <button
                        type="button"
                        onClick={() => removeBadge(b)}
                        disabled={saving}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-100"
                        aria-label="Remove badge"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-xs font-semibold text-slate-400">No badges added.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <ServiceCardPreview service={form} />
          </div>
        </div>

        {/* Other existing fields */}
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
          <label className="mb-2 block text-sm font-extrabold text-slate-900">Procedures</label>
          <textarea
            value={form.procedures}
            onChange={(e) => setForm((p) => ({ ...p, procedures: e.target.value }))}
            className="min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder={'1. Step one\n2. Step two'}
            disabled={saving}
          />
        </div>

        {/* COST (TEXT) */}
        <div>
          <label className="mb-2 block text-sm font-extrabold text-slate-900">
            Service Cost / Fees (Text Allowed)
          </label>
          <input
            value={form.cost}
            onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
            type="text"
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
            placeholder="e.g. 200 OR As per requirements OR ₹200 - ₹500"
            disabled={saving}
          />
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Tip: If you enter a pure number (like <span className="font-extrabold">200</span>),
            we also store it as numeric for calculations.
          </p>
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
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name')
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
    <div className="space-y-10">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Services management</h1>

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="relative w-full min-w-0 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services…"
            className="h-10 w-full rounded-lg border border-slate-200/90 bg-slate-50/80 pl-9 pr-3 text-sm font-normal text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f] px-5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
          >
            + Add service
          </button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
              <tr>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Service
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Cost
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Active
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse bg-white">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="mx-auto h-3.5 max-w-[100px] rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14">
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-800">No services found</p>
                      <p className="mt-1 max-w-sm text-sm font-normal text-slate-500">
                        {search.trim()
                          ? 'Try a different search term.'
                          : 'Services you add will appear in this table.'}
                      </p>
                      {search.trim() ? (
                        <button
                          type="button"
                          onClick={() => setSearch('')}
                          className="mt-5 inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                        >
                          Clear search
                        </button>
                      ) : isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setAddOpen(true)}
                          className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#1e3a5f] px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
                        >
                          Add service
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const RowIcon = iconKeyToIcon(s.icon_key)
                  return (
                    <tr
                      key={s.id}
                      className="bg-white transition-colors duration-200 hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 text-center text-sm font-medium tabular-nums text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 ring-1 ring-slate-200/80">
                            <RowIcon className="h-4 w-4 text-[#1e3a5f]" aria-hidden />
                          </div>
                          <span className="text-sm font-medium text-slate-900">{s.name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-normal text-slate-700">
                        {getCostDisplay(s)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center">
                          <Toggle
                            checked={Boolean(s.is_active)}
                            disabled={!isAdmin || togglingId === s.id}
                            onChange={() => handleToggle(s)}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openView(s)}
                            className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#1e3a5f] shadow-sm transition-all duration-200 hover:border-[#1e3a5f]/25 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                          >
                            View
                          </button>

                          {isAdmin ? (
                            <button
                              type="button"
                              onClick={() => openEdit(s)}
                              className="inline-flex min-h-[36px] items-center rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
                            >
                              Edit
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })
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

      {/* Edit modal */}
      <ServiceFormModal
        open={editOpen}
        mode="edit"
        service={selected}
        onClose={() => setEditOpen(false)}
        onSaved={() => fetchServices()}
      />

      {/* Add modal */}
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