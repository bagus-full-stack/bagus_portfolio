-- Isolates the portfolio in its own schema (shared self-hosted Supabase).
-- Run AFTER 00..08, as supabase_admin. Moves every non-extension object out of
-- public, so run it before any other app creates tables in public.
-- Also expose the schema: PGRST_DB_SCHEMAS=public,storage,graphql_public,portfolio

CREATE SCHEMA IF NOT EXISTS portfolio;

DO $$
DECLARE r record;
BEGIN
  -- tables, views, materialized views (owned sequences and indexes follow)
  FOR r IN
    SELECT c.oid::regclass AS obj, c.relkind
    FROM pg_class c
    WHERE c.relnamespace = 'public'::regnamespace
      AND c.relkind IN ('r','p','v','m')
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER %s %s SET SCHEMA portfolio',
      CASE r.relkind WHEN 'v' THEN 'VIEW' WHEN 'm' THEN 'MATERIALIZED VIEW' ELSE 'TABLE' END, r.obj);
  END LOOP;

  -- standalone sequences (not owned by a column)
  FOR r IN
    SELECT c.oid::regclass AS obj FROM pg_class c
    WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'S'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype IN ('a','i','e'))
  LOOP
    EXECUTE format('ALTER SEQUENCE %s SET SCHEMA portfolio', r.obj);
  END LOOP;

  -- enum / composite types
  FOR r IN
    SELECT t.oid::regtype AS obj FROM pg_type t
    WHERE t.typnamespace = 'public'::regnamespace AND t.typtype IN ('e','c')
      AND NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.reltype = t.oid)
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = t.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER TYPE %s SET SCHEMA portfolio', r.obj);
  END LOOP;

  -- functions (trigger functions included); pinned search_path also fixes the
  -- SECURITY DEFINER ones that were hardcoded to 'public'
  FOR r IN
    SELECT p.oid::regprocedure AS obj FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET SCHEMA portfolio', r.obj);
  END LOOP;

  FOR r IN
    SELECT p.oid::regprocedure AS obj FROM pg_proc p
    WHERE p.pronamespace = 'portfolio'::regnamespace AND p.prokind = 'f'
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = portfolio, extensions, public', r.obj);
  END LOOP;
END $$;

GRANT USAGE ON SCHEMA portfolio TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES    IN SCHEMA portfolio TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA portfolio TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA portfolio TO service_role;
-- anon/authenticated keep the grants they already had on each moved object
-- (RLS + the explicit GRANTs in 06/07/08); nothing new is opened here.

-- pg_cron (if installed later) still points at the old public name
DO $$
BEGIN
  IF to_regclass('cron.job') IS NOT NULL THEN
    PERFORM cron.unschedule('cleanup-old-logs');
    PERFORM cron.schedule('cleanup-old-logs', '0 3 * * *', 'SELECT portfolio.cleanup_old_logs();');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'cron reschedule skipped: %', SQLERRM;
END $$;

NOTIFY pgrst, 'reload schema';
