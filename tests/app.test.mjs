import test from 'node:test'
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import { createElement, act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { THEMES } from '../src/gameData.js'
import { createGame } from '../src/gameEngine.js'
import { SAVE_KEY, serializeGame } from '../src/gameStorage.js'
import { simulate } from '../scripts/simulate.mjs'

await build({ entryPoints: ['src/App.jsx'], outfile: 'output/app-test.mjs', bundle: true,
  format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty' } })
const { default: App } = await import('../output/app-test.mjs')
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost:5173' })
Object.assign(globalThis, { window: dom.window, document: dom.window.document,
  localStorage: dom.window.localStorage, IS_REACT_ACT_ENVIRONMENT: true })
const messages = []
Object.defineProperty(window, 'parent', { value: { postMessage: (...args) => messages.push(args) } })
let root
async function mount() {
  root = createRoot(document.getElementById('root'))
  await act(async () => root.render(createElement(StrictMode, null, createElement(App))))
}
async function unmount() { await act(async () => root.unmount()) }
async function click(element) {
  assert.ok(element, 'Control exists')
  await act(async () => element.click())
}
function button(text) { return [...document.querySelectorAll('button')].find(b => b.textContent.trim() === text) }
const state = () => JSON.parse(window.render_game_to_text())

for (const theme of THEMES) {
  test(`React UI ${theme.id}: complete, resume feedback, score once, reload, replay`, async () => {
    localStorage.clear()
    messages.length = 0
    localStorage.setItem(SAVE_KEY, serializeGame(createGame(theme.id, 'challenge', 42, `dom-${theme.id}`)))
    await mount()
    assert.equal(state().screen, 'home')
    await click(button('Reprendre la partie'))
    assert.equal(state().mode, 'challenge')
    const reference = simulate(theme.id, 42, 'challenge')
    let restored = false
    for (const action of reference.actions) {
      if (action === null) await click(button('Continuer'))
      else {
        await click(document.querySelector(`[data-choice="${action}"]`))
        assert.ok(document.querySelector('[role="status"]').textContent.includes('Variation nette'))
        assert.equal(messages.length, 0)
        if (state().branch && !restored) {
          const before = state()
          await unmount()
          await mount()
          await click(button('Reprendre la partie'))
          assert.deepEqual(state(), before)
          restored = true
        }
      }
    }
    assert.equal(state().screen, 'end')
    assert.ok(state().ending.score >= 70)
    assert.equal(messages.length, 1, 'StrictMode emits once')
    assert.equal(messages[0][0].score, state().ending.score)
    await unmount()
    await mount()
    await click(button('Revoir le bilan'))
    assert.equal(messages.length, 1, 'Reload does not resend')
    await click(button('Rejouer'))
    assert.equal(state().screen, 'game')
    assert.equal(state().stepIndex, 0)
    assert.equal(JSON.parse(localStorage.getItem(SAVE_KEY)).actions.length, 0)
    assert.equal(messages.length, 1)
    await unmount()
  })
}

test('React UI: invalid save, theme selection, pause and inaccessible storage', async () => {
  localStorage.clear()
  localStorage.setItem(SAVE_KEY, '{bad')
  await mount()
  assert.equal(state().saved, false)
  await click(document.querySelector('[data-theme="cafe"]'))
  await click(button('Lexique'))
  assert.ok(document.querySelector('.lexicon-panel.open'))
  await click(button('Fermer'))
  await click(button('Pause / thèmes'))
  await click(button('Reprendre la partie'))
  assert.equal(state().screen, 'game')
  const storage = globalThis.localStorage
  globalThis.localStorage = { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') } }
  await click(document.querySelector('[data-choice]'))
  assert.ok(document.querySelector('.storage-warning'))
  assert.ok(state().result)
  globalThis.localStorage = storage
  await unmount()
})
