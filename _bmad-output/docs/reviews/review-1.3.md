# Revue de Code : Story 1.3 - Lister les Projets

**Relecteur :** @dev (Assistant IA)
**Date :** 05/03/2026
**Story :** [STORY-1.3](file:///c:/Users/DM/Desktop/DEV/perso/supabase-keeper/_bmad-output/docs/stories/story-1-3-lister-les-projets.md)

## Résumé

L'implémentation de la commande `supabase-keeper list` respecte les spécifications et s'intègre bien avec l'existant. Elle permet de lister les projets configurés avec un formatage clair. Un bug d'inversion de colonnes a été identifié et corrigé lors de la revue.

## Constats

### 1. Fonctionnalité et Affichage

- **Conformité** : La commande utilise `commander`, `cli-table3` et `chalk` comme demandé.
- **Affichage** : Le tableau présente les informations essentielles (Nom, URL, Clé masquée, Statut, Date de création, Dernier Ping).
- **Masquage** : Les clés API sont correctement tronquées pour ne montrer que les 4 derniers caractères.
- **Couleurs** : L'utilisation de couleurs pour le statut (vert/jaune/rouge) améliore la lisibilité.

### 2. Correction de Bug

- **Problème** : Les valeurs des colonnes "Created At" et "Last Ping" étaient inversées dans l'implémentation initiale. De plus, la logique de repli (fallback) utilisait `createdAt` pour `lastPing` ce qui était confus.
- **Correction** : 
    - Le code a été modifié pour mapper correctement chaque colonne à sa propriété respective.
    - La colonne "Last Ping" affiche désormais "Never" si aucune date n'est disponible, au lieu de dupliquer la date de création.
    - La colonne "Created At" affiche "Unknown" si la date est manquante.

### 3. Tests et Qualité

- **Tests Unitaires** : `src/commands/list.test.ts` a été mis à jour pour refléter la correction du bug et valider le comportement attendu (notamment l'affichage de "Never" pour un ping manquant).
- **Couverture** : Les tests couvrent les cas nominaux, l'absence de configuration, et les données partielles.
- **Linting/Build** : Le code compile et les tests passent (`pnpm test`).

## Recommandations

- **Formatage des Dates** : L'utilisation de `toLocaleString()` dépend de la locale du système. Pour un CLI, c'est généralement acceptable, mais un format ISO ou relatif ("il y a 2 jours") pourrait être envisagé pour une standardisation future.
- **Gestion de la Largeur** : Si les URLs ou les noms sont très longs, le tableau pourrait casser la mise en page du terminal. `cli-table3` gère le retour à la ligne, mais une troncation intelligente pourrait être ajoutée si nécessaire.

## Statut

- [x] Approuvé (après corrections)
- [ ] Changements demandés

La story peut être considérée comme **Terminée (Done)**.
