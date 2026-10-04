import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { THEMES, getOutcome } from '../src/gameData.js'
import { createGame, currentScene, choose, advance } from '../src/gameEngine.js'
import { SAVE_KEY, serializeGame } from '../src/gameStorage.js'
import { simulate } from './simulate.mjs'

const gameUrl = process.env.SGN_QA_URL || 'http://127.0.0.1:5173'
const artifactDir = 'output/browser'
await fs.mkdir(artifactDir, { recursive: true })
// Independent parent origin emulates GameEmbed without touching StudyNote.
const server = createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.end(`<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}iframe{width:100vw;height:100dvh;border:0;display:block}</style><iframe src="${gameUrl}"></iframe><script>window.scores=[];addEventListener('message',e=>{if(e.origin===${JSON.stringify(new URL(gameUrl).origin)}&&e.source===document.querySelector('iframe').contentWindow&&e.data?.type==='GAME_SCORE')scores.push(e.data)})</script></html>`)
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const parentUrl = `http://127.0.0.1:${server.address().port}`

// Catastrophe policy: illegal, then bad, then first choice.
function catastropheActions() {
  let game = createGame('cafe', 'classic', 7, 'qa-catastrophe')
  while (game.screen !== 'end') {
    if (game.result) { game = advance(game); continue }
    const scene = currentScene(game)
    game = choose(game, (scene.choices.find(c => c.flags?.includes('illegal')) || scene.choices.find(c => c.bad) || scene.choices[0]).id)
  }
  assert.equal(getOutcome(game.stats, game.history, game.flags, game.themeId).grade, 'Catastrophe')
  return game
}

async function open(context, save) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', err => errors.push(err.message))
  await page.goto(parentUrl)
  const iframe = page.frameLocator('iframe')
  await iframe.locator('[data-theme="cafe"]').waitFor()
  const frame = page.frames().find(f => f !== page.mainFrame())
  await frame.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: SAVE_KEY, value: save })
  await frame.goto(gameUrl)
  await iframe.getByRole('button', { name: 'Reprendre la partie', exact: true }).click()
  return { page, frame, iframe, errors }
}

const state = frame => frame.evaluate(() => JSON.parse(window.render_game_to_text()))
const noOverflow = frame => frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth)

// Plays a recorded action list through the scroll UI. `shots` names moments
// to capture; `settle` waits for smooth scrolling/camera in full-motion runs.
async function play(ctx, actions, { label, shots = false, settle = 0, restoreOnBranch = false }) {
  const { page, frame, iframe } = ctx
  let restored = false
  const seenActs = new Set()
  for (const action of actions) {
    if (action === null) await iframe.getByRole('button', { name: 'Continuer', exact: true }).click()
    else {
      if (shots) {
        const live = iframe.locator('.station.is-live')
        const act = await live.getAttribute('data-location')
        if (!seenActs.has(act)) {
          seenActs.add(act)
          await live.scrollIntoViewIfNeeded()
          await page.waitForTimeout(settle + 150)
          await page.screenshot({ path: `${artifactDir}/${label}-act-${act}.png` })
        }
      }
      await iframe.locator(`[data-choice="${action}"]`).click()
      assert.ok((await iframe.locator('[role="status"]').first().textContent()).includes('Variation nette'))
    }
    if (settle) await page.waitForTimeout(settle)
    assert.ok(await noOverflow(frame), `${label}: no horizontal overflow`)
    const s = await state(frame)
    if (restoreOnBranch && s.branch && s.result && !restored) {
      if (shots) await page.screenshot({ path: `${artifactDir}/${label}-branch-consequence.png` })
      await frame.goto(gameUrl)
      await iframe.getByRole('button', { name: 'Reprendre la partie', exact: true }).click()
      assert.deepEqual(await state(frame), s)
      restored = true
    }
  }
  return restored
}

async function endingShot(ctx, label) {
  await ctx.iframe.locator('.ending-card').scrollIntoViewIfNeeded()
  await ctx.page.waitForTimeout(400)
  await ctx.page.screenshot({ path: `${artifactDir}/${label}-ending.png` })
}

