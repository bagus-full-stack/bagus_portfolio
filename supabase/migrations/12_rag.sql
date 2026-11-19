-- RAG for the chatbot: passages of the portfolio + their Gemini embeddings (768 dims, gemini-embedding-001).
-- Applied by scripts/vps/apply-supabase.sh (search_path = portfolio, extensions, public).
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS portfolio.chunks (
  id         bigserial PRIMARY KEY,
  source     text NOT NULL,                 -- e.g. profile, experience:<id>, project:<slug>:overview
  lang       text NOT NULL CHECK (lang IN ('fr', 'en')),
  content    text NOT NULL,
  embedding  extensions.vector(768) NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chunks_embedding_idx
  ON portfolio.chunks USING hnsw (embedding extensions.vector_cosine_ops);

-- The passages are public portfolio content: read-only for everyone. No write grant at all:
-- the only way to write is rag_replace_chunks() below (admin only).
ALTER TABLE portfolio.chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_chunks" ON portfolio.chunks;
CREATE POLICY "public_read_chunks" ON portfolio.chunks FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON portfolio.chunks TO anon, authenticated;

-- Top-k passages by cosine similarity, in one language.
CREATE OR REPLACE FUNCTION portfolio.match_chunks(
  query_embedding extensions.vector(768),
  match_lang text DEFAULT 'fr',
  match_count int DEFAULT 6
) RETURNS TABLE (source text, content text, similarity float)
LANGUAGE sql STABLE
SET search_path = portfolio, extensions, public AS $$
  SELECT c.source, c.content, 1 - (c.embedding <=> query_embedding) AS similarity
  FROM portfolio.chunks c
  WHERE c.lang = match_lang
  ORDER BY c.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;
GRANT EXECUTE ON FUNCTION portfolio.match_chunks(extensions.vector, text, int) TO anon, authenticated;

-- Replaces every passage in one transaction. rows = [{source, lang, content, embedding:[768 floats]}]
CREATE OR REPLACE FUNCTION portfolio.rag_replace_chunks(rows jsonb) RETURNS int
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = portfolio, extensions, public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM portfolio.admin_users WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF jsonb_typeof(rows) <> 'array' OR jsonb_array_length(rows) = 0 THEN
    RAISE EXCEPTION 'rows must be a non-empty array';  -- never wipe the index with an empty payload
  END IF;
  DELETE FROM portfolio.chunks WHERE true;
  INSERT INTO portfolio.chunks (source, lang, content, embedding)
    SELECT r->>'source', r->>'lang', r->>'content', (r->>'embedding')::extensions.vector
    FROM jsonb_array_elements(rows) AS r;
  RETURN (SELECT count(*)::int FROM portfolio.chunks);
END $$;
REVOKE ALL ON FUNCTION portfolio.rag_replace_chunks(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION portfolio.rag_replace_chunks(jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';
