import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STAT_META = {
  perceived: { label: 'Valeur perçue', tone: 'mint' },
  valueAdded: { label: 'Valeur ajoutée', tone: 'gold' },
  stakeholder: { label: 'Valeur partenariale', tone: 'sky' },
  shareholder: { label: 'Valeur actionnariale', tone: 'rose' },
  cash: { label: 'Trésorerie', tone: 'coffee' },
}

const INITIAL_STATS = {
  perceived: 50,
  valueAdded: 50,
  stakeholder: 50,
  shareholder: 50,
  cash: 50,
}

const THEMES = [
  {
    id: 'cafe',
    name: 'Starbuck: Café Orion',
    subtitle: 'Café premium pour lycéens pressés',
    status: 'Disponible',
    description:
      'Tu pilotes un nouveau café “Starbuck” en centre-ville. Tout le monde attend des résultats. Les décisions sont piégées. Bonne chance.',
    intro:
      'Tu reprends un café Starbuck flambant neuf. Loyer haut, staff jeune, investisseurs impatients. Objectif: créer de la valeur perçue sans flinguer la valeur ajoutée ni allumer la guerre des parties prenantes.',
    scenes: [
      {
        id: 'briefing',
        title: 'Briefing express',
        tags: ['Valeur perçue', 'Positionnement'],
        text:
          'Ton café doit avoir une identité claire. Les élèves passent devant tous les jours. Tu veux qu’ils “ressentent” la valeur. Quelle première direction tu donnes ?',
        choices: [
          {
            id: 'premium-experience',
            label:
              'Expérience travaillée: formation baristas, playlists choisies, latte art, déco soignée.',
            consequence:
              'Tu poses un niveau d’exigence. Les clients sentent la qualité… mais le cash part vite.',
            effects: { perceived: 18, cash: -12, valueAdded: 6 },
            verdict: 'Solide. Tu construis la valeur perçue.',
          },
          {
            id: 'discount-mode',
            label:
              'Positionnement prix accessible: standardisation des boissons, déco minimale, rotation rapide.',
            consequence:
              'Le prix attire du monde mais tout le monde te compare au kebab du coin.',
            effects: { perceived: -12, cash: 6, stakeholder: -4 },
            verdict: 'Cheap vibes. La valeur perçue s’effondre.',
            bad: true,
          },
          {
            id: 'fake-hype',
            label:
              'Lancement digital agressif: micro-campagnes Insta + amplification d’avis.',
            consequence:
              'Ça attire au début… mais tu joues avec le feu.',
            effects: { perceived: 10, stakeholder: -8, cash: -4 },
            verdict: 'Faux positif. Tu as ouvert la porte au drama.',
            flags: ['fake-reviews'],
          },
        ],
      },
      {
        id: 'pricing-brand',
        title: 'Prix & marque',
        tags: ['Valeur perçue', 'Prix'],
        text:
          'On te demande de fixer la grille des prix et la promesse de marque. Tu choisis quoi ?',
        choices: [
          {
            id: 'premium-price',
            label:
              'Prix premium + storytelling “ingrédients éthiques, baristas experts”.',
            consequence:
              'Tu renforces l’image haut de gamme. Certains râlent, mais la marque assume.',
            effects: { perceived: 14, cash: 8, stakeholder: -2 },
            verdict: 'Cohérent. Tu assumes la valeur perçue.',
          },
          {
            id: 'price-war',
            label:
              'Stratégie prix d’appel agressive + promos massives pour gagner du volume.',
            consequence:
              'Tu vends beaucoup… mais ta marge fond comme un frappé au soleil.',
            effects: { perceived: -10, cash: -8, valueAdded: -10 },
            verdict: 'Piège classique. Tu détruis ta valeur ajoutée.',
            bad: true,
          },
          {
            id: 'stealth-increase',
            label:
              'Recalibrage tarifaire progressif, sans communication spécifique.',
            consequence:
              'Les clients se sentent pigeonnés. Les avis tombent.',
            effects: { perceived: -14, cash: 4, stakeholder: -6 },
            verdict: 'Trahison perçue. Ça pique.',
            bad: true,
          },
        ],
      },
      {
        id: 'measure',
        title: 'Mesure de la valeur perçue',
        tags: ['Valeur perçue', 'Mesure'],
        text:
          'Tu veux savoir si la valeur perçue est réelle ou juste dans ta tête. Tu mesures comment ?',
        choices: [
          {
            id: 'survey',
            label: 'Satisfaction clients + analyse des retours.',
            consequence:
              'Tu comprends ce que les clients ressentent vraiment.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Pro. Tu mesures ce qui compte.',
          },
          {
            id: 'market-study',
            label: 'Étude locale + tests de prix sur un panel.',
            consequence:
              'Tu ajustes ton offre avec des données solides.',
            effects: { perceived: 8, valueAdded: 4, cash: -4 },
            verdict: 'Stratégique. Tu limites l’approximation.',
          },
          {
            id: 'vibes-only',
            label: 'Pilotage intuitif + observation des tendances TikTok.',
            consequence:
              'Le feeling ne paie pas les factures.',
            effects: { perceived: -6, valueAdded: -4 },
            verdict: 'Éclaté au sol. Tu pilotes à l’aveugle.',
            bad: true,
          },
        ],
      },
      {
        id: 'production',
        title: 'Facteurs de production',
        tags: ['Travail', 'Capital'],
        text:
          'Ton staff est jeune, le matériel est correct mais pas exceptionnel. Tu investis où ?',
        choices: [
          {
            id: 'train-staff',
            label: 'Renforcer les compétences baristas + primes qualité.',
            consequence:
              'La qualité grimpe, le service devient vraiment premium.',
            effects: { perceived: 10, stakeholder: 10, cash: -8 },
            verdict: 'Tu investis dans le travail. Bonne base.',
          },
          {
            id: 'super-machines',
            label:
              'Investir dans des machines très haut de gamme, quitte à réduire la marge.',
            consequence:
              'Les boissons sont top mais la trésorerie souffre.',
            effects: { perceived: 12, cash: -18, valueAdded: 4 },
            verdict: 'Puissant mais risqué. Le capital coûte cher.',
          },
          {
            id: 'cheap-staff',
            label:
              'Réorganisation: automatiser certaines tâches et réduire les heures.',
            consequence:
              'Moins de coûts, mais l’expérience client devient froide.',
            effects: { perceived: -12, stakeholder: -12, cash: 8 },
            verdict: 'Tu sacrifies l’humain. Les clients le sentent.',
            bad: true,
          },
        ],
      },
      {
        id: 'supply',
        title: 'Approvisionnement & consommations intermédiaires',
        tags: ['Valeur ajoutée', 'Fournisseurs'],
        text:
          'Tu choisis tes fournisseurs de café et de snacks. Objectif: garder de la marge sans flinguer l’image.',
        choices: [
          {
            id: 'fair-trade',
            label: 'Fournisseurs locaux + café équitable (coût plus élevé).',
            consequence:
              'Coût plus élevé, mais image forte et clients fidèles.',
            effects: { perceived: 12, valueAdded: 6, cash: -10, stakeholder: 6 },
            verdict: 'Tu crées de la valeur perçue ET partenariale.',
          },
          {
            id: 'cheap-import',
            label: 'Approvisionnement international à coût optimisé.',
            consequence:
              'La marge grimpe, mais les habitués sentent la baisse.',
            effects: { perceived: -10, valueAdded: 6, cash: 8, stakeholder: -6 },
            verdict: 'Court terme gagnant, long terme dangereux.',
            bad: true,
          },
          {
            id: 'mix-hide',
            label:
              'Blend interne pour équilibrer coûts et qualité, sans communication détaillée.',
            consequence:
              'Tu crois être malin. Les palais des clients aussi.',
            effects: { perceived: -14, valueAdded: 4, stakeholder: -8 },
            verdict: 'Faux semblant. Ça explose en bouche… et en avis.',
            bad: true,
            flags: ['quality-lie'],
          },
        ],
      },
      {
        id: 'value-added',
        title: 'Calcul de la valeur ajoutée',
        tags: ['Valeur ajoutée', 'Calcul'],
        text:
          'Chiffre d’affaires annuel: 210 000 €. Consommations intermédiaires: 130 000 €. Quelle est la valeur ajoutée ?',
        choices: [
          {
            id: 'va-correct',
            label: '80 000 €',
            consequence: 'Bonne formule: VA = CA - CI.',
            effects: { valueAdded: 14, shareholder: 4 },
            verdict: 'Tu sais calculer. C’est la base.',
          },
          {
            id: 'va-too-high',
            label: '340 000 €',
            consequence: 'Tu additionnes tout. Non.',
            effects: { valueAdded: -12, shareholder: -4 },
            verdict: 'Catastrophe. Tu confonds tout.',
            bad: true,
          },
          {
            id: 'va-too-low',
            label: '50 000 €',
            consequence: 'Tu as oublié un morceau du CA.',
            effects: { valueAdded: -10 },
            verdict: 'Presque… mais non.',
            bad: true,
          },
        ],
      },
      {
        id: 'distribution',
        title: 'Répartition de la valeur ajoutée',
        tags: ['Répartition', 'Conflits'],
        text:
          'Ta VA est là. Tu dois la répartir entre salariés, État, actionnaires et autofinancement. Tu fais quoi ?',
        choices: [
          {
            id: 'balanced',
            label:
              'Salaires corrects + impôts à l’heure + dividendes modérés + réinvestissement.',
            consequence:
              'Tout le monde grogne un peu, mais personne ne te plante.',
            effects: { stakeholder: 12, shareholder: 6, cash: -4, valueAdded: 6 },
            verdict: 'Équilibré. Tu évites la guerre civile.',
          },
          {
            id: 'dividends-max',
            label:
              'Priorité aux actionnaires pour consolider la confiance financière.',
            consequence:
              'Les actionnaires kiffent. Les employés te détestent.',
            effects: { shareholder: 18, stakeholder: -16, perceived: -6 },
            verdict: 'Actionnarial pur. Risque de conflit.',
            bad: true,
            flags: ['staff-angry'],
          },
          {
            id: 'all-staff',
            label:
              'Redistribution renforcée vers les salariés et avantages internes.',
            consequence:
              'Le staff adore, mais les investisseurs veulent te virer.',
            effects: { stakeholder: 16, shareholder: -18, cash: -6 },
            verdict: 'Partenariale à 100%. Tu allumes les actionnaires.',
            bad: true,
            flags: ['investor-angry'],
          },
        ],
      },
      {
        id: 'governance',
        title: 'Gouvernance: actionnariale ou partenariale ?',
        tags: ['Gouvernance', 'Parties prenantes'],
        text:
          'Dernière étape: comment tu gouvernes le café ?',
        choices: [
          {
            id: 'co-decision',
            label:
              'Comité mixte avec baristas, fournisseurs et clients fidèles.',
            consequence:
              'Les salariés se sentent respectés. La confiance monte.',
            effects: { stakeholder: 16, perceived: 6, shareholder: -6 },
            verdict: 'Partenariale solide. Tu gagnes en stabilité.',
          },
          {
            id: 'shareholder-only',
            label: 'Pilotage centré conseil actionnarial + reporting strict.',
            consequence:
              'Rapide, mais froid. Les autres acteurs se braquent.',
            effects: { shareholder: 14, stakeholder: -14, perceived: -6 },
            verdict: 'Tu vas vers le conflit.',
            bad: true,
          },
          {
            id: 'mix',
            label: 'Mix: objectifs financiers + feedback trimestriel du staff.',
            consequence:
              'Tu limites la casse des deux côtés.',
            effects: { shareholder: 6, stakeholder: 8, valueAdded: 4 },
            verdict: 'Réaliste. Pas parfait, mais solide.',
          },
        ],
      },
      {
        id: 'random-event',
        type: 'random',
      },
      {
        id: 'last-push',
        title: 'Dernier choix avant bilan',
        tags: ['Communication', 'Expérience client'],
        text:
          'Avant le bilan, tu dois choisir une dernière action forte.',
        choices: [
          {
            id: 'csr',
            label:
              'Programme anti-gaspi + actions locales + communication transparente.',
            consequence:
              'Ta marque gagne en respect. Les clients reviennent.',
            effects: { perceived: 12, stakeholder: 10, cash: -6 },
            verdict: 'Bonne stratégie long terme.',
          },
          {
            id: 'influencer',
            label: 'Campagne influenceurs à forte portée.',
            consequence:
              'Tu fais le buzz… si la qualité suit. Sinon, bad buzz.',
            effects: ({ flags }) => ({
              perceived: flags.has('quality-lie') ? -10 : 8,
              cash: -10,
            }),
            verdict: 'Gros pari. Tu peux te faire démonter.',
          },
          {
            id: 'cut-costs',
            label:
              'Optimisation des coûts: effectifs réduits + procédures allégées.',
            consequence:
              'La marge monte… et la colère aussi.',
            effects: { cash: 10, stakeholder: -14, perceived: -8 },
            verdict: 'Tu creuses ta tombe.',
            bad: true,
          },
        ],
      },
    ],
    randomEvents: [
      {
        id: 'tiktok',
        title: 'Event aléatoire: TikTok et réputation',
        tags: ['Réputation', 'Valeur perçue'],
        text:
          'Une vidéo TikTok accuse ton café de tricher sur les ingrédients. 150k vues en 2h. Tu réagis comment ?',
        choices: [
          {
            id: 'transparent',
            label: 'Live vidéo: transparence cuisine + preuves fournisseurs.',
            consequence:
              'Tu éteins l’incendie. Les clients respectent la transparence.',
            effects: ({ flags }) => ({
              perceived: flags.has('quality-lie') ? 4 : 10,
              stakeholder: 6,
            }),
            verdict: 'Bonne défense. Tu joues carte claire.',
          },
          {
            id: 'ignore',
            label: 'Tu temporises et attends que ça retombe.',
            consequence:
              'Le bad buzz grossit. Les avis s’écroulent.',
            effects: { perceived: -16, stakeholder: -6 },
            verdict: 'Tu perds la bataille de la perception.',
            bad: true,
          },
          {
            id: 'attack',
            label: 'Tu réponds par voie légale et demandes un retrait.',
            consequence:
              'Elle répond avec une vidéo encore pire. Effet Streisand.',
            effects: { perceived: -20, stakeholder: -8 },
            verdict: 'Éclaté. Tu lances un boomerang.',
            bad: true,
          },
        ],
      },
      {
        id: 'bean-price',
        title: 'Event aléatoire: explosion du prix du café',
        tags: ['Valeur ajoutée', 'Coûts'],
        text:
          'Le prix du café brut explose. Tes coûts montent de 20%. Que fais-tu ?',
        choices: [
          {
            id: 'adjust-price',
            label: 'Ajustement tarifaire limité + explication publique.',
            consequence:
              'Tu protèges la marge sans perdre tout le monde.',
            effects: { cash: 6, perceived: -4, valueAdded: 6 },
            verdict: 'Pragmatique. Tu sauves la VA.',
          },
          {
            id: 'eat-margin',
            label: 'Tu absorbes la hausse pour préserver l’expérience client.',
            consequence:
              'Les clients sont contents, mais ta valeur ajoutée dégringole.',
            effects: { valueAdded: -12, cash: -10, perceived: 6 },
            verdict: 'Gentil… mais fragile financièrement.',
          },
          {
            id: 'cheap-switch',
            label: 'Tu passes sur un blend plus économique sans changement visible.',
            consequence:
              'Tu perds la qualité, les clients le sentent direct.',
            effects: { perceived: -16, valueAdded: 4, stakeholder: -6 },
            verdict: 'Trahison. La valeur perçue s’écrase.',
            bad: true,
            flags: ['quality-lie'],
          },
        ],
      },
      {
        id: 'inspection',
        title: 'Event aléatoire: inspection surprise',
        tags: ['État', 'Confiance'],
        text:
          'Inspection hygiène et travail. Ils débarquent sans prévenir.',
        choices: [
          {
            id: 'clean',
            label: 'Tu coopères et tu montres tous les process.',
            consequence:
              'Aucune amende. L’équipe est fière.',
            effects: { stakeholder: 8, perceived: 6 },
            verdict: 'Propre. Tu gagnes en crédibilité.',
          },
          {
            id: 'rush-clean',
            label: 'Tu fais un nettoyage express avant leur passage.',
            consequence:
              'Ils voient tout. Amende + mauvaise presse.',
            effects: { cash: -8, stakeholder: -8, perceived: -10 },
            verdict: 'Tu t’es grillé.',
            bad: true,
          },
          {
            id: 'bribe',
            label: 'Tu cherches un accord informel pour éviter un rapport.',
            consequence:
              'Ils te dénoncent. Fin du game.',
            effects: { cash: -16, stakeholder: -18, perceived: -14 },
            verdict: 'Illégal. Tu perds tout.',
            bad: true,
            flags: ['illegal'],
          },
        ],
      },
    ],
  },
  {
    id: 'cosmetic',
    name: 'Cosmétique',
    subtitle: 'Lancement d’une marque',
    status: 'Bientôt',
    description: 'À venir: même mécanique, autre univers.',
    locked: true,
  },
  {
    id: 'boxing',
    name: 'Salle de boxe',
    subtitle: 'Abonnements, sponsors, réputation',
    status: 'Bientôt',
    description: 'À venir: ring, drama, sponsors, trahisons.',
    locked: true,
  },
  {
    id: 'football',
    name: 'Foot & business',
    subtitle: 'Club local en crise',
    status: 'Bientôt',
    description: 'À venir: transferts, sponsors, supporters, chaos.',
    locked: true,
  },
  {
    id: 'art',
    name: 'Art & médias',
    subtitle: 'Studio créatif',
    status: 'Bientôt',
    description: 'À venir: deals, buzz, ego, réputation.',
    locked: true,
  },
  {
    id: 'fashion',
    name: 'Mode urbaine',
    subtitle: 'Marque streetwear',
    status: 'Bientôt',
    description: 'À venir: drops, collabs, hype.',
    locked: true,
  },
]

