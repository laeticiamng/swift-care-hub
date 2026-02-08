# UrgenceOS

**Le système d'exploitation des urgences hospitalières.**

UrgenceOS est une application web temps réel conçue pour digitaliser et fluidifier l'ensemble du parcours patient aux urgences — de l'admission à la sortie — avec des interfaces adaptées à chaque profil soignant.

De **6-8 clics à 1 seul tap** pour chaque administration médicamenteuse.

---

## Fonctionnalités principales

| Module | Description |
|---|---|
| **Landing Page** | Vitrine marketing avec sections Hero, Problème, Comment ça marche, Rôles, Features, Impact, CTA |
| **Board panoramique** | Vue temps réel de tous les patients par zone (SAU, UHCD, Déchocage) |
| **Dossier Patient** | Timeline médicale, prescriptions avec contrôle allergies, résultats, constantes |
| **Pancarte IDE** | Interface unifiée infirmière : administrations 1-tap, transmissions DAR, actes |
| **Tri IOA** | Wizard 5 étapes avec suggestion CIMU automatique |
| **Interface Aide-Soignant** | Saisie rapide des constantes avec alertes visuelles |
| **Accueil Secrétaire** | Admission patient < 90s, recherche par nom/INS |

---

## Profils utilisateurs

| Rôle | Accès principal | Route | Email de test |
|---|---|---|---|
| **Médecin** | Board + Dossier Patient + Prescriptions | `/board` | `martin@urgenceos.fr` |
| **IOA** | File d'attente + Tri patients | `/ioa-queue` | `sophie@urgenceos.fr` |
| **IDE** | Board + Pancarte (administrations, actes) | `/board` → `/pancarte/:id` | `julie@urgenceos.fr` |
| **Aide-soignant** | Constantes + Surveillance | `/as` | `marc@urgenceos.fr` |
| **Secrétaire** | Admissions + Accueil | `/accueil` | `nathalie@urgenceos.fr` |

> **Mot de passe commun** : `urgenceos2026`

---

## Stack technique

- **Frontend** : React 18 · TypeScript · Vite
- **UI** : Tailwind CSS · Shadcn/UI · Lucide React
- **State** : TanStack React Query · Realtime subscriptions
- **Backend** : Lovable Cloud (PostgreSQL, Auth, Edge Functions, RLS)
- **Graphiques** : Recharts
- **Thème** : next-themes (dark/light mode)
- **Validation** : Zod

---

## Design System

### Couleurs sémantiques médicales

| Token | Usage |
|---|---|
| `--medical-critical` | Rouge — Alertes, allergies, CCMU 1 |
| `--medical-warning` | Orange — Attente prolongée, CCMU 2-3 |
| `--medical-success` | Vert — Normal, administré, CCMU 4-5 |
| `--medical-info` | Bleu — Informations, médecin |
| `--muted` | Gris — Éléments secondaires |

### Règles UX

- **3 clics maximum** pour toute action critique
- **Zéro popup bloquant** — toasts et banners uniquement
- **Mobile-first** — touch targets ≥ 44px
- **Temps réel** — mise à jour automatique sans rechargement
- **Dark mode** — thème sombre complet disponible

### Favicon

Favicon SVG personnalisé : cercle bleu `#2b7fc3` avec la lettre « U » blanche, intégré en inline dans `index.html`.

---

## Base de données

### Tables principales

| Table | Description |
|---|---|
| `patients` | Identité, allergies, antécédents, traitements |
| `encounters` | Passages aux urgences (zone, CCMU, CIMU, statut) |
| `vitals` | Constantes (PA, FC, SpO2, T°, FR, GCS, EVA) |
| `prescriptions` | Prescriptions médicamenteuses avec priorité |
| `administrations` | Traçabilité des administrations IDE |
| `procedures` | Actes infirmiers (VVP, prélèvement, ECG…) |
| `transmissions` | Transmissions ciblées DAR |
| `results` | Résultats (biologie, imagerie, ECG) |
| `timeline_items` | Historique médical structuré |
| `audit_logs` | Journal d'audit complet |
| `profiles` | Profils utilisateurs |
| `user_roles` | Attribution des rôles par utilisateur |

---

## Sécurité

- **Row Level Security (RLS)** active sur toutes les tables
- **Politiques par rôle** : chaque profil accède uniquement aux données nécessaires
- **Audit trail** : toutes les actions critiques sont journalisées (`audit_logs`)
- **Authentification** : email/mot de passe via le système d'auth intégré

---

## Temps réel

Les tables suivantes sont synchronisées en temps réel :

- `encounters` — mouvements patients sur le board
- `prescriptions` — nouvelles prescriptions
- `results` — résultats critiques
- `vitals` — constantes mises à jour

---

## Installation locale

```bash
# Cloner le dépôt
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

---

## Licence

Projet interne — Usage hospitalier uniquement.
