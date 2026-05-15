// src/pages/admin/ServicePortalsPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Building2,
  BuildingIcon,
  Car,
  Check,
  Copy,
  CreditCard,
  Droplet,
  ExternalLink,
  Factory,
  FileText,
  Flame,
  Globe,
  History,
  IdCard,
  Landmark,
  Lightbulb,
  Lock,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  StarOff,
  Truck,
  UserRound,
  Vote,
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

const LS_FAVORITES = 'ams_portal_favorites_v1'
const LS_RECENTS = 'ams_portal_recent_v1'
const LS_COUNTS = 'ams_portal_open_counts_v1'

const CATEGORIES = [
  { key: 'identity', title: 'Identity Services', icon: IdCard },
  { key: 'financial', title: 'Financial Services', icon: Landmark },
  { key: 'certificate', title: 'Certificate Services', icon: FileText },
  { key: 'transport', title: 'Transport Services', icon: Car },
  { key: 'utility', title: 'Utility Services', icon: Lightbulb },
  { key: 'business', title: 'Business Services', icon: Factory },
]

const SERVICES = [
  // Identity
  {
    id: 'aadhaar',
    name: 'Aadhaar Services',
    description: 'UIDAI services including Aadhaar update, download and verification.',
    category: 'identity',
    url: 'https://myaadhaar.uidai.gov.in/en_IN',
    icon: IdCard,
  },
  {
    id: 'pan',
    name: 'PAN Card',
    description: 'Apply / track PAN through official portal.',
    category: 'identity',
    url: 'https://arthnitipan.in/',
    icon: CreditCard,
  },
  {
    id: 'gazzate',
    name: 'Gazzate',
    description: 'Apply / track Gazzate through officical portal.',
    category: 'identity',
    url: 'https://aaplesarkar.mahaonline.gov.in/en',
    icon: CreditCard,
  },
  {
    id: 'passport-seva',
    name: 'Passport Seva',
    description: 'Passport applications, appointments, and status tracking.',
    category: 'identity',
    url: 'https://www.passportindia.gov.in/',
    icon: UserRound,
  },
  {
    id: 'voter-id',
    name: 'Voter ID',
    description: 'Voter services: registration, correction, and status (ECI).',
    category: 'identity',
    url: 'https://voters.eci.gov.in/',
    icon: Vote,
  },
  {
    id: 'digilocker',
    name: 'DigiLocker',
    description: 'Secure access to digital documents issued by government entities.',
    category: 'identity',
    url: 'https://www.digilocker.gov.in/',
    icon: Lock,
  },

  // Financial
  {
    id: 'gst',
    name: 'GST Portal',
    description: 'GST registration, returns, payments and compliance tools.',
    category: 'financial',
    url: 'https://www.gst.gov.in/',
    icon: Receipt,
  },
  {
    id: 'income-tax',
    name: 'Income Tax Portal',
    description: 'ITR filing, PAN services, notices and e-proceedings.',
    category: 'financial',
    url: 'https://www.incometax.gov.in/',
    icon: Landmark,
  },
  {
    id: 'epfo',
    name: 'EPFO',
    description: 'Provident fund services including UAN, passbook and claims.',
    category: 'financial',
    url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/',
    icon: Building2,
  },
  {
    id: 'esic',
    name: 'ESIC',
    description: 'ESIC employer/insured services and online facilities.',
    category: 'financial',
    url: 'https://www.esic.gov.in/',
    icon: Building2,
  },

  // Certificate
  {
    id: 'birth-certificate',
    name: 'Birth Certificate',
    description: 'Civil Registration System (CRS) official access portal.',
    category: 'certificate',
    url: 'https://crsorgi.gov.in/',
    icon: FileText,
  },
  {
    id: 'income-certificate',
    name: 'Income Certificate',
    description: 'ServiceOnline portal (state services vary by region).',
    category: 'certificate',
    url: 'https://serviceonline.gov.in/',
    icon: FileText,
  },
  {
    id: 'domicile-certificate',
    name: 'Domicile Certificate',
    description: 'ServiceOnline portal (state services vary by region).',
    category: 'certificate',
    url: 'https://serviceonline.gov.in/',
    icon: FileText,
  },
  {
    id: 'caste-certificate',
    name: 'Caste Certificate',
    description: 'ServiceOnline portal (state services vary by region).',
    category: 'certificate',
    url: 'https://serviceonline.gov.in/',
    icon: FileText,
  },

  // Transport
  {
    id: 'parivahan',
    name: 'Parivahan',
    description: 'National transport services: Vahan, Sarathi and more.',
    category: 'transport',
    url: 'https://parivahan.gov.in/',
    icon: Truck,
  },
  {
    id: 'driving-license',
    name: 'Driving License',
    description: 'Sarathi portal for DL services, appointments and status.',
    category: 'transport',
    url: 'https://sarathi.parivahan.gov.in/',
    icon: Car,
  },
  {
    id: 'vehicle-rc',
    name: 'Vehicle RC Services',
    description: 'Vahan portal for RC services, vehicle details and status.',
    category: 'transport',
    url: 'https://vahan.parivahan.gov.in/',
    icon: Truck,
  },

  // Utility
  {
    id: 'electricity-bill',
    name: 'Electricity Bill',
    description: 'Pay bills via Bharat BillPay (operator-specific flows vary).',
    category: 'utility',
    url: 'https://www.bharatbillpay.com/',
    icon: Lightbulb,
  },
  {
    id: 'water-bill',
    name: 'Water Bill',
    description: 'Pay bills via Bharat BillPay (operator-specific flows vary).',
    category: 'utility',
    url: 'https://www.bharatbillpay.com/',
    icon: Droplet,
  },
  {
    id: 'gas-booking',
    name: 'Gas Booking',
    description: 'MyLPG portal for LPG booking and services.',
    category: 'utility',
    url: 'https://www.mylpg.in/',
    icon: Flame,
  },

  // Business
  {
    id: 'udyam',
    name: 'Udyam Registration',
    description: 'MSME Udyam registration and certificate services.',
    category: 'business',
    url: 'https://udyamregistration.gov.in/',
    icon: Factory,
  },
  {
    id: 'shop-act',
    name: 'Shop Act Registration',
    description: 'Register your shop or business under the Shop Act legally.',
    category: 'business',
    url: 'https://aaplesarkar.mahaonline.gov.in/en',
    icon: BuildingIcon,
  },
  {
    id: 'food',
    name: 'Food License',
    description: 'Food License service helps food businesses obtain FSSAI registration or license.',
    category: 'business',
    url: 'https://foscos.fssai.gov.in/',
    icon: BuildingIcon,
  },
  // {
  //   id: 'mca',
  //   name: 'MCA Portal',
  //   description: 'Ministry of Corporate Affairs services and filings.',
  //   category: 'business',
  //   url: 'https://www.mca.gov.in/',
  //   icon: Building2,
  // },
  // {
  //   id: 'gem',
  //   name: 'GeM Portal',
  //   description: 'Government e-Marketplace for procurement and seller services.',
  //   category: 'business',
  //   url: 'https://gem.gov.in/',
  //   icon: ShoppingBag,
  // },
]

