# Ajouter un Projet

**ID:** STORY-1.2
**Epic:** Epic 1 : Gestion de Projet & CLI
**Priority:** Must Have
**Story Points:** 3

## User Story

**En tant qu'** utilisateur
**Je veux** ajouter un nouveau projet Supabase via `supabase-keeper add`
**Afin qu'il** puisse être surveillé et maintenu actif.

## Acceptance Criteria

- [ ] La commande `supabase-keeper add` est disponible.
- [ ] L'utilisateur peut donner un nom/alias au projet.
- [ ] L'utilisateur est invité à saisir l'URL du projet Supabase.
- [ ] L'utilisateur est invité à saisir la clé Publishable key.
- [ ] L'application valide la connexion au projet (ping/fetch) avant de sauvegarder.
- [ ] Si la validation échoue, l'utilisateur est informé et peut réessayer ou annuler.
- [ ] Les détails du projet sont sauvegardés dans le fichier de configuration sécurisé.
- [ ] La clé Publishable key n'est pas affichée en clair lors de la saisie (masquée).
- [ ] Vérification que le projet n'existe pas déjà (basé sur l'URL).

## Technical Notes

- Utiliser `commander` pour la sous-commande `add`.
- Utiliser `@clack/prompts` pour les saisies interactives (`text`, `password` pour la clé).
- Validation de l'URL.
- Validation de la connexion Supabase : effectuer une requête `HEAD` ou `GET` simple sur l'URL du projet (ex: `${url}/rest/v1/`) avec la clé fournie.
- Mise à jour du fichier `config.json` en lisant l'existant, ajoutant le nouveau projet, et réécrivant.
- Structure de l'objet projet dans `config.json` :
  ```typescript
  interface Project {
    name: string;
    supabaseProjectUrl: string;
    supabasePublishableKey: string;
    createdAt: Date;
  }
  ```
- Gestion des erreurs : fichier de config inexistant (suggérer `init`), URL invalide, Clé invalide, ...

## Dependencies

- STORY-1.1 : Le mécanisme de configuration et `init` doivent être en place.

## Definition of Done

- [ ] Code complet
- [ ] Tests écrits et passants (unitaires pour la validation, e2e pour la commande)
- [ ] Code revu
- [ ] Documentation mise à jour (README avec la nouvelle commande)
- [ ] Déployé/Testé localement
