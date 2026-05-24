import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from './HomeStaticSections'

const FAQS = [
  {
    question: 'How long does it take to process a PF withdrawal?',
    answer: 'Typically, PF withdrawal takes between 7 to 20 working days after successful submission. The exact time depends on EPFO processing and your employer\'s approval.',
  },
  {
    question: 'What documents are required for Aadhaar update?',
    answer: 'To update your Aadhaar, you need a valid Proof of Identity (like PAN Card, Voter ID) and Proof of Address (like Passport, Utility Bill). The required documents vary slightly depending on what you want to update (Name, Address, DOB, etc.).',
  },
  {
    question: 'Can I track my PAN card correction status?',
    answer: 'Yes! You can use our "Track Application" feature to check the real-time status of your PAN card correction using your Application ID or mobile number.',
  },
  {
    question: 'Is Shop Act registration mandatory for small businesses?',
    answer: 'Yes, any commercial establishment, including small shops, must register under the Shop and Establishment Act within 30 days of commencing work. We can help you complete this registration quickly.',
  },
  {
    question: 'Do you assist with Passport applications?',
    answer: 'Yes, we provide end-to-end assistance for new passport applications, renewals, and police clearance certificates (PCC), ensuring all your documents are perfectly arranged for your appointment.',
  },
  {
    question: 'How long does GST registration take?',
    answer: 'GST registration usually takes 3 to 7 working days, provided all your documents (PAN, Aadhaar, Business Proof, Bank details) are accurate and complete.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="scroll-mt-16 bg-gradient-to-b from-slate-50/60 to-white border-b border-slate-200/60">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-amber-700/90">FAQs</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#1e3a5f] sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600">
            Find quick answers to common questions about our documentation services.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={index}
                className={cx(
                  'rounded-2xl border transition-all duration-300 ease-out overflow-hidden',
                  isOpen
                    ? 'border-[#1e3a5f]/30 bg-white shadow-[0_8px_30px_rgba(30,58,95,0.08)] ring-1 ring-[#1e3a5f]/10'
                    : 'border-slate-200/80 bg-white/60 hover:bg-white hover:border-slate-300 hover:shadow-[0_4px_16px_rgba(15,23,42,0.04)]'
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between px-6 py-5 sm:py-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={cx("text-[15px] sm:text-base font-extrabold pr-4 transition-colors duration-300", isOpen ? "text-[#1e3a5f]" : "text-slate-800 group-hover:text-slate-900")}>
                    {faq.question}
                  </span>
                  <div className={cx(
                    "flex shrink-0 h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ease-out",
                    isOpen ? "bg-[#1e3a5f] text-white rotate-180 shadow-md" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  )}>
                    <ChevronDown className="h-4 w-4" strokeWidth={2.5} />
                  </div>
                </button>
                <div
                  className={cx(
                    'grid transition-all duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm font-medium leading-relaxed text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-sm font-semibold text-slate-500">
            Still have questions? <a href="#contact" className="text-[#1e3a5f] underline hover:text-[#16304f] transition">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  )
}
