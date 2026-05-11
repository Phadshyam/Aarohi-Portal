================================================
DOCUMENT 5: FRONTEND STRUCTURE
Project: Online Service Portal
Client: Aarohi Multiservices
Framework: React (Vite) + Tailwind CSS
================================================

LAST UPDATED: June 2025

---

1. TECHNOLOGY DETAILS

---

FRAMEWORK : React 19 (with Vite bundler)
STYLING : Tailwind CSS v4
ROUTING : React Router DOM v7
ICONS : Lucide React
TOASTS : React Hot Toast
DB CLIENT : @supabase/supabase-js
IDE : Visual Studio Code

WHY VITE OVER CREATE REACT APP?
├── Vite is much faster (instant server start)
├── Hot Module Replacement (instant updates)
├── Modern build tool (industry standard now)
└── Create React App is no longer maintained

WHY TAILWIND CSS?
├── No need to write custom CSS files
├── Classes applied directly in JSX
├── Consistent design system
├── Easy responsive design
└── Used by major companies worldwide

---

2. COMPLETE FOLDER STRUCTURE

---

aarohi-portal/
│
├── public/
│ └── logo.png
│ → Business logo file
│ → Used in navbar and login page
│
├── src/
│ │
│ ├── assets/
│ │ → Static files like images
│ │ → Import in components when needed
│ │
│ ├── components/
│ │ → Reusable UI pieces
│ │ → Used across multiple pages
│ │ → Never contains page-level logic
│ │ │
│ │ ├── ui/
│ │ │ → Basic building blocks
│ │ │ → Smallest reusable components
│ │ │ │
│ │ │ ├── Button.jsx
│ │ │ ├── Input.jsx
│ │ │ └── Badge.jsx
│ │ │
│ │ ├── layout/
│ │ │ → Structure components
│ │ │ → Define page layout/skeleton
│ │ │ │
│ │ │ ├── AdminLayout.jsx
│ │ │ │ → Sidebar + Header + Content area
│ │ │ │ → Wraps all admin pages
│ │ │ │
│ │ │ └── Navbar.jsx
│ │ │ → Public website top navigation
│ │ │ → Logo + Links
│ │ │
│ │ └── shared/
│ │ → Used in both public and admin
│ │ │
│ │ ├── LoadingSpinner.jsx
│ │ │ → Shows while data is loading
│ │ │
│ │ └── ProtectedRoute.jsx
│ │ → Guards admin routes
│ │ → Redirects if not logged in
│ │
│ ├── pages/
│ │ → One file per page/screen
│ │ → Contains page-level logic
│ │ → Imports and uses components
│ │ │
│ │ ├── public/
│ │ │ → No login required
│ │ │ │
│ │ │ ├── HomePage.jsx
│ │ │ │ → Hero section
│ │ │ │ → Services grid
│ │ │ │ → Why choose us
│ │ │ │ → Contact section
│ │ │ │
│ │ │ ├── ApplyPage.jsx
│ │ │ │ → Application form
│ │ │ │ → Service dropdown
│ │ │ │ → Auto cost fetch
│ │ │ │ → Submit to database
│ │ │ │
│ │ │ └── TrackPage.jsx
│ │ │ → Search by ID or phone
│ │ │ → Shows application status
│ │ │ → Uses track_application()
│ │ │
│ │ └── admin/
│ │ → Login required
│ │ │
│ │ ├── LoginPage.jsx
│ │ │ → Email + Password fields
│ │ │ → Send OTP button
│ │ │ → OTP input (6 boxes)
│ │ │ → Verify & Login button
│ │ │
│ │ ├── DashboardPage.jsx
│ │ │ → 4 stat cards
│ │ │ → Recent applications table
│ │ │ → Filters (status, service, date)
│ │ │
│ │ ├── ApplicationsPage.jsx
│ │ │ → Full applications table
│ │ │ → Search bar
│ │ │ → Filter buttons
│ │ │ → Pagination
│ │ │ → View button → opens modal
│ │ │
│ │ ├── AddApplicationPage.jsx
│ │ │ → Manual entry form
│ │ │ → Name, Phone, Service
│ │ │ → Cost auto-fills
│ │ │ → source = 'offline' auto-set
│ │ │
│ │ ├── RevenuePage.jsx
│ │ │ → 4 revenue stat cards
│ │ │ → Revenue table (paid only)
│ │ │ → Date, service, status filters
│ │ │
│ │ ├── ServicesPage.jsx
│ │ │ → Services list table
│ │ │ → Search services
│ │ │ → Toggle active/inactive
│ │ │ → View details modal
│ │ │ → Edit service modal
│ │ │ → Add new service
│ │ │
│ │ ├── AgentsPage.jsx
│ │ │ → Agents list
│ │ │ → Add new agent
│ │ │ → Edit agent
│ │ │ → Deactivate agent
│ │ │
│ │ └── SettingsPage.jsx
│ │ → Business info form
│ │ → System preferences
│ │ → Save changes
│ │
│ ├── hooks/
│ │ → Custom React hooks
│ │ → Reusable logic extracted from pages
│ │ │
│ │ ├── useAuth.js
│ │ │ → Returns current user info
│ │ │ → Returns login/logout functions
│ │ │ → Used in any component that
│ │ │ needs auth info
│ │ │
│ │ └── useApplications.js
│ │ → Fetch applications from DB
│ │ → Handle filters and search
│ │ → Handle pagination
│ │ → Reused in Dashboard + Applications
│ │
│ ├── context/
│ │ → Global state management
│ │ │
│ │ └── AuthContext.jsx
│ │ → Stores: current session
│ │ → Stores: admin profile
│ │ → Stores: login/logout functions
│ │ → Available to entire app
│ │ → Wraps entire app in main.jsx
│ │
│ ├── lib/
│ │ → Third party configurations
│ │ │
│ │ └── supabase.js
│ │ → Creates Supabase client
│ │ → Reads from .env.local
│ │ → Exported and imported everywhere
│ │
│ ├── utils/
│ │ → Helper/utility functions
│ │ → Pure functions (no React)
│ │ │
│ │ └── helpers.js
│ │ → formatDate()
│ │ → formatCurrency()
│ │ → getStatusColor()
│ │ → getSourceBadge()
│ │ → truncateText()
│ │
│ ├── App.jsx
│ │ → Main app component
│ │ → Defines ALL routes
│ │ → Uses React Router
│ │ → Wraps admin routes with ProtectedRoute
│ │
│ ├── main.jsx
│ │ → Entry point of the app
│ │ → Renders App into the DOM
│ │ → Wraps App with AuthContext provider
│ │ → Adds Toaster for notifications
│ │
│ └── index.css
│ → Global styles
│ → Only contains: @import "tailwindcss"
│ → No custom CSS needed (Tailwind handles all)
│
├── .env.local
│ → Secret environment variables
│ → NEVER commit to Git
│ → Contains Supabase URL and anon key
│
├── .gitignore
│ → Files Git should ignore
│ → Includes: node_modules, .env.local
│
├── vite.config.js
│ → Vite configuration
│ → Includes React and Tailwind plugins
│
├── package.json
│ → Project dependencies list
│ → Run scripts (dev, build, preview)
│
└── index.html
→ Root HTML file
→ React mounts into <div id="root">
→ Add favicon and title here

