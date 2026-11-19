// RAG helpers shared by chat-resume (query side) and rag-index (indexing side).
// Pure functions + one Gemini call: no Deno-only API, so node --test can run rag.test.ts.

export type Lang = 'fr' | 'en'
export interface Chunk { source: string; lang: Lang; content: string }

const EMBED_MODEL = 'gemini-embedding-001'
export const EMBED_DIMS = 768
const MAX_CHUNK_CHARS = 3500

const LABELS = {
  fr: { present: 'Présent', stack: 'Technologies', context: 'Contexte', choices: 'Choix techniques', challenges: 'Défis', results: 'Résultats', skills: 'Compétences', certs: 'Certifications', contact: 'Contact', avail: 'Disponible pour de nouvelles opportunités (CDI).', status: 'Statut' },
  en: { present: 'Present', stack: 'Technologies', context: 'Context', choices: 'Technical choices', challenges: 'Challenges', results: 'Results', skills: 'Skills', certs: 'Certifications', contact: 'Contact', avail: 'Open to new opportunities (full-time).', status: 'Status' },
} as const

type Row = Record<string, any>

// Localized text with fallback: field_<lang> -> field_fr -> field
const pick = (o: Row, f: string, lang: Lang): string =>
  [o[`${f}_${lang}`], o[`${f}_fr`], o[f]].find((v) => typeof v === 'string' && v.trim()) ?? ''
const pickArr = (o: Row, f: string, lang: Lang): any[] =>
  [o[`${f}_${lang}`], o[`${f}_fr`], o[f]].find((v) => Array.isArray(v) && v.length) ?? []

const join = (parts: (string | false | undefined | null)[]) => parts.filter(Boolean).join('\n')

export function buildChunks(
  data: { profile?: Row | null; experiences?: Row[] | null; projects?: Row[] | null; skills?: Row[] | null; certifications?: Row[] | null },
): Chunk[] {
  const out: Chunk[] = []
  const add = (source: string, lang: Lang, content: string) => {
    const c = content.trim()
    if (c) out.push({ source, lang, content: c.slice(0, MAX_CHUNK_CHARS) })
  }
  const { profile, experiences = [], projects = [], skills = [], certifications = [] } = data

  for (const lang of ['fr', 'en'] as Lang[]) {
    const L = LABELS[lang]
    if (profile) {
      add('profile', lang, join([
        `${profile.name || 'Assami Baga'} — ${pick(profile, 'title', lang)}`,
        pick(profile, 'bio_short', lang) || pick(profile, 'bio', lang),
        pick(profile, 'bio_full', lang),
        profile.location && `${profile.location}`,
        L.avail,
        (profile.email || profile.github_url || profile.linkedin_url) &&
          `${L.contact}: ${[profile.email, profile.github_url, profile.linkedin_url].filter(Boolean).join(' | ')}`,
      ]))
    }
    for (const e of experiences ?? []) {
      add(`experience:${e.id}`, lang, join([
        `${pick(e, 'title', lang)} — ${pick(e, 'organization', lang)} (${e.start_date} – ${e.end_date || L.present})`,
        pick(e, 'description', lang),
        e.stack?.length && `${L.stack}: ${e.stack.join(', ')}`,
      ]))
    }
    for (const p of projects ?? []) {
      const key = p.slug || p.id
      const stack = Array.isArray(p.stack) ? p.stack.join(', ') : ''
      // One passage per project: the free Gemini tier allows 100 embedding requests/min, one per passage
      const choices = pickArr(p, 'technical_choices', lang)
      const challenges = pickArr(p, 'challenges', lang)
      const results = pickArr(p, 'results', lang)
      add(`project:${key}`, lang, join([
        pick(p, 'title', lang),
        pick(p, 'description', lang),
        stack && `${L.stack}: ${stack}`,
        p.status && `${L.status}: ${p.status}`,
        p.github_url, p.live_url,
        pick(p, 'context', lang) && `${L.context}: ${pick(p, 'context', lang)}`,
        choices.length && `${L.choices}:\n` + choices.map((c: Row) => `- ${c.choice}: ${c.reason}`).join('\n'),
        challenges.length && `${L.challenges}:\n` + challenges.map((c: string) => `- ${c}`).join('\n'),
        results.length && `${L.results}:\n` + results.map((r: Row) => `- ${r.metric}: ${r.value}`).join('\n'),
      ]))
    }
    const byCat = new Map<string, string[]>()
    for (const s of skills ?? []) {
      const name = pick(s, 'name', lang)
      if (name) byCat.set(s.category || 'Autres', [...(byCat.get(s.category || 'Autres') ?? []), name])
    }
    for (const [cat, names] of byCat) add(`skills:${cat}`, lang, `${L.skills} ${cat}: ${names.join(', ')}`)
    if (certifications?.length) {
      add('certifications', lang, `${L.certs}:\n` + certifications.map((c) => `- ${pick(c, 'name', lang)} (${pick(c, 'issuer', lang)}, ${c.date})`).join('\n'))
    }
  }
  return out
}

// Gemini embeddings. RETRIEVAL_DOCUMENT for passages, RETRIEVAL_QUERY for the user's question.
export async function embed(texts: string[], apiKey: string, taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY'): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents`
  const vectors: number[][] = []
  for (let i = 0; i < texts.length; i += 100) { // API limit: 100 per batch
    const batch = texts.slice(i, i + 100)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${EMBED_MODEL}`,
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: EMBED_DIMS,
        })),
      }),
    })
    const data = await res.json()
    if (!res.ok || !data.embeddings) throw new Error(`Embedding API: ${data.error?.message || res.status}`)
    for (const e of data.embeddings) {
      if (e.values?.length !== EMBED_DIMS) throw new Error(`Unexpected embedding size ${e.values?.length}`)
      vectors.push(e.values)
    }
  }
  return vectors
}
