// src/pages/admin/SettingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { SERVICE_CATEGORIES } from '../../utils/serviceCardConfig'

const STATUS_OPTIONS = ['Submitted', 'In Process', 'On Hold']

function Toggle({ checked, disabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={[
        'relative inline-flex h-6 w-12 items-center rounded-full transition',
        checked ? 'bg-emerald-500' : 'bg-slate-300',
        disabled ? 'cursor-not-allowed opacity-50' : '',
      ].join(' ')}
      aria-label="Toggle"
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

function CardShell({ title, children, disabled = false }) {
  return (
    <div
      className={[
        'rounded-lg border border-slate-200 bg-white px-8 py-6 shadow-[0_12px_30px_rgba(2,6,23,0.10)]',
        disabled ? 'opacity-90' : '',
      ].join(' ')}
    >
      <h2 className="text-center text-xl font-extrabold text-slate-900">{title}</h2>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function normalizeCategoryOrder(inputOrder) {
  const allowed = SERVICE_CATEGORIES.map((c) => c.key)
  const seen = new Set()

  const base = Array.isArray(inputOrder) ? inputOrder : []
  const cleaned = base
    .map((x) => String(x || '').trim())
    .filter((k) => allowed.includes(k))
    .filter((k) => {
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })

  // Ensure all categories exist in the order (append missing)
  for (const k of allowed) {
    if (!seen.has(k)) cleaned.push(k)
  }

  return cleaned
}

export default function SettingsPage() {
  const { admin } = useAuth()
  const isAdmin = String(admin?.role || '').toLowerCase() === 'admin'

  const [loading, setLoading] = useState(true)
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  const [settings, setSettings] = useState(null)

  // Business info
  const [businessName, setBusinessName] = useState('Aarohi Multiservices')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')

  // Branding
  const [logoIconUrl, setLogoIconUrl] = useState('')
  const [logoWordmarkUrl, setLogoWordmarkUrl] = useState('')

  // Preferences
  const [defaultStatus, setDefaultStatus] = useState('Submitted')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  // NEW: Homepage category order
  const [categoryOrder, setCategoryOrder] = useState(
    normalizeCategoryOrder(['id', 'business', 'agri', 'financial', 'utility'])
  )

  const categoryLabelByKey = useMemo(() => {
    const map = new Map(SERVICE_CATEGORIES.map((c) => [c.key, c.label]))
    return map
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from('settings').select('*').single()
      if (error) throw error

      setSettings(data)

      setBusinessName(data?.business_name || 'Aarohi Multiservices')
      setContact(data?.contact || '')
      setEmail(data?.email || '')

      setLogoIconUrl(data?.logo_icon_url || '')
      setLogoWordmarkUrl(data?.logo_wordmark_url || '')

      setDefaultStatus(data?.default_status || 'Submitted')
      setNotificationsEnabled(Boolean(data?.notifications))

      setCategoryOrder(normalizeCategoryOrder(data?.homepage_category_order))
    } catch (err) {
      console.error('Fetch settings error:', err)
      toast.error(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const saveBusiness = async () => {
    if (!isAdmin) {
      toast.error('Only admin can update settings')
      return
    }
    if (!settings?.id) return

    const bn = businessName.trim()
    const ct = contact.trim()
    const em = email.trim()

    if (!bn) return toast.error('Business Name is required')
    if (!ct) return toast.error('Contact Number is required')
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return toast.error('Enter a valid email')

    try {
      setSavingBusiness(true)

      const { error } = await supabase
        .from('settings')
        .update({
          business_name: bn,
          contact: ct,
          email: em,
          logo_icon_url: logoIconUrl.trim() ? logoIconUrl.trim() : null,
          logo_wordmark_url: logoWordmarkUrl.trim() ? logoWordmarkUrl.trim() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Settings saved!')
      await fetchSettings()
    } catch (err) {
      console.error('Save business settings error:', err)
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSavingBusiness(false)
    }
  }

  const moveCategory = (key, dir) => {
    setCategoryOrder((prev) => {
      const idx = prev.indexOf(key)
      if (idx === -1) return prev
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const resetCategoryOrder = () => {
    setCategoryOrder(normalizeCategoryOrder(['id', 'business', 'agri', 'financial', 'utility']))
  }

  const savePrefs = async () => {
    if (!isAdmin) {
      toast.error('Only admin can update settings')
      return
    }
    if (!settings?.id) return

    try {
      setSavingPrefs(true)

      const normalized = normalizeCategoryOrder(categoryOrder)

      const { error } = await supabase
        .from('settings')
        .update({
          default_status: defaultStatus,
          notifications: notificationsEnabled,
          homepage_category_order: normalized,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id)

      if (error) throw error

      toast.success('Settings saved!')
      await fetchSettings()
    } catch (err) {
      console.error('Save preferences error:', err)
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSavingPrefs(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-extrabold text-slate-900">Settings</h1>

      {!isAdmin ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900">
          View-only mode: Only admin can update settings.
        </div>
      ) : null}

      {/* Business Information */}
      <CardShell title="Business Information" disabled={!isAdmin}>
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-extrabold text-slate-900">
              Business Name
            </label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_10px_25px_rgba(2,6,23,0.10)] focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
              disabled={!isAdmin || savingBusiness}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-slate-900">
              Contact Number
            </label>
            <input
              type="tel"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_10px_25px_rgba(2,6,23,0.10)] focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
              disabled={!isAdmin || savingBusiness}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-slate-900">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-[0_10px_25px_rgba(2,6,23,0.10)] focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
              disabled={!isAdmin || savingBusiness}
            />
          </div>

          {/* Branding URLs */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-900">Branding</p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-900">
                  Logo Icon URL
                </label>
                <input
                  value={logoIconUrl}
                  onChange={(e) => setLogoIconUrl(e.target.value)}
                  placeholder="https://.../logo-icon.png"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!isAdmin || savingBusiness}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-extrabold text-slate-900">
                  Logo Wordmark URL
                </label>
                <input
                  value={logoWordmarkUrl}
                  onChange={(e) => setLogoWordmarkUrl(e.target.value)}
                  placeholder="https://.../logo-wordmark.png"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!isAdmin || savingBusiness}
                />
              </div>

              <p className="text-xs font-semibold text-slate-500">
                Tip: Use a public Supabase Storage bucket for branding images.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={saveBusiness}
              disabled={!isAdmin || savingBusiness}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1e3a5f] px-8 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingBusiness ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </CardShell>

      {/* Two-column on desktop: Preferences + Coming Soon */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* System Preferences */}
        <CardShell title="System Preferences" disabled={!isAdmin}>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">
                Default Application Status
              </label>

              <div className="relative inline-block">
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value)}
                  className="h-11 w-44 appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 shadow-[0_10px_25px_rgba(2,6,23,0.10)] focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
                  disabled={!isAdmin || savingPrefs}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">
                Application ID Format
              </label>
              <input
                value="AMS-YYYY-XXXX"
                readOnly
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 shadow-[0_10px_25px_rgba(2,6,23,0.10)] focus:outline-none"
              />
            </div>

            {/* Homepage Category Tab Order (NEW) */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Homepage Category Tab Order
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Use Up/Down to reorder category tabs on the homepage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetCategoryOrder}
                  disabled={!isAdmin || savingPrefs}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {categoryOrder.map((key, idx) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="text-sm font-extrabold text-slate-800">
                      {categoryLabelByKey.get(key) || key}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveCategory(key, 'up')}
                        disabled={!isAdmin || savingPrefs || idx === 0}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Move up"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCategory(key, 'down')}
                        disabled={!isAdmin || savingPrefs || idx === categoryOrder.length - 1}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Move down"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-extrabold text-slate-900">
                Enable Notifications
              </label>

              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_25px_rgba(2,6,23,0.10)]">
                <p className="text-base font-semibold text-slate-500">
                  Enable SMS/WhatsApp Notifications
                </p>

                <Toggle
                  checked={notificationsEnabled}
                  disabled={true}
                  onChange={() => setNotificationsEnabled((v) => !v)}
                />
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={savePrefs}
                disabled={!isAdmin || savingPrefs}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#1e3a5f] px-8 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPrefs ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </CardShell>

        {/* Notifications Coming Soon */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-8 py-8 text-center shadow-[0_12px_30px_rgba(2,6,23,0.08)]">
          <h2 className="text-xl font-extrabold text-slate-900">
            Notifications (Coming Soon)
          </h2>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            SMS and WhatsApp notifications <br />
            will be available in future updates.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 opacity-70">
            <p className="text-sm font-semibold text-slate-500">Enable Notifications</p>
            <Toggle checked={false} disabled={true} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}