---

3. ROUTING STRUCTURE

---

HOW ROUTING WORKS:
React Router makes our app feel like
multiple pages but it is still ONE page.
(This is called Single Page Application - SPA)

When URL changes:
→ React Router shows different component
→ Browser does NOT reload
→ Very fast navigation

ROUTE DEFINITIONS (in App.jsx):

PUBLIC ROUTES:
/ → <HomePage />
/apply → <ApplyPage />
/track → <TrackPage />

ADMIN ROUTES (all protected):
/admin/login → <LoginPage />
/admin/dashboard → <DashboardPage />
/admin/applications → <ApplicationsPage />
/admin/add → <AddApplicationPage />
/admin/revenue → <RevenuePage />
/admin/services → <ServicesPage />
/admin/agents → <AgentsPage />
/admin/settings → <SettingsPage />

PROTECTED ROUTE LOGIC:
┌─────────────────────────────────────┐
│ ProtectedRoute │
│ │
│ Is session loading? │
│ YES → Show <LoadingSpinner /> │
│ │
│ Is user logged in? │
│ NO → Redirect to /admin/login │
│ │
│ Is user logged in? │
│ YES → Show requested page ✅ │
└─────────────────────────────────────┘

ADMIN LAYOUT STRUCTURE:
All admin pages (except login) use AdminLayout:

