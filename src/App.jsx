import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STAT_META = {
  perceived: {
    label: 'Valeur perçue',
    tone: 'mint',
    help:
      'Valeur ressentie par le client (qualité, marque, prix, expérience). Ex: déco premium + latte art = VP en hausse.',
  },
  valueAdded: {
    label: 'Valeur ajoutée',
    tone: 'gold',
    help:
      'Richesse créée = CA - consommations intermédiaires. Ex: 210k - 130k = 80k.',
  },
  stakeholder: {
    label: 'Valeur partenariale',
    tone: 'sky',
    help:
      'Valeur pour salariés, clients, fournisseurs, État. Ex: salaires corrects + relation fournisseur solide.',
  },
  shareholder: {
    label: 'Valeur actionnariale',
    tone: 'rose',
    help: 'Valeur pour actionnaires (dividendes, valorisation).',
  },
  cash: {
    label: 'Trésorerie',
    tone: 'coffee',
    help:
      'Cash dispo pour payer loyers/salaires. Bas = risque de fermeture.',
  },
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
      'Tu pilotes un nouveau café “Starbuck” en centre-ville. Tout le monde attend des résultats. Mais tout n’est pas si simple.',
    intro:
      'Tu reprends un café Starbuck flambant neuf. Loyer haut, staff jeune, investisseurs impatients. Objectif: créer de la valeur perçue sans flinguer la valeur ajoutée ni allumer la guerre des parties prenantes.',
    branchPool: [
      'staffCrisis',
      'brandBacklash',
      'supplierBetrayal',
      'investorCoup',
      'spiral',
    ],
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
            branchId: 'brandBacklash',
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
            branchId: 'brandBacklash',
          },
          {
            id: 'co-branding',
            label:
              'Co-branding avec une grande chaîne locale pour gagner vite en visibilité.',
            consequence:
              'Le trafic monte, mais l’identité du café s’écrase.',
            effects: { perceived: -6, cash: 8, stakeholder: -4, shareholder: 4 },
            verdict: 'Visibilité oui, identité non.',
            bad: true,
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
            branchId: 'supplierBetrayal',
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
          {
            id: 'subscription',
            label:
              'Abonnement mensuel “boissons illimitées” sur créneaux creux.',
            consequence:
              'Tu sécurises un flux… mais ta marge devient fragile.',
            effects: { perceived: 4, cash: 6, valueAdded: -8 },
            verdict: 'Séduisant, mais dangereux pour la VA.',
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
            branchId: 'brandBacklash',
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
            branchId: 'staffCrisis',
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
            branchId: 'supplierBetrayal',
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
            branchId: 'supplierBetrayal',
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
            branchId: 'staffCrisis',
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
            branchId: 'investorCoup',
          },
          {
            id: 'fiscal-optim',
            label:
              'Optimisation fiscale agressive pour libérer plus de cash.',
            consequence:
              'Tu gagnes du cash… et tu attires l’attention.',
            effects: { cash: 10, shareholder: 6, stakeholder: -8 },
            verdict: 'Court terme brillant, long terme risqué.',
            bad: true,
            flags: ['illegal'],
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
            branchId: 'staffCrisis',
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
        id: 'random-event-1',
        type: 'random',
      },
      {
        id: 'random-event-2',
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
          {
            id: 'ambassadors',
            label:
              'Programme ambassadeurs étudiants + micro-commissions.',
            consequence:
              'Ça peut faire décoller… ou exposer les failles.',
            effects: ({ flags }) => ({
              perceived: flags.has('quality-lie') ? -12 : 6,
              stakeholder: flags.has('quality-lie') ? -6 : 4,
              cash: -4,
            }),
            verdict: 'Effet levier… ou feu d’artifice.',
          },
        ],
      },
      
    ],
    randomEvents: [
      {
        id: 'tiktok',
        title: "Et là, c'est le drame : TikTok et réputation",
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
            branchId: 'brandBacklash',
          },
        ],
      },
      {
        id: 'bean-price',
        title: "Et là, c'est le drame : explosion du prix du café",
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
            branchId: 'supplierBetrayal',
          },
        ],
      },
      {
        id: 'inspection',
        title: "Et là, c'est le drame : inspection surprise",
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
    branches: {
      staffCrisis: {
        label: 'Crise RH',
        scenes: [
          {
            id: 'staff-complaint',
            title: "Et là, c'est le drame : plainte interne",
            tags: ['Crise RH', 'Valeur partenariale'],
            text:
              'En pleine réunion, Amina lâche : “C’en est trop. Le responsable m’a mis une main aux fesses, sérieusement ?!” L’équipe se fige.',
            choices: [
              {
                id: 'external-investigation',
                label:
                  'Procédure externe + mise à pied conservatoire, communication interne cadrée.',
                consequence:
                  'Tu protèges l’équipe, mais ça coûte et ça inquiète.',
                effects: {
                  stakeholder: 14,
                  perceived: 6,
                  cash: -8,
                  shareholder: -4,
                },
                verdict: 'Tu prends la crise au sérieux.',
              },
              {
                id: 'internal-quiet',
                label:
                  'Gestion interne confidentielle + rappel immédiat des règles.',
                consequence:
                  'Tu gagnes du temps, mais tu prends un risque légal.',
                effects: { stakeholder: -10, perceived: -8, cash: 2 },
                verdict: 'Tu joues l’équilibriste.',
                bad: true,
                flags: ['coverup'],
              },
              {
                id: 'exit-deal',
                label:
                  'Accord de séparation rapide pour “protéger tout le monde”.',
                consequence:
                  'Tu règles vite, mais ça laisse un goût amer.',
                effects: { stakeholder: -6, perceived: -6, cash: -4 },
                verdict: 'Tu étouffes plutôt que régler.',
                bad: true,
                flags: ['coverup'],
              },
              {
                id: 'deny',
                label:
                  'Tu repousses la discussion: “on en reparle plus tard”.',
                consequence:
                  'Le staff explose. La confiance tombe.',
                effects: { stakeholder: -14, perceived: -10 },
                verdict: 'Tu perds le contrôle social.',
                bad: true,
                flags: ['coverup'],
              },
            ],
          },
          {
            id: 'staff-fallout',
            title: 'Voie parallèle: onde de choc',
            tags: ['Réputation', 'Gouvernance'],
            text:
              'La rumeur sort. Un média local t’appelle, le staff parle de grève. Tu gères comment ?',
            choices: [
              {
                id: 'open-comms',
                label:
                  'Communication transparente + accompagnement de la victime.',
                consequence:
                  'Tu limites le bad buzz et sécurises l’équipe.',
                effects: ({ flags }) => ({
                  stakeholder: flags.has('coverup') ? -4 : 10,
                  perceived: flags.has('coverup') ? -6 : 8,
                  cash: -6,
                }),
                verdict: 'Tu reconstruis un peu de confiance.',
              },
              {
                id: 'defensive',
                label: 'Communiqué juridique sec, sans détail.',
                consequence:
                  'Tu protèges légalement, mais tu parais froid.',
                effects: { stakeholder: -8, perceived: -6, shareholder: 4 },
                verdict: 'Tu blindes, mais tu perds l’humain.',
                bad: true,
              },
              {
                id: 'silence',
                label: 'Silence radio et focus business.',
                consequence:
                  'Les réseaux interprètent, la crise grossit.',
                effects: { perceived: -12, stakeholder: -10 },
                verdict: 'Tu laisses le vide se remplir.',
                bad: true,
              },
              {
                id: 'pressure',
                label:
                  'Tu fais pression pour éviter une plainte officielle.',
                consequence:
                  'Backfire immédiat. Le drame sort partout.',
                effects: { perceived: -18, stakeholder: -16, shareholder: -6 },
                verdict: 'C’est l’explosion.',
                bad: true,
                flags: ['illegal'],
              },
            ],
          },
        ],
      },
      brandBacklash: {
        label: 'Bad buzz',
        scenes: [
          {
            id: 'backlash-leak',
            title: "Et là, c'est le drame : leak public",
            tags: ['Réputation', 'Valeur perçue'],
            text:
              'Le hashtag #StarbuckGate explose: captures d’avis “amplifiés” et messages internes. Le lycée partage tout.',
            choices: [
              {
                id: 'public-apology',
                label:
                  'Excuses publiques + audit externe + correction immédiate.',
                consequence:
                  'Tu prends cher, mais tu montres que tu assumes.',
                effects: { perceived: 8, stakeholder: 10, cash: -10 },
                verdict: 'Tu nettoies devant tout le monde.',
              },
              {
                id: 'blame-intern',
                label:
                  'Tu mets tout sur le dos d’un stagiaire et tu “coupe la tête”.',
                consequence:
                  'Les gens voient la manip. La colère monte.',
                effects: { perceived: -14, stakeholder: -12, shareholder: 4 },
                verdict: 'Tu sacrifies un pion. Mauvais signal.',
                bad: true,
              },
              {
                id: 'buy-silence',
                label:
                  'Tu tentes d’acheter le silence des témoins clés.',
                consequence:
                  'Ça ressort. Effet boomerang violent.',
                effects: { perceived: -18, stakeholder: -16, cash: -12 },
                verdict: 'Coup bas. Tout le monde te déteste.',
                bad: true,
                flags: ['illegal'],
              },
              {
                id: 'spin',
                label: 'Tu retournes l’histoire en mode “marketing créatif”.',
                consequence:
                  'Tu peux limiter la casse… ou te ridiculiser.',
                effects: { perceived: -8, stakeholder: -6, cash: 2 },
                verdict: 'Tu fais le malin. Risqué.',
                bad: true,
              },
            ],
          },
          {
            id: 'backlash-boycott',
            title: 'Voie parallèle: boycott étudiant',
            tags: ['Communication', 'Expérience client'],
            text:
              'Le BDE appelle au boycott total. Ton CA plonge en 48h.',
            choices: [
              {
                id: 'open-forum',
                label: 'Table ronde ouverte + actions visibles dès la semaine.',
                consequence:
                  'Tu reprends un peu la main sur la perception.',
                effects: { perceived: 8, stakeholder: 8, cash: -4 },
                verdict: 'Tu regagnes du terrain.',
              },
              {
                id: 'sponsor-event',
                label: 'Sponsoriser un événement pour calmer les tensions.',
                consequence:
                  'Ça peut marcher… ou passer pour de la corruption.',
                effects: { perceived: 2, stakeholder: -4, cash: -6 },
                verdict: 'Ambigu. Pas super propre.',
                bad: true,
              },
              {
                id: 'ignore-boycott',
                label: 'Ignorer. “Ils reviendront”.',
                consequence:
                  'Ils ne reviennent pas. Le chiffre tombe.',
                effects: { perceived: -12, cash: -10, stakeholder: -6 },
                verdict: 'Tu perds la guerre d’image.',
                bad: true,
              },
              {
                id: 'counter-attack',
                label: 'Contre-attaque en pub agressive.',
                consequence:
                  'Tu chauffes la foule. Mauvais move.',
                effects: { perceived: -14, stakeholder: -10, cash: -6 },
                verdict: 'Tu nourris le bad buzz.',
                bad: true,
              },
            ],
          },
        ],
      },
      supplierBetrayal: {
        label: 'Fournisseur toxique',
        scenes: [
          {
            id: 'supplier-lot',
            title: "Et là, c'est le drame : lot défectueux",
            tags: ['Valeur ajoutée', 'Qualité'],
            text:
              'Un lot de café arrive défectueux. Si tu le sers, personne ne dira rien… mais la qualité s’écrase.',
            choices: [
              {
                id: 'recall',
                label: 'Tu retires le lot + remboursement clients.',
                consequence:
                  'Ça coûte, mais tu protèges l’image.',
                effects: { perceived: 10, cash: -12, stakeholder: 6 },
                verdict: 'Tu protèges la valeur perçue.',
              },
              {
                id: 'blend-hide',
                label: 'Tu le blends discrètement avec un lot correct.',
                consequence:
                  'Les habitués sentent la baisse.',
                effects: { perceived: -12, valueAdded: 4, stakeholder: -6 },
                verdict: 'Tu perds la confiance.',
                bad: true,
              },
              {
                id: 'serve-anyway',
                label: 'Tu sers quand même pour éviter la perte.',
                consequence:
                  'Les avis tombent, la réputation suit.',
                effects: { perceived: -16, cash: 4, stakeholder: -8 },
                verdict: 'Court terme toxique.',
                bad: true,
              },
              {
                id: 'sue-supplier',
                label: 'Tu bloques le paiement et menaces de procédure.',
                consequence:
                  'Le fournisseur coupe les livraisons.',
                effects: { cash: -6, valueAdded: -6, stakeholder: -4 },
                verdict: 'Tu déclenches une guerre.',
                bad: true,
              },
            ],
          },
          {
            id: 'supplier-fallout',
            title: 'Voie parallèle: rupture d’approvisionnement',
            tags: ['Fournisseurs', 'Valeur partenariale'],
            text:
              'Le fournisseur menace de te blacklist. Sans stock, tu fermes le comptoir.',
            choices: [
              {
                id: 'local-switch',
                label: 'Basculer sur un fournisseur local fiable.',
                consequence:
                  'Coût plus élevé, mais stabilité retrouvée.',
                effects: { perceived: 6, stakeholder: 8, cash: -8 },
                verdict: 'Tu reconstruis la confiance.',
              },
              {
                id: 'long-contract',
                label: 'Signer un contrat long terme pour geler les prix.',
                consequence:
                  'Tu sécurises, mais tu t’enfermes.',
                effects: { cash: -4, valueAdded: 6, stakeholder: -2 },
                verdict: 'Pragmatique, mais rigide.',
              },
              {
                id: 'shadow-supply',
                label: 'Passer par un circuit “off” pour tenir.',
                consequence:
                  'Risque légal et réputationnel immédiat.',
                effects: { perceived: -14, stakeholder: -12, cash: 4 },
                verdict: 'Tu joues sale.',
                bad: true,
                flags: ['illegal'],
              },
              {
                id: 'close-menu',
                label: 'Tu réduis la carte pour tenir les stocks.',
                consequence:
                  'Moins de choix, moins d’enthousiasme client.',
                effects: { perceived: -6, cash: -4, valueAdded: 4 },
                verdict: 'Tu limites la casse.',
              },
            ],
          },
        ],
      },
      investorCoup: {
        label: 'Coup des investisseurs',
        scenes: [
          {
            id: 'investor-meeting',
            title: "Et là, c'est le drame : les investisseurs débarquent",
            tags: ['Valeur actionnariale', 'Gouvernance'],
            text:
              'Les investisseurs convoquent un meeting. Ils veulent un retour immédiat ou ta tête.',
            choices: [
              {
                id: 'data-plan',
                label: 'Plan chiffré + roadmap claire + objectifs réalistes.',
                consequence:
                  'Tu regagnes un peu de crédibilité.',
                effects: { shareholder: 10, valueAdded: 6, cash: -4 },
                verdict: 'Tu reprends la main.',
              },
              {
                id: 'promise-cuts',
                label: 'Tu promets des coupes salariales pour rassurer.',
                consequence:
                  'Les investisseurs aiment. Le staff te déteste.',
                effects: { shareholder: 12, stakeholder: -12, perceived: -6 },
                verdict: 'Tu vends l’équipe.',
                bad: true,
              },
              {
                id: 'accept-dilution',
                label: 'Tu acceptes une dilution pour gagner du temps.',
                consequence:
                  'Tu sauves l’entreprise, mais tu perds le contrôle.',
                effects: { shareholder: 4, cash: 8, perceived: -2 },
                verdict: 'Tu sacrifies ton pouvoir.',
              },
              {
                id: 'bluff',
                label: 'Tu bluffes sur des résultats à venir.',
                consequence:
                  'S’ils découvrent le mensonge, c’est fini.',
                effects: { shareholder: -8, perceived: -6 },
                verdict: 'Tu joues la roulette.',
                bad: true,
              },
            ],
          },
          {
            id: 'investor-vote',
            title: 'Voie parallèle: vote décisif',
            tags: ['Actionnaires', 'Partenaires'],
            text:
              'Un vote interne se prépare. Tu peux influencer le résultat.',
            choices: [
              {
                id: 'open-books',
                label: 'Tu ouvres les comptes aux salariés pour aligner tout le monde.',
                consequence:
                  'Tu renforces la confiance interne, mais les investisseurs tiquent.',
                effects: { stakeholder: 10, shareholder: -6, perceived: 4 },
                verdict: 'Tu gagnes les équipes.',
              },
              {
                id: 'side-deals',
                label: 'Tu négocies en privé pour sauver ta place.',
                consequence:
                  'Tu peux survivre… en trahissant des gens.',
                effects: { shareholder: 6, stakeholder: -8, perceived: -4 },
                verdict: 'Tu survies, mais ça laisse des traces.',
                bad: true,
              },
              {
                id: 'step-aside',
                label: 'Tu proposes de te retirer contre un plan propre.',
                consequence:
                  'Tu sauves l’entreprise, pas ton ego.',
                effects: { stakeholder: 8, shareholder: 8, perceived: 2 },
                verdict: 'Décision mature.',
              },
              {
                id: 'threaten',
                label: 'Tu menaces de partir et de tout révéler.',
                consequence:
                  'Tension extrême. Tout peut exploser.',
                effects: { stakeholder: -10, shareholder: -10, perceived: -6 },
                verdict: 'Tu mets le feu.',
                bad: true,
              },
            ],
          },
        ],
      },
      spiral: {
        label: 'Spirale de crise',
        scenes: [
          {
            id: 'spiral-overflow',
            title: "Et là, c'est le drame : accumulation d’erreurs",
            tags: ['Gouvernance', 'Crise'],
            text:
              'Trois choix discutables d’affilée. Les tensions explosent, tout le monde cherche un responsable.',
            choices: [
              {
                id: 'turnaround',
                label:
                  'Plan de redressement express + audit externe immédiat.',
                consequence:
                  'Tu reprends un peu la main, mais ça coûte.',
                effects: { stakeholder: 6, perceived: 4, cash: -8 },
                verdict: 'Tu tentes de limiter la casse.',
              },
              {
                id: 'scapegoat',
                label:
                  'Tu désignes un responsable interne pour calmer la foule.',
                consequence:
                  'Ça apaise sur le moment, mais détruit la confiance.',
                effects: { stakeholder: -10, perceived: -8, shareholder: 4 },
                verdict: 'Tu sacrifies quelqu’un.',
                bad: true,
              },
              {
                id: 'delay',
                label: 'Tu temporises en espérant que ça se tasse.',
                consequence:
                  'La crise s’envenime. Les rumeurs partent.',
                effects: { perceived: -12, stakeholder: -12 },
                verdict: 'Tu laisses le chaos s’installer.',
                bad: true,
              },
              {
                id: 'private-deal',
                label:
                  'Tu passes des accords discrets avec quelques leaders internes.',
                consequence:
                  'Tu sauves ta place, mais tu divises l’équipe.',
                effects: { stakeholder: -6, shareholder: 4, perceived: -4 },
                verdict: 'Solution de court terme.',
                bad: true,
              },
            ],
          },
          {
            id: 'spiral-prudhommes',
            title: 'Voie parallèle: prud’hommes',
            tags: ['RH', 'Réputation'],
            text:
              'Un groupe de salariés lance une procédure aux prud’hommes. Tu dois répondre.',
            choices: [
              {
                id: 'conciliation',
                label:
                  'Conciliation rapide + compensations claires + réforme interne.',
                consequence:
                  'Tu limites les dégâts et reconstruis un cadre.',
                effects: { stakeholder: 8, perceived: 6, cash: -10 },
                verdict: 'Tu assumes et tu répares.',
              },
              {
                id: 'legal-fight',
                label: 'Bataille juridique totale.',
                consequence:
                  'Tu peux gagner… mais la marque se dégrade.',
                effects: { shareholder: 6, stakeholder: -10, perceived: -8 },
                verdict: 'Tu gagnes la guerre, tu perds l’image.',
                bad: true,
              },
              {
                id: 'settle-quiet',
                label:
                  'Accords discrets avec clause de confidentialité.',
                consequence:
                  'Le risque baisse, mais la confiance tombe.',
                effects: { stakeholder: -8, perceived: -6, cash: -6 },
                verdict: 'Tu étouffes le feu.',
                bad: true,
                flags: ['coverup'],
              },
              {
                id: 'deny-claims',
                label: 'Tu nies tout et tu attaques publiquement.',
                consequence:
                  'Retour de flamme immédiat.',
                effects: { perceived: -14, stakeholder: -12 },
                verdict: 'Tu perds l’opinion.',
                bad: true,
              },
            ],
          },
        ],
      },
    },
  },
  {
    id: 'cosmetic',
    name: 'Cosmétique: Aura Skin',
    subtitle: 'Lancement d’une marque',
    status: 'Disponible',
    description:
      'Tu lances une marque skincare. Entre image “clean”, coûts réels et pression des investisseurs, chaque choix compte.',
    intro:
      'Aura Skin arrive sur le marché. Clients exigeants, influenceurs imprévisibles, fournisseurs à surveiller. Objectif: créer de la valeur perçue sans sacrifier la valeur ajoutée ni déclencher un scandale.',
    branchPool: [
      'influencerBacklash',
      'ingredientRecall',
      'staffCrisis',
      'investorCoup',
      'spiral',
    ],
    scenes: [
      {
        id: 'brand-briefing',
        title: "Briefing d'ouverture",
        tags: ['Valeur perçue', 'Positionnement'],
        text:
          'Tu fixes l’identité de ta marque. Tu veux être perçue comment ?',
        choices: [
          {
            id: 'clean-premium',
            label: 'Skincare premium: ingrédients clean + transparence totale.',
            consequence:
              'La valeur perçue monte, mais les coûts aussi.',
            effects: { perceived: 14, stakeholder: 6, cash: -8, valueAdded: 4 },
            verdict: 'Tu poses une base solide.',
          },
          {
            id: 'mass-cheap',
            label: 'Positionnement prix bas pour le volume.',
            consequence:
              'Le volume monte, l’image se fragilise.',
            effects: { perceived: -10, cash: 8, stakeholder: -6 },
            verdict: 'Tu joues le volume.',
            bad: true,
            branchId: 'investorCoup',
          },
          {
            id: 'claims-hype',
            label: 'Promesses “miracles” pour créer un buzz immédiat.',
            consequence:
              'Le buzz explose… et le risque aussi.',
            effects: { perceived: 6, stakeholder: -6, cash: 4 },
            verdict: 'Tu allumes la mèche.',
            bad: true,
            branchId: 'influencerBacklash',
          },
          {
            id: 'derma-partner',
            label: 'Partenariat labo dermato + preuves cliniques.',
            consequence:
              'Crédibilité forte, croissance plus lente.',
            effects: { perceived: 10, stakeholder: 8, cash: -6 },
            verdict: 'Tu gagnes en sérieux.',
          },
        ],
      },
      {
        id: 'pricing-brand',
        title: 'Prix & marque',
        tags: ['Valeur perçue', 'Prix'],
        text:
          'Tu fixes tes prix et ta promesse de marque.',
        choices: [
          {
            id: 'premium-price',
            label: 'Prix premium + storytelling “actifs rares”.',
            consequence:
              'Image haut de gamme, marge correcte.',
            effects: { perceived: 10, cash: 6, stakeholder: -2 },
            verdict: 'Tu assumes le premium.',
          },
          {
            id: 'price-war',
            label: 'Prix d’appel agressifs pour gagner des parts.',
            consequence:
              'Tu vends, mais ta VA souffre.',
            effects: { perceived: -10, valueAdded: -10, cash: 4 },
            verdict: 'Court terme facile.',
            bad: true,
            branchId: 'investorCoup',
          },
          {
            id: 'shrinkflation',
            label: 'Même prix, flacons plus petits.',
            consequence:
              'Les clients le remarquent.',
            effects: { perceived: -12, stakeholder: -6, cash: 6 },
            verdict: 'Tu perds la confiance.',
            bad: true,
            branchId: 'influencerBacklash',
          },
          {
            id: 'subscription',
            label: 'Box mensuelle pour fidéliser.',
            consequence:
              'Flux récurrent, marge fragile.',
            effects: { perceived: 4, cash: 6, valueAdded: -6 },
            verdict: 'Séduisant mais risqué.',
            bad: true,
          },
        ],
      },
      {
        id: 'measure',
        title: 'Mesure de la valeur perçue',
        tags: ['Valeur perçue', 'Mesure'],
        text:
          'Tu veux savoir ce que les clientes perçoivent vraiment.',
        choices: [
          {
            id: 'survey',
            label: 'Enquêtes + analyse des avis clients.',
            consequence:
              'Tu comprends les attentes réelles.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Approche pro.',
          },
          {
            id: 'market-study',
            label: 'Étude marché + tests prix.',
            consequence:
              'Tu ajustes ton positionnement.',
            effects: { perceived: 8, valueAdded: 4, cash: -4 },
            verdict: 'Stratégique.',
          },
          {
            id: 'vibes-only',
            label: 'Au feeling et aux trends TikTok.',
            consequence:
              'Le feeling ne suffit pas.',
            effects: { perceived: -6, valueAdded: -4 },
            verdict: 'Tu pilotes dans le brouillard.',
            bad: true,
            branchId: 'influencerBacklash',
          },
        ],
      },
      {
        id: 'production',
        title: 'Facteurs de production',
        tags: ['Travail', 'Capital'],
        text:
          'Tu choisis où investir: équipe R&D ou packaging.',
        choices: [
          {
            id: 'lab-invest',
            label: 'Investir dans le labo et la formulation.',
            consequence:
              'Qualité produit en hausse.',
            effects: { perceived: 10, stakeholder: 8, cash: -8 },
            verdict: 'Tu mises sur le fond.',
          },
          {
            id: 'packaging',
            label: 'Packaging premium + design signature.',
            consequence:
              'Image forte, qualité stable.',
            effects: { perceived: 8, cash: -6 },
            verdict: 'Tu joues la forme.',
          },
          {
            id: 'cut-rd',
            label: 'Réduire la R&D pour accélérer.',
            consequence:
              'Coûts en baisse, risques cachés.',
            effects: { perceived: -8, stakeholder: -6, cash: 8 },
            verdict: 'Tu fragilises la marque.',
            bad: true,
            branchId: 'ingredientRecall',
          },
        ],
      },
      {
        id: 'supply',
        title: 'Approvisionnement & consommations intermédiaires',
        tags: ['Valeur ajoutée', 'Fournisseurs'],
        text:
          'Tu choisis tes fournisseurs d’ingrédients.',
        choices: [
          {
            id: 'certified',
            label: 'Ingrédients certifiés + traçabilité.',
            consequence:
              'Coûts plus élevés, confiance forte.',
            effects: { perceived: 10, stakeholder: 6, cash: -8, valueAdded: 4 },
            verdict: 'Tu sécurises la qualité.',
          },
          {
            id: 'cheap-import',
            label: 'Ingrédients low-cost pour la marge.',
            consequence:
              'Tu gagnes vite, l’image se voit.',
            effects: { perceived: -10, valueAdded: 6, cash: 6, stakeholder: -4 },
            verdict: 'Risqué pour la réputation.',
            bad: true,
            branchId: 'ingredientRecall',
          },
          {
            id: 'grey-market',
            label: 'Actifs “miracle” sans transparence.',
            consequence:
              'Tu promets plus… mais tu prends un risque légal.',
            effects: { perceived: -8, cash: 6, stakeholder: -6 },
            verdict: 'Tu joues avec le feu.',
            bad: true,
            branchId: 'ingredientRecall',
          },
        ],
      },
      {
        id: 'value-added',
        title: 'Calcul de la valeur ajoutée',
        tags: ['Valeur ajoutée', 'Calcul'],
        text:
          'Chiffre d’affaires annuel: 480 000 €. Consommations intermédiaires: 310 000 €. Quelle est la valeur ajoutée ?',
        choices: [
          {
            id: 'va-correct',
            label: '170 000 €',
            consequence: 'Bonne formule: VA = CA - CI.',
            effects: { valueAdded: 14, shareholder: 4 },
            verdict: 'Solide.',
          },
          {
            id: 'va-too-high',
            label: '790 000 €',
            consequence: 'Tu additionnes tout. Non.',
            effects: { valueAdded: -12, shareholder: -4 },
            verdict: 'Tu confonds tout.',
            bad: true,
          },
          {
            id: 'va-too-low',
            label: '120 000 €',
            consequence: 'Tu as oublié une partie du CA.',
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
          'Ta VA est là. Tu la répartis comment ?',
        choices: [
          {
            id: 'balanced',
            label:
              'Salaires corrects + impôts à l’heure + dividendes modérés + réinvestissement.',
            consequence:
              'Tout le monde grogne un peu, mais personne ne te plante.',
            effects: { stakeholder: 12, shareholder: 6, cash: -4, valueAdded: 6 },
            verdict: 'Équilibré.',
          },
          {
            id: 'dividends-max',
            label:
              'Priorité aux actionnaires pour accélérer.',
            consequence:
              'Les investisseurs kiffent. L’équipe serre les dents.',
            effects: { shareholder: 18, stakeholder: -16, perceived: -6 },
            verdict: 'Actionnarial pur.',
            bad: true,
            branchId: 'investorCoup',
          },
          {
            id: 'all-staff',
            label:
              'Bonus R&D + primes staff.',
            consequence:
              'L’équipe adore, les actionnaires s’impatientent.',
            effects: { stakeholder: 16, shareholder: -14, cash: -6 },
            verdict: 'Partenariale forte.',
            bad: true,
          },
        ],
      },
      {
        id: 'governance',
        title: 'Gouvernance',
        tags: ['Gouvernance', 'Parties prenantes'],
        text:
          'Dernière étape: comment tu gouvernes la marque ?',
        choices: [
          {
            id: 'co-decision',
            label: 'Comité mixte avec R&D, marketing et partenaires.',
            consequence:
              'L’équipe se sent respectée.',
            effects: { stakeholder: 16, perceived: 6, shareholder: -6 },
            verdict: 'Partenariale solide.',
          },
          {
            id: 'shareholder-only',
            label: 'Décisions 100% actionnaires.',
            consequence:
              'Rapide, mais froid. Tensions internes.',
            effects: { shareholder: 14, stakeholder: -14, perceived: -6 },
            verdict: 'Tu vas vers le conflit.',
            bad: true,
            branchId: 'investorCoup',
          },
          {
            id: 'mix',
            label: 'Mix: objectifs financiers + feedback trimestriel.',
            consequence:
              'Tu limites la casse des deux côtés.',
            effects: { shareholder: 6, stakeholder: 8, valueAdded: 4 },
            verdict: 'Réaliste.',
          },
        ],
      },
      {
        id: 'random-event-1',
        type: 'random',
      },
      {
        id: 'random-event-2',
        type: 'random',
      },
      {
        id: 'last-push',
        title: 'Dernier push',
        tags: ['Communication', 'Expérience client'],
        text:
          'Dernière décision avant le bilan.',
        choices: [
          {
            id: 'csr',
            label: 'Programme éthique + traçabilité publique.',
            consequence:
              'Image solide, confiance long terme.',
            effects: { perceived: 10, stakeholder: 8, cash: -6 },
            verdict: 'Bonne stratégie.',
          },
          {
            id: 'influencer',
            label: 'Campagne influenceurs massive.',
            consequence:
              'Tu fais du bruit… si le produit suit.',
            effects: { perceived: 6, cash: -8 },
            verdict: 'Pari risqué.',
            bad: true,
            branchId: 'influencerBacklash',
          },
          {
            id: 'cut-costs',
            label: 'Couper encore dans les coûts.',
            consequence:
              'Marge en hausse, qualité en baisse.',
            effects: { cash: 10, stakeholder: -10, perceived: -8 },
            verdict: 'Tu fragilises la marque.',
            bad: true,
          },
          {
            id: 'limited-drop',
            label: 'Édition limitée ultra premium.',
            consequence:
              'Buzz modéré mais marge forte.',
            effects: { perceived: 8, cash: 6, valueAdded: 4 },
            verdict: 'Bon levier.',
          },
        ],
      },
    ],
    randomEvents: [
      {
        id: 'influencer-clip',
        title: "Et là, c'est le drame : avis viral",
        tags: ['Réputation', 'Valeur perçue'],
        text:
          'Une influenceuse dézingue ta crème en story.',
        choices: [
          {
            id: 'explain',
            label: 'Tu publies un décryptage transparent.',
            consequence:
              'Tu limites la casse.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Tu reprends la main.',
          },
          {
            id: 'ignore',
            label: 'Tu ignores.',
            consequence:
              'La critique devient un symbole.',
            effects: { perceived: -10, stakeholder: -6 },
            verdict: 'Tu laisses la vague grossir.',
            bad: true,
            branchId: 'influencerBacklash',
          },
          {
            id: 'attack',
            label: 'Tu attaques publiquement.',
            consequence:
              'Effet Streisand.',
            effects: { perceived: -12, stakeholder: -6 },
            verdict: 'Tu empirer tout.',
            bad: true,
            branchId: 'influencerBacklash',
          },
        ],
      },
      {
        id: 'batch-recall',
        title: "Et là, c'est le drame : lot problématique",
        tags: ['Qualité', 'Risque légal'],
        text:
          'Plusieurs clientes signalent des irritations.',
        choices: [
          {
            id: 'recall',
            label: 'Rappel immédiat + remboursement.',
            consequence:
              'Coûteux, mais tu protèges l’image.',
            effects: { perceived: 8, stakeholder: 6, cash: -10 },
            verdict: 'Tu protèges la marque.',
            branchId: 'ingredientRecall',
          },
          {
            id: 'silence',
            label: 'Tu minimises.',
            consequence:
              'La rumeur enfle.',
            effects: { perceived: -12, stakeholder: -8 },
            verdict: 'Tu perds le contrôle.',
            bad: true,
            branchId: 'ingredientRecall',
          },
          {
            id: 'legal',
            label: 'Tu bascules en mode juridique.',
            consequence:
              'Froid, mais cadré.',
            effects: { shareholder: 4, perceived: -6, stakeholder: -4 },
            verdict: 'Tu te blindes.',
            bad: true,
          },
        ],
      },
      {
        id: 'inspection',
        title: "Et là, c'est le drame : contrôle sanitaire",
        tags: ['État', 'Confiance'],
        text:
          'Inspection surprise du labo.',
        choices: [
          {
            id: 'clean',
            label: 'Tu coopères, tout est carré.',
            consequence:
              'Aucune amende.',
            effects: { stakeholder: 8, perceived: 6 },
            verdict: 'Propre.',
          },
          {
            id: 'rush-clean',
            label: 'Tu caches vite des irrégularités.',
            consequence:
              'Ils voient tout. Amende.',
            effects: { cash: -8, stakeholder: -8, perceived: -10 },
            verdict: 'Tu t’es grillé.',
            bad: true,
          },
          {
            id: 'arrangement',
            label: 'Tu proposes un arrangement discret.',
            consequence:
              'Ils te dénoncent.',
            effects: { cash: -16, stakeholder: -18, perceived: -14 },
            verdict: 'Illégal.',
            bad: true,
            flags: ['illegal'],
          },
        ],
      },
    ],
    branches: {
      influencerBacklash: {
        label: 'Bad buzz influenceurs',
        scenes: [
          {
            id: 'influencer-leak',
            title: "Et là, c'est le drame : call-out public",
            tags: ['Réputation', 'Valeur perçue'],
            text:
              'Un thread accuse ta marque de “greenwashing”.',
            choices: [
              {
                id: 'audit',
                label: 'Audit externe + transparence.',
                consequence:
                  'Tu limites les dégâts.',
                effects: { perceived: 8, stakeholder: 6, cash: -8 },
                verdict: 'Tu nettoies.',
              },
              {
                id: 'deny',
                label: 'Tu nies.',
                consequence:
                  'Ça se retourne contre toi.',
                effects: { perceived: -12, stakeholder: -6 },
                verdict: 'Tu nourris le buzz.',
                bad: true,
              },
              {
                id: 'attack',
                label: 'Tu attaques l’influenceuse.',
                consequence:
                  'Effet boomerang.',
                effects: { perceived: -14, stakeholder: -8 },
                verdict: 'Tu empirer tout.',
                bad: true,
              },
            ],
          },
          {
            id: 'boycott',
            title: 'Voie parallèle: boycott',
            tags: ['Communication', 'Expérience client'],
            text:
              'Les clientes appellent au boycott.',
            choices: [
              {
                id: 'open-dialogue',
                label: 'Dialogue public + engagement clair.',
                consequence:
                  'Tu récupères un peu de confiance.',
                effects: { perceived: 6, stakeholder: 6, cash: -4 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'ignore',
                label: 'Ignorer.',
                consequence:
                  'La marque décroche.',
                effects: { perceived: -10, cash: -8 },
                verdict: 'Tu perds la bataille.',
                bad: true,
              },
            ],
          },
        ],
      },
      ingredientRecall: {
        label: 'Crise produit',
        scenes: [
          {
            id: 'recall-start',
            title: "Et là, c'est le drame : rappel produit",
            tags: ['Qualité', 'Risque légal'],
            text:
              'Des clientes réagissent mal à un lot.',
            choices: [
              {
                id: 'recall',
                label: 'Rappel + remboursement.',
                consequence:
                  'Cher, mais image protégée.',
                effects: { perceived: 8, cash: -12, stakeholder: 6 },
                verdict: 'Tu assumes.',
              },
              {
                id: 'minimize',
                label: 'Tu minimises.',
                consequence:
                  'La rumeur enfle.',
                effects: { perceived: -12, stakeholder: -8 },
                verdict: 'Tu perds le contrôle.',
                bad: true,
              },
            ],
          },
          {
            id: 'regulator',
            title: 'Voie parallèle: enquête',
            tags: ['État', 'Confiance'],
            text:
              'Les autorités ouvrent une enquête.',
            choices: [
              {
                id: 'cooperate',
                label: 'Tu coopères totalement.',
                consequence:
                  'Tu limites les sanctions.',
                effects: { stakeholder: 6, perceived: 4, cash: -6 },
                verdict: 'Tu te blindes proprement.',
              },
              {
                id: 'lawyer',
                label: 'Tu passes en mode juridique.',
                consequence:
                  'Image froide.',
                effects: { perceived: -6, shareholder: 4, stakeholder: -4 },
                verdict: 'Tu refroidis le public.',
                bad: true,
              },
            ],
          },
        ],
      },
      staffCrisis: {
        label: 'Crise équipe',
        scenes: [
          {
            id: 'lab-revolt',
            title: "Et là, c'est le drame : le labo craque",
            tags: ['RH', 'Valeur partenariale'],
            text:
              'L’équipe R&D dénonce la pression et la baisse de qualité.',
            choices: [
              {
                id: 'mediate',
                label: 'Négociation + plan de qualité clair.',
                consequence:
                  'Tu apaises le conflit.',
                effects: { stakeholder: 10, perceived: 4, cash: -6 },
                verdict: 'Tu répares.',
              },
              {
                id: 'delay',
                label: 'Tu temporises.',
                consequence:
                  'Le conflit monte.',
                effects: { stakeholder: -10, perceived: -6 },
                verdict: 'Tu laisses monter.',
                bad: true,
              },
              {
                id: 'replace',
                label: 'Tu remplaces des profils clés.',
                consequence:
                  'Qualité en baisse.',
                effects: { perceived: -10, stakeholder: -12, cash: 4 },
                verdict: 'Tu perds la crédibilité.',
                bad: true,
              },
            ],
          },
        ],
      },
      investorCoup: {
        label: 'Coup des investisseurs',
        scenes: [
          {
            id: 'investor-meeting',
            title: "Et là, c'est le drame : pression investisseurs",
            tags: ['Valeur actionnariale', 'Gouvernance'],
            text:
              'Les investisseurs exigent une croissance explosive.',
            choices: [
              {
                id: 'data-plan',
                label: 'Plan chiffré + croissance maîtrisée.',
                consequence:
                  'Tu reprends un peu de contrôle.',
                effects: { shareholder: 10, valueAdded: 6, cash: -4 },
                verdict: 'Tu reprends la main.',
              },
              {
                id: 'promise-cuts',
                label: 'Couper dans la qualité pour la marge.',
                consequence:
                  'Investisseurs contents, clients déçus.',
                effects: { shareholder: 12, perceived: -10, stakeholder: -6 },
                verdict: 'Tu vends l’image.',
                bad: true,
              },
              {
                id: 'accept-dilution',
                label: 'Tu acceptes une dilution pour gagner du temps.',
                consequence:
                  'Tu sauves l’entreprise, pas ton contrôle.',
                effects: { shareholder: 4, cash: 8 },
                verdict: 'Tu sacrifies ton pouvoir.',
              },
            ],
          },
        ],
      },
      spiral: {
        label: 'Spirale de crise',
        scenes: [
          {
            id: 'spiral-overflow',
            title: "Et là, c'est le drame : accumulation d’erreurs",
            tags: ['Gouvernance', 'Crise'],
            text:
              'Trop d’erreurs d’affilée. Les tensions explosent.',
            choices: [
              {
                id: 'turnaround',
                label: 'Plan de redressement + audit externe.',
                consequence:
                  'Tu reprends un peu la main.',
                effects: { stakeholder: 6, perceived: 4, cash: -8 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'scapegoat',
                label: 'Tu désignes un responsable.',
                consequence:
                  'Confiance détruite.',
                effects: { stakeholder: -10, perceived: -8, shareholder: 4 },
                verdict: 'Tu sacrifies quelqu’un.',
                bad: true,
              },
            ],
          },
        ],
      },
    },
    locked: false,
  },
  {
    id: 'boxing',
    name: 'Salle de boxe: Black Corner',
    subtitle: 'Combats, sponsors, réputation',
    status: 'Disponible',
    description:
      'Tu gères une salle avec des champions. Entre performance, éthique et pression actionnariale, tout peut déraper.',
    intro:
      'La salle Black Corner monte en puissance. Sponsors, élèves et investisseurs exigent des résultats. Objectif: créer de la valeur perçue sans saboter la valeur ajoutée ni déclencher un scandale.',
    branchPool: [
      'fixFight',
      'mediaHeat',
      'staffStrike',
      'sponsorScandal',
      'dopingScandal',
      'spiral',
    ],
    scenes: [
      {
        id: 'ring-briefing',
        title: "Briefing d'ouverture",
        tags: ['Valeur perçue', 'Positionnement'],
        text:
          'Ta salle attire des jeunes et des compétiteurs. Tu fixes l’identité de départ.',
        choices: [
          {
            id: 'premium-coaching',
            label:
              'Expérience premium: coachs certifiés, suivi individualisé, nutrition.',
            consequence:
              'La salle devient crédible et aspirante, mais ça coûte.',
            effects: { perceived: 14, stakeholder: 10, cash: -10, valueAdded: 4 },
            verdict: 'Tu poses une base solide.',
          },
          {
            id: 'volume-lowcost',
            label:
              'Abonnements low-cost + volume maximum.',
            consequence:
              'Beaucoup d’inscrits, mais l’image s’use vite.',
            effects: { perceived: -10, cash: 8, stakeholder: -6 },
            verdict: 'Tu vends du volume, pas du prestige.',
            bad: true,
            branchId: 'staffStrike',
          },
          {
            id: 'trash-hype',
            label:
              'Hype par clashs et trash-talk sur les réseaux.',
            consequence:
              'Le buzz monte… et le risque aussi.',
            effects: { perceived: 6, stakeholder: -6, cash: 2 },
            verdict: 'Tu allumes la mèche.',
            bad: true,
            branchId: 'mediaHeat',
          },
          {
            id: 'school-partner',
            label:
              'Partenariat lycée sportif + entraînements encadrés.',
            consequence:
              'Tu gagnes en crédibilité locale, croissance plus lente.',
            effects: { perceived: 8, stakeholder: 8, cash: -2 },
            verdict: 'Stratégie propre et stable.',
          },
        ],
      },
      {
        id: 'pricing-brand',
        title: 'Tarifs & image',
        tags: ['Valeur perçue', 'Prix'],
        text:
          'Tu définis les offres et la promesse de marque.',
        choices: [
          {
            id: 'premium-membership',
            label:
              'Abonnement premium + accès aux combats et sparrings privés.',
            consequence:
              'Image premium assumée, mais certains trouvent ça cher.',
            effects: { perceived: 10, cash: 6, stakeholder: -2 },
            verdict: 'Tu joues la montée en gamme.',
          },
          {
            id: 'unlimited-low',
            label: 'Illimité pas cher pour remplir la salle.',
            consequence:
              'Tu remplis… mais ta marge s’effondre.',
            effects: { perceived: -6, valueAdded: -8, cash: 4 },
            verdict: 'Court terme facile, long terme fragile.',
            bad: true,
          },
          {
            id: 'hidden-fees',
            label: 'Tarifs bas + frais cachés (matériel, coaching).',
            consequence:
              'Les élèves se sentent piégés.',
            effects: { perceived: -12, stakeholder: -6, cash: 6 },
            verdict: 'Tu perds la confiance.',
            bad: true,
          },
          {
            id: 'shady-sponsor',
            label:
              'Offre sponsor agressive (boisson énergétique controversée).',
            consequence:
              'Tu fais du cash vite… mais l’image devient douteuse.',
            effects: { cash: 10, perceived: -4, stakeholder: -4 },
            verdict: 'Tu t’exposes.',
            bad: true,
            branchId: 'sponsorScandal',
          },
        ],
      },
      {
        id: 'matchmaking',
        title: 'Organisation des combats',
        tags: ['Valeur perçue', 'Actionnaires'],
        text:
          'Tu dois créer la première carte de combats. Les actionnaires veulent du spectacle rentable.',
        choices: [
          {
            id: 'fair-card',
            label: 'Combats équilibrés + respect sportif.',
            consequence:
              'Le public respecte la salle, la crédibilité monte.',
            effects: { perceived: 8, stakeholder: 4, cash: 2 },
            verdict: 'Tu joues propre.',
          },
          {
            id: 'easy-win',
            label: 'Adversaires faciles pour assurer la victoire du champion.',
            consequence:
              'Victoire facile, mais le public n’est pas dupe.',
            effects: { perceived: -6, cash: 4, shareholder: 4 },
            verdict: 'Tu protèges l’image court terme.',
            bad: true,
          },
          {
            id: 'trash-card',
            label: 'Trash-talk officiel + adversaire controversé.',
            consequence:
              'Le buzz monte… et les risques aussi.',
            effects: { perceived: 4, stakeholder: -4, cash: 4 },
            verdict: 'Tu cherches le buzz.',
            bad: true,
            branchId: 'mediaHeat',
          },
          {
            id: 'arranged-card',
            label: 'Scénario “contrôlé” pour booster les paris.',
            consequence:
              'Tu gagnes du cash, mais tu joues sale.',
            effects: { cash: 8, shareholder: 6, perceived: -10 },
            verdict: 'Tu glisses vers la magouille.',
            bad: true,
            branchId: 'fixFight',
          },
        ],
      },
      {
        id: 'measure',
        title: 'Mesure de la valeur perçue',
        tags: ['Valeur perçue', 'Mesure'],
        text:
          'Tu veux savoir ce que les élèves pensent vraiment. Tu mesures comment ?',
        choices: [
          {
            id: 'survey',
            label: 'Enquêtes de satisfaction + retours après entraînement.',
            consequence:
              'Tu comprends les attentes réelles.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Approche pro.',
          },
          {
            id: 'market-study',
            label: 'Étude locale + benchmark des salles concurrentes.',
            consequence:
              'Tu ajustes ton positionnement avec des données.',
            effects: { perceived: 8, valueAdded: 4, cash: -4 },
            verdict: 'Stratégique.',
          },
          {
            id: 'vibes-only',
            label: 'Au feeling: “les stories Insta disent tout”.',
            consequence:
              'Le feeling ne suffit pas.',
            effects: { perceived: -6, valueAdded: -4 },
            verdict: 'Tu pilotes dans le brouillard.',
            bad: true,
            branchId: 'mediaHeat',
          },
        ],
      },
      {
        id: 'production',
        title: 'Facteurs de production',
        tags: ['Travail', 'Capital'],
        text:
          'Tu dois arbitrer entre le staff et l’équipement.',
        choices: [
          {
            id: 'train-coaches',
            label: 'Former les coachs + primes à la performance.',
            consequence:
              'Qualité sportive en hausse, confiance du public.',
            effects: { perceived: 10, stakeholder: 10, cash: -8 },
            verdict: 'Tu investis dans l’humain.',
          },
          {
            id: 'gear-upgrade',
            label: 'Équiper la salle en matériel haut de gamme.',
            consequence:
              'L’image monte, mais la trésorerie souffre.',
            effects: { perceived: 12, cash: -16, valueAdded: 4 },
            verdict: 'Tu mises sur le capital.',
          },
          {
            id: 'cut-staff',
            label: 'Réduire les coachs et automatiser les programmes.',
            consequence:
              'Coûts en baisse, expérience froide.',
            effects: { perceived: -12, stakeholder: -12, cash: 8 },
            verdict: 'Tu sacrifies le lien humain.',
            bad: true,
            branchId: 'staffStrike',
          },
        ],
      },
      {
        id: 'supply',
        title: 'Approvisionnement & consommations intermédiaires',
        tags: ['Valeur ajoutée', 'Fournisseurs'],
        text:
          'Tu choisis équipementiers et produits de récupération.',
        choices: [
          {
            id: 'local-gear',
            label: 'Matériel local fiable + suivi qualité.',
            consequence:
              'Image pro, mais coûts plus élevés.',
            effects: { perceived: 8, stakeholder: 6, cash: -8, valueAdded: 4 },
            verdict: 'Tu sécurises la qualité.',
          },
          {
            id: 'cheap-gear',
            label: 'Équipement low-cost pour maximiser la marge.',
            consequence:
              'Tu gagnes vite, la qualité se voit.',
            effects: { perceived: -10, valueAdded: 6, cash: 6, stakeholder: -4 },
            verdict: 'Risqué pour l’image.',
            bad: true,
            branchId: 'mediaHeat',
          },
          {
            id: 'supplements',
            label: 'Compléments “performance” peu transparents.',
            consequence:
              'Tu promets plus… mais tu flirtes avec le scandale.',
            effects: { perceived: -8, cash: 6, stakeholder: -6 },
            verdict: 'Tu joues avec le feu.',
            bad: true,
            branchId: 'dopingScandal',
          },
        ],
      },
      {
        id: 'value-added',
        title: 'Calcul de la valeur ajoutée',
        tags: ['Valeur ajoutée', 'Calcul'],
        text:
          'Chiffre d’affaires annuel: 320 000 €. Consommations intermédiaires: 190 000 €. Quelle est la valeur ajoutée ?',
        choices: [
          {
            id: 'va-correct',
            label: '130 000 €',
            consequence: 'Bonne formule: VA = CA - CI.',
            effects: { valueAdded: 14, shareholder: 4 },
            verdict: 'Solide.',
          },
          {
            id: 'va-too-high',
            label: '510 000 €',
            consequence: 'Tu additionnes tout. Non.',
            effects: { valueAdded: -12, shareholder: -4 },
            verdict: 'Tu confonds tout.',
            bad: true,
          },
          {
            id: 'va-too-low',
            label: '90 000 €',
            consequence: 'Tu as oublié une partie du CA.',
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
          'Ta VA est là. Tu la répartis comment ?',
        choices: [
          {
            id: 'balanced',
            label:
              'Salaires corrects + impôts à l’heure + dividendes modérés + réinvestissement.',
            consequence:
              'Tout le monde grogne un peu, mais personne ne te plante.',
            effects: { stakeholder: 12, shareholder: 6, cash: -4, valueAdded: 6 },
            verdict: 'Équilibré.',
          },
          {
            id: 'dividends-max',
            label:
              'Priorité aux actionnaires pour sécuriser leurs gains.',
            consequence:
              'Les investisseurs kiffent. Le staff serre les dents.',
            effects: { shareholder: 18, stakeholder: -16, perceived: -6 },
            verdict: 'Actionnarial pur.',
            bad: true,
            branchId: 'fixFight',
          },
          {
            id: 'all-fighters',
            label:
              'Gros bonus pour les fighters + primes staff.',
            consequence:
              'L’équipe adore, les actionnaires te surveillent.',
            effects: { stakeholder: 16, shareholder: -14, cash: -6 },
            verdict: 'Partenariale musclée.',
            bad: true,
          },
        ],
      },
      {
        id: 'governance',
        title: 'Gouvernance',
        tags: ['Gouvernance', 'Parties prenantes'],
        text:
          'Dernière étape: comment tu gouvernes la salle ?',
        choices: [
          {
            id: 'co-decision',
            label: 'Comité mixte avec coachs, fighters et partenaires.',
            consequence:
              'L’équipe se sent respectée, confiance en hausse.',
            effects: { stakeholder: 16, perceived: 6, shareholder: -6 },
            verdict: 'Partenariale solide.',
          },
          {
            id: 'shareholder-only',
            label: 'Décisions 100% actionnaires.',
            consequence:
              'Rapide, mais froid. Tensions internes.',
            effects: { shareholder: 14, stakeholder: -14, perceived: -6 },
            verdict: 'Tu vas vers le conflit.',
            bad: true,
            branchId: 'fixFight',
          },
          {
            id: 'mix',
            label: 'Mix: objectifs financiers + feedback trimestriel.',
            consequence:
              'Tu limites la casse des deux côtés.',
            effects: { shareholder: 6, stakeholder: 8, valueAdded: 4 },
            verdict: 'Réaliste.',
          },
        ],
      },
      {
        id: 'random-event-1',
        type: 'random',
      },
      {
        id: 'random-event-2',
        type: 'random',
      },
      {
        id: 'last-push',
        title: 'Dernier round',
        tags: ['Communication', 'Expérience client'],
        text:
          'Dernière décision avant le bilan. Tu choisis quoi ?',
        choices: [
          {
            id: 'gala',
            label: 'Gala inter-lycées + streaming encadré.',
            consequence:
              'Tu gagnes en visibilité propre.',
            effects: { perceived: 10, stakeholder: 6, cash: 6 },
            verdict: 'Bonne montée.',
          },
          {
            id: 'underground',
            label: 'Combats “underground” pour le cash.',
            consequence:
              'Gros cash… gros risque.',
            effects: { cash: 12, perceived: -14, stakeholder: -12 },
            verdict: 'Tu flirtes avec le scandale.',
            bad: true,
            branchId: 'mediaHeat',
          },
          {
            id: 'prevention',
            label: 'Programme santé + prévention des blessures.',
            consequence:
              'Image pro, confiance long terme.',
            effects: { stakeholder: 10, perceived: 8, cash: -4 },
            verdict: 'Stratégie propre.',
          },
          {
            id: 'merch',
            label: 'Merch agressif + prix élevés.',
            consequence:
              'Tu fais du cash, mais l’image se rigidifie.',
            effects: { cash: 8, perceived: -6 },
            verdict: 'Rentable, mais risqué.',
          },
        ],
      },
    ],
    randomEvents: [
      {
        id: 'injury',
        title: "Et là, c'est le drame : blessure grave",
        tags: ['Sécurité', 'Valeur perçue'],
        text:
          'Ton champion se blesse avant un combat clé. Les billets sont vendus.',
        choices: [
          {
            id: 'postpone',
            label: 'Tu reportes le combat et rembourses partiellement.',
            consequence:
              'Tu perds du cash, mais tu respectes la sécurité.',
            effects: { perceived: 8, cash: -10, stakeholder: 6 },
            verdict: 'Tu protèges la réputation.',
          },
          {
            id: 'replace',
            label: 'Tu remplaces par un combattant moins connu.',
            consequence:
              'L’événement tient, mais la hype chute.',
            effects: { perceived: -6, cash: 4, stakeholder: -2 },
            verdict: 'Tu limites la casse.',
          },
          {
            id: 'force',
            label: 'Tu forces le combat malgré tout.',
            consequence:
              'Bad buzz immédiat si ça tourne mal.',
            effects: { perceived: -14, stakeholder: -10, cash: 6 },
            verdict: 'Tu joues avec la sécurité.',
            bad: true,
            branchId: 'mediaHeat',
          },
        ],
      },
      {
        id: 'viral-clip',
        title: "Et là, c'est le drame : vidéo virale",
        tags: ['Réputation', 'Valeur perçue'],
        text:
          'Une vidéo montre un sparring jugé trop violent. Elle tourne partout.',
        choices: [
          {
            id: 'context',
            label: 'Tu expliques le cadre et renforces la sécurité.',
            consequence:
              'La polémique retombe partiellement.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Tu reprends la main.',
          },
          {
            id: 'ignore',
            label: 'Tu ignores.',
            consequence:
              'Le clip devient un symbole négatif.',
            effects: { perceived: -10, stakeholder: -6 },
            verdict: 'Tu laisses la vague grossir.',
            bad: true,
            branchId: 'mediaHeat',
          },
          {
            id: 'attack',
            label: 'Tu attaques la personne qui a filmé.',
            consequence:
              'Effet Streisand immédiat.',
            effects: { perceived: -14, stakeholder: -8 },
            verdict: 'Tu empirer tout.',
            bad: true,
            branchId: 'mediaHeat',
          },
        ],
      },
      {
        id: 'betting-spike',
        title: "Et là, c'est le drame : paris suspects",
        tags: ['Actionnaires', 'Éthique'],
        text:
          'Les bookmakers signalent un afflux massif de paris contre ton champion.',
        choices: [
          {
            id: 'report',
            label: 'Tu signales immédiatement à la fédération.',
            consequence:
              'Tu te protèges, mais les actionnaires se crispent.',
            effects: { perceived: 6, stakeholder: 4, shareholder: -8 },
            verdict: 'Tu coupes court.',
          },
          {
            id: 'ignore',
            label: 'Tu laisses faire.',
            consequence:
              'Les rumeurs explosent.',
            effects: { perceived: -12, stakeholder: -6 },
            verdict: 'Tu perds le contrôle.',
            bad: true,
            branchId: 'fixFight',
          },
          {
            id: 'profit',
            label: 'Tu profites discrètement.',
            consequence:
              'Gros cash, gros risque.',
            effects: { cash: 10, shareholder: 8, perceived: -12 },
            verdict: 'Tu plonges dans la magouille.',
            bad: true,
            flags: ['illegal'],
            branchId: 'fixFight',
          },
        ],
      },
      {
        id: 'sponsor-leak',
        title: "Et là, c'est le drame : sponsor en crise",
        tags: ['Réputation', 'Partenaires'],
        text:
          'Ton sponsor est éclaboussé par un scandale public. Ton logo est partout.',
        choices: [
          {
            id: 'drop',
            label: 'Tu romps le contrat publiquement.',
            consequence:
              'Tu perds du cash, mais tu protèges l’image.',
            effects: { cash: -10, perceived: 8, stakeholder: 6 },
            verdict: 'Tu sauves la réputation.',
            branchId: 'sponsorScandal',
          },
          {
            id: 'silence',
            label: 'Tu restes silencieux.',
            consequence:
              'Les critiques montent.',
            effects: { perceived: -10, stakeholder: -6, cash: 4 },
            verdict: 'Tu t’enfonces.',
            bad: true,
            branchId: 'sponsorScandal',
          },
          {
            id: 'defend',
            label: 'Tu défends le sponsor.',
            consequence:
              'Tu prends la foudre avec lui.',
            effects: { perceived: -14, stakeholder: -10 },
            verdict: 'Tu coules avec.',
            bad: true,
            branchId: 'sponsorScandal',
          },
        ],
      },
      {
        id: 'doping-test',
        title: "Et là, c'est le drame : contrôle antidopage",
        tags: ['Éthique', 'Réputation'],
        text:
          'Un contrôle surprise est annoncé après un combat.',
        choices: [
          {
            id: 'cooperate',
            label: 'Tu coopères, transparence totale.',
            consequence:
              'Tu sécurises l’image, même si ça inquiète.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Tu joues clean.',
          },
          {
            id: 'delay',
            label: 'Tu demandes un report technique.',
            consequence:
              'Tu gagnes du temps, mais ça sent la magouille.',
            effects: { perceived: -8, stakeholder: -6 },
            verdict: 'Tu crées le doute.',
            bad: true,
            branchId: 'dopingScandal',
          },
          {
            id: 'deny',
            label: 'Tu contestes publiquement le contrôle.',
            consequence:
              'Les réseaux explosent.',
            effects: { perceived: -12, stakeholder: -6 },
            verdict: 'Tu attises le feu.',
            bad: true,
            branchId: 'mediaHeat',
          },
        ],
      },
      {
        id: 'inspection',
        title: "Et là, c'est le drame : inspection sécurité",
        tags: ['État', 'Confiance'],
        text:
          'Inspection surprise: sécurité, hygiène, contrats.',
        choices: [
          {
            id: 'clean',
            label: 'Tu coopères, tout est carré.',
            consequence:
              'Aucune amende.',
            effects: { stakeholder: 8, perceived: 6 },
            verdict: 'Propre.',
          },
          {
            id: 'rush-clean',
            label: 'Tu caches vite des irrégularités.',
            consequence:
              'Ils voient tout. Amende.',
            effects: { cash: -8, stakeholder: -8, perceived: -10 },
            verdict: 'Tu t’es grillé.',
            bad: true,
          },
          {
            id: 'arrangement',
            label: 'Tu proposes un arrangement discret.',
            consequence:
              'Ils te dénoncent.',
            effects: { cash: -16, stakeholder: -18, perceived: -14 },
            verdict: 'Illégal.',
            bad: true,
            flags: ['illegal'],
          },
        ],
      },
    ],
    branches: {
      fixFight: {
        label: 'Combat truqué',
        scenes: [
          {
            id: 'fix-offer',
            title: "Et là, c'est le drame : proposition des actionnaires",
            tags: ['Actionnaires', 'Éthique'],
            text:
              'Les actionnaires te poussent: “Fais perdre le champion. On mise gros.”',
            choices: [
              {
                id: 'refuse',
                label: 'Refuser net + rappeler les règles.',
                consequence:
                  'Tu protèges l’intégrité, mais tu te mets à dos les investisseurs.',
                effects: { shareholder: -10, stakeholder: 6, perceived: 6 },
                verdict: 'Tu tiens la ligne.',
              },
              {
                id: 'accept',
                label: 'Accepter discrètement.',
                consequence:
                  'Tu gagnes du cash, mais le risque explose.',
                effects: { cash: 12, shareholder: 10, perceived: -12 },
                verdict: 'Tu ouvres la boîte de Pandore.',
                bad: true,
                flags: ['illegal'],
              },
              {
                id: 'compromise',
                label: 'Combats “serré” pour éviter les soupçons.',
                consequence:
                  'Tu limites les traces… mais tu joues sale.',
                effects: { cash: 6, perceived: -6, shareholder: 6 },
                verdict: 'Tu glisses.',
                bad: true,
              },
              {
                id: 'whistle',
                label: 'Tu alertes la fédération.',
                consequence:
                  'Les actionnaires paniquent, mais tu te couvres.',
                effects: { stakeholder: 8, perceived: 4, shareholder: -12 },
                verdict: 'Tu choisis la légalité.',
              },
            ],
          },
          {
            id: 'fix-fallout',
            title: 'Voie parallèle: soupçons de match truqué',
            tags: ['Réputation', 'Risque légal'],
            text:
              'Les paris explosent et les médias parlent d’un combat “bizarre”.',
            choices: [
              {
                id: 'audit',
                label: 'Audit externe + transparence.',
                consequence:
                  'Tu limites les dégâts, mais tu perds du temps.',
                effects: { perceived: 8, stakeholder: 4, cash: -6 },
                verdict: 'Tu calmes l’incendie.',
              },
              {
                id: 'deny',
                label: 'Tu nies et tu attaques les médias.',
                consequence:
                  'Effet boomerang.',
                effects: { perceived: -12, stakeholder: -6 },
                verdict: 'Tu nourris le scandale.',
                bad: true,
              },
              {
                id: 'lawyer',
                label: 'Tu passes en mode juridique.',
                consequence:
                  'Ça protège, mais l’image se fige.',
                effects: { shareholder: 4, perceived: -6, stakeholder: -4 },
                verdict: 'Froid mais cadré.',
              },
              {
                id: 'payoff',
                label: 'Tu tentes d’étouffer les rumeurs.',
                consequence:
                  'Ça ressort pire.',
                effects: { perceived: -16, stakeholder: -10, cash: -8 },
                verdict: 'Tu empirer tout.',
                bad: true,
                flags: ['illegal'],
              },
            ],
          },
        ],
      },
      mediaHeat: {
        label: 'Bad buzz',
        scenes: [
          {
            id: 'media-clip',
            title: "Et là, c'est le drame : vidéo virale",
            tags: ['Réputation', 'Valeur perçue'],
            text:
              'Une vidéo montre un sparring trop violent. Ça tourne sur TikTok.',
            choices: [
              {
                id: 'explain',
                label: 'Tu expliques les règles + cadre sécurité.',
                consequence:
                  'Tu réduis la polémique.',
                effects: { perceived: 6, stakeholder: 4 },
                verdict: 'Tu reprends la main.',
              },
              {
                id: 'ignore',
                label: 'Tu ignores.',
                consequence:
                  'La vidéo devient un symbole négatif.',
                effects: { perceived: -10, stakeholder: -6 },
                verdict: 'Tu laisses la vague grossir.',
                bad: true,
              },
              {
                id: 'attack',
                label: 'Tu attaques la personne qui a filmé.',
                consequence:
                  'Effet Streisand immédiat.',
                effects: { perceived: -14, stakeholder: -8 },
                verdict: 'Tu empirer tout.',
                bad: true,
              },
            ],
          },
          {
            id: 'media-boycott',
            title: 'Voie parallèle: boycott local',
            tags: ['Communication', 'Expérience client'],
            text:
              'Un collectif appelle au boycott de ta salle.',
            choices: [
              {
                id: 'open-forum',
                label: 'Dialogue public + mesures visibles.',
                consequence:
                  'Tu récupères un peu de confiance.',
                effects: { perceived: 6, stakeholder: 6, cash: -4 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'sponsor-event',
                label: 'Événement sponsorisé pour détourner l’attention.',
                consequence:
                  'Peut marcher… ou aggraver.',
                effects: { perceived: 2, stakeholder: -4, cash: -6 },
                verdict: 'Ambigu.',
                bad: true,
              },
              {
                id: 'ignore-boycott',
                label: 'Ignorer.',
                consequence:
                  'Le CA chute.',
                effects: { perceived: -10, cash: -10, stakeholder: -6 },
                verdict: 'Tu perds la bataille.',
                bad: true,
              },
            ],
          },
        ],
      },
      staffStrike: {
        label: 'Crise staff',
        scenes: [
          {
            id: 'coach-revolt',
            title: "Et là, c'est le drame : les coachs craquent",
            tags: ['RH', 'Valeur partenariale'],
            text:
              'Les coachs dénoncent les heures sup et le manque de sécurité.',
            choices: [
              {
                id: 'mediate',
                label: 'Négociation + plan de charge clair.',
                consequence:
                  'Tu apaises le conflit.',
                effects: { stakeholder: 10, perceived: 4, cash: -6 },
                verdict: 'Tu répares.',
              },
              {
                id: 'delay',
                label: 'Tu temporises.',
                consequence:
                  'La grève se prépare.',
                effects: { stakeholder: -10, perceived: -6 },
                verdict: 'Tu laisses monter.',
                bad: true,
              },
              {
                id: 'replace',
                label: 'Tu remplaces des coachs clés.',
                consequence:
                  'Les élèves voient la baisse de niveau.',
                effects: { perceived: -10, stakeholder: -12, cash: 4 },
                verdict: 'Tu perds la crédibilité.',
                bad: true,
              },
            ],
          },
          {
            id: 'strike',
            title: 'Voie parallèle: grève',
            tags: ['Production', 'Réputation'],
            text:
              'Grève surprise avant un combat important.',
            choices: [
              {
                id: 'cancel',
                label: 'Annuler et négocier.',
                consequence:
                  'Perte de cash, mais tu sauves la relation.',
                effects: { cash: -8, stakeholder: 8, perceived: 4 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'force',
                label: 'Forcer l’événement avec remplaçants.',
                consequence:
                  'Qualité faible, backlash immédiat.',
                effects: { perceived: -12, stakeholder: -10 },
                verdict: 'Ça se retourne contre toi.',
                bad: true,
              },
            ],
          },
        ],
      },
      sponsorScandal: {
        label: 'Sponsor toxique',
        scenes: [
          {
            id: 'sponsor-bad',
            title: "Et là, c'est le drame : sponsor en crise",
            tags: ['Réputation', 'Partenaires'],
            text:
              'Ton sponsor est accusé de pratiques douteuses. Ton logo est partout.',
            choices: [
              {
                id: 'drop-sponsor',
                label: 'Rompre le contrat publiquement.',
                consequence:
                  'Tu perds du cash mais tu protèges l’image.',
                effects: { cash: -10, perceived: 8, stakeholder: 6 },
                verdict: 'Tu sauves la réputation.',
              },
              {
                id: 'stay-quiet',
                label: 'Rester silencieux.',
                consequence:
                  'Les critiques montent.',
                effects: { perceived: -10, stakeholder: -6, cash: 4 },
                verdict: 'Tu t’enfonces.',
                bad: true,
              },
              {
                id: 'defend',
                label: 'Défendre publiquement le sponsor.',
                consequence:
                  'Tu prends la foudre avec lui.',
                effects: { perceived: -14, stakeholder: -10 },
                verdict: 'Tu coules avec.',
                bad: true,
              },
            ],
          },
          {
            id: 'sponsor-fallout',
            title: 'Voie parallèle: perte de partenaires',
            tags: ['Finances', 'Réputation'],
            text:
              'D’autres partenaires veulent partir.',
            choices: [
              {
                id: 'reassure',
                label: 'Plan de conformité + transparence.',
                consequence:
                  'Tu récupères un peu de confiance.',
                effects: { perceived: 6, stakeholder: 4, cash: -4 },
                verdict: 'Tu stabilises.',
              },
              {
                id: 'replace-fast',
                label: 'Tu signes vite avec un autre sponsor.',
                consequence:
                  'Ça tient… mais ça sent l’urgence.',
                effects: { cash: 6, perceived: -4 },
                verdict: 'Tu colmates.',
                bad: true,
              },
            ],
          },
        ],
      },
      dopingScandal: {
        label: 'Dopage',
        scenes: [
          {
            id: 'doping-leak',
            title: "Et là, c'est le drame : soupçons de dopage",
            tags: ['Éthique', 'Réputation'],
            text:
              'Une rumeur de dopage touche un de tes fighters.',
            choices: [
              {
                id: 'test',
                label: 'Tu imposes un test interne + transparence.',
                consequence:
                  'Tu montres une ligne claire.',
                effects: { perceived: 6, stakeholder: 4, cash: -4 },
                verdict: 'Tu coupes court.',
              },
              {
                id: 'hide',
                label: 'Tu minimises pour éviter le bad buzz.',
                consequence:
                  'La rumeur enfle.',
                effects: { perceived: -10, stakeholder: -6 },
                verdict: 'Tu perds le contrôle.',
                bad: true,
              },
              {
                id: 'protect',
                label: 'Tu protèges le fighter coûte que coûte.',
                consequence:
                  'Si ça sort, c’est fini.',
                effects: { perceived: -14, stakeholder: -10, cash: 2 },
                verdict: 'Tu prends un énorme risque.',
                bad: true,
              },
            ],
          },
          {
            id: 'doping-fallout',
            title: 'Voie parallèle: sanctions',
            tags: ['Risque légal', 'Partenaires'],
            text:
              'La fédération ouvre une enquête.',
            choices: [
              {
                id: 'cooperate',
                label: 'Tu coopères totalement.',
                consequence:
                  'Tu limites les sanctions.',
                effects: { perceived: 6, stakeholder: 4, cash: -6 },
                verdict: 'Tu sauves l’image.',
              },
              {
                id: 'lawyer',
                label: 'Tu te blindes juridiquement.',
                consequence:
                  'Ça protège mais refroidit le public.',
                effects: { perceived: -6, shareholder: 4, stakeholder: -4 },
                verdict: 'Froid mais efficace.',
                bad: true,
              },
            ],
          },
        ],
      },
      spiral: {
        label: 'Spirale de crise',
        scenes: [
          {
            id: 'spiral-overflow',
            title: "Et là, c'est le drame : accumulation d’erreurs",
            tags: ['Gouvernance', 'Crise'],
            text:
              'Trois choix discutables d’affilée. Les tensions explosent.',
            choices: [
              {
                id: 'turnaround',
                label:
                  'Plan de redressement express + audit externe.',
                consequence:
                  'Tu reprends un peu la main.',
                effects: { stakeholder: 6, perceived: 4, cash: -8 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'scapegoat',
                label:
                  'Tu désignes un responsable interne.',
                consequence:
                  'Confiance détruite.',
                effects: { stakeholder: -10, perceived: -8, shareholder: 4 },
                verdict: 'Tu sacrifies quelqu’un.',
                bad: true,
              },
              {
                id: 'delay',
                label: 'Tu temporises.',
                consequence:
                  'La crise s’envenime.',
                effects: { perceived: -12, stakeholder: -12 },
                verdict: 'Tu laisses le chaos s’installer.',
                bad: true,
              },
            ],
          },
          {
            id: 'spiral-prudhommes',
            title: 'Voie parallèle: prud’hommes',
            tags: ['RH', 'Réputation'],
            text:
              'Un groupe de salariés lance une procédure aux prud’hommes.',
            choices: [
              {
                id: 'conciliation',
                label:
                  'Conciliation + réforme interne.',
                consequence:
                  'Tu limites les dégâts.',
                effects: { stakeholder: 8, perceived: 6, cash: -10 },
                verdict: 'Tu assumes.',
              },
              {
                id: 'legal-fight',
                label: 'Bataille juridique totale.',
                consequence:
                  'Image dégradée.',
                effects: { shareholder: 6, stakeholder: -10, perceived: -8 },
                verdict: 'Tu gagnes légalement, tu perds socialement.',
                bad: true,
              },
            ],
          },
        ],
      },
    },
    locked: false,
  },
  {
    id: 'football',
    name: 'Club de foot: Atlas FC',
    subtitle: 'Supporters, sponsors, résultats',
    status: 'Disponible',
    description:
      'Tu gères un club local qui veut passer pro. Entre éthique, résultats et investisseurs, le moindre choix peut exploser.',
    intro:
      'Atlas FC joue sa montée. Supporters exigeants, joueurs sous pression, actionnaires impatients. Objectif: créer de la valeur perçue sans sacrifier la valeur ajoutée ni déclencher un scandale.',
    branchPool: [
      'fixMatch',
      'ultraBacklash',
      'sponsorScandal',
      'dopingScandal',
      'spiral',
    ],
    scenes: [
      {
        id: 'season-briefing',
        title: "Briefing de saison",
        tags: ['Valeur perçue', 'Positionnement'],
        text:
          'Tu définis l’identité du club pour cette saison.',
        choices: [
          {
            id: 'academy-first',
            label: 'Miser sur le centre de formation + jeu collectif.',
            consequence:
              'Image saine, progression lente.',
            effects: { perceived: 8, stakeholder: 8, cash: -4 },
            verdict: 'Tu construis du solide.',
          },
          {
            id: 'star-signings',
            label: 'Signer des stars pour le buzz immédiat.',
            consequence:
              'La hype monte, les coûts explosent.',
            effects: { perceived: 12, cash: -12, shareholder: 4 },
            verdict: 'Tu joues la vitrine.',
            bad: true,
            branchId: 'ultraBacklash',
          },
          {
            id: 'trash-talk',
            label: 'Provoquer les rivaux pour créer une rivalité médiatique.',
            consequence:
              'Buzz rapide, tensions fortes.',
            effects: { perceived: 6, stakeholder: -6, cash: 2 },
            verdict: 'Tu allumes la mèche.',
            bad: true,
            branchId: 'ultraBacklash',
          },
          {
            id: 'community',
            label: 'Ancrage local + actions communautaires.',
            consequence:
              'Supporters fidèles, croissance lente.',
            effects: { perceived: 8, stakeholder: 10, cash: -2 },
            verdict: 'Tu renforces la base.',
          },
        ],
      },
      {
        id: 'pricing-brand',
        title: 'Billetterie & image',
        tags: ['Valeur perçue', 'Prix'],
        text:
          'Tu fixes les prix et l’expérience stade.',
        choices: [
          {
            id: 'premium-seats',
            label: 'Tarifs premium + fan experience soignée.',
            consequence:
              'Image premium, mais certains râlent.',
            effects: { perceived: 10, cash: 6, stakeholder: -2 },
            verdict: 'Tu assumes le premium.',
          },
          {
            id: 'cheap-flood',
            label: 'Prix bas pour remplir le stade.',
            consequence:
              'Volume oui, marge faible.',
            effects: { perceived: -6, valueAdded: -8, cash: 4 },
            verdict: 'Court terme facile.',
            bad: true,
            branchId: 'ultraBacklash',
          },
          {
            id: 'hidden-fees',
            label: 'Tarifs bas + frais cachés.',
            consequence:
              'Les supporters se sentent floués.',
            effects: { perceived: -12, stakeholder: -6, cash: 6 },
            verdict: 'Tu perds la confiance.',
            bad: true,
            branchId: 'ultraBacklash',
          },
          {
            id: 'sponsor-pack',
            label: 'Pack sponsor agressif pour le cash.',
            consequence:
              'Tu fais du cash vite… mais l’image se brouille.',
            effects: { cash: 10, perceived: -4, stakeholder: -4 },
            verdict: 'Tu t’exposes.',
            bad: true,
            branchId: 'sponsorScandal',
          },
        ],
      },
      {
        id: 'measure',
        title: 'Mesure de la valeur perçue',
        tags: ['Valeur perçue', 'Mesure'],
        text:
          'Tu veux savoir ce que les supporters perçoivent vraiment.',
        choices: [
          {
            id: 'survey',
            label: 'Enquêtes + analyses des avis.',
            consequence:
              'Tu comprends les attentes.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Approche pro.',
          },
          {
            id: 'market-study',
            label: 'Étude locale + benchmark des clubs.',
            consequence:
              'Tu ajustes ton positionnement.',
            effects: { perceived: 8, valueAdded: 4, cash: -4 },
            verdict: 'Stratégique.',
          },
          {
            id: 'vibes-only',
            label: 'Au feeling + tendances réseaux.',
            consequence:
              'Le feeling ne suffit pas.',
            effects: { perceived: -6, valueAdded: -4 },
            verdict: 'Tu pilotes dans le brouillard.',
            bad: true,
            branchId: 'ultraBacklash',
          },
        ],
      },
      {
        id: 'transfer',
        title: 'Mercato & effectif',
        tags: ['Valeur perçue', 'Actionnaires'],
        text:
          'Tu dois gérer le mercato.',
        choices: [
          {
            id: 'balanced-team',
            label: 'Effectif équilibré + jeunes prometteurs.',
            consequence:
              'Stabilité, progression.',
            effects: { perceived: 8, stakeholder: 6, cash: -4 },
            verdict: 'Tu sécurises le long terme.',
          },
          {
            id: 'big-star',
            label: 'Signer une star chère.',
            consequence:
              'Buzz immédiat, trésorerie tendue.',
            effects: { perceived: 12, cash: -12, shareholder: 4 },
            verdict: 'Tu joues la vitrine.',
            bad: true,
            branchId: 'sponsorScandal',
          },
          {
            id: 'agent-deal',
            label: 'Passer par un agent douteux pour “bon prix”.',
            consequence:
              'Tu gagnes du temps, tu risques un scandale.',
            effects: { perceived: -8, stakeholder: -6, cash: 4 },
            verdict: 'Tu flirtes avec le risque.',
            bad: true,
            branchId: 'dopingScandal',
          },
        ],
      },
      {
        id: 'production',
        title: 'Facteurs de production',
        tags: ['Travail', 'Capital'],
        text:
          'Tu investis dans le staff ou les infrastructures ?',
        choices: [
          {
            id: 'coaching',
            label: 'Staff technique renforcé + préparation mentale.',
            consequence:
              'Qualité sportive en hausse.',
            effects: { perceived: 10, stakeholder: 10, cash: -8 },
            verdict: 'Tu investis dans l’humain.',
          },
          {
            id: 'stadium',
            label: 'Améliorer le stade et l’expérience fan.',
            consequence:
              'Image en hausse, cash en baisse.',
            effects: { perceived: 10, cash: -14, valueAdded: 4 },
            verdict: 'Tu mises sur l’image.',
          },
          {
            id: 'cut-staff',
            label: 'Réduire le staff pour économiser.',
            consequence:
              'Performance en baisse, tensions.',
            effects: { perceived: -10, stakeholder: -12, cash: 8 },
            verdict: 'Tu fragilises l’équipe.',
            bad: true,
          },
        ],
      },
      {
        id: 'supply',
        title: 'Approvisionnement & consommations intermédiaires',
        tags: ['Valeur ajoutée', 'Fournisseurs'],
        text:
          'Tu choisis équipementier et nutrition.',
        choices: [
          {
            id: 'reliable-gear',
            label: 'Équipementier fiable + nutrition contrôlée.',
            consequence:
              'Image pro, coûts élevés.',
            effects: { perceived: 8, stakeholder: 6, cash: -8, valueAdded: 4 },
            verdict: 'Tu sécurises la qualité.',
          },
          {
            id: 'cheap-gear',
            label: 'Équipement low-cost.',
            consequence:
              'Tu gagnes vite, la qualité se voit.',
            effects: { perceived: -10, valueAdded: 6, cash: 6, stakeholder: -4 },
            verdict: 'Risqué pour l’image.',
            bad: true,
          },
          {
            id: 'supplements',
            label: 'Compléments performance peu transparents.',
            consequence:
              'Tu promets plus… mais tu flirtes avec le scandale.',
            effects: { perceived: -8, cash: 6, stakeholder: -6 },
            verdict: 'Tu joues avec le feu.',
            bad: true,
            branchId: 'dopingScandal',
          },
        ],
      },
      {
        id: 'value-added',
        title: 'Calcul de la valeur ajoutée',
        tags: ['Valeur ajoutée', 'Calcul'],
        text:
          'Chiffre d’affaires annuel: 2 500 000 €. Consommations intermédiaires: 1 600 000 €. Quelle est la valeur ajoutée ?',
        choices: [
          {
            id: 'va-correct',
            label: '900 000 €',
            consequence: 'Bonne formule: VA = CA - CI.',
            effects: { valueAdded: 14, shareholder: 4 },
            verdict: 'Solide.',
          },
          {
            id: 'va-too-high',
            label: '4 100 000 €',
            consequence: 'Tu additionnes tout. Non.',
            effects: { valueAdded: -12, shareholder: -4 },
            verdict: 'Tu confonds tout.',
            bad: true,
          },
          {
            id: 'va-too-low',
            label: '650 000 €',
            consequence: 'Tu as oublié une partie du CA.',
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
          'Ta VA est là. Tu la répartis comment ?',
        choices: [
          {
            id: 'balanced',
            label:
              'Salaires corrects + impôts à l’heure + dividendes modérés + réinvestissement.',
            consequence:
              'Tout le monde grogne un peu, mais personne ne te plante.',
            effects: { stakeholder: 12, shareholder: 6, cash: -4, valueAdded: 6 },
            verdict: 'Équilibré.',
          },
          {
            id: 'dividends-max',
            label:
              'Priorité aux actionnaires pour sécuriser leurs gains.',
            consequence:
              'Investisseurs heureux, staff frustré.',
            effects: { shareholder: 18, stakeholder: -16, perceived: -6 },
            verdict: 'Actionnarial pur.',
            bad: true,
            branchId: 'fixMatch',
          },
          {
            id: 'all-team',
            label:
              'Bonus joueurs + primes staff.',
            consequence:
              'L’équipe adore, les actionnaires s’impatientent.',
            effects: { stakeholder: 16, shareholder: -14, cash: -6 },
            verdict: 'Partenariale musclée.',
            bad: true,
          },
        ],
      },
      {
        id: 'governance',
        title: 'Gouvernance',
        tags: ['Gouvernance', 'Parties prenantes'],
        text:
          'Comment tu gouvernes le club ?',
        choices: [
          {
            id: 'co-decision',
            label: 'Comité mixte avec staff, supporters, sponsors.',
            consequence:
              'L’équipe se sent respectée.',
            effects: { stakeholder: 16, perceived: 6, shareholder: -6 },
            verdict: 'Partenariale solide.',
          },
          {
            id: 'shareholder-only',
            label: 'Décisions 100% actionnaires.',
            consequence:
              'Rapide, mais froid. Tensions internes.',
            effects: { shareholder: 14, stakeholder: -14, perceived: -6 },
            verdict: 'Tu vas vers le conflit.',
            bad: true,
            branchId: 'fixMatch',
          },
          {
            id: 'mix',
            label: 'Mix: objectifs financiers + feedback trimestriel.',
            consequence:
              'Tu limites la casse des deux côtés.',
            effects: { shareholder: 6, stakeholder: 8, valueAdded: 4 },
            verdict: 'Réaliste.',
          },
        ],
      },
      {
        id: 'random-event-1',
        type: 'random',
      },
      {
        id: 'random-event-2',
        type: 'random',
      },
      {
        id: 'last-push',
        title: 'Dernier match',
        tags: ['Communication', 'Expérience fan'],
        text:
          'Dernière décision avant le bilan.',
        choices: [
          {
            id: 'derby',
            label: 'Derby local + fan zone encadrée.',
            consequence:
              'Belle visibilité, bonne ambiance.',
            effects: { perceived: 10, stakeholder: 6, cash: 6 },
            verdict: 'Bonne montée.',
          },
          {
            id: 'underground',
            label: 'Match “arrangé” pour le cash.',
            consequence:
              'Gros cash… gros risque.',
            effects: { cash: 12, perceived: -14, stakeholder: -12 },
            verdict: 'Tu flirtes avec le scandale.',
            bad: true,
            branchId: 'fixMatch',
          },
          {
            id: 'prevention',
            label: 'Programme anti-violence + sécurité renforcée.',
            consequence:
              'Image pro, confiance long terme.',
            effects: { stakeholder: 10, perceived: 8, cash: -4 },
            verdict: 'Stratégie propre.',
          },
          {
            id: 'merch',
            label: 'Merch agressif + prix élevés.',
            consequence:
              'Cash oui, image plus froide.',
            effects: { cash: 8, perceived: -6 },
            verdict: 'Rentable, mais risqué.',
          },
        ],
      },
    ],
    randomEvents: [
      {
        id: 'injury',
        title: "Et là, c'est le drame : blessure d’un leader",
        tags: ['Sécurité', 'Valeur perçue'],
        text:
          'Ton joueur clé se blesse avant un match décisif.',
        choices: [
          {
            id: 'rest',
            label: 'Tu le préserves.',
            consequence:
              'Moins de performance, mais image saine.',
            effects: { perceived: 6, cash: -6, stakeholder: 6 },
            verdict: 'Tu protèges l’équipe.',
          },
          {
            id: 'force',
            label: 'Tu le fais jouer malgré tout.',
            consequence:
              'Risque de bad buzz.',
            effects: { perceived: -10, stakeholder: -8, cash: 4 },
            verdict: 'Tu joues avec la santé.',
            bad: true,
            branchId: 'ultraBacklash',
          },
        ],
      },
      {
        id: 'referee',
        title: "Et là, c'est le drame : arbitrage polémique",
        tags: ['Réputation', 'Supporters'],
        text:
          'Un arbitrage douteux provoque une colère des supporters.',
        choices: [
          {
            id: 'calm',
            label: 'Tu appelles au calme publiquement.',
            consequence:
              'Tu limites les dégâts.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Tu éteins un feu.',
          },
          {
            id: 'fuel',
            label: 'Tu attises la colère.',
            consequence:
              'Bad buzz et sanctions.',
            effects: { perceived: -10, stakeholder: -8 },
            verdict: 'Tu nourris le chaos.',
            bad: true,
            branchId: 'ultraBacklash',
          },
        ],
      },
      {
        id: 'betting-spike',
        title: "Et là, c'est le drame : paris suspects",
        tags: ['Actionnaires', 'Éthique'],
        text:
          'Les bookmakers signalent un afflux massif de paris contre ton club.',
        choices: [
          {
            id: 'report',
            label: 'Tu signales à la fédération.',
            consequence:
              'Tu te protèges.',
            effects: { perceived: 6, stakeholder: 4, shareholder: -8 },
            verdict: 'Tu coupes court.',
          },
          {
            id: 'ignore',
            label: 'Tu laisses faire.',
            consequence:
              'Les rumeurs explosent.',
            effects: { perceived: -12, stakeholder: -6 },
            verdict: 'Tu perds le contrôle.',
            bad: true,
            branchId: 'fixMatch',
          },
        ],
      },
      {
        id: 'doping-test',
        title: "Et là, c'est le drame : contrôle antidopage",
        tags: ['Éthique', 'Réputation'],
        text:
          'Un contrôle surprise est annoncé.',
        choices: [
          {
            id: 'cooperate',
            label: 'Tu coopères, transparence totale.',
            consequence:
              'Tu sécurises l’image.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Tu joues clean.',
          },
          {
            id: 'delay',
            label: 'Tu demandes un report technique.',
            consequence:
              'Le doute s’installe.',
            effects: { perceived: -8, stakeholder: -6 },
            verdict: 'Tu crées le doute.',
            bad: true,
            branchId: 'dopingScandal',
          },
        ],
      },
    ],
    branches: {
      fixMatch: {
        label: 'Match truqué',
        scenes: [
          {
            id: 'fix-offer',
            title: "Et là, c'est le drame : pression des actionnaires",
            tags: ['Actionnaires', 'Éthique'],
            text:
              'Les actionnaires veulent que ton club perde pour miser sur la défaite.',
            choices: [
              {
                id: 'refuse',
                label: 'Refuser net.',
                consequence:
                  'Tu protèges l’intégrité.',
                effects: { shareholder: -10, stakeholder: 6, perceived: 6 },
                verdict: 'Tu tiens la ligne.',
              },
              {
                id: 'accept',
                label: 'Accepter discrètement.',
                consequence:
                  'Cash immédiat, risque légal énorme.',
                effects: { cash: 12, shareholder: 10, perceived: -12 },
                verdict: 'Tu ouvres la boîte de Pandore.',
                bad: true,
                flags: ['illegal'],
              },
              {
                id: 'compromise',
                label: 'Match “serré” pour brouiller les pistes.',
                consequence:
                  'Tu glisses vers la magouille.',
                effects: { cash: 6, perceived: -6, shareholder: 6 },
                verdict: 'Tu joues sale.',
                bad: true,
              },
            ],
          },
          {
            id: 'fix-fallout',
            title: 'Voie parallèle: soupçons de match truqué',
            tags: ['Réputation', 'Risque légal'],
            text:
              'Les médias parlent d’un match “bizarre”.',
            choices: [
              {
                id: 'audit',
                label: 'Audit externe + transparence.',
                consequence:
                  'Tu limites les dégâts.',
                effects: { perceived: 8, stakeholder: 4, cash: -6 },
                verdict: 'Tu calmes l’incendie.',
              },
              {
                id: 'deny',
                label: 'Tu nies.',
                consequence:
                  'Effet boomerang.',
                effects: { perceived: -12, stakeholder: -6 },
                verdict: 'Tu nourris le scandale.',
                bad: true,
              },
            ],
          },
        ],
      },
      ultraBacklash: {
        label: 'Supporters en colère',
        scenes: [
          {
            id: 'ultra-clash',
            title: "Et là, c'est le drame : clash supporters",
            tags: ['Réputation', 'Valeur perçue'],
            text:
              'Les ultras lancent un boycott.',
            choices: [
              {
                id: 'dialogue',
                label: 'Dialogue public + mesures concrètes.',
                consequence:
                  'Tu récupères un peu de confiance.',
                effects: { perceived: 6, stakeholder: 6, cash: -4 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'ignore',
                label: 'Ignorer.',
                consequence:
                  'Le boycott s’étend.',
                effects: { perceived: -10, cash: -8 },
                verdict: 'Tu perds la bataille.',
                bad: true,
              },
            ],
          },
        ],
      },
      sponsorScandal: {
        label: 'Sponsor toxique',
        scenes: [
          {
            id: 'sponsor-crisis',
            title: "Et là, c'est le drame : sponsor en crise",
            tags: ['Réputation', 'Partenaires'],
            text:
              'Ton sponsor est dans un scandale public.',
            choices: [
              {
                id: 'drop',
                label: 'Rompre le contrat publiquement.',
                consequence:
                  'Cash en baisse, image sauvée.',
                effects: { cash: -10, perceived: 8, stakeholder: 6 },
                verdict: 'Tu protèges la réputation.',
              },
              {
                id: 'stay',
                label: 'Rester silencieux.',
                consequence:
                  'Les critiques montent.',
                effects: { perceived: -10, stakeholder: -6, cash: 4 },
                verdict: 'Tu t’enfonces.',
                bad: true,
              },
            ],
          },
        ],
      },
      dopingScandal: {
        label: 'Dopage',
        scenes: [
          {
            id: 'doping-leak',
            title: "Et là, c'est le drame : rumeur de dopage",
            tags: ['Éthique', 'Réputation'],
            text:
              'Une rumeur touche un joueur clé.',
            choices: [
              {
                id: 'test',
                label: 'Test interne + transparence.',
                consequence:
                  'Tu montres une ligne claire.',
                effects: { perceived: 6, stakeholder: 4, cash: -4 },
                verdict: 'Tu coupes court.',
              },
              {
                id: 'hide',
                label: 'Tu minimises.',
                consequence:
                  'La rumeur enfle.',
                effects: { perceived: -10, stakeholder: -6 },
                verdict: 'Tu perds le contrôle.',
                bad: true,
              },
            ],
          },
        ],
      },
      spiral: {
        label: 'Spirale de crise',
        scenes: [
          {
            id: 'spiral-overflow',
            title: "Et là, c'est le drame : accumulation d’erreurs",
            tags: ['Gouvernance', 'Crise'],
            text:
              'Trop d’erreurs d’affilée. Les tensions explosent.',
            choices: [
              {
                id: 'turnaround',
                label: 'Plan de redressement + audit externe.',
                consequence:
                  'Tu reprends un peu la main.',
                effects: { stakeholder: 6, perceived: 4, cash: -8 },
                verdict: 'Tu limites la casse.',
              },
              {
                id: 'scapegoat',
                label: 'Tu désignes un responsable.',
                consequence:
                  'Confiance détruite.',
                effects: { stakeholder: -10, perceived: -8, shareholder: 4 },
                verdict: 'Tu sacrifies quelqu’un.',
                bad: true,
              },
            ],
          },
        ],
      },
    },
    locked: false,
  },
  {
    id: 'art',
    name: 'Studio média: Pulse Lab',
    subtitle: 'Contenus, sponsors, réputation',
    status: 'Disponible',
    description:
      'Tu pilotes un studio de contenu. Qualité, sponsors et confiance du public s’entrechoquent.',
    intro:
      'Pulse Lab veut percer. Plateformes exigeantes, sponsors à risque, audience volatile. Objectif: créer de la valeur perçue sans sacrifier la valeur ajoutée.',
    branchPool: [
      'sponsorScandal',
      'copyrightStrike',
      'staffBurnout',
      'investorCoup',
      'spiral',
    ],
    scenes: [
      {
        id: 'studio-briefing',
        title: 'Briefing de lancement',
        tags: ['Valeur perçue', 'Positionnement'],
        text:
          'Tu fixes l’identité du studio.',
        choices: [
          {
            id: 'quality-first',
            label: 'Qualité premium + formats longs.',
            consequence:
              'Crédibilité forte, croissance lente.',
            effects: { perceived: 12, stakeholder: 6, cash: -6 },
            verdict: 'Tu poses une base solide.',
          },
          {
            id: 'clickbait',
            label: 'Clickbait + volume massif.',
            consequence:
              'Buzz rapide, confiance fragile.',
            effects: { perceived: -8, cash: 8, stakeholder: -4 },
            verdict: 'Tu joues le volume.',
            bad: true,
          },
          {
            id: 'shock-content',
            label: 'Contenus polémiques pour le buzz.',
            consequence:
              'Le buzz monte… et les risques aussi.',
            effects: { perceived: 4, stakeholder: -6, cash: 4 },
            verdict: 'Tu allumes la mèche.',
            bad: true,
            branchId: 'copyrightStrike',
          },
        ],
      },
      {
        id: 'pricing-brand',
        title: 'Monétisation',
        tags: ['Valeur perçue', 'Prix'],
        text:
          'Tu définis comment gagner de l’argent.',
        choices: [
          {
            id: 'subscription',
            label: 'Abonnements premium + contenus exclusifs.',
            consequence:
              'Image haut de gamme, croissance plus lente.',
            effects: { perceived: 10, cash: 6 },
            verdict: 'Tu assumes le premium.',
          },
          {
            id: 'ads-heavy',
            label: 'Publicité massive pour maximiser le cash.',
            consequence:
              'Cash oui, expérience utilisateur en baisse.',
            effects: { perceived: -8, valueAdded: -6, cash: 8 },
            verdict: 'Tu fragilises la marque.',
            bad: true,
          },
          {
            id: 'sponsor-deal',
            label: 'Gros sponsor exclusif.',
            consequence:
              'Cash immédiat, dépendance forte.',
            effects: { cash: 10, perceived: -4, stakeholder: -4 },
            verdict: 'Tu t’exposes.',
            bad: true,
            branchId: 'sponsorScandal',
          },
        ],
      },
      {
        id: 'measure',
        title: 'Mesure de la valeur perçue',
        tags: ['Valeur perçue', 'Mesure'],
        text:
          'Tu veux savoir ce que l’audience perçoit.',
        choices: [
          {
            id: 'survey',
            label: 'Enquêtes + analyse des commentaires.',
            consequence:
              'Tu comprends les attentes.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Approche pro.',
          },
          {
            id: 'market-study',
            label: 'Étude audience + benchmark.',
            consequence:
              'Tu ajustes ton positionnement.',
            effects: { perceived: 8, valueAdded: 4, cash: -4 },
            verdict: 'Stratégique.',
          },
          {
            id: 'vibes-only',
            label: 'Au feeling.',
            consequence:
              'Le feeling ne suffit pas.',
            effects: { perceived: -6, valueAdded: -4 },
            verdict: 'Tu pilotes dans le brouillard.',
            bad: true,
          },
        ],
      },
      {
        id: 'production',
        title: 'Facteurs de production',
        tags: ['Travail', 'Capital'],
        text:
          'Tu investis dans l’équipe ou le matériel.',
        choices: [
          {
            id: 'team-invest',
            label: 'Recruter des talents + formation.',
            consequence:
              'Qualité en hausse.',
            effects: { perceived: 10, stakeholder: 10, cash: -8 },
            verdict: 'Tu investis dans l’humain.',
          },
          {
            id: 'studio-gear',
            label: 'Matériel haut de gamme + studio premium.',
            consequence:
              'Image forte, cash en baisse.',
            effects: { perceived: 10, cash: -12, valueAdded: 4 },
            verdict: 'Tu mises sur l’image.',
          },
          {
            id: 'cut-staff',
            label: 'Réduire l’équipe pour économiser.',
            consequence:
              'Production moins stable.',
            effects: { perceived: -8, stakeholder: -12, cash: 8 },
            verdict: 'Tu fragilises la prod.',
            bad: true,
            branchId: 'staffBurnout',
          },
        ],
      },
      {
        id: 'supply',
        title: 'Licences & consommations intermédiaires',
        tags: ['Valeur ajoutée', 'Fournisseurs'],
        text:
          'Tu choisis licences et prestataires.',
        choices: [
          {
            id: 'licensed',
            label: 'Licences officielles + droits payés.',
            consequence:
              'Coûts élevés, sécurité juridique.',
            effects: { perceived: 8, stakeholder: 6, cash: -8, valueAdded: 4 },
            verdict: 'Tu sécurises le contenu.',
          },
          {
            id: 'grey-content',
            label: 'Utiliser des extraits “borderline”.',
            consequence:
              'Tu gagnes vite, risques juridiques.',
            effects: { perceived: -8, valueAdded: 6, cash: 6, stakeholder: -4 },
            verdict: 'Tu joues avec le feu.',
            bad: true,
            branchId: 'copyrightStrike',
          },
        ],
      },
      {
        id: 'value-added',
        title: 'Calcul de la valeur ajoutée',
        tags: ['Valeur ajoutée', 'Calcul'],
        text:
          'Chiffre d’affaires annuel: 620 000 €. Consommations intermédiaires: 380 000 €. Quelle est la valeur ajoutée ?',
        choices: [
          {
            id: 'va-correct',
            label: '240 000 €',
            consequence: 'Bonne formule: VA = CA - CI.',
            effects: { valueAdded: 14, shareholder: 4 },
            verdict: 'Solide.',
          },
          {
            id: 'va-too-high',
            label: '1 000 000 €',
            consequence: 'Tu additionnes tout. Non.',
            effects: { valueAdded: -12, shareholder: -4 },
            verdict: 'Tu confonds tout.',
            bad: true,
          },
          {
            id: 'va-too-low',
            label: '160 000 €',
            consequence: 'Tu as oublié une partie du CA.',
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
          'Ta VA est là. Tu la répartis comment ?',
        choices: [
          {
            id: 'balanced',
            label:
              'Salaires corrects + impôts à l’heure + dividendes modérés + réinvestissement.',
            consequence:
              'Tout le monde grogne un peu, mais personne ne te plante.',
            effects: { stakeholder: 12, shareholder: 6, cash: -4, valueAdded: 6 },
            verdict: 'Équilibré.',
          },
          {
            id: 'dividends-max',
            label:
              'Priorité aux actionnaires pour sécuriser leurs gains.',
            consequence:
              'Investisseurs heureux, équipe frustrée.',
            effects: { shareholder: 18, stakeholder: -16, perceived: -6 },
            verdict: 'Actionnarial pur.',
            bad: true,
            branchId: 'investorCoup',
          },
        ],
      },
      {
        id: 'governance',
        title: 'Gouvernance',
        tags: ['Gouvernance', 'Parties prenantes'],
        text:
          'Comment tu gouvernes le studio ?',
        choices: [
          {
            id: 'co-decision',
            label: 'Comité mixte avec équipes et partenaires.',
            consequence:
              'L’équipe se sent respectée.',
            effects: { stakeholder: 16, perceived: 6, shareholder: -6 },
            verdict: 'Partenariale solide.',
          },
          {
            id: 'shareholder-only',
            label: 'Décisions 100% actionnaires.',
            consequence:
              'Rapide, mais froid. Tensions internes.',
            effects: { shareholder: 14, stakeholder: -14, perceived: -6 },
            verdict: 'Tu vas vers le conflit.',
            bad: true,
            branchId: 'investorCoup',
          },
        ],
      },
      {
        id: 'random-event-1',
        type: 'random',
      },
      {
        id: 'random-event-2',
        type: 'random',
      },
      {
        id: 'last-push',
        title: 'Dernier push',
        tags: ['Communication', 'Expérience client'],
        text:
          'Dernière décision avant le bilan.',
        choices: [
          {
            id: 'live-event',
            label: 'Événement live + Q&A.',
            consequence:
              'Tu gagnes en proximité.',
            effects: { perceived: 8, stakeholder: 6, cash: 4 },
            verdict: 'Bonne montée.',
          },
          {
            id: 'clickbait-push',
            label: 'Série de contenus choc.',
            consequence:
              'Buzz rapide, confiance fragile.',
            effects: { perceived: -8, cash: 6 },
            verdict: 'Tu joues le buzz.',
            bad: true,
          },
        ],
      },
    ],
    randomEvents: [
      {
        id: 'copyright-strike',
        title: "Et là, c'est le drame : strike copyright",
        tags: ['Risque légal', 'Réputation'],
        text:
          'Une plateforme démonétise un contenu.',
        choices: [
          {
            id: 'remove',
            label: 'Tu retires et tu expliques.',
            consequence:
              'Tu limites les dégâts.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Tu reprends la main.',
            branchId: 'copyrightStrike',
          },
          {
            id: 'fight',
            label: 'Tu attaques la plateforme.',
            consequence:
              'Le conflit s’aggrave.',
            effects: { perceived: -10, stakeholder: -6 },
            verdict: 'Tu nourris la crise.',
            bad: true,
            branchId: 'copyrightStrike',
          },
        ],
      },
      {
        id: 'sponsor-leak',
        title: "Et là, c'est le drame : sponsor en crise",
        tags: ['Réputation', 'Partenaires'],
        text:
          'Un sponsor est éclaboussé.',
        choices: [
          {
            id: 'drop',
            label: 'Tu romps le contrat publiquement.',
            consequence:
              'Cash en baisse, image sauvée.',
            effects: { cash: -10, perceived: 8, stakeholder: 6 },
            verdict: 'Tu protèges la réputation.',
            branchId: 'sponsorScandal',
          },
          {
            id: 'silence',
            label: 'Tu restes silencieux.',
            consequence:
              'Les critiques montent.',
            effects: { perceived: -10, stakeholder: -6, cash: 4 },
            verdict: 'Tu t’enfonces.',
            bad: true,
            branchId: 'sponsorScandal',
          },
        ],
      },
      {
        id: 'algo-change',
        title: "Et là, c'est le drame : changement d’algorithme",
        tags: ['Valeur perçue', 'Cash'],
        text:
          'La plateforme réduit ta visibilité.',
        choices: [
          {
            id: 'adapt',
            label: 'Tu adaptes les formats.',
            consequence:
              'Tu limites la baisse.',
            effects: { perceived: 4, cash: -4 },
            verdict: 'Tu réagis vite.',
          },
          {
            id: 'panic',
            label: 'Tu paniques et changes tout.',
            consequence:
              'L’audience décroche.',
            effects: { perceived: -8, cash: -6 },
            verdict: 'Tu désorientes ton public.',
            bad: true,
          },
        ],
      },
    ],
    branches: {
      sponsorScandal: {
        label: 'Sponsor toxique',
        scenes: [
          {
            id: 'sponsor-crisis',
            title: "Et là, c'est le drame : sponsor en crise",
            tags: ['Réputation', 'Partenaires'],
            text:
              'Ton sponsor est dans un scandale public.',
            choices: [
              {
                id: 'drop',
                label: 'Rompre le contrat publiquement.',
                consequence:
                  'Cash en baisse, image sauvée.',
                effects: { cash: -10, perceived: 8, stakeholder: 6 },
                verdict: 'Tu protèges la réputation.',
              },
              {
                id: 'stay',
                label: 'Rester silencieux.',
                consequence:
                  'Les critiques montent.',
                effects: { perceived: -10, stakeholder: -6, cash: 4 },
                verdict: 'Tu t’enfonces.',
                bad: true,
              },
            ],
          },
        ],
      },
      copyrightStrike: {
        label: 'Copyright',
        scenes: [
          {
            id: 'strike',
            title: "Et là, c'est le drame : strike copyright",
            tags: ['Risque légal', 'Réputation'],
            text:
              'Tes contenus sont ciblés.',
            choices: [
              {
                id: 'clean',
                label: 'Tu nettoies tout et tu repartes propre.',
                consequence:
                  'Perte de cash, mais image protégée.',
                effects: { perceived: 6, cash: -6, stakeholder: 4 },
                verdict: 'Tu assumes.',
              },
              {
                id: 'hide',
                label: 'Tu contournes.',
                consequence:
                  'Risque légal énorme.',
                effects: { perceived: -10, stakeholder: -8 },
                verdict: 'Tu joues sale.',
                bad: true,
              },
            ],
          },
        ],
      },
      staffBurnout: {
        label: 'Burn-out',
        scenes: [
          {
            id: 'burnout',
            title: "Et là, c'est le drame : burn-out équipe",
            tags: ['RH', 'Valeur partenariale'],
            text:
              'L’équipe craque sous la pression.',
            choices: [
              {
                id: 'mediate',
                label: 'Réorganisation + pauses obligatoires.',
                consequence:
                  'Tu stabilises.',
                effects: { stakeholder: 10, perceived: 4, cash: -6 },
                verdict: 'Tu répares.',
              },
              {
                id: 'delay',
                label: 'Tu temporises.',
                consequence:
                  'Conflit interne.',
                effects: { stakeholder: -10, perceived: -6 },
                verdict: 'Tu laisses monter.',
                bad: true,
              },
            ],
          },
        ],
      },
      investorCoup: {
        label: 'Coup des investisseurs',
        scenes: [
          {
            id: 'investor-meeting',
            title: "Et là, c'est le drame : pression investisseurs",
            tags: ['Valeur actionnariale', 'Gouvernance'],
            text:
              'Les investisseurs exigent une croissance explosive.',
            choices: [
              {
                id: 'data-plan',
                label: 'Plan chiffré + croissance maîtrisée.',
                consequence:
                  'Tu reprends un peu de contrôle.',
                effects: { shareholder: 10, valueAdded: 6, cash: -4 },
                verdict: 'Tu reprends la main.',
              },
              {
                id: 'promise-cuts',
                label: 'Couper dans la qualité pour la marge.',
                consequence:
                  'Investisseurs contents, audience déçue.',
                effects: { shareholder: 12, perceived: -10, stakeholder: -6 },
                verdict: 'Tu vends l’image.',
                bad: true,
              },
            ],
          },
        ],
      },
      spiral: {
        label: 'Spirale de crise',
        scenes: [
          {
            id: 'spiral-overflow',
            title: "Et là, c'est le drame : accumulation d’erreurs",
            tags: ['Gouvernance', 'Crise'],
            text:
              'Trop d’erreurs d’affilée. Les tensions explosent.',
            choices: [
              {
                id: 'turnaround',
                label: 'Plan de redressement + audit externe.',
                consequence:
                  'Tu reprends un peu la main.',
                effects: { stakeholder: 6, perceived: 4, cash: -8 },
                verdict: 'Tu limites la casse.',
              },
            ],
          },
        ],
      },
    },
    locked: false,
  },
  {
    id: 'fashion',
    name: 'Mode: Atelier Velvet',
    subtitle: 'Boutique & marque',
    status: 'Disponible',
    description:
      'Tu lances une marque mode. Image, production et éthique peuvent tout faire basculer.',
    intro:
      'Atelier Velvet veut percer. Clients exigeants, fournisseurs sensibles, investisseurs pressés. Objectif: créer de la valeur perçue sans sacrifier la valeur ajoutée.',
    branchPool: [
      'factoryScandal',
      'plagiarism',
      'influencerFallout',
      'investorCoup',
      'spiral',
    ],
    scenes: [
      {
        id: 'fashion-briefing',
        title: "Briefing d'ouverture",
        tags: ['Valeur perçue', 'Positionnement'],
        text:
          'Tu fixes l’identité de la marque.',
        choices: [
          {
            id: 'premium-capsule',
            label: 'Capsules premium + séries limitées.',
            consequence:
              'Image forte, croissance lente.',
            effects: { perceived: 12, stakeholder: 6, cash: -6 },
            verdict: 'Tu poses une base solide.',
          },
          {
            id: 'fast-fashion',
            label: 'Fast fashion pour le volume.',
            consequence:
              'Volume oui, image fragile.',
            effects: { perceived: -8, cash: 8, stakeholder: -4 },
            verdict: 'Tu joues le volume.',
            bad: true,
            branchId: 'factoryScandal',
          },
          {
            id: 'trend-steal',
            label: 'Reprendre vite les tendances sans crédit.',
            consequence:
              'Buzz rapide, risque légal.',
            effects: { perceived: -6, cash: 6, stakeholder: -4 },
            verdict: 'Tu flirtes avec le plagiat.',
            bad: true,
            branchId: 'plagiarism',
          },
        ],
      },
      {
        id: 'pricing-brand',
        title: 'Prix & marque',
        tags: ['Valeur perçue', 'Prix'],
        text:
          'Tu fixes tes prix et ta promesse.',
        choices: [
          {
            id: 'premium-price',
            label: 'Prix premium + storytelling artisan.',
            consequence:
              'Image haut de gamme, marge correcte.',
            effects: { perceived: 10, cash: 6 },
            verdict: 'Tu assumes le premium.',
          },
          {
            id: 'price-war',
            label: 'Prix bas pour gagner des parts.',
            consequence:
              'Tu vends, mais la VA souffre.',
            effects: { perceived: -6, valueAdded: -8, cash: 4 },
            verdict: 'Court terme facile.',
            bad: true,
            branchId: 'factoryScandal',
          },
          {
            id: 'hidden-costs',
            label: 'Prix bas + frais cachés (livraison, retours).',
            consequence:
              'Clients mécontents.',
            effects: { perceived: -10, stakeholder: -6, cash: 6 },
            verdict: 'Tu perds la confiance.',
            bad: true,
            branchId: 'influencerFallout',
          },
        ],
      },
      {
        id: 'measure',
        title: 'Mesure de la valeur perçue',
        tags: ['Valeur perçue', 'Mesure'],
        text:
          'Tu veux savoir ce que les clientes perçoivent.',
        choices: [
          {
            id: 'survey',
            label: 'Enquêtes + analyse des avis.',
            consequence:
              'Tu comprends les attentes.',
            effects: { perceived: 6, stakeholder: 4 },
            verdict: 'Approche pro.',
          },
          {
            id: 'market-study',
            label: 'Étude marché + benchmark.',
            consequence:
              'Tu ajustes ton positionnement.',
            effects: { perceived: 8, valueAdded: 4, cash: -4 },
            verdict: 'Stratégique.',
          },
          {
            id: 'vibes-only',
            label: 'Au feeling + trends TikTok.',
            consequence:
              'Le feeling ne suffit pas.',
            effects: { perceived: -6, valueAdded: -4 },
            verdict: 'Tu pilotes dans le brouillard.',
            bad: true,
          },
        ],
      },
      {
        id: 'production',
        title: 'Facteurs de production',
        tags: ['Travail', 'Capital'],
        text:
          'Tu investis dans l’atelier ou la com ?',
        choices: [
          {
            id: 'atelier',
            label: 'Atelier local + artisans formés.',
            consequence:
              'Qualité en hausse.',
            effects: { perceived: 10, stakeholder: 10, cash: -8 },
            verdict: 'Tu investis dans l’humain.',
          },
          {
            id: 'brand-studio',
            label: 'Shooting premium + image forte.',
            consequence:
              'Image en hausse, cash en baisse.',
            effects: { perceived: 10, cash: -10, valueAdded: 4 },
            verdict: 'Tu mises sur l’image.',
          },
          {
            id: 'cut-staff',
            label: 'Réduire l’atelier pour économiser.',
            consequence:
              'Qualité en baisse.',
            effects: { perceived: -8, stakeholder: -12, cash: 8 },
            verdict: 'Tu fragilises la marque.',
            bad: true,
            branchId: 'factoryScandal',
          },
        ],
      },
      {
        id: 'supply',
        title: 'Approvisionnement & consommations intermédiaires',
        tags: ['Valeur ajoutée', 'Fournisseurs'],
        text:
          'Tu choisis tes fournisseurs textiles.',
        choices: [
          {
            id: 'ethical-fabric',
            label: 'Fournisseurs éthiques + traçabilité.',
            consequence:
              'Coûts élevés, image solide.',
            effects: { perceived: 10, stakeholder: 6, cash: -8, valueAdded: 4 },
            verdict: 'Tu sécurises la qualité.',
          },
          {
            id: 'cheap-fabric',
            label: 'Textiles low-cost.',
            consequence:
              'Tu gagnes vite, risques réputationnels.',
            effects: { perceived: -10, valueAdded: 6, cash: 6, stakeholder: -4 },
            verdict: 'Risqué pour l’image.',
            bad: true,
            branchId: 'factoryScandal',
          },
        ],
      },
      {
        id: 'value-added',
        title: 'Calcul de la valeur ajoutée',
        tags: ['Valeur ajoutée', 'Calcul'],
        text:
          'Chiffre d’affaires annuel: 520 000 €. Consommations intermédiaires: 340 000 €. Quelle est la valeur ajoutée ?',
        choices: [
          {
            id: 'va-correct',
            label: '180 000 €',
            consequence: 'Bonne formule: VA = CA - CI.',
            effects: { valueAdded: 14, shareholder: 4 },
            verdict: 'Solide.',
          },
          {
            id: 'va-too-high',
            label: '860 000 €',
            consequence: 'Tu additionnes tout. Non.',
            effects: { valueAdded: -12, shareholder: -4 },
            verdict: 'Tu confonds tout.',
            bad: true,
          },
          {
            id: 'va-too-low',
            label: '120 000 €',
            consequence: 'Tu as oublié une partie du CA.',
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
          'Ta VA est là. Tu la répartis comment ?',
        choices: [
          {
            id: 'balanced',
            label:
              'Salaires corrects + impôts à l’heure + dividendes modérés + réinvestissement.',
            consequence:
              'Tout le monde grogne un peu, mais personne ne te plante.',
            effects: { stakeholder: 12, shareholder: 6, cash: -4, valueAdded: 6 },
            verdict: 'Équilibré.',
          },
          {
            id: 'dividends-max',
            label:
              'Priorité aux actionnaires.',
            consequence:
              'Investisseurs heureux, équipe frustrée.',
            effects: { shareholder: 18, stakeholder: -16, perceived: -6 },
            verdict: 'Actionnarial pur.',
            bad: true,
            branchId: 'investorCoup',
          },
        ],
      },
      {
        id: 'governance',
        title: 'Gouvernance',
        tags: ['Gouvernance', 'Parties prenantes'],
        text:
          'Comment tu gouvernes la marque ?',
        choices: [
          {
            id: 'co-decision',
            label: 'Comité mixte avec atelier, designers, partenaires.',
            consequence:
              'L’équipe se sent respectée.',
            effects: { stakeholder: 16, perceived: 6, shareholder: -6 },
            verdict: 'Partenariale solide.',
          },
          {
            id: 'shareholder-only',
            label: 'Décisions 100% actionnaires.',
            consequence:
              'Rapide, mais froid.',
            effects: { shareholder: 14, stakeholder: -14, perceived: -6 },
            verdict: 'Tu vas vers le conflit.',
            bad: true,
            branchId: 'investorCoup',
          },
        ],
      },
      {
        id: 'random-event-1',
        type: 'random',
      },
      {
        id: 'random-event-2',
        type: 'random',
      },
      {
        id: 'last-push',
        title: 'Dernier push',
        tags: ['Communication', 'Expérience client'],
        text:
          'Dernière décision avant le bilan.',
        choices: [
          {
            id: 'limited-drop',
            label: 'Drop limité + précommande.',
            consequence:
              'Buzz maîtrisé.',
            effects: { perceived: 8, cash: 6, valueAdded: 4 },
            verdict: 'Bon levier.',
          },
          {
            id: 'influencer',
            label: 'Campagne influenceurs massive.',
            consequence:
              'Tu fais du bruit… si la qualité suit.',
            effects: { perceived: 6, cash: -8 },
            verdict: 'Pari risqué.',
            bad: true,
            branchId: 'influencerFallout',
          },
        ],
      },
    ],
    randomEvents: [
      {
        id: 'factory-leak',
        title: "Et là, c'est le drame : scandale atelier",
        tags: ['Réputation', 'Partenaires'],
        text:
          'Une enquête révèle des pratiques douteuses chez un fournisseur.',
        choices: [
          {
            id: 'drop',
            label: 'Tu romps le contrat.',
            consequence:
              'Cash en baisse, image sauvée.',
            effects: { cash: -10, perceived: 8, stakeholder: 6 },
            verdict: 'Tu protèges la réputation.',
            branchId: 'factoryScandal',
          },
          {
            id: 'stay',
            label: 'Tu restes silencieux.',
            consequence:
              'Les critiques montent.',
            effects: { perceived: -10, stakeholder: -6, cash: 4 },
            verdict: 'Tu t’enfonces.',
            bad: true,
            branchId: 'factoryScandal',
          },
        ],
      },
      {
        id: 'plagiarism-claim',
        title: "Et là, c'est le drame : accusation de plagiat",
        tags: ['Réputation', 'Risque légal'],
        text:
          'Une marque t’accuse d’avoir copié un design.',
        choices: [
          {
            id: 'apologize',
            label: 'Tu reconnais et corriges.',
            consequence:
              'Tu limites la casse.',
            effects: { perceived: 6, stakeholder: 4, cash: -6 },
            verdict: 'Tu assumes.',
            branchId: 'plagiarism',
          },
          {
            id: 'deny',
            label: 'Tu nies.',
            consequence:
              'La polémique grossit.',
            effects: { perceived: -10, stakeholder: -6 },
            verdict: 'Tu nourris le buzz.',
            bad: true,
            branchId: 'plagiarism',
          },
        ],
      },
      {
        id: 'trend-shift',
        title: "Et là, c'est le drame : tendance qui change",
        tags: ['Valeur perçue', 'Cash'],
        text:
          'La tendance bascule, tes stocks stagnent.',
        choices: [
          {
            id: 'adapt',
            label: 'Tu adaptes vite les collections.',
            consequence:
              'Tu limites la casse.',
            effects: { perceived: 4, cash: -4 },
            verdict: 'Tu réagis vite.',
          },
          {
            id: 'panic',
            label: 'Tu brades tout.',
            consequence:
              'Cash immédiat, image en baisse.',
            effects: { perceived: -8, cash: 6 },
            verdict: 'Tu dégrades la marque.',
            bad: true,
          },
        ],
      },
    ],
    branches: {
      factoryScandal: {
        label: 'Scandale fournisseur',
        scenes: [
          {
            id: 'factory-crisis',
            title: "Et là, c'est le drame : atelier dans la tourmente",
            tags: ['Réputation', 'Partenaires'],
            text:
              'Les médias parlent de conditions douteuses.',
            choices: [
              {
                id: 'audit',
                label: 'Audit externe + transparence.',
                consequence:
                  'Tu limites les dégâts.',
                effects: { perceived: 6, stakeholder: 4, cash: -6 },
                verdict: 'Tu nettoies.',
              },
              {
                id: 'deny',
                label: 'Tu nies.',
                consequence:
                  'Ça se retourne contre toi.',
                effects: { perceived: -10, stakeholder: -6 },
                verdict: 'Tu nourris le scandale.',
                bad: true,
              },
            ],
          },
        ],
      },
      plagiarism: {
        label: 'Plagiat',
        scenes: [
          {
            id: 'plagiarism-crisis',
            title: "Et là, c'est le drame : accusation de plagiat",
            tags: ['Réputation', 'Risque légal'],
            text:
              'Une marque t’accuse publiquement.',
            choices: [
              {
                id: 'settle',
                label: 'Tu règles vite et corriges.',
                consequence:
                  'Tu limites la casse.',
                effects: { perceived: 6, cash: -6, stakeholder: 4 },
                verdict: 'Tu assumes.',
              },
              {
                id: 'deny',
                label: 'Tu nies.',
                consequence:
                  'La polémique grossit.',
                effects: { perceived: -10, stakeholder: -6 },
                verdict: 'Tu perds la confiance.',
                bad: true,
              },
            ],
          },
        ],
      },
      influencerFallout: {
        label: 'Bad buzz',
        scenes: [
          {
            id: 'influencer-crisis',
            title: "Et là, c'est le drame : influenceuse en colère",
            tags: ['Réputation', 'Valeur perçue'],
            text:
              'Une influenceuse dézingue ta marque.',
            choices: [
              {
                id: 'explain',
                label: 'Tu expliques et clarifies.',
                consequence:
                  'Tu limites la casse.',
                effects: { perceived: 6, stakeholder: 4 },
                verdict: 'Tu reprends la main.',
              },
              {
                id: 'attack',
                label: 'Tu attaques publiquement.',
                consequence:
                  'Effet boomerang.',
                effects: { perceived: -12, stakeholder: -6 },
                verdict: 'Tu empirer tout.',
                bad: true,
              },
            ],
          },
        ],
      },
      investorCoup: {
        label: 'Coup des investisseurs',
        scenes: [
          {
            id: 'investor-meeting',
            title: "Et là, c'est le drame : pression investisseurs",
            tags: ['Valeur actionnariale', 'Gouvernance'],
            text:
              'Les investisseurs exigent une croissance explosive.',
            choices: [
              {
                id: 'data-plan',
                label: 'Plan chiffré + croissance maîtrisée.',
                consequence:
                  'Tu reprends un peu de contrôle.',
                effects: { shareholder: 10, valueAdded: 6, cash: -4 },
                verdict: 'Tu reprends la main.',
              },
              {
                id: 'promise-cuts',
                label: 'Couper dans la qualité pour la marge.',
                consequence:
                  'Investisseurs contents, clientes déçues.',
                effects: { shareholder: 12, perceived: -10, stakeholder: -6 },
                verdict: 'Tu vends l’image.',
                bad: true,
              },
            ],
          },
        ],
      },
      spiral: {
        label: 'Spirale de crise',
        scenes: [
          {
            id: 'spiral-overflow',
            title: "Et là, c'est le drame : accumulation d’erreurs",
            tags: ['Gouvernance', 'Crise'],
            text:
              'Trop d’erreurs d’affilée. Les tensions explosent.',
            choices: [
              {
                id: 'turnaround',
                label: 'Plan de redressement + audit externe.',
                consequence:
                  'Tu reprends un peu la main.',
                effects: { stakeholder: 6, perceived: 4, cash: -8 },
                verdict: 'Tu limites la casse.',
              },
            ],
          },
        ],
      },
    },
    locked: false,
  },
]

const ROASTS = [
  'Tes choix étaient éclatés au sol.',
  'Tu as confondu “stratégie” et “improvisation”.',
  'On dirait que tu joues avec les yeux fermés.',
  'Même ton comptable a quitté le groupe WhatsApp.',
  'Tu as créé de la valeur… pour tes concurrents.',
]

const EPILOGUES_NEG = [
  'Le manager finit aux prud’hommes, dossier public et réputation cramée.',
  'Amina et Lila quittent le café et montent un projet concurrent.',
  'Le staff se met en couple… avec tes concurrents. Humiliation totale.',
  'Le bailleur récupère les clés, fin de l’aventure.',
]

const EPILOGUES_POS = [
  'Lila et Marco se mettent en couple, l’équipe retrouve de la stabilité.',
  'Le café devient un repère local, tu ouvres un second point.',
  'Les fournisseurs te recommandent à d’autres enseignes.',
  'Un investisseur te propose un deal, mais cette fois à TES conditions.',
]

const BAD_THRESHOLD = 2
const FORCE_BRANCH_AFTER = 3

const LEXICON = [
  {
    term: 'Valeur perçue',
    definition:
      'Valeur subjective attribuée par le client (qualité, marque, prix, expérience).',
    example:
      'Ex: latte art + déco premium = perception haut de gamme.',
    context:
      'Si elle baisse, les clients désertent même si tu es “rentable”.',
  },
  {
    term: 'Valeur ajoutée',
    definition:
      'Richesse créée par l’entreprise: CA - consommations intermédiaires.',
    example: 'Ex: CA 210k - CI 130k = 80k.',
    context:
      'C’est la base pour payer salaires, impôts, dividendes, réinvestir.',
  },
  {
    term: 'Consommations intermédiaires',
    definition:
      'Achats nécessaires à la production (café, lait, services externes).',
    example: 'Ex: fournitures + maintenance machines.',
    context: 'Trop élevé = valeur ajoutée qui s’écrase.',
  },
  {
    term: 'Facteurs de production',
    definition: 'Travail (humain) + capital (matériel, équipements).',
    example: 'Ex: baristas formés + machines premium.',
    context:
      'Les deux comptent: réduire trop l’un fragilise la qualité.',
  },
  {
    term: 'Valeur partenariale',
    definition:
      'Valeur créée pour toutes les parties prenantes: salariés, clients, fournisseurs, État.',
    example: 'Ex: salaires justes + relation fournisseur stable.',
    context:
      'Si elle chute, conflits et productivité en baisse.',
  },
  {
    term: 'Valeur actionnariale',
    definition:
      'Valeur créée pour les actionnaires (dividendes, valorisation).',
    example: 'Ex: dividendes élevés pour rassurer les investisseurs.',
    context:
      'Trop privilégier = tensions sociales et réputation abîmée.',
  },
  {
    term: 'Parties prenantes',
    definition:
      'Tous les acteurs concernés par l’entreprise (salariés, clients, fournisseurs, État, actionnaires).',
    example: 'Ex: staff + clients + investisseurs.',
    context:
      'Ils peuvent soutenir ou bloquer la réussite du café.',
  },
  {
    term: 'Gouvernance',
    definition:
      'La façon dont l’entreprise est dirigée et décide (actionnariale ou partenariale).',
    example: 'Ex: comité mixte vs décisions 100% actionnaires.',
    context:
      'Une mauvaise gouvernance déclenche des crises parallèles.',
  },
  {
    term: 'Trésorerie',
    definition: 'Cash disponible pour payer charges et salaires.',
    example: 'Ex: trésorerie basse = risques de fermeture.',
    context:
      'Si elle tombe sous 20, tu entres en zone rouge.',
  },
  {
    term: 'Dividendes',
    definition: 'Part des bénéfices versée aux actionnaires.',
    example: 'Ex: dividendes élevés pour rassurer.',
    context:
      'Trop = frustration du staff et sous-investissement.',
  },
]

const GAME_MODES = [
  {
    id: 'classic',
    label: 'Mode classique',
    description: 'Joue librement sans objectifs supplémentaires.',
  },
  {
    id: 'challenge',
    label: 'Mode défis',
    description: 'Des objectifs bonus suivent ta progression.',
  },
]

const OBJECTIVES = {
  cafe: {
    primary: [
      {
        id: 'vp',
        type: 'stat',
        stat: 'perceived',
        target: 65,
        label: 'Valeur perçue ≥ 65',
      },
      {
        id: 'va',
        type: 'stat',
        stat: 'valueAdded',
        target: 60,
        label: 'Valeur ajoutée ≥ 60',
      },
      {
        id: 'vpn',
        type: 'stat',
        stat: 'stakeholder',
        target: 60,
        label: 'Valeur partenariale ≥ 60',
      },
    ],
    secondary: [
      {
        id: 'cash',
        type: 'stat',
        stat: 'cash',
        target: 55,
        label: 'Trésorerie ≥ 55',
      },
      {
        id: 'legal',
        type: 'flag',
        flag: 'illegal',
        invert: true,
        label: 'Zéro scandale légal',
      },
      {
        id: 'rh',
        type: 'branch',
        branchId: 'staffCrisis',
        invert: true,
        label: 'Éviter la crise RH',
      },
    ],
  },
  boxing: {
    primary: [
      {
        id: 'vp',
        type: 'stat',
        stat: 'perceived',
        target: 65,
        label: 'Valeur perçue ≥ 65',
      },
      {
        id: 'va',
        type: 'stat',
        stat: 'valueAdded',
        target: 60,
        label: 'Valeur ajoutée ≥ 60',
      },
      {
        id: 'vpn',
        type: 'stat',
        stat: 'stakeholder',
        target: 60,
        label: 'Valeur partenariale ≥ 60',
      },
    ],
    secondary: [
      {
        id: 'cash',
        type: 'stat',
        stat: 'cash',
        target: 55,
        label: 'Trésorerie ≥ 55',
      },
      {
        id: 'fix',
        type: 'branch',
        branchId: 'fixFight',
        invert: true,
        label: 'Éviter un combat truqué',
      },
      {
        id: 'doping',
        type: 'branch',
        branchId: 'dopingScandal',
        invert: true,
        label: 'Zéro dopage',
      },
    ],
  },
  football: {
    primary: [
      {
        id: 'vp',
        type: 'stat',
        stat: 'perceived',
        target: 65,
        label: 'Valeur perçue ≥ 65',
      },
      {
        id: 'va',
        type: 'stat',
        stat: 'valueAdded',
        target: 60,
        label: 'Valeur ajoutée ≥ 60',
      },
      {
        id: 'vpn',
        type: 'stat',
        stat: 'stakeholder',
        target: 60,
        label: 'Valeur partenariale ≥ 60',
      },
    ],
    secondary: [
      {
        id: 'cash',
        type: 'stat',
        stat: 'cash',
        target: 55,
        label: 'Trésorerie ≥ 55',
      },
      {
        id: 'fix',
        type: 'branch',
        branchId: 'fixMatch',
        invert: true,
        label: 'Éviter un match truqué',
      },
      {
        id: 'ultras',
        type: 'branch',
        branchId: 'ultraBacklash',
        invert: true,
        label: 'Supporters apaisés',
      },
    ],
  },
  cosmetic: {
    primary: [
      {
        id: 'vp',
        type: 'stat',
        stat: 'perceived',
        target: 65,
        label: 'Valeur perçue ≥ 65',
      },
      {
        id: 'va',
        type: 'stat',
        stat: 'valueAdded',
        target: 60,
        label: 'Valeur ajoutée ≥ 60',
      },
      {
        id: 'vpn',
        type: 'stat',
        stat: 'stakeholder',
        target: 60,
        label: 'Valeur partenariale ≥ 60',
      },
    ],
    secondary: [
      {
        id: 'cash',
        type: 'stat',
        stat: 'cash',
        target: 55,
        label: 'Trésorerie ≥ 55',
      },
      {
        id: 'recall',
        type: 'branch',
        branchId: 'ingredientRecall',
        invert: true,
        label: 'Éviter un rappel produit',
      },
      {
        id: 'influencers',
        type: 'branch',
        branchId: 'influencerBacklash',
        invert: true,
        label: 'Éviter le bad buzz influenceurs',
      },
    ],
  },
  fashion: {
    primary: [
      {
        id: 'vp',
        type: 'stat',
        stat: 'perceived',
        target: 65,
        label: 'Valeur perçue ≥ 65',
      },
      {
        id: 'va',
        type: 'stat',
        stat: 'valueAdded',
        target: 60,
        label: 'Valeur ajoutée ≥ 60',
      },
      {
        id: 'vpn',
        type: 'stat',
        stat: 'stakeholder',
        target: 60,
        label: 'Valeur partenariale ≥ 60',
      },
    ],
    secondary: [
      {
        id: 'cash',
        type: 'stat',
        stat: 'cash',
        target: 55,
        label: 'Trésorerie ≥ 55',
      },
      {
        id: 'factory',
        type: 'branch',
        branchId: 'factoryScandal',
        invert: true,
        label: 'Éviter un scandale fournisseur',
      },
      {
        id: 'plagiarism',
        type: 'branch',
        branchId: 'plagiarism',
        invert: true,
        label: 'Éviter un plagiat',
      },
    ],
  },
  art: {
    primary: [
      {
        id: 'vp',
        type: 'stat',
        stat: 'perceived',
        target: 65,
        label: 'Valeur perçue ≥ 65',
      },
      {
        id: 'va',
        type: 'stat',
        stat: 'valueAdded',
        target: 60,
        label: 'Valeur ajoutée ≥ 60',
      },
      {
        id: 'vpn',
        type: 'stat',
        stat: 'stakeholder',
        target: 60,
        label: 'Valeur partenariale ≥ 60',
      },
    ],
    secondary: [
      {
        id: 'cash',
        type: 'stat',
        stat: 'cash',
        target: 55,
        label: 'Trésorerie ≥ 55',
      },
      {
        id: 'copyright',
        type: 'branch',
        branchId: 'copyrightStrike',
        invert: true,
        label: 'Éviter un strike',
      },
      {
        id: 'burnout',
        type: 'branch',
        branchId: 'staffBurnout',
        invert: true,
        label: 'Équipe saine',
      },
    ],
  },
}

const PROF_COMMENTS = [
  'Avis de ton super prof : Non sérieux, t’as cru que ça allait passer inaperçu ?',
  'Avis de ton super prof : Là tu joues avec les allumettes, tu t’étonnes de la fumée.',
  'Avis de ton super prof : C’est pas une stratégie, c’est un speedrun vers le crash.',
  'Avis de ton super prof : T’as confondu court terme et suicide commercial.',
  'Avis de ton super prof : Tu vois les chiffres rouges ? C’est pas un décor.',
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

function getObjectiveState(objective, stats, flags, usedBranchIds) {
  if (!objective) return { status: 'neutral', progress: 0 }
  if (objective.type === 'stat') {
    const value = stats[objective.stat] ?? 0
    const target = objective.target ?? 0
    const progress = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0
    const status =
      value >= target ? 'ok' : value >= target - 10 ? 'warn' : 'bad'
    return { status, progress, value, target }
  }
  if (objective.type === 'flag') {
    const hasFlag = flags.has(objective.flag)
    const achieved = objective.invert ? !hasFlag : hasFlag
    return { status: achieved ? 'ok' : 'bad', progress: achieved ? 100 : 0 }
  }
  if (objective.type === 'branch') {
    const visited = usedBranchIds.includes(objective.branchId)
    const achieved = objective.invert ? !visited : visited
    return { status: achieved ? 'ok' : 'bad', progress: achieved ? 100 : 0 }
  }
  return { status: 'neutral', progress: 0 }
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

  const baseIndex = (score + history.length) % EPILOGUES_NEG.length
  const epilogueNeg = EPILOGUES_NEG[baseIndex]
  const epiloguePos = EPILOGUES_POS[baseIndex % EPILOGUES_POS.length]

  const legalNote = flags.has('coverup')
    ? 'Le dossier RH finit aux prud’hommes et les médias s’en mêlent.'
    : null

  const illegalNote = flags.has('illegal')
    ? 'Procédure pénale en vue. Les investisseurs prennent la fuite.'
    : null

  const crashReasons = []
  if (stats.cash < 25) {
    crashReasons.push(
      `Trésorerie trop basse (${stats.cash}). Les loyers ne passent plus et les fournisseurs coupent.`
    )
  }
  if (stats.perceived < 25) {
    crashReasons.push(
      `Valeur perçue au plus bas (${stats.perceived}). Les clients désertent.`
    )
  }
  if (stats.stakeholder < 25) {
    crashReasons.push(
      `Parties prenantes en rupture (${stats.stakeholder}). L’équipe lâche.`
    )
  }
  if (stats.valueAdded < 25) {
    crashReasons.push(
      `Valeur ajoutée trop faible (${stats.valueAdded}). Plus de marge de manœuvre.`
    )
  }
  if (stats.shareholder < 25) {
    crashReasons.push(
      `Actionnaires en panique (${stats.shareholder}). Ils exigent ta tête.`
    )
  }

  if (catastrophe) {
    const consequences = [
      'Le café ferme, le bailleur récupère les clés.',
      'Les salariés te lâchent et racontent tout sur les réseaux.',
      'Les actionnaires te traînent au tribunal pour “gestion éclatée”.',
      epilogueNeg,
      legalNote,
      illegalNote,
    ].filter(Boolean)
    return {
      grade: 'Catastrophe',
      title: 'Fin de partie: descente aux enfers',
      summary:
        'Tu as perdu le contrôle. Le café s’effondre, les acteurs te lâchent, la valeur perçue est morte.',
      reasons: crashReasons,
      consequences,
      score,
    }
  }

  if (score < 55) {
    const consequences = [
      'Tu perds ton appartement et tu retournes vivre chez ta tante.',
      'Le staff te boycotte, les clients fuient, les factures s’accumulent.',
      epilogueNeg,
      legalNote,
      illegalNote,
    ].filter(Boolean)
    return {
      grade: 'Échec dur',
      title: 'Fin de partie: ruine lente',
      summary:
        'Tu survis un peu, mais tout le monde t’en veut. Tu n’as ni valeur perçue solide, ni vraie valeur ajoutée.',
      reasons: crashReasons,
      consequences,
      score,
    }
  }

  if (score < 70) {
    const consequences = [
      'Les actionnaires te surveillent comme un stagiaire en retard.',
      'Le staff est tiède: ils restent, mais sans passion.',
      epiloguePos,
      legalNote,
    ].filter(Boolean)
    return {
      grade: 'Survie',
      title: 'Fin de partie: fragile mais vivant',
      summary:
        'Tu ne t’effondres pas, mais tu es à deux erreurs du crash. La valeur partenariale reste instable.',
      reasons: crashReasons,
      consequences,
      score,
    }
  }

  if (score < 85) {
    const consequences = [
      'Les clients respectent ton café, mais te jugent au prochain faux pas.',
      'Les investisseurs sont ok, mais veulent plus.',
      epiloguePos,
    ].filter(Boolean)
    return {
      grade: 'Bien joué (mais pas safe)',
      title: 'Fin de partie: tu tiens la barre',
      summary:
        'Tu as trouvé un équilibre acceptable. Tu peux te stabiliser, mais rien n’est gagné.',
      reasons: crashReasons,
      consequences,
      score,
    }
  }

  const consequences = [
    'Le café devient une référence locale, tu ouvres un deuxième spot.',
    'Ton équipe est fidèle, les actionnaires investissent davantage.',
    epiloguePos,
  ].filter(Boolean)
  return {
    grade: 'Master',
    title: 'Happy end (rare)',
    summary:
      'Tu as maximisé la valeur perçue, la valeur ajoutée et la gouvernance. Les parties prenantes te respectent.',
    reasons: [],
    consequences,
    score,
  }
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

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
  const [screen, setScreen] = useState('home')
  const [themeId, setThemeId] = useState('cafe')
  const [gameMode, setGameMode] = useState('classic')
  const [stepIndex, setStepIndex] = useState(0)
  const [stats, setStats] = useState(INITIAL_STATS)
  const [history, setHistory] = useState([])
  const [result, setResult] = useState(null)
  const [flags, setFlags] = useState(new Set())
  const [activeEvent, setActiveEvent] = useState(null)
  const [branchState, setBranchState] = useState(null)
  const [branchQueue, setBranchQueue] = useState([])
  const [usedBranchIds, setUsedBranchIds] = useState([])
  const [forcedBranchDone, setForcedBranchDone] = useState(false)
  const [lastEffects, setLastEffects] = useState(null)
  const [lastNews, setLastNews] = useState(null)
  const [lastNewsAt, setLastNewsAt] = useState(-10)
  const [shake, setShake] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [usedRandomIds, setUsedRandomIds] = useState([])

  const theme = useMemo(
    () => THEMES.find((item) => item.id === themeId),
    [themeId]
  )

  const objectives = useMemo(() => {
    if (gameMode !== 'challenge') return null
    return OBJECTIVES[themeId] || null
  }, [gameMode, themeId])

  useEffect(() => {
    if (screen !== 'game' || branchState) return
    const step = theme?.scenes?.[stepIndex]
    if (step?.type === 'random' && !activeEvent) {
      const pool = theme?.randomEvents || []
      const available = pool.filter((event) => !usedRandomIds.includes(event.id))
      const picked = pickRandom(available.length > 0 ? available : pool)
      if (!picked) return
      setActiveEvent(picked)
      setUsedRandomIds((prev) =>
        prev.includes(picked.id) ? prev : [...prev, picked.id]
      )
    }
  }, [screen, stepIndex, theme, activeEvent, branchState, usedRandomIds])

  const isBranch = Boolean(branchState)
  const currentStep = isBranch
    ? branchState?.scenes?.[branchState.index]
    : theme?.scenes?.[stepIndex]
  const stepToRender =
    !isBranch && currentStep?.type === 'random' ? activeEvent : currentStep

  const ending = useMemo(
    () => (screen === 'end' ? getOutcome(stats, history, flags) : null),
    [screen, stats, history, flags]
  )

  const worstChoices = history.filter((item) => item.bad).slice(0, 3)
  const roast = ROASTS[history.length % ROASTS.length]
  const pendingBranches = branchQueue
    .map((id) => theme?.branches?.[id]?.label || id)
    .filter(Boolean)
  const alerts = getAlerts()

  const objectiveGroups = objectives
    ? [
        { title: 'Objectifs principaux', items: objectives.primary || [] },
        { title: 'Objectifs secondaires', items: objectives.secondary || [] },
      ]
    : []

  function resetGame() {
    setStats(INITIAL_STATS)
    setHistory([])
    setResult(null)
    setFlags(new Set())
    setActiveEvent(null)
    setBranchState(null)
    setBranchQueue([])
    setUsedBranchIds([])
    setForcedBranchDone(false)
    setLastEffects(null)
    setLastNews(null)
    setLastNewsAt(-10)
    setShake(false)
    setHelpOpen(false)
    setUsedRandomIds([])
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
    setBranchState(null)
    setBranchQueue([])
    setUsedBranchIds([])
    setForcedBranchDone(false)
    setLastEffects(null)
    setLastNews(null)
    setLastNewsAt(-10)
    setShake(false)
    setHelpOpen(false)
    setUsedRandomIds([])
    setStepIndex(0)
    setScreen('game')
  }

  function queueBranch(id) {
    if (!id) return
    if (usedBranchIds.includes(id)) return
    setBranchQueue((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  function startBranch(id) {
    const branch = theme?.branches?.[id]
    if (!branch?.scenes?.length) return false
    setBranchState({
      id,
      label: branch.label,
      scenes: branch.scenes,
      index: 0,
    })
    setUsedBranchIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setForcedBranchDone(true)
    return true
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
    const computedEffects =
      typeof choice.effects === 'function'
        ? choice.effects({ stats, flags })
        : choice.effects

    const badCount = history.reduce(
      (sum, item) => sum + (item.bad ? 1 : 0),
      0
    )
    const nextBadCount = badCount + (choice.bad ? 1 : 0)
    const shouldTriggerSpiral =
      nextBadCount >= BAD_THRESHOLD && !flags.has('spiral-triggered')

    const nextStats = applyEffects(stats, computedEffects)
    setStats(nextStats)
    setLastEffects(computedEffects || null)
    const news = buildNewsFlash(
      computedEffects,
      choice,
      stats,
      nextStats,
      history.length
    )
    setLastNews(news)
    if (news) {
      setLastNewsAt(history.length)
    }
    if (computedEffects) {
      const hasNegative = Object.values(computedEffects).some(
        (value) => value < 0
      )
      if (hasNegative) {
        setShake(true)
        setTimeout(() => setShake(false), 420)
      }
    }
    setHistory((prev) => [
      ...prev,
      {
        stepId: stepToRender?.id,
        label: choice.label,
        verdict: choice.verdict,
        bad: choice.bad,
      },
    ])
    const flagsToAdd = new Set(choice.flags || [])
    if (shouldTriggerSpiral) flagsToAdd.add('spiral-triggered')
    if (flagsToAdd.size > 0) {
      setFlags((prev) => {
        const next = new Set(prev)
        flagsToAdd.forEach((flag) => next.add(flag))
        return next
      })
    }
    if (choice.branchId) {
      const branchIds = Array.isArray(choice.branchId)
        ? choice.branchId
        : [choice.branchId]
      branchIds.forEach((id) => queueBranch(id))
      setForcedBranchDone(true)
    }
    if (shouldTriggerSpiral) {
      setBranchQueue((prev) => {
        if (prev.includes('spiral')) return prev
        return [...prev, 'spiral']
      })
    }
    setResult({
      title: choice.verdict,
      text: choice.consequence,
      effects: computedEffects || {},
    })
  }

  function advanceMain() {
    if (theme?.scenes?.[stepIndex]?.type === 'random') {
      setActiveEvent(null)
    }
    const nextIndex = stepIndex + 1
    if (nextIndex >= theme.scenes.length) {
      setScreen('end')
    } else {
      setStepIndex(nextIndex)
    }
  }

  function handleContinue() {
    setResult(null)
    setLastNews(null)

    if (!branchState && branchQueue.length === 0 && !forcedBranchDone) {
      if (stepIndex >= FORCE_BRANCH_AFTER && theme?.branchPool?.length) {
        const available = theme.branchPool.filter(
          (id) => !usedBranchIds.includes(id)
        )
        const forcedId = pickRandom(
          available.length > 0 ? available : theme.branchPool
        )
        if (forcedId && startBranch(forcedId)) {
          return
        }
      }
    }

    if (branchQueue.length > 0 && !branchState) {
      const nextBranchId = branchQueue[0]
      setBranchQueue((prev) => prev.slice(1))
      if (startBranch(nextBranchId)) {
        return
      }
    }

    if (branchState) {
      if (branchState.index < branchState.scenes.length - 1) {
        setBranchState((prev) => ({ ...prev, index: prev.index + 1 }))
      } else {
        setBranchState(null)
        if (branchQueue.length > 0) {
          const nextBranchId = branchQueue[0]
          setBranchQueue((prev) => prev.slice(1))
          if (startBranch(nextBranchId)) {
            return
          }
        }
        advanceMain()
      }
      return
    }

    advanceMain()
  }

  if (!theme) return null

  return (
    <div className={`app ${shake ? 'shake' : ''}`}>
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

      {screen === 'home' && (
        <main className="home">
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
                <li>Chaque run peut finir en humiliation publique.</li>
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
            <button className="ghost" onClick={() => setScreen('home')}>
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
      <aside className={`lexicon-panel ${helpOpen ? 'open' : ''}`}>
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
