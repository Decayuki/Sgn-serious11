import test from 'node:test'
import assert from 'node:assert/strict'
import { THEMES, INITIAL_STATS, getOutcome, applyEffects } from '../src/gameData.js'
import { createGame, currentScene, choose, advance, operatingIncome } from '../src/gameEngine.js'
import { SAVE_KEY, serializeGame, restoreGame, saveGame, loadGame, emitScoreOnce, reportScore } from '../src/gameStorage.js'
import { coherentChoice, simulate, report } from '../scripts/simulate.mjs'

for (const row of report()) {
  test(`${row.theme}: 1000 winning runs, every forced branch and ordered event pair`, () => {
    const theme = THEMES.find(t => t.id === row.theme)
    assert.equal(row.failures, 0)
    assert.ok(row.minScore >= 70)
    assert.ok(row.minCash >= 25)
    assert.deepEqual(row.branches.sort(), [...theme.branchPool].sort())
    assert.deepEqual(row.events.sort(), theme.randomEvents.map(e => e.id).sort())
    assert.equal(row.combinations, theme.branchPool.length * theme.randomEvents.length * (theme.randomEvents.length - 1))
  })
}

test('every decision/feedback checkpoint resumes identically, including functions and branch queues', () => {
  const covered = new Set()
  for (const theme of THEMES) for (let i = 1; i <= 1000; i++) {
    const full = simulate(theme.id, Math.imul(i, 2654435761) >>> 0, 'challenge')
    const key = `${theme.id}/${full.usedBranchIds}/${full.usedRandomIds}`
    if (covered.has(key)) continue
    covered.add(key)
    let game = createGame(theme.id, 'challenge', full.seed)
    for (const action of full.actions) {
      game = action === null ? advance(game) : choose(game, action)
      assert.deepEqual(restoreGame(serializeGame(game)), game)
    }
  }
  assert.equal(covered.size, 360)
})

test('income is paid once per main scene, never by branch or repeated clicks', () => {
  let game = createGame('cafe', 'classic', 42)
  for (let i = 0; i < 4; i++) {
    const prev = game
    const choice = coherentChoice(game)
    const effects = typeof choice.effects === 'function' ? choice.effects(game) : choice.effects
    game = choose(game, choice.id)
    assert.equal(game.result.income, operatingIncome(applyEffects(prev.stats, effects)))
    assert.equal(choose(game, choice.id), game)
    const feedback = game
    game = advance(game)
    assert.equal(advance(game), game)
    assert.equal(feedback.history.length, i + 1)
  }
  assert.ok(game.branchState)
  game = choose(game, coherentChoice(game).id)
  assert.equal(game.result.income, 0)
})

test('two bad choices trigger the crisis once; deliberately poor play still fails', () => {
  let game = createGame('cafe')
  for (let i = 0; i < 200 && game.screen !== 'end'; i++) {
    if (game.result) { game = advance(game); continue }
    const scene = currentScene(game)
    const choice = scene.choices.find(c => c.flags?.includes('illegal')) || scene.choices.find(c => c.bad) || scene.choices[0]
    game = choose(game, choice.id)
    assert.equal(new Set(game.branchQueue).size, game.branchQueue.length)
  }
  assert.equal(game.screen, 'end')
  assert.ok(game.flags.has('spiral-triggered'))
  assert.equal(game.usedBranchIds.filter(id => id === 'spiral').length, 1)
  assert.equal(getOutcome(game.stats, game.history, game.flags, game.themeId).grade, 'Catastrophe')
  assert.equal(getOutcome({ ...INITIAL_STATS, cash: 24 }, [], new Set(), 'cafe').grade, 'Catastrophe')
  assert.equal(getOutcome(Object.fromEntries(Object.keys(INITIAL_STATS).map(k => [k, 100])), [], new Set(['illegal']), 'cafe').grade, 'Catastrophe')
})

test('corrupt, incompatible and impossible saves are rejected without a crash', () => {
  const good = JSON.parse(serializeGame(createGame()))
  for (const raw of [null, '{', 'null', '{}', 'x'.repeat(30001),
    ...[{ version: 1 }, { themeId: 'missing' }, { seed: -1 }, { seed: 1.2 },
      { actions: [null] }, { actions: ['missing'] }, { actions: Array(201).fill(null) },
      { actions: ['premium-experience', 'premium-experience'] }, { runId: '../oops' }].map(p => JSON.stringify({ ...good, ...p }))]) {
    assert.equal(restoreGame(raw), null)
  }
  const storage = new Map()
  const api = () => ({ getItem: k => storage.get(k), setItem: (k,v) => storage.set(k,v) })
  assert.equal(saveGame(createGame(), api), true)
  assert.ok(storage.has(SAVE_KEY))
  assert.deepEqual(loadGame(api), createGame())
  const denied = () => { throw new Error('Blocked storage') }
  assert.equal(saveGame(createGame(), denied), false)
  assert.equal(loadGame(denied), null)
})

test('GAME_SCORE emitted only at completion, once across effects and restoration', () => {
  const values = new Map()
  const storage = () => ({ getItem: k => values.get(k), setItem: (k,v) => values.set(k,v) })
  const messages = []
  const parent = { postMessage: (...args) => messages.push(args) }
  const self = {}
  const end = { ...simulate('cafe', 42), runId: 'score-test' }
  assert.equal(emitScoreOnce(createGame(), parent, self, storage), false)
  assert.equal(emitScoreOnce(end, self, self, storage), false)
  assert.equal(emitScoreOnce(end, parent, self, storage), true)
  assert.equal(emitScoreOnce(end, parent, self, storage), false)
  assert.equal(emitScoreOnce(restoreGame(serializeGame(end)), parent, self, storage), false)
  assert.deepEqual(messages, [[{ type: 'GAME_SCORE', score: getOutcome(end.stats,end.history,end.flags,end.themeId).score }, '*']])
  values.set('sgn11:score:previous-document', 'sent')
  assert.equal(emitScoreOnce({ ...end, runId: 'previous-document' }, parent, self, storage), false)
  const denied = () => { throw new Error('denied') }
  assert.equal(emitScoreOnce({ ...end, runId: 'denied' }, parent, self, denied), true)
  assert.equal(emitScoreOnce({ ...end, runId: 'denied' }, parent, self, denied), false)
})


test('simultaneous completion uses the same browser lock', async () => {
  let queued = Promise.resolve()
  const names = []
  const messages = []
  const data = new Map()
  const host = { parent: { postMessage: m => messages.push(m) },
    localStorage: { getItem: k => data.get(k), setItem: (k,v) => data.set(k,v) },
    navigator: { locks: { request: (name, task) => { names.push(name); queued = queued.then(task); return queued } } } }
  const end = { ...simulate('boxing', 42), runId: 'locked-completion' }
  await Promise.all([reportScore(end, host), reportScore(end, host)])
  assert.deepEqual(names, ['sgn11-score-locked-completion', 'sgn11-score-locked-completion'])
  assert.equal(messages.length, 1)
})
