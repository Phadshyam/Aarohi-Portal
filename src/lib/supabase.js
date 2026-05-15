// src/lib/supabase.js
// ============================================
// Supabase Client - Single Instance
// Import this file everywhere you need DB
// NEVER create another client anywhere
// ============================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Missing Supabase environment variables.\n' +
    'Check your .env.local file has:\n' +
    'VITE_SUPABASE_URL=...\n' +
    'VITE_SUPABASE_ANON_KEY=...'
  )
}

// Create ONE single instance
// This is exported and reused everywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Store session in localStorage
    // So user stays logged in after refresh
    persistSession: true,
    // Auto refresh token before it expires
    autoRefreshToken: true,
    // Detect session from URL (for OTP links)
    detectSessionInUrl: true,
  }
})