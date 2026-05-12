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
    logo_icon_url: '',
    logo_wordmark_url: '',
  })
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

  const iconSrc = (branding.logo_icon_url || '/logo.png').trim()
  const wordmarkSrc = (branding.logo_wordmark_url || '').trim()

  useEffect(() => setIconFailed(false), [iconSrc])
  useEffect(() => setWordmarkFailed(false), [wordmarkSrc])

  const phone = useMemo(() => normalizePhoneForLinks(branding.contact), [branding.contact])
  const topServices = useMemo(() => (services || []).slice(0, 8), [services])
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0f2742] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
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

            <p className="mt-4 text-sm leading-relaxed text-white/75">
              One portal for all major government services. Apply easily, track your
              application, and get dedicated support.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://aarohimultiservices.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15"
              >
                <MapPin className="h-4 w-4" />
                Maps
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-white/90">
              QUICK LINKS
            </h3>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-white/75">
              <li>
                <a href="#services" className="hover:text-white">
                  Services
                </a>
              </li>
              <li>
                <a href="#track" className="hover:text-white">
                  Track Application
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white">
                  Contact
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="/apply" className="hover:text-white">
                  Apply Online
                </a>
              </li>
              <li>
                <a
                  href="/admin/login"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-amber-400"
                >
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-white/90">
              POPULAR SERVICES
            </h3>
            <ul className="mt-4 space-y-3 text-sm font-semibold text-white/75">
              {topServices.length === 0 ? (
                <li className="text-white/60">Loading services…</li>
              ) : (
                topServices.map((s) => (
                  <li key={s.id}>
                    <a href="#services" className="hover:text-white">
                      {s.name}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-extrabold tracking-wide text-white/90">
              CONTACT
            </h3>

            <div className="mt-4 space-y-4 text-sm font-semibold text-white/75">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-white/70" />
                <p className="leading-relaxed">
                  Aarohi Multiservices, Andheri East, Mumbai, Maharashtra 400069
                </p>
              </div>

              {branding.contact ? (
                <a
                  className="flex items-center gap-3 hover:text-white"
                  href={phone.tel ? `tel:${phone.tel}` : undefined}
                >
                  <Phone className="h-4 w-4 text-white/70" />
                  {branding.contact}
                </a>
              ) : null}

              {branding.email ? (
                <a
                  className="flex items-center gap-3 hover:text-white"
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

        <div className="mt-10 h-px w-full bg-white/10" />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-white/60">
            © {year} {branding.business_name || 'Aarohi Multiservices'}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-white/60">
            <a
              href="https://example.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <Shield className="h-4 w-4" />
              Privacy Policy
            </a>
            <a
              href="https://example.com/terms"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 hover:text-white"
            >
              <FileText className="h-4 w-4" />
              Terms
            </a>
            <a
              href="https://example.com/refund-policy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}