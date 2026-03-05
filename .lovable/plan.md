

# Audit complet UrgenceOS — Ce qui manque pour être unique et révolutionnaire

## Ce qui est deja solide (acquis)

| Domaine | Score |
|---|---|
| Sécurité (RLS, MFA, audit, rate limiting) | 10/10 |
| Architecture rôles (5 profils, guards, RLS par rôle) | 9/10 |
| Modèle de données canonique (FHIR-aligned) | 9/10 |
| Interopérabilité (FHIR R4, HL7v2, MSSanté, DMP) | 8/10 |
| Board panoramique temps réel | 8/10 |
| Pancarte IDE (1-tap admin, titrations, perfusions) | 9/10 |
| Triage IA (règles, NEWS, qSOFA, diagnostics différentiels) | 8/10 |
| Offline queue + PWA | 7/10 |
| KPI tracker (temps tri, taps admin) | 7/10 |
| Landing + SEO/GEO | 8/10 |

---

## Ce qui manque — 12 axes pour passer de "bon produit" a "révolutionnaire"

### AXE 1 — IA Générative intégrée au workflow clinique
**Statut : absent. Différenciateur majeur.**

Le module `ai-triage.ts` est un moteur de règles statiques (if/else). Aucune IA générative n'est utilisée.

Fonctionnalités manquantes :
- **Synthèse automatique du dossier** : un LLM génère un résumé structuré (antécédents, constantes, résultats) en 1 clic pour la relève ou le CRH, via Lovable AI (Gemini/GPT)
- **Aide à la prescription** : suggestion de protocoles basés sur le motif + constantes + allergies + poids
- **Dictée vocale → structuration** : le médecin dicte, l'IA structure en observation clinique formatée
- **Pré-remplissage CRH intelligent** : le CRH est généré par IA à partir de toute la timeline, pas juste un template statique

### AXE 2 — Notifications push temps réel
**Statut : absent.**

Le realtime est en place (Supabase channels) mais il n'y a aucune notification push (ni browser push, ni son, ni vibration).

Manque :
- Alerte sonore pour résultat critique (biologie, imagerie)
- Notification push navigateur quand un patient est assigné au médecin
- Badge de notification dans le header avec compteur non-lu
- Son distinctif par type d'alerte (critique vs info)

### AXE 3 — Drag & Drop sur le Board
**Statut : absent.**

Le board affiche les patients par zone/box mais le déplacement se fait par menu. Aucun drag & drop.

Manque :
- Drag & drop d'un patient entre zones (SAU → UHCD → Déchocage)
- Drag & drop vers un box libre
- Feedback visuel de la zone cible (highlight)

### AXE 4 — Messagerie inter-soignants temps réel
**Statut : absent. Critique pour la coordination.**

Il n'existe aucun système de communication directe entre soignants.

Manque :
- Chat contextuel par patient (médecin ↔ IDE ↔ IOA)
- Canal d'équipe par zone/service
- Messages urgents avec accusé de réception
- Intégration avec la timeline patient

### AXE 5 — Tableau de bord statistiques connecté aux vraies données
**Statut : mock data uniquement.**

`StatisticsPage.tsx` utilise des données mockées en dur. Aucune requête DB.

Manque :
- KPIs calculés depuis les tables réelles (temps moyen de passage, taux d'occupation, CCMU distribution)
- Graphiques temporels (affluence par heure, par jour)
- Export PDF/CSV des indicateurs
- Benchmark vs objectifs nationaux (SFMU)

### AXE 6 — Gestion des lits et capacité
**Statut : rudimentaire.**

Le `box-config.ts` définit des zones statiques mais il n'y a pas de gestion dynamique de la capacité.

Manque :
- Vue capacité en temps réel (lits occupés / disponibles par zone)
- Alerte de saturation (>80% occupation)
- Prédiction IA d'affluence (basée sur historique + jour/heure)
- Gestion des brancards en zone d'attente

### AXE 7 — Scan code-barres / QR pour identification patient
**Statut : absent.**

L'identification patient est manuelle (saisie nom/prénom). Aucune intégration caméra.

Manque :
- Scan du bracelet patient (code-barres) via caméra mobile
- Scan avant chaque administration (double vérification patient-médicament)
- Intégration avec le composant `PreAdminVerification` existant

### AXE 8 — Mode tablette optimisé
**Statut : mobile-first basique.**

Le responsive existe mais il n'y a pas d'optimisation tablette spécifique (le device principal aux urgences).

Manque :
- Layout split-screen tablette (liste patients | dossier ouvert)
- Gestes tactiles optimisés (swipe pour changer de patient)
- Mode paysage dédié pour le board
- Touch targets vérifiés ≥ 48px sur tablette

### AXE 9 — Protocoles et packs de prescriptions
**Statut : structure prévue mais non implémentée.**

Le type `Provenance` inclut `'pack_protocole'` mais aucun protocole n'est implémenté.

Manque :
- Bibliothèque de protocoles (douleur thoracique, AVC, sepsis, trauma)
- Application en 1 clic : le protocole génère N prescriptions + examens + surveillance
- Protocoles personnalisables par établissement
- Traçabilité du protocole source dans chaque prescription

### AXE 10 — Accessibilité (a11y)
**Statut : minimal.**

Pas d'audit WCAG. Les contrastes en dark mode et les focus outlines sont inconsistants.

Manque :
- Navigation clavier complète
- Annonces ARIA pour les événements temps réel
- Contraste WCAG AA vérifié sur tous les badges médicaux
- Mode daltonien (pas de distinction rouge/vert uniquement)

### AXE 11 — Tests d'intégration avec données réelles
**Statut : tests unitaires uniquement.**

573 tests mais tous unitaires/mocks. Aucun test d'intégration bout-en-bout.

Manque :
- Tests Playwright/Cypress sur les flux critiques (admission → tri → prescription → admin → sortie)
- Tests de charge (50 patients simultanés sur le board)
- Tests de non-régression visuelle (screenshots)

### AXE 12 — Internationalisation (i18n)
**Statut : français uniquement, textes hardcodés.**

Tous les textes sont en dur dans les composants. Aucun framework i18n.

Manque :
- Extraction des chaînes dans des fichiers de traduction
- Support anglais minimum (pour les démos internationales, DOM-TOM anglophones)
- Formatage des dates/nombres selon la locale

---

## Priorisation recommandée (impact vs effort)

```text
Impact revolutionnaire
  ^
  |  [1] IA Generative        [4] Messagerie
  |  [9] Protocoles            [2] Notifications push
  |  [5] Stats reelles         [3] Drag & Drop
  |  [7] Scan code-barres      [6] Gestion lits
  |  [8] Mode tablette         [10] Accessibilite
  |  [11] Tests E2E            [12] i18n
  +-----------------------------------------> Effort
       Faible                          Eleve
```

**Top 3 recommandés pour un impact immédiat :**
1. **IA Générative** (Axe 1) — différenciateur absolu vs toute concurrence. Faisable via Lovable AI (Gemini/GPT) sans clé API.
2. **Protocoles 1-clic** (Axe 9) — gain de temps clinique massif, structure déjà prévue.
3. **Notifications push + sons** (Axe 2) — sécurité patient, attendu par tout urgentiste.

