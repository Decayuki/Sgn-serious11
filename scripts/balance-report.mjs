import { pathToFileURL } from 'node:url'
import { THEMES, getOutcome } from '../src/gameData.js'
import { createGame, currentScene, choose, advance } from '../src/gameEngine.js'

// Balance report (L11a): plays the real engine with three player profiles.
// - good: the L11 exploration "bon élève" (best weighted immediate effect among
//   legal, non-bad choices that do not open a crisis branch).
// - serious: picks uniformly among legal, non-bad choices (no optimisation).
// - negligent: picks uniformly among all choices, bad and illegal included.
const weights = { perceived: .2, valueAdded: .2, stakeholder: .25, shareholder: .15, cash: .2 }
const effectsOf = (game, c) => typeof c.effects === 'function' ? c.effects(game) : c.effects || {}
const value = (game, c) => Object.entries(effectsOf(game, c)).reduce((s, [k, d]) => s + (weights[k] || 0) * d, 0)
const legal = c => !c.bad && !(c.flags || []).includes('illegal')

function rng(seed) {
  let s = seed >>> 0
  return () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296
}

export const POLICIES = {
  good: (game, choices) => {
    const sorted = [...choices].sort((a, b) => value(game, b) - value(game, a))
    return sorted.find(c => legal(c) && !c.branchId) || sorted[0]
  },
  serious: (game, choices, rand) => {
    const ok = choices.filter(legal)
    const pool = ok.length ? ok : choices
    return pool[Math.floor(rand() * pool.length)]
  },
  negligent: (game, choices, rand) => choices[Math.floor(rand() * choices.length)],
}

export function play(themeId, policy, seed) {
  const rand = rng(seed ^ 0x9e3779b9)
  let game = createGame(themeId, 'classic', seed)
  while (game.screen !== 'end' && game.actions.length < 200) {
    game = game.result ? advance(game) : choose(game, POLICIES[policy](game, currentScene(game).choices, rand).id)
  }
  return { game, outcome: getOutcome(game.stats, game.history, game.flags, game.themeId) }
}

const WIN = new Set(['Bien joué', 'Master'])
const isWin = grade => [...WIN].some(w => grade.startsWith(w))

export function balanceReport(seedCount = 500) {
  return THEMES.map(theme => {
    const row = { theme: theme.id }
    for (const policy of Object.keys(POLICIES)) {
      const runs = Array.from({ length: seedCount }, (_, i) => play(theme.id, policy, Math.imul(i + 1, 2654435761) >>> 0))
      const scores = runs.map(r => r.outcome.score)
      row[policy] = {
        winRate: runs.filter(r => isWin(r.outcome.grade)).length / seedCount,
        catastropheRate: runs.filter(r => r.outcome.grade === 'Catastrophe').length / seedCount,
        minScore: Math.min(...scores), maxScore: Math.max(...scores),
        meanScore: Math.round(scores.reduce((a, b) => a + b, 0) / seedCount),
        minCash: Math.min(...runs.map(r => r.game.stats.cash)),
      }
    }
    const ref = play(theme.id, 'good', 42)
    row.reference = { seed: 42, grade: ref.outcome.grade, score: ref.outcome.score, stats: ref.game.stats }
    return row
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const pct = x => `${Math.round(x * 100)} %`
  for (const r of balanceReport()) {
    console.log(`${r.theme.padEnd(9)} ref42 ${r.reference.grade} (${r.reference.score}) ${JSON.stringify(r.reference.stats)}`)
    for (const p of Object.keys(POLICIES)) {
      const s = r[p]
      console.log(`  ${p.padEnd(9)} win ${pct(s.winRate).padStart(5)}  catastrophe ${pct(s.catastropheRate).padStart(5)}  score ${s.minScore}–${s.maxScore} (moy ${s.meanScore})  cash min ${s.minCash}`)
    }
  }
}
