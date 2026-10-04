import { useEffect, useState } from 'react'
import { anchorsFrom, cameraAt, framing } from './camera.js'

export function prefersReducedMotion() {
  try { return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) } catch { return false }
}

// Drives the fixed stage from page progress. Stations are measured once per
// layout change; each scroll frame only computes the camera and writes styles.
export function useScrollCamera(stageRef, trackRef, locations, layoutKey) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const reduced = prefersReducedMotion()
    stage.dataset.motion = reduced ? 'reduced' : 'full'
    let anchors = []
    let queued = false
    let lastActive = null

    const measure = () => {
      const sections = [...(trackRef.current?.querySelectorAll('[data-anchor]') || [])]
      anchors = anchorsFrom(sections.map(el => ({
        key: el.dataset.anchor, location: el.dataset.location,
        x: Number(el.dataset.x), y: Number(el.dataset.y), z: Number(el.dataset.z),
        top: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight,
      })), window.innerHeight)
    }

    const read = () => {
      queued = false
      const focus = window.scrollY + window.innerHeight / 2
      const shots = cameraAt(anchors, focus, locations, { reduced })
      for (const layer of stage.querySelectorAll('[data-layer]')) {
        const shot = shots[layer.dataset.layer]
        if (!shot) continue
        layer.style.opacity = shot.opacity.toFixed(3)
        layer.style.visibility = shot.opacity > 0.001 ? 'visible' : 'hidden'
        if (shot.opacity <= 0.001) continue
        const f = framing(shot, window.innerWidth, window.innerHeight)
        layer.style.setProperty('--base-w', `${f.baseW.toFixed(1)}px`)
        layer.style.setProperty('--base-h', `${f.baseH.toFixed(1)}px`)
        layer.firstElementChild.style.transform = `translate3d(${f.tx.toFixed(1)}px, ${f.ty.toFixed(1)}px, 0) scale(${f.z.toFixed(4)})`
      }
      const current = anchors.reduce((found, a) => (a.top <= focus ? a : found), anchors[0])
      if (current && current.key !== lastActive) {
        lastActive = current.key
        setActive(current.key)
      }
    }
    const schedule = () => {
      if (queued) return
      queued = true
      if (window.requestAnimationFrame) window.requestAnimationFrame(read)
      else read()
    }
    const relayout = () => { measure(); schedule() }

    relayout()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(relayout) : null
    if (trackRef.current) observer?.observe(trackRef.current)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', relayout)
    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', relayout)
    }
  }, [stageRef, trackRef, locations, layoutKey])

  return active
}
