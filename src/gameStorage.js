import { createGame, choose, advance } from './gameEngine.js'
import { getOutcome } from './gameData.js'

export const SAVE_KEY = 'sgn11:save:v2'
const VERSION = 2

// Store only replayable input, never serialized scene functions or trusted scores.
export function serializeGame(game) {
  return JSON.stringify({ version: VERSION, themeId: game.themeId, gameMode: game.gameMode,
    seed: game.seed, runId: game.runId, actions: game.actions })
}

export function restoreGame(raw) {
  try {
    if (typeof raw !== 'string' || raw.length > 30000) return null
    const saved = JSON.parse(raw)
    if (saved.version !== VERSION || !Number.isInteger(saved.seed) || saved.seed < 0 || saved.seed > 0xffffffff ||
        typeof saved.runId !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(saved.runId) ||
        !Array.isArray(saved.actions) || saved.actions.length > 200) return null
    let game = createGame(saved.themeId, saved.gameMode, saved.seed, saved.runId)
    for (const action of saved.actions) {
      if (action !== null && typeof action !== 'string') return null
      const next = action === null ? advance(game) : choose(game, action)
      if (next === game) return null
      game = next
    }
    return game
  } catch { return null }
}

export function loadGame(storage) {
  try { return restoreGame(storage().getItem(SAVE_KEY)) } catch { return null }
}

export function saveGame(game, storage) {
  try { storage().setItem(SAVE_KEY, serializeGame(game)); return true } catch { return false }
}

// Product rule (Marc, 2026-10-04): a lost run must not clear StudyNote's reward
// threshold. A Catastrophe ending reports 0; the screen keeps the detailed score.
export function reportedScore(outcome) {
  return outcome.grade === 'Catastrophe' ? 0 : outcome.score
}

const sentInDocument = new Set()
export function emitScoreOnce(game, parent, self, storage) {
  if (game.screen !== 'end' || parent === self || sentInDocument.has(game.runId)) return false
  const key = `sgn11:score:${game.runId}`
  try { if (storage().getItem(key) === 'sent') return false } catch { /* storage can be blocked in an iframe */ }
  const score = reportedScore(getOutcome(game.stats, game.history, game.flags, game.themeId))
  // GameEmbed contract has no ACK. Mark before send to prefer at-most-once over
  // retries; the host remains responsible for atomic reward idempotency.
  sentInDocument.add(game.runId)
  try { storage().setItem(key, 'sent') } catch { /* document-level dedup still applies */ }
  parent.postMessage({ type: 'GAME_SCORE', score }, '*')
  return true
}

// Serialize simultaneous completion in tabs sharing this origin when Web Locks
// is available. Server-side rewards still need their own atomic idempotency key.
export function reportScore(game, host) {
  if (game.screen !== 'end') return false
  const send = () => emitScoreOnce(game, host.parent, host, () => host.localStorage)
  return host.navigator?.locks
    ? host.navigator.locks.request(`sgn11-score-${game.runId}`, send).catch(() => false)
    : send()
}
