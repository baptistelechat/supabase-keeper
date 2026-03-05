# Story 1.5 : Mettre en Pause et Reprendre un Projet

**ID:** STORY-1-5
**Epic:** Epic 1 : Gestion de Projet & CLI
**Priorité:** Should Have
**Story Points:** 3

## User Story

**En tant qu'** utilisateur
**Je veux** pouvoir mettre en pause et reprendre la surveillance d'un projet via `supabase-keeper pause <project>` et `supabase-keeper resume <project>`
**Afin de** stopper temporairement les pings sans avoir à supprimer et reconfigurer le projet (ex: pendant une maintenance).

## Critères d'acceptation

- [ ] La commande `supabase-keeper pause <project-name>` (ou `stop`, `suspend`) passe le statut du projet à `paused`.
- [ ] La commande `supabase-keeper active <project-name>` (ou `resume`, `start`, `unpause`) repasse le statut du projet à `active`.
- [ ] La commande `list` affiche correctement le nouveau statut.
- [ ] Si le projet est déjà dans l'état demandé, un message informatif est affiché.
- [ ] Les commandes gèrent les noms de projets inexistants avec une erreur claire.

## Notes Techniques

- Le champ `status` (enum: 'active', 'paused', 'error') existe déjà dans l'interface `Project` du fichier `src/config.ts`.
- Implémenter `src/commands/pause.ts` pour mettre à jour le statut à `paused`.
- Implémenter `src/commands/resume.ts` pour mettre à jour le statut à `active`.
- Enregistrer les nouvelles commandes dans `src/index.ts`.
- Mettre à jour la logique de sauvegarde pour persister ce changement d'état.
- **Important :** S'assurer que la future logique de Ping (Epic 3) vérifiera ce statut avant d'effectuer des requêtes.

## Dépendances

- Story 1.1 (Configuration) - Terminée
- Story 1.3 (Listing des projets) - Terminée (vérifier l'affichage du statut)

## Definition of Done

- [ ] Commandes `pause` et `resume` implémentées.
- [ ] Tests unitaires pour le changement d'état.
- [ ] Vérification manuelle via la commande `list`.
- [ ] Documentation mise à jour.
