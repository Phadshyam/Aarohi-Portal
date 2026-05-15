// src/context/ServicesContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ServicesContext = createContext(null)

export function ServicesProvider({ children }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, cost, cost_text, category_key, icon_key, is_active')
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (error) throw error
        if (mounted) setServices(data || [])
      } catch (err) {
        console.error('ServicesContext fetch error:', err)
        if (mounted) setError(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchServices()
    return () => { mounted = false }
  }, [])

  return (
    <ServicesContext.Provider value={{ services, loading, error }}>
      {children}
    </ServicesContext.Provider>
  )
}

export const useServices = () => useContext(ServicesContext)
