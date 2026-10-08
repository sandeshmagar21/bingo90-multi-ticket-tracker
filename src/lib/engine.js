import { RULES, FULL_KEY, remaining } from './rules.js'
import { ticketRows, validateTicket } from './ticket.js'

/**
 * Pure win detector. Run it after every change (number called/undone, rule toggled,
 * ticket edited) and alert for whatever it returns in `fresh`.
 *
 * state: { tickets, called[], active[], settings, seen[], ok[] }
 *   seen: every "rule|ticketId" win already noticed (so it alerts once)
 *   ok:   wins that are valid claims under the house rules
 * settings.lastNumberRule: the last number drawn must be on the claimed ticket
 * settings.oneCategory:    a ticket claims one category, plus Full House
 *
 * @returns {{seen:string[], ok:string[], fresh:Object<string, object[]>}} fresh: ticketId -> newly claimable rules
 */
export function evaluate({ tickets, called, active, settings, seen, ok }) {
  const calledSet = new Set(called)
  const last = called[called.length - 1]
  const act = new Set(active)
  const okBefore = new Set(ok)
  const nSeen = new Set(seen)
  const nOk = new Set(ok)
  const now = new Set()
  const fresh = {}

  for (const rule of RULES) {
    if (!act.has(rule.key)) continue
    for (const t of tickets) {
      if (validateTicket(t).length) continue
      const rows = ticketRows(t)
      if (remaining(rule, rows, calledSet).left > 0) continue
      const key = `${rule.key}|${t.id}`
      now.add(key)
      if (nSeen.has(key)) continue
      nSeen.add(key)
      if (settings.lastNumberRule && !(last && rows.flat().includes(last))) continue
      const locked =
        settings.oneCategory && rule.key !== FULL_KEY &&
        RULES.some((q) => q.key !== FULL_KEY && okBefore.has(`${q.key}|${t.id}`))
      if (locked) continue
      nOk.add(key)
      ;(fresh[t.id] ||= []).push(rule)
    }
  }
  // forget wins that no longer hold (after undo, rule switched off, ticket edited)
  return { seen: [...nSeen].filter((k) => now.has(k)), ok: [...nOk].filter((k) => now.has(k)), fresh }
}