let browser
const results = []
try {
  browser = process.env.SGN_QA_CDP ? await chromium.connectOverCDP(process.env.SGN_QA_CDP) : await chromium.launch()
  for (const width of [1280, 375]) {
    const viewport = { width, height: width < 500 ? 812 : 800 }

    // 1. Six scenarios, start to finish, reduced motion (instant scroll).
    const reduced = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    for (const theme of THEMES) {
      const label = `${width}-${theme.id}`
      const ctx = await open(reduced, serializeGame(createGame(theme.id, 'challenge', 42, `browser-${label}`)))
      if (theme.id === 'cafe') {
        assert.equal(await ctx.frame.evaluate(() => document.querySelector('.stage').dataset.motion), 'reduced')
        await ctx.page.screenshot({ path: `${artifactDir}/${label}-reduced-prologue.png` })
      }
      const restored = await play(ctx, simulate(theme.id, 42, 'challenge').actions, { label: `${label}-reduced`, restoreOnBranch: true, shots: theme.id === 'cafe' })
      if (theme.id === 'cafe') {
        const scales = await ctx.frame.evaluate(() => [...document.querySelectorAll('.shot__camera')].map(el => el.style.transform).filter(Boolean))
        assert.ok(scales.length && scales.every(t => /scale\(1(\.0+)?\)$/.test(t)), 'reduced motion: no zoom')
      }
      await endingShot(ctx, `${label}-reduced`)
      const scores = await ctx.page.evaluate(() => window.scores)
      assert.equal(scores.length, 1)
      assert.ok(scores[0].score >= 70)
      await ctx.frame.goto(gameUrl)
      await ctx.iframe.getByRole('button', { name: 'Revoir le bilan', exact: true }).click()
      assert.equal((await ctx.page.evaluate(() => window.scores)).length, 1, 'review does not resend')
      assert.deepEqual(ctx.errors, [])
      results.push({ width, run: `${theme.id} reduced-motion`, score: scores[0].score, restored, errors: 0 })
      await ctx.page.close()
    }
    await reduced.close()

    // 2. Café pilot in full motion: smooth travel, camera moves, captures.
    const full = await browser.newContext({ viewport, reducedMotion: 'no-preference' })
    {
      const label = `${width}-cafe-motion`
      const ctx = await open(full, serializeGame(createGame('cafe', 'classic', 42, `browser-${label}`)))
      assert.equal(await ctx.frame.evaluate(() => document.querySelector('.stage').dataset.motion), 'full')
      await ctx.page.waitForTimeout(500)
      await ctx.page.screenshot({ path: `${artifactDir}/${label}-prologue.png` })
      await play(ctx, simulate('cafe', 42).actions, { label, shots: true, settle: 700 })
      // Reverse travel: scrolling back up re-frames earlier rooms.
      const dive = await ctx.frame.evaluate(() => {
        const el = document.querySelectorAll('.connector--dive')[1]
        return el.getBoundingClientRect().top + scrollY + el.offsetHeight / 2 - innerHeight / 2
      })
      await ctx.frame.evaluate(y => window.scrollTo(0, y), dive)
      await ctx.page.waitForTimeout(500)
      const visible = await ctx.frame.evaluate(() => [...document.querySelectorAll('.shot')].filter(s => Number(s.style.opacity) > 0.02).length)
      assert.equal(visible, 2, 'mid-connector crossfades two rooms')
      await ctx.page.screenshot({ path: `${artifactDir}/${label}-reverse-dive.png` })
      await endingShot(ctx, label)
      assert.equal((await ctx.page.evaluate(() => window.scores)).length, 1)
      assert.deepEqual(ctx.errors, [])
      results.push({ width, run: 'cafe full-motion', errors: 0 })
      await ctx.page.close()
    }

    // 3. Missing media: every still fails, the procedural decor takes over.
    {
      const label = `${width}-cafe-missing-media`
      await full.route('**/scenes/**', route => route.abort())
      const ctx = await open(full, serializeGame(createGame('cafe', 'classic', 42, `browser-${label}`)))
      await ctx.iframe.locator('.shot[data-media="fallback"]').first().waitFor()
      await ctx.page.waitForTimeout(300)
      assert.equal(await ctx.frame.evaluate(() => document.querySelectorAll('.shot[data-media="still"]').length), 0)
      await ctx.page.screenshot({ path: `${artifactDir}/${label}-prologue.png` })
      await play(ctx, simulate('cafe', 42).actions, { label, shots: true })
      await endingShot(ctx, label)
      assert.equal((await ctx.page.evaluate(() => window.scores)).length, 1)
      assert.deepEqual(ctx.errors, [])
      results.push({ width, run: 'cafe missing-media', errors: 0 })
      await ctx.page.close()
      await full.unroute('**/scenes/**')
    }

    // 4. Catastrophe: detailed score on screen, GAME_SCORE 0 to the host.
    {
      const label = `${width}-cafe-catastrophe`
      const lost = catastropheActions()
      const ctx = await open(full, serializeGame(createGame('cafe', 'classic', 7, `browser-${label}`)))
      await play(ctx, lost.actions, { label })
      const s = await state(ctx.frame)
      assert.equal(s.ending.grade, 'Catastrophe')
      await endingShot(ctx, label)
      assert.deepEqual(await ctx.page.evaluate(() => window.scores), [{ type: 'GAME_SCORE', score: 0 }])
      assert.ok((await ctx.iframe.locator('.score strong').textContent()) === String(s.ending.score))
      assert.deepEqual(ctx.errors, [])
      results.push({ width, run: 'cafe catastrophe', displayed: s.ending.score, sent: 0, errors: 0 })
      await ctx.page.close()
    }
    await full.close()
  }
  await fs.writeFile(`${artifactDir}/results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} finally {
  if (browser && !process.env.SGN_QA_CDP) await browser.close()
  server.close()
}
