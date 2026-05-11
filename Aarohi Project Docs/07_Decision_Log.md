================================================
DOCUMENT 7: DECISION LOG
Project: Online Service Portal
Client: Aarohi Multiservices
================================================

LAST UPDATED: June 2025

HOW TO READ THIS DOCUMENT:
Each decision has:
├── Decision # → Unique number
├── Date → When decision was made
├── Topic → What was decided
├── Context → Why this came up
├── Options → What choices were available
├── Decision → What we chose
├── Reason → Why we chose it
├── Approved By → Who confirmed it
└── Impact → What this affects

---

## DECISIONS LOG

════════════════════════════════════════════════
DECISION #01
════════════════════════════════════════════════
Date : June 2025
Topic : Technology Stack Selection
Context : Need to choose frontend and backend
technology for the portal

Options Considered:
├── Option A: React + Node.js + MySQL
├── Option B: React + Firebase
├── Option C: React (Vite) + Supabase ✅ CHOSEN
└── Option D: Next.js + Supabase

Decision : React (Vite) + Supabase

Reason:
├── Supabase removes need for custom backend
├── PostgreSQL is powerful and scalable
├── Built-in Auth saves weeks of work
├── Auto-generated APIs (no need to write them)
├── Vite is faster than Create React App
├── Free tier is generous for this project size
└── Perfect for a developer learning full-stack

Approved By: Developer + Client agreement
Impact : Entire project architecture

════════════════════════════════════════════════
DECISION #02
════════════════════════════════════════════════
Date : June 2025
Topic : Application ID Format
Context : Need a unique, readable ID for
each application

Options Considered:
├── Option A: OSP-YYYY-XXXX (Online Service Portal)
├── Option B: AMS-YYYY-XXXX (Aarohi Multiservices)
├── Option C: Random UUID (not human readable)
└── Option D: Simple number (1, 2, 3...)

Decision : AMS-YYYY-XXXX

Reason:
├── AMS matches the business name
├── YYYY includes year for easy sorting
├── XXXX is sequential (easy to track)
├── Human readable (customer can remember it)
├── Year resets counter annually
└── More professional than simple numbers

Note:
Originally started as OSP-YYYY-XXXX
Changed to AMS-YYYY-XXXX after developer
realized AMS better represents client brand
All functions updated to reflect this change

Approved By: Developer decision
Impact : generate_application_id() function
application_id_sequence table
settings table id_format field

════════════════════════════════════════════════
DECISION #03
════════════════════════════════════════════════
Date : June 2025
Topic : Authentication Method
Context : Admin panel needs secure login
No public registration allowed

Options Considered:
├── Option A: Username + Password only
├── Option B: Email OTP only
├── Option C: Email + Password + OTP ✅ CHOSEN
└── Option D: Google OAuth

Decision : Email + Password + OTP (two-factor)

Reason:
├── Password alone is not secure enough
├── OTP alone requires remembering nothing
│ which could be risky
├── Two factors = much higher security
├── Supabase supports both natively
├── No extra cost or third party needed
└── Industry standard for admin systems

Approved By: Developer decision
Impact : LoginPage.jsx
AuthContext.jsx
verify_admin_login() function

════════════════════════════════════════════════
DECISION #04
════════════════════════════════════════════════
Date : June 2025
Topic : No Public Registration
Context : How should staff access admin panel?

Options Considered:
├── Option A: Public registration with approval
├── Option B: Pre-added users only ✅ CHOSEN
└── Option C: Single shared password

Decision : Pre-added users only
Admin manually creates staff accounts

Reason:
├── This is a private business tool
├── No unauthorized person should ever
│ be able to request access
├── Simple and secure approach
├── Admin has full control over who can login
└── Matches client's requirement exactly

Approved By: Client confirmed
Impact : admin_users table
verify_admin_login() function
No registration page needed

════════════════════════════════════════════════
DECISION #05
════════════════════════════════════════════════
Date : June 2025
Topic : Document Upload Feature
Context : Initial project scope included
document upload for applications

Options Considered:
├── Option A: Allow document uploads ✅ Initially planned
└── Option B: Remove feature completely ✅ FINAL DECISION

Decision : Remove document upload feature

Reason:
├── Client clarified this is not needed
├── Applications only need:
│ ID, Name, Phone, Service,
│ Cost, Status, Payment, Dates
├── Adding unused features = more complexity
├── More storage costs
└── Against lean development principle

Approved By: Client confirmed explicitly
Impact : Supabase Storage bucket not created
No storage policies needed
applications table has no file fields
Simpler application form

════════════════════════════════════════════════
DECISION #06
════════════════════════════════════════════════
Date : June 2025
Topic : Remarks Field on Applications
Context : Initial design included remarks/notes
field on each application

