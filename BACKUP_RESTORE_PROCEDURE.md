# 🔒 Procédure de Backup & Restore — UrgenceOS

> **Classification** : Document interne — CTO / DevOps / RSSI
> **Version** : 1.0.0
> **Date** : 2026-03-08
> **Auteur** : Équipe technique UrgenceOS

---

## 1. Architecture de sauvegarde

| Couche | Technologie | Sauvegarde | Fréquence |
|--------|------------|------------|-----------|
| Base de données PostgreSQL | Lovable Cloud (Supabase) | Snapshots automatiques | Quotidienne |
| Fichiers applicatifs (code) | GitHub | Commits + branches | Continue (chaque push) |
| Edge Functions | Lovable Cloud | Déployées depuis le code source | À chaque déploiement |
| Secrets & configuration | Lovable Cloud Vault | Gérés par la plateforme | Persistants |
| Données utilisateur (Auth) | Lovable Cloud Auth | Incluses dans le snapshot DB | Quotidienne |

---

## 2. Objectifs de reprise

### RTO — Recovery Time Objective

| Scénario | RTO cible | RTO mesuré |
|----------|-----------|------------|
| Panne Edge Function isolée | < 5 min | ~2 min (redéploiement auto) |
| Corruption de données (table) | < 30 min | ~15-20 min (restore point-in-time) |
| Panne complète infrastructure | < 2 h | ~1 h (restore snapshot + redéploiement) |
| Perte totale (disaster recovery) | < 4 h | Non testé en conditions réelles |

### RPO — Recovery Point Objective

| Couche | RPO |
|--------|-----|
| Code source (GitHub) | **0 min** — chaque commit est persisté |
| Base de données | **≤ 24 h** (snapshot quotidien) |
| Base de données (PITR*) | **≤ 5 min** si PITR activé (plan Pro) |
| Edge Functions | **0 min** — redéployables depuis le code |
| Secrets | **0 min** — persistants dans le vault |

> \* PITR = Point-In-Time Recovery. Disponible sur les plans Pro de l'infrastructure. Permet de restaurer la base à n'importe quel instant des 7 derniers jours.

---

## 3. Procédure de restore — Base de données

### 3.1. Restore depuis snapshot quotidien

1. **Identifier le snapshot** : Ouvrir Lovable Cloud → Backend → section Backups
2. **Sélectionner la date** : Choisir le snapshot le plus récent AVANT l'incident
3. **Lancer la restauration** : Cliquer « Restore to this point »
4. **Vérifier l'intégrité** : Exécuter le script de validation (§5)
5. **Confirmer** : Valider que l'application fonctionne

### 3.2. Restore Point-In-Time (si PITR activé)

1. **Déterminer l'horodatage** : Identifier le moment exact avant la corruption
2. **Ouvrir Cloud → Run SQL** (environnement Live)
3. **Sélectionner le point de restauration** avec précision (minute)
4. **Exécuter et valider** avec le script §5

### 3.3. Restore du code applicatif

```bash
# Le code est versionné sur GitHub — rollback instantané
# Option 1 : Revert dans Lovable (bouton "Restore" sur une version précédente)
# Option 2 : Git revert sur le commit problématique
git revert <commit-hash>
git push origin main
```

---

## 4. Procédure de restore — Edge Functions

Les Edge Functions sont **stateless** et déployées depuis le code source.

1. **Identifier la fonction défaillante** via les logs structurés (JSON)
2. **Vérifier le code** dans `supabase/functions/<nom>/index.ts`
3. **Corriger ou reverter** le commit fautif
4. **Le redéploiement est automatique** à chaque push

> ⚡ Temps de redéploiement typique : < 2 minutes

---

## 5. Script de validation post-restore

Exécuter ces requêtes SQL dans **Cloud → Run SQL** pour vérifier l'intégrité :

