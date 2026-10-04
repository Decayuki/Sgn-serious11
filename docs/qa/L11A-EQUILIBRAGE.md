# L11a SGN11 — équilibrage économique : preuve avant/après

Branche `worker/stn-l11a-sgn11-equilibrage-20261004`, partie de `179b130`
(branche v2 `worker/studynote-l11-sgn11-v2-astra-20261003`, celle qui porte le
contrat GAME_SCORE et le déploiement Preview). Cible du rapport d'exploration
L11 du 03/10 : la politique « bon élève » atteint au moins « Bien joué » sur les
six scénarios.

## Constat : le correctif est déjà dans la base v2

La v2 a ajouté `operatingIncome` (`src/gameEngine.js`) : à chaque scène
principale, la trésorerie reçoit `round(2 + min(perçue, VA, partenariale) / 20)`
points (2 à 7). Les branches de crise ne rapportent rien. Les seuils de
Catastrophe, les pénalités et les données des scènes sont inchangés. Bien gérer
la valeur rapporte donc du cash, ce qui supprime la punition par la trésorerie.

Le réglage atteint la cible : **aucune modification de l'équilibrage n'a été
faite ici**. La retoucher sans défaut mesuré aurait déplacé un réglage déjà
recetté. Ce lot ajoute la preuve indépendante et un garde-fou de régression.

## Méthode

`npm run balance` (`scripts/balance-report.mjs`) rejoue le moteur réel
(`createGame`, `choose`, `advance`, `getOutcome`). Il utilise 500 graines par
scénario, avec branches forcées et événements aléatoires.

- **good** : la politique « bon élève » du rapport L11. Elle prend le meilleur
  effet immédiat pondéré parmi les choix légaux, non `bad` et sans `branchId`.
- **serious** : tirage uniforme parmi les choix légaux et non `bad`. Elle
  représente un élève sérieux qui n'optimise pas.
- **negligent** : tirage uniforme parmi tous les choix, mauvais et illégaux
  compris.

## Résultats « bon élève »

Le tableau ci-dessous montre la graine 42 et les 500 graines.

| Scénario | Avant (main `48c27d6`) | Après (base v2) | Après, 500 graines |
|---|---|---|---|
| Café Orion | Catastrophe, 72, cash 10 | Bien joué, 82, cash 64 | 100 % gagnées, score 81–91, cash min 58 |
| Aura Skin | Catastrophe, 70, cash 0 | Master, 85, cash 77 | 100 %, 81–90, cash min 55 |
| Black Corner | Catastrophe, 67, cash 4 | Bien joué, 81, cash 62 | 100 %, 78–88, cash min 48 |
| Atlas FC | Bien joué, 71, cash 30 | Master, 85, cash 91 | 100 %, 83–87, cash min 85 |
| Pulse Lab | Catastrophe, 70, cash 10 | Master, 85, cash 84 | 100 %, 80–87, cash min 60 |
| Atelier Velvet | Catastrophe, 72, cash 14 | Bien joué, 83, cash 70 | 100 %, 81–87, cash min 60 |

La colonne « Avant » vient du script d'origine de l'exploration (moteur extrait
de `App.jsx` sur main). Elle reproduit exactement les chiffres du rapport. Le
même verdict, Catastrophe sur 5 des 6 scénarios, réapparaît avec
`balance-report` quand on neutralise `operatingIncome` (contre-épreuve
ci-dessous).

## Les autres profils, après correctif (500 graines)

| Scénario | serious : gagnées | negligent : gagnées | negligent : Catastrophe |
|---|---:|---:|---:|
| Café Orion | 100 % | 1 % | 91 % |
| Aura Skin | 100 % | 5 % | 56 % |
| Black Corner | 100 % | 5 % | 78 % |
| Atlas FC | 100 % | 13 % | 42 % |
| Pulse Lab | 100 % | 20 % | 22 % |
| Atelier Velvet | 100 % | 18 % | 27 % |

En mode Défis, les objectifs principaux sont tous atteints par good et serious
dans 100 % des parties. Negligent les atteint dans 0 à 10 % des parties.

## Garde-fou

`tests/balance.test.mjs` contient 6 tests, un par scénario. Chacun exige :

- good et serious gagnent dans 100 % des parties ;
- le cash de good ne descend jamais sous 25 ;
- negligent finit en Catastrophe dans au moins 15 % des parties et gagne dans au
  plus 30 %.

**Contre-épreuve** : avec `operatingIncome` forcé à 0, les 6 tests échouent.
good gagne alors 0 à 69 % des parties selon le scénario.

## Gates

- `npm test` : 25/25 verts (19 existants et 6 nouveaux).
- `eslint .` : OK.
- `vite build` : OK.
- GAME_SCORE, écrans finaux, seuils et données : non touchés.
