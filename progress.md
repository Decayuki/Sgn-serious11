Original prompt: Livrer SGN11 jouable sur six scénarios, GAME_SCORE StudyNote, sauvegarde/reprise robuste, tests déterministes, QA navigateur/375 px et preview après gates locales, uniquement dans le worktree SGN11 dédié.

- Base: 48c27d6. Worktree/branche fournis par Hive, aucune écriture StudyNote.
- Skill develop-web-game lu et appliqué à React DOM (pas de canvas).
- Contrat GameEmbed lu: GAME_SCORE { score: 0..100 }, origine du jeu vérifiée par StudyNote.
- Décision: moteur pur partagé UI/simulation; recettes d'exploitation aux seules étapes principales, sans modifier les seuils ni supprimer les pénalités.
- Décision: sauvegarde versionnée par journal de décisions et graine aléatoire; reprise par rejeu pour préserver les effets-fonctions et les événements.
- Limite serveur constatée en lecture seule: StudyNote fait exists puis récompenses puis create; pas de garantie atomique contre deux requêtes concurrentes. Le jeu dédupliquera ses propres émissions; QA de récompense authentifiée dépend d'un lot StudyNote distinct.

- Moteur/UI branchés; 6 000 simulations sans échec, couverture 360 combinaisons (toutes branches forcées et paires d'événements). Bons choix provoquant une crise inclus.
- 18 tests initiaux verts; ajout du verrou Web Locks et de son test (19 attendus).
- Build/lint initiaux verts. Client navigateur du skill lancé (copie identique sous output pour résolution Playwright), Chromium refusé par Mach sandbox. Pas de screenshot local; Hive a proposé son navigateur dédié et reçu les URLs.
- Serveur http://127.0.0.1:5173 ; parent local http://127.0.0.1:5173/output/qa-parent.html ; script navigateur reproductible scripts/qa-browser.mjs.
- Mapping Vercel local sg11 identifié, CLI sans credentials (login interrompu). Vérifier les déploiements Git après push.

- Gates finales : 19/19 tests, lint et build OK. Couverture moteur 100 % lignes / 96,61 % branches ; persistance 100 % / 93,02 %.
- Fallow brut exit 1 (12 alertes, 9 clones), puis avec V8 exit 1 (4 alertes héritées/UI et 9 clones du catalogue). 0 import/cycle/dead-code. Pas de gate maquillée en vert.
- Scan secrets : aucun candidat sur 16 fichiers hors lock. Données pédagogiques et grades extraits inchangés (hors nettoyage d'un espace final).

- Code livré et push confirmé : dd6fe933f83b49f403224b1f84e0e4e9a1069b71. GitHub : 0 checks, 0 déploiement pour le SHA, status pending avec liste vide. Preview non prouvée (CLI sans auth).
- Reste : retour QA visuelle Hive au serveur local, déploiement Preview sg11 avec accès Vercel, intégration/récompense atomique StudyNote dans un lot séparé. Serveur local laissé actif pour Hive.
