-- Contact form now goes through the `contact` edge function (per-IP limit, service role insert):
-- close the direct anonymous write path and drop the global rate trigger from 14.
DROP TRIGGER IF EXISTS messages_rate_limit ON messages;
DROP FUNCTION IF EXISTS limit_message_rate();
DROP POLICY IF EXISTS "public_insert_messages" ON messages;
REVOKE INSERT ON messages FROM anon, authenticated;
GRANT INSERT ON messages TO service_role;

-- Booking slot claims shared by every instance of the `meet` function.
CREATE TABLE IF NOT EXISTS meet_claims (
  slot_start timestamptz PRIMARY KEY,
  expires_at timestamptz NOT NULL
);
ALTER TABLE meet_claims ENABLE ROW LEVEL SECURITY; -- no policy: only service_role (bypasses RLS) reads it
GRANT SELECT, INSERT, DELETE ON meet_claims TO service_role;

NOTIFY pgrst, 'reload schema';
