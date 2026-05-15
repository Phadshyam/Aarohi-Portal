// src/context/BrandingContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BrandingContext = createContext(null)

export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState({
    business_name: 'Aarohi Multiservices',
    contact: '',
    email: '',
    logo_icon_url: '',
    logo_wordmark_url: '',
    logo_icon_dark_url: '',
    logo_wordmark_dark_url: '',
    homepage_category_order: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const fetchBranding = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_branding')
        if (error) throw error
        if (mounted && data) {
          let parsedOrder = []
          if (Array.isArray(data.homepage_category_order)) {
            parsedOrder = data.homepage_category_order
          } else if (typeof data.homepage_category_order === 'string') {
            try {
              const parsed = JSON.parse(data.homepage_category_order)
              if (Array.isArray(parsed)) parsedOrder = parsed
            } catch (e) {
              parsedOrder = []
            }
          }

          setBranding({
            business_name: data.business_name || 'Aarohi Multiservices',
            contact: data.contact || '',
            email: data.email || '',
            logo_icon_url: data.logo_icon_url || '',
            logo_wordmark_url: data.logo_wordmark_url || '',
            logo_icon_dark_url: data.logo_icon_dark_url || '',
            logo_wordmark_dark_url: data.logo_wordmark_dark_url || '',
            homepage_category_order: parsedOrder,
          })
        }
      } catch (e) {
        console.error('BrandingContext fetch error:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchBranding()
    return () => { mounted = false }
  }, [])

  return (
    <BrandingContext.Provider value={{ branding, loading }}>
      {children}
    </BrandingContext.Provider>
  )
}

export const useBranding = () => useContext(BrandingContext)
