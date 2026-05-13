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
}) {
    const navigate = useNavigate()

    const iconSrc = dark ? DARK_ICON : LIGHT_ICON
    const wordmarkSrc = dark ? DARK_WORDMARK : LIGHT_WORDMARK

    const Wrapper = clickable ? 'button' : 'div'

    return (
        <Wrapper
            type={clickable ? 'button' : undefined}
            onClick={clickable ? () => navigate('/') : undefined}
            className="flex items-center gap-3 focus:outline-none"
        >
            <img
                src={iconSrc}
                alt="Logo"
                className="h-11 w-11 object-contain scale-[1.2]"
            />

            <img
                src={wordmarkSrc}
                alt="Aarohi Multiservices"
                className="h-9 w-auto object-contain"
            />
        </Wrapper>
    )
}