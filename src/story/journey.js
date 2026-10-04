import { THEMES } from '../gameData.js'
import { createGame, currentScene, choose, advance } from '../gameEngine.js'
import { actIdFor, worldFor, story } from './storyConfig.js'

// Rebuilds the visible route of a run from its replayable actions: one station
// per decision (situation → choice → consequence), plus a prologue and, once the
// run is over, an ending. Connectors are inserted between stations so the
// camera travels continuously through the world instead of cutting between cards.
export function buildJourney(game) {
  const theme = THEMES.find(t => t.id === game.themeId)
  const world = worldFor(game.themeId)
  const stations = [{ key: 'prologue', kind: 'prologue', act: 'seuil', stats: { ...createGame(game.themeId).stats } }]
  let replay = createGame(game.themeId, game.gameMode, game.seed, game.runId)
  let open = null

  const sceneKind = g => g.branchState ? 'branch'
    : theme.scenes[g.stepIndex]?.type === 'random' ? 'event' : 'main'

  const openStation = g => {
    const scene = currentScene(g)
    const kind = sceneKind(g)
    const station = { key: `d${stations.length}-${scene.id}`, kind: 'decision', sceneKind: kind,
      sceneId: scene.id, act: actIdFor(scene.id, kind), title: scene.title || 'Événement',
      text: scene.text, tags: scene.tags || [], branchLabel: g.branchState?.label || null,
      choices: scene.choices.map(c => ({ id: c.id, label: c.label })), chosen: null, result: null,
      statsBefore: g.stats, stats: g.stats }
    stations.push(station)
    return station
  }

  if (replay.screen === 'game') open = openStation(replay)
  for (const action of game.actions) {
    if (action === null) {
      replay = advance(replay)
      open = replay.screen === 'game' ? openStation(replay) : null
    } else {
      replay = choose(replay, action)
      open.chosen = action
      open.result = replay.result
      open.stats = replay.stats
    }
  }
  if (game.screen === 'end') stations.push({ key: 'ending', kind: 'ending', act: 'finale', stats: game.stats })

  // Camera framing cycles through the location's frames, so successive scenes in
  // the same room are seen from a different angle.
  const seen = {}
  for (const station of stations) {
    const location = world.locations[station.act]
    const n = seen[station.act] = (seen[station.act] ?? -1) + 1
    const [x, y, z] = location.frames[n % location.frames.length]
    station.camera = { x, y, z }
    station.location = station.act
  }
  return stations
}

// Flattens stations into the scroll route: station, connector, station…
// A connector between two locations is a "dive" (camera enters the next room);
// inside one location it is a short "pan".
export function buildRoute(stations) {
  const route = []
  stations.forEach((station, index) => {
    if (index > 0) {
      const from = stations[index - 1]
      const kind = from.location === station.location ? 'pan' : 'dive'
      route.push({ key: `c-${from.key}-${station.key}`, kind: 'connector', connector: kind,
        from: from.location, to: station.location, span: story.meta.connectorSpan[kind] })
    }
    route.push(station)
  })
  return route
}
