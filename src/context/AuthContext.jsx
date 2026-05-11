// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const isDev = import.meta.env.DEV

  const [authReady, setAuthReady] = useState(false)

  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)

  const [admin, setAdmin] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Used to avoid showing "Session expired" toast on manual logout
  const manualLogoutRef = useRef(false)

  // Track & cancel the expiry timer correctly
  const expiryTimerRef = useRef(null)

  const fetchAdminProfile = async () => {
    const { data, error } = await supabase.rpc('get_admin_profile')
    if (error) throw error
    if (!data?.success) throw new Error(data?.message || 'Not authorized')
    return data
  }

  const safeLoadAdminProfile = async () => {
    try {
      setProfileLoading(true)

      const data = await fetchAdminProfile()
      setAdmin({
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
      })
    } catch (err) {
      console.error('safeLoadAdminProfile error:', err)
      setAdmin(null)

      // Show useful message and sign out (invalid admin session)
      toast.error(err.message || 'Not authorized')

      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.error('signOut error:', e)
      }
    } finally {
      setProfileLoading(false)
    }
  }

  // Auto sign-out when session expires (JWT expiry is your 3-hour rule)
  useEffect(() => {
    // clear old timer
    if (expiryTimerRef.current) {
      window.clearTimeout(expiryTimerRef.current)
      expiryTimerRef.current = null
    }

    if (!session?.expires_at) return

    const ms = session.expires_at * 1000 - Date.now()

    if (ms <= 0) {
      // already expired
      supabase.auth.signOut()
      return
    }

    expiryTimerRef.current = window.setTimeout(async () => {
      try {
        // Avoid showing "expired" message when the user explicitly logs out
        if (!manualLogoutRef.current) {
          toast.error('Session expired. Please login again.')
        }
        await supabase.auth.signOut()
      } catch (e) {
        console.error('Auto signOut error:', e)
      }
    }, ms)

    return () => {
      if (expiryTimerRef.current) {
        window.clearTimeout(expiryTimerRef.current)
        expiryTimerRef.current = null
      }
    }
  }, [session?.expires_at])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        if (!mounted) return

        const nextSession = data?.session || null
        setSession(nextSession)
        setUser(nextSession?.user || null)

        // Mark ready immediately
        setAuthReady(true)

        if (nextSession) {
          void safeLoadAdminProfile()
        }
      } catch (err) {
        console.error('Auth init error:', err)
        if (mounted) setAuthReady(true)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (isDev) console.log('onAuthStateChange:', event)

      setSession(nextSession)
      setUser(nextSession?.user || null)
      setAuthReady(true)

      if (event === 'SIGNED_OUT') {
        setAdmin(null)
        setProfileLoading(false)
        return
      }

      // Only load profile when a real session is established
      if (event === 'SIGNED_IN' && nextSession) {
        void safeLoadAdminProfile()
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [isDev])

  const logout = async () => {
    try {
      manualLogoutRef.current = true
      await supabase.auth.signOut()
      setAdmin(null)
    } catch (err) {
      console.error('logout error:', err)
      toast.error(err.message || 'Failed to logout')
    } finally {
      // reset after a tick (so auto-expiry toast won't show)
      window.setTimeout(() => {
        manualLogoutRef.current = false
      }, 250)
    }
  }

  const value = useMemo(
    () => ({
      authReady,
      profileLoading,

      session,
      user,
      admin,

      isAuthenticated: Boolean(session && admin),

      fetchAdminProfile,
      logout,
    }),
    [authReady, profileLoading, session, user, admin]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}