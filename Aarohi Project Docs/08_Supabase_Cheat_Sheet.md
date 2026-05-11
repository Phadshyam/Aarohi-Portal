================================================
DOCUMENT 8: SUPABASE QUERY CHEAT SHEET
Project: Online Service Portal
Client: Aarohi Multiservices
================================================

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUPABASE CLIENT IMPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Always import from this path:
import { supabase } from '../../lib/supabase'
// or
import { supabase } from '../lib/supabase'
// (adjust path based on file location)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SERVICES QUERIES
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get all ACTIVE services (public website)
const { data, error } = await supabase
.from('services')
.select('\*')
.eq('is_active', true)
.order('name', { ascending: true })

// Get ALL services (admin panel)
const { data, error } = await supabase
.from('services')
.select('\*')
.order('name', { ascending: true })

// Get single service by ID
const { data, error } = await supabase
.from('services')
.select('\*')
.eq('id', serviceId)
.single()

// Add new service (admin)
const { data, error } = await supabase
.from('services')
.insert({
name: 'Service Name',
description: 'Description',
documents: 'Doc 1, Doc 2',
procedures: '1. Step one\n2. Step two',
cost: 499,
duration: '2-3 Working Days',
is_active: true
})
.select()
.single()

// Update service (admin)
const { data, error } = await supabase
.from('services')
.update({
name: 'Updated Name',
cost: 599,
is_active: false
})
.eq('id', serviceId)
.select()
.single()

// Delete service (admin)
const { error } = await supabase
.from('services')
.delete()
.eq('id', serviceId)

// Toggle active/inactive
const { error } = await supabase
.from('services')
.update({ is_active: !currentStatus })
.eq('id', serviceId)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2. APPLICATIONS QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get all applications (admin - paginated)
const from = (page - 1) \* 10
const to = from + 9

const { data, error, count } = await supabase
.from('applications')
.select('\*', { count: 'exact' })
.order('created_at', { ascending: false })
.range(from, to)

// Get applications with filters
const { data, error } = await supabase
.from('applications')
.select('\*')
.eq('status', 'In Process') // filter by status
.eq('service_name', 'GST Registration') // filter by service
.order('created_at', { ascending: false })

// Search applications (name, phone, ID)
const { data, error } = await supabase
.from('applications')
.select('\*')
.or(
`name.ilike.%${searchTerm}%,` +
`phone.ilike.%${searchTerm}%,` +
`application_id.ilike.%${searchTerm}%`
)
.order('created_at', { ascending: false })

// Filter by date range
const { data, error } = await supabase
.from('applications')
.select('\*')
.gte('created_at', startDate)
.lte('created_at', endDate)
.order('created_at', { ascending: false })

// Submit new application (PUBLIC - online)
const { data, error } = await supabase
.from('applications')
.insert({
name: 'Customer Name',
phone: '9876543210',
email: 'customer@email.com', // optional
service_id: 'service-uuid',
service_name: 'GST Registration',
cost: 1499,
source: 'online'
// application_id → auto by trigger
// status → defaults to 'Submitted'
// payment_status → defaults to 'Pending'
// created_at → auto
})
.select()
.single()

// Add offline application (ADMIN)
const { data, error } = await supabase
.from('applications')
.insert({
name: 'Customer Name',
phone: '9876543210',
service_id: 'service-uuid',
service_name: 'GST Registration',
cost: 1499,
source: 'offline'
// NO email field for admin form
})
.select()
.single()

// Update application status + payment (admin)
const { data, error } = await supabase
.from('applications')
.update({
status: 'In Process',
payment_status: 'Paid'
// completed_at → auto set by trigger
// when status = Completed
})
.eq('id', applicationUUID)
.select()
.single()

// Get recent applications for dashboard
const { data, error } = await supabase
.from('applications')
.select('\*')
.order('created_at', { ascending: false })
.limit(10)

// Get paid applications for revenue page
const { data, error } = await supabase
.from('applications')
.select('\*')
.eq('payment_status', 'Paid')
.order('created_at', { ascending: false })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3. AUTHENTICATION QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// STEP 1: Check if email is admin
const { data, error } = await supabase
.rpc('verify_admin_login', {
check_email: email
})
// data.success = true/false
// data.message = error message if false
// data.name = admin name if true
// data.role = admin role if true

// STEP 2: Verify password
const { data, error } = await supabase.auth
.signInWithPassword({
email: email,
password: password
})

// STEP 3: Send OTP
const { error } = await supabase.auth
.signInWithOtp({
email: email
})

// STEP 4: Verify OTP
const { data, error } = await supabase.auth
.verifyOtp({
email: email,
token: otpString,
type: 'email'
})

// Get current session
const { data: { session } } = await supabase.auth
.getSession()

// Get current user
const { data: { user } } = await supabase.auth
.getUser()

// Listen to auth changes
supabase.auth.onAuthStateChange(
(event, session) => {
if (event === 'SIGNED_IN') {
// user logged in
}
if (event === 'SIGNED_OUT') {
// user logged out
}
}
)

