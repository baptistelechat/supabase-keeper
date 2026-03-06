# Story 1.4 : Supprimer un Projet

**ID:** STORY-1-4
**Epic:** Epic 1 : Gestion de Projet & CLI
**Priorité:** Must Have
**Story Points:** 2

## User Story

**En tant qu'** utilisateur
**Je veux** supprimer un projet via `supabase-keeper remove <project-name>`
**Afin d'** arrêter de surveiller les projets dont je n'ai plus besoin.

## Critères d'acceptation

- [ ] La commande `supabase-keeper remove <project-name>` (ou `rm`, `delete`) est implémentée.
- [ ] L'utilisateur doit confirmer la suppression (y/n) via un prompt interactif, sauf si le flag `--force` est utilisé.
- [ ] Le projet est supprimé du fichier de configuration.
- [ ] Un message de confirmation est affiché après la suppression réussie.
- [ ] Si le nom du projet n'existe pas, un message d'erreur clair est affiché.

## Notes Techniques

- Utiliser `commander.js` pour définir la commande `remove` (alias `rm`, `delete`).
- Utiliser `@clack/prompts` pour la confirmation interactive (fonction `confirm`).
- Mettre à jour `src/config.ts` si nécessaire pour ajouter une méthode de suppression, ou manipuler directement la liste des projets.
- Gérer le cas où la configuration est vide ou le fichier n'existe pas.

## Dépendances

- Story 1.1 (Configuration existante)
- Story 1.3 (Structure de données des projets)

## Definition of Done

- [ ] Code complet et fonctionnel
- [ ] Tests unitaires ajoutés pour la commande remove
- [ ] Code review passé
- [ ] Documentation mise à jour (README ou help CLI)
