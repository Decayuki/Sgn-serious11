import story from '../../content/story.json' with { type: 'json' }
import assetManifest from '../../content/assets.json' with { type: 'json' }

export { story }

const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'

// Single replacement point for visuals: content/assets.json maps an asset id to
// a file under public/. Replacing a still means replacing that file only.
export function assetFor(id) {
  const asset = assetManifest.assets[id]
  if (!asset) return { id, src: null, label: '', status: 'missing' }
  return { id, label: asset.label, status: asset.status,
    src: asset.status === 'generated' ? `${base}${asset.src}` : null }
}

export function worldFor(themeId) {
  return story.worlds[themeId] || story.worlds.cafe
}

const actByScene = new Map(story.acts.flatMap(act => act.scenes.map(id => [id, act.id])))

// Main scenes map to their pedagogical act; random events and parallel
// branches share the crisis location of the same world.
export function actIdFor(sceneId, kind = 'main') {
  if (kind !== 'main') return story.fallbackAct
  return actByScene.get(sceneId) || story.fallbackAct
}

export function actById(id) {
  return story.acts.find(act => act.id === id)
}

export const LETTERS = ['A', 'B', 'C', 'D', 'E']
