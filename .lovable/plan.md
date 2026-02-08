

# 🏥 UrgenceOS — Plan d'implémentation

## Vision
Un **Operating System de workflow urgences hospitalières** : une PWA React où chaque profil (Médecin, IOA, IDE, Aide-soignant, Secrétaire) voit uniquement ce qui est pertinent pour son rôle. Design Apple-like, minimaliste, code couleur sémantique strict.

---

## Phase 1 — Fondations & Authentification

### Design System
- Palette sémantique : rouge (critique), orange (attention), vert (normal), bleu (en cours), gris (inactif)
- Typographie Inter, touch targets 44px+, grid 8px, style minimaliste avec cards à ombres subtiles
- Composants réutilisables de base : `CCMUBadge`, `PatientBanner`, `AlertBanner`, `BigButton`, `StatCard`

### Base de données Supabase
- Création de toutes les tables : profiles, patients, encounters, vitals, prescriptions, administrations, procedures, transmissions, results, timeline_items, audit_logs
- Table `user_roles` séparée avec enum (medecin, ioa, ide, as, secretaire)
- Row Level Security par rôle (AS ne voit jamais les prescriptions, Secrétaire jamais les données cliniques)
- Activation Realtime sur encounters, prescriptions, results

### Auth & Rôles
- Page de connexion email/mot de passe
- Sélection du rôle après login (cards visuelles avec icône par profil)
- Redirection automatique selon le rôle sélectionné
- Route guards par rôle

### Seed Data
- 15-20 patients avec variété d'âges, motifs, CCMU, zones, allergies, antécédents
- 5 utilisateurs de test (Dr. Martin, Sophie IOA, Julie IDE, Marc AS, Nathalie Accueil)
- Constantes vitales, prescriptions, résultats bio, timeline items

---

## Phase 2 — Les 5 interfaces par rôle (premier passage complet)

### 🩺 Board Médecin (écran principal)
- 3 colonnes : SAU, UHCD, Déchocage
- Cartes patient avec nom, âge, motif, CCMU coloré, temps d'attente (rouge si >4h)
- Badges résultats bio/imagerie arrivés
- Compteurs par zone dans le header
- Filtre "Mes patients"
- Bouton de réassignation de zone (dropdown, pas de drag & drop initial)
- Clic sur carte → ouvre le dossier patient

### 📋 Dossier Patient Médecin
- Bandeau patient sticky (identité, CCMU, allergies en rouge, motif)
- Timeline chronologique (antécédents, allergies, traitements, CRH, résultats) avec source et date
- Zone prescriptions avec modal 3 étapes (recherche médicament, posologie, validation)
- Sparklines des constantes vitales avec points rouges si anormales
- Panneau résultats avec liseré rouge si critique

### 🔄 Workflow Tri IOA (5 étapes)
- Progress bar horizontale 5 étapes
- Étape 1 : Identité (pré-remplissage si patient connu)
- Étape 2 : Motif (autocomplete thésaurus SFMU + chips top 10)
- Étape 3 : Constantes (gros champs numériques, highlight rouge auto si anormale)
- Étape 4 : Classification CIMU (5 gros boutons colorés + suggestion auto)
- Étape 5 : Orientation (choix zone + médecin → patient apparaît sur le board)

### 💊 Pancarte IDE (innovation clé — UN seul écran)
- Bandeau patient sticky
- Section constantes avec saisie inline et sparklines
- Section prescriptions : chaque ligne avec bouton **✓ Administré en 1 tap** (horodatage auto, transition gris→vert)
- Section actes de soins (1 tap = acte tracé)
- Section transmissions DAR (D+A auto-alimentées, R en texte libre)
- Section résultats (badge compteur, liseré rouge si critique)

### 🟦 Interface Aide-Soignant (ultra simple)
- 4 gros boutons en grille 2×2 (Constantes, Surveillance, Brancardage, Confort)
- Zéro donnée médicale visible
- Zones tactiles 60px, texte 18pt
- Sélecteur patient en haut

### 📝 Interface Secrétaire / Accueil
- Formulaire admission en 1 page (< 90 secondes)
- Pré-remplissage si patient connu
- Liste des patients admis aujourd'hui avec statut

---

## Phase 3 — Temps réel & Règles métier

### Realtime Supabase
- Board : nouveau patient apparaît en live, changements de statut mis à jour
- Pancarte IDE : nouvelles prescriptions apparaissent instantanément
- File IOA : nouveau patient admis par secrétaire visible immédiatement

### Règles métier critiques
- Allergies toujours en rouge, alerte bloquante si prescription incompatible
- Résultats critiques avec liseré rouge + badge
- Temps d'attente coloré (orange >2h, rouge >4h)
- Constantes anormales highlight automatique selon seuils définis
- Administration 1 tap = insert + update statut + auto-feed DAR

---

## Résultat attendu
Une application complète et fonctionnelle avec 5 interfaces métier distinctes, un backend Supabase avec données réalistes, sécurité par rôle, et mises à jour temps réel — le tout dans un design élégant et minimaliste pensé pour le geste clinique.

