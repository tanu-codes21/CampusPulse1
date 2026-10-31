# CampusPulse – Student Productivity & Campus Management Platform

> **"Paste the clutter. Master your day."**

CampusPulse transforms forwarded WhatsApp circulars, unstructured campus announcements, and visual poster flyers into structured academic schedules, deadline countdowns, and actionable study tasks.

---

## 🎨 Minimalist Light Neomorphic Design System

Built strictly adhering to the requested design specifications:
- **Default Theme:** Minimalist Light Neomorphic
- **Background:** Warm Off-White (`#F4F5F0`)
- **Cards:** Soft White (`#FAFBF8`)
- **Primary Text:** Deep Charcoal (`#222831`)
- **Secondary Text:** Muted Slate (`#64748B`)
- **Soft Borders:** `#E5E7EB`
- **Soft Extruded Shadows & Raised Panels:** Subtle dual-tone lighting (`shadow-neo-raised`, `shadow-neo-flat`)
- **Gentle Inset Shadows:** Styled for text inputs and textareas (`shadow-neo-inset`)
- **Feature Accent Palette:**
  - 📢 **Smart Notice Centre:** Cyan (`#06B6D4`)
  - 📅 **Academic Planner:** Blue (`#3B82F6`)
  - ✨ **Campus AI Assistant:** Magenta (`#D946EF`)
  - 📁 **Document Vault:** Purple (`#8B5CF6`)
  - 👥 **Campus Community:** Orange (`#F97316`)
- **Dark Mode Support:** Switchable anytime in Settings.

---

## 🧭 Strict Navigation Layout

All primary navigation is located **ONLY in the left sidebar** (collapsible drawer on mobile):
1. **Dashboard**
2. **Smart Notice Centre**
3. **Academic Planner**
4. **Campus AI Assistant**
5. **Document Vault**
6. **Campus Community**
7. **Settings**

- **Header:** Features the universal **Global Search Bar** (`Ctrl + K`), Notification Alerts Dropdown, and the user's **Profile Picture & Account Menu** anchored at the top right.

---

## 🚀 Key Modules & Feature Highlights

### 1. Dashboard
- Prominently displays the core tagline: *"Paste the clutter. Master your day."*
- Real-time KPI statistics: Total Notices, Pending Tasks, Upcoming Deadlines, and Upcoming Events.
- **Quick Actions:** One-click shortcuts to paste notice text, create new tasks, query the Campus AI, or upload a document.
- **Today's Priorities:** Urgent & High priority tasks with live status completion toggles.
- **Recently Added Notices:** Categorized cards with bookmarking, translation, and WhatsApp sharing.
- **Upcoming Schedule:** Integrated exam dates and campus club events.

### 2. Smart Notice Centre
- **Smart Notice Input & Poster Scanner:**
  - Paste raw forwarded WhatsApp circulars or upload flyer/poster images.
  - Powered by Google Gemini multimodal vision & heuristic extraction.
  - Extracts Title, Description, Date, Time, Venue, Category, Registration Deadline, and Important Instructions.
  - **Uncertainty Verification:** Explicitly highlights ambiguous or missing fields with warning indicators for student review before saving.
  - **Duplicate Notice Detection:** Checks existing announcements to warn against duplicate notices.
- **Notice Update History:** Tracks version numbers, timestamps, author, and change summaries.
- **English & Hindi Translation:** On-demand bilingual translation preserving technical terms and links.
- **AI Notice Summarizer:** Generates crisp 2-sentence bullet summaries.
- **1-Click Add to Planner:** Converts notices directly into actionable tasks.

### 3. Academic Planner
- **Personal Task Manager:** Filter by Pending, Completed, and Priority with live deadline countdowns (`"2d 4h left"` or `"Overdue"`).
- **Academic Calendar:** Consolidated view of examinations, assignment deadlines, and milestones.
- **Exam Schedule:** Subject codes, dates, times, examination venues, syllabus notes, and seat allocations.
- **Assignment Tracker:** Weightage, submission URLs, and status tracking (Pending vs Submitted).
- **Custom Reminders:** Set custom reminders with 30-minute snooze capability.
- **PDF Export:** Generates and downloads a clean, styled Academic Planner PDF report using `jspdf`.

### 4. Campus AI Assistant
- Interactive conversational AI assistant grounded **strictly** in verified saved notices, exams, and tasks.
- **Pre-canned Student Questions:**
  - *"What deadlines do I have this week?"*
  - *"When is my next exam?"*
  - *"What events are happening tomorrow?"*
  - *"Summarise my important notices."*
  - *"What tasks are still pending?"*
- **Strict Bilingual Support:** Seamless English and Hindi language selector.
- **Anti-Hallucination Guardrails:** AI is instructed never to fabricate exam halls, dates, or college announcements.

### 5. Document Vault
- Organizes files by category: *Timetables, Syllabus, Study Materials, Circulars, and Important Documents*.
- Supports PDF and common image formats (PNG, JPG, WebP).
- Includes document search, category filters, inline preview modals, downloads, and deletion.

### 6. Campus Community
- **Clubs & Societies:** Club directory (Coding, Robotics, Arts, Cultural, Sports), lead contact details, upcoming events, and registration links.
- **Student Exchange Corner:** Peer-to-peer buy/sell and giveaway for used textbooks, study materials, and lab calculators.
- **Reporting & Moderation:** Student report workflow with categorization for moderation review.

### 7. Universal Global Search
- Searches across all entities simultaneously: Notices, Tasks, Deadlines, Exams, Documents, Clubs, and Exchange Listings.
- Categorized result tabs with highlight chips and date tags.
- Saves recent search query history locally.

### 8. User Authentication & Profile
- **Gmail Email OTP Authentication:**
  - Password-free flow: enter Gmail -> 6-digit OTP -> verify -> enter dashboard.
  - 10-minute code expiration, 60-second resend cooldown timer, and rate limiting.
  - Wired to Supabase Auth (`signInWithOtp` and `verifyOtp`) with fallback testing verification.
- **User Profile:** Full Name, unique Username validation, Avatar URL, College, Branch, Semester, Year, and Roll Number.
- **Settings:** Profile editor, Light/Dark appearance toggle, notification preferences, English/Hindi language toggle, feedback submission corner with status tracking, and account management.

---

## 🛠️ Database Setup (Supabase PostgreSQL)

A complete SQL migration script is located at:
[`src/lib/supabase/schema.sql`](file:///c:/Users/chdry/OneDrive/Desktop/CampusPulse/src/lib/supabase/schema.sql)

It configures:
- Tables: `profiles`, `notices`, `notice_versions`, `notice_bookmarks`, `tasks`, `exams`, `assignments`, `reminders`, `documents`, `clubs`, `club_events`, `exchange_listings`, `exchange_reports`, `feedback_submissions`, `user_notifications`.
- Full Row-Level Security (RLS) policies distinguishing public college notices from user-owned private tasks and documents.
- Performance indexes on categories, priorities, dates, and user IDs.

### Environment Configuration
Copy `.env.example` to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

---

## 🏃 Running the Application

The production application is built and currently running live on:
**[http://localhost:3000](http://localhost:3000)**

To run the development server:
```bash
npm run dev
```

To run the production build:
```bash
npm run build
npm start
```

"# CampusPulse1" 
"# CampusPulse1" 
"# CampusPulse1" 
