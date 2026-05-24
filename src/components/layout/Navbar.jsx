// src/components/layout/Navbar.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const NAV_ITEMS = [
  { label: 'Services', id: 'services' },
  { label: 'Website Development', id: 'website-development' },
  { label: 'Track Application', id: 'track' },
  { label: 'Contact', id: 'contact' },
  { label: 'About', id: 'about' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)

  const [branding, setBranding] = useState({
    business_name: 'Aarohi Multiservices',
    logo_icon_url: '/default-icon.png',
    logo_wordmark_url: '/default-wordmark.png',
  })
  const [iconFailed, setIconFailed] = useState(false)
  const [wordmarkFailed, setWordmarkFailed] = useState(false)

  const lastScrollKeyRef = useRef('')

  const pathname = location.pathname
  const navItems = useMemo(() => NAV_ITEMS, [])

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_branding')
        if (error) throw error
        setBranding({
          business_name: data?.business_name || '',
          logo_icon_url: data?.logo_icon_url || '',
          logo_wordmark_url: data?.logo_wordmark_url || '',
        })
      } catch (e) {
        console.error('Branding fetch error:', e)
      }
    }
    fetchBranding()
  }, [])

  const iconSrc = (branding.logo_icon_url || '/logo.png').trim()
  const wordmarkSrc = (branding.logo_wordmark_url || '').trim()

  useEffect(() => setIconFailed(false), [iconSrc])
  useEffect(() => setWordmarkFailed(false), [wordmarkSrc])

  const scrollToSection = (id) => {
    if (!id) return
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.location.hash = `#${id}`
  }

  const goHomeAndScroll = async (id) => {
    setMobileOpen(false)
    if (pathname === '/') {
      scrollToSection(id)
      return
    }
    navigate('/', { state: { scrollTo: id } })
  }

  const handleLogoClick = () => {
    setMobileOpen(false)
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/')
  }

  const goAdminLogin = () => {
    setMobileOpen(false)
    navigate('/admin/login')
  }

  useEffect(() => {
    if (pathname !== '/') return

    const stateTarget = location.state?.scrollTo
    const hashTarget = location.hash?.replace('#', '') || ''
    const target = stateTarget || hashTarget
    if (!target) return

    const key = `${pathname}|${target}`
    if (lastScrollKeyRef.current === key) return
    lastScrollKeyRef.current = key

    const t = window.setTimeout(() => scrollToSection(target), 80)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, location.state, location.hash])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const onChange = (e) => {
      if (e.matches) setMobileOpen(false)
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand */}
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center gap-3 focus:outline-none"
          aria-label="Go to homepage"
        >
          {/* Icon (no box) */}
          {!iconFailed ? (
            <img
              key={iconSrc}
              src={iconSrc}
              alt="Logo"
              className="h-10 w-10 shrink-0 object-contain scale-[1.25] drop-shadow-sm"
              onError={() => setIconFailed(true)}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center">
              <span className="text-base font-extrabold text-[#1e3a5f]">A</span>
            </div>
          )}

          {/* Wordmark */}
          {wordmarkSrc && !wordmarkFailed ? (
            <img
              key={wordmarkSrc}
              src={wordmarkSrc}
              alt={branding.business_name || 'Aarohi Multiservices'}
              className="h-9 w-auto max-w-[240px] object-contain"
              onError={() => setWordmarkFailed(true)}
            />
          ) : (
            <div className="leading-tight text-left">
              <div className="text-base font-extrabold tracking-wide text-[#1e3a5f]">
                AAROHI
              </div>
              <div className="-mt-0.5 text-[11px] font-semibold tracking-[0.18em] text-amber-500">
                MULTISERVICES
              </div>
            </div>
          )}
        </button>

        {/* Right: Desktop links + Admin Login */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goHomeAndScroll(item.id)}
              className="text-sm font-semibold text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:text-[#1e3a5f] focus:outline-none"
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={goAdminLogin}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16304f] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 active:scale-[0.98]"
          >
            <Lock className="h-4 w-4" />
            Admin Login
          </button>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goHomeAndScroll(item.id)}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[#1e3a5f]"
                >
                  {item.label}
                </button>
              ))}

              <div className="mt-2 border-t border-slate-200 pt-2">
                <button
                  type="button"
                  onClick={goAdminLogin}
                  className="w-full rounded-xl bg-[#1e3a5f] px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-[#16304f]"
                >
                  Admin Login
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}