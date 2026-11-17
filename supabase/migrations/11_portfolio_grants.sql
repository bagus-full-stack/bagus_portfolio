-- anon/authenticated had no table privileges in schema portfolio (PostgREST: 42501 permission denied).
-- Access is gated by the RLS policies; so first make sure every table has RLS enabled
-- (enabling RLS with no policy = deny all), then grant.
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.relname FROM pg_class c
           WHERE c.relnamespace = 'portfolio'::regnamespace AND c.relkind = 'r' AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE portfolio.%I ENABLE ROW LEVEL SECURITY', r.relname);
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA portfolio TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA portfolio TO anon, authenticated;
-- shortcut: no ALTER DEFAULT PRIVILEGES, a table added by a later migration needs its own GRANT + RLS.

NOTIFY pgrst, 'reload schema';
