import { STAT_META, PROF_COMMENTS, getObjectiveState } from '../gameData.js'
import { actById, LETTERS } from './storyConfig.js'

function anchorProps(station, world, push = 0) {
  const location = world.locations[station.location]
  return { id: station.key, 'data-anchor': station.key, 'data-location': station.location,
    'data-x': station.camera.x, 'data-y': station.camera.y, 'data-z': station.camera.z + push,
    'data-position': location.copyPosition }
}

function Effects({ effects }) {
  return (
    <ul className="effects">
      {Object.entries(effects).map(([key, value]) => (
        <li key={key} className={value > 0 ? 'pos' : 'neg'} data-tone={STAT_META[key]?.tone}>
          {STAT_META[key]?.label} <strong>{value > 0 ? '+' : ''}{value}</strong>
        </li>
      ))}
    </ul>
  )
}

export function PrologueStation({ station, world, theme, mode }) {
  const act = actById('seuil')
  return (
    <section className="station station--prologue" {...anchorProps(station, world)}>
      <article className="copy copy--title">
        <p className="copy__index">{mode === 'challenge' ? 'Mode Défis' : 'Mode Classique'} · {world.locations.seuil.label}</p>
        <h2 className="copy__display">{theme.name.split(':').pop().trim()}</h2>
        <p className="copy__subtitle">{world.tagline}</p>
        <p className="copy__text">{theme.intro}</p>
        <ol className="act-map" aria-label="Les lieux de la traversée">
          {Object.entries(world.locations).map(([id, location]) => (
            <li key={id}><span>{actById(id).eyebrow}</span> {location.label}</li>
          ))}
        </ol>
        <p className="scroll-cue" aria-hidden="true"><span>Défile pour entrer</span><i /></p>
        <p className="sr-only">{act.eyebrow} : {act.focus}</p>
      </article>
    </section>
  )
}

export function Connector({ connector, world }) {
  const act = actById(connector.to)
  const dive = connector.connector === 'dive'
  return (
    <div className={`connector connector--${connector.connector}`} style={{ '--span': connector.span }}
      data-connector={connector.connector} aria-hidden={!dive}>
      {dive && (
        <p className="connector__card">
          <span>{act.eyebrow}</span>
          <strong>{world.locations[connector.to].label}</strong>
          <em>{act.label} — {act.focus}</em>
        </p>
      )}
    </div>
  )
}

