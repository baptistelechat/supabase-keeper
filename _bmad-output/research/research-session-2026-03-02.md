# Session de Recherche : CLI Supabase Keeper

**Date :** 02/03/2026
**Sujet :** Recherche Marché & Technique pour "Supabase Keeper"
**Chercheur :** Business Analyst (via Trae)

## 1. Résumé Exécutif

Le projet "Supabase Keeper" vise à résoudre le problème de la "pause après 7 jours d'inactivité" sur les projets Supabase Free Tier via un CLI auto-hébergé et "offline-first". La recherche confirme un fort besoin pour cette solution, en particulier pour les utilisateurs préférant le contrôle local (Raspberry Pi/VPS) plutôt que de dépendre d'autres fournisseurs cloud (GitHub Actions, Vercel) pour maintenir leurs projets actifs.

## 2. Analyse de la Politique de l'Offre Gratuite Supabase

**Le Mécanisme de "Pause" :**

- **Déclencheur :** 7 jours d'inactivité.
- **Définition de l'inactivité :** Aucune requête API (REST/Realtime) et aucune utilisation du Dashboard.
- **Exclusions :** Visiter un site web statique hébergé ne compte PAS comme une activité.
- **Conséquence :** Le projet est "mis en pause" (instance arrêtée). La restauration prend environ 1 à 2 minutes.
- **Récupération :** Réactivation manuelle via le Dashboard ou le CLI.

**L'Exigence pour le "Fix" :**

- Une "interaction réelle" avec la base de données est requise.
- **Interactions Valides :**
  - Requête `SELECT` (ex: `SELECT 1` ou récupération d'une ligne).

## 3. Paysage Concurrentiel (Solutions Existantes)

La plupart des solutions existantes reposent sur une dépendance **Cloud-sur-Cloud** :

| Type de Solution          | Exemples                                                    | Avantages                              | Inconvénients                                                                 |
| ------------------------- | ----------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------- |
| **GitHub Actions**        | `supabase-keep-alive` (Python), `supabase-pause-prevention` | Gratuit, config facile, "Set & Forget" | Dépend de GitHub, confusion fuseaux horaires UTC, config YAML                 |
| **Edge Functions**        | Cron Interne / Déclencheur Externe                          | Rapide, vit avec le code               | Nécessite le déploiement d'une fonction, consomme des invocations             |
| **SaaS Pinger**           | Kaffeine, UptimeRobot                                       | Simple ping URL                        | **Peu fiable** (ping HTTP != activité BDD), échoue souvent à réveiller la BDD |
| **Scripts Personnalisés** | Scripts Python/Node sur Vercel                              | Flexible                               | Nécessite un autre déploiement cloud                                          |

**Opportunité pour Supabase Keeper :**
Il manque d'outils **"Install-Once, Run-Locally"**. Les solutions actuelles nécessitent de configurer un repo, des secrets dans une UI, ou de déployer du code. Un CLI `npm install -g supabase-keeper` qui tourne sur un serveur domestique correspond à une niche "Self-Host / Local-First".

## 4. Contraintes Techniques & Risques

### 4.1. Détection & Bannissement

- **Mythe :** "Supabase bannit les bots."
- **Réalité :** Il n'y a aucune preuve que Supabase bannit les comptes pour des pings de maintien en vie. La politique vise à économiser les ressources, pas à punir.
- **Risque :** Des pings à haute fréquence (ex: chaque minute) pourraient être limités (rate-limited) ou signalés comme abusifs.
- **Recommandation :** La fréquence de ping devrait être **Quotidienne** ou **Bi-hebdomadaire** (tous les 3-4 jours). Une fois par jour est sûr et suffisant.

### 4.2. API & Réseau

- **Restrictions Réseau :** Les utilisateurs peuvent avoir des listes blanches d'IP (allowlists). Un CLI local tournant sur une connexion domestique à IP dynamique pourrait échouer si la BDD a des `Network Restrictions` strictes.
- **Auth :** Service Role Key vs. Anon Key.
  - **Service Role :** Contourne la RLS (Row Level Security). Bon pour les outils d'admin mais dangereux si la config fuite.
  - **Anon Key :** Respecte la RLS. Nécessite une table lisible par `public` ou un utilisateur spécifique.
- **Recommandation :** Utiliser la **Service Role Key** pour la fiabilité (assure que le ping fonctionne indépendamment de la RLS) mais insister sur la **Sécurité** du fichier `.env` local.

## 5. Recommandations pour le CLI Supabase Keeper

Basé sur la recherche, le CLI devrait implémenter :

1. **Stratégie de "Smart Ping" :**
   - Par défaut : pings **Quotidiens** (suffisant et sûr).
   - Utiliser une requête légère : `SELECT 1` ou `SELECT id FROM table LIMIT 1`.
   - Éviter `INSERT` pour ne pas encombrer la base (sauf si utilisation d'une table `keep_alive` spécifique avec auto-nettoyage).

2. **Fonctionnalités de Résilience :**
   - **Logique de Réessai :** Si internet est coupé, réessayer toutes les heures.
   - **Logging :** Logs locaux avec rotation (`keep-alive.log`) pour prouver l'activité sans remplir le disque.

3. **Expérience Utilisateur :**
   - **Configuration Interactive :** Demander `SUPABASE_URL` et `KEY`.
   - **Générateur Systemd :** Générer et enregistrer automatiquement le fichier `.service` pour les utilisateurs Linux/Pi.
   - **Commande "Test Now" :** Ping immédiat pour vérifier la config.

4. **Différenciation :**
   - Le positionner comme l'alternative **"Privée & Locale"**. "Ne donnez pas vos clés API à un autre cloud."

## 6. Conclusion

Le projet est techniquement faisable et résout un vrai point de douleur. Le risque de bannissement est faible/inexistant si les pings sont raisonnables. La proposition de valeur principale est le **Contrôle** et la **Simplicité** pour les auto-hébergeurs.
