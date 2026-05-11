================================================
DOCUMENT 3: DATABASE DOCUMENTATION
Project: Online Service Portal
Client: Aarohi Multiservices
Database: PostgreSQL (via Supabase)
================================================

LAST UPDATED: June 2025

---

1. DATABASE OVERVIEW

---

Platform : Supabase (PostgreSQL)
Region : Southeast Asia (Singapore)
Schema : public

TOTAL TABLES: 6
├── services
├── applications
├── status_history
├── admin_users
├── settings
└── application_id_sequence

TOTAL FUNCTIONS: 8
├── generate_application_id()
├── set_application_id()
├── record_status_change()
├── set_completed_date()
├── is_admin_user()
├── verify_admin_login()
├── get_admin_profile()
├── get_dashboard_stats()
├── track_application()
└── get_all_agents()

TOTAL TRIGGERS: 3
├── trigger_set_application_id
├── trigger_record_status_change
└── trigger_set_completed_date

---

2. TABLE DETAILS

---

════════════════════════════════════════════════
TABLE 1: services
PURPOSE: Stores all services offered by Aarohi
════════════════════════════════════════════════

COLUMN DETAILS:
┌─────────────┬──────────────┬──────────┬─────────────────────┐
│ Column Name │ Data Type │ Nullable │ Default │
├─────────────┼──────────────┼──────────┼─────────────────────┤
│ id │ UUID │ NO │ gen_random_uuid() │
│ name │ TEXT │ NO │ - │
│ description │ TEXT │ YES │ - │
│ documents │ TEXT │ YES │ - │
│ procedures │ TEXT │ YES │ - │
│ cost │ NUMERIC(10,2)│ NO │ 0 │
│ duration │ TEXT │ YES │ - │
│ is_active │ BOOLEAN │ NO │ TRUE │
│ created_at │ TIMESTAMPTZ │ NO │ NOW() │
└─────────────┴──────────────┴──────────┴─────────────────────┘

CONSTRAINTS:

- id is PRIMARY KEY
- name cannot be empty
- cost cannot be negative

RLS POLICIES:

- Public can SELECT (where is_active = TRUE)
- Admin only: INSERT, UPDATE, DELETE

RELATIONSHIPS:

- Referenced by applications.service_id

NOTES:

- is_active = FALSE hides service from public
- documents field: comma separated list
- procedures field: numbered steps as text
- 12 services pre-loaded in seed data

────────────────────────────────────────────────

════════════════════════════════════════════════
TABLE 2: applications
PURPOSE: Every application submitted lives here
Both online and offline applications
════════════════════════════════════════════════

COLUMN DETAILS:
┌────────────────┬──────────────┬──────────┬──────────────────┐
│ Column Name │ Data Type │ Nullable │ Default │
├────────────────┼──────────────┼──────────┼──────────────────┤
│ id │ UUID │ NO │ gen_random_uuid()│
│ application_id │ TEXT │ NO │ AUTO (trigger) │
│ name │ TEXT │ NO │ - │
│ phone │ TEXT │ NO │ - │
│ email │ TEXT │ YES │ - │
│ service_id │ UUID │ YES │ - │
│ service_name │ TEXT │ NO │ - │
│ cost │ NUMERIC(10,2)│ NO │ 0 │
│ status │ TEXT │ NO │ 'Submitted' │
│ payment_status │ TEXT │ NO │ 'Pending' │
│ source │ TEXT │ NO │ 'online' │
│ created_at │ TIMESTAMPTZ │ NO │ NOW() │
│ completed_at │ TIMESTAMPTZ │ YES │ NULL │
└────────────────┴──────────────┴──────────┴──────────────────┘

CONSTRAINTS:

- id is PRIMARY KEY
- application_id is UNIQUE
- status CHECK: must be one of:
  'Submitted', 'In Process', 'On Hold',
  'Completed', 'Rejected'
- payment_status CHECK: must be one of:
  'Pending', 'Paid'
- source CHECK: must be one of:
  'online', 'offline'

FOREIGN KEYS:

