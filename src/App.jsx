import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import { STAT_META, THEMES, LEXICON, OBJECTIVES, GAME_MODES, ROASTS, getOutcome } from './gameData.js'
import { createGame, currentScene, choose, advance } from './gameEngine.js'
import { loadGame, saveGame, reportScore } from './gameStorage.js'
import { story, worldFor, actById, assetFor } from './story/storyConfig.js'
import { buildJourney, buildRoute } from './story/journey.js'
import { buildNewsFlash, alertsFor } from './story/newsflash.js'
import { useScrollCamera, prefersReducedMotion } from './story/useScrollCamera.js'
import { Stage } from './story/Stage.jsx'
import { PrologueStation, DecisionStation, Connector, EndingStation, ObjectiveList } from './story/Stations.jsx'

const SHORT_LABELS = { perceived: 'Perçue', valueAdded: 'VA', stakeholder: 'Partenar.', shareholder: 'Action.', cash: 'Tréso' }

function Gauge({ id, meta, value, delta }) {
  return (
    <div className={`gauge gauge--${meta.tone}${value <= 20 ? ' is-low' : ''}`} title={meta.help}>
      <span className="gauge__label"><span className="long">{meta.label}</span><span className="short" aria-hidden="true">{SHORT_LABELS[id]}</span></span>
      <span className="gauge__value">
        <strong>{value}</strong>
        {typeof delta === 'number' && delta !== 0 && (
          <span className={`delta ${delta > 0 ? 'pos' : 'neg'}`}>{delta > 0 ? `+${delta}` : delta}</span>
        )}
      </span>
      <span className="gauge__track"><span style={{ transform: `scaleX(${value / 100})` }} /></span>
    </div>
  )
}

function worldStyle(world) {
  const { palette, fonts } = world
  return { '--night': palette.night, '--ink': palette.ink, '--muted': palette.muted, '--accent': palette.accent,
    '--accent-2': palette.accent2, '--danger': palette.danger, '--font-display': fonts.display, '--font-body': fonts.body }
}

function scrollToTop() {
  document.documentElement.scrollTop = 0
}

function scrollToElement(el, block, smooth) {
  if (!el) return
  if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block })
}

