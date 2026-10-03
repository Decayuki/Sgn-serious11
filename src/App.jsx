import { useEffect, useMemo, useState } from 'react'
import './App.css'

import { STAT_META, THEMES, LEXICON, OBJECTIVES, GAME_MODES, ROASTS, PROF_COMMENTS, getObjectiveState, getOutcome } from './gameData.js'
import { createGame, currentScene, choose, advance } from './gameEngine.js'
import { loadGame, saveGame, reportScore } from './gameStorage.js'

function StatBar({ label, value, tone, delta, help }) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-label">
        <span className="stat-title">
          {label}
          <span className="stat-info" data-tooltip={help} aria-hidden>
            i
          </span>
        </span>
        <div className="stat-value">
          <strong>{value}</strong>
          {typeof delta === 'number' && delta !== 0 && (
            <span className={`delta ${delta > 0 ? 'pos' : 'neg'}`}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>
      </div>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ThemeIllustration({ themeId }) {
  switch (themeId) {
    case 'cafe':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden="true">
          <rect width="420" height="240" rx="24" fill="#f7e0c1" />
          <circle cx="340" cy="50" r="28" fill="#f4c97a" />
          <rect x="55" y="65" width="310" height="145" rx="12" fill="#7a4a2b" />
          <path d="M45 65h330l-20 35H65Z" fill="#7fe0b3" />
          <rect x="80" y="115" width="140" height="75" rx="8" fill="#fff4e6" />
          <rect x="250" y="115" width="80" height="95" rx="8" fill="#f2b89b" />
          <circle cx="313" cy="160" r="4" fill="#4a2c1d" />
          <path d="M117 142h55v17a24 24 0 0 1-55 0Z" fill="#7a4a2b" />
          <path d="M172 146h8a10 10 0 0 1 0 20h-9M133 135q-10-10 0-19m17 19q-10-10 0-19" fill="none" stroke="#7a4a2b" strokeWidth="5" strokeLinecap="round" />
          <path d="M35 212h350" stroke="#4a2c1d" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    case 'boxing':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="ringBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7e0c1" />
              <stop offset="100%" stopColor="#f1b793" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#ringBg)" />
          <rect x="40" y="70" width="340" height="130" rx="16" fill="#1e1e1e" />
          <rect x="60" y="90" width="300" height="90" rx="12" fill="#f5efe7" />
          <rect x="60" y="110" width="300" height="6" fill="#d65b4a" />
          <rect x="60" y="130" width="300" height="6" fill="#d65b4a" />
          <rect x="60" y="150" width="300" height="6" fill="#d65b4a" />
          <circle cx="150" cy="120" r="26" fill="#d65b4a" />
          <circle cx="270" cy="120" r="26" fill="#d65b4a" />
          <rect x="135" y="140" width="30" height="22" rx="8" fill="#b24336" />
          <rect x="255" y="140" width="30" height="22" rx="8" fill="#b24336" />
          <text x="210" y="60" textAnchor="middle" fontSize="18" fill="#1f1a16" fontFamily="'Bebas Neue', sans-serif">
            BLACK CORNER
          </text>
        </svg>
      )
    case 'football':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="fieldBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dff4d7" />
              <stop offset="100%" stopColor="#a9d88f" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#fieldBg)" />
          <rect x="40" y="60" width="340" height="140" rx="16" fill="#2f7d32" />
          <rect x="60" y="80" width="300" height="100" rx="12" fill="#3fa44a" />
          <rect x="200" y="80" width="2" height="100" fill="#e7f6e5" />
          <circle cx="200" cy="130" r="20" fill="none" stroke="#e7f6e5" strokeWidth="2" />
          <rect x="70" y="110" width="24" height="40" fill="none" stroke="#e7f6e5" strokeWidth="2" />
          <rect x="326" y="110" width="24" height="40" fill="none" stroke="#e7f6e5" strokeWidth="2" />
          <circle cx="320" cy="180" r="16" fill="#f2f2f2" />
          <circle cx="320" cy="180" r="6" fill="#2f7d32" />
          <text x="210" y="52" textAnchor="middle" fontSize="18" fill="#1f1a16" fontFamily="'Bebas Neue', sans-serif">
            ATLAS FC
          </text>
        </svg>
      )
    case 'cosmetic':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="cosmoBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fce4ec" />
              <stop offset="100%" stopColor="#f8c9da" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#cosmoBg)" />
          <rect x="70" y="80" width="90" height="100" rx="18" fill="#ffffff" />
          <rect x="90" y="60" width="50" height="30" rx="12" fill="#f2b7c8" />
          <rect x="190" y="70" width="70" height="110" rx="16" fill="#fff8fb" />
          <rect x="205" y="50" width="40" height="24" rx="8" fill="#f09fb6" />
          <rect x="280" y="90" width="70" height="90" rx="20" fill="#ffffff" />
          <rect x="295" y="70" width="40" height="26" rx="10" fill="#f2b7c8" />
          <circle cx="320" cy="170" r="18" fill="#f5b0c5" />
          <text x="210" y="46" textAnchor="middle" fontSize="18" fill="#5a2b3a" fontFamily="'Bebas Neue', sans-serif">
            AURA SKIN
          </text>
        </svg>
      )
    case 'fashion':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="fashionBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3e7ff" />
              <stop offset="100%" stopColor="#d7c3f7" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#fashionBg)" />
          <rect x="170" y="70" width="80" height="120" rx="30" fill="#f5f1ff" />
          <rect x="185" y="50" width="50" height="30" rx="12" fill="#c4a8f2" />
          <rect x="90" y="110" width="50" height="90" rx="18" fill="#b18be6" />
          <rect x="280" y="110" width="60" height="90" rx="18" fill="#b18be6" />
          <path d="M90 90 L130 90 L150 110" stroke="#5d3c88" strokeWidth="4" fill="none" />
          <path d="M330 90 L290 90 L270 110" stroke="#5d3c88" strokeWidth="4" fill="none" />
          <text x="210" y="46" textAnchor="middle" fontSize="18" fill="#3c2b52" fontFamily="'Bebas Neue', sans-serif">
            ATELIER VELVET
          </text>
        </svg>
      )
    case 'art':
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="mediaBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dff1ff" />
              <stop offset="100%" stopColor="#b8dcff" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#mediaBg)" />
          <rect x="80" y="70" width="200" height="120" rx="18" fill="#1f2a44" />
          <rect x="100" y="90" width="160" height="80" rx="10" fill="#32466d" />
          <polygon points="165,105 200,130 165,155" fill="#f1f6ff" />
          <rect x="290" y="90" width="40" height="80" rx="12" fill="#1f2a44" />
          <circle cx="310" cy="80" r="18" fill="#f4b86a" />
          <text x="210" y="46" textAnchor="middle" fontSize="18" fill="#1f2a44" fontFamily="'Bebas Neue', sans-serif">
            PULSE LAB
          </text>
        </svg>
      )
    default:
      return (
        <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
          <defs>
            <linearGradient id="cafeSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f7d9b2" />
              <stop offset="100%" stopColor="#f2b89b" />
            </linearGradient>
            <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d7f0ff" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="420" height="240" rx="24" fill="url(#cafeSky)" />
          <rect x="40" y="60" width="340" height="150" rx="20" fill="#39281d" />
          <rect x="55" y="78" width="310" height="110" rx="16" fill="#f5efe7" />
          <rect x="70" y="90" width="120" height="85" rx="10" fill="url(#glass)" />
          <rect x="205" y="90" width="140" height="85" rx="10" fill="url(#glass)" />
          <rect x="55" y="160" width="310" height="20" rx="8" fill="#c8965c" />
          <rect x="150" y="40" width="120" height="35" rx="10" fill="#111" />
          <text x="210" y="64" textAnchor="middle" fontSize="18" fill="#f8d8a8" fontFamily="'Bebas Neue', sans-serif">
            STARBUCK
          </text>
          <circle cx="90" cy="200" r="18" fill="#b36b3c" />
          <circle cx="330" cy="200" r="18" fill="#b36b3c" />
          <rect x="85" y="190" width="10" height="25" rx="5" fill="#6b3c1e" />
          <rect x="325" y="190" width="10" height="25" rx="5" fill="#6b3c1e" />
        </svg>
      )
  }
}

