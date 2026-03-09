# Mode Démon avec PM2

**ID:** STORY-2.2
**Epic:** Epic 2 : Exécution en Arrière-plan
**Priority:** Must Have
**Story Points:** 2

## User Story

**En tant qu'** utilisateur utilisant PM2
**Je veux** que la commande `ping --daemon` lance un processus d'arrière-plan persistant géré par PM2
**Afin de** maintenir mes projets actifs automatiquement sans intervention manuelle.

## Acceptance Criteria

### Mode Démon (`ping --daemon`)

- [ ] La commande `supabase-keeper ping --daemon` vérifie si PM2 est installé.
- [ ] Elle lance un processus PM2 nommé `supabase-keeper`.
- [ ] Le processus PM2 exécute la commande `ping --loop` (mode interne).
- [ ] La commande `ping --loop` exécute un ping immédiatement puis attend l'heure planifiée (09:00 chaque jour).
- [ ] Le processus reste vivant (bloquant) pour que PM2 ne le redémarre pas inutilement.
- [ ] Les logs sont accessibles via `pm2 logs`.

## Technical Notes

- Utiliser un flag caché ou explicite `--loop` pour le processus worker.
- Utiliser `node-cron` pour la planification interne (fixée à `0 9 * * *`).
- Ne pas utiliser le système Cron de PM2 (`--cron`) car il est moins flexible pour les logs et le contrôle interne.

## Dependencies

- Story 2.1 (Support PM2)

## Definition of Done

- [ ] Code complet (`ping.ts` gère `--daemon` et `--loop` avec `node-cron`)
- [ ] Nettoyage des fichiers inutiles (`cron.ts`, `start.ts` supprimés)
- [ ] Tests manuels (lancer daemon, vérifier pm2 list, vérifier logs)
