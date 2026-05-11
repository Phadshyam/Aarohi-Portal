================================================
DOCUMENT 4: AUTHENTICATION & SECURITY
Project: Online Service Portal
Client: Aarohi Multiservices
================================================

LAST UPDATED: June 2025

---

1. AUTHENTICATION OVERVIEW

---

TYPE : OTP-Based Login (Email OTP)
LIBRARY : Supabase Auth
ACCESS : No public registration
Only pre-added users can login

WHO CAN LOGIN:

- Only users who exist in BOTH:
  1. Supabase Auth (auth.users table)
  2. Our admin_users table
- If a user exists in Auth but NOT in
  admin_users → Login is BLOCKED
- This is our extra security layer

TWO ROLES:
┌─────────┬────────────────────────────────────┐
│ Role │ What they can access │
├─────────┼────────────────────────────────────┤
│ admin │ Everything: │
│ │ Dashboard, Applications, Revenue, │
│ │ Services, Agents, Settings │
├─────────┼────────────────────────────────────┤
│ agent │ Limited: │
│ │ Dashboard, Applications only │
│ │ Cannot see Revenue, Settings │
└─────────┴────────────────────────────────────┘

---

2. COMPLETE LOGIN FLOW

---

STEP 1: Admin visits /admin/login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User sees:
├── Email field (User ID)
├── Password field
└── Send OTP button

STEP 2: User enters email + password
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User fills:
├── Email: admin@aarohi.com
└── Password: **\*\*\*\***

STEP 3: Frontend verification (First check)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React calls database function:
supabase.rpc('verify_admin_login', {
check_email: 'admin@aarohi.com'
})

Database checks admin_users table:
├── Does email exist?
│ NO → Return error → Show message → STOP
│ YES → Continue ↓
│
└── Is is_active = TRUE?
NO → Return error → "Account deactivated"
YES → Return success → Continue ↓

STEP 4: Password verification (Second check)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React calls Supabase Auth:
supabase.auth.signInWithPassword({
email: 'admin@aarohi.com',
password: 'entered-password'
})

Supabase Auth checks:
├── Does user exist in auth.users?
│ NO → Show error → STOP
│ YES → Continue ↓
│
└── Is password correct?
NO → Show error "Invalid credentials" → STOP
YES → Continue ↓

STEP 5: OTP Generation (Third check)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React calls:
supabase.auth.signInWithOtp({
email: 'admin@aarohi.com'
})

Supabase sends 6-digit OTP to email.
OTP is valid for: 1 hour
OTP length: 6 digits

UI changes:
├── OTP input boxes appear (6 boxes)
├── "Verify & Login" button appears
└── "Resend in 30s" countdown starts

STEP 6: OTP Verification (Final check)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User enters 6-digit OTP.
React calls:
supabase.auth.verifyOtp({
email: 'admin@aarohi.com',
token: '123456',
type: 'email'
})

Supabase checks OTP:
├── Is OTP correct?
│ NO → Show error "Invalid OTP" → STOP
│ YES → Continue ↓
│
└── Is OTP still valid (within 1 hour)?
NO → Show error "OTP expired" → STOP
YES → Session created ↓

STEP 7: Session Created
━━━━━━━━━━━━━━━━━━━━━━━
Supabase creates a session:
├── JWT token generated
├── Stored in browser (localStorage)
└── Auto-refreshed by Supabase client

React calls:
supabase.rpc('get_admin_profile')

Gets:
├── name → "Rahul Kangane"
├── role → "admin"
└── email → "admin@aarohi.com"

Saves to AuthContext (global state)

STEP 8: Redirect to Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
React Router redirects to:
/admin/dashboard

Dashboard shows:
"Hey, Rahul 👋"

---

3. SESSION MANAGEMENT

---

WHAT IS A SESSION?
When a user logs in successfully,
Supabase creates a session.
This proves the user is authenticated.

HOW IT WORKS:
├── Session = JWT token (a long encrypted string)
├── Stored in browser localStorage automatically
├── Sent with every Supabase API request
├── Supabase validates it on every request
└── Expires after some time (auto-refreshed)

SESSION PERSISTENCE:
├── If browser is closed → Session stays
├── If tab is refreshed → Session stays
├── If token expires → Supabase auto-refreshes
└── Only logout or manual clear removes it

HOW REACT USES IT:
On app load, React checks:
supabase.auth.getSession()

