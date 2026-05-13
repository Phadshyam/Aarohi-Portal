// src/pages/admin/LoginPage.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import BrandLogo from '../../components/common/BrandLogo'
import { Eye, EyeOff, Loader2, AlertCircle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@supabase/supabase-js'

import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const TRUST_HOURS = 3
const TRUST_MS = TRUST_HOURS * 60 * 60 * 1000

const trustKey = (email) => `ams_trusted_until_${String(email || '').toLowerCase()}`

function getTrustedUntil(email) {
  try {
    const raw = window.localStorage.getItem(trustKey(email))
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function setTrustedUntil(email, untilMs) {
  try {
    window.localStorage.setItem(trustKey(email), String(untilMs))
  } catch {
    // ignore
  }
}

function parseCooldownSeconds(message) {
  const m = String(message || '').match(/after\s+(\d+)\s+seconds/i)
  return m ? Number(m[1]) : 45
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, authReady, admin, logout, profileLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  const [isLoading, setIsLoading] = useState(false)

  // popup error
  const [errorMsg, setErrorMsg] = useState('')
  const [showError, setShowError] = useState(false)
  const [errorTitle, setErrorTitle] = useState('Login Failed')
  const [showEnterOtpAction, setShowEnterOtpAction] = useState(false)

  // inline instruction note
  const [statusNote, setStatusNote] = useState('')

  // otp
  const [otpSent, setOtpSent] = useState(false)
  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef([])
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  // prevent double triggers
  const inFlightRef = useRef(false)

  const cleanEmail = useMemo(() => String(email || '').trim().toLowerCase(), [email])
  const trustedUntil = useMemo(
    () => (typeof window !== 'undefined' && cleanEmail ? getTrustedUntil(cleanEmail) : 0),
    [cleanEmail]
  )
  const trustValid = trustedUntil && trustedUntil > Date.now()

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [])

  const openPopup = ({ title, message, showEnterOtp = false }) => {
    setErrorTitle(title || 'Login Failed')
    setErrorMsg(message || 'Something went wrong.')
    setShowEnterOtpAction(Boolean(showEnterOtp))
    setShowError(true)
  }

  const startCountdown = (seconds) => {
    const s = Math.max(1, Number(seconds || 30))
    if (timerRef.current) window.clearInterval(timerRef.current)
    setCountdown(s)

    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current)
          timerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const resetOtp = () => {
    setOtpBoxes(['', '', '', '', '', ''])
    window.setTimeout(() => otpRefs.current?.[0]?.focus?.(), 0)
  }

  const handleOtpChange = (index, value) => {
    const digit = String(value || '').replace(/\D/g, '').slice(-1)
    setOtpBoxes((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < 5) otpRefs.current?.[index + 1]?.focus?.()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otpBoxes[index]) {
        setOtpBoxes((prev) => {
          const next = [...prev]
          next[index] = ''
          return next
        })
        return
      }
      if (index > 0) {
        otpRefs.current?.[index - 1]?.focus?.()
        setOtpBoxes((prev) => {
          const next = [...prev]
          next[index - 1] = ''
          return next
        })
      }
    }
  }

  const handleOtpPaste = (e) => {
    const text = e.clipboardData.getData('text')
    const digits = String(text || '').replace(/\D/g, '').slice(0, 6)
    if (!digits) return
    e.preventDefault()

    const arr = digits.split('')
    setOtpBoxes((prev) => {
      const next = [...prev]
      for (let i = 0; i < 6; i++) next[i] = arr[i] || ''
      return next
    })

    const nextIndex = Math.min(digits.length, 5)
    window.setTimeout(() => otpRefs.current?.[nextIndex]?.focus?.(), 0)
  }

  const verifyAdminAccess = async () => {
    const { data: verifyData, error: verifyError } = await supabase.rpc('verify_admin_login', {
      check_email: cleanEmail,
    })
    if (verifyError) throw verifyError
    if (!verifyData?.success) {
      throw new Error(verifyData?.message || 'This email is not authorized')
    }
  }

  // Password verification WITHOUT creating a persistent/broadcasting session
  const verifyPasswordWithoutSession = async () => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY

    // In-memory storage so temp client cannot affect main client
    const memoryStorage = {
      getItem: () => null,
      setItem: () => { },
      removeItem: () => { },
    }

    const temp = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: `temp-auth-${Date.now()}`,
        storage: memoryStorage,
      },
    })

    const { error } = await temp.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })

    try {
      await temp.auth.signOut()
    } catch {
      // ignore
    }

    if (error) {
      if (String(error.message || '').includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.')
      }
      throw error
    }
  }

  const passwordLoginOnly = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    })
    if (error) {
      if (String(error.message || '').includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.')
      }
      throw error
    }
  }

  const requestOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email: cleanEmail })

    if (error) {
      const msg = String(error.message || '')
      const is429 =
        error.status === 429 ||
        msg.toLowerCase().includes('rate limit') ||
        msg.toLowerCase().includes('email rate limit exceeded') ||
        msg.toLowerCase().includes('too many') ||
        msg.toLowerCase().includes('after')

      if (is429) {
        const seconds = parseCooldownSeconds(msg)
        setOtpSent(true)
        resetOtp()
        startCountdown(seconds)

        const helpText =
          `OTP request limit reached.\n\n` +
          `Reason: Email OTP sending is temporarily blocked for security.\n\n` +
          `What you can do:\n` +
          `• Wait ${seconds}s and try “Resend OTP”\n` +
          `• If you already received an OTP email, enter it below\n` +
          `• Check Spam/Junk folder`

        setStatusNote(
          `OTP rate limit reached. Please wait ${seconds}s to resend. If you already received an OTP, enter it below.`
        )
        openPopup({ title: 'OTP Rate Limited', message: helpText, showEnterOtp: true })
        return
      }

      throw error
    }

    setOtpSent(true)
    resetOtp()
    startCountdown(30)
    setStatusNote('OTP sent. Please check your email (Inbox/Spam) and enter the 6-digit code.')
    toast.success('OTP sent to your email!')
  }

  const handleLogin = async () => {
    if (!cleanEmail)
      return openPopup({ title: 'Missing Email', message: 'Please enter your User ID (email).' })
    if (!password)
      return openPopup({ title: 'Missing Password', message: 'Please enter your password.' })

    if (inFlightRef.current) return
    inFlightRef.current = true

    setIsLoading(true)
    setStatusNote('')

    try {
      await verifyAdminAccess()

      if (trustValid) {
        await passwordLoginOnly()
        return
      }

      await verifyPasswordWithoutSession()
      await requestOtp()
    } catch (err) {
      console.error('Login error:', err)
      openPopup({
        title: 'Login Failed',
        message: err.message || 'Something went wrong. Please try again.',
      })
    } finally {
      setIsLoading(false)
      inFlightRef.current = false
    }
  }

  const handleVerifyOtp = async () => {
    const token = otpBoxes.join('')
    if (token.length !== 6) return toast.error('Enter complete 6-digit OTP')

    try {
      setIsLoading(true)
      setStatusNote('Verifying OTP...')

      const { error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: 'email',
      })

      if (error) {
        toast.error('Invalid or expired OTP')
        setStatusNote('Invalid/expired OTP. Please try again or resend OTP.')
        return
      }

      setTrustedUntil(cleanEmail, Date.now() + TRUST_MS)
      toast.success(`Login successful! Trusted for ${TRUST_HOURS} hours.`)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      console.error('Verify OTP error:', err)
      toast.error(err.message || 'Something went wrong')
      setStatusNote(err.message || 'Verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown !== 0) return

    if (inFlightRef.current) return
    inFlightRef.current = true

    try {
      setIsLoading(true)
      setStatusNote('Requesting a new OTP...')
      await requestOtp()
    } catch (err) {
      console.error('Resend OTP error:', err)
      openPopup({ title: 'OTP Error', message: err.message || 'Failed to resend OTP.' })
    } finally {
      setIsLoading(false)
      inFlightRef.current = false
    }
  }

  const trustHint = useMemo(() => {
    if (!trustValid) return ''
    const dt = new Date(trustedUntil)
    return `Trusted until ${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (OTP not required)`
  }, [trustValid, trustedUntil])

  // NEW UX: if already logged in, show an informative screen instead of instant redirect
  if (authReady && (isAuthenticated || profileLoading)) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Header />

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-[0_22px_55px_rgba(2,6,23,0.12)]">
            <div className="px-6 pt-6">
              <BrandLogo clickable={false} />
            </div>

            <p className="mt-3 text-center text-sm font-semibold text-slate-500">
              {profileLoading
                ? 'Loading your profile...'
                : `Signed in as ${admin?.email || 'your account'}`}
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-slate-500" />
                <p className="leading-relaxed">
                  To login with a different account, please logout or open an Incognito/Private window.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1e3a5f] text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f]"
              >
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logout()
                  // clear local UI state
                  setOtpSent(false)
                  setStatusNote('')
                  setEmail('')
                  setPassword('')
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Logout & Switch Account
              </button>
            </div>
          </div>
        </div>

        <footer className="pb-8 text-center text-sm text-slate-400">
          © 2026 Aarohi Multiservices. All rights reserved.
        </footer>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Popup */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-slate-900">{errorTitle}</h2>

            <pre className="mt-3 whitespace-pre-wrap text-center text-sm leading-relaxed text-slate-600">
              {errorMsg}
            </pre>

            <div className="mt-6 flex flex-col gap-3">
              {showEnterOtpAction ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowError(false)
                    setOtpSent(true)
                    resetOtp()
                  }}
                  className="w-full rounded-lg bg-white py-2.5 text-sm font-semibold text-[#1e3a5f] ring-1 ring-slate-200 hover:bg-slate-50"
                >
                  I already have OTP
                </button>
              ) : null}

              <button
                type="button"
                onClick={() => setShowError(false)}
                className="w-full rounded-lg bg-[#1e3a5f] py-2.5 text-sm font-semibold text-white transition hover:bg-[#16304f]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />

      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-[0_22px_55px_rgba(2,6,23,0.12)]">
          <h1 className="text-center text-3xl font-extrabold text-slate-900">Admin Login</h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-500">
            Login using your registered email and password
          </p>

          {trustHint ? (
            <p className="mt-4 text-center text-xs font-semibold text-emerald-700">{trustHint}</p>
          ) : null}

          {statusNote ? (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <Info className="mt-0.5 h-4 w-4 text-slate-500" />
              <p className="leading-relaxed">{statusNote}</p>
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">User ID</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || otpSent}
                placeholder="Enter your email"
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading || otpSent}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading || otpSent}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1e3a5f] text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isLoading && !otpSent ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Please wait...
                </span>
              ) : trustValid ? (
                'Login'
              ) : (
                'Send OTP'
              )}
            </button>

            {otpSent ? (
              <div className="pt-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">OTP</label>

                <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                  {otpBoxes.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpRefs.current[idx] = el)}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      inputMode="numeric"
                      maxLength={1}
                      disabled={isLoading}
                      className="h-12 w-12 rounded-lg border border-slate-200 bg-white text-center text-lg font-semibold text-slate-900 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 disabled:bg-slate-50"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1e3a5f] text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify & Login'
                  )}
                </button>

                <div className="mt-5 text-center text-sm text-slate-500">
                  <span>Didn’t receive OTP? </span>
                  {countdown === 0 ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-semibold text-[#1e3a5f] hover:underline"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span>
                      <span className="font-semibold text-[#1e3a5f]">Resend</span> in {countdown}s
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <footer className="pb-8 text-center text-sm text-slate-400">
        © 2026 Aarohi Multiservices. All rights reserved.
      </footer>
    </div>
  )
}