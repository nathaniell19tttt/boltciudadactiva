/*
# Add Missing Tables for Ciudad Activa 2.0

1. New Tables
- `interviews`: Scheduled interviews between companies and workers
  - id, job_id, application_id, company_id, worker_id, scheduled_at, duration_minutes, type (presencial/virtual), location, meeting_url, status, notes, created_at
- `post_likes`: Track likes on community posts
  - id, post_id, user_id, created_at
- `company_follows`: Users following companies
  - id, company_id, user_id, created_at
- `worker_languages`: Languages spoken by workers
  - id, worker_profile_id, language, level (basico/intermedio/avanzado/nativo), created_at

2. Modified Tables
- `events`: Add views column for analytics
- `event_registrations`: Add status column

3. Security
- Enable RLS on all new tables
- Owner-scoped policies for interviews, follows, languages
- Public read for post_likes
*/

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  company_id uuid REFERENCES company_profiles(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES worker_profiles(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 30,
  type text DEFAULT 'presencial',
  location text,
  meeting_url text,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_interviews" ON interviews;
CREATE POLICY "select_own_interviews" ON interviews FOR SELECT
  TO authenticated USING (
    company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid())
    OR worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "insert_company_interviews" ON interviews;
CREATE POLICY "insert_company_interviews" ON interviews FOR INSERT
  TO authenticated WITH CHECK (
    company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_company_interviews" ON interviews;
CREATE POLICY "update_company_interviews" ON interviews FOR UPDATE
  TO authenticated USING (
    company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid())
    OR worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    company_id IN (SELECT id FROM company_profiles WHERE user_id = auth.uid())
    OR worker_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_post_likes" ON post_likes;
CREATE POLICY "select_post_likes" ON post_likes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_likes" ON post_likes;
CREATE POLICY "insert_own_likes" ON post_likes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_likes" ON post_likes;
CREATE POLICY "delete_own_likes" ON post_likes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Company follows table
CREATE TABLE IF NOT EXISTS company_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, user_id)
);

ALTER TABLE company_follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_company_follows" ON company_follows;
CREATE POLICY "select_company_follows" ON company_follows FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_follows" ON company_follows;
CREATE POLICY "insert_own_follows" ON company_follows FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_follows" ON company_follows;
CREATE POLICY "delete_own_follows" ON company_follows FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Worker languages table
CREATE TABLE IF NOT EXISTS worker_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_profile_id uuid NOT NULL REFERENCES worker_profiles(id) ON DELETE CASCADE,
  language text NOT NULL,
  level text DEFAULT 'basico',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE worker_languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_worker_languages" ON worker_languages;
CREATE POLICY "select_worker_languages" ON worker_languages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_languages" ON worker_languages;
CREATE POLICY "insert_own_languages" ON worker_languages FOR INSERT
  TO authenticated WITH CHECK (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_own_languages" ON worker_languages;
CREATE POLICY "update_own_languages" ON worker_languages FOR UPDATE
  TO authenticated USING (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  ) WITH CHECK (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "delete_own_languages" ON worker_languages;
CREATE POLICY "delete_own_languages" ON worker_languages FOR DELETE
  TO authenticated USING (
    worker_profile_id IN (SELECT id FROM worker_profiles WHERE user_id = auth.uid())
  );

-- Add missing columns to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'views') THEN
    ALTER TABLE events ADD COLUMN views integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'organizer_type') THEN
    ALTER TABLE events ADD COLUMN organizer_type text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'requirements') THEN
    ALTER TABLE events ADD COLUMN requirements text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'benefits') THEN
    ALTER TABLE events ADD COLUMN benefits text[] DEFAULT '{}'::text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'registration_link') THEN
    ALTER TABLE events ADD COLUMN registration_link text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'event_registrations' AND column_name = 'status') THEN
    ALTER TABLE event_registrations ADD COLUMN status text DEFAULT 'registered';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'objectives') THEN
    ALTER TABLE courses ADD COLUMN objectives text[] DEFAULT '{}'::text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'requirements') THEN
    ALTER TABLE courses ADD COLUMN requirements text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'modules') THEN
    ALTER TABLE courses ADD COLUMN modules jsonb DEFAULT '[]'::jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'reviews_count') THEN
    ALTER TABLE courses ADD COLUMN reviews_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'certificate_available') THEN
    ALTER TABLE courses ADD COLUMN certificate_available boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE company_profiles ADD COLUMN followers_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'benefits') THEN
    ALTER TABLE company_profiles ADD COLUMN benefits text[] DEFAULT '{}'::text[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company_profiles' AND column_name = 'size') THEN
    ALTER TABLE company_profiles ADD COLUMN size text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'interview_scheduled') THEN
    ALTER TABLE applications ADD COLUMN interview_scheduled boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_interviews_company ON interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_worker ON interviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled ON interviews(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_company ON company_follows(company_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