├── Session exists? → User is logged in ✅
└── No session? → User is not logged in ❌

AuthContext listens for auth changes:
supabase.auth.onAuthStateChange((event, session) => {
if (event === 'SIGNED_IN') → update state
if (event === 'SIGNED_OUT') → clear state
})

LOGOUT FLOW:
User clicks Logout
│
▼
supabase.auth.signOut()
│
▼
Session destroyed in browser
│
▼
AuthContext cleared
│
▼
Redirect to /admin/login

---

4. PROTECTED ROUTES

---

WHAT IS A PROTECTED ROUTE?
A page that can only be accessed
if the user is logged in.

HOW IT WORKS IN REACT:
We create a ProtectedRoute component:

Logic:
├── Check if user session exists
│ │
│ ├── Loading (checking session)
│ │ → Show spinner
│ │
│ ├── Session exists
│ │ → Show the requested page
│ │
│ └── No session
│ → Redirect to /admin/login

ROUTES THAT ARE PROTECTED:
├── /admin/dashboard
├── /admin/applications
├── /admin/add
├── /admin/revenue (admin only)
├── /admin/services (admin only)
├── /admin/agents (admin only)
└── /admin/settings (admin only)

ROUTES THAT ARE PUBLIC:
├── / (homepage)
├── /apply (apply form)
└── /track (tracking page)

ROLE-BASED PROTECTION:
Some pages are admin-only:
├── Revenue page
├── Services page
├── Agents page
└── Settings page

If an agent tries to access these:
→ Show "Access Denied" or redirect to dashboard

---

5. ROW LEVEL SECURITY (RLS)

---

WHAT IS RLS?
Rules inside the database that control
who can read or write each table.
Even if someone gets the API key,
RLS stops them from accessing data
they shouldn't see.

HOW RLS WORKS:
Every database query goes through RLS check:
Query → RLS Policy Check → Allowed or Blocked

IS_ADMIN_USER() FUNCTION:
Used by all admin-only policies.
Checks: is auth.uid() in admin_users
with is_active = TRUE?

POLICIES BY TABLE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TABLE: services
┌────────────┬───────────────────────────────┐
│ Operation │ Who can do it │
├────────────┼───────────────────────────────┤
│ SELECT │ Anyone (only active services) │
│ INSERT │ Admin only │
│ UPDATE │ Admin only │
│ DELETE │ Admin only │
└────────────┴───────────────────────────────┘

TABLE: applications
┌────────────┬───────────────────────────────┐
│ Operation │ Who can do it │
├────────────┼───────────────────────────────┤
│ SELECT │ Admin (all rows) │
│ │ Public (own app via function) │
│ INSERT │ Anyone (submit form) │
│ UPDATE │ Admin only │
│ DELETE │ Admin only │
└────────────┴───────────────────────────────┘

TABLE: status_history
┌────────────┬───────────────────────────────┐
│ Operation │ Who can do it │
├────────────┼───────────────────────────────┤
│ SELECT │ Admin only │
│ INSERT │ Admin only (via trigger) │
└────────────┴───────────────────────────────┘

TABLE: admin_users
┌────────────┬───────────────────────────────┐
│ Operation │ Who can do it │
├────────────┼───────────────────────────────┤
│ SELECT │ Admin only │
│ INSERT │ Admin only │
│ UPDATE │ Admin only │
└────────────┴───────────────────────────────┘

TABLE: settings
┌────────────┬───────────────────────────────┐
│ Operation │ Who can do it │
├────────────┼───────────────────────────────┤
│ SELECT │ Admin only │
│ UPDATE │ Admin only │
└────────────┴───────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SECURITY DEFINER FUNCTIONS:
Some functions bypass RLS on purpose:
├── track_application()
│ → Public can search their own application
│ → Returns LIMITED fields only (safe)
│
├── verify_admin_login()
│ → Needs to check admin_users before login
│ → Returns only success/fail (safe)
│
└── get_admin_profile()
→ Needs to read admin data after login
→ Returns only that user's profile (safe)

---

6. HOW TO ADD A NEW ADMIN/AGENT

---

⚠️ IMPORTANT: Two steps are ALWAYS required.
Miss either step = user cannot login.

STEP 1: Create user in Supabase Auth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to: app.supabase.com
2. Open your project: aarohi-multiservices
3. Click "Authentication" in left sidebar
4. Click "Users" tab
5. Click "Add User" button
6. Click "Create New User"
7. Fill in:
   Email : newagent@email.com
   Password : SecurePassword@2026
