-- ============================================================
-- PORTFOLIO ASSAMI BAGA — Scripts SQL Supabase complets
-- Ordre d'exécution : Blocs 1 → 9
-- ============================================================


-- ============================================================
-- BLOC 1 — Extensions & configuration initiale
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER DEFAULT PRIVILEGES REVOKE EXECUTE
  ON FUNCTIONS FROM PUBLIC;


-- ============================================================
-- BLOC 2 — Tables principales
-- ============================================================

-- TABLE : profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  email text DEFAULT '',
  linkedin_url text DEFAULT '',
  github_url text DEFAULT '',
  calendly_url text DEFAULT '',
  photo_url text DEFAULT '',
  cv_url text DEFAULT '',
  cv_updated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE : experiences
CREATE TABLE IF NOT EXISTS experiences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('pro', 'education')),
  title text NOT NULL DEFAULT '',
  organization text NOT NULL DEFAULT '',
  location text DEFAULT '',
  start_date text NOT NULL DEFAULT '',
  end_date text DEFAULT NULL,
  description text DEFAULT '',
  stack text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE : projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  cover_image text DEFAULT '',
  stack text[] DEFAULT '{}',
  context text DEFAULT '',
  technical_choices jsonb DEFAULT '[]',
  challenges text[] DEFAULT '{}',
  results jsonb DEFAULT '[]',
  github_url text DEFAULT '',
  live_url text DEFAULT '',
  status text DEFAULT 'production'
    CHECK (status IN ('production', 'beta', 'archived', 'conception')),
  architecture_nodes jsonb DEFAULT '[]',
  architecture_edges jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE : skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Frontend',
  created_at timestamptz DEFAULT now()
);

-- TABLE : skill_categories
CREATE TABLE IF NOT EXISTS skill_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- TABLE : certifications
CREATE TABLE IF NOT EXISTS certifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  issuer text NOT NULL DEFAULT '',
  date text DEFAULT '',
  verify_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE : testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  author_name text NOT NULL DEFAULT '',
  author_role text NOT NULL DEFAULT '',
  author_company text NOT NULL DEFAULT '',
  linkedin_url text NOT NULL DEFAULT '',
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TABLE : messages (formulaire de contact)
CREATE TABLE IF NOT EXISTS messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL DEFAULT '',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- TABLE : analytics (compteur de vues)
CREATE TABLE IF NOT EXISTS analytics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page text DEFAULT '/',
  country text DEFAULT '',
  city text DEFAULT '',
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- TABLE : activity_logs (journal admin)
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL
    CHECK (type IN ('content', 'message', 'auth', 'error')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- TABLE : notifications (centre de notifs admin)
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL
    CHECK (type IN ('message', 'visitor', 'error', 'save')),
  message text NOT NULL DEFAULT '',
  read boolean DEFAULT false,
  source_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- TABLE : admin_users (sécurité accès admin)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid REFERENCES auth.users(id)
    ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);


-- ============================================================
-- BLOC 3 — Index pour les performances
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_experiences_type
  ON experiences(type);

CREATE INDEX IF NOT EXISTS idx_experiences_start_date
  ON experiences(start_date DESC);

CREATE INDEX IF NOT EXISTS idx_projects_slug
  ON projects(slug);

CREATE INDEX IF NOT EXISTS idx_projects_status
  ON projects(status);

CREATE INDEX IF NOT EXISTS idx_skills_category
  ON skills(category);

