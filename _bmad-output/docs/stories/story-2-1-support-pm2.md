# Support PM2

**ID:** STORY-2.1
**Epic:** Epic 2: Exécution en Arrière-plan (FR-02)
**Priority:** Must Have
**Story Points:** 3

## User Story

**En tant qu'** utilisateur ayant PM2 installé
**Je veux** utiliser PM2 pour gérer le processus d'arrière-plan
**Afin d'** utiliser mon gestionnaire de processus existant.

## Acceptance Criteria

- [x] Détecte si PM2 est installé.
- [x] Ajoute `supabase-keeper` à la liste des processus PM2.
- [x] Configure PM2 pour redémarrer le processus en cas d'échec/redémarrage (`pm2 save`).

## Technical Notes

- Vérifier si `pm2` est accessible dans le PATH.
- Utiliser `pm2 start <script> --name supabase-keeper`.
- Utiliser `pm2 save` pour persister la liste des processus.
- Le script à lancer est probablement `dist/index.js` ou via `npm start`.

## Dependencies

- PM2 installé globalement ou localement.

## Definition of Done

- [x] Code complete
- [x] Tests written and passing (si possible, ou test manuel documenté)
- [x] Code reviewed
- [x] Documentation updated (README section PM2)
