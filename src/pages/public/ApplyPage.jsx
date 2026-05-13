// src/pages/public/ApplyPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronDown, FileText, Loader2 } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { supabasePublic } from '../../lib/supabasePublic'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { formatCurrency } from '../../utils/helpers'

const toErrorMessage = (err) => {
  if (!err) return 'Unknown error'
  if (typeof err === 'string') return err
  const msg =
    err.message ||
    err.error_description ||
    err.details ||
    err.hint ||
    'Something went wrong'
  const code = err.code ? ` (code: ${err.code})` : ''
  return `${msg}${code}`
}

function getServiceCostDisplay(service) {
  const t = String(service?.cost_text || '').trim()
  if (t) return t

  const n = Number(service?.cost)
  if (Number.isFinite(n)) return formatCurrency(n)

  return '—'
}

export default function ApplyPage() {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const preselectAppliedRef = useRef(false)

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [successApp, setSuccessApp] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceId: '',
  })
  const [errors, setErrors] = useState({})

  const selectedService = useMemo(() => {
    if (!form.serviceId) return null
    return services.find((s) => s.id === form.serviceId) || null
  }, [form.serviceId, services])

  useEffect(() => {
    if (preselectAppliedRef.current) return
    if (!services || services.length === 0) return

    const serviceId = searchParams.get('serviceId')
    if (!serviceId) return

    const exists = services.some((s) => s.id === serviceId)
    if (exists) {
      setForm((p) => ({ ...p, serviceId }))
      preselectAppliedRef.current = true
    }
  }, [services, searchParams, setForm])

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true)

        const { data, error } = await supabase
          .from('services')
          .select('id, name, cost, cost_text')
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) throw error
        setServices(data || [])
      } catch (err) {
        console.error('Error fetching services:', err)
        toast.error(toErrorMessage(err))
      } finally {
        setServicesLoading(false)
      }
    }

    fetchServices()
  }, [])

  const validate = () => {
    const next = {}

    const name = form.name.trim()
    const phoneDigits = form.phone.replace(/\D/g, '')

    if (!name) next.name = 'Name is required'
    else if (name.length < 2) next.name = 'Name must be at least 2 characters'

    if (!form.phone.trim()) next.phone = 'Phone is required'
    else if (phoneDigits.length !== 10) next.phone = 'Phone must be exactly 10 digits'

    if (!form.serviceId) next.serviceId = 'Please select a service'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const resetForm = () => {
    setForm({ name: '', phone: '', serviceId: '' })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')

    try {
      if (!validate()) return
      if (!selectedService) {
        toast.error('Please select a service')
        return
      }

      setSubmitting(true)

      const numericCost = Number(selectedService.cost)
      const costValue = Number.isFinite(numericCost) ? numericCost : null

      const serviceCostText = String(selectedService.cost_text || '').trim()
      const costTextSnapshot = serviceCostText
        ? serviceCostText
        : costValue !== null
          ? String(costValue)
          : null

      const insertPayload = {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, '').slice(0, 10),

        service_id: selectedService.id,
        service_name: selectedService.name,

        // Do NOT default to 0
        cost: costValue,
        cost_text: costTextSnapshot,

        source: 'online',
      }

      // 1) Insert
      const { error: insertError } = await supabasePublic
        .from('applications')
        .insert(insertPayload)

      if (insertError) throw insertError

      // 2) Fetch latest application for this phone via RPC
      const phoneDigits = insertPayload.phone

      const { data: tracked, error: trackError } = await supabasePublic.rpc(
        'track_application',
        { search_id: null, search_phone: phoneDigits }
      )

      if (trackError) throw trackError

      const latest = Array.isArray(tracked) && tracked.length > 0 ? tracked[0] : null
      if (!latest?.application_id) {
        setSuccessApp({ application_id: '—' })
      } else {
        setSuccessApp({ application_id: latest.application_id })
      }

      resetForm()
    } catch (err) {
      console.error('Submit application error:', err)
      const msg = toErrorMessage(err)
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const costText = selectedService ? getServiceCostDisplay(selectedService) : '—'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(2,6,23,0.10)] sm:p-8">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <FileText className="h-5 w-5 text-[#1e3a5f]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900">
                  Apply for a Service
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Fill the form below to submit your application.
                </p>
              </div>
            </div>

            {submitError ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-extrabold text-red-800">Submission failed</p>
                <p className="mt-1 text-sm font-semibold text-red-700">{submitError}</p>
              </div>
            ) : null}

            {successApp ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-emerald-900">
                  Your application has been submitted!
                </p>
                <p className="mt-2 text-sm text-emerald-900">
                  <span className="font-semibold">Application ID:</span>{' '}
                  <span className="font-extrabold">{successApp.application_id}</span>
                </p>
                <p className="mt-2 text-sm text-emerald-800">
                  Save this ID to track your application.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button onClick={() => navigate('/track')} className="w-full sm:w-auto">
                    Track Application
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setSuccessApp(null)}
                    className="w-full sm:w-auto"
                  >
                    Submit Another
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <Input
                  label="Name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your name"
                  error={errors.name}
                  autoComplete="name"
                />

                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="Enter mobile number"
                  error={errors.phone}
                  inputMode="numeric"
                  autoComplete="tel"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Service
                  </label>
                  <div className="relative">
                    <select
                      value={form.serviceId}
                      onChange={(e) => setForm((p) => ({ ...p, serviceId: e.target.value }))}
                      className={[
                        'w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900',
                        'border-slate-200 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20',
                        errors.serviceId
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                          : '',
                        servicesLoading ? 'bg-slate-50 text-slate-500' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      disabled={servicesLoading}
                    >
                      <option value="">
                        {servicesLoading ? 'Loading services...' : 'Select Service'}
                      </option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                  {errors.serviceId ? (
                    <p className="mt-1 text-xs font-medium text-red-600">{errors.serviceId}</p>
                  ) : null}
                </div>

                <Input
                  label="Cost / Fees"
                  value={costText}
                  readOnly
                  hint="Auto-fetched from service"
                  inputClassName="bg-slate-50 text-slate-700"
                />

                <Button type="submit" className="w-full" disabled={submitting || servicesLoading}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>

                <p className="text-center text-xs text-slate-500">
                  After submitting, you’ll receive an Application ID for tracking.
                </p>
              </form>
            )}
          </div>
        </div>
    </div>
  )
}