Options Considered:
├── Option A: Keep remarks field
└── Option B: Remove remarks field ✅ CHOSEN

Decision : Remove remarks field

Reason:
├── Client looked at application detail modal
│ screenshot and confirmed not needed
├── Admin only needs to update:
│ Status and Payment Status
├── Keeping unused fields adds confusion
└── Can always add later if client requests

Approved By: Client confirmed
Impact : remarks column removed from
applications table
Application detail modal simplified

════════════════════════════════════════════════
DECISION #07
════════════════════════════════════════════════
Date : June 2025
Topic : Online vs Offline Application Tracking
Context : Need to distinguish between
applications from website vs
manually added by admin

Options Considered:
├── Option A: Separate table for source tracking
├── Option B: Add source column to applications ✅
└── Option C: Don't track source at all

Decision : Add source column to applications table
Values: 'online' or 'offline'

Reason:
├── Source is a simple single value
├── It belongs TO the application record
├── No need for separate table
├── Separate table = unnecessary complexity
│ and extra JOIN queries needed
├── Easy to filter: WHERE source = 'offline'
└── Rule: Only create new table when data
has its own properties/relationships

Approved By: Developer decision
Client requested this feature

Impact : source column added to applications
get_dashboard_stats() updated
Both forms set source automatically
online_count and offline_count
added to dashboard stats

════════════════════════════════════════════════
DECISION #08
════════════════════════════════════════════════
Date : June 2025
Topic : Revenue Data Source
Context : Revenue page needs payment data
Should we create separate payments table?

Options Considered:
├── Option A: Separate payments table
└── Option B: Use applications table directly ✅

Decision : Use applications table directly
Filter where payment_status = 'Paid'

Reason:
├── Each application has exactly one payment
├── No need for separate payment records
├── Payment info already on application row:
│ cost + payment_status + dates
├── Simpler queries
├── No extra table to maintain
└── Client confirmed this approach

Approved By: Client confirmed
Impact : No payments table created
Revenue page queries
applications table directly
Revenue calculations done
in frontend React code

════════════════════════════════════════════════
DECISION #09
════════════════════════════════════════════════
Date : June 2025
Topic : service_name Saved Directly
(Denormalization)
Context : Applications link to services via
service_id (foreign key)
Should we also save service name?

Options Considered:
├── Option A: Only store service_id
│ (fetch name via JOIN always)
└── Option B: Store both service_id AND
service_name directly ✅ CHOSEN

Decision : Save service_name directly
alongside service_id

Reason:
├── If admin edits service name later,
│ old applications would show new name
│ This is WRONG - historical data matters
├── Saving name at time of application
│ preserves accurate records
├── Slightly more storage but much safer
├── This is called "denormalization"
│ Done intentionally for data integrity
└── Faster queries (no JOIN needed for name)

Approved By: Developer decision
Impact : applications table has both
service_id AND service_name columns
Both filled when application created

════════════════════════════════════════════════
DECISION #10
════════════════════════════════════════════════
Date : June 2025
Topic : Agents Page Implementation Level
Context : Agents page was in UI design but
client has no specific requirements

Options Considered:
├── Option A: Full agent assignment system
│ (agents assigned to applications)
├── Option B: Basic CRUD only ✅ CHOSEN
└── Option C: Skip agents page entirely

Decision : Basic implementation
Admin can Add/Edit/Deactivate agents
No application assignment to agents

Reason:
├── Client has no specific requirement for agents
├── UI design exists but no detailed spec
├── Building full assignment system now =
│ wasted time if client doesn't need it
├── Basic CRUD covers immediate needs
├── Can expand later if client requests
└── Follow lean development: build what is needed

Approved By: Developer recommendation
Client has no objection
Impact : AgentsPage.jsx basic implementation
admin_users table used for agents
No separate assignment table needed
Future ready if expansion needed

════════════════════════════════════════════════
DECISION #11
════════════════════════════════════════════════
Date : June 2025
Topic : State Management Approach
Context : React apps need to manage data/state
Many options available

Options Considered:
├── Option A: Redux (complex state management)
├── Option B: Zustand (lightweight state library)
├── Option C: Context API + useState ✅ CHOSEN
└── Option D: Jotai or Recoil

Decision : React Context API + useState
No external state library

Reason:
├── Our app is not complex enough for Redux
├── Only global state needed: auth/user info
├── All other state is local to each page
├── Context API is built into React
│ No extra package needed
├── Easier to understand for learning
└── Can always add Zustand later if needed

Approved By: Developer decision
Impact : AuthContext.jsx created
useAuth hook created
No Redux or Zustand installed

════════════════════════════════════════════════
DECISION #12
════════════════════════════════════════════════
Date : June 2025
Topic : Pagination Size
Context : Applications table could have
thousands of records

