// src/pages/admin/AddApplicationPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronDown, Loader2 } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
export default function AddApplicationPage() {
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    serviceId: '',
    amount: '',
  })
  const [errors, setErrors] = useState({})
  const [creating, setCreating] = useState(false)

  const selectedService = useMemo(() => {
    if (!form.serviceId) return null
    return services.find((s) => s.id === form.serviceId) || null
  }, [form.serviceId, services])

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
        toast.error(err.message || 'Failed to load services')
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

    if (!form.serviceId) {
      next.serviceId = 'Please select a service'
    } else {
      if (form.amount === '') {
        next.amount = 'Amount is required'
      } else if (Number(form.amount) < 0 || isNaN(Number(form.amount))) {
        next.amount = 'Please enter a valid positive amount'
      }
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const resetForm = () => {
    setForm({ name: '', phone: '', serviceId: '', amount: '' })
    setErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    if (!selectedService) return toast.error('Please select a service')

    try {
      setCreating(true)

      const numericCost = Number(form.amount)
      const costValue = form.amount !== '' && Number.isFinite(numericCost) ? numericCost : null
      const costTextSnapshot = costValue !== null ? String(costValue) : null

      const { data, error } = await supabase
        .from('applications')
        .insert({
          name: form.name.trim(),
          phone: form.phone.replace(/\D/g, '').slice(0, 10),
          service_id: selectedService.id,
          service_name: selectedService.name,

          cost: costValue,
          cost_text: costTextSnapshot,

          source: 'offline',
        })
        .select()
        .single()

      if (error) throw error

      toast.success(`Application created! ID: ${data.application_id}`)
      resetForm()
      navigate('/admin/applications')
    } catch (err) {
      console.error('Create application error:', err)
      toast.error(err.message || 'Failed to create application')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-slate-900">Add New Application</h1>

      <div className="mt-10 flex justify-center">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white px-10 py-10 shadow-[0_22px_55px_rgba(2,6,23,0.12)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Name"
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter your name"
              error={errors.name}
            />

            <Input
              label="Phone"
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Enter mobile number"
              error={errors.phone}
              inputMode="numeric"
            />

            {/* Service */}
            <div>
              <label htmlFor="serviceId" className="mb-2 block text-sm font-semibold text-slate-700">
                Service
              </label>

              <div className="relative">
                <select
                  id="serviceId"
                  name="serviceId"
                  value={form.serviceId}
                  onChange={(e) => {
                    const newServiceId = e.target.value
                    let newAmount = ''
                    if (newServiceId) {
                      const s = services.find((srv) => srv.id === newServiceId)
                      if (s && s.cost !== null && s.cost !== undefined) {
                        const n = Number(s.cost)
                        if (Number.isFinite(n) && n >= 0) {
                          newAmount = String(n)
                        }
                      }
                    }
                    setForm((p) => ({ ...p, serviceId: newServiceId, amount: newAmount }))
                  }}
                  disabled={servicesLoading || creating}
                  className={[
                    'h-11 w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 shadow-sm',
                    'focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20',
                    servicesLoading || creating ? 'bg-slate-50 text-slate-500' : '',
                    errors.serviceId
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : '',
                  ].join(' ')}
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

                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>

              {errors.serviceId ? (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.serviceId}</p>
              ) : null}
            </div>

            <Input
              label="Application Amount"
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                  setForm((p) => ({ ...p, amount: val }));
                }
              }}
              placeholder="Enter amount"
              error={errors.amount}
            />

            <div className="pt-4">
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button type="submit" disabled={creating || servicesLoading}>
                  {creating ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Application'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/admin/applications')}
                  disabled={creating}
                >
                  Close
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}