┌─────────────────────────────────────────┐
│ HEADER (top bar) │
│ Logo | Search | Profile avatar │
├──────────────┬──────────────────────────┤
│ │ │
│ SIDEBAR │ MAIN CONTENT AREA │
│ (left) │ (changes per page) │
│ │ │
│ Dashboard │ <DashboardPage /> │
│ Applications│ or │
│ Add App │ <ApplicationsPage /> │
│ Revenue │ or │
│ Services │ <RevenuePage /> │
│ Agents │ etc. │
│ Settings │ │
│ │ │
└──────────────┴──────────────────────────┘

---

4. DATA FLOW IN REACT

---

HOW DATA MOVES IN OUR APP:

LEVEL 1: Supabase (database)
↕ (read/write via supabase-js)
LEVEL 2: Page Component (fetches data)
↕ (passes as props)
LEVEL 3: Child Components (display data)

EXAMPLE: ApplicationsPage data flow

ApplicationsPage (fetches all applications)
│
│ passes applications array as prop
▼
ApplicationsTable (displays the table)
│
│ passes single application as prop
▼
ApplicationRow (displays one row)
│
│ user clicks "View"
▼
ApplicationDetailModal (shows full details)
│
│ user changes status and saves
▼
Back to ApplicationsPage (refreshes data)

GLOBAL DATA (AuthContext):
┌─────────────────────────────────────┐
│ AuthContext │
│ │
│ Stores: │
│ ├── user (Supabase auth user) │
│ ├── profile (name, role, email) │
│ ├── loading (checking session) │
│ └── functions: │
│ ├── login() │
│ └── logout() │
│ │
│ Available to: │
│ └── Every component in the app │
└─────────────────────────────────────┘

HOW COMPONENTS ACCESS AuthContext:
import { useAuth } from '../hooks/useAuth'

const { user, profile, logout } = useAuth()

// Now use in component:

<p>Hey, {profile.name}</p>
<button onClick={logout}>Logout</button>

---

5. PAGE BY PAGE BREAKDOWN

---

════════════════════════════════════════════
PAGE: HomePage (/))
════════════════════════════════════════════
SECTIONS:
├── Navbar
│ ├── Logo (left)
│ └── Links: Services, Track, Contact, About
│
├── Hero Section
│ ├── Big heading: "All Government Services
│ │ in One Place"
│ ├── Subtext
│ ├── "Apply Now" button → goes to /apply
│ └── Trust badges: "Trusted by 5000+"
│
├── Services Grid
│ ├── Fetches active services from DB
│ ├── Displays service cards (3 per row)
│ └── Each card: icon, name, description
│
├── Why Choose Us
│ ├── Fast Processing card
│ ├── Secure & Confidential card
│ └── Dedicated Support card
│
└── Contact Section
├── Call Us button (tel: link)
└── WhatsApp button (wa.me link)

DATA NEEDED:
→ services table (active ones only)

