import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluate } from '../src/lib/engine.js'
import { RULES } from '../src/lib/rules.js'
import { SAMPLE } from '../src/lib/sample.js'
import { validateTicket } from '../src/lib/ticket.js'

const base = { tickets: SAMPLE, active: RULES.map((r) => r.key), settings: { lastNumberRule: true, oneCategory: true }, seen: [], ok: [] }
// call numbers one by one, like the app does
function play(nums) {
  let s = { ...base, called: [] }, out
  for (const n of nums) { s = { ...s, called: [...s.called, n] }; out = evaluate(s); s = { ...s, seen: out.seen, ok: out.ok } }
  return out
}

test('sample tickets are valid', () => SAMPLE.forEach((t) => assert.deepEqual(validateTicket(t), [])))

test('top line on #433 fires 1 Line only when complete', () => {
  assert.deepEqual(play([13, 34, 50, 60]).fresh, {})
  assert.ok(play([13, 34, 50, 60, 87]).fresh['433'].some((r) => r.key === 'l1'))
})

test('a win needs the last number drawn on that ticket', () => {
  const s = { ...base, called: [13, 34, 50, 60, 87, 1] } // 1 belongs to another ticket
  assert.equal(evaluate(s).fresh['433'], undefined)
})

test('one category per ticket, but Full House is still allowed', () => {
  const t = SAMPLE[0]
  const out = play(t.rows.flat().filter(Boolean))
  const keys = out.ok.map((k) => k.split('|')).filter(([, id]) => id === '433').map(([k]) => k)
  assert.ok(keys.includes('full'))
})
