# Bingo90 Tracker

A browser app for playing **90-ball bingo with many tickets at once**. Enter your tickets, tap each number as it is called, and the app marks every ticket and alerts you the moment one can claim a prize. No server, no accounts: everything runs and is stored in your browser.

## Features

- **Any number of tickets.** Add, rename, edit and delete tickets. Cells are validated against the 90-ball column rules (column 1 = 1–9, columns 2–8 = tens, column 9 = 80–90) with 5 numbers per row.
- **All common 90-ball prizes, switchable at any time.** Choose the prizes in play, even at the last minute. See [docs/RULES.md](docs/RULES.md).
- **Instant win alerts** with a banner, sound and vibration, naming the ticket and prize.
- **"One away" hints** on each ticket, showing exactly which number completes a prize.
- **House-rule switches:** last number drawn must be on the winning ticket; one category per ticket plus Full House.
- **Undo / reset**, and the game and tickets **survive a page refresh** (localStorage).
- Works on phones, supports dark mode.

## Quick start

Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # rule engine tests
npm run build    # production build in dist/
```

## How to play

1. Open the **Tickets** tab. Use **+ Add ticket** and type each ticket's numbers (leave blank cells empty). A ticket must show "Ticket is valid" before it is checked. **Load sample tickets** inserts an example set.
2. Open the **Play** tab and switch on the prizes being played.
3. Tap each called number on the 1–90 pad. Tap a yellow number again to take it back, or use **Undo last**.
4. When the green banner appears, shout BINGO and claim the prize it names. Prizes can be switched on or off mid-game.

## Project structure

```
src/
  App.jsx          UI: Play view, Tickets editor, state + persistence
  styles.css       Styling (light/dark, mobile first)
  main.jsx         React entry point
  lib/
    rules.js       Prize catalogue (plain data) + remaining() interpreter
    engine.js      evaluate(): pure win detector applying the house rules
    ticket.js      Ticket model, validation, helpers
    sample.js      Example tickets
test/engine.test.js   node:test unit tests
docs/RULES.md         Prize definitions and how to add your own
.github/workflows     GitHub Pages deployment
```

**Stack:** React 18 and Vite 5, plain JavaScript, no runtime dependencies besides React.

## Architecture

All app state lives in one object saved to `localStorage` (`bingo90-v1`):

| Field | Meaning |
|---|---|
| `tickets` | `{ id, name, rows }`, rows is 3×9 numbers with `0` for empty cells |
| `called` | Numbers called, in order |
| `active` | Keys of the prizes currently in play |
| `settings` | `lastNumberRule`, `oneCategory`, `sound` |
| `seen` / `ok` | Wins already noticed / wins valid as claims |

Every change goes through one `commit()` function in `App.jsx`, which calls the pure `evaluate()` in `lib/engine.js`. `evaluate()` returns the newly claimable wins, and the UI turns those into a banner. Because the engine has no UI or browser dependencies, it is easy to test and reuse.

## Contributing

Issues and pull requests are welcome. Run `npm test` and `npm run build` before opening a PR, and add a test in `test/` for any rule or engine change.

## License

MIT. See [LICENSE](LICENSE).