CREATE INDEX IF NOT EXISTS idx_messages_read
  ON messages(read);

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at
  ON analytics(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_type
  ON activity_logs(type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at
  ON activity_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_read
  ON notifications(read);

CREATE INDEX IF NOT EXISTS idx_testimonials_order
  ON testimonials("order" ASC);


-- ============================================================
-- BLOC 4 — Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Lecture publique (front-office)
DROP POLICY IF EXISTS "public_read_profiles" ON profiles;
CREATE POLICY "public_read_profiles"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_experiences" ON experiences;
CREATE POLICY "public_read_experiences"
  ON experiences FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_projects" ON projects;
CREATE POLICY "public_read_projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_skills" ON skills;
CREATE POLICY "public_read_skills"
  ON skills FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_skill_categories" ON skill_categories;
CREATE POLICY "public_read_skill_categories"
  ON skill_categories FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_certifications" ON certifications;
CREATE POLICY "public_read_certifications"
  ON certifications FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "public_read_testimonials" ON testimonials;
CREATE POLICY "public_read_testimonials"
  ON testimonials FOR SELECT
  TO anon, authenticated
  USING (true);

-- Écriture publique limitée
DROP POLICY IF EXISTS "public_insert_messages" ON messages;
CREATE POLICY "public_insert_messages"
  ON messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "public_insert_analytics" ON analytics;
CREATE POLICY "public_insert_analytics"
  ON analytics FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin uniquement — accès complet
DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_experiences" ON experiences;
CREATE POLICY "admin_all_experiences"
  ON experiences FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_projects" ON projects;
CREATE POLICY "admin_all_projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_skills" ON skills;
CREATE POLICY "admin_all_skills"
  ON skills FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_skill_categories" ON skill_categories;
CREATE POLICY "admin_all_skill_categories"
  ON skill_categories FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_certifications" ON certifications;
CREATE POLICY "admin_all_certifications"
  ON certifications FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_testimonials" ON testimonials;
CREATE POLICY "admin_all_testimonials"
  ON testimonials FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_messages" ON messages;
CREATE POLICY "admin_all_messages"
  ON messages FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_read_analytics" ON analytics;
CREATE POLICY "admin_read_analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_activity_logs" ON activity_logs;
CREATE POLICY "admin_all_activity_logs"
  ON activity_logs FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_all_notifications" ON notifications;
CREATE POLICY "admin_all_notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_read_admin_users" ON admin_users;
CREATE POLICY "admin_read_admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);


-- ============================================================
-- BLOC 5 — Fonctions RPC
-- ============================================================

-- Incrémenter le compteur de visiteurs
CREATE OR REPLACE FUNCTION increment_visitors()
RETURNS void AS $$
BEGIN
  INSERT INTO analytics (page, created_at)
  VALUES ('/', now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retourner le total de vues
CREATE OR REPLACE FUNCTION get_visitor_count()
RETURNS integer AS $$
BEGIN
  RETURN (SELECT COUNT(*)::integer FROM analytics);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Métriques dashboard admin
CREATE OR REPLACE FUNCTION get_dashboard_metrics()
RETURNS json AS $$
DECLARE
  today_views integer;
  yesterday_views integer;
  total_views integer;
  unread_messages integer;
  published_projects integer;
  views_change numeric;
BEGIN
  SELECT COUNT(*) INTO today_views
  FROM analytics
  WHERE created_at::date = CURRENT_DATE;

  SELECT COUNT(*) INTO yesterday_views
  FROM analytics
  WHERE created_at::date =
    CURRENT_DATE - INTERVAL '1 day';

  SELECT COUNT(*) INTO total_views
  FROM analytics;

  SELECT COUNT(*) INTO unread_messages
  FROM messages
  WHERE read = false;

  SELECT COUNT(*) INTO published_projects
  FROM projects
  WHERE status = 'production';

  IF yesterday_views = 0 THEN
    views_change := 0;
  ELSE
    views_change := ROUND(
      ((today_views - yesterday_views)::numeric
        / yesterday_views * 100), 1
    );
  END IF;

  RETURN json_build_object(
    'todayViews', today_views,
    'yesterdayViews', yesterday_views,
    'totalViews', total_views,
    'unreadMessages', unread_messages,
    'publishedProjects', published_projects,
    'viewsChange', views_change
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Analytics par période
CREATE OR REPLACE FUNCTION get_analytics_by_period(
  days_back integer DEFAULT 30
)
RETURNS TABLE (
  date date,
  views bigint,
  country text,
  city text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.created_at::date AS date,
    COUNT(*) AS views,
    a.country,
    a.city
  FROM analytics a
  WHERE a.created_at >= (NOW() - (days_back || ' days')::interval)
  GROUP BY
    a.created_at::date,
    a.country,
    a.city
  ORDER BY a.created_at::date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nettoyer les logs anciens
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < (NOW() - INTERVAL '30 days');

  DELETE FROM notifications
  WHERE read = true
    AND created_at < (NOW() - INTERVAL '7 days');

  DELETE FROM analytics
  WHERE created_at < (NOW() - INTERVAL '90 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Marquer tous les messages comme lus
CREATE OR REPLACE FUNCTION mark_all_messages_read()
RETURNS void AS $$
BEGIN
  UPDATE messages SET read = true
  WHERE read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- BLOC 6 — Triggers automatiques
-- ============================================================

-- Fonction updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_experiences_updated_at ON experiences;
CREATE TRIGGER trigger_experiences_updated_at
  BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_certifications_updated_at ON certifications;
CREATE TRIGGER trigger_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_testimonials_updated_at ON testimonials;
CREATE TRIGGER trigger_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Fonction : log automatique nouveau message
DROP TRIGGER IF EXISTS trigger_log_new_message ON messages;
DROP FUNCTION IF EXISTS log_new_message();

CREATE OR REPLACE FUNCTION log_new_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO activity_logs (type, description)
  VALUES (
    'message',
    'Message reçu de ' || NEW.name ||
    ' (' || NEW.email || ')'
  );

  INSERT INTO notifications (
    type, message, source_url, read
  )
  VALUES (
    'message',
    'Nouveau message de ' || NEW.name ||
    ' — ' || LEFT(NEW.message, 40) || '...',
    '/admin/messages/' || NEW.id::text,
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_new_message ON messages;
CREATE TRIGGER trigger_log_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION log_new_message();

-- Fonction : log automatique nouveau visiteur
DROP TRIGGER IF EXISTS trigger_log_new_visitor ON analytics;
DROP FUNCTION IF EXISTS log_new_visitor();

CREATE OR REPLACE FUNCTION log_new_visitor()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (type, message, read)
  VALUES (
    'visitor',
    'Nouveau visiteur depuis ' ||
    COALESCE(NEW.country, 'localisation inconnue'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_new_visitor ON analytics;
CREATE TRIGGER trigger_log_new_visitor
  AFTER INSERT ON analytics
  FOR EACH ROW EXECUTE FUNCTION log_new_visitor();


-- ============================================================
-- BLOC 7 — Données initiales
-- ============================================================

-- Profil initial (remplacer par tes vraies données)
INSERT INTO profiles (
  name,
  title,
  bio,
  location,
  email,
  linkedin_url,
  github_url
) SELECT
  'Assami Baga',
  'Full Stack & AI Engineer',
  'Ingénieur passionné par le développement full-stack et l''intelligence artificielle. Créateur d''AgroSahel AI, une solution de diagnostic agricole pour les cultures du Sahel.',
  'Île-de-France, France',
  'ton-email@gmail.com',
  'https://linkedin.com/in/ton-profil',
  'https://github.com/bagus-full-stack'
WHERE NOT EXISTS (SELECT 1 FROM profiles);

-- Catégories de compétences par défaut
INSERT INTO skill_categories (name) VALUES
  ('Frontend'),
  ('Backend'),
  ('IA-ML'),
  ('DevOps'),
  ('Mobile')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- BLOC 8 — Buckets Storage + policies
-- ============================================================

-- BUCKET 1 : avatars (public, 2MB, images)
-- BUCKET 2 : cv (privé — accès via URL signée, 10MB, PDF)
-- BUCKET 3 : covers (public, 5MB, images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg','image/png','image/webp']),
  ('covers', 'covers', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('cv', 'cv', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Lecture publique des 3 buckets
-- (nécessaire pour 'cv' car createSignedUrl() est appelé
--  côté visiteur anonyme dans HeroSection / ShareButtons)
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "public_read_covers" ON storage.objects;
CREATE POLICY "public_read_covers"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "public_read_cv" ON storage.objects;
CREATE POLICY "public_read_cv"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'cv');

-- Écriture réservée à l'admin (upload / update / delete)
DROP POLICY IF EXISTS "admin_manage_avatars" ON storage.objects;
CREATE POLICY "admin_manage_avatars"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'avatars' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (bucket_id = 'avatars' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "admin_manage_covers" ON storage.objects;
CREATE POLICY "admin_manage_covers"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'covers' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (bucket_id = 'covers' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "admin_manage_cv" ON storage.objects;
CREATE POLICY "admin_manage_cv"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'cv' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
  WITH CHECK (bucket_id = 'cv' AND EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));


-- ============================================================
-- BLOC 9 — CRON job nettoyage automatique (ignoré si pg_cron indisponible)
-- ============================================================

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule('cleanup-old-logs', '0 3 * * *', 'SELECT cleanup_old_logs();');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron ignoré : %', SQLERRM;
END $$;