function safeJsonParse(value, fallback) {
  try {
    const v = JSON.parse(value)
    return v ?? fallback
  } catch {
    return fallback
  }
}

function loadLS(key, fallback) {
  if (typeof window === 'undefined') return fallback
  return safeJsonParse(window.localStorage.getItem(key), fallback)
}

function saveLS(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function classNames(...arr) {
  return arr.filter(Boolean).join(' ')
}

function getDomain(url) {
  try {
    const host = new URL(url).hostname
    return host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function ServiceCard({
  service,
  isFavorite,
  onToggleFavorite,
  onOpen,
  onCopy,
  copied,
  openedCount = 0,
}) {
  const Icon = service.icon || Globe
  const domain = getDomain(service.url)

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-200/80">
            <Icon className="h-5 w-5 text-[#1e3a5f]" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-slate-900">{service.name}</h3>
            <p className="mt-1 text-sm font-normal leading-relaxed text-slate-500">
              {service.description}
            </p>

            {domain ? (
              <p className="mt-2 text-xs font-medium text-slate-400">
                {domain}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleFavorite}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? (
            <Star className="h-5 w-5 text-amber-500" />
          ) : (
            <StarOff className="h-5 w-5 text-slate-400" />
          )}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge color="bg-emerald-50 text-emerald-700 border border-emerald-200">
          Official Website
        </Badge>

        {openedCount > 0 ? (
          <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
            Opened {openedCount} {openedCount === 1 ? 'time' : 'times'}
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">Opens in new tab</span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onOpen}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25 active:scale-[0.99]"
        >
          Open Portal
          <ExternalLink className="h-4 w-4" />
        </a>

        <button
          type="button"
          onClick={onCopy}
          className={classNames(
            'relative inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 active:scale-[0.99]',
            copied
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-sm'
          )}
        >
          {/* tooltip */}
          <span
            className={classNames(
              'pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-sm transition',
              copied
                ? 'opacity-100 translate-y-0 border-emerald-200 bg-white text-emerald-700'
                : 'opacity-0 translate-y-1 border-slate-200 bg-white text-slate-500'
            )}
          >
            Copied!
          </span>

          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

export default function ServicePortalsPage() {
  const { admin } = useAuth()
  const isAdmin = String(admin?.role || '').toLowerCase() === 'admin'

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-extrabold text-amber-900">Access restricted</h1>
        <p className="mt-2 text-sm font-semibold text-amber-900">
          Service Portals are available to admins only.
        </p>
      </div>
    )
  }

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const [favorites, setFavorites] = useState(() => new Set(loadLS(LS_FAVORITES, [])))
  const [recentIds, setRecentIds] = useState(() => loadLS(LS_RECENTS, []))
  const [openCounts, setOpenCounts] = useState(() => loadLS(LS_COUNTS, {}))

  // NEW: copied button state
  const [copiedId, setCopiedId] = useState(null)
  const copyTimerRef = useRef(null)

  useEffect(() => {
    saveLS(LS_FAVORITES, Array.from(favorites))
  }, [favorites])

  useEffect(() => {
    saveLS(LS_RECENTS, recentIds)
  }, [recentIds])

  useEffect(() => {
    saveLS(LS_COUNTS, openCounts)
  }, [openCounts])

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  const totalCount = SERVICES.length

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase()
    return SERVICES.filter((s) => {
      const catTitle =
        CATEGORIES.find((c) => c.key === s.category)?.title || s.category
      const matchesText =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        String(catTitle).toLowerCase().includes(q)

      const matchesCategory = activeCategory === 'all' || s.category === activeCategory
      return matchesText && matchesCategory
    })
  }, [search, activeCategory])

  const servicesByCategory = useMemo(() => {
    const map = new Map()
    for (const cat of CATEGORIES) map.set(cat.key, [])
    for (const s of filteredServices) map.get(s.category)?.push(s)
    return map
  }, [filteredServices])

  const favoriteServices = useMemo(() => {
    const fav = SERVICES.filter((s) => favorites.has(s.id))
    return fav.sort((a, b) => a.name.localeCompare(b.name))
  }, [favorites])

  const recentServices = useMemo(() => {
    const idToService = new Map(SERVICES.map((s) => [s.id, s]))
    return (recentIds || []).map((id) => idToService.get(id)).filter(Boolean)
  }, [recentIds])

  const frequentlyUsed = useMemo(() => {
    const entries = Object.entries(openCounts || {})
      .map(([id, count]) => ({ id, count: Number(count || 0) }))
      .filter((x) => x.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    const idToService = new Map(SERVICES.map((s) => [s.id, s]))
    return entries
      .map((e) => ({ service: idToService.get(e.id), count: e.count }))
      .filter((x) => Boolean(x.service))
  }, [openCounts])

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const trackOpen = (id) => {
    setRecentIds((prev) => {
      const list = Array.isArray(prev) ? prev : []
      const next = [id, ...list.filter((x) => x !== id)].slice(0, 8)
      return next
    })
    setOpenCounts((prev) => {
      const next = { ...(prev || {}) }
      next[id] = Number(next[id] || 0) + 1
      return next
    })
  }

  const copyLink = async (serviceId, url) => {
    try {
      await navigator.clipboard.writeText(url)

      // UX feedback
      setCopiedId(serviceId)
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopiedId(null), 1100)

      toast.success('Link copied!')
    } catch (e) {
      console.error(e)
      toast.error('Failed to copy link')
    }
  }

  const showEmpty = filteredServices.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Service Portals</h1>
              <Badge color="bg-blue-50 text-blue-700 border border-blue-200">
                Total: {totalCount}
              </Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed text-slate-500">
              Quick access to official government service websites from one centralized dashboard.
              Open portals in a new tab to proceed with applications and verification.
            </p>
          </div>

          <div className="w-full max-w-md shrink-0 lg:max-w-sm">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by service name or category..."
                className="h-10 w-full rounded-lg border border-slate-200/90 bg-slate-50/80 pl-9 pr-3 text-sm font-normal text-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all duration-200 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Favorites</p>
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{favorites.size}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Recently Opened</p>
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{recentIds.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Frequently Used</p>
              <Globe className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {frequentlyUsed.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Showing</p>
              <Search className="h-5 w-5 text-slate-600" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {filteredServices.length}
            </p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] sm:p-4">
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={classNames(
              'shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20',
              activeCategory === 'all'
                ? 'bg-[#1e3a5f] text-white shadow-sm'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
            )}
          >
            All
          </button>

          {CATEGORIES.map((c) => {
            const Icon = c.icon
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveCategory(c.key)}
                className={classNames(
                  'shrink-0 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20',
                  activeCategory === c.key
                    ? 'bg-[#1e3a5f] text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                )}
              >
                <Icon
                  className={classNames(
                    'h-4 w-4',
                    activeCategory === c.key ? 'text-white' : 'text-slate-600'
                  )}
                />
                {c.title}
              </button>
            )
          })}
        </div>
      </div>

      {/* Bonus: Favorites / Frequently used / Recent */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Favorites */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Favorites</h2>
            <Badge color="bg-amber-50 text-amber-800 border border-amber-200">
              {favorites.size}
            </Badge>
          </div>

          <div className="mt-4 space-y-3">
            {favoriteServices.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">
                No favorites yet. Click the star on any portal to pin it here.
              </p>
            ) : (
              favoriteServices.slice(0, 6).map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOpen(s.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  <span className="truncate">{s.name}</span>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </a>
              ))
            )}
          </div>
        </div>

        {/* Frequently used */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Frequently Used</h2>
            <Badge color="bg-emerald-50 text-emerald-800 border border-emerald-200">
              Top
            </Badge>
          </div>

          <div className="mt-4 space-y-3">
            {frequentlyUsed.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">
                Open a few portals to see frequently used services here.
              </p>
            ) : (
              frequentlyUsed.slice(0, 6).map(({ service, count }) => (
                <a
                  key={service.id}
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOpen(service.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  <span className="truncate">{service.name}</span>
                  <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">
                    {count} opens
                  </span>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Recent */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recently Opened</h2>
            <Badge color="bg-blue-50 text-blue-700 border border-blue-200">
              {recentIds.length}
            </Badge>
          </div>

          <div className="mt-4 space-y-3">
            {recentServices.length === 0 ? (
              <p className="text-sm font-semibold text-slate-500">
                Recently opened portals will appear here.
              </p>
            ) : (
              recentServices.slice(0, 6).map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackOpen(s.id)}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                >
                  <span className="truncate">{s.name}</span>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category sections */}
      {filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200/80">
            <Search className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No service portals found
          </h3>
          <p className="mt-2 text-sm font-normal text-slate-500">
            Try adjusting your search or selecting a different category.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setActiveCategory('all')
              }}
              className="rounded-lg bg-[#1e3a5f] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#16304f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {CATEGORIES.map((cat) => {
            if (activeCategory !== 'all' && activeCategory !== cat.key) return null
            const list = servicesByCategory.get(cat.key) || []
            if (list.length === 0) return null

            const CatIcon = cat.icon

            return (
              <section key={cat.key} className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 shadow-sm">
                      <CatIcon className="h-5 w-5 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                        {cat.title}
                      </h2>
                      <p className="text-sm font-normal text-slate-500">
                        Quick access to official portals
                      </p>
                    </div>
                  </div>

                  <Badge color="bg-slate-50 text-slate-700 border border-slate-200">
                    {list.length} services
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      isFavorite={favorites.has(service.id)}
                      copied={copiedId === service.id}
                      openedCount={Number(openCounts?.[service.id] || 0)}
                      onToggleFavorite={() => toggleFavorite(service.id)}
                      onOpen={() => trackOpen(service.id)}
                      onCopy={() => copyLink(service.id, service.url)}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}