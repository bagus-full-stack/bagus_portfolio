CREATE TABLE IF NOT EXISTS short_urls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  target_url text NOT NULL,
  label text DEFAULT '',
  clicks integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_short_urls_slug
  ON short_urls(slug);
CREATE INDEX IF NOT EXISTS idx_short_urls_active
  ON short_urls(active);

-- Trigger updated_at
CREATE TRIGGER trigger_short_urls_updated_at
  BEFORE UPDATE ON short_urls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE short_urls
  ENABLE ROW LEVEL SECURITY;

-- Lecture publique (pour la redirection)
CREATE POLICY "public_read_short_urls"
  ON short_urls FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Écriture admin uniquement
CREATE POLICY "admin_all_short_urls"
  ON short_urls FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users
      WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users
      WHERE id = auth.uid())
  );

-- Fonction pour incrémenter les clics
CREATE OR REPLACE FUNCTION increment_short_url_clicks(
  p_slug text
)
RETURNS void AS $$
BEGIN
  UPDATE short_urls
  SET clicks = clicks + 1
  WHERE slug = p_slug
    AND active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Données initiales
INSERT INTO short_urls (slug, target_url, label)
VALUES
  ('cv', '', 'CV PDF téléchargeable'),
  ('linkedin',
    'https://linkedin.com/in/ton-profil',
    'Profil LinkedIn'),
  ('github',
    'https://github.com/bagus-full-stack',
    'GitHub'),
  ('meet', '', 'Réserver un appel'),
  ('simpson',
    '/projects/simpsons-ai',
    'Projet Simpsons AI'),
  ('agrosahel',
    '/projects/agrosahel-ai',
    'Projet AgroSahel AI')
ON CONFLICT (slug) DO NOTHING;