- service_id → services.id (ON DELETE SET NULL)
  If a service is deleted, service_id becomes NULL
  But service_name is still saved (so data is safe)

RLS POLICIES:

- Public: INSERT only (submit form)
- Public: SELECT own application
  (via track_application function)
- Admin: SELECT all, UPDATE, DELETE

TRIGGERS ON THIS TABLE:

1. trigger_set_application_id (BEFORE INSERT)
   → Auto generates AMS-YYYY-XXXX

2. trigger_record_status_change (AFTER UPDATE)
   → Logs status changes to status_history

3. trigger_set_completed_date (BEFORE UPDATE)
   → Sets completed_at when status = Completed
   → Clears completed_at if un-completed

NOTES:

- application_id format: AMS-YYYY-XXXX
  Example: AMS-2026-0001
- service_name is saved directly (denormalized)
  This is intentional - if service is edited later,
  original application still shows correct name
- source = 'online' when submitted from website
- source = 'offline' when added by admin/agent
- completed_at is NULL until status = Completed
- email is optional for public form

────────────────────────────────────────────────

════════════════════════════════════════════════
TABLE 3: status_history
PURPOSE: Records every status change
For audit trail and transparency
════════════════════════════════════════════════

COLUMN DETAILS:
┌────────────────┬─────────────┬──────────┬──────────────────┐
│ Column Name │ Data Type │ Nullable │ Default │
├────────────────┼─────────────┼──────────┼──────────────────┤
│ id │ UUID │ NO │ gen_random_uuid()│
│ application_id │ UUID │ YES │ - │
│ old_status │ TEXT │ YES │ - │
│ new_status │ TEXT │ NO │ - │
│ changed_by │ UUID │ YES │ - │
│ created_at │ TIMESTAMPTZ │ NO │ NOW() │
└────────────────┴─────────────┴──────────┴──────────────────┘

CONSTRAINTS:

- id is PRIMARY KEY

FOREIGN KEYS:

- application_id → applications.id
  (ON DELETE CASCADE)
  If application deleted, its history is also deleted

RLS POLICIES:

- Admin only: SELECT, INSERT

NOTES:

- Populated automatically by trigger
- Admin never manually inserts here
- old_status is NULL for first status entry
- changed_by stores admin user UUID (future use)
- CASCADE delete keeps data clean

────────────────────────────────────────────────

════════════════════════════════════════════════
TABLE 4: admin_users
PURPOSE: Pre-authorized staff members
Links to Supabase Auth users
════════════════════════════════════════════════

COLUMN DETAILS:
┌─────────────┬─────────────┬──────────┬──────────────────┐
│ Column Name │ Data Type │ Nullable │ Default │
├─────────────┼─────────────┼──────────┼──────────────────┤
│ id │ UUID │ NO │ gen_random_uuid()│
│ user_id │ UUID │ YES │ - │
│ name │ TEXT │ NO │ - │
│ email │ TEXT │ NO │ - │
│ phone │ TEXT │ NO │ - │
│ role │ TEXT │ NO │ 'agent' │
│ is_active │ BOOLEAN │ NO │ TRUE │
│ added_by │ UUID │ YES │ - │
│ created_at │ TIMESTAMPTZ │ NO │ NOW() │
└─────────────┴─────────────┴──────────┴──────────────────┘

CONSTRAINTS:

- id is PRIMARY KEY
- email is UNIQUE
- phone is UNIQUE
- role CHECK: must be 'admin' or 'agent'

FOREIGN KEYS:

- user_id → auth.users.id (ON DELETE CASCADE)
  Supabase built-in auth table
- added_by → admin_users.id (ON DELETE SET NULL)
  Self-referencing: which admin added this agent

RLS POLICIES:

- Admin only: SELECT, INSERT, UPDATE

ROLES EXPLAINED:

- 'admin' → Full access to everything
- 'agent' → Can manage applications only
  Cannot access revenue, settings

NOTES:

- User MUST exist in Supabase Auth first
- Then add to this table with their auth UUID
- is_active = FALSE deactivates without deleting
- added_by tracks who created this agent
- Only ONE admin in the system currently
- Multiple agents can be added under admin

