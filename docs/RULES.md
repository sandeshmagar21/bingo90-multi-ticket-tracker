# Prizes (rules)

Ticket layout used throughout: 3 rows, each with **5 numbers**. A number's position in a row is its index 0–4 among that row's five numbers (blank cells are ignored), so *corners* mean the first and last number of the top and bottom rows.

| Key | Name | Win condition |
|---|---|---|
| `first5` | First 5 | Any 5 numbers marked on one ticket (Early Five) |
| `early7` | Early Seven | Any 7 numbers marked on one ticket |
| `l1` | 1 Line | Top line complete |
| `l2` | 2 Lines | Middle line complete |
| `l3` | 3rd Line | Bottom line complete |
| `anyLine` | Any One Line | Any single line complete |
| `twoLines` | Any Two Lines | Any two lines complete |
| `corners` | Four Corners | Row 1 first and last, row 3 first and last |
| `star` | Star | Four corners plus the middle row's centre number |
| `pyramid` | Pyramid | Top centre, middle row's inner three, whole bottom row |
| `invPyramid` | Inverted Pyramid | Whole top row, middle row's inner three, bottom centre |
| `full` | Full House | All 15 numbers |

The names `1 Line`, `2 Lines` and `3rd Line` follow the common Indian party-bingo wording, where they mean the first, second and third horizontal line.

## House rules (Settings on the Play tab)

- **Last number must be on the winning ticket.** A win only alerts if the number just called is on that ticket. Wins completed earlier, or by prizes switched on later, are not alerted.
- **One category per ticket, plus Full House.** After a ticket claims a category it cannot claim another, but it can still claim Full House. If one call completes two categories on the same ticket, the alert says "claim ONE of …".

## Adding your own prize

Add an entry to `RULES` in `src/lib/rules.js`:

```js
// Corners plus every number of the middle row
{ key: 'frame', name: 'Frame', desc: 'Four corners and the middle row',
  type: 'cells',
  cells: [[0,0],[0,4],[2,0],[2,4],[1,0],[1,1],[1,2],[1,3],[1,4]] }
```

Types: `count` (`n`), `lines` (`pool` and `of`), `cells` (`[row, index]` pairs), `full`. It appears in the prize list automatically. Add a test in `test/engine.test.js`.

## Not supported

Rules that depend on other players, such as a "Second Full House" for the next ticket to finish, need a shared game state across players, which this single-device tracker does not have.
