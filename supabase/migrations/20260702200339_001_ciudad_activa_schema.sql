/*
# Ciudad Activa - Schema Inicial

Sistema completo de base de datos para Ciudad Activa 2.0.
*/

-- users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'trabajador',
  status text NOT NULL DEFAULT 'active',
  last_login timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- worker_profiles
CREATE TABLE IF NOT EXISTS worker_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  dni text,
  birth_date date,
  gender text,
  phone text,
  photo_url text,
  department text DEFAULT 'Lima',
  province text DEFAULT 'Lima',
  district text DEFAULT 'Comas',
  address text,
  profession text,
  occupation text,
  summary text,
  experience_years integer DEFAULT 0,
  education_level text,
  availability text,
  modality_preference text,
  salary_expectation numeric,
  skills text[] DEFAULT '{}',
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_worker_user ON worker_profiles(user_id);

DROP POLICY IF EXISTS "wp_select" ON worker_profiles;
CREATE POLICY "wp_select" ON worker_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wp_insert" ON worker_profiles;
CREATE POLICY "wp_insert" ON worker_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wp_update" ON worker_profiles;
CREATE POLICY "wp_update" ON worker_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wp_delete" ON worker_profiles;
CREATE POLICY "wp_delete" ON worker_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- company_profiles
CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  legal_name text,
  ruc text UNIQUE,
  description text,
  industry text,
  logo_url text,
  banner_url text,
  phone text,
  website text,
  facebook text,
  instagram text,
  whatsapp text,
  department text DEFAULT 'Lima',
  province text DEFAULT 'Lima',
  district text DEFAULT 'Comas',
  address text,
  employee_count integer DEFAULT 1,
  schedule text,
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_company_user ON company_profiles(user_id);

DROP POLICY IF EXISTS "cp_select" ON company_profiles;
CREATE POLICY "cp_select" ON company_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cp_insert" ON company_profiles;
CREATE POLICY "cp_insert" ON company_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "cp_update" ON company_profiles;
CREATE POLICY "cp_update" ON company_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "cp_delete" ON company_profiles;
CREATE POLICY "cp_delete" ON company_profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- experiences
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id uuid NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  company text NOT NULL,
  position text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  current boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_exp_worker ON experiences(worker_profile_id);

DROP POLICY IF EXISTS "exp_select" ON experiences;
CREATE POLICY "exp_select" ON experiences FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM worker_profiles wp WHERE wp.id = experiences.worker_profile_id AND wp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "exp_insert" ON experiences;
CREATE POLICY "exp_insert" ON experiences FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM worker_profiles wp WHERE wp.id = experiences.worker_profile_id AND wp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "exp_delete" ON experiences;
CREATE POLICY "exp_delete" ON experiences FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM worker_profiles wp WHERE wp.id = experiences.worker_profile_id AND wp.user_id = auth.uid())
);

-- education
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id uuid NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text NOT NULL,
  field text,
  start_year integer NOT NULL,
  end_year integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "edu_select" ON education;
CREATE POLICY "edu_select" ON education FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM worker_profiles wp WHERE wp.id = education.worker_profile_id AND wp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "edu_insert" ON education;
CREATE POLICY "edu_insert" ON education FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM worker_profiles wp WHERE wp.id = education.worker_profile_id AND wp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "edu_delete" ON education;
CREATE POLICY "edu_delete" ON education FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM worker_profiles wp WHERE wp.id = education.worker_profile_id AND wp.user_id = auth.uid())
);

-- jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  benefits text[] DEFAULT '{}',
  salary_min numeric,
  salary_max numeric,
  salary_type text,
  contract_type text,
  modality text,
  schedule text,
  vacancies integer DEFAULT 1,
  department text DEFAULT 'Lima',
  province text DEFAULT 'Lima',
  district text,
  address text,
  latitude numeric,
  longitude numeric,
  deadline date,
  status text NOT NULL DEFAULT 'active',
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  applications_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);

DROP POLICY IF EXISTS "jobs_select" ON jobs;
CREATE POLICY "jobs_select" ON jobs FOR SELECT TO authenticated USING (status = 'active' OR 
  EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = jobs.company_id AND cp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "jobs_insert" ON jobs;
CREATE POLICY "jobs_insert" ON jobs FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = jobs.company_id AND cp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "jobs_update" ON jobs;
CREATE POLICY "jobs_update" ON jobs FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = jobs.company_id AND cp.user_id = auth.uid())
);

DROP POLICY IF EXISTS "jobs_delete" ON jobs;
CREATE POLICY "jobs_delete" ON jobs FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM company_profiles cp WHERE cp.id = jobs.company_id AND cp.user_id = auth.uid())
);

-- applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'received',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_app_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_app_worker ON applications(worker_id);

DROP POLICY IF EXISTS "app_select" ON applications;
CREATE POLICY "app_select" ON applications FOR SELECT TO authenticated USING (
  worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  OR job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()))
);

