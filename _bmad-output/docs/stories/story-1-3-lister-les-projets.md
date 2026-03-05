# Lister les Projets

**ID:** STORY-1.3
**Epic:** Epic 1 : Gestion de Projet & CLI
**Priority:** Must Have
**Story Points:** 2

## User Story

**En tant qu'** utilisateur
**Je veux** lister tous les projets surveillés via `supabase-keeper list`
**Afin de** voir ce qui est actuellement maintenu actif.

## Acceptance Criteria

- [ ] La commande `supabase-keeper list` est disponible.
- [ ] Affiche un tableau des projets configurés avec les colonnes : Nom, URL, Clé API, Statut (si disponible sinon a intégrer dans config.json), Dernier Ping (si disponible sinon a intégrer dans config.json).
- [ ] Masque les clés API complètes (n'affiche que les 4 derniers caractères si affiché, sinon ne pas afficher).
- [ ] Si aucun projet n'est configuré, affiche un message convivial suggérant d'utiliser `add`.
- [ ] Utilise des couleurs pour améliorer la lisibilité (ex: URL en bleu, Statut en vert/rouge).

## Technical Notes

- Utiliser `commander` pour la commande `list`.
- Utiliser `chalk` pour le style.
- Utiliser `console.table` ou un formatage manuel propre pour l'affichage.
- Lire le fichier de configuration `config.json`.
- Gérer le cas où le fichier de configuration n'existe pas (message d'erreur clair ou invitation à `init`).

## Dependencies

- STORY-1.1 (Initialisation Configuration)
- STORY-1.2 (Ajouter un Projet)

## Definition of Done

- [ ] Code complet
- [ ] Tests écrits et passants
- [ ] Code revu
- [ ] Documentation mise à jour
- [ ] Déployé/Testé localement