Options Considered:
├── Option A: Load all records at once
├── Option B: 10 records per page ✅ CHOSEN
├── Option C: 20 records per page
└── Option D: Infinite scroll

Decision : 10 records per page
with Prev/Next pagination

Reason:
├── Loading all records = slow for large data
├── 10 rows fits well on screen without scrolling
├── Simple Prev/Next matches UI design
├── Easy to implement with Supabase
│ .range(from, to) method
├── Infinite scroll is complex to implement
└── Matches the UI design from client

Approved By: Developer decision
Matches client UI design
Impact : ApplicationsPage.jsx pagination
DashboardPage.jsx recent list
Supabase queries use .range()

════════════════════════════════════════════════
DECISION #13
════════════════════════════════════════════════
Date : June 2025
Topic : Public Application Tracking Security
Context : Public users need to track their
application without logging in
But we cannot expose all data

Options Considered:
├── Option A: Direct table access (unsafe)
└── Option B: SECURITY DEFINER function ✅

Decision : Create track_application() function
with SECURITY DEFINER
Returns limited fields only

Reason:
├── Cannot give public direct table access
│ That would expose all applications
├── SECURITY DEFINER bypasses RLS safely
├── Function returns ONLY what customer needs:
│ their own application details
├── No internal IDs exposed
├── No other customer data visible
└── Industry standard approach for this pattern

Approved By: Developer decision
Impact : track_application() function
Public tracking page uses this
RLS policies still protect table

════════════════════════════════════════════════
DECISION #14
════════════════════════════════════════════════
Date : June 2025
Topic : Email Field on Forms
Context : Should email be required or optional?

Options Considered:
├── Option A: Required on all forms
├── Option B: Optional on public form only ✅
└── Option C: Not collected at all

Decision : Email optional on public form
Email not on admin add form

Reason:
├── Many customers may not have email
│ or may not want to share it
├── Phone number is sufficient for tracking
├── Making optional = less friction to apply
│ = more applications submitted
├── Admin adding offline entry:
│ customer is present in person
│ email not critical at that point
└── Client confirmed this approach

Approved By: Client confirmed
Impact : email column is nullable
Public form shows optional label
Admin form has no email field

════════════════════════════════════════════════
DECISION #15
════════════════════════════════════════════════
Date : June 2025
Topic : Deactivate vs Delete for Agents
Context : When removing an agent from system
Should we delete or deactivate?

Options Considered:
├── Option A: Hard delete (remove from DB)
└── Option B: Soft delete (is_active = false) ✅

Decision : Soft delete using is_active flag

Reason:
├── If agent handled applications before,
│ deleting them could break data integrity
├── Historical records need to stay intact
├── Easy to reactivate if needed
├── Standard practice in business systems
├── Audit trail preserved
└── No accidental permanent data loss

Approved By: Developer decision
Impact : admin_users has is_active column
Deactivate sets is_active = FALSE
User cannot login when inactive
Record still exists in database

================================================
SUMMARY TABLE
================================================

┌────┬──────────────────────────────┬─────────────────┬───────────┐
│ # │ Decision Topic │ What We Chose │ Approved │
├────┼──────────────────────────────┼─────────────────┼───────────┤
│ 01 │ Technology Stack │ React + Supabase│ Both │
│ 02 │ Application ID Format │ AMS-YYYY-XXXX │ Developer │
│ 03 │ Authentication Method │ Pass + OTP │ Developer │
│ 04 │ No Public Registration │ Pre-added only │ Client │
│ 05 │ Document Upload │ Removed │ Client │
│ 06 │ Remarks Field │ Removed │ Client │
│ 07 │ Online/Offline Tracking │ source column │ Both │
│ 08 │ Revenue Data Source │ applications tbl│ Client │
│ 09 │ service_name Denormalization │ Save directly │ Developer │
│ 10 │ Agents Page Level │ Basic CRUD │ Both │
│ 11 │ State Management │ Context API │ Developer │
│ 12 │ Pagination Size │ 10 per page │ Developer │
│ 13 │ Public Tracking Security │ DEFINER function│ Developer │
│ 14 │ Email Field │ Optional/removed│ Client │
│ 15 │ Deactivate vs Delete │ Soft delete │ Developer │
└────┴──────────────────────────────┴─────────────────┴───────────┘

================================================
HOW TO ADD NEW DECISIONS
================================================

When a new decision is made:

1. Copy the template below
2. Fill in all fields
3. Add to this document
4. Update summary table

TEMPLATE:
════════════════════════════════════════════════
DECISION #XX
════════════════════════════════════════════════
Date :
Topic :
Context :

Options Considered:
├── Option A:
└── Option B:

Decision :
Reason :
Approved By:
Impact :

================================================
END OF DOCUMENT 7
================================================
