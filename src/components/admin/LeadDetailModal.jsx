// src/components/admin/LeadDetailModal.jsx
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { X, Send, Phone, Copy, Calendar, DollarSign, Clock, User, Briefcase, Globe, FileText, ExternalLink, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'In Discussion',
  'Quotation Sent',
  'Converted',
  'Not Interested',
]

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent']

const formatDateToLocalInput = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  } catch {
    return ''
  }
}

export default function LeadDetailModal({ open, lead, onClose, onSaved }) {
  const [saving, setSaving] = useState(false)
  
  // CRM editable fields state
  const [status, setStatus] = useState('New')
  const [priority, setPriority] = useState('Medium')
  const [quotationAmount, setQuotationAmount] = useState('0')
  const [nextFollowUpDate, setNextFollowUpDate] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [lastContactedOn, setLastContactedOn] = useState('')

  // Copy states
  const [copiedNumber, setCopiedNumber] = useState(false)
  const [copiedWebsite, setCopiedWebsite] = useState(false)
  const [copiedSocial, setCopiedSocial] = useState(false)

  useEffect(() => {
    if (!open || !lead) return

    setStatus(lead.status || 'New')
    setPriority(lead.priority || 'Medium')
    setQuotationAmount(lead.quotation_amount !== null && lead.quotation_amount !== undefined ? String(lead.quotation_amount) : '0')
    setNextFollowUpDate(formatDateToLocalInput(lead.next_follow_up_date))
    setAdminNotes(lead.admin_notes || '')
    setLastContactedOn(formatDateToLocalInput(lead.last_contacted_on))
  }, [open, lead])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleCopyText = (text, type) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (type === 'number') {
      setCopiedNumber(true)
      setTimeout(() => setCopiedNumber(false), 2000)
    } else if (type === 'website') {
      setCopiedWebsite(true)
      setTimeout(() => setCopiedWebsite(false), 2000)
    } else if (type === 'social') {
      setCopiedSocial(true)
      setTimeout(() => setCopiedSocial(false), 2000)
    }
  }

  const handleWhatsAppMessage = () => {
    if (!lead?.mobile_number) return
    const clientName = lead.full_name || 'Client'
    const websiteType = lead.website_type || 'Website'
    const budget = lead.budget_range || 'Not Sure'
    const timeline = lead.preferred_timeline || 'Not Sure'
    
    const message = `Hello ${clientName},

Thank you for contacting Aarohi Multiservices regarding your ${websiteType} requirement.

We reviewed your inquiry and would like to discuss your project further.

Budget Range: ${budget}
Preferred Timeline: ${timeline}

Please share any reference websites, business details, or design ideas if available.

Thank you,
Aarohi Multiservices`

    const cleanPhone = lead.mobile_number.replace(/\D/g, '')
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    
    window.open(`https://wa.me/${phoneWithCode}?text=${encodeURIComponent(message)}`, '_blank')
    
    // Automatically set last contacted to NOW
    const nowStr = new Date().toISOString()
    setLastContactedOn(formatDateToLocalInput(nowStr))
  }

  const handleSave = async () => {
    if (!lead?.id) return

    try {
      setSaving(true)

      const amountVal = quotationAmount.trim() === '' ? 0 : Number(quotationAmount)
      if (isNaN(amountVal)) {
        toast.error('Quotation Amount must be a valid number')
        return
      }

      const { error } = await supabase
        .from('website_inquiries')
        .update({
          status,
          priority,
          quotation_amount: amountVal,
          next_follow_up_date: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
          admin_notes: adminNotes,
          last_contacted_on: new Date().toISOString(), // Automatically set to NOW upon saving CRM changes!
        })
        .eq('id', lead.id)

      if (error) throw error

      toast.success('Lead updated successfully!')
      onSaved?.()
      onClose?.()
    } catch (err) {
      console.error('Update lead error:', err)
      toast.error(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleSetLastContactedNow = () => {
    setLastContactedOn(formatDateToLocalInput(new Date().toISOString()))
  }

  if (!open || !lead) return null

  // Support backward compatibility for social links renamed column
  const socialValue = lead.social_media || lead.social_links

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 max-sm:p-0 bg-slate-900/60 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" onClick={onClose}>
      <div 
        className="my-auto w-full max-w-4xl max-h-[90vh] max-sm:max-h-screen max-sm:h-full overflow-hidden rounded-2xl max-sm:rounded-none border border-slate-200 max-sm:border-0 bg-white shadow-[0_22px_60px_rgba(2,6,23,0.25)] flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#1e3a5f]" />
            <h3 className="text-base font-extrabold text-slate-900">Lead & Project CRM Details</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 max-sm:px-4 max-sm:py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Client & Business Overview */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b pb-1">Client Profile</h4>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Client Name</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{lead.full_name || '—'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp / Contact</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-semibold text-slate-900">{lead.mobile_number || '—'}</p>
                  <div className="flex gap-1.5 items-center">
                    <button 
                      type="button" 
                      onClick={() => handleCopyText(lead.mobile_number, 'number')} 
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition min-w-[32px] flex items-center justify-center shadow-sm"
                      title="Copy Mobile Number"
                    >
                      {copiedNumber ? <span className="text-[10px] font-bold text-emerald-600">Copied!</span> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a 
                      href={`tel:${lead.mobile_number}`}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center justify-center shadow-sm"
                      title="Call Client"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Business Name</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{lead.business_name || '—'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Business Category</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{lead.business_type || '—'}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Inquiry Metadata</p>
                <div className="mt-1 space-y-1 text-xs font-semibold text-slate-600">
                  <p>Source: <span className="text-slate-900">{lead.lead_source || 'Website'}</span></p>
                  <p>Created: <span className="text-slate-900">{new Date(lead.created_at).toLocaleString()}</span></p>
                </div>
              </div>
            </div>

            {/* Column 2: Project Requirements Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b pb-1">Project Scope</h4>
              
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Website Type</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{lead.website_type || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Budget Range</p>
                  <p className="mt-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 inline-block">{lead.budget_range || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Timeline</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-900">{lead.preferred_timeline || '—'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Existing Website</p>
                {lead.existing_website_url ? (
                  <div className="flex items-center justify-between mt-1">
                    <a 
                      href={lead.existing_website_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Visit Site <ExternalLink className="h-3 w-3" />
                    </a>
                    <button 
                      type="button" 
                      onClick={() => handleCopyText(lead.existing_website_url, 'website')} 
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm"
                      title="Copy Website Link"
                    >
                      {copiedWebsite ? <span className="text-[10px] font-bold text-emerald-600">Copied!</span> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-slate-500">None Provided</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Social Media</p>
                {socialValue ? (
                  <div className="flex items-center justify-between mt-1">
                    {socialValue.startsWith('http') || socialValue.includes('.com') ? (
                      <a 
                        href={socialValue.startsWith('http') ? socialValue : `https://${socialValue}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline truncate max-w-[70%]"
                      >
                        {socialValue} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-slate-900 truncate max-w-[70%]">{socialValue}</span>
                    )}
                    <button 
                      type="button" 
                      onClick={() => handleCopyText(socialValue, 'social')} 
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition shadow-sm"
                      title="Copy Social Media"
                    >
                      {copiedSocial ? <span className="text-[10px] font-bold text-emerald-600">Copied!</span> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm font-semibold text-slate-500">None Provided</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Requirements / Message</p>
                <p className="mt-1 text-xs font-semibold text-slate-700 leading-relaxed max-h-[100px] overflow-y-auto pr-1">
                  {lead.message || 'No additional message.'}
                </p>
              </div>
            </div>

            {/* Column 3: CRM Actions & Update Form */}
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-200 max-sm:p-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1e3a5f] border-b pb-1">CRM Status & Actions</h4>
              
              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Lead Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Quotation Amount</label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-slate-500 sm:text-sm font-bold">₹</span>
                    </div>
                    <input
                      type="number"
                      value={quotationAmount}
                      onChange={(e) => setQuotationAmount(e.target.value)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Next Follow-Up Date</label>
                <input
                  type="datetime-local"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Last Contacted</label>
                  <button 
                    type="button" 
                    onClick={handleSetLastContactedNow} 
                    className="text-[9px] font-bold text-[#1e3a5f] bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 rounded px-1.5 py-0.5 hover:bg-[#1e3a5f]/10"
                  >
                    Set to Now
                  </button>
                </div>
                <input
                  type="datetime-local"
                  value={lastContactedOn}
                  onChange={(e) => setLastContactedOn(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold text-slate-500 uppercase">Admin / CRM Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
                  placeholder="Record discussions, client requests..."
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-100 bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 max-sm:px-4 max-sm:pb-6">
          {/* Quick Action: Prefilled WhatsApp */}
          <div className="max-sm:w-full">
            <button
              type="button"
              onClick={handleWhatsAppMessage}
              className="inline-flex h-10 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20ba59] transition px-5 text-sm font-bold shadow-md shadow-emerald-500/10 active:scale-[0.98] w-full"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
              </svg>
              Send WhatsApp Details
            </button>
          </div>

          <div className="flex gap-3 max-sm:w-full">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 max-sm:flex-1 h-10 flex items-center justify-center"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16304f] transition-colors disabled:opacity-70 max-sm:flex-1 h-10"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
