import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2, FileText, Globe, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function GlobalSearch({ className = '' }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState({ applications: [], leads: [] })
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(handler)
  }, [search])

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults({ applications: [], leads: [] })
      setIsOpen(false)
      return
    }

    let isMounted = true
    const performSearch = async () => {
      setLoading(true)
      setIsOpen(true)
      try {
        const q = `%${debouncedSearch}%`
        
        // Search applications
        const appsQuery = supabase
          .from('applications')
          .select('id, application_id, name, phone, service_name, status')
          .or(`application_id.ilike.${q},name.ilike.${q},phone.ilike.${q},service_name.ilike.${q}`)
          .order('created_at', { ascending: false })
          .limit(5)

        // Search website leads
        const leadsQuery = supabase
          .from('website_inquiries')
          .select('id, full_name, mobile_number, business_type, status')
          .or(`full_name.ilike.${q},mobile_number.ilike.${q},business_type.ilike.${q}`)
          .order('created_at', { ascending: false })
          .limit(3)

        const [appsRes, leadsRes] = await Promise.all([appsQuery, leadsQuery])
        
        if (isMounted) {
          setResults({
            applications: appsRes.data || [],
            leads: leadsRes.data || []
          })
        }
      } catch (err) {
        console.error('Global search error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    performSearch()
    return () => { isMounted = false }
  }, [debouncedSearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAppClick = (appId) => {
    setIsOpen(false)
    setSearch('')
    navigate(`/admin/applications?q=${encodeURIComponent(appId)}`)
  }

  const handleLeadClick = () => {
    setIsOpen(false)
    setSearch('')
    navigate(`/admin/website-leads`)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) {
      setIsOpen(false)
      navigate(`/admin/applications?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor="globalSearch" className="sr-only">Global Search</label>
          <input
            id="globalSearch"
            name="globalSearch"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { if (search.trim()) setIsOpen(true) }}
            placeholder="Search by Name, Phone, ID, Service..."
            className="h-10 w-full rounded-lg border border-slate-200/90 bg-slate-50/90 pl-9 pr-8 text-sm font-normal text-slate-800 shadow-inner transition-all duration-200 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setIsOpen(false)
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]/40" />
            </div>
          ) : results.applications.length === 0 && results.leads.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-slate-500">No matching results found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.applications.length > 0 && (
                <div>
                  <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Applications</h3>
                  <div className="space-y-1">
                    {results.applications.map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleAppClick(app.application_id)}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e3a5f]/10 text-[#1e3a5f]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">{app.name}</span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">{app.application_id}</span>
                          </div>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {app.service_name} • {app.phone} • {app.status}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.leads.length > 0 && (
                <div>
                  <h3 className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Website Leads</h3>
                  <div className="space-y-1">
                    {results.leads.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={handleLeadClick}
                        className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <Globe className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-slate-900">{lead.full_name}</span>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {lead.business_type || 'Website'} • {lead.mobile_number} • {lead.status}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