────────────────────────────────────────────────

════════════════════════════════════════════════
TABLE 5: settings
PURPOSE: Business info and system preferences
Single row table (only one record)
════════════════════════════════════════════════

COLUMN DETAILS:
┌────────────────┬─────────────┬──────────┬─────────────────────────┐
│ Column Name │ Data Type │ Nullable │ Default │
├────────────────┼─────────────┼──────────┼─────────────────────────┤
│ id │ UUID │ NO │ gen_random_uuid() │
│ business_name │ TEXT │ YES │ 'Aarohi Multiservices' │
│ contact │ TEXT │ YES │ '' │
│ email │ TEXT │ YES │ '' │
│ default_status │ TEXT │ YES │ 'Submitted' │
│ id_format │ TEXT │ YES │ 'AMS-YYYY-XXXX' │
│ notifications │ BOOLEAN │ YES │ FALSE │
│ updated_at │ TIMESTAMPTZ │ YES │ NOW() │
└────────────────┴─────────────┴──────────┴─────────────────────────┘

CONSTRAINTS:

- id is PRIMARY KEY

RLS POLICIES:

- Admin only: SELECT, UPDATE

NOTES:

- Always has exactly ONE row
- Never INSERT a new row (update existing)
- notifications = FALSE (feature not built yet)
- id_format is for display only
  Actual ID logic is in generate_application_id()
- updated_at should be set to NOW() on every update

────────────────────────────────────────────────

════════════════════════════════════════════════
TABLE 6: application_id_sequence
PURPOSE: Tracks the last used ID number per year
Ensures unique sequential IDs
════════════════════════════════════════════════

COLUMN DETAILS:
┌─────────────┬───────────┬──────────┬─────────┐
│ Column Name │ Data Type │ Nullable │ Default │
├─────────────┼───────────┼──────────┼─────────┤
│ year │ INTEGER │ NO │ - │
│ last_no │ INTEGER │ NO │ 0 │
└─────────────┴───────────┴──────────┴─────────┘

CONSTRAINTS:

- year is PRIMARY KEY

NOTES:

- New row added automatically each new year
- last_no increments with each new application
- NEVER manually edit this table
- Current state: year=2026, last_no=0
- On Jan 1 2027, new row added: year=2027, last_no=0

---

3. TABLE RELATIONSHIPS DIAGRAM

---

auth.users (Supabase Built-in)
│
│ user_id
▼
admin_users ──(added_by)──► admin_users
│ (self reference)
│
│ (future: changed_by)
▼
status_history ◄── application_id ──┐
│
services ──────► applications ──────┘
(id) (service_id)
(service_name saved too)

application_id_sequence
│
│ (used by)
▼
generate_application_id() function

---

4. TRIGGERS REFERENCE

---

════════════════════════════════════════════════
TRIGGER 1: trigger_set_application_id
════════════════════════════════════════════════
TABLE : applications
FIRES : BEFORE INSERT
FUNCTION: set_application_id()

WHAT IT DOES:
Checks if application_id is empty.
If yes, calls generate_application_id()
and sets it on the new row.

WHEN IT RUNS:
Every time a new application is inserted.
Both from public website and admin panel.

RESULT:
application_id is always set automatically.
Developer never needs to pass it manually.

────────────────────────────────────────────────

════════════════════════════════════════════════
TRIGGER 2: trigger_record_status_change
════════════════════════════════════════════════
TABLE : applications
FIRES : AFTER UPDATE
FUNCTION: record_status_change()

WHAT IT DOES:
Compares OLD.status with NEW.status.
If they are different, inserts a row
into status_history table.

WHEN IT RUNS:
Every time an application row is updated.
Only records if status actually changed.
Ignores payment_status changes.

RESULT:
Complete history of status changes saved.
Used for audit trail and transparency.

────────────────────────────────────────────────

════════════════════════════════════════════════
TRIGGER 3: trigger_set_completed_date
════════════════════════════════════════════════
TABLE : applications
FIRES : BEFORE UPDATE
FUNCTION: set_completed_date()

