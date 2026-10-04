import { forwardRef, useState } from 'react'
import { assetFor, LETTERS } from './storyConfig.js'
import { ThemeIllustration } from './ThemeIllustration.jsx'

// Procedural decor shown under every still and alone when the still is
// missing or failed: palette gradient, v2 vector decor and the place name.
function SceneFallback({ themeId, label }) {
  return (
    <div className="shot__fallback" aria-hidden="true">
      <div className="shot__fallback-art"><ThemeIllustration themeId={themeId} /></div>
      <span>{label}</span>
    </div>
  )
}

function Shot({ themeId, locationId, location, spots, focusChoice }) {
  const asset = assetFor(location.asset)
  const [failed, setFailed] = useState(false)
  const missing = !asset.src || failed
  return (
    <div className={`shot${missing ? ' is-missing' : ''}`} data-layer={locationId}
      data-media={missing ? 'fallback' : 'still'}>
      <div className="shot__camera">
        <SceneFallback themeId={themeId} label={location.label} />
        {asset.src && !failed && (
          <img className="shot__still" src={asset.src} alt="" decoding="async"
            onError={() => setFailed(true)} />
        )}
        {spots && (
          <div className="shot__spots" aria-hidden="true">
            {spots.map((choiceId, i) => {
              const [x, y] = location.spots[i % location.spots.length]
              return (
                <span key={choiceId} className={`spot${focusChoice === choiceId ? ' is-focus' : ''}`}
                  style={{ left: `${x}%`, top: `${y}%` }}>{LETTERS[i]}</span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// One fixed full-viewport stage; every location of the world is a stacked
// layer whose opacity and framing are written by useScrollCamera.
export const Stage = forwardRef(function Stage({ themeId, world, spotsAt, spots, focusChoice, grade }, ref) {
  return (
    <div className="stage" ref={ref} aria-hidden="true" data-grade={grade || undefined}>
      {Object.entries(world.locations).map(([id, location]) => (
        <Shot key={`${themeId}-${id}`} themeId={themeId} locationId={id} location={location}
          spots={spotsAt === id ? spots : null} focusChoice={focusChoice} />
      ))}
      <div className="stage__grain" />
    </div>
  )
})
