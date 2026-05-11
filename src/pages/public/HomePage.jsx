// src/pages/public/HomePage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  Headphones,
  IdCard,
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

function ServiceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-200 bg-white px-7 py-7 shadow-[0_12px_30px_rgba(2,6,23,0.08)]">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50" />
      <div className="mx-auto mt-4 h-5 w-40 rounded bg-slate-200" />
      <div className="mx-auto mt-4 h-4 w-56 rounded bg-slate-200" />
      <div className="mx-auto mt-2 h-4 w-52 rounded bg-slate-200" />
      <div className="mx-auto mt-2 h-4 w-44 rounded bg-slate-200" />
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

function normalizePhoneForLinks(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return { display: '', wa: '', tel: '' }

  // If user saved 10-digit Indian number, prefix 91 for wa.me.
  const waDigits = digits.length === 10 ? `91${digits}` : digits
  const telDigits = digits.length === 10 ? `+91${digits}` : `+${digits}`

  return {
    display: raw,
    wa: waDigits,
    tel: telDigits,
  }
}

export default function HomePage() {
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [branding, setBranding] = useState({
    contact: '+91 8446140598',
    email: '',
  })

  const skeletonCount = useMemo(() => Array.from({ length: 8 }), [])

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('services')
          .select('name, description')
          .eq('is_active', true)
          .order('name', { ascending: true })

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

  // NEW: fetch public contact details from settings via RPC (safe for public)
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
        // non-blocking (fallback remains)
        console.error('Branding fetch error:', e)
      }
    }
    fetchBranding()
  }, [])

  const phone = normalizePhoneForLinks(branding.contact || '+91 8446140598')

  return (
    <div className="bg-white">
      {/* push content below fixed navbar */}
      <div className="pt-16">
        {/* SECTION 1: HERO */}
        <section className="bg-[#eef4ff]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <h1 className="text-[40px] font-extrabold leading-[1.08] text-[#1e3a5f] sm:text-5xl lg:text-6xl">
                All Government Services in One Place
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Apply for Aadhaar, PAN, GST, Passport and other services quickly and
                easily from the comfort of your home.
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
                  Trusted by 5000+ customers | Fast Processing | Secure Handling
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: OUR SERVICES */}
        <section id="services" className="bg-white">
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

            <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {loading
                ? skeletonCount.map((_, idx) => <ServiceCardSkeleton key={idx} />)
                : services.map((service) => (
                    <div
                      key={service.name}
                      className="group rounded-3xl border border-slate-200 bg-white px-7 py-7 text-center shadow-[0_12px_30px_rgba(2,6,23,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,6,23,0.12)]"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        <IdCard className="h-6 w-6 text-[#2f6fed]" />
                      </div>

                      <h3 className="mt-4 text-base font-extrabold text-slate-800">
                        {service.name}
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        {service.description || '—'}
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* SECTION: TRACK (anchor target used by navbar) */}
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

        {/* SECTION 3: WHY CHOOSE US (About) */}
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
                description="Your personal documents are handled with strict privacy and security."
              />
              <FeatureCard
                icon={ShieldCheck}
                title="Secure & Confidential"
                description="Your personal documents are handled with strict privacy and security."
              />
              <FeatureCard
                icon={Headphones}
                title="Dedicated Support"
                description="Your personal documents are handled with strict privacy and security."
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: GET IN TOUCH (Contact) */}
        <section id="contact" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
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
                <h3 className="mt-4 text-base font-extrabold text-slate-900">
                  Call Us
                </h3>
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
                <h3 className="mt-4 text-base font-extrabold text-slate-900">
                  WhatsApp Support
                </h3>
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
      </div>
    </div>
  )
}