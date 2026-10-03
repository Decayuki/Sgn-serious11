import { THEMES, INITIAL_STATS, BAD_THRESHOLD, FORCE_BRANCH_AFTER, applyEffects } from './gameData.js'

export function createGame(themeId = 'cafe', gameMode = 'classic', seed = 1, runId = 'simulation') {
  if (!THEMES.some(t => t.id === themeId) || !['classic', 'challenge'].includes(gameMode)) throw new Error('Unknown game')
  return { themeId, gameMode, seed: seed >>> 0, rng: seed >>> 0, runId,
    screen: 'game', stepIndex: 0, stats: { ...INITIAL_STATS }, flags: new Set(),
    history: [], actions: [], result: null, activeEvent: null, branchState: null,
    branchQueue: [], usedBranchIds: [], usedRandomIds: [], forcedBranchDone: false }
}

const themeOf = game => THEMES.find(t => t.id === game.themeId)
export function currentScene(game) {
  const theme = themeOf(game)
  if (game.branchState) return theme.branches[game.branchState.id].scenes[game.branchState.index]
  const scene = theme.scenes[game.stepIndex]
  return scene?.type === 'random' ? theme.randomEvents.find(e => e.id === game.activeEvent) : scene
}

function pick(game, list) {
  game.rng = (Math.imul(game.rng, 1664525) + 1013904223) >>> 0
  return list[Math.floor((game.rng / 4294967296) * list.length)]
}

// Each main scene is one operating period. Branches are incidents within that
// period: they incur their costs but never generate additional operating income.
// These are game gauge points, not a monetary cash-flow accounting model.
export function operatingIncome(stats) {
  return Math.round(2 + Math.min(stats.perceived, stats.valueAdded, stats.stakeholder) / 20)
}

export function choose(game, choiceId) {
  if (game.screen !== 'game' || game.result) return game
  const scene = currentScene(game)
  const choice = scene?.choices.find(c => c.id === choiceId)
  if (!choice) return game
  const effects = typeof choice.effects === 'function' ? choice.effects(game) : choice.effects || {}
  const afterChoice = applyEffects(game.stats, effects)
  const income = game.branchState ? 0 : operatingIncome(afterChoice)
  const stats = applyEffects(afterChoice, { cash: income })
  const flags = new Set([...game.flags, ...(choice.flags || [])])
  const history = [...game.history, { stepId: scene.id, choiceId, label: choice.label,
    verdict: choice.verdict, bad: Boolean(choice.bad), income }]
  const branchQueue = [...game.branchQueue]
  const enqueue = id => {
    if (themeOf(game).branches[id] && !game.usedBranchIds.includes(id) && !branchQueue.includes(id)) branchQueue.push(id)
  }
  const ids = choice.branchId ? [choice.branchId].flat() : []
  ids.forEach(enqueue)
  if (history.filter(h => h.bad).length >= BAD_THRESHOLD && !flags.has('spiral-triggered')) {
    flags.add('spiral-triggered')
    enqueue('spiral')
  }
  return { ...game, stats, flags, history, branchQueue,
    forcedBranchDone: game.forcedBranchDone || ids.length > 0,
    actions: [...game.actions, choiceId],
    result: { title: choice.verdict, text: choice.consequence, effects, income,
      actualCashDelta: stats.cash - game.stats.cash } }
}

function startBranch(game, id) {
  const branch = themeOf(game).branches[id]
  game.branchState = { id, label: branch.label, index: 0 }
  game.usedBranchIds = [...game.usedBranchIds, id]
  game.forcedBranchDone = true
}

export function advance(previous) {
  if (previous.screen !== 'game' || !previous.result) return previous
  const game = { ...previous, result: null, branchQueue: [...previous.branchQueue], actions: [...previous.actions, null] }
  const theme = themeOf(game)
  if (game.branchState) {
    const branch = theme.branches[game.branchState.id]
    if (game.branchState.index < branch.scenes.length - 1) {
      game.branchState = { ...game.branchState, index: game.branchState.index + 1 }
      return game
    }
    game.branchState = null
  } else if (!game.branchQueue.length && !game.forcedBranchDone && game.stepIndex >= FORCE_BRANCH_AFTER) {
    const available = theme.branchPool.filter(id => !game.usedBranchIds.includes(id))
    if (available.length) {
      startBranch(game, pick(game, available))
      return game
    }
  }
  if (game.branchQueue.length) {
    startBranch(game, game.branchQueue.shift())
    return game
  }
  game.stepIndex += 1
  game.activeEvent = null
  if (game.stepIndex >= theme.scenes.length) game.screen = 'end'
  else if (theme.scenes[game.stepIndex].type === 'random') {
    const pool = theme.randomEvents.filter(e => !game.usedRandomIds.includes(e.id))
    const event = pick(game, pool.length ? pool : theme.randomEvents)
    game.activeEvent = event.id
    game.usedRandomIds = [...game.usedRandomIds, event.id]
  }
  return game
}
