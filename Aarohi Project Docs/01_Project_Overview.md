================================================
DOCUMENT 1: PROJECT OVERVIEW & SCOPE
Project: Online Service Portal
Client: aaron Multiservices
================================================

LAST UPDATED: June 2025
STATUS: In Development

---

1. CLIENT INFORMATION

---

Business Name : Aarohi Multiservices
Business Type : Government Documentation Services
Client Contact: [Client Name]
Client Phone : [Client Phone]
Client Email : [Client Email]

---

2. WHAT IS THIS PROJECT?

---

A web-based platform that digitizes and manages
government documentation services offered by
Aarohi Multiservices.

Services handled:

- Aadhaar Address Update
- PAN Card (New/Correction)
- GST Registration
- Passport Services
- Udyam Aadhaar Registration
- Food License (FSSAI)
- Shop Act Registration
- EPFO Services
- Aadhaar-PAN Linking
- Voter ID Card
- Insurance Services
- Police Verification

---

3. PROBLEM BEING SOLVED

---

BEFORE this system:

- Customer calls on phone to apply
- Staff writes details on paper
- WhatsApp used for communication
- No tracking for customers
- No organized records
- No revenue tracking
- High chance of errors and duplicates

AFTER this system:

- Customer applies online via website
- Unique Application ID generated automatically
- Customer can track application anytime
- Admin manages everything from dashboard
- Revenue tracked automatically
- Full audit trail of status changes

---

4. WHO USES THIS SYSTEM?

---

USER TYPE 1: Public Customer

- Visits website
- Browses services
- Submits application form
- Tracks application by ID or phone

USER TYPE 2: Admin

- Full access to admin panel
- Can manage all applications
- Can manage services
- Can manage agents
- Can view revenue
- Can change settings

USER TYPE 3: Agent

- Limited access to admin panel
- Can view and manage applications
- Cannot access revenue or settings
- Works under the main admin

---

5. TWO SIDES OF THE PLATFORM

---

SIDE 1: Public Website (No login needed)

- Homepage with service listing
- Apply for service form
- Track application page
- Contact information

SIDE 2: Admin Panel (Login required)

- OTP-based secure login
- Dashboard with stats
- Applications management
- Add offline applications
- Revenue tracking
- Services management
- Agents management
- Settings

---

6. WHAT IS IN SCOPE (We are building this)

---

✅ Public homepage with service cards
✅ Single application form for all services
✅ Auto cost fetch based on selected service
✅ Application ID generation (AMS-YYYY-XXXX)
✅ Public application tracking (by ID or phone)
✅ OTP-based admin login (no public registration)
✅ Admin dashboard with stats
✅ Applications table with filters and search
✅ Application detail view (status + payment update)
✅ Offline application entry by admin
✅ Revenue tracking (from paid applications)
✅ Services management (add/edit/toggle)
✅ Agents management (add/update/delete)
✅ Settings page (business info + preferences)
✅ Online vs Offline application tracking

---

7. WHAT IS OUT OF SCOPE (Not building this)

---

❌ Document/file upload feature
❌ SMS or WhatsApp notifications (future)
❌ Online payment gateway (future)
❌ Multi-branch support (future)
❌ Customer login/registration
❌ Mobile app
❌ Email notifications (future)

---

8. TECHNOLOGY STACK

---

Frontend : React (Vite) + Tailwind CSS
Backend : Supabase (PostgreSQL)
Auth : Supabase Auth (Email OTP)
Storage : Not used (no file uploads)
Hosting : To be decided
IDE : Visual Studio Code

---

9. PROJECT TIMELINE

---

Phase 1: System Understanding ✅ Done
Phase 2: Database Schema ✅ Done
Phase 3: Application ID Logic ✅ Done
Phase 4: Row Level Security ✅ Done
Phase 5: Authentication Setup ✅ Done
Phase 6: React Project Setup ✅ Done
Phase 7: Frontend - Public Pages 🔄 In Progress
Phase 8: Frontend - Admin Panel ⏳ Pending
Phase 9: Testing & Bug Fixes ⏳ Pending
Phase 10: Deployment ⏳ Pending

---

10. KEY DECISIONS MADE

---

- Application ID format: AMS-YYYY-XXXX
  (Changed from OSP to AMS = Aarohi Multiservices)

- No document upload feature
  (Client requirement does not include it)

- No remarks field on applications
  (Removed after client clarification)

- Source tracking added (online/offline)
  (To distinguish website vs manual entries)

- Revenue data from applications table directly
  (No separate payments table needed)

- Agents page: basic implementation
  (No specific client requirement, keeping it simple)

================================================
END OF DOCUMENT 1
================================================
