// src/lib/supabasePublic.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// In-memory storage so this client never touches localStorage/session
const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storage: memoryStorage,
    storageKey: 'ams-public-no-session',
  },
})