function App() {
  const [saved, setSaved] = useState(() => loadGame(() => localStorage))
  const [game, setGame] = useState(() => ({ ...createGame(), screen: 'home' }))
  const [gameMode, setGameMode] = useState('classic')
  const [lastNews, setLastNews] = useState(null)
  const [lastNewsAt, setLastNewsAt] = useState(-10)
  const [helpOpen, setHelpOpen] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)
  const { screen, themeId, stepIndex, stats, history, result, flags, branchState,
    branchQueue, usedBranchIds } = game
  const theme = THEMES.find(item => item.id === themeId)
  const stepToRender = currentScene(game)
  const lastEffects = result?.effects
  const objectives = gameMode === 'challenge' ? OBJECTIVES[themeId] : null
  const ending = useMemo(
    () => screen === 'end' ? getOutcome(stats, history, flags, themeId) : null,
    [screen, stats, history, flags, themeId]
  )
  const worstChoices = history.filter(item => item.bad).slice(0, 3)
  const roast = ROASTS[history.length % ROASTS.length]
  const pendingBranches = branchQueue.map(id => theme.branches[id]?.label || id)
  const alerts = getAlerts()
  const objectiveGroups = objectives ? [
    { title: 'Objectifs principaux', items: objectives.primary || [] },
    { title: 'Objectifs secondaires', items: objectives.secondary || [] },
  ] : []

  useEffect(() => {
    if (screen === 'end') void reportScore(game, window)
  }, [game, screen])

  useEffect(() => {
    window.render_game_to_text = () => JSON.stringify({
      screen, themeId, mode: gameMode, stats, stepIndex,
      scene: stepToRender?.id, branch: branchState?.id,
      choices: result ? [] : stepToRender?.choices.map(c => ({ id: c.id, label: c.label })),
      result, ending, saved: Boolean(saved),
      coordinates: 'React DOM; no spatial game coordinates',
    })
    // Turn-based game: elapsed time never changes a decision or a random draw.
    window.advanceTime = () => Promise.resolve()
    return () => { delete window.render_game_to_text; delete window.advanceTime }
  }, [screen, themeId, gameMode, stats, stepIndex, stepToRender, branchState, result, ending, saved])

  function commitGame(next) {
    setGame(next)
    setSaved(next)
    setSaveFailed(!saveGame(next, () => localStorage))
  }

  function startTheme(id) {
    commitGame(createGame(id, gameMode, crypto.getRandomValues(new Uint32Array(1))[0], crypto.randomUUID()))
    setLastNews(null)
    setLastNewsAt(-10)
    setHelpOpen(false)
  }

  function resetGame() { startTheme(themeId) }

  function resumeGame() {
    if (!saved) return
    setGame(saved)
    setGameMode(saved.gameMode)
    setLastNews(null)
    setLastNewsAt(-10)
  }

  function buildNewsFlash(effects, choice, prevStats, nextStats, stepNumber) {
    if (!effects) return null
    const severeDrop = Object.values(effects).some((value) => value <= -12)
    const moderateDrop = Object.values(effects).some((value) => value <= -8)
    const crossesAlert =
      prevStats &&
      nextStats &&
      (['cash', 'perceived', 'stakeholder', 'valueAdded', 'shareholder']).some(
        (key) => prevStats[key] > 20 && nextStats[key] <= 20
      )
    const shouldShow =
      severeDrop || crossesAlert || choice?.branchId || (choice?.bad && moderateDrop)

    const cooldownOk = stepNumber - lastNewsAt >= 2
    if (!shouldShow || !cooldownOk) return null

    if (choice?.branchId === 'supplierBetrayal') {
      return {
        label: 'FOURNISSEUR',
        message: 'Des clients remarquent un goût différent. Les doutes montent.',
      }
    }
    if (choice?.branchId === 'fixFight') {
      return {
        label: 'PARIS',
        message: 'Les bookmakers parlent d’un “combat étrange”.',
      }
    }
    if (choice?.branchId === 'mediaHeat') {
      return {
        label: 'RÉSEAUX',
        message: 'Un clash tourne mal. Les vidéos circulent.',
      }
    }
    if (choice?.branchId === 'staffStrike') {
      return {
        label: 'INTERNE',
        message: 'Les coachs parlent de grève.',
      }
    }
    if (choice?.branchId === 'sponsorScandal') {
      return {
        label: 'SPONSOR',
        message: 'Ton sponsor est dans la tourmente. Ça va rejaillir.',
      }
    }
    if (choice?.branchId === 'dopingScandal') {
      return {
        label: 'ANTI-DOPAGE',
        message: 'Des rumeurs de dopage circulent autour de la salle.',
      }
    }
    if (choice?.branchId === 'influencerBacklash') {
      return {
        label: 'RÉSEAUX',
        message: 'Une influenceuse critique la marque. Le buzz monte.',
      }
    }
    if (choice?.branchId === 'ingredientRecall') {
      return {
        label: 'QUALITÉ',
        message: 'Des clientes signalent des réactions. Ça peut exploser.',
      }
    }
    if (choice?.branchId === 'factoryScandal') {
      return {
        label: 'FOURNISSEUR',
        message: 'Un atelier pose problème. La réputation est en jeu.',
      }
    }
    if (choice?.branchId === 'plagiarism') {
      return {
        label: 'LÉGAL',
        message: 'Accusation de plagiat. Risque réputationnel immédiat.',
      }
    }
    if (choice?.branchId === 'influencerFallout') {
      return {
        label: 'RÉSEAUX',
        message: 'Une influenceuse se retourne contre ta marque.',
      }
    }
    if (choice?.branchId === 'copyrightStrike') {
      return {
        label: 'PLATEFORME',
        message: 'Risque de strike. Tes contenus sont surveillés.',
      }
    }
    if (choice?.branchId === 'staffBurnout') {
      return {
        label: 'INTERNE',
        message: 'L’équipe sature. Le burn-out approche.',
      }
    }
    if (choice?.branchId === 'fixMatch') {
      return {
        label: 'PARIS',
        message: 'Les bookmakers parlent d’un match suspect.',
      }
    }
    if (choice?.branchId === 'ultraBacklash') {
      return {
        label: 'SUPPORTERS',
        message: 'Les supporters grondent. Le boycott se prépare.',
      }
    }
    if (choice?.branchId === 'investorCoup') {
      return {
        label: 'ACTIONNAIRES',
        message: 'Les investisseurs veulent un point immédiat.',
      }
    }
    if (choice?.branchId === 'brandBacklash') {
      return {
        label: 'RÉSEAUX',
        message: 'Des posts critiques circulent. L’image se fragilise.',
      }
    }
    if (choice?.branchId === 'staffCrisis') {
      return {
        label: 'INTERNE',
        message: 'L’équipe rumine. L’ambiance se tend.',
      }
    }
    if (choice?.branchId === 'investorCoup') {
      return {
        label: 'ACTIONNAIRES',
        message: 'Les investisseurs veulent un point immédiat.',
      }
    }
    if (choice?.branchId === 'spiral') {
      return {
        label: 'CRISE',
        message: 'Accumulation d’erreurs: la situation se dégrade vite.',
      }
    }

    const entries = Object.entries(effects).filter(([, value]) => value < 0)
    const [worstKey, worstValue] = entries.sort((a, b) => a[1] - b[1])[0] || []
    const critical =
      (worstValue ?? 0) <= -12 ||
      (worstKey && nextStats?.[worstKey] <= 20)

    const messages = {
      perceived: critical
        ? 'Les avis chutent. La réputation décroche.'
        : 'Des habitués commencent à douter de la qualité.',
      stakeholder: critical
        ? 'Conflit social: l’équipe ne suit plus.'
        : 'Des tensions internes apparaissent.',
      cash: critical
        ? 'La banque vous appelle.'
        : 'Trésorerie sous pression ce mois-ci.',
      valueAdded: critical
        ? 'Le comptable alerte: la valeur ajoutée ne couvre plus les charges.'
        : 'La marge se resserre dangereusement.',
      shareholder: critical
        ? 'Les actionnaires exigent des résultats.'
        : 'Les actionnaires s’impatientent.',
    }

    const labels = {
      perceived: 'CLIENTS',
      stakeholder: 'INTERNE',
      cash: 'BANQUE',
      valueAdded: 'COMPTA',
      shareholder: 'ACTIONNAIRES',
    }

    if (worstKey && messages[worstKey]) {
      return {
        label: labels[worstKey],
        message: messages[worstKey],
      }
    }

    return {
      label: 'RUMEURS',
      message: 'Des rumeurs circulent. L’image du café commence à se fissurer.',
    }
  }

  function getAlerts() {
    const alerts = []
    if (stats.cash <= 20) {
      alerts.push(
        `Alerte trésorerie (${stats.cash}): paiements en retard, risque de fermeture.`
      )
    }
    if (stats.perceived <= 20) {
      alerts.push(
        `Alerte réputation (${stats.perceived}): clients perdus, bouche-à-oreille négatif.`
      )
    }
    if (stats.stakeholder <= 20) {
      alerts.push(`Alerte sociale (${stats.stakeholder}): l’équipe ne suit plus.`)
    }
    if (stats.valueAdded <= 20) {
      alerts.push(`Alerte VA (${stats.valueAdded}): marge insuffisante.`)
    }
    if (stats.shareholder <= 20) {
      alerts.push(
        `Alerte actionnaires (${stats.shareholder}): pressions pour changer la direction.`
      )
    }
    return alerts
  }

  function handleChoice(choice) {
    const next = choose(game, choice.id)
    if (next === game) return
    const news = buildNewsFlash(next.result.effects, choice, stats, next.stats, history.length)
    setLastNews(news)
    if (news) setLastNewsAt(history.length)
    commitGame(next)
  }

  function handleContinue() {
    const next = advance(game)
    if (next === game) return
    setLastNews(null)
    commitGame(next)
  }

  if (!theme) return null

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Serious Game SGN – Chapitres 11 & 12</p>
          <h1>Valeur perçue, ajoutée, partenariale</h1>
          <p className="subtitle">
            Choisis ta stratégie, encaisse les conséquences. Ici, les erreurs ne
            pardonnent pas.
          </p>
          <div className="mode-badge">
            Mode: {gameMode === 'challenge' ? 'Défis' : 'Classique'}
          </div>
          <div className="topbar-actions">
            {screen === 'game' && <button className="ghost small" onClick={() => setGame({ ...game, screen: 'home' })}>Pause / thèmes</button>}
            <button
              className="ghost small"
              onClick={() => setHelpOpen((prev) => !prev)}
            >
              Lexique
            </button>
          </div>
        </div>
        <div className="stats-panel">
          {Object.entries(STAT_META).map(([key, meta]) => (
            <StatBar
              key={key}
              label={meta.label}
              value={stats[key]}
              tone={meta.tone}
              delta={lastEffects?.[key]}
              help={meta.help}
            />
          ))}
        </div>
      </header>

      {saveFailed && <p className="storage-warning" role="status">Sauvegarde locale indisponible. Garde cet onglet ouvert pour conserver ta partie.</p>}
      {screen === 'home' && (
        <main className="home">
          {saved && (
            <section className="resume-card">
              <div><strong>{saved.screen === 'end' ? 'Bilan enregistré' : 'Partie en cours'}</strong>
                <p>{THEMES.find(t => t.id === saved.themeId)?.name} · {saved.history.length} décisions</p>
                <small>Sur cet appareil. Commencer un autre scénario remplace cette sauvegarde.</small>
              </div>
              <button className="primary" onClick={resumeGame}>
                {saved.screen === 'end' ? 'Revoir le bilan' : 'Reprendre la partie'}
              </button>
            </section>
          )}
          <div className="hero">
            <div>
              <h2>Choisis ton thème</h2>
              <p>
                Chaque thème reprend les mêmes mécaniques. Mais tout n’est pas
                si simple… Rejoue jusqu’à maîtriser la logique.
              </p>
              <div className="mode-select">
                {GAME_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    className={`mode-option ${gameMode === mode.id ? 'active' : ''}`}
                    onClick={() => setGameMode(mode.id)}
                  >
                    <strong>{mode.label}</strong>
                    <span>{mode.description}</span>
                  </button>
                ))}
              </div>
              <ul className="rules">
                <li>Objectif: maîtriser la valeur perçue + la valeur ajoutée.</li>
                <li>Tout le monde veut sa part: salariés, État, actionnaires.</li>
                <li>Certains choix ouvrent une voie parallèle à gérer.</li>
                <li>Chaque étape principale rapporte des recettes selon la qualité, la richesse créée et les relations. Les crises ne rapportent pas de recettes supplémentaires.</li>
              </ul>
            </div>
            <ThemeIllustration themeId={themeId} />
          </div>

          <section className="theme-grid">
            {THEMES.map((item) => (
              <article
                key={item.id}
                className={`theme-card ${item.locked ? 'locked' : ''}`}
              >
                <div>
                  <p className="status">{item.status}</p>
                  <h3>{item.name}</h3>
                  <p className="theme-subtitle">{item.subtitle}</p>
                  <p className="theme-description">{item.description}</p>
                </div>
                <button
                  className="primary"
                  data-theme={item.id}
                  onClick={() => startTheme(item.id)}
                  disabled={item.locked}
                >
                  {item.locked ? 'Bientôt' : 'Jouer'}
                </button>
              </article>
            ))}
          </section>
        </main>
      )}

      {screen === 'game' && stepToRender && (
        <main className="game">
          {alerts.length > 0 && (
            <div className="alert-banner">
              <div className="alert-banner-title">Alertes terrain</div>
              <ul>
                {alerts.map((alert) => (
                  <li key={alert}>{alert}</li>
                ))}
              </ul>
            </div>
          )}
          <section className="scene">
            <div className="scene-header">
              <div>
                <p className="eyebrow">{theme.name}</p>
                <h2>{stepToRender.title || 'Événement'}</h2>
                <p className="scene-text">{stepToRender.text}</p>
                <div className="tags">
                  {branchState?.label && (
                    <span className="branch-tag">
                      Voie parallèle: {branchState.label}
                    </span>
                  )}
                  {stepToRender.tags?.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <ThemeIllustration themeId={theme.id} />
            </div>

            <div className="choices">
              {stepToRender.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="choice"
                  data-choice={choice.id}
                  onClick={() => handleChoice(choice)}
                  disabled={!!result}
                >
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>

            {result && (
              <div className="result" role="status">
                <div>
                  <h3>{result.title}</h3>
                  <p>{result.text}</p>
                  <p className="income-note">{result.income > 0
                    ? `Recettes d’exploitation : +${result.income} points de trésorerie.`
                    : 'Gestion de crise : aucune recette supplémentaire.'}
                    {' '}Variation nette de trésorerie : {result.actualCashDelta > 0 ? '+' : ''}{result.actualCashDelta} (jauge limitée à 0–100).
                  </p>
                  <div className="effects">
                    {Object.entries(result.effects).map(([key, value]) => (
                      <span key={key}>
                        {STAT_META[key]?.label}: {value > 0 ? '+' : ''}
                        {value}
                      </span>
                    ))}
                  </div>
                  {lastNews && (
                    <div className="newsflash">
                      <span className="newsflash-label">{lastNews.label}</span>
                      {lastNews.message}
                    </div>
                  )}
                </div>
                <button className="primary" onClick={handleContinue}>
                  Continuer
                </button>
              </div>
            )}
          </section>
          <aside className="sidebar">
            <h3>Briefing</h3>
            <p>{theme.intro}</p>
            {pendingBranches.length > 0 && (
              <div className="sidebar-alerts pending">
                <h4>Voies en attente</h4>
                <ul>
                  {pendingBranches.map((label, index) => (
                    <li key={`${label}-${index}`}>{label}</li>
                  ))}
                </ul>
              </div>
            )}
            {objectives && (
              <div className="objectives-panel">
                <h4>Défis en cours</h4>
                {objectiveGroups.map((group) => (
                  <div key={group.title} className="objective-group">
                    <p className="objective-title">{group.title}</p>
                    <div className="objective-list">
                      {group.items.map((item) => {
                        const state = getObjectiveState(
                          item,
                          stats,
                          flags,
                          usedBranchIds
                        )
                        return (
                          <div
                            key={item.id}
                            className={`objective-item ${state.status}`}
                          >
                            <div className="objective-row">
                              <span>{item.label}</span>
                              {typeof state.value === 'number' &&
                                typeof state.target === 'number' && (
                                  <span className="objective-value">
                                    {state.value}/{state.target}
                                  </span>
                                )}
                            </div>
                            <div className="objective-bar">
                              <div
                                className="objective-fill"
                                style={{ width: `${state.progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="sidebar-box">
              <h4>Rappel express</h4>
              <p>
                Valeur ajoutée = Chiffre d’affaires - consommations
                intermédiaires.
              </p>
              <p>
                Valeur partenariale: équilibre entre salariés, clients,
                fournisseurs, État et actionnaires.
              </p>
            </div>
          </aside>
        </main>
      )}

      {screen === 'end' && ending && (
        <main className="ending">
          <section className="ending-card">
            <div>
              <p className="eyebrow">{ending.grade}</p>
              <h2>{ending.title}</h2>
              <p className="scene-text">{ending.summary}</p>
              <div className="score">Score final: {ending.score}/100</div>
              <div className="tags">
                <span>{roast}</span>
              </div>
            </div>
            <ThemeIllustration themeId={theme.id} />
          </section>

          <section className="ending-grid">
            <article>
              <h3>Conséquences</h3>
              <ul>
                {ending.consequences.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
            {ending.reasons?.length > 0 && (
              <article>
                <h3>Pourquoi ça a crashé</h3>
                <ul>
                  {ending.reasons.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            )}
            {objectives && (
              <article>
                <h3>Résultat des défis</h3>
                <div className="objective-list">
                  {[...(objectives.primary || []), ...(objectives.secondary || [])].map(
                    (item) => {
                      const state = getObjectiveState(
                        item,
                        stats,
                        flags,
                        usedBranchIds
                      )
                      return (
                        <div
                          key={`end-${item.id}`}
                          className={`objective-item ${state.status}`}
                        >
                          <div className="objective-row">
                            <span>{item.label}</span>
                            {typeof state.value === 'number' &&
                              typeof state.target === 'number' && (
                                <span className="objective-value">
                                  {state.value}/{state.target}
                                </span>
                              )}
                          </div>
                          <div className="objective-bar">
                            <div
                              className="objective-fill"
                              style={{ width: `${state.progress}%` }}
                            />
                          </div>
                        </div>
                      )
                    }
                  )}
                </div>
              </article>
            )}
            <article>
              <h3>Choix éclatés</h3>
              {worstChoices.length === 0 ? (
                <p>Pas d’erreur majeure détectée. Tu peux viser mieux.</p>
              ) : (
                <ul>
                  {worstChoices.map((item, index) => (
                    <li key={`${item.label}-${index}`}>
                      <div>
                        {item.verdict} — {item.label}
                      </div>
                      <div className="prof-comment">
                        {PROF_COMMENTS[index % PROF_COMMENTS.length]}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>
            <article>
              <h3>Tips pour la prochaine run</h3>
              <ul>
                <li>Ne sacrifie pas la valeur perçue pour un gain immédiat.</li>
                <li>Une gouvernance trop actionnariale déclenche le conflit.</li>
                <li>Mesure la valeur perçue avant de décider.</li>
              </ul>
            </article>
          </section>

          <div className="ending-actions">
            <button className="primary" onClick={resetGame}>
              Rejouer
            </button>
            <button className="ghost" onClick={() => setGame({ ...game, screen: 'home' })}>
              Retour aux thèmes
            </button>
          </div>
        </main>
      )}

      {helpOpen && (
        <div
          className="lexicon-overlay"
          onClick={() => setHelpOpen(false)}
        />
      )}
      <aside className={`lexicon-panel ${helpOpen ? 'open' : ''}`} inert={!helpOpen}>
        <div className="lexicon-header">
          <div>
            <p className="eyebrow">Aide rapide</p>
            <h3>Lexique du jeu</h3>
          </div>
          <button className="ghost small" onClick={() => setHelpOpen(false)}>
            Fermer
          </button>
        </div>
        <div className="lexicon-content">
          {LEXICON.map((item) => (
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
