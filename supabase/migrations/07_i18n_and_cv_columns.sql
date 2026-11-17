-- ============================================================
-- 07 — Colonnes FR/EN et CV utilisées par l'admin mais jamais créées
-- (sur la base d'origine elles avaient été ajoutées à la main)
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS bio_short text,
  ADD COLUMN IF NOT EXISTS bio_short_fr text,
  ADD COLUMN IF NOT EXISTS bio_short_en text,
  ADD COLUMN IF NOT EXISTS bio_full text,
  ADD COLUMN IF NOT EXISTS bio_full_fr text,
  ADD COLUMN IF NOT EXISTS bio_full_en text,
  ADD COLUMN IF NOT EXISTS cv_fullstack_url text,
  ADD COLUMN IF NOT EXISTS cv_fullstack_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS cv_ai_url text,
  ADD COLUMN IF NOT EXISTS cv_ai_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS cv_fullstack_fr text,
  ADD COLUMN IF NOT EXISTS cv_fullstack_fr_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS cv_fullstack_en text,
  ADD COLUMN IF NOT EXISTS cv_fullstack_en_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS cv_ai_fr text,
  ADD COLUMN IF NOT EXISTS cv_ai_fr_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS cv_ai_en text,
  ADD COLUMN IF NOT EXISTS cv_ai_en_updated_at timestamptz;

ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS organization_fr text,
  ADD COLUMN IF NOT EXISTS organization_en text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_en text;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS title_fr text,
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS description_fr text,
  ADD COLUMN IF NOT EXISTS description_en text,
  ADD COLUMN IF NOT EXISTS context_fr text,
  ADD COLUMN IF NOT EXISTS context_en text;

-- Droits explicites : 00 retire EXECUTE par défaut, les RPC publics doivent rester appelables
GRANT EXECUTE ON FUNCTION
  increment_visitors(text, text, text, text, text),
  get_visitor_count(),
  increment_short_url_clicks(text)
TO anon, authenticated;
