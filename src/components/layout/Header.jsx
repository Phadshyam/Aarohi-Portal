// src/components/layout/Header.jsx

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { homeOpenServiceLocation } from '../../navigation/homeServiceIntent'
import BrandLogo from '../common/BrandLogo'
import { useBranding } from '../../context/BrandingContext'
import { useServices } from '../../context/ServicesContext'

const PRIMARY = '#1e3a5f'
const PRIMARY_HOVER = '#16304f'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  const { branding } = useBranding()
  const { services, loading: servicesLoading, error: servicesError } = useServices()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [desktopServicesOpen, setDesktopServicesOpen] = useState(false)

  const desktopServicesRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const leaveTimerRef = useRef(null)

  const clearLeaveTimer = useCallback(() => {
    if (leaveTimerRef.current) {
      window.clearTimeout(leaveTimerRef.current)
      leaveTimerRef.current = null
    }
  }, [])

  const closeDesktopDropdown = useCallback(() => {
    clearLeaveTimer()
    setDesktopServicesOpen(false)
  }, [clearLeaveTimer])

  const scheduleDesktopClose = useCallback(() => {
    clearLeaveTimer()
    leaveTimerRef.current = window.setTimeout(() => {
      setDesktopServicesOpen(false)
      leaveTimerRef.current = null
    }, 140)
  }, [clearLeaveTimer])

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (desktopServicesRef.current?.contains(event.target)) return
      closeDesktopDropdown()
    }

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [closeDesktopDropdown])

  useEffect(() => {
    const onDocMouseDown = (event) => {
      if (mobileMenuRef.current?.contains(event.target)) return
      setMobileMenuOpen(false)
      setMobileServicesOpen(false)
    }

    if (!mobileMenuOpen) return undefined

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeDesktopDropdown()
        setMobileMenuOpen(false)
        setMobileServicesOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeDesktopDropdown])

  useEffect(() => {
    return () => clearLeaveTimer()
  }, [clearLeaveTimer])

  const closeAllOverlays = useCallback(() => {
    closeDesktopDropdown()
    setMobileMenuOpen(false)
    setMobileServicesOpen(false)
  }, [closeDesktopDropdown])

  const scrollToSection = useCallback(
    (id) => {
      if (location.pathname !== '/') {
        if (id === 'top') {
          navigate('/')
        } else {
          navigate(`/#${id}`)
        }
        closeAllOverlays()
        return
      }

      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        closeAllOverlays()
        return
      }

      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
      closeAllOverlays()
    },
    [closeAllOverlays, location.pathname, navigate]
  )

  const goToHomeService = useCallback(
    (serviceId) => {
      closeAllOverlays()
      navigate(homeOpenServiceLocation(serviceId), {
        replace: location.pathname === '/',
      })
    },
    [closeAllOverlays, location.pathname, navigate]
  )

  const handleLogoClick = () => {
    if (location.pathname !== '/') {
      navigate('/')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    closeAllOverlays()
  }

  const navLinkClass =
    'inline-flex h-9 shrink-0 items-center rounded-lg px-3 text-sm font-semibold text-slate-700 transition-colors duration-300 ease-out hover:bg-slate-50 hover:text-[#1e3a5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/25 focus-visible:ring-offset-2'

  const ctaOutlineClass =
    'inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/20 sm:px-4'

  const ctaPrimaryClass =
    'inline-flex h-9 shrink-0 items-center justify-center rounded-lg px-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(30,58,95,0.28)] transition-all duration-300 ease-out hover:shadow-[0_6px_18px_rgba(30,58,95,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/30 focus-visible:ring-offset-2 sm:px-4'

  const desktopServicesPanel = (
    <div
      className={[
        'absolute left-0 top-full z-[100] mt-2 min-w-[280px] max-w-sm overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.14)] backdrop-blur-sm transition-[opacity,transform,visibility] duration-300 ease-out',
        desktopServicesOpen
          ? 'pointer-events-auto visible translate-y-0 opacity-100'
          : 'pointer-events-none invisible -translate-y-1 opacity-0',
      ].join(' ')}
      role="menu"
      aria-hidden={!desktopServicesOpen}
    >
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Service catalogue
        </p>
      </div>
      <div className="max-h-[min(320px,50vh)] overflow-y-auto overscroll-contain py-1.5">
        {servicesLoading ? (
          <div className="px-4 py-6 text-center text-sm font-medium text-slate-500">
            Loading services…
          </div>
        ) : servicesError ? (
          <div className="px-4 py-6 text-center text-sm font-medium text-red-600/90">
            Unable to load services. Please try again later.
          </div>
        ) : services.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm font-medium text-slate-500">
            No active services listed.
          </div>
        ) : (
          services.map((s) => (
            <button
              key={s.id}
              type="button"
              role="menuitem"
              onClick={() => goToHomeService(s.id)}
              className="mx-1 flex w-[calc(100%-0.5rem)] items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-200 ease-out hover:bg-slate-50 hover:text-[#1e3a5f]"
            >
              <span className="line-clamp-2">{s.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-[#ffffff]/95 shadow-[0_1px_0_rgba(15,23,42,0.05)] backdrop-blur-sm supports-[backdrop-filter]:bg-[#ffffff]/90">
      <div
        ref={mobileMenuRef}
        className="relative mx-auto w-full max-w-7xl overflow-x-clip px-4 sm:px-6 lg:px-8"
      >
        <div className="flex h-16 w-full min-w-0 items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          <div className="flex min-w-0 shrink-0 items-center">
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex max-h-14 items-center justify-center rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/25 focus-visible:ring-offset-2"
              aria-label="Go to home"
            >
              <BrandLogo
                lightIcon={branding.logo_icon_url}
                darkIcon={branding.logo_icon_dark_url}
                lightWordmark={branding.logo_wordmark_url}
                darkWordmark={branding.logo_wordmark_dark_url}
              />
            </button>
          </div>

          <nav
            className="hidden h-full min-w-0 flex-1 items-center justify-center gap-0.5 md:flex lg:gap-1"
            aria-label="Primary"
          >
            <button type="button" onClick={() => scrollToSection('top')} className={navLinkClass}>
              Home
            </button>

            <div
              ref={desktopServicesRef}
              className="relative flex h-full items-center"
              onMouseEnter={() => {
                clearLeaveTimer()
                setDesktopServicesOpen(true)
              }}
              onMouseLeave={scheduleDesktopClose}
            >
              <button
                type="button"
                className={`${navLinkClass} gap-1`}
                aria-expanded={desktopServicesOpen}
                aria-haspopup="true"
                onClick={() => scrollToSection('services')}
              >
                Services
                <ChevronDown
                  size={16}
                  strokeWidth={2}
                  className={`shrink-0 text-slate-500 transition-transform duration-200 ease-out ${
                    desktopServicesOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {desktopServicesPanel}
            </div>

            <button type="button" onClick={() => scrollToSection('about')} className={navLinkClass}>
              About
            </button>

            <button type="button" onClick={() => scrollToSection('contact')} className={navLinkClass}>
              Contact
            </button>
          </nav>

          <div className="hidden h-full shrink-0 items-center gap-2 md:flex lg:gap-3">
            <button type="button" onClick={() => navigate('/track')} className={ctaOutlineClass}>
              Track Application
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className={ctaPrimaryClass}
              style={{ backgroundColor: PRIMARY }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = PRIMARY_HOVER
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = PRIMARY
              }}
            >
              Admin Login
            </button>
          </div>

          <button
            type="button"
            className="ms-auto inline-flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-lg text-slate-800 transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f]/25 md:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-nav"
            onClick={() => {
              setMobileMenuOpen((v) => !v)
              setMobileServicesOpen(false)
            }}
          >
            {mobileMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
          </button>
        </div>

        <div
          id="mobile-primary-nav"
          className={[
            'absolute left-0 right-0 top-full z-[60] border-b border-slate-200/90 bg-[#ffffff] shadow-[0_12px_32px_rgba(15,23,42,0.08)] md:hidden',
            mobileMenuOpen
              ? 'visible max-h-[min(85dvh,640px)] overflow-y-auto overscroll-contain opacity-100'
              : 'invisible max-h-0 overflow-hidden border-b-0 opacity-0 pointer-events-none shadow-none',
            'transition-[max-height,opacity,visibility] duration-300 ease-out',
          ].join(' ')}
          inert={!mobileMenuOpen}
        >
          <div className="space-y-0.5 py-3">
              <button
                type="button"
                onClick={() => scrollToSection('top')}
                className="flex w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors duration-200 hover:bg-slate-50 hover:text-[#1e3a5f]"
              >
                Home
              </button>

              <div className="mx-2 rounded-xl border border-slate-200/80 bg-slate-50/50 sm:mx-0">
                <div className="flex min-h-[48px] items-stretch">
                  <button
                    type="button"
                    onClick={() => {
                      scrollToSection('services')
                      setMobileServicesOpen(false)
                    }}
                    className="flex flex-1 items-center px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors duration-200 hover:text-[#1e3a5f]"
                  >
                    Services
                  </button>
                  <button
                    type="button"
                    aria-expanded={mobileServicesOpen}
                    aria-label="Toggle services list"
                    className="flex w-12 shrink-0 items-center justify-center border-l border-slate-200/80 text-slate-600 transition-colors duration-200 hover:bg-white/80 hover:text-[#1e3a5f]"
                    onClick={() => setMobileServicesOpen((v) => !v)}
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                </div>
                <div
                  className={[
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    mobileServicesOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  ].join(' ')}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="max-h-56 overflow-y-auto overscroll-contain border-t border-slate-200/80 bg-white px-1 py-2">
                      {servicesLoading ? (
                        <p className="px-3 py-3 text-center text-sm text-slate-500">Loading…</p>
                      ) : servicesError ? (
                        <p className="px-3 py-3 text-center text-sm text-red-600/90">Failed to load.</p>
                      ) : services.length === 0 ? (
                        <p className="px-3 py-3 text-center text-sm text-slate-500">No services.</p>
                      ) : (
                        services.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => goToHomeService(s.id)}
                            className="flex w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50 hover:text-[#1e3a5f]"
                          >
                            <span className="line-clamp-2">{s.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="flex w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors duration-200 hover:bg-slate-50 hover:text-[#1e3a5f]"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="flex w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors duration-200 hover:bg-slate-50 hover:text-[#1e3a5f]"
              >
                Contact
              </button>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-200/90 px-2 pb-4 pt-2 sm:px-0">
              <button
                type="button"
                onClick={() => {
                  document.activeElement?.blur?.()
                  setMobileMenuOpen(false)
                  navigate('/track')
                }}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                Track Application
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  navigate('/admin/login')
                }}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                style={{ backgroundColor: PRIMARY }}
              >
                Admin Login
              </button>
            </div>
        </div>
      </div>
    </header>
  )
}
