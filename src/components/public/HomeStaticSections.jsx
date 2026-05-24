import React from 'react'
import {
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  Headphones,
  Lock,
  Mail,
  MessageCircle,
  PhoneCall,
  Star,
  ShieldCheck,
  Zap,
  CheckCircle2 as CheckCircle2Icon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CountUp from 'react-countup'

export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function FeatureCard({ icon: Icon, title, description, className }) {
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

export function TrustPillar({ icon: Icon, title, description }) {
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

export function ServiceCardSkeleton() {
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

export function HeroSection({ heroStats }) {
  const navigate = useNavigate()
  return (
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
              Your trusted portal for online government services
            </h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
              Expert assistance for <strong className="font-semibold text-slate-700">PF Services</strong>, <strong className="font-semibold text-slate-700">Aadhaar Update</strong>, <strong className="font-semibold text-slate-700">PAN Card Correction</strong>, <strong className="font-semibold text-slate-700">Shop Act Registration</strong>, <strong className="font-semibold text-slate-700">Food License</strong>, and EPFO Services. Apply with confidence and track your progress at every step.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="inline-block h-8 w-8 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-900">4.9/5</span>
                <span className="text-sm font-medium text-slate-500">Google Reviews</span>
              </div>
            </div>

            {/* <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center text-sm font-semibold text-slate-600 border-t border-slate-200/60 pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                <span>Trusted by 35,000+ customers</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-300 sm:block" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Secure document handling</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-300 sm:block" />
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                <span>Fast processing support</span>
              </div>
            </div> */}

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center animate-fade-in-up">
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

          <div className="lg:col-span-5 relative">
            {/* Subtle glow behind the cards */}
            <div className="absolute inset-0 -z-10 rounded-full bg-[#1e3a5f]/5 blur-[60px]" aria-hidden />

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {heroStats.map((s, index) => {
                const StatIcon = s.icon || CheckCircle2Icon
                return (
                  <div
                    key={`${s.label}-${index}`}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] sm:p-6"
                  >
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 h-16 w-16 rounded-bl-full bg-slate-50 opacity-50 transition-transform duration-300 group-hover:scale-110" />
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border border-slate-200/60 shadow-sm text-[#1e3a5f]">
                        <StatIcon className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                    </div>
                    <div className="relative z-10 mt-4">
                      <p className="text-[1.75rem] font-black tracking-tight text-[#1e3a5f] sm:text-3xl">
                        {typeof s.value === 'number' ? (
                          <>
                            <CountUp
                              start={0}
                              end={s.value}
                              duration={2.5}
                              separator=","
                            />
                            +
                          </>
                        ) : (
                          s.value
                        )}
                      </p>
                      <p className="mt-1.5 text-[0.8rem] font-bold uppercase tracking-wider text-slate-500">
                        {s.label}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function TrustSection() {
  return (
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
  )
}

export const TRUST_PILLARS = [
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

export function TrackSection() {
  const navigate = useNavigate()
  return (
    <section id="track" className="scroll-mt-16 border-b border-slate-200/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-br from-[#f6f9ff] to-white px-6 py-12 text-center shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">Application status</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-3xl">Track your application</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            Check your application status using your Application ID or phone number — quick updates when you need them.
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
  )
}

export function WhyChooseUsSection() {
  return (
    <section id="about" className="scroll-mt-16 bg-gradient-to-b from-white to-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a5f]/80">Why choose us</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">
            Built for clarity and outcomes
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
            We simplify complex government procedures with transparent communication and careful handling of your information.
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
  )
}

export function ContactSection({ branding, phone }) {
  return (
    <section id="contact" className="scroll-mt-16 border-t border-slate-200/60 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">Contact</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">Get in touch</h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
            Prefer a quick call or WhatsApp? We respond quickly during business hours.
          </p>
        </div>

        <div className={cx('mt-12 grid gap-6', branding?.email ? 'md:grid-cols-3' : 'md:grid-cols-2')}>
          <a
            href={phone?.tel ? `tel:${phone.tel}` : undefined}
            className="flex min-h-[180px] flex-col items-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 px-6 py-10 text-center shadow-[0_10px_32px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <PhoneCall className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">Call us</h3>
            <p className="mt-3 text-lg font-extrabold text-[#1e3a5f]">{branding?.contact || '—'}</p>
          </a>

          <a
            href={phone?.wa ? `https://wa.me/${phone.wa}` : undefined}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-[180px] flex-col items-center rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/50 px-6 py-10 text-center shadow-[0_10px_32px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <MessageCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="mt-4 text-base font-extrabold text-slate-900">WhatsApp support</h3>
            <p className="mt-3 text-lg font-extrabold text-emerald-600">{branding?.contact || '—'}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-600/80 bg-emerald-50 px-2 py-1 rounded-md">Usually responds in 15 mins</p>
          </a>

          {branding?.email ? (
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

        <div className="mt-12 flex flex-col items-center justify-center space-y-2">
          <p className="text-center text-sm font-bold text-slate-700">
            Working hours: Monday – Saturday · 10:00 AM – 6:00 PM
          </p>
          <p className="text-center text-xs font-semibold text-slate-500">
            Sunday closed. Online applications can be submitted 24/7.
          </p>
        </div>
      </div>
    </section>
  )
}
