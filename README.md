# UrgenceOS

**Le système d'exploitation des urgences hospitalières.**

UrgenceOS est une application web temps réel conçue pour digitaliser et fluidifier l'ensemble du parcours patient aux urgences — de l'admission à la sortie — avec des interfaces adaptées à chaque profil soignant.

De **6-8 clics à 1 seul tap** pour chaque administration médicamenteuse.

---

## État de la plateforme après audit frontend/backend

L’audit fonctionnel du front a mis en évidence plusieurs écarts entre le backend Supabase déjà présent et certaines vues utilisateur encore alimentées par des jeux de démonstration. La plateforme est maintenant réalignée sur les vraies tables backend pour les écrans critiques côté utilisateur.

### Correctifs structurants livrés

- **Suppression des dépendances mockées** sur les flux utilisateurs critiques :
  - board temps réel ;
  - dossier patient ;
  - page aide-soignant ;
  - statistiques ;
  - garde multi-services ;
  - audit qualité / traçabilité.
- **Connexion directe aux tables Supabase** existantes : `encounters`, `patients`, `vitals`, `results`, `prescriptions`, `timeline_items`, `lab_alerts`, `communications`, `guard_schedule`, `audit_logs`.
- **Reconstruction côté frontend des vues SIH** à partir des données live du backend : timeline unifiée, alertes biologiques critiques, garde, indicateurs qualité.
- **Nettoyage typage** : vérification des usages `@ts-nocheck` et stabilisation des typages sur les flux SIH live.
- **Amélioration ergonomique visuelle** : surfaces premium “3D 2026” discrètes sur les cartes et zones d’attention sans nuire à la lisibilité clinique.

> **Principe produit** : aucune donnée mockée n’est utilisée sur les parcours utilisateurs opérationnels.

---

## Fonctionnalités principales

| Module | Description |
|---|---|
| **Landing Page** | Vitrine marketing avec sections Hero, problème, solution, innovations, sécurité, CTA |
| **Board panoramique** | Vue temps réel des patients par zone avec affectation, alertes labo, filtres et plan |
| **Dossier Patient** | Timeline clinique unifiée, prescriptions, résultats, constantes, communications, FHIR/CRH |
| **Pancarte IDE** | Interface unifiée infirmière : administrations 1-tap, transmissions DAR, actes |
| **Tri IOA** | Wizard 5 étapes avec suggestion CIMU et orientation en box/zone |
| **Interface Aide-Soignant** | Saisie rapide des constantes, surveillance, brancardage, confort |
| **Accueil Secrétaire** | Admission patient, recherche d’homonymie, INS, ouverture de passage |
| **Mode Garde** | Vue multi-services basée sur `guard_schedule` et `lab_alerts` live |
| **Audit / Qualité** | KPIs, conformité, traçabilité, indicateurs qualité calculés depuis la base |

---

## Profils utilisateurs

| Rôle | Accès principal | Route | Source de vérité |
|---|---|---|---|
| **Médecin** | Board, dossier, prescriptions, audit, garde | `/board` | `user_roles` |
| **IOA** | File d'attente, triage, board | `/ioa-queue` | `user_roles` |
| **IDE** | Board, pancarte, constantes, dossier | `/board` puis `/pancarte/:id` | `user_roles` |
| **Aide-soignant** | Constantes, surveillance, confort, brancardage | `/as` | `user_roles` |
| **Secrétaire** | Admission et accueil | `/accueil` | `user_roles` |

---

## Stack technique

- **Frontend** : React 18 · TypeScript · Vite
- **UI** : Tailwind CSS · Shadcn/UI · Lucide React
- **State** : TanStack React Query · subscriptions temps réel Supabase
- **Backend** : Supabase (PostgreSQL, Auth, Edge Functions, RLS)
- **Graphiques** : Recharts
- **Thème** : next-themes (dark/light mode)
- **Validation** : Zod

---

## Design System

### Couleurs sémantiques médicales

| Token | Usage |
|---|---|
| `--medical-critical` | Rouge — alertes, allergies, résultats critiques |
| `--medical-warning` | Orange — attente prolongée, points d’attention |
| `--medical-success` | Vert — normal, administré, conforme |
| `--medical-info` | Bleu — informations, triage, board |
| `--muted` | Gris — éléments secondaires |

### Règles UX

- **3 clics maximum** pour toute action critique
- **Zéro popup bloquant** — privilégier toasts, bannières, drawers
- **Mobile-first** — touch targets ≥ 44px
- **Temps réel** — mise à jour automatique sans rechargement
- **Dark mode** — thème sombre complet disponible
- **3D premium 2026 utile uniquement** — relief visuel léger sur les cartes KPI, board et audits, sans surcharge cognitive

### Favicon

Favicon SVG personnalisé : cercle bleu `#2b7fc3` avec la lettre « U » blanche, intégré en inline dans `index.html`.

---

## Backend réellement exploité par le frontend

### Tables principales

| Table | Usage frontend actuel |
|---|---|
| `patients` | Identité, homonymie, allergies, antécédents, photo, INS |
| `encounters` | Parcours urgences, zone, box, statut, CCMU/CIMU |
| `vitals` | Constantes cliniques et tendances |
| `prescriptions` | Prescriptions actives et historique |
| `administrations` | Dernières administrations côté board IDE |
| `procedures` | Surveillance, confort, brancardage, actes |
| `results` | Résultats bio / ECG / imagerie |
| `timeline_items` | Chronologie clinique métier |
| `communications` | Appels labo, infos orales, transmissions inter-services |
| `lab_alerts` | Alertes critiques avec acquittement obligatoire |
| `guard_schedule` | Organisation multi-services de garde |
| `audit_logs` | Journal d’audit et traçabilité |
| `profiles` | Annuaire personnel soignant |
| `user_roles` | Rôles applicatifs par utilisateur |

### Temps réel activé côté produit

- `encounters` — mouvements patients sur le board
- `results` — nouveaux résultats et résultats critiques
- `prescriptions` — prescriptions ou changements de statut
- `lab_alerts` — alertes critiques et acquittements
- `communications` — appels labo et communications structurées
- `guard_schedule` — changements d’équipe de garde

---

## Sécurité

- **Row Level Security (RLS)** active sur les tables cliniques
- **Politiques par rôle** : chaque profil accède uniquement aux données nécessaires
- **Audit trail** : actions critiques journalisées dans `audit_logs`
- **Authentification** : email/mot de passe via Supabase Auth
- **MFA** : exigée pour les rôles médicaux selon le contexte applicatif

---

## Installation locale

### Pré-requis

- Node.js 20+
- npm 10+
- un projet Supabase configuré

### Variables d’environnement

Créer un fichier `.env.local` ou `.env` avec :

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

### Démarrage

```bash
# Cloner le dépôt
git clone <YOUR_GIT_URL>
cd swift-care-hub

# Installer les dépendances
npm install

# Lancer le front
npm run dev
```

Application disponible sur `http://localhost:5173`.

### Base locale / migrations

```bash
# Démarrer Supabase localement
supabase start

# Appliquer les migrations
supabase db reset
```

---

## Vérifications recommandées après bootstrap

- créer au moins un utilisateur et lui attribuer un rôle dans `user_roles` ;
- vérifier la présence de données réelles dans `patients`, `encounters` et `results` ;
- tester le board, le dossier patient, les alertes labo et la page garde ;
- vérifier les politiques RLS sur `lab_alerts`, `communications` et `guard_schedule`.

---

## Licence

Projet interne — usage hospitalier uniquement.
