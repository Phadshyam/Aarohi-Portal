import React, { useRef } from 'react'
import { Star, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react'
import { cx } from './HomeStaticSections'

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    service: 'PF Withdrawal',
    feedback: 'Extremely fast and hassle-free service. Got my PF withdrawal done without any confusion. Highly recommended!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Priya Patel',
    service: 'Shop Act Registration',
    feedback: 'Professional team. They guided me through the entire Shop Act registration process step by step.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Vikram Singh',
    service: 'PAN Card Correction',
    feedback: 'I was struggling with PAN correction for months. Aarohi Multiservices resolved it within a few days.',
    rating: 5,
  },
  {
    id: 4,
    name: 'Sneha Desai',
    service: 'Food License',
    feedback: 'Very clear communication. They handled my FSSAI Food License application smoothly. The tracking feature is really helpful.',
    rating: 4,
  },
  {
    id: 5,
    name: 'Amit Kumar',
    service: 'Aadhaar Update',
    feedback: 'Quick Aadhaar update service. The team is very responsive on WhatsApp. Great experience overall.',
    rating: 5,
  },
]

export default function TestimonialsSection() {
  const scrollRef = useRef(null)

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section id="testimonials" className="scroll-mt-16 bg-white border-b border-slate-200/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1e3a5f]/80">Customer Feedback</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">
              Trusted by thousands of customers
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
              Don't just take our word for it. Here's what our clients have to say about our services.
            </p>
          </div>
        </div>

        <div className="relative mt-8 group">
          {/* Navigation Buttons placed inside the carousel area for easier access */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -mt-6 -ml-4 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-[#1e3a5f] shadow-[0_8px_20px_rgba(15,23,42,0.08)] opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-105 hover:bg-slate-50 focus:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -mt-6 -mr-4 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-[#1e3a5f] shadow-[0_8px_20px_rgba(15,23,42,0.08)] opacity-0 transition-all duration-300 group-hover:opacity-100 hover:scale-105 hover:bg-slate-50 focus:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="w-[85vw] sm:w-[400px] shrink-0 snap-start rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] relative flex flex-col"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e3a5f] text-white font-extrabold text-lg shadow-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-none">{t.name}</h4>
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Verified
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200/60">
                      {t.service}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cx("h-4 w-4", i < t.rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200")}
                    />
                  ))}
                </div>
                
                <p className="text-sm font-medium leading-relaxed text-slate-700 relative z-10 flex-1">
                  "{t.feedback}"
                </p>
                
                <div className="mt-6 sm:hidden">
                  <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border border-slate-200/60">
                    {t.service}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