function App() {
  const [saved, setSaved] = useState(() => loadGame(() => localStorage))
  const [game, setGame] = useState(() => ({ ...createGame(), screen: 'home' }))
  const [gameMode, setGameMode] = useState('classic')
  const [news, setNews] = useState(null)
  const [newsAt, setNewsAt] = useState(-10)
  const [helpOpen, setHelpOpen] = useState(false)
  const [notebookOpen, setNotebookOpen] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const [focusChoice, setFocusChoice] = useState(null)
  const [homeWorld, setHomeWorld] = useState('cafe')
  const stageRef = useRef(null)
  const trackRef = useRef(null)
  const scrollIntent = useRef(null)

  const { screen, themeId, stepIndex, stats, history, result, flags, branchState, branchQueue, usedBranchIds } = game
  const theme = THEMES.find(item => item.id === themeId)
  const playing = screen !== 'home'
  const world = worldFor(playing ? themeId : homeWorld)
  const scene = currentScene(game)
  const objectives = gameMode === 'challenge' ? OBJECTIVES[themeId] : null
  const ending = useMemo(() => screen === 'end' ? getOutcome(stats, history, flags, themeId) : null,
    [screen, stats, history, flags, themeId])
  const stations = useMemo(() => playing ? buildJourney(game) : [], [game, playing])
  const route = useMemo(() => buildRoute(stations), [stations])
  const live = stations.findLast(s => s.kind === 'decision')
  const liveKey = screen === 'game' ? live?.key : null
  const alerts = screen === 'game' ? alertsFor(stats) : []
  const roast = ROASTS[history.length % ROASTS.length]
  const mainCount = theme.scenes.length

  const activeKey = useScrollCamera(stageRef, trackRef, world.locations, `${themeId}:${route.length}:${screen}:${Boolean(result)}`)
  const activeStation = stations.find(s => s.key === activeKey) || stations[stations.length - 1]
  const activeAct = activeStation ? actById(activeStation.act) : null

  useEffect(() => {
    if (screen === 'end') void reportScore(game, window)
  }, [game, screen])

  // Follow the run: after a choice reveal its consequence, after "Continuer"
  // travel to the next station (the connector between them is the camera move).
  useLayoutEffect(() => {
    const intent = scrollIntent.current
    scrollIntent.current = null
    if (!intent) return
    const smooth = intent !== 'jump' && !prefersReducedMotion()
    if (intent === 'home') { scrollToTop(); return }
    const target = screen === 'end' ? document.getElementById('ending') : document.getElementById(liveKey)
    if (intent === 'result') scrollToElement(target?.querySelector('.consequence'), 'center', smooth)
    else scrollToElement(target, 'start', smooth)
  }, [game, screen, liveKey])

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      screen, themeId, mode: gameMode, stats, stepIndex,
      scene: scene?.id, branch: branchState?.id,
      choices: result ? [] : scene?.choices.map(c => ({ id: c.id, label: c.label })),
      result, ending, saved: Boolean(saved), stations: route.length,
      coordinates: 'Scroll-driven story: fixed stage, one section per decision',
    })
    // Turn-based game: elapsed time never changes a decision or a random draw.
    window.advanceTime = () => Promise.resolve()
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [screen, themeId, gameMode, stats, stepIndex, scene, branchState, result, ending, saved, route.length])

  function commitGame(next, intent) {
    scrollIntent.current = intent
    setGame(next)
    setSaved(next)
    setSaveFailed(!saveGame(next, () => localStorage))
  }

  function startTheme(id) {
    commitGame(createGame(id, gameMode, crypto.getRandomValues(new Uint32Array(1))[0], crypto.randomUUID()), 'home')
    setNews(null)
    setNewsAt(-10)
    setHelpOpen(false)
  }

  function resumeGame() {
    if (!saved) return
    scrollIntent.current = 'jump'
    setGame(saved)
    setGameMode(saved.gameMode)
    setNews(null)
    setNewsAt(-10)
  }

  function goHome() {
    scrollIntent.current = 'home'
    setNotebookOpen(false)
    setGame({ ...game, screen: 'home' })
  }

  function handleChoice(choiceId) {
    const choice = scene?.choices.find(c => c.id === choiceId)
    const next = choose(game, choiceId)
    if (next === game) return
    const flash = buildNewsFlash({ effects: next.result.effects, choice, prevStats: stats, nextStats: next.stats,
      stepNumber: history.length, lastNewsAt: newsAt })
    setNews(flash)
    if (flash) setNewsAt(history.length)
    setFocusChoice(null)
    commitGame(next, 'result')
  }

  function handleContinue() {
    const next = advance(game)
    if (next === game) return
    setNews(null)
    commitGame(next, 'station')
  }

  return (
    <div className={`app app--${playing ? 'story' : 'home'}${alerts.length ? ' has-alerts' : ''}`} data-world={playing ? themeId : homeWorld}
      data-ui={world.ui} style={worldStyle(world)}>
      <Stage ref={stageRef} themeId={playing ? themeId : homeWorld} world={world}
        spotsAt={liveKey && !result && activeKey === liveKey ? live.location : null}
        spots={liveKey && !result ? live.choices.map(c => c.id) : null}
        focusChoice={focusChoice} grade={ending?.grade} />

      <header className="topbar">
        <div className="brand">
          <span className="brand__kicker">{story.meta.kicker}</span>
          <strong>{playing ? theme.name.split(':').pop().trim() : story.meta.title}</strong>
          {playing && activeAct && <span className="brand__act">{activeAct.eyebrow} · {world.locations[activeStation.location].label}</span>}
        </div>
        {playing && (
          <div className="progress" aria-label={`Étape ${Math.min(stepIndex + 1, mainCount)} sur ${mainCount}`}>
            {theme.scenes.map((s, i) => (
              <i key={`${s.id}-${i}`} className={i < stepIndex || screen === 'end' ? 'done' : i === stepIndex ? 'now' : ''} />
            ))}
          </div>
        )}
        <div className="topbar-actions">
          {screen === 'game' && <button type="button" className="ghost small" onClick={goHome}>Pause / thèmes</button>}
          {playing && <button type="button" className="ghost small" onClick={() => setNotebookOpen(o => !o)} aria-expanded={notebookOpen}>Carnet</button>}
          <button type="button" className="ghost small" onClick={() => setHelpOpen(prev => !prev)}>Lexique</button>
        </div>
        {playing && (
          <div className="gauges">
            {Object.entries(STAT_META).map(([key, meta]) => (
              <Gauge key={key} id={key} meta={meta} value={stats[key]} delta={result?.effects?.[key]} />
            ))}
          </div>
        )}
      </header>

      {saveFailed && <p className="storage-warning" role="status">Sauvegarde locale indisponible. Garde cet onglet ouvert pour conserver ta partie.</p>}
      {alerts.length > 0 && (
        <div className="alert-strip">
          <strong>Alertes terrain</strong>
          <ul>{alerts.map(alert => <li key={alert}>{alert}</li>)}</ul>
        </div>
      )}

      {screen === 'home' && (
        <main className="home">
          <section className="home__hero">
            <p className="copy__index">{story.meta.kicker}</p>
            <h1>{story.meta.subtitle}</h1>
            <p className="home__lede">{story.meta.description}</p>
            {saved && (
              <div className="resume-card">
                <div>
                  <strong>{saved.screen === 'end' ? 'Bilan enregistré' : 'Partie en cours'}</strong>
                  <p>{THEMES.find(t => t.id === saved.themeId)?.name} · {saved.history.length} décisions</p>
                  <small>Sur cet appareil. Commencer un autre scénario remplace cette sauvegarde.</small>
                </div>
                <button type="button" className="primary" onClick={resumeGame}>
                  {saved.screen === 'end' ? 'Revoir le bilan' : 'Reprendre la partie'}
                </button>
              </div>
            )}
            <div className="mode-select" role="group" aria-label="Mode de jeu">
              {GAME_MODES.map(mode => (
                <button key={mode.id} type="button" className={`mode-option${gameMode === mode.id ? ' active' : ''}`}
                  aria-pressed={gameMode === mode.id} onClick={() => setGameMode(mode.id)}>
                  <strong>{mode.label}</strong>
                  <span>{mode.description}</span>
                </button>
              ))}
            </div>
            <ul className="rules">
              <li>Défile : la caméra traverse le lieu. Chaque décision se prend dans le décor.</li>
              <li>Tout le monde veut sa part : salariés, État, actionnaires.</li>
              <li>Certains choix ouvrent une voie parallèle à gérer.</li>
              <li>Chaque étape principale rapporte des recettes selon la qualité, la richesse créée et les relations. Les crises ne rapportent rien de plus.</li>
            </ul>
          </section>

          <section className="portals" aria-label="Choisis ton univers">
            {THEMES.map(item => {
              const still = assetFor(worldFor(item.id).locations.seuil.asset)
              return (
                <article key={item.id} className={`portal${item.id === 'cafe' ? ' portal--pilot' : ''}`} data-world={item.id}
                  style={worldStyle(worldFor(item.id))}
                  onPointerEnter={() => setHomeWorld(item.id)} onFocus={() => setHomeWorld(item.id)}>
                  <div className="portal__media" aria-hidden="true">
                    {still.src && <img src={still.src} alt="" loading="lazy" decoding="async" onError={e => { e.currentTarget.hidden = true }} />}
                  </div>
                  <div className="portal__body">
                    <p className="status">{item.id === 'cafe' ? 'Démo pilote' : item.status}</p>
                    <h3>{item.name}</h3>
                    <p className="theme-subtitle">{item.subtitle}</p>
                    <p className="theme-description">{worldFor(item.id).tagline}</p>
                    <button type="button" className="primary" data-theme={item.id} onClick={() => startTheme(item.id)}
                      disabled={item.locked}>
                      {item.locked ? 'Bientôt' : 'Jouer'}
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
          <p className="home__note">{story.meta.note}</p>
        </main>
      )}

      {playing && (
        <main className="track" ref={trackRef}>
          {route.map((item, index) => {
            if (item.kind === 'connector') return <Connector key={item.key} connector={item} world={world} />
            if (item.kind === 'prologue') return <PrologueStation key={item.key} station={item} world={world} theme={theme} mode={gameMode} />
            if (item.kind === 'ending') {
              return ending && <EndingStation key={item.key} station={item} world={world} ending={ending} game={game}
                objectives={objectives} roast={roast} onReplay={() => startTheme(themeId)} onHome={goHome} />
            }
            return (
              <DecisionStation key={item.key} station={item} world={world}
                number={route.slice(0, index).filter(r => r.kind === 'decision').length + 1}
                live={item.key === liveKey} news={news} onChoose={handleChoice} onContinue={handleContinue}
                onFocusChoice={setFocusChoice} />
            )
          })}
          <div className="track__end" aria-hidden="true" />
        </main>
      )}

      {notebookOpen && playing && <div className="drawer-overlay" onClick={() => setNotebookOpen(false)} />}
      {playing && (
        <aside className={`drawer notebook${notebookOpen ? ' open' : ''}`} inert={!notebookOpen} aria-label="Carnet de bord">
          <div className="drawer__header">
            <h3>Carnet de bord</h3>
            <button type="button" className="ghost small" onClick={() => setNotebookOpen(false)}>Fermer le carnet</button>
          </div>
          <p>{theme.intro}</p>
          {branchQueue.length > 0 && (
            <div className="sidebar-alerts">
              <h4>Voies en attente</h4>
              <ul>{branchQueue.map((id, i) => <li key={`${id}-${i}`}>{theme.branches[id]?.label || id}</li>)}</ul>
            </div>
          )}
          {objectives && (
            <div className="objectives-panel">
              <h4>Défis en cours</h4>
              {[['Objectifs principaux', objectives.primary], ['Objectifs secondaires', objectives.secondary]].map(([title, items]) => (
                <div key={title} className="objective-group">
                  <p className="objective-title">{title}</p>
                  <ObjectiveList items={items || []} stats={stats} flags={flags} usedBranchIds={usedBranchIds} />
                </div>
              ))}
            </div>
          )}
          <div className="sidebar-box">
            <h4>Rappel express</h4>
            <p>Valeur ajoutée = Chiffre d’affaires − consommations intermédiaires.</p>
            <p>Valeur partenariale : équilibre entre salariés, clients, fournisseurs, État et actionnaires.</p>
          </div>
        </aside>
      )}

      {helpOpen && <div className="drawer-overlay" onClick={() => setHelpOpen(false)} />}
      <aside className={`drawer lexicon-panel${helpOpen ? ' open' : ''}`} inert={!helpOpen} aria-label="Lexique">
        <div className="drawer__header">
          <div>
            <p className="copy__index">Aide rapide</p>
            <h3>Lexique du jeu</h3>
          </div>
          <button type="button" className="ghost small" onClick={() => setHelpOpen(false)}>Fermer</button>
        </div>
        <div className="lexicon-content">
          {LEXICON.map(item => (
            <div key={item.term} className="lexicon-item">
              <h4>{item.term}</h4>
              <p>{item.definition}</p>
              <p className="lexicon-example">{item.example}</p>
              <p className="lexicon-context">{item.context}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default App
