import { pathToFileURL } from 'node:url'
import { THEMES, getOutcome } from '../src/gameData.js'
import { createGame, currentScene, choose, advance } from '../src/gameEngine.js'

const weights = { perceived: .2, valueAdded: .2, stakeholder: .25, shareholder: .15, cash: .2 }
// No look-ahead or seed-specific policy: prefer legal decisions that do not
// trigger a crisis, then the strongest balanced immediate educational effect.
export function coherentChoice(game) {
  const legal = currentScene(game).choices.filter(c => !c.bad && !(c.flags || []).includes('illegal'))
  const calm = legal.filter(c => !c.branchId)
  const candidates = calm.length ? calm : legal
  if (!candidates.length) throw new Error(`No coherent choice: ${game.themeId}/${currentScene(game).id}`)
  const value = c => Object.entries(typeof c.effects === 'function' ? c.effects(game) : c.effects || {})
    .reduce((sum, [key, delta]) => sum + weights[key] * delta, 0)
  return candidates.sort((a, b) => value(b) - value(a))[0]
}

export function simulate(themeId, seed, mode = 'classic') {
  let game = createGame(themeId, mode, seed)
  while (game.screen !== 'end' && game.actions.length < 200) {
    game = game.result ? advance(game) : choose(game, coherentChoice(game).id)
  }
  if (game.screen !== 'end') throw new Error('Simulation did not terminate')
  return game
}

export function report(seedCount = 1000) {
  return THEMES.map(theme => {
    const games = Array.from({ length: seedCount }, (_, i) => simulate(theme.id, Math.imul(i + 1, 2654435761) >>> 0))
    const scores = games.map(g => getOutcome(g.stats, g.history, g.flags, g.themeId))
    return { theme: theme.id, runs: seedCount, minScore: Math.min(...scores.map(s => s.score)),
      maxScore: Math.max(...scores.map(s => s.score)), minCash: Math.min(...games.map(g => g.stats.cash)),
      failures: scores.filter(s => s.score < 70 || s.grade === 'Catastrophe').length,
      branches: [...new Set(games.flatMap(g => g.usedBranchIds))],
      events: [...new Set(games.flatMap(g => g.usedRandomIds))],
      combinations: new Set(games.map(g => `${g.usedBranchIds.join(',')}/${g.usedRandomIds.join(',')}`)).size,
      reference: { seed: 42, choices: simulate(theme.id, 42).history.map(h => `${h.stepId}:${h.choiceId}`) } }
  })
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) console.log(JSON.stringify(report(), null, 2))
