# L11 — refonte SenseNova (sn-motion-html), démo pilote Café Orion

Base : `dbffbad` (`worker/stn-l11a-sgn11-equilibrage-20261004`). Branche : `worker/l11-rework-sgn11-sensnova-20261004`.
Périmètre : SGN11 uniquement. StudyNote et EcoVélos n'ont pas été modifiés.

## Ce qui change

On ne passe plus d'un écran à l'autre : chaque partie est une traversée continue pilotée par le défilement, selon les principes de `sn-motion-html` (MIT) :

- **Une scène fixe plein écran** (`src/story/Stage.jsx`) avec un calque par lieu du monde. La caméra (`src/story/camera.js`) cadre chaque station puis, entre deux stations, fait un *pan* dans le même lieu ou un *dive* (poussée vers le point de sortie et fondu vers la pièce suivante). Le défilement vers le haut rejoue le trajet à l'envers.
- **Des stations reconstruites depuis le moteur** (`src/story/journey.js`) : prologue → une station par décision (décor → situation → choix → conséquence) → bilan. Les décisions passées restent lisibles (journal) et les choix ne sont actifs que sur la station en cours.
- **Des choix intégrés à la scène** : texte transparent posé sur le décor (dégradé localisé, sans carte), choix lettrés A–D et marqueurs correspondants dans le décor, qui suivent la caméra (desktop).
- **`content/story.json`** : 6 actes pédagogiques (seuil, salle, coulisses, bureau, crise, finale), chaque scène rattachée à son acte, et par monde : preset d'interface (`folio` / `caption` / `graphic`), palette, polices, cadrages, sorties et position du texte par lieu.
- **Interface adaptative** : à 375 px, le texte passe en panneau bas, les jauges deviennent compactes et les marqueurs de décor sont masqués.
- **Repli `prefers-reduced-motion`** : plans fixes cadrés sur le sujet, sans zoom ni panoramique, avec fondu d'opacité seul et défilement instantané.
- **Repli média manquant** : si un visuel n'est pas généré ou échoue au chargement, le calque affiche le décor procédural (palette, illustration vectorielle v2, nom du lieu). Le jeu reste jouable.
- Pas de vidéo Seedance/Ark (clé non disponible) : c'est le mode sans vidéo de la référence.

Inchangés : `gameData.js`, `gameEngine.js` (moteur et données pédagogiques), la gagnabilité v2, la sauvegarde et la reprise.

## Règle produit appliquée (Marc, 04/10)

Une fin **Catastrophe** émet `GAME_SCORE = 0` (`reportedScore` dans `src/gameStorage.js`). L'écran garde le score détaillé (ex. 33/100). Le contrat (`{type:'GAME_SCORE', score}`, une seule émission par partie) n'a pas changé.

## Visuels GPT

Les 36 décors (6 mondes × 6 lieux) ont été générés par la capacité **GPT image de Codex CLI** (`image_generation`, auth ChatGPT), avec `scripts/generate-assets.mjs`. Aucun autre fournisseur n'a été utilisé. Format : 1536×1024 WebP, ≤ 260 Ko chacun, 6,4 Mo au total.

- **Point de remplacement unique** : `content/assets.json` (id → fichier sous `public/`, prompt exact, dimensions, budget de poids, statut). Pour régénérer un visuel : `node scripts/generate-assets.mjs --only cafe/salle --force`, ou remplacer le fichier au même chemin. Le code n'est jamais touché.
- Cadrages et marqueurs calés image par image pour le **Café** uniquement (démo). Les 5 autres mondes utilisent des cadrages par défaut, dérivés de la position du texte.

## Preuves

| Gate | Résultat |
|---|---|
| `npm test` | **35/35** : 25 tests v2 (moteur, 6 000 parties gagnables, 360 combinaisons rejouées, sauvegarde, score) + 9 tests de scènes (`tests/story.test.mjs`) + 1 test DOM du mode histoire |
| `npm run lint` | 0 erreur |
| `npm run build` | OK (JS 405 Ko, 107 Ko gzip ; CSS 22 Ko) |
| `npm run test:browser` | **18/18 runs, 0 erreur de page** (Playwright Chromium, iframe parente d'origine distincte) |

Détail de la recette navigateur (`scripts/qa-browser.mjs`, à 1280 et à 375 px) :

1. Les 6 scénarios joués du début à la fin, en mouvement réduit (Défis, graine 42), avec reprise après rechargement au milieu d'une crise, 1 seul `GAME_SCORE` ≥ 70, et « Revoir le bilan » qui ne réémet pas.
2. Café en mouvement complet : défilement doux, retour en arrière jusqu'au milieu d'un *dive* (2 pièces en fondu vérifiées), captures de chaque acte.
3. Café sans média (`**/scenes/**` coupé) : aucun calque en `still`, partie complète jouée.
4. Café Catastrophe : le score affiché est conservé, l'hôte reçoit `[{type:'GAME_SCORE', score:0}]`.
5. À chaque action : aucun débordement horizontal.

Captures choisies : [docs/qa/rework/](rework/), dont la planche desktop [sheet-cafe-desktop.jpg](rework/sheet-cafe-desktop.jpg).

## Limites / suite

- Démo validable : Café. Les 5 autres mondes sont jouables avec leurs propres décors GPT et leur preset d'interface, mais leurs cadrages n'ont pas été affinés sur l'image. Ce polissage est à faire après validation de Marc.
- Les textes des scènes viennent de `gameData.js` (pédagogie inchangée). `story.json` ne porte que la mise en scène.
- Polices chargées depuis Google Fonts (repli système si elles sont bloquées).
