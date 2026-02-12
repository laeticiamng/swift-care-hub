# Audit Comparatif : UrgenceOS vs ResUrgences

**Date :** 12 février 2026
**Objet :** Étude de marché et audit technique comparatif
**Plateforme interne :** UrgenceOS (swift-care-hub)
**Concurrent analysé :** ResUrgences (Axigate Link / Groupe Equasens)

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Présentation des deux plateformes](#2-présentation-des-deux-plateformes)
3. [Comparatif fonctionnel détaillé](#3-comparatif-fonctionnel-détaillé)
4. [Analyse technique](#4-analyse-technique)
5. [Positionnement marché](#5-positionnement-marché)
6. [Analyse SWOT croisée](#6-analyse-swot-croisée)
7. [Étude de marché](#7-étude-de-marché)
8. [Verdict et recommandations](#8-verdict-et-recommandations)

---

## 1. Résumé exécutif

| Critère | UrgenceOS | ResUrgences |
|---------|-----------|-------------|
| **Maturité** | Prototype (v0.0.0) | Produit mature (100+ établissements) |
| **Déploiements** | 0 | 100+ dont 9 CHU |
| **Adossement** | Indépendant | Groupe Equasens (CA 116 M€ S1 2025) |
| **Architecture** | React/Supabase, 100% web | 100% web, cloud-native |
| **Score production** | 3.1/10 | Estimé 8+/10 (certifié HDS, LAP V5) |

**Verdict global : UrgenceOS n'est PAS encore "mieux" que ResUrgences en l'état actuel.** ResUrgences est un produit industriel déployé et certifié. UrgenceOS est un prototype prometteur avec un périmètre fonctionnel ambitieux mais non validé en conditions réelles. Cependant, UrgenceOS possède des atouts différenciants significatifs qui, une fois consolidés, pourraient constituer un avantage compétitif réel.

---

## 2. Présentation des deux plateformes

### 2.1 ResUrgences (Axigate Link)

- **Éditeur :** Axigate Link, division du Groupe Equasens
- **Historique :** Développé par Novaprove, acquis par Equasens en juillet 2025
- **Marché :** 100+ établissements, 8-9 CHU, 75 hôpitaux
- **CA estimé :** ~5 M€/an (activités DIS + ResUrgences combinées)
- **Équipe :** 270 collaborateurs (Axigate Link global), 30 dédiés ResUrgences/DIS
- **Certifications :** HDS, LAP V5, interopérabilité ANS

### 2.2 UrgenceOS (swift-care-hub)

- **Type :** Prototype/MVP open-source
- **Stack :** React 18 + TypeScript + Supabase + Shadcn/UI
- **Volume code :** ~31 000 lignes, 107 composants, 29 pages
- **Déploiements :** 0 (aucun environnement de production)
- **Version :** 0.0.0

---

## 3. Comparatif fonctionnel détaillé

### 3.1 Gestion des patients

| Fonctionnalité | UrgenceOS | ResUrgences | Avantage |
|----------------|-----------|-------------|----------|
| Accueil patient <90s | Conçu (UI implémentée) | Workflow optimisé en production | ResUrgences |
| Vérification identité INS | Simulée localement | Connectée au téléservice INS | ResUrgences |
| Détection homonymie | Implémentée (algorithme local) | Intégrée | **Parité** |
| Parcours patient temps réel | Board panoramique implémenté | Visualisation temps réel déployée | ResUrgences |
| Gestion multi-zones (SAU/UHCD/Déchoc) | Implémentée | Implémentée | **Parité** |

### 3.2 Triage et classification

| Fonctionnalité | UrgenceOS | ResUrgences | Avantage |
|----------------|-----------|-------------|----------|
| Triage IOA (5 étapes) | Wizard complet avec suggestion CIMU auto | Circuit d'accueil IOA optimisé | **UrgenceOS** |
| Classification CCMU/CIMU | Implémentée (1-5) | Implémentée | **Parité** |
| GEMSA | Implémenté | Non mentionné | **UrgenceOS** |
| Motifs SFMU | Codage standardisé | Non mentionné publiquement | **UrgenceOS** |

### 3.3 Prescription et administration

| Fonctionnalité | UrgenceOS | ResUrgences | Avantage |
|----------------|-----------|-------------|----------|
| Prescription médicamenteuse | 7+ types (titration, conditionnelle, O2...) | Certifiée LAP V5 | ResUrgences |
| Prescription pédiatrique | Non spécifiquement implémentée | Module dédié | ResUrgences |
| Administration 1-tap (5B) | Implémentée avec vérification pré-admin | Non détaillée publiquement | **UrgenceOS** |
| Vérification allergies | Détection automatique par famille | Non détaillée | **UrgenceOS** |
| Interactions médicamenteuses | 8+ règles implémentées | Incluse dans certification LAP | ResUrgences |

### 3.4 Interopérabilité

| Fonctionnalité | UrgenceOS | ResUrgences | Avantage |
|----------------|-----------|-------------|----------|
| FHIR R4 | Export complet (10+ ressources) | Non mentionné | **UrgenceOS** |
| HL7v2 | Génération partielle (export seul) | Intégré au SIH | ResUrgences |
| DMP | Non implémenté | Connecté | ResUrgences |
| MSSanté | Stub (non fonctionnel) | Intégré | ResUrgences |
| Apicrypt V2 | Non implémenté | Compatible | ResUrgences |
| Intégration SIH | Aucune | Multi-SIH validée en production | ResUrgences |
| Export RPU (ATIH) | Fonction générée, non intégrée UI | Fonctionnel en production | ResUrgences |
| Support GHT multi-sites | Non implémenté | Supporté | ResUrgences |
| INS IDL-SES ANS | Non implémenté | Conforme | ResUrgences |

### 3.5 Modules cliniques spécialisés

| Fonctionnalité | UrgenceOS | ResUrgences | Avantage |
|----------------|-----------|-------------|----------|
| Timeline unifiée | Implémentée (catégorisée) | Non détaillée | **UrgenceOS** |
| Alertes labo critiques | 3 niveaux d'escalade | Non détaillée | **UrgenceOS** |
| Communications inter-soignants | 4 types audités | Non détaillée | **UrgenceOS** |
| Garde et relève | Planning + documentation relève | Non détaillé | **UrgenceOS** |
| Piste d'audit | Exhaustive (immutable) | Non détaillée | **UrgenceOS** |
| Statistiques temps réel | Partiellement implémenté | Exports et requêtes personnalisées | ResUrgences |
| Configuration no-code | Non implémenté | Formulaires/questionnaires no-code | ResUrgences |

### 3.6 Rôles et parcours utilisateur

| Rôle | UrgenceOS | ResUrgences |
|------|-----------|-------------|
| Médecin urgentiste | Page dédiée (Board, Dossier, Prescription) | Couvert |
| IOA | Wizard triage dédié | Circuit IOA optimisé |
| IDE (infirmier) | Pancarte infirmière 1-tap | Couvert |
| Aide-soignant | Page saisie rapide constantes | Non détaillé |
| Secrétaire | Page accueil dédiée | Couvert |

**Avantage UrgenceOS :** 5 rôles distincts avec interfaces dédiées et optimisées par métier.

---

## 4. Analyse technique

### 4.1 Architecture

| Critère | UrgenceOS | ResUrgences |
|---------|-----------|-------------|
| **Frontend** | React 18 + TypeScript + Vite | Non divulgué (100% web) |
| **Backend** | Supabase (PostgreSQL) | Infrastructure propriétaire |
| **Hébergement** | Supabase Cloud | HDS certifié |
| **Temps réel** | Supabase Realtime (4 tables) | Temps réel confirmé |
| **PWA/Offline** | Service Worker minimal (2/10) | Non détaillé |
| **CI/CD** | Aucun | Assumé en place (produit mature) |

### 4.2 Sécurité (point critique)

| Critère | UrgenceOS | ResUrgences | Risque |
|---------|-----------|-------------|--------|
| Hébergement HDS | Non | Oui (certifié) | **BLOQUANT** |
| Certification LAP | Non | V5 certifié | **BLOQUANT** |
| RLS complète | Partielle (3 tables sans RLS) | Assumée complète | Critique |
| Secrets exposés | .env dans le repo | Non (procédures industrielles) | Critique |
| Rôles côté serveur | Non (sessionStorage) | Oui (serveur) | Critique |
| CSP Headers | Non | Assumé oui | Élevé |
| Tests de sécurité | 0 | Audits réguliers (produit certifié) | **BLOQUANT** |

### 4.3 Qualité du code

| Critère | UrgenceOS | ResUrgences |
|---------|-----------|-------------|
| Tests unitaires | 1 test trivial (0% couverture) | Non divulgué (certifié → testé) |
| Tests E2E | 0 | Non divulgué |
| Documentation technique | Minimale | Documentation produit complète |
| Modèle de données | Excellent (canonical model + provenance) | Mature (100+ déploiements) |

---

## 5. Positionnement marché

### 5.1 Matrice de positionnement

```
                    MATURITÉ PRODUIT
                    Faible ──────────────── Élevée
                    │                        │
    INNOVATION   E  │  UrgenceOS             │
    Élevée       l  │  (prototype innovant)  │  [Zone cible]
                 e  │                        │
                 v  │                        │
                 é  ├────────────────────────┤
                 e  │                        │
    INNOVATION      │                        │  ResUrgences
    Modérée         │                        │  (produit établi)
                    │                        │
                    └────────────────────────┘
```

### 5.2 Différenciateurs clés d'UrgenceOS

1. **Administration médicamenteuse 1-tap** avec vérification 5B pré-intégrée
2. **Export FHIR R4 natif** (10+ types de ressources) — rare sur le marché français
3. **5 interfaces métier dédiées** (vs interface unique adaptée par rôle)
4. **Timeline unifiée catégorisée** avec provenance des données
5. **Alertes labo à 3 niveaux** avec escalade automatique
6. **Stack moderne** (React 18, TypeScript, Supabase) facilitant le recrutement de développeurs
7. **Dark mode natif** optimisé pour environnements à faible luminosité (urgences de nuit)
8. **Détection automatique d'allergies par famille** (β-lactamines, AINS, morphiniques)

### 5.3 Avantages concurrentiels de ResUrgences

1. **100+ déploiements** — preuve de concept validée en conditions réelles
2. **Certifications** (HDS, LAP V5, ANS) — obligatoires pour le marché hospitalier public
3. **Adossement Equasens** (CA 116 M€) — pérennité financière et force commerciale
4. **Intégration SIH complète** (DMP, MSSanté, Apicrypt, GHT)
5. **270 collaborateurs** et support dédié
6. **Configuration no-code** — adaptabilité sans développeur
7. **Intégration Hospilink** — convergence vers un DPI complet
8. **Réseau commercial** établi dans les CHU et GHT

---

## 6. Analyse SWOT croisée

### 6.1 UrgenceOS

| Forces | Faiblesses |
|--------|------------|
| Stack technique moderne et maintenable | Aucun déploiement réel |
| UX différenciante (5 rôles, 1-tap admin) | Sécurité critique (HDS absent, RLS partielle) |
| FHIR R4 natif | 0% couverture de tests |
| Modèle canonique riche (provenance) | Interopérabilité réelle = 0 (stubs) |
| Dark mode pour environnement urgences | Offline non fonctionnel |
| Open source (potentiel communautaire) | Pas de certification LAP |

| Opportunités | Menaces |
|-------------|---------|
| Marché en consolidation post-Ségur | ResUrgences + Equasens = force de frappe majeure |
| Demande d'interopérabilité FHIR croissante | Exigences réglementaires (HDS, LAP) = barrières à l'entrée |
| IA intégrée (aide au triage, NLP) | Concurrents établis (Maincare, Dedalus, Evolucare) |
| Segment PME/cliniques mal servi | Budget des hôpitaux en baisse post-Ségur |
| PWA/offline pour zones mal connectées | Temps de mise sur marché vs concurrence |

### 6.2 ResUrgences

| Forces | Faiblesses |
|--------|------------|
| 100+ déploiements prouvés | Innovation UI potentiellement plus lente (legacy) |
| Certifications HDS + LAP V5 | Dépendance au groupe Equasens (priorités) |
| Intégration SIH complète | FHIR R4 non mentionné (HL7v2 legacy ?) |
| Support 270 collaborateurs | Pas de mode offline mentionné |
| Configuration no-code | Stack technique non divulgué |
| Force commerciale CHU/GHT | |

| Opportunités | Menaces |
|-------------|---------|
| Intégration Hospilink → DPI complet | Nouveaux entrants avec techno moderne |
| 5 000 clients Axigate (cross-sell) | Open source hospitalier (Sillage) |
| IA et analytics avancées | Pression tarifaire post-Ségur |
| Expansion internationale | Concurrence DPI intégrés (Maincare, Dedalus) |

---

## 7. Étude de marché

### 7.1 Taille et structure du marché

- **Marché SIH France :** ~2,5 milliards € (logiciels, matériels, services IT santé)
- **Programme Ségur numérique :** 2 milliards € injectés (effet catalyseur en fin de cycle)
- **Segment urgences :** Estimé 50-100 M€/an (logiciels spécialisés urgences)
- **Nombre d'établissements cibles :** ~600 services d'urgences en France

### 7.2 Concurrents directs (logiciels urgences)

| Éditeur | Produit | Forces | Parts de marché estimées |
|---------|---------|--------|--------------------------|
| **Axigate Link** | ResUrgences | 100+ sites, 9 CHU, certifié | ~15-17% |
| **Berger-Levrault** | ResUrgences (anciennement distribué) | Réseau BL | Inclus ci-dessus |
| **Apigem** | Apigem Urgences | Ambulatoire + hospitalier, RPU | ~5-10% |
| **Evolucare** | HopitalWeb (module urgences) | DPI intégré MCO | ~10-15% |
| **Maincare** | M-CrossWay (module urgences) | Leader DPI CHU | ~15-20% |
| **Dedalus** | DxCare (module urgences) | Leader international | ~10-15% |
| **Softway Medical** | Module urgences | Montée en puissance | ~5-10% |
| **Tildev** | Solutions pré-hospitalier | Niche SAMU/SMUR | ~3-5% |
| **Sillage** | Open source (module urgences) | Consortiums publics | ~5-8% |

### 7.3 Tendances clés 2025-2026

1. **Consolidation :** Acquisitions en série (Equasens/ResUrgences, CPage/Hopsis)
2. **IA clinique :** Transcription vocale, aide au triage, analyse d'imagerie
3. **Interopérabilité :** Migration progressive HL7v2 → FHIR R4
4. **Souveraineté numérique :** Cloud souverain, hébergement HDS
5. **Fin du Ségur :** Obligation de démontrer un ROI rapide
6. **Convergence DPI :** Les modules spécialisés s'intègrent dans les DPI globaux

### 7.4 Barrières à l'entrée

| Barrière | Niveau | Impact UrgenceOS |
|----------|--------|------------------|
| Certification HDS | Très élevé | **BLOQUANT** — Obligatoire pour héberger des données de santé |
| Certification LAP | Très élevé | **BLOQUANT** — Obligatoire pour la prescription électronique |
| Référencement ATIH/RELIMS | Élevé | Nécessaire pour visibilité institutionnelle |
| Homologation INS/ANS | Élevé | Requis pour l'identité patient |
| Réseau commercial santé | Élevé | Cycle de vente long (6-18 mois) en milieu hospitalier |
| Conformité RGPD santé | Moyen | Implémentation nécessaire (stubs actuels) |
| Interopérabilité SIH | Moyen | Intégration HL7v2/FHIR avec systèmes existants |

---

## 8. Verdict et recommandations

### 8.1 Verdict honnête

**UrgenceOS ne peut pas être considéré comme "mieux" que ResUrgences aujourd'hui.** La comparaison se fait entre un prototype ambitieux (v0.0.0, 0 déploiement, 0 certification) et un produit industriel déployé dans 100+ hôpitaux avec toutes les certifications requises.

Cependant, **UrgenceOS présente des innovations réelles** qui pourraient devenir des avantages concurrentiels majeurs une fois le produit industrialisé :

### 8.2 Ce qui est réellement mieux dans UrgenceOS

| Avantage | Détail | Impact potentiel |
|----------|--------|------------------|
| **UX métier dédiée** | 5 interfaces optimisées par rôle vs interface unique | Réduction du temps de formation, adoption plus rapide |
| **Administration 1-tap** | Vérification 5B intégrée, réduction des clics | Gain de temps infirmier quantifiable |
| **FHIR R4 natif** | 10+ types de ressources exportables | Prêt pour la transition HL7v2→FHIR (tendance marché) |
| **Modèle canonique** | Provenance des données (humain, HL7, FHIR, IA, protocole) | Traçabilité supérieure, préparation IA |
| **Alertes labo 3 niveaux** | Escalade automatique graduée | Meilleure gestion des résultats critiques |
| **Stack moderne** | React 18/TS/Vite vs stacks potentiellement legacy | Maintenabilité et recrutement développeurs |
| **Dark mode natif** | Optimisé pour urgences nocturnes | Confort visuel, réduction fatigue oculaire |

### 8.3 Ce qui doit impérativement être corrigé

**Phase 1 — Sécurité (BLOQUANT, priorité immédiate)**
- [ ] Retirer .env du repository et révoquer les clés exposées
- [ ] Implémenter la vérification des rôles côté serveur (pas sessionStorage)
- [ ] Ajouter RLS sur allergies, conditions, care_plans
- [ ] Restreindre RLS sur communications, lab_alerts, guard_schedule
- [ ] Fermer l'endpoint signUp (mode invitation uniquement)
- [ ] Ajouter les headers CSP

**Phase 2 — Tests (BLOQUANT)**
- [ ] Écrire 50+ tests unitaires (Auth, Offline, Audit, FHIR, Allergies)
- [ ] Ajouter tests de composants (Triage, Pancarte, Board)
- [ ] Mettre en place CI/CD (GitHub Actions)
- [ ] Viser 60%+ de couverture de code

**Phase 3 — Certifications (STRATÉGIQUE)**
- [ ] Obtenir l'hébergement HDS (partenariat hébergeur certifié)
- [ ] Lancer le processus de certification LAP V5
- [ ] Se référencer sur RELIMS (ATIH)
- [ ] Obtenir la conformité INS/ANS

**Phase 4 — Interopérabilité réelle**
- [ ] Connecter le téléservice INS (pas juste simuler)
- [ ] Implémenter l'import FHIR (pas seulement l'export)
- [ ] Intégrer MSSanté (SMTP réel)
- [ ] Valider l'export RPU avec ATIH
- [ ] Tester l'intégration HL7v2 avec un SIH réel

**Phase 5 — Production**
- [ ] Migrer offline-queue vers IndexedDB (Dexie.js)
- [ ] Implémenter le cache patient offline complet
- [ ] Ajouter Workbox pour le pre-caching des assets
- [ ] Déployer un environnement de staging sur hébergement HDS
- [ ] Réaliser un pilote dans un établissement

### 8.4 Stratégie de positionnement recommandée

Plutôt que d'attaquer frontalement ResUrgences sur le marché CHU (où Equasens a une position dominante), UrgenceOS devrait viser :

1. **Segment cliniques privées et hôpitaux de proximité** — Moins exigeants sur les intégrations SIH, plus sensibles à l'UX moderne
2. **Positionnement "next-gen"** — Mettre en avant FHIR R4, IA, interfaces métier dédiées
3. **Modèle SaaS accessible** — Tarification agressive vs les contrats institutionnels lourds de ResUrgences
4. **Open source comme levier** — Attirer les GHT souhaitant la souveraineté numérique (modèle Sillage)
5. **Innovation IA** — Intégrer l'aide au triage, la transcription vocale, l'analyse prédictive (tendance marché 2026)

### 8.5 Score comparatif final

| Domaine | UrgenceOS | ResUrgences | Pondération marché |
|---------|-----------|-------------|-------------------|
| Innovation UX | **8/10** | 6/10 | 15% |
| Fonctionnalités cliniques | 7/10 | **8/10** | 20% |
| Sécurité & conformité | 2/10 | **9/10** | 25% |
| Interopérabilité réelle | 2/10 | **9/10** | 20% |
| Tests & fiabilité | 1/10 | **8/10** | 10% |
| Stack & maintenabilité | **9/10** | 6/10 | 5% |
| Déploiements & preuves | 0/10 | **10/10** | 5% |
| **Score pondéré** | **3.8/10** | **8.2/10** | 100% |

---

## Sources

- [ResUrgences — Axigate Link](https://axigatelink.com/solutions/resurgences/)
- [Equasens — Acquisition DIS et ResUrgences (juin 2025)](https://www.globenewswire.com/news-release/2025/06/30/3107714/0/fr/EQUASENS-ACQUISITION-DES-ACTIVITES-DIS-ET-RESURGENCES.html)
- [Equasens — CA S1 2025](https://www.globenewswire.com/fr/news-release/2025/07/31/3125240/0/fr/EQUASENS-Chiffre-d-affaires-au-30-juin-2025-%C3%A0-116-0-M.html)
- [Axigate Link — Stratégie DSIH](https://dsih.fr/articles/6050/apporter-de-la-simplicite-sans-etre-simplistes-la-voie-daxigate-link)
- [Xerfi — Marché SISH France](https://www.xerfi.com/presentationetude/le-marche-des-systemes-d-information-sante-et-hospitalier_CHE49)
- [Bpifrance — Panorama Healthtech France](https://www.bpifrance.fr/nos-dossiers/panorama-de-la-healthtech-en-france-chiffres-cles-tendances-et-acteurs-majeurs)
- [ATIH — Observatoire RELIMS](https://www.atih.sante.fr/autres/relims)
- [Evolucare — HopitalWeb](https://www.evolucare.com/fr/systeme-information-mco/)
- [Apigem Urgences](https://www.apigem.com/urgence.html)
- [Appvizer — Logiciels gestion hôpitaux 2026](https://www.appvizer.com/health/hospital-mgt)
- [LonaSanté — Logiciels DPI 2026](https://www.lonasante.com/dossier-patient-informatise-dpi/)

---

*Rapport généré le 12 février 2026 — Audit technique basé sur l'analyse du code source UrgenceOS et les informations publiques de ResUrgences.*
