// src/pages/public/TrackPage.jsx
import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { formatCurrency, formatDate } from '../../utils/helpers'

const looksLikeAppId = (value) => {
  const v = String(value || '').trim()
  if (!v) return false
  return /^ams-/i.test(v) || v.includes('-')
}

export default function TrackPage() {
  const [query, setQuery] = useState('')
  const [errorText, setErrorText] = useState('')

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [searched, setSearched] = useState(false)

  const normalized = useMemo(() => query.trim(), [query])

  const validate = () => {
    const v = normalized
    if (!v) {
      setErrorText('Please enter an Application ID or Phone Number.')
      return false
    }

    if (!looksLikeAppId(v)) {
      const digits = v.replace(/\D/g, '')
      if (digits.length !== 10) {
        setErrorText('Phone number must be exactly 10 digits.')
        return false
      }
    }

    setErrorText('')
    return true
  }

  const handleSearch = async (e) => {
    e?.preventDefault?.()
    if (!validate()) return

    const v = normalized
    const isId = looksLikeAppId(v)

    const searchId = isId ? v : null
    const searchPhone = isId ? null : v.replace(/\D/g, '').slice(0, 10)

    try {
      setLoading(true)
      setSearched(true)

      const { data, error } = await supabase.rpc('track_application', {
        search_id: searchId,
        search_phone: searchPhone,
      })

      if (error) throw error

      const list = Array.isArray(data) ? data : []
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setResults(list)
    } catch (err) {
      console.error('Track application error:', err)
      toast.error(err.message || 'Something went wrong')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl">
            {/* Search card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(2,6,23,0.10)] sm:p-8">
              <h1 className="text-2xl font-extrabold text-slate-900">
                Track Your Application
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Enter your Application ID or Phone Number to track
              </p>

              <form onSubmit={handleSearch} className="mt-6 space-y-4">
                <Input
                  label="Application ID / Phone Number"
                  id="query"
                  name="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Application ID or Phone Number"
                  error={errorText}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      Tracking...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Track
                    </span>
                  )}
                </Button>
              </form>
            </div>

            {/* Results */}
            <div className="mt-8">
              {loading ? (
                <div className="flex justify-center py-10">
                  <LoadingSpinner label="Searching..." />
                </div>
              ) : searched && results.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(2,6,23,0.08)]">
                  <p className="text-sm font-semibold text-slate-700">
                    No application found.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Please check your ID or phone number.
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((app) => (
                    <div
                      key={`${app.application_id}-${app.created_at}`}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(2,6,23,0.08)]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Application ID:{' '}
                            <span className="font-extrabold text-[#1e3a5f]">
                              {app.application_id}
                            </span>
                          </p>
                          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <p>
                              <span className="font-semibold text-slate-700">
                                Name:
                              </span>{' '}
                              {app.name}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">
                                Service:
                              </span>{' '}
                              {app.service_name}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">
                                Amount:
                              </span>{' '}
                              {(app.paid_amount !== null && app.paid_amount !== undefined) 
                                ? formatCurrency(app.paid_amount) 
                                : (app.cost !== null && app.cost !== undefined)
                                  ? formatCurrency(app.cost)
                                  : '₹0'
                              }
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">
                                Applied:
                              </span>{' '}
                              {formatDate(app.created_at)}
                            </p>
                            <p>
                              <span className="font-semibold text-slate-700">
                                Completed:
                              </span>{' '}
                              {app.completed_at ? formatDate(app.completed_at) : '—'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end sm:gap-2">
                          <Badge status={app.status}>{app.status}</Badge>
                          <Badge status={app.payment_status}>
                            {app.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
  )
}