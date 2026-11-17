-- The deployer's tracking table is exposed by PostgREST and got anon/authenticated grants from 11.
-- RLS already hides it; remove the privileges as well (the deployer uses the postgres role).
REVOKE ALL ON portfolio._migrations FROM anon, authenticated;

NOTIFY pgrst, 'reload schema';
