# Initialisation de la Configuration CLI

**ID:** STORY-1.1
**Epic:** Epic 1 : Gestion de Projet & CLI
**Priority:** Must Have
**Story Points:** 3

## User Story

**En tant qu'** utilisateur
**Je veux** initialiser l'outil avec `supabase-keeper init`
**Afin de** configurer le fichier de paramètres et vérifier l'installation.

## Acceptance Criteria

- [x] L'exécution de `supabase-keeper init` crée un fichier de configuration dans le dossier en cours ou dans le dossier rensigné par l'utilisateur.
- [x] L'utilisateur est invité à effectuer une configuration initiale (ajout optionnel d'un premier projet).

## Technical Notes

- Utiliser une librairie comme `commander` et `@clack/prompts` pour l'interaction utilisateur.
- Utiliser `os.homedir()` pour localiser le répertoire utilisateur de manière cross-platform.
- Structure du `config.json` initial :
  ```json
  {
    "projects": []
  }
  ```

## Dependencies

- Aucun

## Definition of Done

- [x] Code complet
- [x] Tests écrits et passants
- [ ] Code revu
- [x] Documentation mise à jour
- [x] Déployé/Testé localement