export function DecisionStation({ station, world, number, live, news, onChoose, onContinue, onFocusChoice }) {
  const act = actById(station.act)
  const location = world.locations[station.location]
  const { result } = station
  const eyebrow = station.sceneKind === 'branch' ? `Voie parallèle : ${station.branchLabel}`
    : station.sceneKind === 'event' ? 'Événement imprévu' : `Décision ${number}`
  return (
    <section className={`station station--decision${result ? ' is-resolved' : ''}${live ? ' is-live' : ''}`}
      data-kind={station.sceneKind} {...anchorProps(station, world, result ? 0.06 : 0)}>
      <article className="copy">
        <p className="copy__index">{act.eyebrow} · {location.label}</p>
        <p className={`copy__eyebrow${station.sceneKind !== 'main' ? ' is-alert' : ''}`}>{eyebrow}</p>
        <h2>{station.title}</h2>
        <p className="copy__text">{station.text}</p>
        {station.tags.length > 0 && <ul className="copy__tags">{station.tags.map(t => <li key={t}>{t}</li>)}</ul>}

        <div className="decision">
          <p className="decision__label">{result ? 'Ta décision' : 'À toi de trancher'}</p>
          {live && !result ? (
            <div className="decision__choices">
              {station.choices.map((choice, i) => (
                <button key={choice.id} type="button" className="choice" data-choice={choice.id}
                  onClick={() => onChoose(choice.id)}
                  onPointerEnter={() => onFocusChoice(choice.id)} onPointerLeave={() => onFocusChoice(null)}
                  onFocus={() => onFocusChoice(choice.id)} onBlur={() => onFocusChoice(null)}>
                  <span className="choice__letter" aria-hidden="true">{LETTERS[i]}</span>
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <ul className="decision__log">
              {station.choices.map((choice, i) => (
                <li key={choice.id} className={choice.id === station.chosen ? 'is-chosen' : ''}>
                  <span className="choice__letter" aria-hidden="true">{LETTERS[i]}</span>
                  <span>{choice.label}</span>
                  {choice.id === station.chosen && <span className="sr-only"> (choisi)</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {result && (
          <div className={`consequence${station.result.effects && Object.values(result.effects).some(v => v <= -8) ? ' is-hard' : ''}`}
            role={live ? 'status' : undefined}>
            <h3>{result.title}</h3>
            <p>{result.text}</p>
            <Effects effects={result.effects} />
            <p className="income-note">
              {result.income > 0
                ? `Recettes d’exploitation : +${result.income} points de trésorerie.`
                : 'Gestion de crise : aucune recette supplémentaire.'}
              {' '}Variation nette de trésorerie : {result.actualCashDelta > 0 ? '+' : ''}{result.actualCashDelta} (jauge limitée à 0–100).
            </p>
            {live && news && (
              <p className="newsflash"><span>{news.label}</span>{news.message}</p>
            )}
            {live && (
              <button type="button" className="primary continue" onClick={onContinue}>Continuer</button>
            )}
          </div>
        )}
      </article>
    </section>
  )
}

function ObjectiveList({ items, stats, flags, usedBranchIds }) {
  return (
    <div className="objective-list">
      {items.map(item => {
        const state = getObjectiveState(item, stats, flags, usedBranchIds)
        return (
          <div key={item.id} className={`objective-item ${state.status}`}>
            <div className="objective-row">
              <span>{item.label}</span>
              {typeof state.value === 'number' && typeof state.target === 'number' && (
                <span className="objective-value">{state.value}/{state.target}</span>
              )}
            </div>
            <div className="objective-bar"><div className="objective-fill" style={{ width: `${state.progress}%` }} /></div>
          </div>
        )
      })}
    </div>
  )
}
export { ObjectiveList }

export function EndingStation({ station, world, ending, game, objectives, roast, onReplay, onHome }) {
  const worst = game.history.filter(item => item.bad).slice(0, 3)
  return (
    <section className="station station--ending" data-grade={ending.grade} {...anchorProps(station, world)}>
      <article className="copy copy--ending ending-card">
        <p className="copy__index">Bilan · {world.locations.finale.label}</p>
        <p className="copy__eyebrow">{ending.grade}</p>
        <h2>{ending.title}</h2>
        <p className="copy__text">{ending.summary}</p>
        <p className="score"><span>Score final</span> <strong>{ending.score}</strong>/100</p>
        <p className="roast">{roast}</p>
      </article>
      <div className="ending-grid">
        <article>
          <h3>Conséquences</h3>
          <ul>{ending.consequences.map(line => <li key={line}>{line}</li>)}</ul>
        </article>
        {ending.reasons?.length > 0 && (
          <article>
            <h3>Pourquoi ça a crashé</h3>
            <ul>{ending.reasons.map(line => <li key={line}>{line}</li>)}</ul>
          </article>
        )}
        {objectives && (
          <article>
            <h3>Résultat des défis</h3>
            <ObjectiveList items={[...(objectives.primary || []), ...(objectives.secondary || [])]}
              stats={game.stats} flags={game.flags} usedBranchIds={game.usedBranchIds} />
          </article>
        )}
        <article>
          <h3>Choix éclatés</h3>
          {worst.length === 0 ? <p>Pas d’erreur majeure détectée. Tu peux viser mieux.</p> : (
            <ul>
              {worst.map((item, index) => (
                <li key={`${item.stepId}-${index}`}>
                  <div>{item.verdict} — {item.label}</div>
                  <div className="prof-comment">{PROF_COMMENTS[index % PROF_COMMENTS.length]}</div>
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
      </div>
      <div className="ending-actions">
        <button type="button" className="primary" onClick={onReplay}>Rejouer</button>
        <button type="button" className="ghost" onClick={onHome}>Retour aux thèmes</button>
      </div>
    </section>
  )
}
