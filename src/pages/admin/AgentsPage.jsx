// src/pages/admin/AgentsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, X } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import ModalShell from '../../components/common/ModalShell'


function isValidEmail(email) {
  const v = String(email || '').trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function AgentRoleBadge({ role }) {
  const r = String(role || '').toLowerCase()
  if (r === 'admin') {
    return (
      <Badge color="bg-indigo-100 text-indigo-700 border border-indigo-200">
        Admin
      </Badge>
    )
  }
  return (
    <Badge color="bg-amber-100 text-amber-800 border border-amber-200">
      Agent
    </Badge>
  )
}

function AgentStatusBadge({ active }) {
  return active ? (
    <Badge color="bg-emerald-100 text-emerald-800 border border-emerald-200">
      Active
    </Badge>
  ) : (
    <Badge color="bg-slate-100 text-slate-700 border border-slate-200">
      Inactive
    </Badge>
  )
}

export default function AgentsPage() {
  const { admin } = useAuth()
  const isAdmin = String(admin?.role || '').toLowerCase() === 'admin'

  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState([])

  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  // Add form
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [addInfo, setAddInfo] = useState(null) // { email, password }

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
  })

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_all_agents')
      if (error) throw error
      setAgents(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Fetch agents error:', err)
      toast.error(err.message || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Page is admin-only via routing, but keep a defensive check.
    if (isAdmin) fetchAgents()
    else setLoading(false)
  }, [isAdmin])

  const openAdd = () => {
    if (!isAdmin) {
      toast.error('Only admin can manage agents')
      return
    }
    setAddForm({ name: '', email: '', phone: '', password: '' })
    setAddInfo(null)
    setAddOpen(true)
  }

  const openEdit = (agent) => {
    if (!isAdmin) {
      toast.error('Only admin can manage agents')
      return
    }
    setSelected(agent)
    setEditForm({
      name: agent?.name || '',
      phone: agent?.phone || '',
    })
    setEditOpen(true)
  }

  const toggleActive = async (agent) => {
    if (!isAdmin) {
      toast.error('Only admin can manage agents')
      return
    }

    try {
      setTogglingId(agent.id)

      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !agent.is_active })
        .eq('id', agent.id)

      if (error) throw error
      await fetchAgents()
    } catch (err) {
      console.error('Toggle agent error:', err)
      toast.error(err.message || 'Failed to update agent')
    } finally {
      setTogglingId(null)
    }
  }

  const handleAddAgent = async () => {
    if (!isAdmin) {
      toast.error('Only admin can manage agents')
      return
    }

    const name = addForm.name.trim()
    const email = addForm.email.trim().toLowerCase()
    const phoneDigits = addForm.phone.replace(/\D/g, '')
    const password = String(addForm.password || '').trim()

    if (!name || name.length < 2) return toast.error('Full Name is required')
    if (!isValidEmail(email)) return toast.error('Enter a valid email')
    if (phoneDigits.length !== 10) return toast.error('Phone must be exactly 10 digits')
    if (!password || password.length < 6)
      return toast.error('Password must be at least 6 characters')

    try {
      setSaving(true)

      const insertPayload = {
        name,
        email,
        phone: phoneDigits,
        role: 'agent',
        is_active: true,
        ...(admin?.id ? { added_by: admin.id } : {}),
      }

      const { data, error } = await supabase
        .from('admin_users')
        .insert(insertPayload)
        .select()
        .single()

      if (error) throw error

      toast.success('Agent added!')
      await fetchAgents()

      setAddInfo({ email, password })
      setSelected(data)
    } catch (err) {
      console.error('Add agent error:', err)
      toast.error(err.message || 'Failed to add agent')
    } finally {
      setSaving(false)
    }
  }

  const handleEditSave = async () => {
    if (!isAdmin) {
      toast.error('Only admin can manage agents')
      return
    }
    if (!selected?.id) return

    const name = editForm.name.trim()
    const phoneDigits = editForm.phone.replace(/\D/g, '')

    if (!name || name.length < 2) return toast.error('Name is required')
    if (phoneDigits.length !== 10) return toast.error('Phone must be exactly 10 digits')

    try {
      setSaving(true)

      const { error } = await supabase
        .from('admin_users')
        .update({ name, phone: phoneDigits })
        .eq('id', selected.id)

      if (error) throw error

      toast.success('Agent updated!')
      setEditOpen(false)
      setSelected(null)
      await fetchAgents()
    } catch (err) {
      console.error('Edit agent error:', err)
      toast.error(err.message || 'Failed to update agent')
    } finally {
      setSaving(false)
    }
  }

  const rows = useMemo(() => agents, [agents])

  // If somehow an agent lands here (deep link), show a friendly message.
  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-lg font-extrabold text-amber-900">Access restricted</h1>
        <p className="mt-2 text-sm font-semibold text-amber-900">
          Only admins can manage agents.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-extrabold text-slate-900">Agents Management</h1>

        <button
          type="button"
          onClick={openAdd}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/25"
        >
          <Plus className="h-4 w-4" />
          Add Agent
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(2,6,23,0.12)]">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full">
            <thead>
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-5 text-left text-lg font-extrabold text-slate-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="flex justify-center">
                      <LoadingSpinner label="Loading agents..." />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16">
                    <div className="text-center">
                      <p className="text-sm font-extrabold text-slate-700">
                        No agents added yet.
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Click + Add Agent to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((a) => (
                  <tr key={a.id}>
                    <td className="px-6 py-5 text-base font-extrabold text-slate-900">
                      {a.name}
                    </td>
                    <td className="px-6 py-5 text-base font-semibold text-slate-700">
                      {a.email}
                    </td>
                    <td className="px-6 py-5 text-base font-semibold text-slate-700">
                      {a.phone || '—'}
                    </td>
                    <td className="px-6 py-5">
                      <AgentRoleBadge role={a.role} />
                    </td>
                    <td className="px-6 py-5">
                      <AgentStatusBadge active={Boolean(a.is_active)} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEdit(a)}
                          className="rounded-lg bg-slate-100 px-5 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleActive(a)}
                          disabled={togglingId === a.id}
                          className={[
                            'rounded-lg px-5 py-2 text-sm font-extrabold',
                            a.is_active
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                            togglingId === a.id ? 'cursor-not-allowed opacity-60' : '',
                          ].join(' ')}
                        >
                          {a.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      <ModalShell
        open={addOpen}
        title="Add Agent"
        onClose={() => {
          setAddOpen(false)
          setAddInfo(null)
        }}
        maxWidthClass="max-w-xl"
      >
        <div className="mx-auto mt-6 max-w-lg space-y-5">
          {!addInfo ? (
            <>
              <div>
                <label htmlFor="addAgentName" className="mb-2 block text-sm font-extrabold text-slate-900">
                  Full Name
                </label>
                <input
                  id="addAgentName"
                  name="addAgentName"
                  value={addForm.name}
                  onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  placeholder="Enter full name"
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="addAgentEmail" className="mb-2 block text-sm font-extrabold text-slate-900">
                  Email
                </label>
                <input
                  id="addAgentEmail"
                  name="addAgentEmail"
                  value={addForm.email}
                  onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  placeholder="agent@email.com"
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="addAgentPhone" className="mb-2 block text-sm font-extrabold text-slate-900">
                  Phone
                </label>
                <input
                  id="addAgentPhone"
                  name="addAgentPhone"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  placeholder="9876543210"
                  inputMode="numeric"
                  disabled={saving}
                />
              </div>

              <div>
                <label htmlFor="addAgentPassword" className="mb-2 block text-sm font-extrabold text-slate-900">
                  Password
                </label>
                <input
                  id="addAgentPassword"
                  name="addAgentPassword"
                  value={addForm.password}
                  onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                  type="password"
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
                  placeholder="Set a password"
                  disabled={saving}
                />
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    disabled={saving}
                    className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAgent}
                    disabled={saving}
                    className="inline-flex h-11 min-w-[140px] items-center justify-center rounded-lg bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {saving ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </span>
                    ) : (
                      'Save Agent'
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-extrabold text-amber-900">
                  Agent details saved.
                </p>
                <p className="mt-2 text-sm text-amber-900">
                  Please also create their login account in Supabase Dashboard:
                </p>
                <p className="mt-2 text-sm font-semibold text-amber-900">
                  Authentication → Users → Add User
                </p>
                <div className="mt-3 rounded-lg border border-amber-200 bg-white p-3">
                  <p className="text-sm text-slate-800">
                    <span className="font-extrabold">Email:</span> {addInfo.email}
                  </p>
                  <p className="mt-1 text-sm text-slate-800">
                    <span className="font-extrabold">Password:</span> {addInfo.password}
                  </p>
                </div>
                <p className="mt-3 text-sm text-amber-800">
                  Then they can login with these credentials.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddOpen(false)
                    setAddInfo(null)
                  }}
                  className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-lg bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f]"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </ModalShell>

      {/* Edit Agent Modal */}
      <ModalShell
        open={editOpen}
        title="Edit Agent"
        onClose={() => {
          setEditOpen(false)
          setSelected(null)
        }}
        maxWidthClass="max-w-xl"
      >
        <div className="mx-auto mt-6 max-w-lg space-y-5">
          <div>
            <label htmlFor="editAgentName" className="mb-2 block text-sm font-extrabold text-slate-900">
              Name
            </label>
            <input
              id="editAgentName"
              name="editAgentName"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              placeholder="Enter name"
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="editAgentPhone" className="mb-2 block text-sm font-extrabold text-slate-900">
              Phone
            </label>
            <input
              id="editAgentPhone"
              name="editAgentPhone"
              value={editForm.phone}
              onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20"
              placeholder="9876543210"
              inputMode="numeric"
              disabled={saving}
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setEditOpen(false)
                  setSelected(null)
                }}
                disabled={saving}
                className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSave}
                disabled={saving}
                className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-lg bg-[#1e3a5f] px-6 text-sm font-semibold text-white shadow-sm hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </ModalShell>
    </div>
  )
}