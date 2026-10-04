// Generates the scene stills declared in content/assets.json with the GPT image
// capability exposed by the Codex CLI (image_generation tool, ChatGPT auth).
// Usage: node scripts/generate-assets.mjs [--only cafe/seuil,boxing/ring] [--force] [--jobs 4]
// Each still lands at public/<src>; the code never changes when a visual is replaced.
import { spawn, execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const manifestPath = 'content/assets.json'
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
const arg = name => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : null }
const only = arg('--only')?.split(',')
const force = process.argv.includes('--force')
const jobs = Number(arg('--jobs') || 4)

const todo = Object.entries(manifest.assets).filter(([id, asset]) =>
  (only ? only.includes(id) : true) && (force || asset.status !== 'generated'))

function generate(id, asset) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sgn11-img-'))
  const instruction = `Use your image generation tool to create exactly ONE landscape image (3:2, 1536x1024) from this prompt, without adding anything else:\n\n${asset.prompt}\n\nSave the generated file in the current directory as still.png (copy it from wherever the tool stores it). Do not create other files. Print only the final path.`
  return new Promise(resolve => {
    const child = spawn('codex', ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', instruction], { cwd: dir, stdio: ['ignore', 'ignore', 'ignore'] })
    const timer = setTimeout(() => child.kill('SIGTERM'), 8 * 60_000)
    child.on('exit', () => {
      clearTimeout(timer)
      const png = path.join(dir, 'still.png')
      if (!fs.existsSync(png)) return resolve({ id, ok: false })
      const out = path.join('public', asset.src)
      fs.mkdirSync(path.dirname(out), { recursive: true })
      // Step the quality down until the still meets its weight budget.
      for (const q of [80, 72, 64, 56]) {
        execFileSync('cwebp', ['-quiet', '-q', String(q), '-resize', String(asset.width), String(asset.height), png, '-o', out])
        if (fs.statSync(out).size <= asset.targetKB * 1024) break
      }
      resolve({ id, ok: true, kb: Math.round(fs.statSync(out).size / 1024) })
    })
  })
}

const queue = [...todo]
const results = []
await Promise.all(Array.from({ length: Math.min(jobs, queue.length) }, async () => {
  while (queue.length) {
    const [id, asset] = queue.shift()
    const result = await generate(id, asset)
    results.push(result)
    console.log(result.ok ? `ok   ${id} ${result.kb} KB` : `FAIL ${id}`)
    if (result.ok) {
      const fresh = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
      Object.assign(fresh.assets[id], { status: 'generated', bytesKB: result.kb, generatedAt: new Date().toISOString().slice(0, 10) })
      fs.writeFileSync(manifestPath, JSON.stringify(fresh, null, 2) + '\n')
    }
  }
}))
if (results.some(r => !r.ok)) process.exitCode = 1
