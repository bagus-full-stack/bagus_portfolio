-- Realtime notifications (admin) listen to INSERT on portfolio.messages / portfolio.analytics.
-- Tables must be in the supabase_realtime publication; idempotent.
DO $$
DECLARE t text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    RAISE NOTICE 'publication supabase_realtime missing, skipped';
    RETURN;
  END IF;
  FOREACH t IN ARRAY ARRAY['messages', 'analytics'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'portfolio' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE portfolio.%I', t);
    END IF;
  END LOOP;
END $$;