WHAT IT DOES:
Case 1: If new status = 'Completed'
AND old status was not 'Completed'
→ Sets completed_at = NOW()

Case 2: If old status was 'Completed'
AND new status is different
→ Clears completed_at = NULL

WHEN IT RUNS:
Every time application status is updated.

RESULT:
Completion date is always accurate.
Never needs to be set manually.

---

5. FUNCTIONS REFERENCE

---

════════════════════════════════════════════════
FUNCTION 1: generate_application_id()
════════════════════════════════════════════════
RETURNS : TEXT
SECURITY: Standard
CALLED BY: set_application_id() trigger

LOGIC:

1. Get current year from database
2. Insert year into sequence table if new year
3. Increment last_no for this year
4. Format: 'AMS-' + year + '-' + padded number
5. Return formatted ID

OUTPUT EXAMPLE: AMS-2026-0001

────────────────────────────────────────────────

════════════════════════════════════════════════
FUNCTION 2: is_admin_user()
════════════════════════════════════════════════
RETURNS : BOOLEAN
SECURITY: SECURITY DEFINER
CALLED BY: All RLS policies

LOGIC:
Checks if auth.uid() (logged in user)
exists in admin_users table
with is_active = TRUE

RETURNS: TRUE if admin, FALSE if not

────────────────────────────────────────────────

════════════════════════════════════════════════
FUNCTION 3: verify_admin_login(check_email)
════════════════════════════════════════════════
RETURNS : JSON
SECURITY: SECURITY DEFINER
CALLED BY: React login page (before OTP)

INPUT:

- check_email: TEXT (email to verify)

OUTPUT (success):
{
"success": true,
"message": "Verified. OTP will be sent.",
"name": "Rahul Kangane",
"role": "admin"
}

OUTPUT (failure):
{
"success": false,
"message": "Unauthorized. You are not
registered as admin."
}

────────────────────────────────────────────────

════════════════════════════════════════════════
FUNCTION 4: get_admin_profile()
════════════════════════════════════════════════
RETURNS : JSON
SECURITY: SECURITY DEFINER
CALLED BY: React after successful login

LOGIC:
Uses auth.uid() to find current user
in admin_users table.
Returns their profile details.

OUTPUT (success):
{
"success": true,
"id": "uuid",
"name": "Rahul Kangane",
"email": "admin@aarohi.com",
"phone": "9876543210",
"role": "admin"
}

────────────────────────────────────────────────

════════════════════════════════════════════════
FUNCTION 5: get_dashboard_stats()
════════════════════════════════════════════════
RETURNS : JSON
SECURITY: SECURITY DEFINER
CALLED BY: React dashboard page

LOGIC:
Counts applications by various criteria.
Only accessible to admin users.

OUTPUT:
{
"success": true,
"total_apps": 1245,
"in_process": 342,
"completed": 768,
"pending_today": 29,
"total_revenue": 245000,
"pending_revenue": 12500,
"online_count": 892,
"offline_count": 353
}

────────────────────────────────────────────────

════════════════════════════════════════════════
FUNCTION 6: track_application()
════════════════════════════════════════════════
RETURNS : TABLE (multiple rows possible)
SECURITY: SECURITY DEFINER
CALLED BY: React public tracking page

INPUT:

- search_id : TEXT (application ID or NULL)
- search_phone : TEXT (phone number or NULL)

LOGIC:
Searches applications table by ID or phone.
Returns limited fields only (no internal IDs).
Bypasses RLS safely via SECURITY DEFINER.

RETURNED FIELDS:

- application_id
- name
- service_name
- cost
- status
- payment_status
- created_at
- completed_at

────────────────────────────────────────────────

════════════════════════════════════════════════
FUNCTION 7: get_all_agents()
════════════════════════════════════════════════
RETURNS : TABLE
SECURITY: SECURITY DEFINER
CALLED BY: React agents page

LOGIC:
Returns all rows from admin_users table.
Only accessible to admin users.

RETURNED FIELDS:

- id
- name
- email
- phone
- role
- is_active
- created_at

---

6. SAMPLE SQL QUERIES

