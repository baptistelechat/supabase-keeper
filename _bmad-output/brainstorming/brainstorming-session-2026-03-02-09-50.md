---
stepsCompleted:
  - 1
inputDocuments: []
session_topic: "Supabase Keeper CLI"
session_goals: "Créer un outil CLI self-hosted pour maintenir les projets Supabase actifs (anti-cold start/pause) via des pings planifiés, sans dépendance externe."
selected_approach: ""
techniques_used: []
ideas_generated: []
context_file: ""
---

# Brainstorming Session Results

**Facilitator:** Baptiste
**Date:** 2026-03-02

## 1. Session Setup

**Topic:** Supabase Keeper - CLI local de maintenance de projets Supabase.
**Context:** Outil "install-once, forget-forever" pour développeurs et auto-hébergement (Raspberry Pi, VPS).
**Objectifs:**

- Architecture CLI Node.js TypeScript
- Authentification sécurisée (PAT)
- Configuration automatique de runners (systemd, PM2, cron)
- Mode "offline-first" après installation

## 2. Définition du Périmètre (Données Initiales)

**Problème:** Projets Supabase Free Tier mis en pause après inactivité + Cold starts.
**Solution:** Ping quotidien léger, local, coût nul.
**Stack:** Node.js, TS, Commander, Clack, Supabase JS.
**Runners:** Systemd (recommandé), PM2, Cron.

## 3. Technique: Reverse Brainstorming (L'Avocat du Diable) 😈

**Objectif:** Identifier tout ce qui pourrait faire échouer le projet pour mieux le blinder.
**Question inversée:** "Comment faire en sorte que `supabase-keeper` échoue misérablement ou casse la prod ?"

### Pistes de "Sabotage" identifiées :

#### 1. Dépendance & API Supabase 🔗

- **Changement d'API :** Supabase modifie l'API Management ou l'auth (le PAT ne suffit plus, ou l'endpoint change).
- **Détection de "Bot" :** Supabase identifie le pattern de ping (toujours à la même seconde) et le bloque/ban.
- **Quota dépassé :** Le ping consomme de la bande passante ou des "compute hours" (même minimes) qui finissent par compter.
- **Maintenance Supabase :** L'API est down au moment du ping -> le script crash et ne se relance jamais.

#### 2. Environnement Local (Le "Host") 💻

- **Reboot sans restart :** Le serveur redémarre (coupure courant), mais le runner (PM2/systemd) n'est pas configuré pour se lancer au boot.
- **Mise à jour Node.js :** L'utilisateur met à jour Node, le binaire change de chemin ou casse la compatibilité.
- **Permissions fichiers :** Les droits sur le fichier `.env` ou `config.json` sautent ou sont illisibles par le user du service.
- **Network Flakiness :** Coupure internet temporaire lors du ping -> le script plante sans retry.

#### 3. Sécurité & Auth 🔐

