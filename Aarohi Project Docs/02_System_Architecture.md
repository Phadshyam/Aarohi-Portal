================================================
DOCUMENT 2: SYSTEM ARCHITECTURE
Project: Online Service Portal
Client: Aarohi Multiservices
================================================

LAST UPDATED: June 2025

---

1. HIGH LEVEL ARCHITECTURE

---

Our system has 3 layers:

┌─────────────────────────────────────────────┐
│ LAYER 1: FRONTEND │
│ (What user sees) │
│ │
│ React (Vite) + Tailwind CSS │
│ Runs in browser │
│ Two sections: │
│ ├── Public Website (no login) │
│ └── Admin Panel (login required) │
│ │
│ Talks to Supabase using supabase-js client │
└──────────────────┬──────────────────────────┘
│
│ HTTPS API Calls
│ (Automatic via supabase-js)
│
┌──────────────────▼──────────────────────────┐
│ LAYER 2: BACKEND │
│ (Supabase Platform) │
│ │
│ ├── Auth Service (OTP login) │
│ ├── REST API (auto-generated from tables) │
│ ├── Database Functions (custom logic) │
│ └── Row Level Security (access control) │
│ │
└──────────────────┬──────────────────────────┘
│
│
┌──────────────────▼──────────────────────────┐
│ LAYER 3: DATABASE │
│ (PostgreSQL) │
│ │
│ ├── services │
│ ├── applications │
│ ├── status_history │
│ ├── admin_users │
│ ├── settings │
│ └── application_id_sequence │
│ │
└─────────────────────────────────────────────┘

---

2. HOW FRONTEND TALKS TO BACKEND

---

React does NOT talk to the database directly.
It goes through Supabase client library.

EXAMPLE: Loading services on homepage

React Component
│
▼
supabase.from('services').select('\*')
│
▼
Supabase JS Client (in browser)
│
▼
HTTPS Request to Supabase REST API
│
▼
Supabase checks RLS policies
│
▼
PostgreSQL runs the query
│
▼
Data returns back through same path
│
▼
React renders the data on screen

---

3. COMPLETE DATA FLOW DIAGRAMS

---

=== FLOW 1: CUSTOMER APPLIES FOR SERVICE ===

Customer visits website
│
▼
Homepage loads services from database
(supabase.from('services').select())
│
▼
Customer clicks "Apply Now"
Goes to /apply page
│
▼
Customer fills form:
├── Name (required)
├── Phone (required)
├── Email (optional)
├── Service dropdown (required)
└── Cost (auto-filled, read only)
│
▼
Customer clicks "Submit"
│
▼
React calls:
supabase.from('applications').insert({
name, phone, email, service_id,
service_name, cost, source: 'online'
})
│
▼
Supabase RLS checks:
"Public can submit applications" → ALLOWED ✅
│
▼
TRIGGER fires: set_application_id
├── Calls generate_application_id()
├── Reads application_id_sequence table
├── Increments counter: 0 → 1
├── Generates: AMS-2026-0001
└── Sets application_id on the row
│
▼
Row inserted into applications table:
├── application_id = AMS-2026-0001
├── name = "Rahul Sharma"
├── phone = "9876543210"
├── email = "rahul@email.com"
├── service_name = "GST Registration"
├── cost = 1499
├── status = "Submitted" (default)
├── payment_status = "Pending" (default)
├── source = "online"
├── created_at = auto timestamp
└── completed_at = NULL
│
▼
React receives the created row
│
▼
Shows success message:
"Application submitted!
Your ID: AMS-2026-0001"

=== FLOW 2: CUSTOMER TRACKS APPLICATION ===

Customer visits /track page
│
▼
Customer enters:
├── Application ID: AMS-2026-0001
│ OR
└── Phone Number: 9876543210
│
▼
React calls:
supabase.rpc('track_application', {
search_id: 'AMS-2026-0001',
search_phone: null
})
│
▼
Database function runs (SECURITY DEFINER)
Bypasses RLS safely
Returns limited fields only:
├── application_id
├── name
├── service_name
├── cost
├── status
├── payment_status
├── created_at
└── completed_at
│
▼
React displays result:
┌──────────────────────────┐
│ Application: AMS-2026-0001│
│ Name: Rahul Sharma │
│ Service: GST Registration │
│ Cost: ₹1499 │
│ Status: In Process │
│ Payment: Pending │
│ Applied: 01 June 2026 │
│ Completed: - │
└──────────────────────────┘