════════════════════════════════════════════
PAGE: ApplyPage (/apply)
════════════════════════════════════════════
SECTIONS:
├── Navbar
└── Application Form
├── Name input (required)
├── Phone input (required)
├── Email input (optional)
├── Service dropdown (required)
│ → Fetches from services table
├── Cost display (auto-filled, read only)
│ → Updates when service is selected
└── Submit button

ON SUBMIT:
├── Validate required fields
├── Insert into applications table
├── source = 'online' (automatic)
├── Show success with Application ID
└── Clear form

DATA NEEDED:
→ services table (for dropdown)
→ applications table (to insert)

════════════════════════════════════════════
PAGE: TrackPage (/track)
════════════════════════════════════════════
SECTIONS:
├── Navbar
└── Tracking Section
├── Search input
│ (Application ID or Phone Number)
├── Search button
└── Results card (if found):
├── Application ID
├── Name
├── Service
├── Cost
├── Status (colored badge)
├── Payment Status
├── Applied Date
└── Completed Date (if done)

DATA NEEDED:
→ track_application() function

════════════════════════════════════════════
PAGE: LoginPage (/admin/login)
════════════════════════════════════════════
SECTIONS:
└── Login Card (centered)
├── Logo
├── "Admin Login" heading
├── Email input (User ID)
├── Password input (with show/hide)
├── Send OTP button
├── OTP input (6 individual boxes)
│ → Appears after Send OTP clicked
├── Verify & Login button
└── Resend OTP countdown (30 seconds)

LOGIC:
├── Step 1: verify_admin_login(email)
├── Step 2: signInWithPassword(email, pass)
├── Step 3: signInWithOtp(email)
├── Step 4: verifyOtp(email, token)
└── Step 5: get_admin_profile() → redirect

════════════════════════════════════════════
PAGE: DashboardPage (/admin/dashboard)
════════════════════════════════════════════
SECTIONS:
├── Stat Cards Row
│ ├── Total Applications
│ ├── In Process
│ ├── Completed
│ └── Pending Today
│
└── Recent Applications
├── Filter buttons (Status, Service, Date)
└── Table:
├── Application ID
├── Name
├── Phone
├── Service
├── Cost
├── Created Date
├── Payment Status (badge)
├── Application Status (colored badge)
└── View button → opens modal

DATA NEEDED:
→ get_dashboard_stats() for stat cards
→ applications table for recent list

════════════════════════════════════════════
PAGE: ApplicationsPage (/admin/applications)
════════════════════════════════════════════
SECTIONS:
├── Search bar (Name, Phone, App ID)
├── Filter buttons (Status, Service, Date)
├── Add Application button
├── Applications table (same as dashboard)
└── Pagination (Prev | 1 2 3 | Next)

MODALS:
└── Application Detail Modal (on View click)
├── Application ID (read only)
├── Name (read only)
├── Contact (read only)
├── Service (read only)
├── Cost (read only)
├── Created Date (read only)
├── Completed Date (read only)
├── Status dropdown (editable)
│ Options: Submitted, In Process,
│ On Hold, Completed, Rejected
├── Payment toggle (Pending ↔ Paid)
├── Save Changes button
└── Close button

DATA NEEDED:
→ applications table (with filters)
→ UPDATE applications (on save)

════════════════════════════════════════════
PAGE: AddApplicationPage (/admin/add)
════════════════════════════════════════════
SECTIONS:
└── Add New Application Form
├── Name input (required)
├── Phone input (required)
├── Service dropdown (required)
├── Cost (auto-filled, read only)
├── Create Application button
└── Close button

NOTE:
source = 'offline' set automatically
No email field (admin entry)

DATA NEEDED:
→ services table (for dropdown)
→ applications table (to insert)

════════════════════════════════════════════
PAGE: RevenuePage (/admin/revenue)
════════════════════════════════════════════
SECTIONS:
├── Revenue Stat Cards
│ ├── Total Revenue (all paid)
│ ├── Today's Revenue
│ ├── This Month
│ └── Pending Payments
│
├── Filter Row
│ ├── Date Range picker
│ ├── Service filter
│ └── Status filter
│
└── Revenue Table (paid apps only)
├── Application ID
├── Name
├── Service
├── Amount
├── Payment Status (Paid badge)
└── Date