- **Expiration Token :** Le PAT expire (s'il a une durée de vie) et l'utilisateur n'est jamais notifié.
- **Fuite de Token :** Le fichier de config est lisible par tous les utilisateurs du système (`chmod 777` par erreur).
- **Changement de mot de passe :** L'utilisateur change son mot de passe Supabase -> est-ce que ça invalide le PAT ?

#### 4. Expérience Utilisateur (L'Humain) 🤦‍♂️

- **"Oubli" :** L'utilisateur supprime le dossier `supabase-keeper-services` en faisant le ménage, pensant que c'était juste l'installateur.
- **Logs infinis :** Le système loggue chaque ping réussi, remplissant le disque du Raspberry Pi après 2 ans.
- **Zombie process :** Plusieurs instances du cron/service se lancent en parallèle et bombardent l'API.

---

## 4. Technique: Starbursting (Détails Techniques) ⭐

**Objectif:** Définir les spécificités de l'implémentation.

### Qui ? (Utilisateurs & Acteurs)

- **Utilisateur:** Dev Node.js, self-hoster.
- **Système:** Raspberry Pi, VPS Linux, serveur local.
- **Service:** API Supabase Management & API PostgREST du projet.

### Quoi ? (Livrables & Architecture)

- **Installateur (CLI Global):** `npm install -g supabase-keeper`. Gère l'init, l'auth, et la création de l'instance.
- **Instance (Service Local):** Dossier généré `~/supabase-keeper-services/my-project`. Contient le script de ping, la config `.env`, et les logs.
- **Runner:** Le chef d'orchestre (Systemd/PM2) qui lance le script de l'instance.

### Où ? (Stockage & Exécution)

- **Config:** `.env` dans le dossier de l'instance (découplé du CLI global).
- **Logs:** Fichier `keep-alive.log` dans le dossier de l'instance (avec rotation).
- **Exécution:** En arrière-plan sur la machine locale.

### Quand ? (Fréquence & Timing)

- **Fréquence:** Configurable (défaut: quotidien).
- **Timing:** Heure aléatoire dans une plage donnée (ex: entre 02h00 et 05h00) pour éviter le pattern "bot".

### Pourquoi ? (Justification)

- **Pourquoi découpler CLI et Instance ?** Pour que la suppression du CLI global ne tue pas les services actifs. Pour gérer plusieurs instances/projets indépendamment.
- **Pourquoi pas de dossier caché ?** Pour que l'utilisateur voit clairement ce qui tourne sur sa machine et ne supprime pas par erreur.

### Comment ? (Implémentation)

- **Ping:** `supabase-js` ou `fetch` simple sur l'URL REST.
- **Auth:** PAT pour lister les projets, Anon Key pour le ping (suffisant pour réveiller).
- **Echec:** Retry exponentiel (3 essais) puis log erreur. Pas de crash silencieux.

---

## 5. Technique: SCAMPER (Futur & Évolutions) 🚀

**Objectif:** Explorer les fonctionnalités futures (V2+).

- **Substitute (Remplacer):** Remplacer le "ping dummy" par un **Healthcheck HTTP** (200 OK vs 500) pour monitorer l'état réel de l'API.
- **Combine (Combiner):** **Micro-Backup Local**. Puisqu'on se connecte quotidiennement, ajouter une option pour dumper une table critique (JSON/CSV) en local. (Ex: "Sauvegarder `users` tous les jours").
- **Adapt (Adapter):** Créer `cloud-keeper` pour supporter d'autres plateformes "free tier" (Render, Railway, Heroku).
- **Modify (Modifier):** Support **Multi-comptes** (plusieurs PATs) pour les freelances/agences gérant de nombreux clients.
- **Put to other use (Autre usage):** Transformer les logs en **Graphique de Latence** (monitorer la vitesse de réponse de l'API dans le temps).
- **Eliminate (Éliminer):** Version binaire unique (Rust/Go ou `pkg`) pour supprimer la dépendance à Node.js sur le serveur.
- **Reverse (Inverser):** **Notifications Pannes**. Intégrer un bot Telegram/Discord pour avertir l'utilisateur si le ping échoue X fois de suite (service down).

---

## 6. Synthèse & Prochaines Étapes 🏁

### Insights Clés :

1.  **Robustesse avant tout :** Le "Silent Failure" est l'ennemi n°1. Logs rotatifs et gestion d'erreurs auth sont prioritaires.
2.  **Architecture Découplée :** CLI Global (setup) vs Instance Locale (runtime). Dossier `~/supabase-keeper-services/` explicite pour éviter la suppression accidentelle.
3.  **Discrétion "Intelligente" :** Ping à heure aléatoire (jitter) pour éviter la détection de pattern "bot".

### Recommandations Immédiates :

1.  **Initialiser le projet TypeScript** avec la structure CLI (Commander) + Service.
2.  **Prototyper l'auth PAT** et la récupération de liste de projets.
3.  **Implémenter le générateur de service** (création dossier + script keep-alive).
4.  **Tester les runners** (systemd en priorité sur Linux/WSL).
