import test from 'node:test'
import assert from 'node:assert/strict'
import { buildChunks } from './rag.ts'

const data = {
  profile: { name: 'Assami Baga', title_fr: 'Ingénieur', title_en: 'Engineer', bio_short_fr: 'Bio FR', bio_short_en: 'Bio EN', email: 'a@b.c' },
  experiences: [{ id: 'e1', title_en: 'Dev', title: 'Dév', organization: 'ACME', start_date: '2020', end_date: null, description_en: 'Built things', stack: ['Go'] }],
  projects: [{
    slug: 'p1', title_fr: 'Projet', title_en: 'Project', description_en: 'Desc', stack: ['Python'], status: 'production',
    context_en: 'Ctx', technical_choices_en: [{ choice: 'Redis', reason: 'speed' }], challenges_en: ['c1'], results_en: [{ metric: 'p95', value: '80ms' }],
  }],
  skills: [{ name: 'React', category: 'Frontend' }, { name: 'Go', category: 'Backend' }],
  certifications: [{ name: 'CKA', issuer: 'CNCF', date: '2021' }],
}

test('every chunk exists in both languages with a stable source', () => {
  const chunks = buildChunks(data)
  for (const lang of ['fr', 'en']) {
    const sources = chunks.filter((c) => c.lang === lang).map((c) => c.source)
    for (const s of ['profile', 'experience:e1', 'project:p1:overview', 'project:p1:context', 'project:p1:results', 'skills:Frontend', 'certifications']) {
      assert.ok(sources.includes(s), `${lang} missing ${s}`)
    }
  }
})

test('project details that the old prompt dropped are now indexed', () => {
  const text = buildChunks(data).filter((c) => c.lang === 'en').map((c) => c.content).join('\n')
  for (const needle of ['Redis: speed', 'c1', 'p95: 80ms', 'Ctx']) assert.ok(text.includes(needle), needle)
})

test('language fallback and empty data', () => {
  const fr = buildChunks(data).find((c) => c.lang === 'fr' && c.source === 'project:p1:overview')!
  assert.ok(fr.content.startsWith('Projet'))
  assert.ok(!fr.content.includes('Desc')) // fallback is lang -> fr -> base, never the other language
  assert.deepEqual(buildChunks({}), [])
})
