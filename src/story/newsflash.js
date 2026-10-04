// Breaking-news line shown inside a consequence (same rules as v2).
const BRANCH_NEWS = {
  supplierBetrayal: ['FOURNISSEUR', 'Des clients remarquent un goût différent. Les doutes montent.'],
  fixFight: ['PARIS', 'Les bookmakers parlent d’un “combat étrange”.'],
  mediaHeat: ['RÉSEAUX', 'Un clash tourne mal. Les vidéos circulent.'],
  staffStrike: ['INTERNE', 'Les coachs parlent de grève.'],
  sponsorScandal: ['SPONSOR', 'Ton sponsor est dans la tourmente. Ça va rejaillir.'],
  dopingScandal: ['ANTI-DOPAGE', 'Des rumeurs de dopage circulent autour de la salle.'],
  influencerBacklash: ['RÉSEAUX', 'Une influenceuse critique la marque. Le buzz monte.'],
  ingredientRecall: ['QUALITÉ', 'Des clientes signalent des réactions. Ça peut exploser.'],
  factoryScandal: ['FOURNISSEUR', 'Un atelier pose problème. La réputation est en jeu.'],
  plagiarism: ['LÉGAL', 'Accusation de plagiat. Risque réputationnel immédiat.'],
  influencerFallout: ['RÉSEAUX', 'Une influenceuse se retourne contre ta marque.'],
  copyrightStrike: ['PLATEFORME', 'Risque de strike. Tes contenus sont surveillés.'],
  staffBurnout: ['INTERNE', 'L’équipe sature. Le burn-out approche.'],
  fixMatch: ['PARIS', 'Les bookmakers parlent d’un match suspect.'],
  ultraBacklash: ['SUPPORTERS', 'Les supporters grondent. Le boycott se prépare.'],
  investorCoup: ['ACTIONNAIRES', 'Les investisseurs veulent un point immédiat.'],
  brandBacklash: ['RÉSEAUX', 'Des posts critiques circulent. L’image se fragilise.'],
  staffCrisis: ['INTERNE', 'L’équipe rumine. L’ambiance se tend.'],
  spiral: ['CRISE', 'Accumulation d’erreurs: la situation se dégrade vite.'],
}

const STAT_NEWS = {
  perceived: ['CLIENTS', 'Les avis chutent. La réputation décroche.', 'Des habitués commencent à douter de la qualité.'],
  stakeholder: ['INTERNE', 'Conflit social: l’équipe ne suit plus.', 'Des tensions internes apparaissent.'],
  cash: ['BANQUE', 'La banque vous appelle.', 'Trésorerie sous pression ce mois-ci.'],
  valueAdded: ['COMPTA', 'Le comptable alerte: la valeur ajoutée ne couvre plus les charges.', 'La marge se resserre dangereusement.'],
  shareholder: ['ACTIONNAIRES', 'Les actionnaires exigent des résultats.', 'Les actionnaires s’impatientent.'],
}

export function buildNewsFlash({ effects, choice, prevStats, nextStats, stepNumber, lastNewsAt }) {
  if (!effects) return null
  const values = Object.values(effects)
  const crossesAlert = Object.keys(STAT_NEWS).some(key => prevStats[key] > 20 && nextStats[key] <= 20)
  const shouldShow = values.some(v => v <= -12) || crossesAlert || choice?.branchId ||
    (choice?.bad && values.some(v => v <= -8))
  if (!shouldShow || stepNumber - lastNewsAt < 2) return null

  const branch = BRANCH_NEWS[[choice?.branchId].flat()[0]]
  if (branch) return { label: branch[0], message: branch[1] }

  const [worstKey, worstValue] = Object.entries(effects).filter(([, v]) => v < 0).sort((a, b) => a[1] - b[1])[0] || []
  const stat = STAT_NEWS[worstKey]
  if (stat) {
    const critical = worstValue <= -12 || nextStats[worstKey] <= 20
    return { label: stat[0], message: critical ? stat[1] : stat[2] }
  }
  return { label: 'RUMEURS', message: 'Des rumeurs circulent. L’image commence à se fissurer.' }
}

export function alertsFor(stats) {
  const alerts = []
  if (stats.cash <= 20) alerts.push(`Alerte trésorerie (${stats.cash}) : paiements en retard, risque de fermeture.`)
  if (stats.perceived <= 20) alerts.push(`Alerte réputation (${stats.perceived}) : clients perdus, bouche-à-oreille négatif.`)
  if (stats.stakeholder <= 20) alerts.push(`Alerte sociale (${stats.stakeholder}) : l’équipe ne suit plus.`)
  if (stats.valueAdded <= 20) alerts.push(`Alerte VA (${stats.valueAdded}) : marge insuffisante.`)
  if (stats.shareholder <= 20) alerts.push(`Alerte actionnaires (${stats.shareholder}) : pressions pour changer la direction.`)
  return alerts
}
