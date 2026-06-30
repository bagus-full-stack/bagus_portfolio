ALTER TABLE analytics
ADD COLUMN IF NOT EXISTS fingerprint text DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_analytics_fingerprint
  ON analytics(fingerprint, created_at);

DROP FUNCTION IF EXISTS increment_visitors();

CREATE OR REPLACE FUNCTION increment_visitors(
  p_fingerprint text DEFAULT '',
  p_page text DEFAULT '/',
  p_country text DEFAULT '',
  p_city text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  already_counted boolean;
  total_count integer;
BEGIN
  -- Vérifier si cette empreinte a déjà
  -- été comptée aujourd'hui
  SELECT EXISTS (
    SELECT 1 FROM analytics
    WHERE fingerprint = p_fingerprint
    AND created_at::date = CURRENT_DATE
    AND fingerprint != ''
  ) INTO already_counted;

  -- Insérer uniquement si pas encore compté
  -- aujourd'hui
  IF NOT already_counted THEN
    INSERT INTO analytics (
      fingerprint, page, country, city, created_at
    ) VALUES (
      p_fingerprint, p_page,
      p_country, p_city, now()
    );
  END IF;

  -- Retourner le total de visiteurs uniques
  -- (une entrée par fingerprint par jour)
  SELECT COUNT(DISTINCT fingerprint)
  INTO total_count
  FROM analytics
  WHERE fingerprint != '';

  RETURN json_build_object(
    'total', total_count,
    'is_new', NOT already_counted
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
