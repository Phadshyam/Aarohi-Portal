// src/pages/public/HomePage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Headphones,
  Lock,
  Mail,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { HOME_OPEN_SERVICE_ID } from '../../navigation/homeServiceIntent'
import Footer from '../../components/layout/Footer'
import { formatCurrency } from '../../utils/helpers'
import { getServiceIcon, getServiceBadges } from '../../utils/serviceCardConfig'

/* ----------------------------- helpers ----------------------------- */

const CATEGORY_TABS = [
  { key: 'all', label: 'All Services' },
  { key: 'government_id', label: 'Government & ID' },
  { key: 'health_social', label: 'Health & Social' },
  { key: 'vehicle', label: 'Vehicle' },
  { key: 'business', label: 'Business' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'utility', label: 'Utility' },
]

const BADGE_STYLES = {
  Popular: 'bg-blue-50 text-blue-700 border border-blue-200',
  'Same Day': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Fast Service': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Online Process': 'bg-amber-50 text-amber-800 border border-amber-200',
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

const TRUST_PILLARS = [
  {
    Icon: ShieldCheck,
    title: 'Secure application processing',
    description: 'Structured workflows with careful verification at every step.',
  },
  {
    Icon: Lock,
    title: 'Data privacy',
    description: 'Your documents and personal details are handled confidentially.',
  },
  {
    Icon: ClipboardList,
    title: 'Professional assistance',
    description: 'Experienced support for government documentation and filings.',
  },
  {
    Icon: Headphones,
    title: 'Fast support',
    description: 'Reach us by phone or WhatsApp during working hours.',
  },
  {
    Icon: FileCheck2,
    title: 'Trusted documentation services',
    description: 'Clear guidance for ID, vehicle, business, and welfare-related services.',
  },
]

function shortenDescription(text, fallback) {
  const v = String(text || '').trim()
  if (!v) return fallback || 'Quick assistance for this service.'
  const first = v.split('.').map((s) => s.trim()).filter(Boolean)[0] || v
  return first.length > 72 ? `${first.slice(0, 72).trim()}…` : first
}

/**
 * IMPORTANT:
 * cost_text (string) should override numeric cost
 * so we never show ₹0 for "As per requirements".
 */
function getCostDisplay(service) {
  const t = String(service?.cost_text || '').trim()
  if (t) return t

  const n = Number(service?.cost)
  if (Number.isFinite(n)) return formatCurrency(n)

  return '—'
}

/**
 * Fallback only (if category_key is missing in DB)
 * Returns NEW category keys
 */
function detectCategory(name) {
  const n = String(name || '').toLowerCase()

  // Government & ID Services
  if (
    n.includes('aadhaar') ||
    n.includes('aadhar') ||
    n.includes('pan') ||
    n.includes('passport') ||
    n.includes('voter') ||
    n.includes('ration') ||
    n.includes('birth') ||
    n.includes('death') ||
    n.includes('certificate') ||
    n.includes('id card')
  ) {
    return 'government_id'
  }

  // Vehicle Services
  if (
    n.includes('vehicle') ||
    n.includes('rc ') ||
    n.includes('rto') ||
    n.includes('permit') ||
    n.includes('puc') ||
    n.includes('pollution') ||
    n.includes('fitness')
  ) {
    return 'vehicle'
  }

  // Health & Social Services
  if (
    n.includes('health') ||
    n.includes('medical') ||
    n.includes('ayushman') ||
    n.includes('pension') ||
    n.includes('welfare') ||
    n.includes('epfo') ||
    n.includes('esic')
  ) {
    return 'health_social'
  }

  // Agriculture Services
  if (
    n.includes('farmer') ||
    n.includes('kisan') ||
    n.includes('agri') ||
    n.includes('crop') ||
    n.includes('farm')
  ) {
    return 'agriculture'
  }

  // Utility Services
  if (
    n.includes('electric') ||
    n.includes('water') ||
    n.includes('gas') ||
    n.includes('bill') ||
    n.includes('recharge')
  ) {
    return 'utility'
  }

  return 'business'
}

/**
 * Optional auto-badges fallback if DB badges empty
 */
function pickBadges(name) {
  const n = String(name || '').toLowerCase()
  const badges = []

  if (n.includes('pan') || n.includes('gst') || n.includes('passport')) badges.push('Popular')
  if (n.includes('online') || n.includes('link') || n.includes('registration'))
    badges.push('Online Process')
  if (n.includes('update') || n.includes('correction')) badges.push('Fast Service')

  return badges.slice(0, 2)
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

function normalizePhoneForLinks(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return { display: '', wa: '', tel: '' }
  const waDigits = digits.length === 10 ? `91${digits}` : digits
  const telDigits = digits.length === 10 ? `+91${digits}` : `+${digits}`
  return { display: raw, wa: waDigits, tel: telDigits }
}

/* ----------------------------- components ----------------------------- */

function ServiceCardSkeleton() {
  return (
    <div className="h-full animate-pulse rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.07)]">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50" />
        <div className="flex-1">
          <div className="h-4 w-40 rounded-lg bg-slate-100" />
          <div className="mt-3 h-3 w-56 rounded-lg bg-slate-100" />
          <div className="mt-2 h-3 w-44 rounded-lg bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, className }) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-slate-200/90 bg-white px-6 py-8 text-center shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300/90 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:px-7 sm:py-8',
        className
      )}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white shadow-sm">
        <Icon className="h-6 w-6 text-[#1e3a5f]" />
      </div>
      <h3 className="mt-4 text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

function TrustPillar({ icon: Icon, title, description }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition duration-300 ease-out hover:-translate-y-0.5 hover:border-amber-200/60 hover:shadow-[0_14px_36px_rgba(30,58,95,0.1)] sm:p-6">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200/50 bg-amber-50/80 text-[#1e3a5f] shadow-sm transition group-hover:border-amber-300/80 group-hover:bg-amber-50">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <h3 className="mt-4 text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">{title}</h3>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

function ServiceDetailsModal({ open, service, onClose, onApply }) {
  const docs = useMemo(() => parseBullets(service?.documents), [service?.documents])
  const procs = useMemo(() => parseProcedures(service?.procedures), [service?.procedures])

  if (!open || !service) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-900/55 backdrop-blur-sm px-4 py-6 backdrop-blur-[2px] transition-opacity duration-200 sm:py-10"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="my-auto flex max-h-[min(90vh,calc(100dvh-2rem))] w-full max-w-lg origin-top scale-100 transform flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)] transition duration-200 ease-out motion-reduce:transition-none"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5">
          <h3 className="pr-4 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Service details</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-600 transition-colors duration-200 hover:border-slate-200 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Service name</p>
            <p className="mt-1.5 text-base font-bold leading-snug text-slate-900">{service.name}</p>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Description</p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">{service.description || '—'}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost / fees</p>
              <p className="mt-1.5 text-base font-extrabold text-slate-900">{getCostDisplay(service)}</p>
            </div>
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duration</p>
              <p className="mt-1.5 text-base font-extrabold text-slate-900">{service.duration || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Required documents</p>
            {docs.length ? (
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-medium text-slate-600">
                {docs.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-500">—</p>
            )}
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Procedures</p>
            {procs.length ? (
              <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm font-medium text-slate-600">
                {procs.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-sm font-medium text-slate-500">—</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200/90 bg-white/95 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={onClose}
            className="order-2 inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:bg-slate-50 sm:order-1 sm:flex-initial"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onApply}
            className="order-1 inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(30,58,95,0.35)] transition duration-200 hover:bg-[#16304f] sm:order-2 sm:flex-initial sm:min-w-[200px]"
          >
            Apply for this service
          </button>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- page ----------------------------- */

export default function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [branding, setBranding] = useState({
    business_name: 'Aarohi Multiservices',
    contact: '+91 8446140598',
    email: '',
    logo_icon_url: '/default-icon.png',
    logo_wordmark_url: '/default-wordmark.png',
  })

  const [selectedService, setSelectedService] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Services UI state
  const [activeTab, setActiveTab] = useState('all')
  const [serviceQuery, setServiceQuery] = useState('')
  const [fade, setFade] = useState(false)

  const [applicationCount, setApplicationCount] = useState(0)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('services')
          .select(`
            id,
            name,
            description,
            documents,
            procedures,
            cost,
            cost_text,
            duration,
            is_active,
            category_key,
            icon_key,
            badges,
            sort_order
          `)
          .eq('is_active', true)
          .order('sort_order', { ascending: true, nullsFirst: false })

        if (error) throw error
        setServices(data || [])
      } catch (err) {
        console.error('Error fetching services:', err)
        toast.error(err.message || 'Failed to load services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  useEffect(() => {
    const hash = (location.hash || '').replace(/^#/, '')
    if (!hash) return
    const el = document.getElementById(hash)
    if (!el) return
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
    return () => window.clearTimeout(t)
  }, [location.hash, location.pathname])

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_branding')
        if (error) throw error
        setBranding((prev) => ({
          ...prev,
          contact: data?.contact || prev.contact,
          email: data?.email || '',
        }))
      } catch (e) {
        console.error('Branding fetch error:', e)
      }
    }
    fetchBranding()
  }, [])

  useEffect(() => {
    setFade(true)
    const t = window.setTimeout(() => setFade(false), 140)
    return () => window.clearTimeout(t)
  }, [activeTab, serviceQuery])

  const phone = normalizePhoneForLinks(branding.contact || '+91 8446140598')

  useEffect(() => {
    const fetchApplicationCount = async () => {
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
  
      console.log('COUNT:', count)
      console.log('ERROR:', error)
  
      if (!error) {
        setApplicationCount(count || 0)
      }
    }
  
    fetchApplicationCount()
  }, [])

  const [countReady, setCountReady] = useState(false)
  
  const totalApplications = 35000 + (applicationCount || 0)

  const heroStats = useMemo(() => {
    const count = services?.length ?? 0
    const activeLabel = loading ? '…' : `${Math.max(count, 1)}+`
  
    const processedApplications = new Intl.NumberFormat('en-IN').format(
      35000 + applicationCount
    )
  
    return [
      {
        label: 'Applications processed',
        value: (
          <CountUp
            end={35000 + (applicationCount || 0)}
            duration={2.5}
            separator=","
            preserveValue
          />
        ),
      },
      {
        label: 'Active services',
        value: (
          <CountUp
            end={count}
            duration={2.5}
            preserveValue
          />
        ),
      },
      { label: 'Customer support', value: 'Dedicated' },
      { label: 'Fast processing', value: 'Priority' },
    ]
  }, [services.length, loading, applicationCount])

  new Intl.NumberFormat('en-IN')

  const enhancedServices = useMemo(() => {
    return (services || [])
      .map((s) => {
        const category = String(s.category_key || detectCategory(s.name)).trim()

        const Icon = getServiceIcon(s.icon_key)

        const dbBadges = getServiceBadges(s.badges)
        const badges = dbBadges.length ? dbBadges : pickBadges(s.name)

        const short = shortenDescription(s.description, 'Quick assistance for this service.')

        const orderNum = Number(s.sort_order)
        const order = Number.isFinite(orderNum) ? orderNum : 9999

        return {
          ...s,
          _category: category,
          _Icon: Icon,
          _badges: badges,
          _short: short,
          _order: order,
        }
      })
      .sort((a, b) => a._order - b._order)
  }, [services])

  const filtered = useMemo(() => {
    const q = serviceQuery.trim().toLowerCase()
    return enhancedServices.filter((s) => {
      const matchTab = activeTab === 'all' ? true : s._category === activeTab
      const matchSearch = !q
        ? true
        : String(s.name || '').toLowerCase().includes(q) ||
          String(s._short || '').toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [enhancedServices, activeTab, serviceQuery])

  const openServiceIntentId = location.state?.[HOME_OPEN_SERVICE_ID]

  useEffect(() => {
    if (openServiceIntentId == null || openServiceIntentId === '') return
    if (loading) return

    const idStr = String(openServiceIntentId)
    const match = enhancedServices.find((s) => String(s.id) === idStr)

    const clearIntent = () => {
      navigate({ pathname: '/', hash: 'services', search: location.search }, { replace: true, state: {} })
    }

    if (!match) {
      toast.error('That service is not available.')
      clearIntent()
      return
    }

    const visible = filtered.some((s) => String(s.id) === idStr)
    if (!visible) {
      setActiveTab('all')
      setServiceQuery('')
      return
    }

    setSelectedService(match)
    setModalOpen(true)
    clearIntent()
  }, [openServiceIntentId, loading, enhancedServices, filtered, navigate, location.search])

  const openService = useCallback((service) => {
    setSelectedService(service)
    setModalOpen(true)
  }, [])

  const closeService = useCallback(() => {
    setModalOpen(false)
    setSelectedService(null)
  }, [])

  const applyForService = () => {
    if (!selectedService?.id) return
    navigate(`/apply?serviceId=${encodeURIComponent(selectedService.id)}`)
  }

  return (
    <div className="bg-white">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-200/60 bg-gradient-to-br from-[#eef4ff] via-white to-amber-50/25">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1e3a5f]/[0.06] blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a5f]/85 sm:text-sm">
                  Trusted government documentation assistance
                </p>
                <h1 className="mt-4 text-[2.25rem] font-extrabold leading-[1.08] tracking-tight text-[#1e3a5f] sm:text-5xl lg:text-[3.25rem]">
                  One platform for essential online services
                </h1>
                <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
                  From Aadhaar, PAN, Passport, GST, and Shop Act to insurance, registrations, and
                  government schemes — apply with confidence and stay informed at every step.
                </p>

                <ul className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
                  {[
                    'Fast & secure application processing',
                    'Track applications easily',
                    'Professional support',
                    'Transparent handling of your documents',
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-2.5 text-sm font-semibold text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <button
                    type="button"
                    onClick={() => navigate('/apply')}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#1e3a5f] px-10 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(30,58,95,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#16304f] hover:shadow-[0_12px_28px_rgba(30,58,95,0.4)] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
                  >
                    Apply now
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/track')}
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200/90 bg-white/90 px-8 text-sm font-semibold text-[#1e3a5f] shadow-[0_4px_14px_rgba(15,23,42,0.08)] transition duration-300 hover:border-amber-200/80 hover:bg-white hover:shadow-[0_8px_20px_rgba(15,23,42,0.1)] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  >
                    Track application
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {heroStats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_8px_28px_rgba(15,23,42,0.08)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)] sm:p-5"
                    >
                      <p className="text-2xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-3xl">
                        {s.value}
                        {(s.label === 'Applications processed' ||
                          s.label === 'Active services') &&
                          '+'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST */}
        <section id="trust" className="scroll-mt-16 border-b border-slate-200/60 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">Why clients trust us</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">
                Security, clarity, and dependable support
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
                Built for individuals and businesses who need reliable assistance with sensitive
                documentation — without guesswork.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {TRUST_PILLARS.map((p) => (
                <TrustPillar key={p.title} icon={p.Icon} title={p.title} description={p.description} />
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="scroll-mt-16 bg-gradient-to-b from-slate-50/90 to-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">Service catalogue</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">Our services</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-600">
                Fast, reliable assistance for major government documentation — browse by category or search
                instantly.
              </p>
            </div>

            {/* Controls */}
            <div className="mt-10 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-[0_10px_36px_rgba(15,23,42,0.07)] backdrop-blur-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Tabs */}
                <div
                  className={cx(
                    'flex items-center gap-2 overflow-x-auto pb-1',
                    '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
                  )}
                >
                  {CATEGORY_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setActiveTab(t.key)}
                      className={cx(
                        'shrink-0 rounded-xl px-4 py-2.5 text-sm font-extrabold transition duration-200',
                        activeTab === t.key
                          ? 'bg-[#1e3a5f] text-white shadow-[0_6px_18px_rgba(30,58,95,0.35)]'
                          : 'border border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Search + count */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end lg:gap-3">
                  <div className="relative w-full sm:w-[360px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={serviceQuery}
                      onChange={(e) => setServiceQuery(e.target.value)}
                      placeholder="Search services..."
                      className="h-11 w-full rounded-xl border border-slate-200/90 bg-slate-50/90 pl-10 pr-3 text-sm font-semibold text-slate-800 shadow-inner transition duration-200 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                    />
                  </div>

                  <p className="text-sm font-semibold text-slate-500 whitespace-nowrap">
                    Showing{' '}
                    <span className="font-extrabold text-slate-800">
                      {loading ? '—' : filtered.length}
                    </span>{' '}
                    services
                  </p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className={cx('mt-10 transition-opacity duration-300 ease-out', fade ? 'opacity-60' : 'opacity-100')}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => <ServiceCardSkeleton key={idx} />)
                ) : filtered.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-slate-200/90 bg-white p-10 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
                    <p className="text-base font-extrabold text-slate-900">No services found</p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      Try a different search keyword or choose another category.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceQuery('')
                        setActiveTab('all')
                      }}
                      className="mt-6 rounded-xl bg-[#1e3a5f] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(30,58,95,0.35)] transition duration-200 hover:bg-[#16304f]"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filtered.map((service) => {
                    const Icon = service._Icon
                    return (
                      <button
                        key={service.id}
                        id={`home-service-${service.id}`}
                        type="button"
                        onClick={() => openService(service)}
                        className={cx(
                          'group h-full rounded-2xl border border-slate-200/90 bg-white p-5 text-left',
                          'shadow-[0_8px_28px_rgba(15,23,42,0.07)] transition duration-300 ease-out',
                          'hover:-translate-y-1 hover:border-slate-300/90 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)]',
                          'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25 active:translate-y-0'
                        )}
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/90 transition group-hover:ring-[#1e3a5f]/20">
                              <Icon className="h-5 w-5 text-[#1e3a5f]" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-[15px] font-extrabold leading-snug tracking-tight text-slate-900 [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                                {service.name}
                              </h3>
                              <p className="mt-1.5 text-sm font-medium text-slate-600 line-clamp-2">
                                {service._short}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex min-h-[28px] flex-wrap gap-2">
                            {service._badges?.map((b) => (
                              <span
                                key={b}
                                className={cx(
                                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold',
                                  BADGE_STYLES[b] ||
                                    'border border-slate-200/80 bg-slate-50 text-slate-700'
                                )}
                              >
                                {b}
                              </span>
                            ))}
                          </div>

                          <div className="mt-auto pt-4">
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            <p className="mt-3 text-xs font-semibold text-slate-400">Tap to view full details</p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* TRACK */}
        <section id="track" className="scroll-mt-16 border-b border-slate-200/60 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
            <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-[#f6f9ff] to-white px-6 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">Application status</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-3xl">Track your application</h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                Check your application status using your Application ID or phone number — quick updates when you need
                them.
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/track')}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-200/90 bg-white px-10 text-sm font-semibold text-[#1e3a5f] shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_10px_28px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                >
                  Track now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section id="about" className="scroll-mt-16 bg-gradient-to-b from-white to-slate-50/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a5f]/80">Why choose us</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">
                Built for clarity and outcomes
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
                We simplify complex government procedures with transparent communication and careful handling of your
                information.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <FeatureCard
                icon={Zap}
                title="Fast Processing"
                description="Quick and efficient service assistance with minimal waiting time."
              />

              <FeatureCard
                icon={ShieldCheck}
                title="Secure & Confidential"
                description="Your documents and personal information are handled safely and securely."
              />

              <FeatureCard
                icon={Headphones}
                title="Dedicated Support"
                description="Get reliable guidance and support throughout your entire application process."
              />
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="scroll-mt-16 border-t border-slate-200/60 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">Contact</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">Get in touch</h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
                Prefer a quick call or WhatsApp? We respond during business hours.
              </p>
            </div>

            <div
              className={cx(
                'mt-12 grid gap-6',
                branding.email ? 'md:grid-cols-3' : 'md:grid-cols-2'
              )}
            >
              <a
                href={phone.tel ? `tel:${phone.tel}` : undefined}
                className="flex min-h-[180px] flex-col items-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 px-6 py-10 text-center shadow-[0_10px_32px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm">
                  <PhoneCall className="h-6 w-6 text-[#1e3a5f]" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">Call us</h3>
                <p className="mt-3 text-lg font-extrabold text-[#1e3a5f]">{branding.contact || '—'}</p>
              </a>

              <a
                href={phone.wa ? `https://wa.me/${phone.wa}` : undefined}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[180px] flex-col items-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 px-6 py-10 text-center shadow-[0_10px_32px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">WhatsApp support</h3>
                <p className="mt-3 text-lg font-extrabold text-emerald-600">{branding.contact || '—'}</p>
              </a>

              {branding.email ? (
                <a
                  href={`mailto:${branding.email}`}
                  className="flex min-h-[180px] flex-col items-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 px-6 py-10 text-center shadow-[0_10px_32px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm">
                    <Mail className="h-6 w-6 text-[#1e3a5f]" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900">Email</h3>
                  <p className="mt-3 break-all text-sm font-extrabold text-slate-800">{branding.email}</p>
                </a>
              ) : null}
            </div>

            <p className="mt-10 text-center text-sm font-semibold text-slate-500">
              Working hours: Monday – Saturday · 10:00 AM – 6:00 PM
            </p>
          </div>
        </section>

        <Footer services={services} />

        <ServiceDetailsModal
          open={modalOpen}
          service={selectedService}
          onClose={closeService}
          onApply={applyForService}
        />
    </div>
  )
}