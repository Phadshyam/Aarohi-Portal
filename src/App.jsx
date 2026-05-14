// src/App.jsx
import React, { Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

const modules = import.meta.glob('./**/*.jsx')

const makePlaceholder = (title) => {
  const Placeholder = () => (
    <div className="min-h-[60vh] w-full px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">
          Placeholder (will be replaced when file is created)
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          This route is wired up. The page/component file isn’t generated yet.
        </p>
      </div>
    </div>
  )
  Placeholder.displayName = `${title}Placeholder`
  return Placeholder
}

const lazyFromGlob = (path, fallbackComponent) => {
  const loader = modules[path]
  if (!loader) return fallbackComponent
  return React.lazy(loader)
}

const AppLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1e3a5f]" />
  </div>
)

// Components (lazy when they exist; placeholders otherwise)
const Header = lazyFromGlob(
  './components/layout/Header.jsx',
  makePlaceholder('Header')
)

const ProtectedRoute = lazyFromGlob(
  './components/shared/ProtectedRoute.jsx',
  ({ children }) => children ?? <Outlet />
)

const AdminLayout = lazyFromGlob(
  './components/layout/AdminLayout.jsx',
  () => (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h1 className="text-lg font-semibold text-slate-900">
            AdminLayout (placeholder)
          </h1>
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
)

// Public pages
const HomePage = lazyFromGlob(
  './pages/public/HomePage.jsx',
  makePlaceholder('HomePage')
)
const ApplyPage = lazyFromGlob(
  './pages/public/ApplyPage.jsx',
  makePlaceholder('ApplyPage')
)
const TrackPage = lazyFromGlob(
  './pages/public/TrackPage.jsx',
  makePlaceholder('TrackPage')
)

// Admin pages
const LoginPage = lazyFromGlob(
  './pages/admin/LoginPage.jsx',
  makePlaceholder('LoginPage')
)
const DashboardPage = lazyFromGlob(
  './pages/admin/DashboardPage.jsx',
  makePlaceholder('DashboardPage')
)
const ApplicationsPage = lazyFromGlob(
  './pages/admin/ApplicationsPage.jsx',
  makePlaceholder('ApplicationsPage')
)
const AddApplicationPage = lazyFromGlob(
  './pages/admin/AddApplicationPage.jsx',
  makePlaceholder('AddApplicationPage')
)
const ServicePortalsPage = lazyFromGlob(
  './pages/admin/ServicePortalsPage.jsx',
  makePlaceholder('ServicePortalsPage')
)
const RevenuePage = lazyFromGlob(
  './pages/admin/RevenuePage.jsx',
  makePlaceholder('RevenuePage')
)
const ServicesPage = lazyFromGlob(
  './pages/admin/ServicesPage.jsx',
  makePlaceholder('ServicesPage')
)
const AgentsPage = lazyFromGlob(
  './pages/admin/AgentsPage.jsx',
  makePlaceholder('AgentsPage')
)
const SettingsPage = lazyFromGlob(
  './pages/admin/SettingsPage.jsx',
  makePlaceholder('SettingsPage')
)

function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <>
    <Suspense fallback={<AppLoading />}>
      <Routes>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/track" element={<TrackPage />} />
        </Route>

        {/* ADMIN AUTH */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* ADMIN (PROTECTED) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="add" element={<AddApplicationPage />} />

          {/* Admin-only routes */}
          <Route
            path="revenue"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/dashboard">
                <RevenuePage />
              </ProtectedRoute>
            }
          />
          {/* Admin-only route */}
          <Route
            path="service-portals"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/dashboard">
                <ServicePortalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="agents"
            element={
              <ProtectedRoute allowedRoles={['admin']} redirectTo="/admin/dashboard">
                <AgentsPage />
              </ProtectedRoute>
            }
          />

          {/* Staff (admin/agent) view allowed; actions restricted by UI + RLS */}
          <Route path="services" element={<ServicesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        className:
          '!rounded-xl !border !border-slate-200/90 !bg-white !px-4 !py-3 !text-sm !font-medium !text-slate-800 !shadow-[0_10px_40px_rgba(15,23,42,0.12)]',
        style: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
      }}
    />
    </>
  )
}