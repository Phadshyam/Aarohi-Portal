import React, { useState, useRef } from 'react'
import { MonitorPlay, Smartphone, Globe, Code, ShieldCheck, Mail, Send, X, Laptop, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'



export function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function WebsiteDevelopmentSection({ branding, phone }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const lastSubmitRef = useRef(0)

  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    business_name: '',
    business_type: '',
    website_type: 'Business Website',
    budget_range: 'Below ₹10,000',
    preferred_timeline: 'Within 30 Days',
    message: '',
    existing_website_url: '',
    social_media: ''
  })
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false)

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const closeModal = () => {
    setModalOpen(false)
    setSubmittedSuccessfully(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Cooldown check
    const now = Date.now()
    if (now - lastSubmitRef.current < 10000) {
      toast.error('Please wait a few seconds before submitting again.')
      return
    }

    // Phone number basic validation (must have at least 10 digits)
    const digitsOnly = formData.mobile_number.replace(/\D/g, '')
    if (digitsOnly.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.from('website_inquiries').insert([{
        full_name: formData.full_name,
        mobile_number: formData.mobile_number,
        business_name: formData.business_name,
        business_type: formData.business_type,
        website_type: formData.website_type,
        budget_range: formData.budget_range,
        preferred_timeline: formData.preferred_timeline,
        message: formData.message,
        existing_website_url: formData.existing_website_url,
        social_media: formData.social_media,
        lead_source: 'Website',
        priority: 'Medium'
      }])

      if (error) throw error

      toast.success('Your website inquiry has been submitted successfully!')
      lastSubmitRef.current = Date.now()
      setSubmittedSuccessfully(true)
      setFormData({
        full_name: '',
        mobile_number: '',
        business_name: '',
        business_type: '',
        website_type: 'Business Website',
        budget_range: 'Below ₹10,000',
        preferred_timeline: 'Within 30 Days',
        message: '',
        existing_website_url: '',
        social_media: ''
      })
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Failed to submit inquiry')
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsapp = () => {
    const waNum = '919307359171'

    const message = encodeURIComponent(
      'Hello Aarohi Multiservices, I want to build a website for my business. Please share details.'
    )

    window.open(`https://wa.me/${waNum}?text=${message}`, '_blank')
  }

  return (
    <>
      <section id="website-development" className="scroll-mt-16 bg-gradient-to-br from-[#f8fafc] via-[#eef4ff]/60 to-[#f8fafc] border-b border-slate-200/60 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 -mt-20 h-96 w-96 rounded-full bg-blue-100/50 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-20 h-80 w-80 rounded-full bg-indigo-100/40 blur-[80px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="text-center mx-auto max-w-3xl">
            <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#1e3a5f]/20 bg-[#1e3a5f]/5 px-3 py-1 mb-4">
              <Code className="h-3.5 w-3.5 text-[#1e3a5f]" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#1e3a5f]">Custom Development</p>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Build Your Business Website
            </h2>
            <p className="mt-5 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
              Aarohi Multiservices also provides professional website development services for businesses that want to grow online with a clean, trustworthy, and responsive digital presence. Get a modern, mobile-friendly website for your business, shop, service, startup, or agency.
            </p>
            <div className="mt-5 inline-flex items-center rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-200 shadow-sm">
              <span className="text-sm font-extrabold text-emerald-700">Starting from just ₹X,999/-</span>
            </div>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                <Globe className="h-6 w-6 text-[#1e3a5f]" />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">Business Websites</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Professional digital presence for local businesses and agencies.</p>
            </div>

            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 group-hover:scale-110 transition-transform duration-300">
                <MonitorPlay className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">Portfolio & Services</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Showcase your work and services with clean, modern portfolio portals.</p>
            </div>

            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">Mobile Friendly</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Fully responsive designs that look perfect on all modern devices.</p>
            </div>

            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 group-hover:scale-110 transition-transform duration-300">
                <Code className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="mt-5 text-base font-extrabold text-slate-900">Admin Panels</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">Custom admin dashboards, web apps, and deployment support.</p>
            </div>
          </div>

          {/* Website Showcase */}
          <div className="mt-16 hidden lg:block">
            <div className="grid grid-cols-3 gap-6">

              {/* Card 1 */}
              <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                {/* Browser top bar */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>

                {/* Image */}
                <div className="overflow-hidden">
                  <img
                    src="/website-showcase/business-website.png"
                    alt="Business Website"
                    className="h-[240px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Business Website
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Professional website for local businesses and service agencies.
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#1e3a5f] border border-blue-100/80">Responsive</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100/80">SEO Ready</span>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">Fast Loading</span>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>

                <div className="overflow-hidden">
                  <img
                    src="/website-showcase/portfolio-website.png"
                    alt="Portfolio Website"
                    className="h-[240px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Portfolio Website
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Modern portfolio and personal branding website showcase.
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#1e3a5f] border border-blue-100/80">Responsive</span>
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-100/80">Personal Branding</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-100/80">SEO Ready</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

                <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-3 py-2">
                  <div className="h-2 w-2 rounded-full bg-rose-400" />
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>

                <div className="overflow-hidden">
                  <img
                    src="/website-showcase/admin-dashboard.png"
                    alt="Admin Dashboard"
                    className="h-[240px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">
                    Admin Dashboard
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Powerful admin panels, analytics dashboards, and management systems.
                  </p>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-100/80">Admin Panel</span>
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-100/80">Secure</span>
                    <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">Fast Loading</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-14 flex flex-col items-center">
            <p className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Perfect for: Shops • Consultants • Agencies • Startups</p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => { setModalOpen(true); setSubmittedSuccessfully(false); }}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#1e3a5f] px-8 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(30,58,95,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#16304f] hover:shadow-[0_12px_28px_rgba(30,58,95,0.4)] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30"
              >
                Send Website Inquiry
              </button>
              <button
                type="button"
                onClick={handleWhatsapp}
                className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-emerald-200 bg-white px-8 text-sm font-bold text-emerald-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                Contact on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col my-auto max-h-[90vh] overflow-hidden border border-slate-150">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h3 className="text-lg font-extrabold text-slate-900">Website Inquiry</h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submittedSuccessfully ? (
              <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">Inquiry Submitted!</h4>
                <p className="max-w-md text-sm text-slate-600 leading-relaxed">
                  Thank you for submitting your inquiry. Aarohi Multiservices will review your requirements and reach out to you on WhatsApp or call shortly.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 rounded-full bg-[#1e3a5f] px-8 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16304f] transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Information Section */}
                  <div className="md:col-span-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 border-b pb-1">Client & Business Info</p>
                  </div>
                  <div>
                    <label htmlFor="full_name" className="mb-1.5 block text-xs font-bold text-slate-700">Full Name *</label>
                    <input
                      id="full_name"
                      required
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="mobile_number" className="mb-1.5 block text-xs font-bold text-slate-700">Mobile Number (WhatsApp) *</label>
                    <input
                      id="mobile_number"
                      required
                      type="tel"
                      name="mobile_number"
                      value={formData.mobile_number}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                  <div>
                    <label htmlFor="business_name" className="mb-1.5 block text-xs font-bold text-slate-700">Business Name *</label>
                    <input
                      id="business_name"
                      required
                      type="text"
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="e.g. Aarohi Multiservices"
                    />
                  </div>
                  <div>
                    <label htmlFor="business_type" className="mb-1.5 block text-xs font-bold text-slate-700">Business Type / Industry *</label>
                    <input
                      id="business_type"
                      required
                      type="text"
                      name="business_type"
                      value={formData.business_type}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="e.g. Retail Shop, Agency, Startup"
                    />
                  </div>

                  {/* Requirements Section */}
                  <div className="md:col-span-2 mt-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 border-b pb-1">Website Details</p>
                  </div>
                  <div>
                    <label htmlFor="website_type" className="mb-1.5 block text-xs font-bold text-slate-700">Website Type *</label>
                    <select
                      id="website_type"
                      name="website_type"
                      value={formData.website_type}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer"
                    >
                      <option>Business Website</option>
                      <option>Portfolio Website</option>
                      <option>Service Portal</option>
                      <option>Admin Panel</option>
                      <option>E-commerce Website</option>
                      <option>Landing Page</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="budget_range" className="mb-1.5 block text-xs font-bold text-slate-700">Budget Range *</label>
                    <select
                      id="budget_range"
                      name="budget_range"
                      value={formData.budget_range}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer"
                    >
                      <option>Below ₹10,000</option>
                      <option>₹10,000 - ₹20,000</option>
                      <option>₹20,000 - ₹40,000</option>
                      <option>Above ₹40,000</option>
                      <option>Not Sure</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="preferred_timeline" className="mb-1.5 block text-xs font-bold text-slate-700">Preferred Timeline *</label>
                    <select
                      id="preferred_timeline"
                      name="preferred_timeline"
                      value={formData.preferred_timeline}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer"
                    >
                      <option>Urgent</option>
                      <option>Within 7 Days</option>
                      <option>Within 15 Days</option>
                      <option>Within 30 Days</option>
                      <option>Not Sure</option>
                    </select>
                  </div>
                  
                  {/* Optional Details Section */}
                  <div className="md:col-span-2 mt-2">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 border-b pb-1">Additional details (Optional)</p>
                  </div>
                  <div>
                    <label htmlFor="existing_website_url" className="mb-1.5 block text-xs font-bold text-slate-700">Existing Website URL</label>
                    <input
                      id="existing_website_url"
                      type="url"
                      name="existing_website_url"
                      value={formData.existing_website_url}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="social_media" className="mb-1.5 block text-xs font-bold text-slate-700">Social Media Username / Page Name</label>
                    <input
                      id="social_media"
                      type="text"
                      name="social_media"
                      value={formData.social_media}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="e.g. @mybusiness, myshop_official, facebook.com/mybusiness"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="message" className="mb-1.5 block text-xs font-bold text-slate-700">Message / Requirements</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={3}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#1e3a5f] focus:bg-white focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="Tell us a bit about your website requirements..."
                    />
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1e3a5f] px-8 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16304f] transition-all disabled:opacity-70"
                  >
                    {loading ? 'Submitting...' : 'Submit Inquiry'}
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
