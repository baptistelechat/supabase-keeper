# Product Requirements Document (PRD) : Supabase Keeper

**Date :** 02/03/2026
**Projet :** Supabase Keeper
**Version :** 1.0
**Statut :** Draft
**Auteur :** Product Manager AI (basé sur le Brief Produit v1.0)

## 1. Introduction

### 1.1 Objectif

Ce document définit les exigences fonctionnelles et non fonctionnelles pour **Supabase Keeper**, un outil CLI auto-hébergé conçu pour empêcher la mise en pause des projets Supabase Free Tier en simulant une activité régulière.

### 1.2 Portée

Le projet couvre le développement d'une interface en ligne de commande (CLI) Node.js, d'un service d'arrière-plan (daemon), et de la logique de ping associée. L'outil doit être compatible avec les environnements Linux, macOS et Windows (via WSL ou natif si possible).

### 1.3 Définitions

- **Cold Start** : Délai de démarrage d'un projet Supabase mis en pause.
- **Ping** : Requête légère envoyée à la base de données pour maintenir l'activité.
- **Daemon** : Processus s'exécutant en arrière-plan pour effectuer les pings planifiés.

## 2. Aperçu du Produit

### 2.1 Problème

Les projets Supabase Free Tier sont mis en pause après 7 jours d'inactivité, causant des interruptions de service et des temps de latence élevés au réveil. Les solutions actuelles (GitHub Actions, Cron jobs externes) dépendent de tiers, posant des problèmes de confidentialité et de complexité.

### 2.2 Solution

Une CLI locale (`supabase-keeper`) qui s'installe via npm, configure un service local (systemd/PM2/cron) et exécute des pings périodiques vers les projets configurés, gardant les clés API en local.

### 2.3 Proposition de Valeur

- **Confidentialité** : Les clés API ne quittent jamais la machine de l'utilisateur.
- **Simplicité** : "Set and forget" via une simple commande d'initialisation.
- **Fiabilité** : Stratégies de ping intelligentes pour éviter la détection de bot.

## 3. Personas Utilisateurs

1.  **Le Hobbyist Développeur**
    - Utilise Supabase pour des projets personnels.
    - Veut que ses apps restent réactives sans payer $25/mois par projet.
    - Préfère les outils CLI et l'auto-hébergement léger.

2.  **Le Self-Hoster**
    - Possède un serveur domestique (Raspberry Pi, NAS).
    - Aime contrôler son infrastructure.
    - Cherche une solution robuste et autonome.

## 4. Exigences Fonctionnelles (FR)

### FR-01 : Gestion des Projets (CLI)

- **FR-01.1** : L'utilisateur doit pouvoir ajouter un projet via `supabase-keeper init` ou `add`.
- **FR-01.2** : L'outil doit demander l'URL du projet et la clé API (service_role ou anon).
- **FR-01.3** : L'utilisateur doit pouvoir lister les projets surveillés via `supabase-keeper list`.
- **FR-01.4** : L'utilisateur doit pouvoir supprimer un projet via `supabase-keeper remove <id>`.

### FR-02 : Exécution en Arrière-plan

- **FR-02.1** : L'outil doit pouvoir générer et activer un service systemd (Linux) pour l'exécution automatique.
- **FR-02.2** : L'outil doit supporter PM2 comme gestionnaire de processus alternatif.
- **FR-02.3** : Une option de fallback vers Cron doit être disponible pour les environnements simples.
- **FR-02.4** : Le service doit redémarrer automatiquement après un redémarrage système.

### FR-03 : Logique de Ping

- **FR-03.1** : Le système doit exécuter un ping par défaut quotidiennement.
- **FR-03.2** : L'heure du ping doit inclure une variation aléatoire (jitter) de +/- 30 minutes pour éviter les patterns fixes.
- **FR-03.3** : La requête de ping doit être légère (`SELECT 1` ou équivalent).
- **FR-03.4** : En cas d'échec (réseau coupé), le système doit réessayer avec un backoff exponentiel.

### FR-04 : Diagnostic et Logs

- **FR-04.1** : La commande `supabase-keeper doctor` doit vérifier l'état du service d'arrière-plan.
- **FR-04.2** : Les logs d'activité doivent être accessibles (fichier `keep-alive.log`) avec rotation automatique.
- **FR-04.3** : L'utilisateur doit pouvoir déclencher un ping manuel via `supabase-keeper ping <project>`.

### FR-05 : Sécurité

- **FR-05.1** : Les configurations (URL, clés) doivent être stockées localement dans un fichier sécurisé (ex: `~/.supabase-keeper/.env` ou JSON crypté).
- **FR-05.2** : Les permissions de fichier doivent être restreintes à l'utilisateur courant.

## 5. Exigences Non-Fonctionnelles (NFR)

- **NFR-01 : Performance** : L'empreinte mémoire du daemon doit être inférieure à 50 Mo.
- **NFR-02 : Compatibilité** : Node.js v18+.
- **NFR-03 : Fiabilité** : Le taux de réussite des pings doit être > 99% (hors pannes réseau).
- **NFR-04 : Facilité d'installation** : Moins de 3 commandes pour être opérationnel (`npm i -g`, `init`).

## 6. Priorisation (MoSCoW)

### Must Have (MVP)

- CLI `init`, `list`, `ping`.
- Support Systemd & Cron.
- Stockage sécurisé des clés.
- Logique de ping basique avec jitter.
- Logs rotatifs.

### Should Have

- Support PM2.
- Commande `doctor` complète.
- Notifications en cas d'échec répété (webhook simple).

### Could Have

- Interface Web locale (dashboard).
- Support Docker container.
- Statistiques de disponibilité.

### Won't Have (v1)

- Support multi-utilisateurs.
- Intégration cloud (AWS Lambda, etc.).

## 7. Critères de Succès

- Un utilisateur peut installer et configurer un projet en moins de 2 minutes.
- Le service tourne en arrière-plan sans intervention manuelle après reboot.
- Les projets surveillés ne sont jamais mis en pause par Supabase.

## 8. Considérations Techniques

- **Langage** : TypeScript.
- **Runtime** : Node.js.
- **Librairies clés** :
  - `commander` ou `yargs` pour la CLI.
  - `@supabase/supabase-js` pour les requêtes.
  - `node-schedule` ou `cron` pour la planification.
  - `conf` ou `dotenv` pour la configuration.
