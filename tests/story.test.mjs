import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { THEMES, getOutcome } from '../src/gameData.js'
import { createGame, currentScene, choose, advance } from '../src/gameEngine.js'
import { emitScoreOnce, reportedScore } from '../src/gameStorage.js'
import { story, assetFor, actIdFor } from '../src/story/storyConfig.js'
import { buildJourney, buildRoute } from '../src/story/journey.js'
import { cameraAt, anchorsFrom, framing } from '../src/story/camera.js'
import { simulate } from '../scripts/simulate.mjs'

const manifest = JSON.parse(fs.readFileSync('content/assets.json', 'utf8'))
const locationIds = story.acts.map(a => a.id)

test('story.json: every world stages the six locations with valid camera data', () => {
  assert.deepEqual(Object.keys(story.worlds).sort(), THEMES.map(t => t.id).sort())
  for (const [id, world] of Object.entries(story.worlds)) {
    assert.ok(['folio', 'caption', 'graphic'].includes(world.ui), id)
    assert.deepEqual(Object.keys(world.locations), locationIds)
    for (const location of Object.values(world.locations)) {
      assert.ok(manifest.assets[location.asset], location.asset)
      assert.ok(['left', 'right', 'bottom', 'center'].includes(location.copyPosition))
      for (const [x, y, z] of location.frames) assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 100 && z >= 1 && z < 1.5)
      assert.ok(location.spots.length >= 4, 'one in-scene marker per possible choice')
      assert.equal(location.exit.length, 2)
    }
  }
})

test('every main scene maps to its act; events and branches stage in the crisis location', () => {
  for (const theme of THEMES) {
    for (const scene of theme.scenes) if (scene.type !== 'random') {
      assert.notEqual(actIdFor(scene.id), 'crise', `${theme.id}/${scene.id} has a pedagogical act`)
    }
    assert.equal(actIdFor('anything', 'event'), 'crise')
    assert.equal(actIdFor(theme.scenes[0].id, 'branch'), 'crise')
  }
})

test('asset dictionary: exact prompt, 3:2 size and weight budget for every scene still', () => {
  for (const [id, asset] of Object.entries(manifest.assets)) {
    assert.ok(asset.prompt.length > 200 && asset.prompt.includes('no text'), id)
    assert.equal(asset.width / asset.height, 1.5)
    assert.ok(asset.targetKB > 0)
    const file = `public/${asset.src}`
    if (asset.status === 'generated') {
      assert.ok(fs.existsSync(file), `${file} exists`)
      assert.ok(fs.statSync(file).size <= asset.targetKB * 1024, `${file} within budget`)
      assert.equal(assetFor(id).src, `/${asset.src}`)
    } else {
      assert.equal(assetFor(id).src, null, 'non-generated assets render the procedural fallback')
    }
  }
  assert.equal(assetFor('nope/nope').status, 'missing')
})

test('journey replays the run: one station per decision, in order, with its consequence', () => {
  for (const theme of THEMES) for (const seed of [1, 42, 777]) {
    const end = simulate(theme.id, seed, 'challenge')
    const stations = buildJourney(end)
    const decisions = stations.filter(s => s.kind === 'decision')
    assert.equal(stations[0].kind, 'prologue')
    assert.equal(stations.at(-1).kind, 'ending')
    assert.deepEqual(decisions.map(s => `${s.sceneId}:${s.chosen}`), end.history.map(h => `${h.stepId}:${h.choiceId}`))
    assert.ok(decisions.every(s => s.result && s.choices.some(c => c.id === s.chosen)))
    assert.ok(decisions.some(s => s.sceneKind === 'branch') && decisions.some(s => s.sceneKind === 'event'))
    assert.deepEqual(decisions.at(-1).stats, end.stats)
    const route = buildRoute(stations)
    assert.equal(route.length, stations.length * 2 - 1)
    route.forEach((item, i) => {
      if (i % 2 === 0) return assert.notEqual(item.kind, 'connector')
      assert.equal(item.connector, route[i - 1].location === route[i + 1].location ? 'pan' : 'dive')
    })
  }
})

