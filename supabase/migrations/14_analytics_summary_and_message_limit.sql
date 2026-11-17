-- Admin analytics computed from real rows (the dashboard used fixed mock numbers).
CREATE OR REPLACE FUNCTION get_analytics_summary(days_back integer DEFAULT 7)
RETURNS json AS $$
DECLARE
  since date := CURRENT_DATE - (greatest(days_back, 1) - 1);
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  RETURN json_build_object(
    'daily', (
      SELECT coalesce(json_agg(json_build_object('date', d::date, 'views', coalesce(c.n, 0)) ORDER BY d), '[]'::json)
      FROM generate_series(since, CURRENT_DATE, interval '1 day') d
      LEFT JOIN (SELECT created_at::date AS day, count(*) AS n FROM analytics
                 WHERE created_at::date >= since GROUP BY 1) c ON c.day = d::date),
    'top_page', (SELECT page FROM analytics WHERE created_at::date >= since AND page <> ''
                 GROUP BY page ORDER BY count(*) DESC LIMIT 1),
    'top_country', (SELECT country FROM analytics WHERE created_at::date >= since AND country <> ''
                    GROUP BY country ORDER BY count(*) DESC LIMIT 1),
    'avg_duration', (SELECT coalesce(round(avg(t)), 0) FROM (
                       SELECT sum(duration) AS t FROM analytics_events
                       WHERE event_type = 'section_view' AND created_at::date >= since
                       GROUP BY visitor_id) s)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = portfolio, public;

REVOKE EXECUTE ON FUNCTION get_analytics_summary(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION get_analytics_summary(integer) TO authenticated;

-- Contact form: the policy is open to anon, so cap the insert rate.
-- shortcut: global cap (not per sender), 10 messages/minute; add per-IP via an edge function if abused.
CREATE OR REPLACE FUNCTION limit_message_rate() RETURNS trigger AS $$
BEGIN
  IF (SELECT count(*) FROM messages WHERE created_at > now() - interval '1 minute') >= 10 THEN
    RAISE EXCEPTION 'Too many messages, try again later';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = portfolio, public;

DROP TRIGGER IF EXISTS messages_rate_limit ON messages;
CREATE TRIGGER messages_rate_limit BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION limit_message_rate();

NOTIFY pgrst, 'reload schema';
