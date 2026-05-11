// src/components/layout/AdminLayout.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Search,
  Settings,
  Users,
  X,
  TrendingUp,
  UserCog,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

const SIDEBAR_WIDTH_CLASS = 'w-64' // ~250px

const ALL_NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Applications', to: '/admin/applications', icon: FileText },
  { label: 'Add Application', to: '/admin/add', icon: PlusCircle },
  { label: 'Service Portals', to: '/admin/service-portals', icon: Globe, adminOnly: true },
  { label: 'Revenue', to: '/admin/revenue', icon: TrendingUp, adminOnly: true },
  { label: 'Services', to: '/admin/services', icon: Briefcase },
  { label: 'Agents', to: '/admin/agents', icon: Users, adminOnly: true },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

function getInitials(nameOrEmail) {
  const v = String(nameOrEmail || '').trim()
  if (!v) return 'A'
  const parts = v.split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const { admin, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const [search, setSearch] = useState('')

  // NEW: Branding (icon + wordmark)
  const [branding, setBranding] = useState({
    business_name: '',
    logo_icon_url: '',
    logo_wordmark_url: '',
  })
  const [iconFailed, setIconFailed] = useState(false)
  const [wordmarkFailed, setWordmarkFailed] = useState(false)

  const dropdownRef = useRef(null)

  const initials = useMemo(
    () => getInitials(admin?.name || admin?.email),
    [admin?.name, admin?.email]
  )

  const visibleNavItems = useMemo(() => {
    const role = String(admin?.role || '').toLowerCase()
    const isAdmin = role === 'admin'
    return ALL_NAV_ITEMS.filter((item) => (item.adminOnly ? isAdmin : true))
  }, [admin?.role])

  // Fetch branding for admin portal header/sidebar
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        // Using public-safe RPC works both before/after login and avoids RLS hassles.
        const { data, error } = await supabase.rpc('get_public_branding')
        if (error) throw error

        setBranding({
          business_name: data?.business_name || '',
          logo_icon_url: data?.logo_icon_url || '',
          logo_wordmark_url: data?.logo_wordmark_url || '',
        })
      } catch (e) {
        console.error('Admin branding fetch error:', e)
      }
    }
    fetchBranding()
  }, [])

  const iconSrc = (branding.logo_icon_url || '/logo.png').trim()
  const wordmarkSrc = (branding.logo_wordmark_url || '').trim()

  // Reset fail flags if URLs change
  useEffect(() => setIconFailed(false), [iconSrc])
  useEffect(() => setWordmarkFailed(false), [wordmarkSrc])

  // Close dropdown on outside click / Esc
  useEffect(() => {
    const onDown = (e) => {
      if (!profileOpen) return
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [profileOpen])

  // Close mobile sidebar on desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => {
      if (e.matches) setSidebarOpen(false)
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const handleSubmitSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    navigate(`/admin/applications?q=${encodeURIComponent(q)}`)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin/login', { replace: true })
    } catch (e) {
      console.error(e)
      toast.error('Failed to logout')
    } finally {
      setProfileOpen(false)
    }
  }

  const BrandBlock = ({ compact = false }) => (
    <div className="flex items-center gap-3">
      {/* Icon (no box) */}
      {!iconFailed ? (
        <img
          key={iconSrc}
          src={iconSrc}
          alt="Logo"
          className={compact ? 'h-9 w-9 object-contain scale-[1.25] drop-shadow-sm' : 'h-10 w-10 object-contain scale-[1.25] drop-shadow-sm'}
          onError={() => setIconFailed(true)}
        />
      ) : (
        <div className={compact ? 'flex h-9 w-9 items-center justify-center' : 'flex h-10 w-10 items-center justify-center'}>
          <span className={compact ? 'text-sm font-extrabold text-white' : 'text-sm font-extrabold text-[#1e3a5f]'}>
            A
          </span>
        </div>
      )}

      {/* Wordmark: show on sm+ in header; always show in mobile sidebar */}
      {wordmarkSrc && !wordmarkFailed ? (
        <img
          key={wordmarkSrc}
          src={wordmarkSrc}
          alt={branding.business_name || 'Aarohi Multiservices'}
          className={compact ? 'h-9 w-auto max-w-[200px] object-contain' : 'hidden h-9 w-auto max-w-[240px] object-contain sm:block'}
          onError={() => setWordmarkFailed(true)}
        />
      ) : (
        <div className={compact ? 'leading-tight text-white' : 'hidden leading-tight sm:block'}>
          <div className={compact ? 'text-base font-extrabold tracking-wide text-white' : 'text-base font-extrabold tracking-wide text-[#1e3a5f]'}>
            AAROHI
          </div>
          <div className={compact ? '-mt-0.5 text-[11px] font-semibold tracking-[0.18em] text-amber-400' : '-mt-0.5 text-[11px] font-semibold tracking-[0.18em] text-amber-500'}>
            MULTISERVICES
          </div>
        </div>
      )}
    </div>
  )

  const SidebarNav = ({ onNavigate }) => (
    <div className="flex h-full flex-col">
      <div className="px-4 pt-5">
        <nav className="mt-4 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition',
                    'text-white/90 hover:bg-white/10 hover:text-white',
                    isActive ? 'bg-white/15 text-white' : '',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={[
                        'h-6 w-1 rounded-full',
                        isActive ? 'bg-white' : 'bg-transparent group-hover:bg-white/40',
                      ].join(' ')}
                      aria-hidden="true"
                    />
                    <Icon className="h-5 w-5 text-white" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto px-4 pb-5">
        <div className="h-px bg-white/10" />
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
        >
          <span className="h-6 w-1 rounded-full bg-transparent" aria-hidden="true" />
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="fixed inset-x-0 top-0 z-40 h-16 bg-white shadow-sm">
        <div className="flex h-full items-center justify-between px-4 sm:px-6">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-3 focus:outline-none"
              aria-label="Go to dashboard"
            >
              <BrandBlock />
            </button>

            <form onSubmit={handleSubmitSearch} className="ml-2 hidden lg:block">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Name, Phone or Application ID..."
                  className="h-10 w-[520px] rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                />
              </div>
            </form>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#1e3a5f]/30 bg-white text-sm font-extrabold text-[#1e3a5f]">
                  {initials}
                </span>
              </button>

              {profileOpen ? (
                <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Hey, {admin?.name || 'Admin'}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{admin?.email || ''}</p>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      navigate('/admin/settings')
                    }}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <UserCog className="h-4 w-4 text-slate-600" />
                    Profile Settings
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile search row */}
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <form onSubmit={handleSubmitSearch}>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Name, Phone or Application ID..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              />
            </div>
          </form>
        </div>
      </header>

      {/* SIDEBAR (desktop fixed) */}
      <aside
        className={[
          'fixed left-0 z-30 hidden h-[calc(100vh-4rem)] bg-[#1e3a5f] md:block',
          'top-16',
          SIDEBAR_WIDTH_CLASS,
        ].join(' ')}
      >
        <SidebarNav />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div
            className={[
              'absolute left-0 top-0 h-full bg-[#1e3a5f] shadow-xl',
              SIDEBAR_WIDTH_CLASS,
            ].join(' ')}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <BrandBlock compact />
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg p-2 text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-4rem)]">
              <SidebarNav onNavigate={() => setSidebarOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      {/* CONTENT */}
      <main className={['min-h-screen bg-gray-50', 'pt-[7.75rem] lg:pt-16', 'md:pl-64'].join(' ')}>
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}