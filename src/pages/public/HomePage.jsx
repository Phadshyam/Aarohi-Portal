// src/pages/public/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  Headphones,
  MessageCircle,
  PhoneCall,
  Search,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
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
    <div className="h-full animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(2,6,23,0.08)]">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
        <div className="flex-1">
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="mt-3 h-3 w-56 rounded bg-slate-100" />
          <div className="mt-2 h-3 w-44 rounded bg-slate-100" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-7 py-7 text-center shadow-[0_12px_30px_rgba(2,6,23,0.08)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
        <Icon className="h-6 w-6 text-[#1e3a5f]" />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  )
}

function ServiceDetailsModal({ open, service, onClose, onApply }) {
  const docs = useMemo(() => parseBullets(service?.documents), [service?.documents])
  const procs = useMemo(() => parseProcedures(service?.procedures), [service?.procedures])

  if (!open || !service) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Service Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <p className="text-sm font-extrabold text-slate-900">Service Name</p>
            <p className="mt-1 text-base font-semibold text-slate-700">{service.name}</p>
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-900">Description</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{service.description || '—'}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Cost / Fees</p>
              <p className="mt-1 text-base font-extrabold text-slate-900">
                {getCostDisplay(service)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Duration</p>
              <p className="mt-1 text-base font-extrabold text-slate-900">{service.duration || '—'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-900">Required Documents</p>
            {docs.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold text-slate-600">
                {docs.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-500">—</p>
            )}
          </div>

          <div>
            <p className="text-sm font-extrabold text-slate-900">Procedures</p>
            {procs.length ? (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm font-semibold text-slate-600">
                {procs.map((p, i) => <li key={i}>{p}</li>)}
              </ol>
            ) : (
              <p className="mt-2 text-sm font-semibold text-slate-500">—</p>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 rounded-xl bg-[#1e3a5f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f]"
          >
            Apply for this Service
          </button>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------- page ----------------------------- */

export default function HomePage() {
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [branding, setBranding] = useState({
    contact: '+91 8446140598',
    email: '',
  })

  const [selectedService, setSelectedService] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Services UI state
  const [activeTab, setActiveTab] = useState('all')
  const [serviceQuery, setServiceQuery] = useState('')
  const [fade, setFade] = useState(false)

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

  const openService = (service) => {
    setSelectedService(service)
    setModalOpen(true)
  }

  const closeService = () => {
    setModalOpen(false)
    setSelectedService(null)
  }

  const applyForService = () => {
    if (!selectedService?.id) return
    navigate(`/apply?serviceId=${encodeURIComponent(selectedService.id)}`)
  }

  return (
    <div className="bg-white">
      <div className="pt-16">
        {/* HERO */}
        <section className="bg-[#eef4ff]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <h1 className="text-[40px] font-extrabold leading-[1.08] text-[#1e3a5f] sm:text-5xl lg:text-6xl">
                One Platform for Essential Online Services
              </h1>

              <p className="mt-6 max-w-4xl text-lg leading-relaxed text-slate-600">
                From Aadhaar, PAN, Passport, GST, and Shop Act to Insurance, Registrations, Certificates, and Government Schemes. Access multiple personal, business, and documentation services quickly, securely, and hassle-free in one place.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/apply')}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#1e3a5f] px-10 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
                >
                  Apply Now
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="leading-relaxed">
                  26+ Essential Services | Trusted by 35000+ customers | Fast Processing | Secure Handling
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="bg-slate-50/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-[#1e3a5f] sm:text-4xl">
                Our Services
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base font-semibold text-slate-500">
                We provide fast and reliable assistance for all major government
                documentation services.
              </p>
            </div>

            {/* Controls */}
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
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
                        'shrink-0 rounded-xl px-4 py-2 text-sm font-extrabold transition',
                        activeTab === t.key
                          ? 'bg-[#1e3a5f] text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
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
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-700 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                    />
                  </div>

                  <p className="text-sm font-semibold text-slate-500 whitespace-nowrap">
                    Showing{' '}
                    <span className="font-extrabold text-slate-700">
                      {loading ? '—' : filtered.length}
                    </span>{' '}
                    services
                  </p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className={cx('mt-8 transition-opacity duration-200', fade ? 'opacity-70' : 'opacity-100')}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {loading ? (
                  Array.from({ length: 8 }).map((_, idx) => <ServiceCardSkeleton key={idx} />)
                ) : filtered.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-[0_12px_30px_rgba(2,6,23,0.08)]">
                    <p className="text-base font-extrabold text-slate-900">No services found</p>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      Try a different search keyword or choose another category.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setServiceQuery('')
                        setActiveTab('all')
                      }}
                      className="mt-6 rounded-xl bg-[#1e3a5f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#16304f]"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  filtered.map((service) => {
                    const Icon = service._Icon
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => openService(service)}
                        className={cx(
                          'group h-full rounded-2xl border border-slate-200 bg-white p-5 text-left',
                          'shadow-[0_14px_35px_rgba(2,6,23,0.08)] transition',
                          'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_45px_rgba(2,6,23,0.12)]',
                          'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20'
                        )}
                      >
                        <div className="flex h-full flex-col">
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200">
                              <Icon className="h-5 w-5 text-[#1e3a5f]" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-[15px] font-extrabold text-slate-900 leading-snug [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
                                {service.name}
                              </h3>
                              <p className="mt-1 text-sm font-semibold text-slate-500 truncate">
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
                                    'bg-slate-50 text-slate-700 border border-slate-200'
                                )}
                              >
                                {b}
                              </span>
                            ))}
                          </div>

                          <div className="mt-auto pt-4">
                            <div className="h-px w-full bg-slate-100" />
                            <p className="mt-3 text-xs font-semibold text-slate-400">
                              Tap to view full details
                            </p>
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
        <section id="track" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-[#f6f9ff] px-6 py-10 text-center shadow-[0_12px_30px_rgba(2,6,23,0.06)] sm:px-10">
              <h2 className="text-2xl font-extrabold text-[#1e3a5f] sm:text-3xl">
                Track Application
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                Check your application status using your Application ID or Phone Number.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/track')}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-[#1e3a5f] shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                >
                  Track Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* WHY CHOOSE US */}
        <section id="about" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-[#1e3a5f] sm:text-4xl">
                Why Choose Us?
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base text-slate-500">
                We simplify complex government procedures and provide reliable assistance
                for documentation services with complete transparency and secure handling
                of your information.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3">
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
        <section id="contact" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-[#1e3a5f] sm:text-4xl">
                Get in Touch
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
                Have questions? Contact us directly for quick assistance.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
              <a
                href={phone.tel ? `tel:${phone.tel}` : undefined}
                className="rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-[0_12px_30px_rgba(2,6,23,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.14)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <PhoneCall className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">Call Us</h3>
                <p className="mt-4 text-lg font-extrabold text-[#1e3a5f]">
                  {branding.contact || '—'}
                </p>
              </a>

              <a
                href={phone.wa ? `https://wa.me/${phone.wa}` : undefined}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-200 bg-white px-7 py-10 text-center shadow-[0_12px_30px_rgba(2,6,23,0.10)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.14)]"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                  <MessageCircle className="h-6 w-6 text-slate-700" />
                </div>
                <h3 className="mt-4 text-base font-extrabold text-slate-900">WhatsApp Support</h3>
                <p className="mt-4 text-lg font-extrabold text-emerald-600">
                  {branding.contact || '—'}
                </p>
              </a>
            </div>

            <p className="mt-10 text-center text-sm font-semibold text-slate-500">
              Working Hours: Monday – Saturday | 10:00 AM – 6:00 PM
            </p>

            {branding.email ? (
              <p className="mt-2 text-center text-sm font-semibold text-slate-500">
                Email: <span className="font-extrabold text-slate-700">{branding.email}</span>
              </p>
            ) : null}
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
    </div>
  )
}