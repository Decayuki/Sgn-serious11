# SGN11 · Créer de la valeur

Serious game React/Vite : Café Orion, Aura Skin, Black Corner, Atlas FC, Pulse Lab et Atelier Velvet. Modes Classique et Défis, événements et crises, cinq jauges et bilan pédagogique.

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm test
npm run simulate
npm run lint
npm run build
npm run test:browser
```

Node 22.13+ (ou Node 24), npm. La recette navigateur nécessite Chromium Playwright (`npx playwright install chromium`) et un serveur démarré sur `http://127.0.0.1:5173`. `SGN_QA_URL` remplace cette URL ; `SGN_QA_CDP` permet d'utiliser un navigateur de QA dédié existant. Captures et résultats : `output/browser/`.

## Règles économiques

Les effets des choix et les seuils des grades sont conservés. Chaque étape principale représente une période d'activité : après son choix, elle rapporte `arrondi(2 + min(valeur perçue, VA, valeur partenariale) / 20)` points de trésorerie, soit 2–7 points. Les crises se déroulent dans la même période et ne créent pas de recettes supplémentaires. Le feedback distingue le coût du choix, les recettes et la variation nette après plafonnement des jauges. Ces points simulent un équilibre pédagogique ; ce ne sont pas des euros ni une équivalence comptable entre valeur ajoutée et cash.

## Sauvegarde

Une partie locale par navigateur/origine, automatiquement enregistrée après chaque choix et transition. L'accueil propose **Reprendre la partie** ou **Revoir le bilan**. Une nouvelle partie remplace la précédente. Le mode, la graine aléatoire et le journal de décisions sont versionnés ; la reprise rejoue le moteur réel, y compris les effets conditionnels et les crises. Les sauvegardes corrompues/incompatibles sont ignorées, et un stockage indisponible affiche une alerte. Aucun compte ni donnée élève n'est enregistré. Une autre origine de preview possède sa propre sauvegarde.

## StudyNote

Dans une iframe, le bilan émet `window.parent.postMessage({ type: 'GAME_SCORE', score }, '*')`, score entier 0–100, conformément au contrat GameEmbed existant. Aucun appel à une API de production n'est effectué par le jeu. À la racine, il n'émet rien.

Une émission par partie : garde en mémoire, marqueur local persistant et verrou inter-onglets Web Locks lorsqu'il est disponible. Revoir un bilan ne réémet pas ; rejouer crée une nouvelle identité. Sans stockage, la déduplication se limite au document courant. Il n'existe pas d'accusé de réception dans le contrat : « message émis » ne prouve pas « récompense accordée ». Le parent doit vérifier l'origine ; l'unicité atomique des récompenses, l'accès élève et la vérification du score appartiennent au serveur StudyNote.

## Organisation

- `src/gameData.js` : scénarios, effets, objectifs, lexique et grades existants.
- `src/gameEngine.js` : transitions pures, recettes et tirages déterministes, partagés entre UI et simulation.
- `src/gameStorage.js` : rejeu validé, persistance et émission du score.
- `src/App.jsx`, `src/App.css` : interface React, identité café/crème, illustration café SVG et adaptation mobile.
- `tests/` : tests Node et DOM React (ces derniers ne remplacent pas une recette écran).
- `scripts/simulate.mjs`, `scripts/qa-browser.mjs` : preuves reproductibles.

État de livraison et limites : [rapport L11](docs/qa/L11-SGN11-V2.md).