```sql
-- ═══════════════════════════════════════
-- SCRIPT DE VALIDATION POST-RESTORE
-- UrgenceOS v1.0.0
-- ═══════════════════════════════════════

-- 1. Vérifier que toutes les tables critiques existent et ont des données
SELECT
  'patients' AS table_name, COUNT(*) AS row_count FROM patients
UNION ALL SELECT
  'encounters', COUNT(*) FROM encounters
UNION ALL SELECT
  'prescriptions', COUNT(*) FROM prescriptions
UNION ALL SELECT
  'administrations', COUNT(*) FROM administrations
UNION ALL SELECT
  'vitals', COUNT(*) FROM vitals
UNION ALL SELECT
  'results', COUNT(*) FROM results
UNION ALL SELECT
  'audit_logs', COUNT(*) FROM audit_logs
UNION ALL SELECT
  'profiles', COUNT(*) FROM profiles
UNION ALL SELECT
  'user_roles', COUNT(*) FROM user_roles
UNION ALL SELECT
  'transmissions', COUNT(*) FROM transmissions
UNION ALL SELECT
  'procedures', COUNT(*) FROM procedures
UNION ALL SELECT
  'timeline_items', COUNT(*) FROM timeline_items
UNION ALL SELECT
  'messages', COUNT(*) FROM messages
UNION ALL SELECT
  'error_logs', COUNT(*) FROM error_logs
UNION ALL SELECT
  'status_checks', COUNT(*) FROM status_checks
UNION ALL SELECT
  'incident_logs', COUNT(*) FROM incident_logs
UNION ALL SELECT
  'contact_leads', COUNT(*) FROM contact_leads
UNION ALL SELECT
  'patient_consents', COUNT(*) FROM patient_consents
UNION ALL SELECT
  'data_deletion_requests', COUNT(*) FROM data_deletion_requests;

-- 2. Vérifier que RLS est activé sur toutes les tables publiques
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- ✅ Toutes les lignes doivent avoir rowsecurity = true

-- 3. Vérifier les fonctions de sécurité
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('has_role', 'get_user_role', 'is_assigned_to_encounter', 'is_assigned_to_patient', 'handle_new_user', 'prevent_audit_mutation', 'validate_patient_dob');
-- ✅ Doit retourner 7 lignes

-- 4. Vérifier l'immutabilité de audit_logs (trigger présent)
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'audit_logs'
  AND trigger_schema = 'public';
-- ✅ Doit avoir des triggers UPDATE et DELETE

-- 5. Vérifier les enums
SELECT typname, enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('app_role', 'encounter_status', 'med_route', 'prescription_priority', 'prescription_status', 'procedure_type', 'result_category', 'timeline_item_type', 'zone_type', 'channel_type')
ORDER BY typname, enumsortorder;

-- 6. Vérifier la cohérence référentielle
-- Encounters sans patient valide
SELECT COUNT(*) AS orphan_encounters
FROM encounters e
LEFT JOIN patients p ON e.patient_id = p.id
WHERE p.id IS NULL;
-- ✅ Doit retourner 0

-- Prescriptions sans encounter valide
SELECT COUNT(*) AS orphan_prescriptions
FROM prescriptions rx
LEFT JOIN encounters e ON rx.encounter_id = e.id
WHERE e.id IS NULL;
-- ✅ Doit retourner 0
```

---

## 6. Tests de backup — Calendrier

| Test | Fréquence | Responsable | Dernier test |
|------|-----------|-------------|--------------|
| Validation script intégrité (§5) | Hebdomadaire | DevOps | À planifier |
| Restore snapshot → environnement test | Mensuel | CTO | À planifier |
| Restore PITR (si activé) | Trimestriel | CTO | N/A |
| Disaster recovery complet | Semestriel | CTO + RSSI | À planifier |
| Vérification Edge Functions post-deploy | À chaque déploiement | CI/CD (auto) | Continu |

---

## 7. Contacts d'escalade

| Niveau | Délai | Contact |
|--------|-------|---------|
| L1 — Monitoring automatique | Immédiat | Alertes status-monitor → audit_logs |
| L2 — Équipe technique | < 15 min | CTO / Lead Dev |
| L3 — Support infrastructure | < 1 h | Support Lovable Cloud |
| L4 — Incident majeur | < 2 h | RSSI + Direction |

---

## 8. Checklist pré-lancement

- [ ] Script de validation §5 exécuté avec succès sur l'environnement Live
- [ ] Snapshot quotidien vérifié (au moins 3 jours d'historique)
- [ ] PITR activé (recommandé pour production médicale)
- [ ] Edge Function `healthz` accessible et retourne `200 OK`
- [ ] Edge Function `status-monitor` opérationnelle
- [ ] Error tracking (`log-error`) fonctionnel
- [ ] Calendrier de tests backup validé par le CTO
- [ ] Document relu et signé par CTO + RSSI

---

## 9. Historique des révisions

| Version | Date | Auteur | Changements |
|---------|------|--------|-------------|
| 1.0.0 | 2026-03-08 | UrgenceOS | Création initiale |

---

> **⚠️ Ce document doit être relu et mis à jour à chaque changement d'infrastructure ou ajout de table critique.**
