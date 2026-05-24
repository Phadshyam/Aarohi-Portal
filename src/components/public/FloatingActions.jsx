import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageCircle, PhoneCall, FileSearch } from 'lucide-react'
import { useBranding } from '../../context/BrandingContext'

export default function FloatingActions() {
  const navigate = useNavigate()
  const { branding } = useBranding()

  const handleWhatsapp = () => {
    // The previously hardcoded number was 919307359171 in the WebsiteDevelopmentSection, but let's use the DB one with a fallback
    const waNum = branding?.contact?.replace(/\D/g, '') || '919307359171'
    const waNumClean = waNum.length === 10 ? `91${waNum}` : waNum
    const message = encodeURIComponent('Hello Aarohi Multiservices, I need assistance regarding your services.')
    window.open(`https://wa.me/${waNumClean}?text=${message}`, '_blank')
  }

  const handleCall = () => {
    const telNum = branding?.contact?.replace(/\D/g, '') || '919307359171'
    const telNumClean = telNum.length === 10 ? `+91${telNum}` : `+${telNum}`
    window.open(`tel:${telNumClean}`, '_self')
  }

  return (
    <>
      {/* Floating WhatsApp Button - Hidden on mobile where action bar is shown */}
      <div className="fixed bottom-6 right-6 z-[60] hidden md:flex flex-col items-end group">
        <button
          type="button"
          onClick={handleWhatsapp}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.4)] transition-transform duration-300 hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.5)] focus:outline-none focus:ring-2 focus:ring-[#25D366]/50 focus:ring-offset-2"
          aria-label="Contact on WhatsApp"
        >
          {/* Pulse animation rings */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping duration-1000" />
          <MessageCircle className="h-7 w-7 relative z-10" />
        </button>
        {/* Tooltip */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-300 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap">
          Need help? Chat with us
          {/* Arrow */}
          <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
        </div>
      </div>

      {/* Mobile Quick Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] flex h-16 items-center justify-between border-t border-slate-200/90 bg-white/95 pb-safe backdrop-blur-md shadow-[0_-4px_24px_rgba(15,23,42,0.08)] md:hidden">
        <button
          type="button"
          onClick={handleCall}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[#1e3a5f] transition-colors active:bg-slate-50 active:text-[#1e3a5f]/70"
        >
          <PhoneCall className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Call Now</span>
        </button>
        
        <div className="h-8 w-px bg-slate-200" />

        <button
          type="button"
          onClick={handleWhatsapp}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-[#25D366] transition-colors active:bg-slate-50 active:text-[#25D366]/70"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">WhatsApp</span>
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <button
          type="button"
          onClick={() => navigate('/track')}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-amber-600 transition-colors active:bg-slate-50 active:text-amber-600/70"
        >
          <FileSearch className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Track</span>
        </button>
      </div>

      {/* Padding for mobile action bar so content doesn't overlap */}
      <div className="h-16 md:hidden" />
    </>
  )
}
