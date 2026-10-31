-- CampusPulse Complete Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  college TEXT DEFAULT 'National Institute of Technology',
  branch TEXT DEFAULT 'Computer Science & Engineering',
  semester TEXT DEFAULT '6th Semester',
  year TEXT DEFAULT '3rd Year',
  roll_number TEXT DEFAULT '',
  theme_preference TEXT DEFAULT 'light',
  language_preference TEXT DEFAULT 'en',
  notifications_enabled BOOLEAN DEFAULT true,
  deadline_alerts BOOLEAN DEFAULT true,
  event_reminders BOOLEAN DEFAULT true,
  exam_reminders BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE,
  event_time TEXT,
  venue TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  registration_deadline TIMESTAMPTZ,
  important_instructions JSONB DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium',
  source TEXT NOT NULL DEFAULT 'manual',
  image_url TEXT,
  is_official BOOLEAN DEFAULT false,
  raw_text TEXT,
  uncertain_fields JSONB DEFAULT '[]'::jsonb,
  hindi_title TEXT,
  hindi_description TEXT,
  hindi_instructions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Notice Versions Table
CREATE TABLE IF NOT EXISTS public.notice_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  changes_summary TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Notice Bookmarks Table
CREATE TABLE IF NOT EXISTS public.notice_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notice_id)
);

-- 6. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  due_date DATE NOT NULL,
  due_time TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'assignment',
  source_notice_id UUID REFERENCES public.notices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 7. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  course_code TEXT,
  exam_date DATE NOT NULL,
  exam_time TEXT NOT NULL,
  duration_minutes INT DEFAULT 180,
  venue TEXT NOT NULL,
  syllabus_notes TEXT,
  seat_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  due_date DATE NOT NULL,
  due_time TEXT,
  submission_link TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  weightage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Custom Reminders Table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_datetime TIMESTAMPTZ NOT NULL,
  related_type TEXT,
  related_id UUID,
  is_snoozed BOOLEAN DEFAULT false,
  snooze_until TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Clubs Table
CREATE TABLE IF NOT EXISTS public.clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  lead_name TEXT NOT NULL,
  lead_email TEXT NOT NULL,
  lead_phone TEXT,
  logo_url TEXT,
  member_count INT DEFAULT 0,
  registration_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Club Events Table
CREATE TABLE IF NOT EXISTS public.club_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  description TEXT NOT NULL,
  registration_url TEXT,
  is_registration_open BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Student Exchange Listings Table
CREATE TABLE IF NOT EXISTS public.exchange_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  image_url TEXT,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  is_reported BOOLEAN DEFAULT false,
  report_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Exchange Reports Table
CREATE TABLE IF NOT EXISTS public.exchange_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.exchange_listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Feedback Submissions Table
CREATE TABLE IF NOT EXISTS public.feedback_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  feedback_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. User Notifications Table
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone authenticated can read basic profiles, users can update their own
CREATE POLICY "Public profiles are viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Notices: Authenticated users can view all notices, create notices, update/delete if owner
CREATE POLICY "Notices are viewable by authenticated users" ON public.notices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create notices" ON public.notices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notices" ON public.notices FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notices" ON public.notices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Notice Versions: Viewable by authenticated, insertable by author
CREATE POLICY "Notice versions are viewable by authenticated" ON public.notice_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert notice versions" ON public.notice_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = updated_by);

-- Bookmarks: Personal to user
CREATE POLICY "Users manage their own bookmarks" ON public.notice_bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks: Personal to user
CREATE POLICY "Users manage their own tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exams: Personal to user
CREATE POLICY "Users manage their own exams" ON public.exams FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Assignments: Personal to user
CREATE POLICY "Users manage their own assignments" ON public.assignments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reminders: Personal to user
CREATE POLICY "Users manage their own reminders" ON public.reminders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Documents: Personal to user
CREATE POLICY "Users manage their own documents" ON public.documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Clubs and Club Events: Viewable by all authenticated
CREATE POLICY "Clubs viewable by authenticated" ON public.clubs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Club events viewable by authenticated" ON public.club_events FOR SELECT TO authenticated USING (true);

-- Exchange Listings: All authenticated can view, owners manage
CREATE POLICY "Exchange listings viewable by authenticated" ON public.exchange_listings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create listings" ON public.exchange_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update listings" ON public.exchange_listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete listings" ON public.exchange_listings FOR DELETE TO authenticated USING (auth.uid() = owner_id);

-- Exchange Reports: Authenticated can submit reports
CREATE POLICY "Users can report listings" ON public.exchange_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- Feedback: Authenticated can submit feedback, view own
CREATE POLICY "Users can submit feedback" ON public.feedback_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own feedback" ON public.feedback_submissions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Notifications: Personal to user
CREATE POLICY "Users manage their own notifications" ON public.user_notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- INDEXES for fast queries
CREATE INDEX IF NOT EXISTS idx_notices_category ON public.notices(category);
CREATE INDEX IF NOT EXISTS idx_notices_priority ON public.notices(priority);
CREATE INDEX IF NOT EXISTS idx_notices_date ON public.notices(event_date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_due ON public.tasks(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id, category);
CREATE INDEX IF NOT EXISTS idx_exchange_category ON public.exchange_listings(category, status);

