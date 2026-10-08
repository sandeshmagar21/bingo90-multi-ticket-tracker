import { useState, useEffect } from 'react'
import { RULES, FULL_KEY, remaining } from './lib/rules.js'
import { evaluate } from './lib/engine.js'
import { ticketRows, validateTicket, cellBad, blankTicket } from './lib/ticket.js'
import { SAMPLE } from './lib/sample.js'
import './styles.css'

const KEY = 'bingo90-v1'
const DEFAULTS = {
  tickets: SAMPLE, called: [], active: ['first5', 'l1', 'l2', 'l3', 'corners', 'full'],
  settings: { lastNumberRule: true, oneCategory: true, sound: true }, seen: [], ok: [],
}
const load = () => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) } } catch { return DEFAULTS } }

function beep() {
  try {
    const a = new (window.AudioContext || window.webkitAudioContext)()
    ;[660, 880, 1100, 1320].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * 0.15
      o.frequency.value = f; o.connect(g); g.connect(a.destination)
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
      o.start(t); o.stop(t + 0.15)
    })
    navigator.vibrate?.([200, 100, 200, 100, 400])
  } catch { /* audio is optional */ }
}

export default function App() {
  const [s, setS] = useState(load)
  const [view, setView] = useState('play')
  const [banner, setBanner] = useState('')
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage optional */ } }, [s])

  // single entry point: apply a change, re-evaluate wins, alert on new ones
  const commit = (patch) => {
    const n = { ...s, ...patch }
    const r = evaluate(n)
    n.seen = r.seen; n.ok = r.ok
    setS(n)
    const ids = Object.keys(r.fresh)
    if (ids.length) {
      setBanner('BINGO! ' + ids.map((id) => {
        const rs = r.fresh[id], nf = rs.filter((x) => x.key !== FULL_KEY)
        const name = n.tickets.find((t) => t.id === id)?.name
        const what = nf.length > 1 ? `claim ONE of ${nf.map((x) => x.name).join(' / ')}${rs.length > nf.length ? ' + Full House' : ''}` : rs.map((x) => x.name).join(' + ')
        return `Ticket ${name}: ${what}`
      }).join(' | '))
      if (n.settings.sound) beep()
    }
  }
  const toggleNum = (n) => commit({ called: s.called.includes(n) ? s.called.filter((x) => x !== n) : [...s.called, n] })
  const toggleRule = (k) => commit({ active: s.active.includes(k) ? s.active.filter((x) => x !== k) : [...s.active, k] })
  const setSetting = (k, v) => commit({ settings: { ...s.settings, [k]: v } })
  const editTicket = (id, fn) => commit({ tickets: s.tickets.map((t) => (t.id === id ? fn(t) : t)) })

  return (
    <main>
      {banner && <div className="banner" role="alert"><div className="msg">{banner}</div><button onClick={() => setBanner('')}>Got it</button></div>}
      <header>
        <h1>Bingo90 Tracker</h1>
        <nav>{['play', 'tickets'].map((v) => <button key={v} className={'tab' + (view === v ? ' on' : '')} onClick={() => setView(v)}>{v === 'play' ? 'Play' : `Tickets (${s.tickets.length})`}</button>)}</nav>
      </header>
      {view === 'play' ? <Play {...{ s, commit, toggleNum, toggleRule, setSetting }} /> : <Tickets {...{ s, commit, editTicket }} />}
    </main>
  )
}

function Play({ s, commit, toggleNum, toggleRule, setSetting }) {
  const [armed, setArmed] = useState(false)
  const last = s.called[s.called.length - 1]
  const calledSet = new Set(s.called)
  return (
    <>
      <section>
        <h2>Prizes in play</h2>
        <div className="chips">
          {RULES.map((r) => (
            <button key={r.key} title={r.desc} aria-pressed={s.active.includes(r.key)}
              className={'chip' + (s.tickets.some((t) => s.ok.includes(`${r.key}|${t.id}`)) ? ' done' : '')}
              onClick={() => toggleRule(r.key)}>{r.name}</button>
          ))}
        </div>
        <div className="row">
          <button className="sm" onClick={() => commit({ active: RULES.map((r) => r.key) })}>All</button>
          <button className="sm" onClick={() => commit({ active: [] })}>None</button>
          <label><input type="checkbox" checked={s.settings.lastNumberRule} onChange={(e) => setSetting('lastNumberRule', e.target.checked)} /> Last number must be on winning ticket</label>
          <label><input type="checkbox" checked={s.settings.oneCategory} onChange={(e) => setSetting('oneCategory', e.target.checked)} /> One category per ticket (+ Full House)</label>
          <label><input type="checkbox" checked={s.settings.sound} onChange={(e) => setSetting('sound', e.target.checked)} /> Sound</label>
        </div>
      </section>
      <section>
        <div className="row between">
          <h2>Call a number</h2>
          <div className="row">
            <button className="sm" onClick={() => s.called.length && commit({ called: s.called.slice(0, -1) })}>Undo last</button>
            <button className="sm" onClick={() => { if (!armed) { setArmed(true); setTimeout(() => setArmed(false), 3000) } else { setArmed(false); commit({ called: [], seen: [], ok: [] }) } }}>{armed ? 'Tap again to confirm' : 'Reset game'}</button>
          </div>
        </div>
        <div className="lastcall"><div className="big">{last || '–'}</div>
          <div className="hist">{s.called.length ? `Called (${s.called.length}): ${[...s.called].reverse().join(', ')}` : 'No numbers called yet.'}</div></div>
        <div className="pad">{Array.from({ length: 90 }, (_, i) => i + 1).map((n) => (
          <button key={n} className={'n' + (calledSet.has(n) ? ' called' : '') + (n === last ? ' last' : '')} onClick={() => toggleNum(n)} aria-label={`Number ${n}${calledSet.has(n) ? ', called' : ''}`}>{n}</button>
        ))}</div>
      </section>
      <div className="tickets">{s.tickets.map((t) => <TicketCard key={t.id} t={t} s={s} calledSet={calledSet} />)}</div>
      {!s.tickets.length && <p className="note">No tickets yet. Add some in the Tickets tab.</p>}
    </>
  )
}