const ROASTS = [
  'Tes choix étaient éclatés au sol.',
  'Tu as confondu “stratégie” et “improvisation”.',
  'On dirait que tu joues avec les yeux fermés.',
  'Même ton comptable a quitté le groupe WhatsApp.',
  'Tu as créé de la valeur… pour tes concurrents.',
]

function clamp(value) {
  return Math.max(0, Math.min(100, value))
}

function applyEffects(stats, effects) {
  const next = { ...stats }
  Object.entries(effects || {}).forEach(([key, delta]) => {
    if (next[key] === undefined) return
    next[key] = clamp(next[key] + delta)
  })
  return next
}

function getOutcome(stats, history, flags) {
  const score = Math.round(
    stats.perceived * 0.2 +
      stats.valueAdded * 0.2 +
      stats.stakeholder * 0.25 +
      stats.shareholder * 0.15 +
      stats.cash * 0.2
  )

  const hasIllegal = flags.has('illegal')
  const catastrophe =
    hasIllegal ||
    stats.cash < 25 ||
    stats.perceived < 25 ||
    stats.stakeholder < 25

  if (catastrophe) {
    return {
      grade: 'Catastrophe',
      title: 'Fin de partie: descente aux enfers',
      summary:
        'Tu as perdu le contrôle. Le café s’effondre, les acteurs te lâchent, la valeur perçue est morte.',
      consequences: [
        'Le gérant finit SDF, le café est repris par un concurrent.',
        'Les salariés te lâchent et racontent tout sur les réseaux.',
        'Les actionnaires te traînent au tribunal pour “gestion éclatée”.',
      ],
      score,
    }
  }

  if (score < 55) {
    return {
      grade: 'Échec dur',
      title: 'Fin de partie: ruine lente',
      summary:
        'Tu survis un peu, mais tout le monde t’en veut. Tu n’as ni valeur perçue solide, ni vraie valeur ajoutée.',
      consequences: [
        'Tu perds ton appartement et tu retournes vivre chez ta tante.',
        'Le staff te boycotte, les clients fuient, les factures s’accumulent.',
      ],
      score,
    }
  }

  if (score < 70) {
    return {
      grade: 'Survie',
      title: 'Fin de partie: fragile mais vivant',
      summary:
        'Tu ne t’effondres pas, mais tu es à deux erreurs du crash. La valeur partenariale reste instable.',
      consequences: [
        'Les actionnaires te surveillent comme un stagiaire en retard.',
        'Le staff est tiède: ils restent, mais sans passion.',
      ],
      score,
    }
  }

  if (score < 85) {
    return {
      grade: 'Bien joué (mais pas safe)',
      title: 'Fin de partie: tu tiens la barre',
      summary:
        'Tu as trouvé un équilibre acceptable. Tu peux te stabiliser, mais rien n’est gagné.',
      consequences: [
        'Les clients respectent ton café, mais te jugent au prochain faux pas.',
        'Les investisseurs sont ok, mais veulent plus.',
      ],
      score,
    }
  }

  return {
    grade: 'Master',
    title: 'Happy end (rare)',
    summary:
      'Tu as maximisé la valeur perçue, la valeur ajoutée et la gouvernance. Les parties prenantes te respectent.',
    consequences: [
      'Le café devient une référence locale, tu ouvres un deuxième spot.',
      'Ton équipe est fidèle, les actionnaires investissent davantage.',
    ],
    score,
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function StatBar({ label, value, tone }) {
  return (
    <div className={`stat stat-${tone}`}>
      <div className="stat-label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat-track">
        <div className="stat-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function CafeIllustration() {
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

function CharactersIllustration() {
  return (
    <svg className="scene-illustration" viewBox="0 0 420 240" aria-hidden>
      <defs>
        <linearGradient id="charBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2efe9" />
          <stop offset="100%" stopColor="#e2d6c3" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" rx="24" fill="url(#charBg)" />
      <circle cx="120" cy="110" r="38" fill="#f6c9a7" />
      <rect x="92" y="150" width="56" height="70" rx="18" fill="#6b3c1e" />
      <circle cx="120" cy="100" r="20" fill="#1f1a16" />
      <circle cx="240" cy="110" r="38" fill="#f2b89b" />
      <rect x="210" y="150" width="60" height="70" rx="18" fill="#2b2b2b" />
      <circle cx="240" cy="100" r="20" fill="#4a2c1e" />
      <circle cx="330" cy="110" r="38" fill="#f3d2b3" />
      <rect x="300" y="150" width="60" height="70" rx="18" fill="#8b4a2b" />
      <circle cx="330" cy="100" r="20" fill="#1e1e1e" />
      <text x="120" y="210" textAnchor="middle" fontSize="12" fill="#473327" fontFamily="'Space Grotesk', sans-serif">
        Lila
      </text>
      <text x="240" y="210" textAnchor="middle" fontSize="12" fill="#473327" fontFamily="'Space Grotesk', sans-serif">
        Marco
      </text>
      <text x="330" y="210" textAnchor="middle" fontSize="12" fill="#473327" fontFamily="'Space Grotesk', sans-serif">
        Amina
      </text>
    </svg>
  )
}

function App() {
  const [screen, setScreen] = useState('home')
  const [themeId, setThemeId] = useState('cafe')
  const [stepIndex, setStepIndex] = useState(0)
  const [stats, setStats] = useState(INITIAL_STATS)
  const [history, setHistory] = useState([])
  const [result, setResult] = useState(null)
  const [flags, setFlags] = useState(new Set())
  const [activeEvent, setActiveEvent] = useState(null)

  const theme = useMemo(
    () => THEMES.find((item) => item.id === themeId),
    [themeId]
  )

  useEffect(() => {
    if (screen !== 'game') return
    const step = theme?.scenes?.[stepIndex]
    if (step?.type === 'random' && !activeEvent) {
      setActiveEvent(pickRandom(theme.randomEvents))
    }
  }, [screen, stepIndex, theme, activeEvent])

  const currentStep = theme?.scenes?.[stepIndex]
  const stepToRender =
    currentStep?.type === 'random' ? activeEvent : currentStep

  const ending = useMemo(
    () => (screen === 'end' ? getOutcome(stats, history, flags) : null),
    [screen, stats, history, flags]
  )

  const worstChoices = history.filter((item) => item.bad).slice(0, 3)
  const roast = ROASTS[history.length % ROASTS.length]

  function resetGame() {
    setStats(INITIAL_STATS)
    setHistory([])
    setResult(null)
    setFlags(new Set())
    setActiveEvent(null)
    setStepIndex(0)
    setScreen('game')
  }

  function startTheme(id) {
    setThemeId(id)
    setStats(INITIAL_STATS)
    setHistory([])
    setResult(null)
    setFlags(new Set())
    setActiveEvent(null)
    setStepIndex(0)
    setScreen('game')
  }

  function handleChoice(choice) {
    const computedEffects =
      typeof choice.effects === 'function'
        ? choice.effects({ stats, flags })
        : choice.effects

    setStats((prev) => applyEffects(prev, computedEffects))
    setHistory((prev) => [
      ...prev,
      {
        stepId: stepToRender?.id,
        label: choice.label,
        verdict: choice.verdict,
        bad: choice.bad,
      },
    ])
    if (choice.flags) {
      setFlags((prev) => {
        const next = new Set(prev)
        choice.flags.forEach((flag) => next.add(flag))
        return next
      })
    }
    setResult({
      title: choice.verdict,
      text: choice.consequence,
      effects: computedEffects || {},
    })
  }

  function handleContinue() {
    setResult(null)
    if (currentStep?.type === 'random') {
      setActiveEvent(null)
    }
    const nextIndex = stepIndex + 1
    if (nextIndex >= theme.scenes.length) {
      setScreen('end')
    } else {
      setStepIndex(nextIndex)
    }
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
        </div>
        <div className="stats-panel">
          {Object.entries(STAT_META).map(([key, meta]) => (
            <StatBar
              key={key}
              label={meta.label}
              value={stats[key]}
              tone={meta.tone}
            />
          ))}
        </div>
      </header>

      {screen === 'home' && (
        <main className="home">
          <div className="hero">
            <div>
              <h2>Choisis ton thème</h2>
              <p>
                Chaque thème reprend les mêmes mécaniques. Les choix sont
                piégés, les conséquences brutales. Rejoue jusqu’à maîtriser la
                logique.
              </p>
              <ul className="rules">
                <li>Objectif: maîtriser la valeur perçue + la valeur ajoutée.</li>
                <li>Tout le monde veut sa part: salariés, État, actionnaires.</li>
                <li>Chaque run peut finir en humiliation publique.</li>
              </ul>
            </div>
            <CafeIllustration />
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
          <section className="scene">
            <div className="scene-header">
              <div>
                <p className="eyebrow">{theme.name}</p>
                <h2>{stepToRender.title || 'Événement'}</h2>
                <p className="scene-text">{stepToRender.text}</p>
                {stepToRender.tags && (
                  <div className="tags">
                    {stepToRender.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <CharactersIllustration />
            </div>

            <div className="choices">
              {stepToRender.choices.map((choice) => (
                <button
                  key={choice.id}
                  className="choice"
                  onClick={() => handleChoice(choice)}
                  disabled={!!result}
                >
                  <span>{choice.label}</span>
                </button>
              ))}
            </div>

            {result && (
              <div className="result">
                <div>
                  <h3>{result.title}</h3>
                  <p>{result.text}</p>
                  <div className="effects">
                    {Object.entries(result.effects).map(([key, value]) => (
                      <span key={key}>
                        {STAT_META[key]?.label}: {value > 0 ? '+' : ''}
                        {value}
                      </span>
                    ))}
                  </div>
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
            <CafeIllustration />
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
            <article>
              <h3>Choix éclatés</h3>
              {worstChoices.length === 0 ? (
                <p>Pas d’erreur majeure détectée. Tu peux viser mieux.</p>
              ) : (
                <ul>
                  {worstChoices.map((item, index) => (
                    <li key={`${item.label}-${index}`}>
                      {item.verdict} — {item.label}
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
            <button className="ghost" onClick={() => setScreen('home')}>
              Retour aux thèmes
            </button>
          </div>
        </main>
      )}
    </div>
  )
}

export default App