// Logout
const { error } = await supabase.auth.signOut()

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4. DATABASE FUNCTION CALLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get dashboard stats
const { data, error } = await supabase
.rpc('get_dashboard_stats')
// Returns:
// data.total_apps
// data.in_process
// data.completed
// data.pending_today
// data.total_revenue
// data.pending_revenue
// data.online_count
// data.offline_count

// Get admin profile (after login)
const { data, error } = await supabase
.rpc('get_admin_profile')
// Returns:
// data.success
// data.id
// data.name
// data.email
// data.phone
// data.role

// Track application (PUBLIC)
const { data, error } = await supabase
.rpc('track_application', {
search_id: 'AMS-2026-0001', // or null
search_phone: null // or '9876543210'
})
// Returns array of matching applications
// Fields: application_id, name, service_name,
// cost, status, payment_status,
// created_at, completed_at

// Get all agents
const { data, error } = await supabase
.rpc('get_all_agents')
// Returns array of admin_users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 5. AGENTS / ADMIN USERS QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get all agents list
const { data, error } = await supabase
.rpc('get_all_agents')

// Add new agent
// STEP 1: Create in Supabase Auth
// (done via Supabase dashboard manually
// OR via admin API - discuss separately)

// STEP 2: Add to admin_users table
const { data, error } = await supabase
.from('admin_users')
.insert({
user_id: 'auth-user-uuid',
name: 'Agent Name',
email: 'agent@email.com',
phone: '9876500000',
role: 'agent',
added_by: currentAdminId
})
.select()
.single()

// Update agent details
const { error } = await supabase
.from('admin_users')
.update({
name: 'Updated Name',
phone: '9876511111'
})
.eq('id', agentId)

// Deactivate agent (soft delete)
const { error } = await supabase
.from('admin_users')
.update({ is_active: false })
.eq('id', agentId)

// Reactivate agent
const { error } = await supabase
.from('admin_users')
.update({ is_active: true })
.eq('id', agentId)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 6. SETTINGS QUERIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Get settings (always one row)
const { data, error } = await supabase
.from('settings')
.select('\*')
.single()

// Update settings
const { error } = await supabase
.from('settings')
.update({
business_name: 'Aarohi Multiservices',
contact: '9876543210',
email: 'contact@aarohi.com',
updated_at: new Date().toISOString()
})
.eq('id', settingsId)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 7. REVENUE CALCULATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Revenue is calculated in FRONTEND
// from the applications table data

// Fetch all paid applications
const { data, error } = await supabase
.from('applications')
.select('\*')
.eq('payment_status', 'Paid')
.order('created_at', { ascending: false })

// Then calculate in JavaScript:

// Total revenue
const totalRevenue = data.reduce(
(sum, app) => sum + app.cost, 0
)

// Today's revenue
const today = new Date().toDateString()
const todayRevenue = data
.filter(app =>
new Date(app.created_at).toDateString() === today
)
.reduce((sum, app) => sum + app.cost, 0)

// This month's revenue
const currentMonth = new Date().getMonth()
const currentYear = new Date().getFullYear()
const monthRevenue = data
.filter(app => {
const date = new Date(app.created_at)
return date.getMonth() === currentMonth &&
date.getFullYear() === currentYear
})
.reduce((sum, app) => sum + app.cost, 0)

// Pending payments (from all applications)
const { data: pendingData } = await supabase
.from('applications')
.select('cost')
.eq('payment_status', 'Pending')

const pendingTotal = pendingData.reduce(
(sum, app) => sum + app.cost, 0
)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 8. ERROR HANDLING PATTERN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ALWAYS use this pattern for Supabase calls:

import toast from 'react-hot-toast'

const fetchData = async () => {
try {
setLoading(true)

    const { data, error } = await supabase
      .from('table_name')
      .select('*')

    if (error) throw error

    setData(data)

} catch (error) {
console.error('Error:', error)
toast.error(error.message || 'Something went wrong')
} finally {
setLoading(false)
}
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 9. HELPERS.JS FUNCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// These are in src/utils/helpers.js

formatDate('2026-05-01T10:30:00Z')
→ Returns: '01 May 2026'

formatCurrency(1499)
→ Returns: '₹1,499'

getStatusColor('Completed')
→ Returns Tailwind classes for that status

Status colors:
'Submitted' → blue
'In Process' → indigo/blue
'On Hold' → yellow/amber
'Completed' → green
'Rejected' → red
'Paid' → green
'Pending' → gray
'online' → green
'offline' → amber/yellow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 10. IMPORTANT REMINDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ application_id is AUTO-GENERATED by trigger
NEVER generate it in frontend code

✅ completed_at is AUTO-SET by trigger
NEVER set it manually in frontend

✅ status_history is AUTO-LOGGED by trigger
NEVER insert into it from frontend

✅ source = 'online' for public form
source = 'offline' for admin add form

✅ service_name must be saved WITH application
Even though service_id is also saved
(Both fields required on insert)

✅ email is optional on public form
email is NOT on admin add form

✅ Pagination uses .range(from, to)
10 items per page
from = (page - 1) \* 10
to = from + 9

✅ Search uses .or() with .ilike.
for case-insensitive search

✅ Always call .select() after .insert()
or .update() to get the saved data back

================================================
END OF DOCUMENT 8
================================================
