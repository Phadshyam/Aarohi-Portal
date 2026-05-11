// src/components/shared/ProtectedRoute.jsx
import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1e3a5f]" />
    </div>
  )
}

/**
 * ProtectedRoute
 * - Ensures user is authenticated (session + admin profile)
 * - Optionally restricts by role via allowedRoles (e.g. ['admin'])
 *
 * Usage:
 * <ProtectedRoute allowedRoles={['admin']}>...</ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  allowedRoles, // optional array: ['admin'] or ['admin','agent']
  redirectTo = '/admin/dashboard', // where to go if authenticated but not allowed
}) {
  const location = useLocation()
  const auth = useAuth()

  const authReady = auth?.authReady
  const session = auth?.session
  const admin = auth?.admin
  const isAuthenticated = auth?.isAuthenticated
  const profileLoading = auth?.profileLoading || false

  // Wait until we know auth state
  if (!authReady) return <FullPageLoader />

  // If session exists but admin profile still loading/not ready, wait
  if (session && (!admin || profileLoading)) return <FullPageLoader />

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname || '/admin/dashboard' }}
      />
    )
  }

  // Role restriction
  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = String(admin?.role || '').toLowerCase()
    const allowed = allowedRoles.map((r) => String(r).toLowerCase())
    if (!allowed.includes(role)) {
      return <Navigate to={redirectTo} replace />
    }
  }

  return children ?? <Outlet />
}