test('journey mid-run: the live station is open, then resolved, then followed', () => {
  let game = createGame('cafe', 'classic', 9, 'mid')
  let stations = buildJourney(game)
  assert.equal(stations.length, 2)
  assert.equal(stations[1].chosen, null)
  assert.deepEqual(stations[1].choices.map(c => c.id), currentScene(game).choices.map(c => c.id))
  game = choose(game, stations[1].choices[0].id)
  stations = buildJourney(game)
  assert.equal(stations[1].chosen, stations[1].choices[0].id)
  assert.equal(stations[1].result.title, game.result.title)
  game = advance(game)
  assert.equal(buildJourney(game).length, 3)
})

const locations = story.worlds.cafe.locations
const anchors = anchorsFrom([
  { key: 'a', location: 'seuil', x: 40, y: 50, z: 1.04, top: 0, height: 1600 },
  { key: 'b', location: 'seuil', x: 30, y: 40, z: 1.16, top: 2000, height: 1600 },
  { key: 'c', location: 'salle', x: 62, y: 48, z: 1.04, top: 4400, height: 1600 },
], 800)

test('camera: holds, pans inside a location and dives into the next one', () => {
  const hold = cameraAt(anchors, 900, locations)
  assert.equal(hold.seuil.opacity, 1)
  assert.equal(hold.seuil.x, 40)
  assert.equal(hold.salle.opacity, 0)
  const pan = cameraAt(anchors, (anchors[0].end + anchors[1].start) / 2, locations)
  assert.ok(pan.seuil.x < 40 && pan.seuil.x > 30, 'pan interpolates the framing')
  const dive = cameraAt(anchors, (anchors[1].end + anchors[2].start) / 2, locations)
  assert.ok(Math.abs(dive.seuil.opacity + dive.salle.opacity - 1) < 1e-9, 'crossfade between rooms')
  assert.ok(dive.seuil.z > 1.3, 'camera pushes through the exit point')
  const arrived = cameraAt(anchors, anchors[2].start + 1, locations)
  assert.equal(arrived.salle.opacity, 1)
  assert.equal(arrived.seuil.opacity, 0)
})

test('camera, reduced motion: still framings, no zoom, opacity-only dissolve', () => {
  for (let focus = 0; focus < 6000; focus += 37) {
    const shots = cameraAt(anchors, focus, locations, { reduced: true })
    for (const shot of Object.values(shots)) {
      assert.equal(shot.z, 1)
      if (shot.opacity > 0) assert.ok([40, 30, 62].includes(shot.x), 'framing snaps, never pans')
    }
  }
})

test('framing never reveals an image edge on desktop 1280 or mobile 375', () => {
  for (const [vw, vh] of [[1280, 800], [375, 812], [1920, 900]]) {
    for (const shot of [{ x: 0, y: 0, z: 1 }, { x: 100, y: 100, z: 1.75 }, { x: 62, y: 48, z: 1.04 }]) {
      const f = framing(shot, vw, vh)
      assert.ok(f.tx <= 0 && f.ty <= 0)
      assert.ok(f.tx + f.baseW * f.z >= vw - 0.01 && f.ty + f.baseH * f.z >= vh - 0.01)
    }
  }
})

test('a Catastrophe ending reports GAME_SCORE 0 while the screen keeps the detailed score', () => {
  let game = createGame('cafe', 'classic', 3, 'catastrophe-run')
  while (game.screen !== 'end') {
    if (game.result) { game = advance(game); continue }
    const scene = currentScene(game)
    game = choose(game, (scene.choices.find(c => c.flags?.includes('illegal')) || scene.choices.find(c => c.bad) || scene.choices[0]).id)
  }
  const outcome = getOutcome(game.stats, game.history, game.flags, game.themeId)
  assert.equal(outcome.grade, 'Catastrophe')
  assert.ok(outcome.score > 0, 'detailed score stays visible')
  assert.equal(reportedScore(outcome), 0)
  assert.equal(reportedScore({ grade: 'Échec dur', score: 48 }), 48)
  const messages = []
  const values = new Map()
  emitScoreOnce(game, { postMessage: (...args) => messages.push(args) }, {}, () => ({ getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) }))
  assert.deepEqual(messages, [[{ type: 'GAME_SCORE', score: 0 }, '*']])
})
