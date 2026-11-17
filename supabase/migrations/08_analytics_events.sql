-- Événements de section (useSectionTracker) : la table n'existait pas
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id text NOT NULL DEFAULT '',
  event_type text NOT NULL,
  event_name text NOT NULL,
  duration integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT analytics_events_limits CHECK (
    char_length(visitor_id) <= 64
    AND char_length(event_type) <= 50
    AND char_length(event_name) <= 100
    AND duration BETWEEN 0 AND 3600
  )
);

CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events (created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_analytics_events" ON analytics_events;
CREATE POLICY "public_insert_analytics_events" ON analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_analytics_events" ON analytics_events;
CREATE POLICY "admin_read_analytics_events" ON analytics_events
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

GRANT INSERT ON analytics_events TO anon, authenticated;
GRANT SELECT ON analytics_events TO authenticated;

-- Un utilisateur connecté ne lit que sa propre ligne admin (plus la liste des admins)
DROP POLICY IF EXISTS "admin_read_admin_users" ON admin_users;
CREATE POLICY "admin_read_admin_users" ON admin_users
  FOR SELECT TO authenticated USING (id = auth.uid());