---

(For reference and debugging)

── APPLICATIONS ──────────────────────────────

-- Get all applications (admin view)
SELECT
application_id,
name,
phone,
service_name,
cost,
status,
payment_status,
source,
created_at,
completed_at
FROM applications
ORDER BY created_at DESC;

-- Get applications by status
SELECT \* FROM applications
WHERE status = 'In Process'
ORDER BY created_at DESC;

-- Get applications by service
SELECT \* FROM applications
WHERE service_name = 'GST Registration'
ORDER BY created_at DESC;

-- Get applications submitted today
SELECT \* FROM applications
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Get online vs offline count
SELECT source, COUNT(\*) as total
FROM applications
GROUP BY source;

-- Search applications (name, phone, ID)
SELECT \* FROM applications
WHERE
name ILIKE '%rahul%'
OR phone LIKE '%9876%'
OR application_id ILIKE '%AMS-2026%';

── REVENUE ───────────────────────────────────

-- Total revenue (all paid)
SELECT SUM(cost) as total_revenue
FROM applications
WHERE payment_status = 'Paid';

-- Today's revenue
SELECT SUM(cost) as today_revenue
FROM applications
WHERE payment_status = 'Paid'
AND DATE(created_at) = CURRENT_DATE;

-- This month's revenue
SELECT SUM(cost) as month_revenue
FROM applications
WHERE payment_status = 'Paid'
AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

-- Pending payments total
SELECT SUM(cost) as pending_total
FROM applications
WHERE payment_status = 'Pending';

── SERVICES ──────────────────────────────────

-- Get all active services
SELECT id, name, cost, duration
FROM services
WHERE is_active = TRUE
ORDER BY name;

-- Get all services including inactive
SELECT id, name, cost, is_active
FROM services
ORDER BY name;

── STATUS HISTORY ────────────────────────────

-- Get history for one application
SELECT
old_status,
new_status,
created_at
FROM status_history
WHERE application_id = 'uuid-here'
ORDER BY created_at ASC;

── ADMIN USERS ───────────────────────────────

-- Get all agents only
SELECT name, email, phone, is_active
FROM admin_users
WHERE role = 'agent'
ORDER BY created_at DESC;

-- Get admin only
SELECT name, email, phone
FROM admin_users
WHERE role = 'admin';

── SETTINGS ──────────────────────────────────

-- Get settings (always one row)
SELECT \* FROM settings LIMIT 1;

-- Update business name
UPDATE settings
SET
business_name = 'Aarohi Multiservices',
updated_at = NOW();

── SEQUENCE ──────────────────────────────────

-- Check current sequence
SELECT \* FROM application_id_sequence;

-- Reset sequence (ONLY for testing!)
UPDATE application_id_sequence
SET last_no = 0
WHERE year = 2026;

---

7. IMPORTANT RULES & WARNINGS

---

⚠️ NEVER manually edit application_id_sequence
Let the trigger handle it always.

⚠️ NEVER insert directly into status_history
The trigger does this automatically.

⚠️ NEVER remove the service_name column
Even though service_id exists,
service_name is saved separately on purpose.
If service is renamed later, old applications
still show the original service name.

⚠️ NEVER add a second row to settings table
Always UPDATE the existing row.

⚠️ Always test RLS policies after any change
A wrong policy can lock out all users.

✅ When adding a new admin/agent:
Step 1: Create user in Supabase Auth
Step 2: Copy the UUID
Step 3: Insert into admin_users with that UUID
Both steps are required.

✅ When deactivating an agent:
Set is_active = FALSE
Do NOT delete (preserves data integrity)

---

8. DATABASE CREDENTIALS LOCATION

---

Supabase Project URL : Stored in .env.local
Supabase Anon Key : Stored in .env.local
Supabase Dashboard : app.supabase.com
Database Password : Stored separately (safely!)
Project Name : aarohi-multiservices
Project Region : Southeast Asia (Singapore)

NOTE: Never commit .env.local to Git.
It is listed in .gitignore automatically.

================================================
END OF DOCUMENT 3
================================================
