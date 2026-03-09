# Revue de Code : Story 2.2 - Mode Démon avec PM2

**Relecteur :** @dev (Assistant IA)
**Date :** 09/03/2026
**Story :** [STORY-2.2](file:///c:/Users/DM/Desktop/DEV/perso/supabase-keeper/_bmad-output/docs/stories/story-2-2-daemon-pm2.md)

## Résumé

L'implémentation du mode démon (`ping --daemon`) et de la boucle interne (`ping --loop`) est fonctionnelle. La structure permet bien de déléguer la gestion du processus à PM2 tout en gardant la logique de planification (`node-cron`) au sein de l'application.

## Constats

### 1. Architecture du Démon

- **Séparation des responsabilités** :
  - `ping --daemon` agit comme un lanceur (Launcher) qui configure PM2.
  - `ping --loop` agit comme le processus de travail (Worker) qui reste en vie et exécute la tâche planifiée.
- **Gestion PM2** : L'utilisation de `pm2 start ... -- ping --loop` est correcte pour passer les arguments au script via PM2.
- **Persistance** : `savePM2List()` est appelé après le démarrage, assurant que le processus survit aux redémarrages serveur.

### 2. Planification et Exécution

- **Cron** : Utilisation de `node-cron` avec l'expression `0 9 * * *` (9h00 quotidien) conforme aux spécifications.
- **Exécution immédiate** : Le `runPing()` est appelé dès le démarrage du mode loop, ce qui fournit un feedback immédiat (utile pour vérifier que ça marche sans attendre 9h00).
- **Chargement Config** : `runPing` recharge la configuration à chaque exécution (`ensureConfig(targetDir)`). C'est un **point crucial et très positif**, car cela permet d'ajouter/supprimer des projets via CLI sans avoir à redémarrer le démon.

### 3. Robustesse

- **Détection du script** : La logique pour trouver `dist/index.js` ou fallback sur le script courant est bien pensée pour supporter à la fois le dev (`.ts`) et la prod (`.js`).
- **Avertissements** : Le warning sur l'exécution de fichiers `.ts` avec PM2 est pertinent.

### 4. Qualité du Code

- **Propreté** : Code lisible, utilisation de `chalk` pour les logs.
- **Logique** : Le flux est clair (Check PM2 -> Start PM2 -> Save).

## Recommandations

1.  **Refactoring `runPing`** :
    - Actuellement, `runPing` est défini à l'intérieur de `.action()`.
    - **Conseil** : Il serait préférable d'extraire `runPing` (et la logique de filtrage des projets actifs) dans un service ou une fonction utilitaire séparée (ex: `src/services/pinger.ts` ou `src/commands/ping.utils.ts`). Cela rendrait la logique testable unitairement sans dépendre de la commande Commander.

2.  **Gestion du PID/Lock** :
    - Rien n'empêche de lancer plusieurs instances du démon si on ne passe pas par PM2 (ex: lancer manuellement `ping --loop` dans deux terminaux).
    - PM2 gère l'unicité via le `--name`, donc c'est couvert pour l'usage standard.

3.  **Logs** :
    - Les logs utilisent `console.log` (via `clack/prompts` ou wrapper). Pour un démon, c'est ce qu'il faut (PM2 capture stdout/stderr).
    - Penser à ajouter des timestamps si PM2 ne le fait pas (PM2 le fait souvent avec `--time`, mais l'avoir dans le log applicatif peut être utile). Le code actuel a `[${new Date().toISOString()}]`, c'est parfait.

## Statut

- [x] Approuvé
- [ ] Changements demandés

La story est validée. Le code est prêt pour la production (sous réserve de l'implémentation réelle du ping dans l'Epic 3).