=== FLOW 3: ADMIN LOGIN ===

Admin visits /admin/login
│
▼
Admin enters:
├── Email (User ID)
└── Password
│
▼
React calls:
supabase.rpc('verify_admin_login', {
check_email: 'admin@aarohi.com'
})
│
▼
Function checks admin_users table:
├── Does this email exist? YES
├── Is it active? YES
└── Returns: { success: true, name, role }
│
▼
React calls:
supabase.auth.signInWithPassword({
email, password
})
│
▼
Supabase Auth verifies password
│
▼
If correct → Session created
JWT token stored in browser
│
▼
React redirects to /admin/dashboard
│
▼
React calls:
supabase.rpc('get_admin_profile')
│
▼
Returns admin name, role
Shows: "Hey, Rahul"

=== FLOW 4: ADMIN UPDATES APPLICATION ===

Admin clicks "View" on an application
│
▼
Application Detail Modal opens
Shows all fields
│
▼
Admin changes:
├── Status: "Submitted" → "In Process"
└── Payment: "Pending" → "Paid"
│
▼
Admin clicks "Save Changes"
│
▼
React calls:
supabase.from('applications')
.update({ status, payment_status })
.eq('id', application_id)
│
▼
RLS checks:
"Admins can update applications" → ALLOWED ✅
│
▼
TRIGGER 1: record_status_change fires
├── Old status: "Submitted"
├── New status: "In Process"
├── Inserts row into status_history
└── Timestamp saved
│
▼
If status = "Completed":
TRIGGER 2: set_completed_date fires
├── Sets completed_at = NOW()
└── Saved automatically
│
▼
React shows: "Application updated!"

=== FLOW 5: ADMIN ADDS OFFLINE APPLICATION ===

Admin clicks "Add Application" in sidebar
│
▼
Form shows:
├── Name (required)
├── Phone (required)
├── Service dropdown (required)
└── Cost (auto-filled)
│
▼
Admin clicks "Create Application"
│
▼
React calls:
supabase.from('applications').insert({
name, phone, service_id,
service_name, cost,
source: 'offline' ← This is the difference
})
│
▼
Same trigger fires → AMS-2026-XXXX generated
│
▼
Saved with source = 'offline'
│
▼
Shows in applications table with
offline indicator

=== FLOW 6: REVENUE PAGE ===

Admin opens /admin/revenue
│
▼
React calls:
supabase.from('applications')
.select('\*')
.eq('payment_status', 'Paid')
│
▼
Data returned (only paid applications)
│
▼
React calculates on frontend:
├── Total Revenue = SUM of all paid costs
├── Today's Revenue = SUM where date = today
├── This Month = SUM where month = current
└── Pending Payments = SUM where status = Pending
│
▼
Displays in stat cards + table

=== FLOW 7: AGENTS MANAGEMENT ===

Admin opens /admin/agents
│
▼
React calls:
supabase.rpc('get_all_agents')
│
▼
Shows list of all admin users:
├── Name
├── Email
├── Phone
├── Role (admin/agent)
├── Status (active/inactive)
└── Actions (edit/delete)
│
▼
Admin clicks "Add Agent":
├── Creates user in Supabase Auth
├── Adds to admin_users table
└── Role = 'agent'
│
▼
Admin can:
├── Edit agent details
├── Deactivate an agent (set is_active = false)
└── Delete an agent

---

4. ROUTE STRUCTURE (URLs)

---

PUBLIC ROUTES (No login needed):
├── / → Homepage
├── /apply → Apply for Service
└── /track → Track Application

ADMIN ROUTES (Login required):
├── /admin/login → Login Page
├── /admin/dashboard → Dashboard
├── /admin/applications → All Applications
├── /admin/add → Add New Application
├── /admin/revenue → Revenue Tracking
├── /admin/services → Manage Services
├── /admin/agents → Manage Agents
└── /admin/settings → Settings

PROTECTED ROUTE LOGIC:
If user is NOT logged in and tries to access
/admin/dashboard → Redirect to /admin/login

If user IS logged in and goes to
/admin/login → Redirect to /admin/dashboard

---

5. STATE MANAGEMENT

---

WHAT IS STATE?
State = data that changes during user interaction.

HOW WE MANAGE STATE:

1. AuthContext (Global)
   ├── Stores: current user info
   ├── Stores: admin profile (name, role)
   ├── Stores: login/logout functions
   └── Available: everywhere in the app