DATA NEEDED:
→ applications table
WHERE payment_status = 'Paid'

════════════════════════════════════════════
PAGE: ServicesPage (/admin/services)
════════════════════════════════════════════
SECTIONS:
├── Search services bar
├── Add Service button
└── Services Table
├── Number
├── Service Name
├── Cost
├── Status toggle (active/inactive)
├── View button → Service Detail Modal
└── Edit button → Edit Service Modal

SERVICE DETAIL MODAL:
├── Service Name
├── Description
├── Required Documents
├── Procedures
├── Service Cost
├── Completion Duration
├── Status (Active/Inactive)
├── Edit Service button
└── Close button

EDIT SERVICE MODAL:
├── Service Name (editable)
├── Description (editable)
├── Required Documents (editable)
├── Procedures (editable)
├── Service Cost (editable)
├── Completion Duration (editable)
├── Delete button (red)
├── Cancel button
└── Save Changes button

DATA NEEDED:
→ services table (read, update, delete)
→ INSERT for new service

════════════════════════════════════════════
PAGE: AgentsPage (/admin/agents)
════════════════════════════════════════════
SECTIONS:
├── Add Agent button
└── Agents Table
├── Name
├── Email
├── Phone
├── Role
├── Status (Active/Inactive badge)
└── Actions (Edit | Deactivate)

ADD AGENT FLOW:
├── Step 1: Show form (name, email,
│ phone, password)
├── Step 2: Create in Supabase Auth
├── Step 3: Add to admin_users table
└── Step 4: Show in agents list

DATA NEEDED:
→ get_all_agents() function
→ admin_users table (insert, update)
→ supabase.auth.admin (create auth user)

════════════════════════════════════════════
PAGE: SettingsPage (/admin/settings)
════════════════════════════════════════════
SECTIONS:
├── Business Information Card
│ ├── Business Name input
│ ├── Contact Number input
│ ├── Email input
│ └── Save Changes button
│
├── System Preferences Card
│ ├── Default Application Status dropdown
│ ├── Application ID Format (display only)
│ ├── Enable Notifications toggle
│ │ (disabled - coming soon)
│ └── Save Changes button
│
└── Notifications Card
└── "Coming Soon" message

DATA NEEDED:
→ settings table (read and update)

---

6. COMPONENT DETAILS

---

════════════════════════════════════════════
COMPONENT: Button.jsx
════════════════════════════════════════════
PURPOSE: Reusable button with variants

PROPS:
├── children → Button text or icon
├── variant → 'primary', 'secondary',
│ 'danger', 'ghost'
├── size → 'sm', 'md', 'lg'
├── onClick → Click handler function
├── disabled → true/false
└── loading → true/false (shows spinner)

USAGE:
<Button variant="primary" onClick={handleSave}>
Save Changes
</Button>

════════════════════════════════════════════
COMPONENT: Input.jsx
════════════════════════════════════════════
PURPOSE: Reusable input field with label

PROPS:
├── label → Field label text
├── type → 'text', 'email', 'tel', etc
├── placeholder → Placeholder text
├── value → Current value
├── onChange → Change handler
├── required → true/false
├── error → Error message to show
└── disabled → true/false

════════════════════════════════════════════
COMPONENT: Badge.jsx
════════════════════════════════════════════
PURPOSE: Colored status labels

PROPS:
└── status → 'Submitted', 'In Process',
'On Hold', 'Completed',
'Rejected', 'Paid', 'Pending',
'online', 'offline'

COLORS:
├── Submitted → Blue
├── In Process → Blue (darker)
├── On Hold → Yellow/Orange
├── Completed → Green
├── Rejected → Red
├── Paid → Green
├── Pending → Gray
├── online → Green
└── offline → Yellow

