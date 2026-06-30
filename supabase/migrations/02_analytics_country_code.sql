ALTER TABLE analytics
ADD COLUMN IF NOT EXISTS country_code text DEFAULT '';

DROP FUNCTION IF EXISTS increment_visitors(text, text, text, text);
DROP FUNCTION IF EXISTS increment_visitors();

CREATE OR REPLACE FUNCTION increment_visitors(
  p_fingerprint text DEFAULT '',
  p_page text DEFAULT '/',
  p_country text DEFAULT '',
  p_city text DEFAULT '',
  p_country_code text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  already_counted boolean;
  total_count integer;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM analytics
    WHERE fingerprint = p_fingerprint
    AND created_at::date = CURRENT_DATE
    AND fingerprint != ''
  ) INTO already_counted;

  IF NOT already_counted THEN
    INSERT INTO analytics (
      fingerprint, page, country,
      city, country_code, created_at
    ) VALUES (
      p_fingerprint, p_page,
      p_country, p_city,
      p_country_code, now()
    );
  END IF;

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
