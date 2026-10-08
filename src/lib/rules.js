/**
 * Prize catalogue for 90-ball bingo. Rules are plain data; `remaining()` interprets them.
 *
 * Rule types
 *   count : any `n` marked numbers on one ticket
 *   lines : complete `of` lines chosen from `pool` (row index 0=top, 1=middle, 2=bottom)
 *   cells : complete specific cells, addressed as [row, index among that row's five numbers]
 *   full  : all 15 numbers
 */
export const FULL_KEY = 'full'

const range = (r, from, to) => Array.from({ length: to - from + 1 }, (_, i) => [r, from + i])

export const RULES = [
  { key: 'first5', name: 'First 5', desc: 'Any five numbers on one ticket (Early Five)', type: 'count', n: 5 },
  { key: 'early7', name: 'Early Seven', desc: 'Any seven numbers on one ticket', type: 'count', n: 7 },
  { key: 'l1', name: '1 Line', desc: 'Top line complete', type: 'lines', pool: [0], of: 1 },
  { key: 'l2', name: '2 Lines', desc: 'Middle line complete', type: 'lines', pool: [1], of: 1 },
  { key: 'l3', name: '3rd Line', desc: 'Bottom line complete', type: 'lines', pool: [2], of: 1 },
  { key: 'anyLine', name: 'Any One Line', desc: 'Any single line complete', type: 'lines', pool: [0, 1, 2], of: 1 },
  { key: 'twoLines', name: 'Any Two Lines', desc: 'Any two lines complete', type: 'lines', pool: [0, 1, 2], of: 2 },
  { key: 'corners', name: 'Four Corners', desc: 'First and last number of top and bottom rows', type: 'cells', cells: [[0, 0], [0, 4], [2, 0], [2, 4]] },
  { key: 'star', name: 'Star', desc: 'Four corners plus middle row centre', type: 'cells', cells: [[0, 0], [0, 4], [1, 2], [2, 0], [2, 4]] },
  { key: 'pyramid', name: 'Pyramid', desc: 'Top centre, middle centre three, whole bottom row', type: 'cells', cells: [[0, 2], ...range(1, 1, 3), ...range(2, 0, 4)] },
  { key: 'invPyramid', name: 'Inverted Pyramid', desc: 'Whole top row, middle centre three, bottom centre', type: 'cells', cells: [...range(0, 0, 4), ...range(1, 1, 3), [2, 2]] },
  { key: 'full', name: 'Full House', desc: 'All 15 numbers', type: 'full' },
]

/**
 * Distance of a ticket from a rule.
 * @param rows   3 arrays of 5 numbers (see ticketRows)
 * @param called Set of called numbers
 * @returns {{left:number, nums:number[]|null}} nums = exact numbers still needed (null for `count`, where any number helps)
 */
export function remaining(rule, rows, called) {
  const miss = (xs) => xs.filter((x) => !called.has(x))
  switch (rule.type) {
    case 'count': {
      const left = Math.max(0, rule.n - rows.flat().filter((x) => called.has(x)).length)
      return { left, nums: null }
    }
    case 'lines': {
      const nums = rule.pool.map((r) => miss(rows[r])).sort((a, b) => a.length - b.length).slice(0, rule.of).flat()
      return { left: nums.length, nums }
    }
    case 'cells': {
      const nums = miss(rule.cells.map(([r, i]) => rows[r][i]))
      return { left: nums.length, nums }
    }
    default: {
      const nums = miss(rows.flat())
      return { left: nums.length, nums }
    }
  }
}
