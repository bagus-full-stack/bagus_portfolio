-- ============================================================
-- 06 — Droits des fonctions, compteur de visiteurs, limites de saisie
-- ============================================================

-- 1. Fonctions d'admin : plus appelables par un anonyme -------------------

CREATE OR REPLACE FUNCTION mark_all_messages_read()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  UPDATE messages SET read = true WHERE read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Les vues et les logs restent ; seuls les logs d'activité et notifications sont purgés
-- (analytics n'est plus purgée : le compteur public ne doit pas baisser)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM activity_logs
  WHERE created_at < (NOW() - INTERVAL '30 days');

  DELETE FROM notifications
  WHERE read = true
    AND created_at < (NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

ALTER FUNCTION get_dashboard_metrics() SET search_path = public;
ALTER FUNCTION get_analytics_by_period(integer) SET search_path = public;
ALTER FUNCTION increment_short_url_clicks(text) SET search_path = public;

REVOKE EXECUTE ON FUNCTION
  mark_all_messages_read(),
  cleanup_old_logs(),
  get_dashboard_metrics(),
  get_analytics_by_period(integer)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION
  mark_all_messages_read(),
  get_dashboard_metrics(),
  get_analytics_by_period(integer)
TO authenticated;

-- cleanup_old_logs() n'est lancée que par pg_cron (propriétaire de la fonction)
REVOKE EXECUTE ON FUNCTION cleanup_old_logs() FROM authenticated;

-- 2. Compteur de visiteurs : une empreinte non vide, une ligne par jour ----

-- Historique : les anciennes lignes sans empreinte comptent une visite chacune
CREATE OR REPLACE FUNCTION get_visitor_count()
RETURNS integer AS $$
  SELECT (
    COUNT(*) FILTER (WHERE fingerprint = '')
    + COUNT(DISTINCT fingerprint) FILTER (WHERE fingerprint <> '')
  )::integer
  FROM analytics;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION increment_visitors(
  p_fingerprint text DEFAULT '',
  p_page text DEFAULT '/',
  p_country text DEFAULT '',
  p_city text DEFAULT '',
  p_country_code text DEFAULT ''
)
RETURNS json AS $$
DECLARE
  fp text := left(coalesce(p_fingerprint, ''), 64);
  already_counted boolean := true;
BEGIN
  -- Sans empreinte, on ne compte rien (évite les insertions en rafale)
  IF fp <> '' THEN
    SELECT EXISTS (
      SELECT 1 FROM analytics
      WHERE fingerprint = fp AND created_at::date = CURRENT_DATE
    ) INTO already_counted;

    IF NOT already_counted THEN
      INSERT INTO analytics (fingerprint, page, country, city, country_code, created_at)
      VALUES (
        fp,
        left(coalesce(p_page, '/'), 200),
        left(coalesce(p_country, ''), 100),
        left(coalesce(p_city, ''), 100),
        left(coalesce(p_country_code, ''), 8),
        now()
      );
    END IF;
  END IF;

  RETURN json_build_object('total', get_visitor_count(), 'is_new', NOT already_counted);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Les insertions passent par increment_visitors() (SECURITY DEFINER) :
-- plus d'insertion directe ouverte sur la table
DROP POLICY IF EXISTS "public_insert_analytics" ON analytics;

-- 3. Formulaire de contact : tailles maximales ------------------------------

ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_length_check;
ALTER TABLE messages ADD CONSTRAINT messages_length_check CHECK (
  char_length(name) <= 200
  AND char_length(email) <= 320
  AND char_length(coalesce(subject, '')) <= 300
  AND char_length(message) <= 5000
) NOT VALID;

-- 4. Liens courts : 'meet' n'avait pas de cible ------------------------------

UPDATE short_urls SET target_url = '/#contact'
WHERE slug = 'meet' AND target_url = '';