function TicketCard({ t, s, calledSet }) {
  const errs = validateTicket(t)
  const claimed = RULES.filter((r) => s.ok.includes(`${r.key}|${t.id}`))
  const locked = s.settings.oneCategory && claimed.some((r) => r.key !== FULL_KEY)
  const rows = errs.length ? null : ticketRows(t)
  const near = []
  if (rows) RULES.filter((r) => s.active.includes(r.key) && !(locked && r.key !== FULL_KEY)).forEach((r) => {
    const x = remaining(r, rows, calledSet)
    if (x.left === 1) near.push(`${x.nums ? x.nums[0] : 'any number'} (${r.name})`)
  })
  const marked = t.rows.flat().filter((v) => v && calledSet.has(v)).length
  return (
    <div className={'t' + (claimed.length ? ' won' : '')}>
      <div className="th"><b>{t.name}</b><span>{marked}/15 marked</span></div>
      <div className="g">{t.rows.flat().map((v, i) => <div key={i} className={'c' + (!v ? ' e' : calledSet.has(v) ? ' m' : '')}>{v || ''}</div>)}</div>
      {errs.length > 0 && <p className="warn">Ticket is incomplete, so it is not being checked. Fix it in the Tickets tab.</p>}
      {near.length > 0 && <div className="note">One away: <span className="near">{[...new Set(near)].join(', ')}</span></div>}
      {claimed.length > 0 && <div className="wins">Claimed: {claimed.map((r) => r.name).join(', ')}{locked ? ' (now only Full House)' : ''}</div>}
    </div>
  )
}

function Tickets({ s, commit, editTicket }) {
  const add = () => commit({ tickets: [...s.tickets, blankTicket(`Ticket ${s.tickets.length + 1}`)] })
  return (
    <>
      <section>
        <div className="row">
          <button className="sm primary" onClick={add}>+ Add ticket</button>
          <button className="sm" onClick={() => commit({ tickets: SAMPLE })}>Load sample tickets</button>
          <button className="sm" onClick={() => commit({ tickets: [] })}>Remove all</button>
        </div>
        <p className="note">Type the numbers of each ticket exactly as printed, leaving blank cells empty. A ticket has 3 rows × 9 columns with 5 numbers per row. Column 1 holds 1–9, column 2 holds 10–19 … column 9 holds 80–90.</p>
      </section>
      <div className="tickets">
        {s.tickets.map((t) => {
          const errs = validateTicket(t)
          return (
            <div className="t" key={t.id}>
              <div className="th">
                <input className="name" value={t.name} aria-label="Ticket name" onChange={(e) => editTicket(t.id, (x) => ({ ...x, name: e.target.value }))} />
                <button className="sm" onClick={() => commit({ tickets: s.tickets.filter((x) => x.id !== t.id) })}>Delete</button>
              </div>
              <div className="g">{t.rows.map((row, r) => row.map((v, c) => (
                <input key={r + '-' + c} className={'c in' + (cellBad(t, r, c) ? ' bad' : '')} inputMode="numeric" maxLength={2}
                  aria-label={`Row ${r + 1} column ${c + 1}`} value={v || ''}
                  onChange={(e) => { const d = e.target.value.replace(/\D/g, ''); editTicket(t.id, (x) => ({ ...x, rows: x.rows.map((rw, i) => (i === r ? rw.map((q, j) => (j === c ? Number(d) || 0 : q)) : rw)) })) }} />
              )))}</div>
              {errs.length ? <ul className="warn">{errs.slice(0, 4).map((e) => <li key={e}>{e}</li>)}</ul> : <p className="ok">Ticket is valid</p>}
            </div>
          )
        })}
      </div>
    </>
  )
}
