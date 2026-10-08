/** A ticket is { id, name, rows }: rows is 3 x 9 numbers, 0 = empty cell. */
export const colRange = (c) => [c === 0 ? 1 : c * 10, c === 8 ? 90 : c * 10 + 9]

let n = 0
export const newId = () => `t${Date.now().toString(36)}${n++}`
export const blankTicket = (name) => ({ id: newId(), name, rows: [0, 1, 2].map(() => Array(9).fill(0)) })

/** The 5 numbers of each row, left to right. */
export const ticketRows = (t) => t.rows.map((r) => r.filter(Boolean))

/** True when a cell is outside its column range or duplicated. */
export function cellBad(t, r, c) {
  const v = t.rows[r][c]
  if (!v) return false
  const [lo, hi] = colRange(c)
  return v < lo || v > hi || t.rows.flat().filter((x) => x === v).length > 1
}

/** Human-readable problems; empty list = valid ticket. */
export function validateTicket(t) {
  const errs = []
  t.rows.forEach((row, r) => {
    const k = row.filter(Boolean).length
    if (k !== 5) errs.push(`Row ${r + 1} has ${k} numbers (needs 5)`)
    row.forEach((_, c) => cellBad(t, r, c) && errs.push(`Row ${r + 1}, column ${c + 1}: ${t.rows[r][c]} is out of range or duplicated`))
  })
  return errs
}
