// src/pages/public/HomePage.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import CountUp from 'react-countup'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { HOME_OPEN_SERVICE_ID } from '../../navigation/homeServiceIntent'
import Footer from '../../components/layout/Footer'
import ServiceDetailsModal from '../../components/public/ServiceDetailsModal'
import {
  cx,
  ServiceCardSkeleton,
  TRUST_PILLARS,
  TrustSection,
  HeroSection,
  TrackSection,
  WhyChooseUsSection,
  ContactSection
} from '../../components/public/HomeStaticSections'
import { getServiceIcon, getServiceBadges } from '../../utils/serviceCardConfig'

/* ----------------------------- helpers ----------------------------- */

const SHORT_LABELS = {
  'government_id': 'Government & ID',
  'health_social': 'Health & Social',
  'vehicle': 'Vehicle',
  'business': 'Business',
  'agriculture': 'Agriculture',
  'utility': 'Utility',
}

const BADGE_STYLES = {
  Popular: 'bg-blue-50 text-blue-700 border border-blue-200',
  'Same Day': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Fast Service': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Online Process': 'bg-amber-50 text-amber-800 border border-amber-200',
}



function shortenDescription(text, fallback) {
  const v = String(text || '').trim()
  if (!v) return fallback || 'Quick assistance for this service.'
  const first = v.split('.').map((s) => s.trim()).filter(Boolean)[0] || v
  return first.length > 72 ? `${first.slice(0, 72).trim()}…` : first
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



function normalizePhoneForLinks(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return { display: '', wa: '', tel: '' }
  const waDigits = digits.length === 10 ? `91${digits}` : digits
  const telDigits = digits.length === 10 ? `+91${digits}` : `+${digits}`
  return { display: raw, wa: waDigits, tel: telDigits }
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
    homepage_category_order: [],
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
    const refreshBranding = async () => {
      const { data } = await supabase.rpc('get_public_branding')

      if (data) {
        setBranding((prev) => ({
          ...prev,
          homepage_category_order: Array.isArray(data.homepage_category_order)
            ? [...data.homepage_category_order]
            : [],
        }))
      }
    }

    window.addEventListener('branding-updated', refreshBranding)

    return () => {
      window.removeEventListener('branding-updated', refreshBranding)
    }
  }, [])

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_branding')
        if (error) throw error
        setBranding((prev) => ({
          ...prev,
          business_name: data?.business_name || prev.business_name,
          contact: data?.contact || prev.contact,
          email: data?.email || '',
          logo_icon_url: data?.logo_icon_url || prev.logo_icon_url,
          logo_wordmark_url: data?.logo_wordmark_url || prev.logo_wordmark_url,
          homepage_category_order: data?.homepage_category_order || [],
        }))
      } catch (e) {
        console.error('Branding fetch error:', e)
      }
    }
    fetchBranding()

    // Realtime settings updates (for category order and branding changes)
    const channel = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'settings' }, (payload) => {
        if (payload.new) {
          let parsedOrder = payload.new.homepage_category_order
          if (typeof parsedOrder === 'string') {
            try {
              const parsed = JSON.parse(parsedOrder)
              if (Array.isArray(parsed)) parsedOrder = parsed
            } catch (e) {
              parsedOrder = null
            }
          }
          setBranding((prev) => ({
            ...prev,
            homepage_category_order: Array.isArray(parsedOrder)
              ? [...parsedOrder]
              : [...prev.homepage_category_order],
          }))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    setFade(true)
    const t = window.setTimeout(() => setFade(false), 140)
    return () => window.clearTimeout(t)
  }, [activeTab, serviceQuery])

  const phone = normalizePhoneForLinks(branding.contact || '+91 8446140598')

  useEffect(() => {
    const fetchApplicationCount = async () => {
      const { data, error } = await supabase
        .rpc('get_public_application_count')

      if (!error && data !== null) {
        setApplicationCount(data)
      }
    }

    fetchApplicationCount()
  }, [])

  const totalApplications = 35000 + applicationCount

  const heroStats = useMemo(() => {
    const activeServicesCount = services?.length ?? 0

    return [
      {
        label: 'Applications processed',
        value: (
          <CountUp
            end={35000 + applicationCount}
            duration={2.5}
            separator=","
            suffix="+"
          />
        ),
      },
      {
        label: 'Active services',
        value: (
          <CountUp
            end={activeServicesCount}
            duration={2.5}
            suffix="+"
          />
        ),
      },
      { label: 'Customer support', value: 'Dedicated' },
      { label: 'Fast processing', value: 'Priority' },
    ]
  }, [services?.length, applicationCount])

  const orderedTabs = useMemo(() => {
    const defaultOrder = Object.keys(SHORT_LABELS)
    let rawOrder = branding.homepage_category_order
    let dbOrder = []

    if (Array.isArray(rawOrder)) {
      dbOrder = rawOrder
    } else if (typeof rawOrder === 'string') {
      try {
        const parsed = JSON.parse(rawOrder)
        if (Array.isArray(parsed)) dbOrder = parsed
      } catch (e) {
        dbOrder = []
      }
    }

    const orderedKeys = []
    for (const key of dbOrder) {
      if (!orderedKeys.includes(key) && SHORT_LABELS[key]) {
        orderedKeys.push(key)
      }
    }

    for (const key of defaultOrder) {
      if (!orderedKeys.includes(key)) {
        orderedKeys.push(key)
      }
    }

    const tabs = [{ key: 'all', label: 'All Services' }]
    for (const key of orderedKeys) {
      tabs.push({ key, label: SHORT_LABELS[key] || key })
    }

    return tabs
  }, [JSON.stringify(branding.homepage_category_order)])

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
      <HeroSection heroStats={heroStats} />
      <TrustSection />

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
                {orderedTabs.map((t) => (
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

      <TrackSection />

      <WhyChooseUsSection />

      <ContactSection branding={branding} phone={phone} />

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