// src/components/layout/Footer.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { MapPin, Mail, Phone, Shield, FileText, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function normalizePhoneForLinks(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return { display: '', wa: '', tel: '' }

  const waDigits = digits.length === 10 ? `91${digits}` : digits
  const telDigits = digits.length === 10 ? `+91${digits}` : `+${digits}`

  return { display: raw, wa: waDigits, tel: telDigits }
}

export default function Footer({ services = [] }) {
  const [branding, setBranding] = useState({
    business_name: 'Aarohi Multiservices',
    contact: '',
    email: '',
    logo_icon_url: '/default-icon.png',
    logo_wordmark_url: '/default-wordmark.png',
  });
  const [iconFailed, setIconFailed] = useState(false)
  const [wordmarkFailed, setWordmarkFailed] = useState(false)

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_branding')
        if (error) throw error
        setBranding({
          business_name: data?.business_name || 'Aarohi Multiservices',
          contact: data?.contact || '',
          email: data?.email || '',
          logo_icon_url: data?.logo_icon_url || '',
          logo_wordmark_url: data?.logo_wordmark_url || '',
        })
      } catch (e) {
        console.error('Footer branding fetch error:', e)
      }
    }
    fetchBranding()
  }, [])

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

  const iconSrc =
    `${SUPABASE_URL}/storage/v1/object/public/branding/logo-icon-dark.png`

  const wordmarkSrc =
    `${SUPABASE_URL}/storage/v1/object/public/branding/logo-wordmark-dark.png`

  useEffect(() => setIconFailed(false), [iconSrc])
  useEffect(() => setWordmarkFailed(false), [wordmarkSrc])

  const phone = useMemo(() => normalizePhoneForLinks(branding.contact), [branding.contact])
  const topServices = useMemo(() => (services || []).slice(0, 8), [services])
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-white/5 bg-[#0c2238] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              {!iconFailed ? (
                <img
                  src={iconSrc}
                  alt="Logo"
                  className="h-10 w-10 object-contain scale-[1.15]"
                  onError={() => setIconFailed(true)}
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                  <span className="text-sm font-extrabold">A</span>
                </div>
              )}

              {wordmarkSrc && !wordmarkFailed ? (
                <img
                  src={wordmarkSrc}
                  alt={branding.business_name}
                  className="h-9 w-auto max-w-[220px] object-contain"
                  onError={() => setWordmarkFailed(true)}
                />
              ) : (
                <div className="leading-tight">
                  <div className="text-base font-extrabold tracking-wide">
                    {branding.business_name}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-white/70">
                    Government documentation & service assistance
                  </div>
                </div>
              )}
            </div>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
              One portal for all major government services. Apply easily, track your
              application, and get dedicated support.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="https://aarohimultiservices.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition-colors duration-200 hover:border-amber-400/30 hover:bg-white/10"
              >
                <Globe className="h-4 w-4 shrink-0 text-amber-400/90" />
                Website
              </a>
              {/* <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition-colors duration-200 hover:border-amber-400/30 hover:bg-white/10"
              >
                <MapPin className="h-4 w-4 shrink-0 text-amber-400/90" />
                Maps
              </a> */}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400/90">
              Quick links
            </h3>
            <ul className="mt-5 space-y-3.5 text-sm font-semibold text-white/72">
              <li>
                <a href="#services" className="transition-colors duration-200 hover:text-white">
                  Services
                </a>
              </li>
              <li>
                <a href="#trust" className="transition-colors duration-200 hover:text-white">
                  Trust & security
                </a>
              </li>
              <li>
                <a href="#track" className="transition-colors duration-200 hover:text-white">
                  Track Application
                </a>
              </li>
              <li>
                <a href="#contact" className="transition-colors duration-200 hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#about" className="transition-colors duration-200 hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="/apply" className="transition-colors duration-200 hover:text-white">
                  Apply Online
                </a>
              </li>
              <li>
                <a
                  href="/admin/login"
                  className="inline-flex min-h-[44px] w-full items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-[0_4px_14px_rgba(0,0,0,0.2)] transition-colors duration-200 hover:bg-amber-300 sm:w-auto"
                >
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400/90">
              Popular services
            </h3>
            <ul className="mt-5 space-y-3.5 text-sm font-semibold text-white/72">
              {topServices.length === 0 ? (
                <li className="text-white/55">Loading services…</li>
              ) : (
                topServices.map((s) => (
                  <li key={s.id}>
                    <a href="#services" className="transition-colors duration-200 hover:text-white">
                      {s.name}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-400/90">
              Contact
            </h3>

            <div className="mt-5 space-y-5 text-sm font-semibold text-white/72">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-white/70" />
                <p className="leading-relaxed">
                  Aarohi Multiservices, Dombivli East, Kalyan, Maharashtra 421201.
                </p>
              </div>

              {branding.contact ? (
                <a
                  className="flex items-center gap-3 text-white/72 transition-colors duration-200 hover:text-white"
                  href={phone.tel ? `tel:${phone.tel}` : undefined}
                >
                  <Phone className="h-4 w-4 text-white/70" />
                  {branding.contact}
                </a>
              ) : null}

              {branding.email ? (
                <a
                  className="flex items-center gap-3 text-white/72 transition-colors duration-200 hover:text-white"
                  href={`mailto:${branding.email}`}
                >
                  <Mail className="h-4 w-4 text-white/70" />
                  {branding.email}
                </a>
              ) : null}

              <p className="text-white/60">
                Working Hours: Mon – Sat | 10:00 AM – 6:00 PM
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-white/55">
            © {year} {branding.business_name || 'Aarohi Multiservices'}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/55">
            <a
              href="https://example.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-white"
            >
              <Shield className="h-4 w-4 shrink-0 text-amber-400/80" />
              Privacy Policy
            </a>
            <a
              href="https://example.com/terms"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition-colors duration-200 hover:text-white"
            >
              <FileText className="h-4 w-4 shrink-0 text-amber-400/80" />
              Terms
            </a>
            <a
              href="https://example.com/refund-policy"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-200 hover:text-white"
            >
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}