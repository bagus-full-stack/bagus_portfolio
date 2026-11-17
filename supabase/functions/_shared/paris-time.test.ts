// Run: npm test (node --test, Node 22+)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parisOffsetMin, parisTime } from './paris-time.ts'

test('summer: Paris is UTC+2', () => {
  assert.equal(parisOffsetMin(new Date('2026-07-01T12:00:00Z')), 120)
  assert.equal(parisTime('2026-07-01', 9).toISOString(), '2026-07-01T07:00:00.000Z')
})

test('winter: Paris is UTC+1', () => {
  assert.equal(parisOffsetMin(new Date('2026-12-01T12:00:00Z')), 60)
  assert.equal(parisTime('2026-12-01', 9).toISOString(), '2026-12-01T08:00:00.000Z')
})

test('day DST starts (2026-03-29): 09:00 Paris is already UTC+2', () => {
  assert.equal(parisTime('2026-03-29', 9).toISOString(), '2026-03-29T07:00:00.000Z')
})
