import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { THEMES } from '../src/gameData.js'
import { createGame } from '../src/gameEngine.js'
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
let browser
const results = []
try {
  browser = process.env.SGN_QA_CDP ? await chromium.connectOverCDP(process.env.SGN_QA_CDP) : await chromium.launch()
  for (const width of [1280, 375]) {
    const context = await browser.newContext({ viewport: { width, height: 812 }, reducedMotion: 'reduce' })
    for (const theme of THEMES) {
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', err => errors.push(err.message))
      await page.goto(`http://127.0.0.1:${server.address().port}`)
      const iframe = page.frameLocator('iframe')
      await iframe.locator('[data-theme="cafe"]').waitFor()
      const frame = page.frames().find(f => f !== page.mainFrame())
      await frame.evaluate(({ key, save }) => localStorage.setItem(key, save), {
        key: SAVE_KEY, save: serializeGame(createGame(theme.id, 'challenge', 42, `browser-${width}-${theme.id}`)) })
      await frame.goto(gameUrl)
      await iframe.getByRole('button', { name: 'Reprendre la partie', exact: true }).click()
      let restored = false
      for (const action of simulate(theme.id, 42, 'challenge').actions) {
        if (action === null) await iframe.getByRole('button', { name: 'Continuer', exact: true }).click()
        else await iframe.locator(`[data-choice="${action}"]`).click()
        const state = await frame.evaluate(() => JSON.parse(window.render_game_to_text()))
        assert.ok(await frame.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No horizontal overflow')
        if (state.branch && state.result && !restored) {
          await iframe.locator('.result').scrollIntoViewIfNeeded()
          await page.screenshot({ path: `${artifactDir}/${width}-${theme.id}-branch.png` })
          await frame.goto(gameUrl)
          await iframe.getByRole('button', { name: 'Reprendre la partie', exact: true }).click()
          assert.deepEqual(await frame.evaluate(() => JSON.parse(window.render_game_to_text())), state)
          restored = true
        }
      }
      await iframe.locator('.ending-card').scrollIntoViewIfNeeded()
      await page.screenshot({ path: `${artifactDir}/${width}-${theme.id}-end.png` })
      const scores = await page.evaluate(() => window.scores)
      assert.equal(scores.length, 1)
      assert.ok(scores[0].score >= 70)
      await frame.goto(gameUrl)
      await iframe.getByRole('button', { name: 'Revoir le bilan', exact: true }).click()
      assert.equal((await page.evaluate(() => window.scores)).length, 1)
      assert.deepEqual(errors, [])
      results.push({ width, theme: theme.id, score: scores[0].score, errors: 0, restored })
      await page.close()
    }
    await context.close()
  }
  await fs.writeFile(`${artifactDir}/results.json`, JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} finally {
  if (browser && !process.env.SGN_QA_CDP) await browser.close()
  server.close()
}
