// src/components/common/BrandLogo.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

const LIGHT_ICON =
    `${SUPABASE_URL}/storage/v1/object/public/branding/logo-icon.png`

const LIGHT_WORDMARK =
    `${SUPABASE_URL}/storage/v1/object/public/branding/logo-wordmark.png`

const DARK_ICON =
    `${SUPABASE_URL}/storage/v1/object/public/branding/logo-icon-dark.png`

const DARK_WORDMARK =
    `${SUPABASE_URL}/storage/v1/object/public/branding/logo-wordmark-dark.png`

export default function BrandLogo({
    
    dark = false,
    clickable = true,
    lightIcon,
    darkIcon,
    lightWordmark,
    darkWordmark,
  }) {
    const navigate = useNavigate()
  
    const iconSrc = (dark ? darkIcon : lightIcon) || null
    const wordmarkSrc = (dark ? darkWordmark : lightWordmark) || null
  
    const Wrapper = 'div'
  
    return (
      <div
        onClick={clickable ? () => navigate('/') : undefined}
        className="flex items-center gap-3 cursor-pointer"
      >
        {iconSrc && (
          <img src={iconSrc} className="h-11 w-11 object-contain" alt="logo icon" />
        )}

        {wordmarkSrc && (
          <img src={wordmarkSrc} className="h-9 w-auto object-contain" alt="logo text" />
        )}
      </div>
    )
  }