8. Click "Create User"
9. COPY the UUID shown for this user
   It looks like: a1b2c3d4-e5f6-7890-abcd-ef1234567890

STEP 2: Add to admin_users table
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Go to Supabase SQL Editor and run:

INSERT INTO admin_users
(user_id, name, email, phone, role, added_by)
VALUES (
'PASTE-UUID-FROM-STEP-1',
'Agent Full Name',
'newagent@email.com',
'9876500000',
'agent', -- or 'admin'
(SELECT id FROM admin_users WHERE role = 'admin' LIMIT 1)
);

VERIFY:
SELECT name, email, role, is_active
FROM admin_users;

DONE! The agent can now login.

---

7. HOW TO DEACTIVATE AN ADMIN/AGENT

---

⚠️ NEVER delete users from admin_users.
Always deactivate (is_active = FALSE).
This preserves data integrity.

In Supabase SQL Editor:

-- Deactivate by email
UPDATE admin_users
SET is_active = FALSE
WHERE email = 'agent@email.com';

-- Verify
SELECT name, email, is_active
FROM admin_users
WHERE email = 'agent@email.com';

Result: User can no longer login.
Their past work/records are preserved.

TO REACTIVATE:
UPDATE admin_users
SET is_active = TRUE
WHERE email = 'agent@email.com';

---

8. HOW TO RESET AN ADMIN PASSWORD

---

Option 1: Via Supabase Dashboard

1. Go to Authentication → Users
2. Find the user
3. Click on them
4. Click "Reset Password"
5. Enter new password
6. Save

Option 2: Via SQL (not recommended)
Use Supabase dashboard method instead.
It is safer and easier.

---

9. ENVIRONMENT VARIABLES & KEYS

---

FILE: .env.local (in project root)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

RULES FOR THIS FILE:
├── NEVER commit this file to Git ❌
├── NEVER share these keys publicly ❌
├── .gitignore already excludes .env.local ✅
├── Each developer gets their own copy ✅
└── For deployment: add to hosting platform ✅

KEY TYPES EXPLAINED:
┌──────────────────┬────────────────────────────┐
│ Key Type │ Description │
├──────────────────┼────────────────────────────┤
│ anon key │ Safe for frontend code │
│ (public) │ RLS controls access │
│ │ Use this in React app │
├──────────────────┼────────────────────────────┤
│ service_role key │ DANGEROUS - bypasses RLS │
│ (secret) │ Never use in frontend │
│ │ Only for server-side code │
└──────────────────┴────────────────────────────┘

WHERE TO FIND KEYS:
Supabase Dashboard
→ Settings
→ API
→ Copy Project URL and anon public key

---

10. SECURITY BEST PRACTICES FOLLOWED

---

✅ No public registration
Only pre-added users can login

✅ Two-factor authentication
Password + OTP = double security

✅ Row Level Security on all tables
Database-level access control

✅ SECURITY DEFINER functions
Safe public access without exposing data

✅ Anon key only in frontend
Service role key never exposed

✅ Environment variables for secrets
Keys not hardcoded in source code

✅ is_active flag for deactivation
Users deactivated, not deleted

✅ Session auto-refresh
Users stay logged in securely

✅ Protected routes in React
Unauthorized users redirected to login

✅ Role-based access control
Admin vs Agent different permissions

✅ JWT tokens for session
Industry standard authentication

---

11. COMMON AUTH ERRORS & FIXES

---

ERROR: "Unauthorized. You are not registered"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE : Email not found in admin_users table
FIX : Add user to admin_users table (Step 2)

ERROR: "Invalid login credentials"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE : Wrong password OR user not in Auth
FIX : Check Supabase Auth → Users list
Reset password if needed

ERROR: "Invalid OTP"
━━━━━━━━━━━━━━━━━━━━
CAUSE : Wrong OTP entered
FIX : Click resend and try again

ERROR: "OTP expired"
━━━━━━━━━━━━━━━━━━━━
CAUSE : OTP older than 1 hour
FIX : Click resend to get new OTP

ERROR: "Account deactivated"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE : is_active = FALSE in admin_users
FIX : Set is_active = TRUE in database

ERROR: Session lost after browser refresh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAUSE : AuthContext not reading existing session
FIX : Check getSession() call in AuthContext
Supabase client should auto-restore it

================================================
END OF DOCUMENT 4
================================================
