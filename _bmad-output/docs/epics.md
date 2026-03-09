# Epics et User Stories : Supabase Keeper

Basé sur le PRD v1.0 et l'Architecture v1.0.

## Epic 1 : Gestion de Projet & CLI (FR-01, FR-05)

**Objectif :** Fournir une CLI conviviale pour gérer les projets Supabase surveillés et stocker la configuration en toute sécurité.

### Story 1.1 : Initialisation de la Configuration CLI

**En tant qu'** utilisateur
**Je veux** initialiser l'outil avec `supabase-keeper init`
**Afin de** configurer le fichier de paramètres et vérifier l'installation.

**Critères d'acceptation :**

- L'exécution de `supabase-keeper init` crée un fichier de configuration dans `~/.supabase-keeper/config.json`.
- Le fichier de configuration a des permissions sécurisées (0600 sur Linux/macOS).
- L'utilisateur est invité à effectuer une configuration initiale (ajout optionnel d'un premier projet).

### Story 1.2 : Ajouter un Projet

**En tant qu'** utilisateur
**Je veux** ajouter un nouveau projet Supabase via `supabase-keeper add`
**Afin qu'il** puisse être surveillé et maintenu actif.

**Critères d'acceptation :**

- Demande l'URL du projet et la clé API (service\_role ou anon).
- Valide la connexion au projet avant de sauvegarder.
- Sauvegarde les détails du projet dans le fichier de configuration sécurisé.
- Chiffre les données sensibles si possible (ou s'appuie sur les permissions de fichiers).

### Story 1.3 : Lister les Projets

**En tant qu'** utilisateur
**Je veux** lister tous les projets surveillés via `supabase-keeper list`
**Afin de** voir ce qui est actuellement maintenu actif.

**Critères d'acceptation :**

- Affiche un tableau des projets avec leur Statut (Actif/En pause/Erreur) et l'heure du dernier Ping.
- Masque les clés API complètes (n'affiche que les 4 derniers caractères).

### Story 1.4 : Supprimer un Projet

**En tant qu'** utilisateur
**Je veux** supprimer un projet via `supabase-keeper remove <id>`
**Afin d'** arrêter de surveiller les projets dont je n'ai plus besoin.

**Critères d'acceptation :**

- Supprime le projet du fichier de configuration.
- Demande une confirmation à l'utilisateur avant suppression.

### Story 1.5 : Mettre en Pause et Reprendre un Projet

**En tant qu'** utilisateur
**Je veux** pouvoir mettre en pause et reprendre la surveillance d'un projet via `supabase-keeper pause <project>` et `supabase-keeper resume <project>`
**Afin de** stopper temporairement les pings sans avoir à supprimer et reconfigurer le projet (ex: pendant une maintenance).

**Critères d'acceptation :**

- La commande `supabase-keeper pause <project-name>` passe le statut du projet à `paused` (ou `inactive`).
- La commande `supabase-keeper resume <project-name>` (ou `start`, `unpause`) repasse le statut du projet à `active`.
- La commande `list` affiche correctement le nouveau statut.
- Si le projet est déjà dans l'état demandé, un message informatif est affiché.
- Les commandes gèrent les noms de projets inexistants avec une erreur claire.

## Epic 2 : Exécution en Arrière-plan (FR-02)

**Objectif :** Assurer que l'outil s'exécute automatiquement en arrière-plan pour effectuer des pings sans intervention de l'utilisateur.

### Story 2.1 : Support PM2

**En tant qu'** utilisateur ayant PM2 installé
**Je veux** utiliser PM2 pour gérer le processus d'arrière-plan
**Afin d'** utiliser mon gestionnaire de processus existant.

**Critères d'acceptation :**

- Détecte si PM2 est installé.
- Ajoute `supabase-keeper` à la liste des processus PM2.
- Configure PM2 pour redémarrer le processus en cas d'échec/redémarrage (`pm2 save`).

### Story 2.2 : Fallback Cron

**En tant qu'** utilisateur sur un environnement simple
**Je veux** générer une entrée Cron
**Afin de** pouvoir exécuter l'outil périodiquement.

**Critères d'acceptation :**

- Affiche une ligne crontab valide (ex: `supabase-keeper ping --all`).
- Fournit des instructions sur la façon de l'ajouter à la crontab.

## Epic 3 : Logique de Ping & Fiabilité (FR-03)

**Objectif :** Exécuter les pings de manière fiable et intelligente pour éviter la mise en pause des projets.

### Story 3.1 : Exécution du Ping

**En tant que** système
**Je veux** exécuter une requête SQL légère (`SELECT 1`) vers le projet Supabase
**Afin que** le projet enregistre une activité et réinitialise le minuteur de pause.

**Critères d'acceptation :**

- Utilise `@supabase/supabase-js` ou `fetch` pour interroger la base de données.
- Gère les erreurs de connexion proprement.
- Met à jour l'horodatage "Dernier Ping" dans la config/état.

### Story 3.2 : Implémentation du Jitter

**En tant que** système
**Je veux** ajouter une variation aléatoire (jitter) au planning des pings
**Afin que** l'activité ne ressemble pas à un modèle de bot.

**Critères d'acceptation :**

- Rend l'heure du ping aléatoire de +/- 30 minutes (configurable).
- S'assure que les pings se produisent toujours au moins une fois dans la fenêtre requise (7 jours, mais en visant une fréquence quotidienne).

### Story 3.3 : Mécanisme de Retry

**En tant que** système
**Je veux** réessayer les pings échoués avec un délai d'attente (backoff)
**Afin que** les problèmes réseaux temporaires ne causent pas un ping manqué.

**Critères d'acceptation :**

- Réessaie jusqu'à 3 fois en cas d'échec.
- Utilise un backoff exponentiel (ex: 1s, 2s, 4s).
- Logue l'échec final si toutes les tentatives échouent.

### Story 3.4 : Ping Manuel

**En tant qu'** utilisateur
**Je veux** déclencher manuellement un ping via `supabase-keeper ping <project>`
**Afin de** pouvoir tester la connexion immédiatement.

**Critères d'acceptation :**

- Exécute la logique de ping immédiatement pour le projet spécifié (ou tous).
- Affiche le résultat (Succès/Échec + Latence) dans la console.

## Epic 4 : Diagnostics & Monitoring (FR-04)

**Objectif :** Fournir de la visibilité sur le fonctionnement de l'outil et aider à résoudre les problèmes.

### Story 4.1 : Commande Doctor

**En tant qu'** utilisateur
**Je veux** exécuter `supabase-keeper doctor`
**Afin de** diagnostiquer les problèmes de configuration.

**Critères d'acceptation :**

- Vérifie la version de Node.js.
- Vérifie les permissions du fichier de configuration.
- Vérifie l'état du service d'arrière-plan (Systemd/PM2).
- Vérifie la connectivité vers Supabase.

### Story 4.2 : Système de Logs

**En tant qu'** utilisateur
**Je veux** voir les logs d'activité dans `~/.supabase-keeper/logs/keep-alive.log`
**Afin de** vérifier que les pings se produisent bien.

**Critères d'acceptation :**

- Logue chaque tentative de ping (horodatage, projet, résultat).
- Implémente la rotation des logs (ex: taille max de fichier 5Mo).
- Logue les erreurs avec suffisamment de détails pour le débogage.

