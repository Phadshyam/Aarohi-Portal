// src/pages/admin/WebsiteLeadsPage.jsx
import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { Search, Loader2, ClipboardList, CheckCircle2, MessageSquare, AlertCircle, Phone, Globe, ExternalLink, RefreshCw } from 'lucide-react'
import LeadDetailModal from '../../components/admin/LeadDetailModal'

const STATUS_OPTIONS = [
  'New',
  'Contacted',
  'In Discussion',
  'Quotation Sent',
  'Converted',
  'Not Interested',
]

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent']

export default function WebsiteLeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [selectedLead, setSelectedLead] = useState(null)
  const [sortBy, setSortBy] = useState('latest')

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('website_inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load website leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  // Computing stats cards
  const totalLeads = leads.length
  const newLeads = leads.filter(l => (l.status || 'New') === 'New').length
  const discussionLeads = leads.filter(l => ['Contacted', 'In Discussion', 'Quotation Sent'].includes(l.status)).length
  const convertedLeads = leads.filter(l => l.status === 'Converted').length

  const filtered = leads.filter((l) => {
    const matchesSearch = 
      (l.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.mobile_number || '').includes(search) ||
      (l.business_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.business_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.website_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.social_media || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.social_links || '').toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'All' || (l.status || 'New') === statusFilter
    const matchesPriority = priorityFilter === 'All' || (l.priority || 'Medium') === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityWeight = (priority) => {
    switch (priority) {
      case 'Urgent': return 4
      case 'High': return 3
      case 'Medium': return 2
      case 'Low': return 1
      default: return 0
    }
  }

  const sortedFilteredLeads = [...filtered].sort((a, b) => {
    if (sortBy === 'urgent') {
      const weightA = getPriorityWeight(a.priority || 'Medium')
      const weightB = getPriorityWeight(b.priority || 'Medium')
      if (weightB !== weightA) return weightB - weightA
      return new Date(b.created_at) - new Date(a.created_at)
    }
    if (sortBy === 'converted') {
      const isAConverted = (a.status || 'New') === 'Converted' ? 1 : 0
      const isBConverted = (b.status || 'New') === 'Converted' ? 1 : 0
      if (isBConverted !== isAConverted) return isBConverted - isAConverted
      return new Date(b.created_at) - new Date(a.created_at)
    }
    // Default: 'latest' (newest leads first)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-50 text-rose-700 border border-rose-200'
      case 'High': return 'bg-amber-50 text-amber-700 border border-amber-200'
      case 'Medium': return 'bg-blue-50 text-blue-700 border border-blue-200'
      case 'Low': return 'bg-slate-50 text-slate-600 border border-slate-200'
      default: return 'bg-slate-50 text-slate-600 border border-slate-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      case 'In Discussion': return 'bg-orange-100 text-orange-800 border border-orange-200'
      case 'Quotation Sent': return 'bg-purple-100 text-purple-800 border border-purple-200'
      case 'Converted': return 'bg-emerald-100 text-emerald-800 border border-emerald-200'
      case 'Not Interested': return 'bg-red-100 text-red-800 border border-red-200'
      default: return 'bg-slate-100 text-slate-800 border border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900">
            Website Leads CRM
            <span className="inline-flex items-center justify-center rounded-full bg-[#1e3a5f]/10 px-2.5 py-0.5 text-sm font-semibold text-[#1e3a5f]">
              {totalLeads}
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage client inquiries, quotation estimations, followups and conversions.</p>
        </div>
      </div>

      {/* CRM Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
            <p className="text-2xl font-extrabold text-slate-900">{totalLeads}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
            <ClipboardList className="h-5 w-5" />
          </div>
        </div>

        {/* New Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Leads</p>
            <p className="text-2xl font-extrabold text-blue-600">{newLeads}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Discussions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">In Discussion</p>
            <p className="text-2xl font-extrabold text-amber-600">{discussionLeads}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Converted */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Converted</p>
            <p className="text-2xl font-extrabold text-emerald-600">{convertedLeads}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main CRM Grid Area */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Search & Filters Bar */}
        <div className="border-b border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <label htmlFor="searchLeads" className="sr-only">Search leads</label>
            <input
              id="searchLeads"
              name="searchLeads"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, business or type..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full sm:w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="priorityFilter" className="sr-only">Filter by Priority</label>
              <select
                id="priorityFilter"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="h-10 w-full sm:w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
              >
                <option value="All">All Priorities</option>
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt} Priority</option>
                ))}
              </select>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="sortBy" className="sr-only">Sort Leads</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 w-full sm:w-44 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f] cursor-pointer"
              >
                <option value="latest">Sort: Latest First</option>
                <option value="urgent">Sort: Urgent First</option>
                <option value="converted">Sort: Converted First</option>
              </select>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => { setSearch(''); setStatusFilter('All'); setPriorityFilter('All'); setSortBy('latest'); }}
              className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 text-sm font-semibold"
              title="Reset Filters"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e3a5f]" />
            <p className="mt-2 text-sm font-semibold">Loading your website leads...</p>
          </div>
        ) : leads.length === 0 ? (
          /* Empty State - No Leads Yet */
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
            <ClipboardList className="h-12 w-12 text-slate-300 mb-3" />
            <h4 className="text-base font-extrabold text-slate-800">No website leads yet.</h4>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">Website inquiries will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty State - No matching leads */
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
            <Search className="h-12 w-12 text-slate-300 mb-3" />
            <h4 className="text-base font-extrabold text-slate-800">No matching leads found</h4>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">No website inquiries matched your search or filters. Try adjusting them or resetting.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Lead Info</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Business details</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Requirements</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Estimate & Follow-up</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">CRM Badges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {sortedFilteredLeads.map((lead) => (
                    <tr 
                      key={lead.id} 
                      className="transition hover:bg-slate-50/80 cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      {/* Lead details */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 text-sm">{lead.full_name || '—'}</div>
                        <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-slate-500">{lead.mobile_number}</span>
                          <a
                            href={`https://wa.me/91${lead.mobile_number.replace(/\D/g, '').slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition hover:bg-[#25D366]/20"
                            title="Message on WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                            </svg>
                          </a>
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">Created: {new Date(lead.created_at).toLocaleDateString()}</div>
                      </td>
                      
                      {/* Business info */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-sm">{lead.business_name || '—'}</div>
                        {lead.business_type && (
                          <div className="text-xs text-slate-500 mt-0.5">Type: {lead.business_type}</div>
                        )}
                      </td>
                      
                      {/* Project scope */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-semibold text-slate-900">{lead.website_type || '—'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Budget: <span className="font-bold text-slate-700">{lead.budget_range || '—'}</span>
                        </div>
                        {lead.preferred_timeline && (
                          <div className="text-[10px] text-slate-400 mt-0.5">Timeline: {lead.preferred_timeline}</div>
                        )}
                      </td>

                      {/* Estimate and Follow-up */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-800">
                          Est: <span className="text-emerald-700">₹{lead.quotation_amount?.toLocaleString() || '0'}</span>
                        </div>
                        {lead.next_follow_up_date ? (
                          <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded px-1 mt-1 inline-block">
                            Followup: {new Date(lead.next_follow_up_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 mt-0.5">No followup scheduled</div>
                        )}
                      </td>
                      
                      {/* Badges */}
                      <td className="px-6 py-4 space-y-1.5">
                        <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${getStatusColor(lead.status || 'New')}`}>
                            {lead.status || 'New'}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold ${getPriorityColor(lead.priority || 'Medium')}`}>
                            {lead.priority || 'Medium'} Priority
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Stack View */}
            <div className="block lg:hidden divide-y divide-slate-100 bg-white">
              {sortedFilteredLeads.map((lead) => (
                <div 
                  key={lead.id} 
                  className="p-5 hover:bg-slate-50/50 transition cursor-pointer flex flex-col space-y-3"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{lead.full_name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Submitted: {new Date(lead.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${getStatusColor(lead.status || 'New')}`}>
                      {lead.status || 'New'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Business Name</p>
                      <p className="text-slate-800 mt-0.5">{lead.business_name || lead.business_type || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Website Type</p>
                      <p className="text-slate-800 mt-0.5">{lead.website_type || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Priority</p>
                      <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] mt-0.5 ${getPriorityColor(lead.priority || 'Medium')}`}>
                        {lead.priority || 'Medium'}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Quotation Est.</p>
                      <p className="text-emerald-700 mt-0.5">₹{lead.quotation_amount?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-slate-500 font-bold">{lead.mobile_number}</p>
                    <div className="flex gap-2">
                      <a
                        href={`https://wa.me/91${lead.mobile_number.replace(/\D/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition hover:bg-[#25D366]/20"
                        title="WhatsApp Message"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                        </svg>
                      </a>
                      <a
                        href={`tel:${lead.mobile_number}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                        title="Call"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CRM Lead Detail Modal */}
      <LeadDetailModal
        open={!!selectedLead}
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onSaved={fetchLeads}
      />
    </div>
  )
}