DROP POLICY IF EXISTS "app_insert" ON applications;
CREATE POLICY "app_insert" ON applications FOR INSERT TO authenticated WITH CHECK (
  worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "app_update" ON applications;
CREATE POLICY "app_update" ON applications FOR UPDATE TO authenticated USING (
  job_id IN (SELECT id FROM jobs WHERE company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid()))
);

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants uuid[] NOT NULL,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_conv_parts ON conversations USING GIN(participants);

DROP POLICY IF EXISTS "conv_select" ON conversations;
CREATE POLICY "conv_select" ON conversations FOR SELECT TO authenticated USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "conv_insert" ON conversations;
CREATE POLICY "conv_insert" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = ANY(participants));

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  file_url text,
  read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_msg_conv ON messages(conversation_id);

DROP POLICY IF EXISTS "msg_select" ON messages;
CREATE POLICY "msg_select" ON messages FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "msg_insert" ON messages;
CREATE POLICY "msg_insert" ON messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "msg_update" ON messages;
CREATE POLICY "msg_update" ON messages FOR UPDATE TO authenticated USING (receiver_id = auth.uid());

-- events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  date date NOT NULL,
  time text,
  location text,
  latitude numeric,
  longitude numeric,
  organizer text,
  capacity integer,
  registered_count integer DEFAULT 0,
  category text,
  status text DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select" ON events FOR SELECT TO authenticated USING (true);

-- event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "er_select" ON event_registrations;
CREATE POLICY "er_select" ON event_registrations FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "er_insert" ON event_registrations;
CREATE POLICY "er_insert" ON event_registrations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "er_delete" ON event_registrations;
CREATE POLICY "er_delete" ON event_registrations FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- courses
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  instructor text,
  duration_hours integer,
  lessons_count integer DEFAULT 0,
  category text,
  level text,
  price numeric DEFAULT 0,
  certificate boolean DEFAULT false,
  rating numeric DEFAULT 0,
  students_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT TO authenticated USING (true);

-- course_enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  progress integer DEFAULT 0,
  status text DEFAULT 'enrolled',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ce_select" ON course_enrollments;
CREATE POLICY "ce_select" ON course_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ce_insert" ON course_enrollments;
CREATE POLICY "ce_insert" ON course_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ce_update" ON course_enrollments;
CREATE POLICY "ce_update" ON course_enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- recycling_centers
CREATE TABLE IF NOT EXISTS recycling_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  address text,
  latitude numeric,
  longitude numeric,
  phone text,
  schedule text,
  materials text[] DEFAULT '{}',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recycling_centers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rc_select" ON recycling_centers;
CREATE POLICY "rc_select" ON recycling_centers FOR SELECT TO authenticated USING (true);

-- community_posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  images text[] DEFAULT '{}',
  location text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at DESC);

DROP POLICY IF EXISTS "posts_select" ON community_posts;
CREATE POLICY "posts_select" ON community_posts FOR SELECT TO authenticated USING (status = 'active');

DROP POLICY IF EXISTS "posts_insert" ON community_posts;
CREATE POLICY "posts_insert" ON community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update" ON community_posts;
CREATE POLICY "posts_update" ON community_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete" ON community_posts;
CREATE POLICY "posts_delete" ON community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_created ON notifications(created_at DESC);

DROP POLICY IF EXISTS "notif_select" ON notifications;
CREATE POLICY "notif_select" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_delete" ON notifications;
CREATE POLICY "notif_delete" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update" ON notifications;
CREATE POLICY "notif_update" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ratings
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  from_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ratings_to ON ratings(to_user_id);

DROP POLICY IF EXISTS "ratings_select" ON ratings;
CREATE POLICY "ratings_select" ON ratings FOR SELECT TO authenticated USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

DROP POLICY IF EXISTS "ratings_insert" ON ratings;
CREATE POLICY "ratings_insert" ON ratings FOR INSERT TO authenticated WITH CHECK (from_user_id = auth.uid());

-- saved_items
CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_select" ON saved_items;
CREATE POLICY "saved_select" ON saved_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_insert" ON saved_items;
CREATE POLICY "saved_insert" ON saved_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_delete" ON saved_items;
CREATE POLICY "saved_delete" ON saved_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  size integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "docs_select" ON documents;
CREATE POLICY "docs_select" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "docs_insert" ON documents;
CREATE POLICY "docs_insert" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "docs_delete" ON documents;
CREATE POLICY "docs_delete" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Función y triggers para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_worker_profiles_updated_at ON worker_profiles;
CREATE TRIGGER trigger_worker_profiles_updated_at BEFORE UPDATE ON worker_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_company_profiles_updated_at ON company_profiles;
CREATE TRIGGER trigger_company_profiles_updated_at BEFORE UPDATE ON company_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_jobs_updated_at ON jobs;
CREATE TRIGGER trigger_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_applications_updated_at ON applications;
CREATE TRIGGER trigger_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON conversations;
CREATE TRIGGER trigger_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_community_posts_updated_at ON community_posts;
CREATE TRIGGER trigger_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION set_updated_at();