2. Component State (Local)
   ├── Each page manages its own data
   ├── Example: ApplicationsPage stores
   │ its own list of applications
   └── Uses: useState and useEffect hooks

3. No Redux/Zustand needed
   ├── Our app is not complex enough
   ├── Context + local state is sufficient
   └── Keep it simple!

---

6. COMPONENT HIERARCHY

---

App.jsx
├── BrowserRouter (handles URLs)
│ │
│ ├── PUBLIC ROUTES
│ │ ├── / → HomePage
│ │ │ ├── Navbar
│ │ │ ├── HeroSection
│ │ │ ├── ServicesGrid
│ │ │ ├── WhyChooseUs
│ │ │ └── ContactSection
│ │ │
│ │ ├── /apply → ApplyPage
│ │ │ ├── Navbar
│ │ │ └── ApplicationForm
│ │ │
│ │ └── /track → TrackPage
│ │ ├── Navbar
│ │ └── TrackingForm + Results
│ │
│ └── ADMIN ROUTES (Protected)
│ ├── /admin/login → LoginPage
│ │
│ └── AdminLayout (sidebar + header)
│ ├── /admin/dashboard → DashboardPage
│ │ ├── StatCards
│ │ └── RecentApplicationsTable
│ │
│ ├── /admin/applications → ApplicationsPage
│ │ ├── FilterBar
│ │ ├── ApplicationsTable
│ │ └── ApplicationDetailModal
│ │
│ ├── /admin/add → AddApplicationPage
│ │ └── AddApplicationForm
│ │
│ ├── /admin/revenue → RevenuePage
│ │ ├── RevenueStatCards
│ │ └── RevenueTable
│ │
│ ├── /admin/services → ServicesPage
│ │ ├── ServicesList
│ │ ├── ServiceDetailModal
│ │ └── EditServiceModal
│ │
│ ├── /admin/agents → AgentsPage
│ │ ├── AgentsList
│ │ └── AddAgentForm
│ │
│ └── /admin/settings → SettingsPage
│ ├── BusinessInfoForm
│ └── SystemPreferencesForm

---

7. ERROR HANDLING STRATEGY

---

LEVEL 1: API Errors
├── Every Supabase call is wrapped in try-catch
├── Error message shown to user via toast
└── Example: "Failed to load applications"

LEVEL 2: Auth Errors
├── Invalid credentials → Show error message
├── Session expired → Redirect to login
└── Unauthorized access → Redirect to login

LEVEL 3: Form Validation
├── Required fields checked before submit
├── Phone number format validation
├── Service must be selected
└── Shows inline error messages

LEVEL 4: Network Errors
├── No internet → Show offline message
├── Supabase down → Show error message
└── Timeout → Show retry option

---

8. PERFORMANCE CONSIDERATIONS

---

1. Lazy Loading
   Admin pages loaded only when needed.
   Public pages load immediately.

2. Pagination
   Applications table shows 10 per page.
   Not loading thousands of rows at once.

3. Debounced Search
   Search waits 300ms after typing stops.
   Prevents making API call on every keystroke.

4. Minimal Re-renders
   Using proper React patterns.
   Components only re-render when their data changes.

5. Supabase Client
   Single instance created once.
   Reused across all components.

================================================
END OF DOCUMENT 2
================================================

================================================
QUICK REFERENCE: SYSTEM ARCHITECTURE
================================================

WHAT → TECHNOLOGY → PURPOSE
─────────────────────────────────────────────
User Interface → React + Vite → What users see
Styling → Tailwind CSS → How it looks
Navigation → React Router → Page switching
Notifications → React Hot Toast → Success/Error msgs
Icons → Lucide React → UI icons
Database → PostgreSQL → Stores all data
Backend API → Supabase → Handles requests
Authentication → Supabase Auth → Login with OTP
Security → RLS Policies → Access control

FLOW SUMMARY:
Browser → React → Supabase Client → Supabase API
→ RLS Check → PostgreSQL → Data back → React renders

ID FORMAT:
AMS-YYYY-XXXX (auto generated)
Example: AMS-2026-0001

STATUS FLOW:
Submitted → In Process → On Hold → Completed
→ Rejected

PAYMENT STATUS:
Pending → Paid (toggle)

APPLICATION SOURCE:
online (from public website)
offline (added by admin/agent)
================================================
