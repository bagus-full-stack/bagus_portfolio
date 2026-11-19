-- match_chunks failed for anon with "permission denied for function cosine_distance" (pgvector lives in
-- schema extensions, whose functions anon cannot execute), so chat-resume always fell back to the full CV.
-- Run the search as the owner: it only reads portfolio.chunks, which is public content anyway.
CREATE OR REPLACE FUNCTION portfolio.match_chunks(
  query_embedding extensions.vector(768),
  match_lang text DEFAULT 'fr',
  match_count int DEFAULT 6
) RETURNS TABLE (source text, content text, similarity float)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = portfolio, extensions, public AS $$
  SELECT c.source, c.content, 1 - (c.embedding <=> query_embedding) AS similarity
  FROM portfolio.chunks c
  WHERE c.lang = match_lang
  ORDER BY c.embedding <=> query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 20);
$$;
GRANT EXECUTE ON FUNCTION portfolio.match_chunks(extensions.vector, text, int) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