════════════════════════════════════════════
COMPONENT: LoadingSpinner.jsx
════════════════════════════════════════════
PURPOSE: Show while data is loading

PROPS:
└── size → 'sm', 'md', 'lg'

USAGE:
{loading && <LoadingSpinner />}

════════════════════════════════════════════
COMPONENT: ProtectedRoute.jsx
════════════════════════════════════════════
PURPOSE: Guard admin routes

LOGIC:
if (loading) return <LoadingSpinner />
if (!user) return <Navigate to="/admin/login" />
return <>{children}</>

USAGE (in App.jsx):
<ProtectedRoute>
<DashboardPage />
</ProtectedRoute>

---

7. UTILITY FUNCTIONS (helpers.js)

---

formatDate(dateString)
→ Input : "2026-05-01T10:30:00Z"
→ Output: "01 May 2026"

formatCurrency(amount)
→ Input : 1499
→ Output: "₹1,499"

getStatusColor(status)
→ Input : "Completed"
→ Output: "text-green-600 bg-green-100"
(Tailwind classes for coloring)

getSourceBadge(source)
→ Input : "online"
→ Output: { label: "Online", color: "green" }

truncateText(text, maxLength)
→ Input : "Very long text here...", 20
→ Output: "Very long text her..."

---

8. NAMING CONVENTIONS

---

FILES:
├── Pages → PascalCase + Page suffix
│ Example: DashboardPage.jsx
├── Components→ PascalCase
│ Example: ApplicationTable.jsx
├── Hooks → camelCase + use prefix
│ Example: useAuth.js
├── Utils → camelCase
│ Example: helpers.js
└── Context → PascalCase + Context suffix
Example: AuthContext.jsx

VARIABLES:
├── Regular → camelCase
│ Example: totalApplications
├── Constants → UPPER_SNAKE_CASE
│ Example: MAX_RESULTS_PER_PAGE
└── Booleans → is/has prefix
Example: isLoading, hasError

FUNCTIONS:
├── Handlers → handle prefix
│ Example: handleSubmit
├── Fetchers → fetch prefix
│ Example: fetchApplications
└── Helpers → descriptive verb
Example: formatDate

SUPABASE CALLS:
Always use async/await with try/catch:

const fetchData = async () => {
try {
setLoading(true)
const { data, error } = await supabase
.from('table')
.select('\*')
if (error) throw error
setData(data)
} catch (error) {
toast.error(error.message)
} finally {
setLoading(false)
}
}

---

9. IMPORTANT RULES FOR THIS PROJECT

---

✅ Always show loading state while fetching
✅ Always handle errors with toast messages
✅ Always validate forms before submitting
✅ Never hardcode Supabase keys in components
✅ Always use the supabase.js client (from lib/)
✅ Keep pages clean, move logic to hooks
✅ One component = one responsibility
✅ Comment complex logic clearly
✅ Test on mobile view too (responsive)
✅ Check browser console for errors often

❌ Never put business logic in UI components
❌ Never fetch data in deeply nested components
❌ Never use inline styles (use Tailwind classes)
❌ Never commit .env.local to Git
❌ Never use alert() (use toast instead)

---

10. PACKAGES INSTALLED

---

DEPENDENCIES (used in production):
├── @supabase/supabase-js → Database client
├── react-router-dom → Page routing
├── react-hot-toast → Notifications
└── lucide-react → Icons

DEV DEPENDENCIES (only for development):
├── tailwindcss → CSS framework
├── @tailwindcss/vite → Tailwind Vite plugin
└── vite → Build tool

HOW TO INSTALL ON NEW MACHINE:

1. Clone the project
2. Run: npm install
3. Create .env.local with keys
4. Run: npm run dev

SCRIPTS (from package.json):
├── npm run dev → Start development server
├── npm run build → Build for production
└── npm run preview → Preview production build

================================================
END OF DOCUMENT 5
================================================
