# Exécution du Ping

**ID:** STORY-3.1
**Epic:** Epic 3 : Logique de Ping & Fiabilité
**Priority:** Must Have
**Story Points:** 5

## User Story

**En tant qu'** utilisateur
**Je veux** que l'outil envoie un ping HTTP régulier à mon projet Supabase
**Afin de** maintenir l'instance active.

## Acceptance Criteria

- [ ] Utilise l'URL du projet configurée pour faire une requête HTTP (HEAD ou GET sur `/rest/v1/`).
- [ ] Gère les délais d'attente (timeout) et les erreurs réseau de base.
- [ ] Enregistre le succès ou l'échec dans un fichier de log local (simple pour l'instant).
- [ ] Met à jour le timestamp `last_ping` dans la configuration du projet.

## Technical Notes

- Utiliser `fetch` pour la requête HTTP.
- Ajouter un endpoint `/rest/v1/` à l'URL du projet si nécessaire pour le ping.
- Gérer les erreurs (try/catch) pour ne pas crasher le processus en cas de problème réseau.
- Ajouter une commande `ping` à la CLI (`src/commands/ping.ts`).
- Utiliser la configuration existante pour récupérer la liste des projets actifs.
- Mettre à jour `config.json` après chaque ping réussi.

## Dependencies

- Story 1.3 (Structure de config existante)

## Definition of Done

- [ ] Code complet
- [ ] Tests écrits et passants
- [ ] Code revu
- [ ] Documentation mise à jour
- [ ] Déployé/Testé localement
