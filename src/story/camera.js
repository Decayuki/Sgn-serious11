// Pure camera model for the fixed stage. Each station is a hold range on the
// scroll axis with a camera framing ({x, y} focus in %, z zoom) inside one
// location still. Between two ranges the camera pans (same location) or dives
// through the exit point of the first location into the next one.

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const smooth = v => { const x = clamp(v); return x * x * (3 - 2 * x) }
const lerp = (a, b, t) => a + (b - a) * t

const DRIFT = 0.05
const DIVE_DEPTH = 1.75
const ARRIVAL_ZOOM = 1.4

export function cameraAt(anchors, focus, locations, { reduced = false } = {}) {
  const shots = Object.fromEntries(Object.keys(locations).map(id => [id, { opacity: 0, x: 50, y: 50, z: 1 }]))
  if (!anchors.length) {
    const first = Object.keys(locations)[0]
    if (first) shots[first] = { opacity: 1, x: 50, y: 50, z: 1 }
    return shots
  }
  // Reduced motion: every shot is a still framing of its station (no zoom, no
  // pan); only opacity changes, as a dissolve between posters.
  const set = (id, value, still) => { shots[id] = reduced ? { opacity: value.opacity, x: still.x, y: still.y, z: 1 } : value }

  const holdOf = a => {
    const local = clamp((focus - a.start) / Math.max(1, a.end - a.start))
    return { opacity: 1, x: a.x, y: a.y, z: a.z + DRIFT * local }
  }

  if (focus <= anchors[0].end) { set(anchors[0].location, holdOf(anchors[0]), anchors[0]); return shots }
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i]
    if (focus >= a.start && focus <= a.end) { set(a.location, holdOf(a), a); return shots }
    const b = anchors[i + 1]
    if (!b) { set(a.location, holdOf(a), a); return shots }
    if (focus > a.end && focus < b.start) {
      const t = smooth((focus - a.end) / Math.max(1, b.start - a.end))
      const from = { x: a.x, y: a.y, z: a.z + DRIFT }
      if (a.location === b.location) {
        set(a.location, { opacity: 1, x: lerp(from.x, b.x, t), y: lerp(from.y, b.y, t), z: lerp(from.z, b.z, t) }, t < 0.5 ? a : b)
        return shots
      }
      const exit = locations[a.location]?.exit || [from.x, from.y]
      const fade = smooth((t - 0.35) / 0.3)
      const into = clamp(t / 0.65)
      set(a.location, { opacity: 1 - fade, x: lerp(from.x, exit[0], into), y: lerp(from.y, exit[1], into),
        z: lerp(from.z, from.z * DIVE_DEPTH, into * into) }, a)
      const out = clamp((t - 0.35) / 0.65)
      set(b.location, { opacity: fade, x: b.x, y: b.y, z: lerp(b.z * ARRIVAL_ZOOM, b.z, smooth(out)) }, b)
      return shots
    }
  }
  return shots
}

// Turns measured station boxes into hold ranges centred on the viewport.
export function anchorsFrom(boxes, viewport) {
  return boxes.map(box => {
    const pad = viewport * 0.5
    let start = box.top + Math.min(pad, box.height * 0.25)
    let end = box.top + box.height - Math.min(pad, box.height * 0.25)
    if (end < start) start = end = box.top + box.height / 2
    return { ...box, start, end }
  })
}

// Places a 3:2 still that covers the viewport so the camera focus sits as close
// to the viewport centre as the image edges allow (never revealing an edge).
// On a portrait phone this pans across the wide still instead of squashing it.
export function framing(shot, vw, vh, ratio = 1.5) {
  const baseW = Math.max(vw, vh * ratio)
  const w = baseW * shot.z
  const h = (baseW / ratio) * shot.z
  const tx = clamp(vw / 2 - (shot.x / 100) * w, vw - w, 0)
  const ty = clamp(vh / 2 - (shot.y / 100) * h, vh - h, 0)
  return { baseW, baseH: baseW / ratio, tx, ty, z: shot.z }
}
