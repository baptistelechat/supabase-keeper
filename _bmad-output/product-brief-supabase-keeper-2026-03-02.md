# Brief Produit : CLI Supabase Keeper

**Date :** 02/03/2026
**Projet :** Supabase Keeper
**Version :** 1.0
**Statut :** Brouillon

## 1. Problématique

Les projets Supabase Free Tier sont automatiquement mis en pause après **7 jours d'inactivité** (aucune requête API ou utilisation du dashboard). Cela cause des "démarrages à froid" (cold starts) et une indisponibilité du service pour les projets hobby ou les applications à faible trafic. Les solutions existantes reposent souvent sur des services cloud tiers (GitHub Actions, Vercel Cron, Kaffeine), ce qui introduit des dépendances externes, de la confusion sur les fuseaux horaires et des problèmes potentiels de confidentialité.

## 2. Public Cible

- **Primaire :** Développeurs utilisant Supabase Free Tier pour des projets hobby/secondaires.
- **Secondaire :** Auto-hébergeurs avec un labo domestique (Raspberry Pi, VPS) qui préfèrent le contrôle local.
- **Psychographie :** Mentalité "Offline-first", valorise la confidentialité et la simplicité ("installer une fois, tourner pour toujours").

## 3. Solution Proposée

**Supabase Keeper** est un outil CLI auto-hébergé construit avec Node.js et TypeScript. Il s'installe globalement via npm et configure un service local en arrière-plan (systemd, PM2, ou cron) pour pinger périodiquement les projets Supabase.

**Proposition de Valeur :**

- **Privé :** Les clés restent sur votre machine/serveur local.
- **Indépendant :** Pas de dépendance à GitHub Actions ou à des moniteurs SaaS externes.
- **Simple :** Configuration en une seule commande (`supabase-keeper init`).
- **Sûr :** Stratégie de ping intelligente pour éviter les bannissements API ou les limites de débit.

## 4. Fonctionnalités Principales (MVP)

1. **Interface CLI :**
   - `supabase-keeper init` : Assistant interactif pour ajouter un projet (URL + Clé).
   - `supabase-keeper list` : Voir les projets surveillés et leur statut.
   - `supabase-keeper ping <project>` : Test de ping manuel.
   - `supabase-keeper doctor` : Vérifier le statut systemd/PM2 et les logs.

2. **Exécuteur en Arrière-plan (Runner) :**
   - **Génération Systemd :** Crée et active automatiquement un service systemd utilisateur.
   - **Support PM2 :** Intégration optionnelle pour les utilisateurs PM2.
   - **Fallback Cron :** Pour les systèmes sans systemd/PM2.

3. **Stratégie de Ping :**
   - **Fréquence :** Configurable (défaut : Quotidien avec décalage aléatoire).
   - **Requête :** Légère `SELECT 1` ou `SELECT id FROM table LIMIT 1`.
   - **Réessai :** Backoff exponentiel si le réseau est coupé.

4. **Sécurité & Logging :**
   - **Stockage :** Fichier `.env` dans un répertoire local sécurisé (`~/.supabase-keeper/`).
   - **Logs :** Logs avec rotation (`keep-alive.log`) pour suivre l'activité sans encombrer le disque.

## 5. Indicateurs de Succès

- **Fiabilité :** 100% de temps de disponibilité pour les projets Supabase surveillés (0 pause).
- **Facilité d'utilisation :** "Temps jusqu'au premier ping" < 2 minutes.
- **Adoption :** 50+ étoiles sur GitHub en 3 mois.
- **Maintenance :** < 1 ticket par mois lié à la "détection de bot".

## 6. Risques & Atténuation

- **Risque :** Supabase change son API ou détecte les patterns de bot.
  - **Atténuation :** Utiliser une variation aléatoire (jitter) dans les heures de ping (ex: +/- 30 min). Utiliser le client officiel Supabase JS.
- **Risque :** La machine locale de l'utilisateur se déconnecte.
  - **Atténuation :** Logique de réessai au démarrage. Avertissement si le dernier ping > 24h (via hook email/discord optionnel ?).

## 7. Prochaines Étapes

- **Planification :** Créer le Document des Exigences Produit (PRD).
- **Design :** Définir la structure des commandes CLI et le flux UX.
- **Développement :** Configurer le repo, la config TS, et l'échafaudage de base du CLI.
