-- UrgenceOS MVP — Seed Data (V2 — Enriched prescription types)
-- Run this after migrations to populate demo data.
-- Note: User creation must be done via Supabase Auth API (see seed-data edge function).
-- This file seeds the clinical data tables assuming patients/encounters already exist.

-- ============================================================
-- PATIENTS (15)
-- ============================================================
INSERT INTO patients (id, nom, prenom, date_naissance, sexe, allergies, antecedents, medecin_traitant, poids, telephone)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'DUPONT', 'Marie', '1958-03-15', 'F', ARRAY['Penicilline'], ARRAY['HTA','Diabete type 2','SCA non ST+ 2024'], 'Dr. Leroy', 72, '06 12 34 56 78'),
  ('a0000001-0000-0000-0000-000000000002', 'MARTIN', 'Lucas', '1994-06-22', 'M', ARRAY['Aspirine'], ARRAY[]::text[], 'Dr. Simon', 78, NULL),
  ('a0000001-0000-0000-0000-000000000003', 'BERNARD', 'Sophie', '1981-11-08', 'F', ARRAY[]::text[], ARRAY['Asthme allergique'], 'Dr. Laurent', 60, '06 23 45 67 89'),
  ('a0000001-0000-0000-0000-000000000004', 'PETIT', 'Jean', '1948-01-30', 'M', ARRAY['Iode'], ARRAY['Insuffisance renale chronique','HTA'], 'Dr. Garcia', 70, '06 34 56 78 90'),
  ('a0000001-0000-0000-0000-000000000005', 'LEROY', 'Emma', '2001-05-12', 'F', ARRAY[]::text[], ARRAY[]::text[], NULL, 55, NULL),
  ('a0000001-0000-0000-0000-000000000006', 'MOREAU', 'Camille', '1975-09-18', 'F', ARRAY[]::text[], ARRAY['Migraine chronique'], 'Dr. Martin', 58, NULL),
  ('a0000001-0000-0000-0000-000000000007', 'SIMON', 'Thomas', '1998-12-25', 'M', ARRAY[]::text[], ARRAY[]::text[], NULL, 75, NULL),
  ('a0000001-0000-0000-0000-000000000008', 'LAURENT', 'Emilie', '1965-06-03', 'F', ARRAY['Penicilline','Sulfamides'], ARRAY['HTA','Hypothyroidie'], 'Dr. Blanc', 68, '06 56 78 90 12'),
  ('a0000001-0000-0000-0000-000000000009', 'ROBERT', 'Antoine', '1937-02-14', 'M', ARRAY[]::text[], ARRAY['AVC','FA','HTA'], 'Dr. Dupont', 72, '06 67 89 01 23'),
  ('a0000001-0000-0000-0000-000000000010', 'ROUX', 'Chloe', '2003-08-07', 'F', ARRAY[]::text[], ARRAY[]::text[], NULL, 55, NULL),
  ('a0000001-0000-0000-0000-000000000011', 'GARCIA', 'Michel', '1960-04-20', 'M', ARRAY['Morphine'], ARRAY['Diabete type 2','Obesite'], 'Dr. Martinez', 110, '06 78 90 12 34'),
  ('a0000001-0000-0000-0000-000000000012', 'MARTINEZ', 'Julie', '1988-10-11', 'F', ARRAY[]::text[], ARRAY['Endometriose'], 'Dr. Lefevre', 62, NULL),
  ('a0000001-0000-0000-0000-000000000013', 'BLANC', 'Henri', '1945-12-01', 'M', ARRAY[]::text[], ARRAY['BPCO','Insuffisance cardiaque'], 'Dr. Petit', 76, '06 89 01 23 45'),
  ('a0000001-0000-0000-0000-000000000014', 'FOURNIER', 'Lea', '1995-03-28', 'F', ARRAY['Latex'], ARRAY[]::text[], NULL, 57, NULL),
  ('a0000001-0000-0000-0000-000000000015', 'GIRARD', 'Paul', '1970-07-16', 'M', ARRAY[]::text[], ARRAY['Lombalgie chronique'], 'Dr. Durand', 85, '06 90 12 34 56')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ENCOUNTERS (15) — 5 showcase + 10 background
-- ============================================================
INSERT INTO encounters (id, patient_id, status, zone, box_number, ccmu, cimu, motif_sfmu, arrival_time, triage_time)
VALUES
  -- SHOWCASE PATIENT 1: DUPONT Marie — Douleur thoracique CIMU 2
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'in-progress', 'sau', 1, 3, 2, 'Douleur thoracique', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 45 minutes'),
  -- SHOWCASE PATIENT 2: MARTIN Lucas — Trauma cheville CIMU 4
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'in-progress', 'sau', 3, 4, 4, 'Traumatisme membre', NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 20 minutes'),
  -- SHOWCASE PATIENT 3: BERNARD Sophie — Asthme aigu CIMU 2
  ('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'in-progress', 'sau', 2, 2, 2, 'Dyspnee', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 50 minutes'),
  -- SHOWCASE PATIENT 4: PETIT Jean — Colique nephretique CIMU 3
  ('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'in-progress', 'sau', 4, 3, 3, 'Douleur abdominale', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 30 minutes'),
  -- SHOWCASE PATIENT 5: LEROY Emma — Intox medicamenteuse CIMU 2
  ('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'in-progress', 'uhcd', 1, 2, 2, 'Intoxication', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 50 minutes'),
  -- Background patients
  ('e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'triaged', 'sau', 6, 3, 3, 'Cephalee', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes'),
  ('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'in-progress', 'dechocage', 1, 1, 1, 'Malaise / syncope', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes'),
  ('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'in-progress', 'uhcd', 2, 4, 4, 'AEG / Fievre', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 50 minutes'),
  ('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'in-progress', 'uhcd', 3, 3, 3, 'AEG / Fievre', NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '3 hours 15 minutes'),
  ('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'triaged', 'sau', 7, 4, 4, 'Plaie', NOW() - INTERVAL '1 hour 15 minutes', NOW() - INTERVAL '1 hour'),
  ('e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'in-progress', 'sau', 5, 3, 3, 'Douleur abdominale', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes'),
  ('e0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000012', 'arrived', 'sau', NULL, NULL, NULL, NULL, NOW() - INTERVAL '20 minutes', NULL),
  ('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'in-progress', 'dechocage', 2, 2, 2, 'Douleur thoracique', NOW() - INTERVAL '2 hours 15 minutes', NOW() - INTERVAL '2 hours'),
  ('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'triaged', 'sau', 8, 4, 4, 'Traumatisme membre', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '35 minutes'),
  ('e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 'in-progress', 'sau', 9, 5, 5, 'Douleur abdominale', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 20 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VITALS (multiple series per patient)
-- ============================================================
INSERT INTO vitals (encounter_id, patient_id, fc, pa_systolique, pa_diastolique, spo2, temperature, frequence_respiratoire, gcs, eva_douleur, recorded_at) VALUES
-- Patient 1: DUPONT Marie — DT — 3 series, improving
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 110, 155, 90, 96, 37.2, 18, 15, 8, NOW() - INTERVAL '3 hours 40 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 88, 145, 85, 97, 37.1, 16, 15, 6, NOW() - INTERVAL '2 hours'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 82, 130, 80, 98, 37.0, 15, 15, 3, NOW() - INTERVAL '30 minutes'),
-- Patient 2: MARTIN Lucas — Trauma — 2 series
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 90, 125, 78, 99, 37.0, 15, 15, 7, NOW() - INTERVAL '2 hours 15 minutes'),
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 82, 120, 75, 99, 37.0, 14, 15, 5, NOW() - INTERVAL '45 minutes'),
-- Patient 3: BERNARD Sophie — Asthme — 3 series
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 105, 130, 80, 89, 37.5, 32, 15, 2, NOW() - INTERVAL '2 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 95, 125, 78, 93, 37.3, 26, 15, 1, NOW() - INTERVAL '1 hour 30 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 82, 120, 75, 96, 37.1, 20, 15, 0, NOW() - INTERVAL '20 minutes'),
-- Patient 4: PETIT Jean — CN — 2 series
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 100, 160, 95, 97, 37.1, 18, 15, 9, NOW() - INTERVAL '1 hour 25 minutes'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 85, 145, 88, 98, 37.0, 16, 15, 5, NOW() - INTERVAL '30 minutes'),
-- Patient 5: LEROY Emma — Intox — 3 series
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 68, 105, 65, 97, 36.5, 14, 14, 0, NOW() - INTERVAL '4 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 72, 110, 68, 98, 36.8, 15, 15, 0, NOW() - INTERVAL '2 hours 30 minutes'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 75, 115, 72, 98, 37.0, 16, 15, 0, NOW() - INTERVAL '30 minutes'),
-- Background patients vitals
('e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 76, 160, 95, 99, 37.0, 14, 15, 8, NOW() - INTERVAL '45 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 45, 80, 50, 88, 36.2, 8, 10, 0, NOW() - INTERVAL '25 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 62, 100, 60, 95, 36.8, 14, 14, 0, NOW() - INTERVAL '10 minutes'),
('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 115, 95, 55, 93, 39.2, 26, 14, 3, NOW() - INTERVAL '3 hours 10 minutes'),
('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 105, 100, 60, 95, 38.8, 22, 15, 2, NOW() - INTERVAL '1 hour'),
('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 110, 100, 58, 94, 39.0, 24, 15, 2, NOW() - INTERVAL '3 hours'),
('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 85, 120, 75, 99, 37.0, 16, 15, 5, NOW() - INTERVAL '55 minutes'),
('e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 100, 145, 90, 97, 37.3, 18, 15, 7, NOW() - INTERVAL '1 hour 45 minutes'),
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 130, 85, 50, 91, 37.5, 28, 14, 8, NOW() - INTERVAL '1 hour 55 minutes'),
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 105, 110, 65, 96, 37.1, 20, 15, 4, NOW() - INTERVAL '15 minutes'),
('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 88, 122, 76, 99, 37.0, 15, 15, 6, NOW() - INTERVAL '30 minutes'),
('e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 78, 130, 80, 98, 37.1, 16, 15, 4, NOW() - INTERVAL '1 hour 15 minutes');

-- ============================================================
-- PRESCRIPTIONS — ENRICHED with JSON metadata in notes
-- ============================================================
INSERT INTO prescriptions (id, encounter_id, patient_id, prescriber_id, medication_name, dosage, route, frequency, status, priority, notes) VALUES
-- ======== PATIENT 1: DUPONT Marie — Douleur thoracique ========
('rx000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Paracetamol', '1g', 'IV', 'q6h', 'active', 'routine',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Morphine', '3mg', 'SC', NULL, 'active', 'routine',
 '{"type":"conditionnel","condition_trigger":"si EVA > 6","condition_max_doses":3,"condition_interval":"4h","condition_doses_given":1}'),
('rx000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '500mL', 'IV', NULL, 'active', 'routine',
 '{"type":"perfusion","debit":"125 mL/h","duration":"4h","volume_total":500,"volume_passed":350,"started_at":"2026-02-09T10:30:00Z"}'),
('rx000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Bio urgente', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"exam_bio","exam_list":["NFS","CRP","Ionogramme","Troponine","D-Dimeres","BNP"],"exam_urgency":"urgent","exam_status":"resultat_recu"}'),
('rx000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Radio thorax face', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"exam_imagerie","exam_site":"Thorax face","exam_indication":"DT non traumatique, eliminer pneumopathie","exam_urgency":"urgent","exam_status":"resultat_recu"}'),
('rx000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'ECG 12 derivations', '', 'IV', NULL, 'completed', 'urgent',
 '{"type":"exam_ecg","exam_status":"realise"}'),
('rx000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Scope continu', '', 'IV', NULL, 'active', 'routine',
 '{"type":"surveillance","surveillance_type":"scope + SpO2","surveillance_frequency":"continue"}'),
('rx000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'A jeun strict', '', 'IV', NULL, 'active', 'routine',
 '{"type":"regime","regime_details":"A jeun strict"}'),
('rx000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Avis cardiologie', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"avis_specialise","avis_speciality":"Cardiologie","avis_motif":"DT atypique, tropo de controle H+3, avis si positive","avis_urgency":"rapide","avis_status":"appele"}'),

-- ======== PATIENT 2: MARTIN Lucas — Trauma cheville ========
('rx000001-0000-0000-0000-000000000010', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Ketoprofene', '100mg', 'IV', '1 dose', 'completed', 'routine',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000011', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Paracetamol', '1g', 'PO', NULL, 'active', 'routine',
 '{"type":"conditionnel","condition_trigger":"si EVA > 4","condition_max_doses":4,"condition_interval":"6h","condition_doses_given":0}'),
('rx000001-0000-0000-0000-000000000012', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Radio cheville G', '', 'IV', NULL, 'active', 'normal',
 '{"type":"exam_imagerie","exam_site":"Cheville G face + profil","exam_urgency":"normal","exam_status":"resultat_recu"}'),
('rx000001-0000-0000-0000-000000000013', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Attelle cheville', '', 'IV', NULL, 'active', 'routine',
 '{"type":"dispositif","device_name":"Attelle cheville","device_details":"Pied gauche","device_status":"pose"}'),
('rx000001-0000-0000-0000-000000000014', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Pas d''appui MIG', '', 'IV', NULL, 'active', 'routine',
 '{"type":"mobilisation","mobilisation_details":"Pas d''appui membre inferieur gauche"}'),

-- ======== PATIENT 3: BERNARD Sophie — Asthme aigu ========
('rx000001-0000-0000-0000-000000000015', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Salbutamol', '5mg', 'INH', 'q20min x3 puis q1h', 'active', 'stat',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000016', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Ipratropium', '0.5mg', 'INH', 'q20min x3', 'active', 'stat',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000017', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Methylprednisolone', '80mg', 'IV', '1 dose', 'active', 'urgent',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000018', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '500mL', 'IV', NULL, 'active', 'routine',
 '{"type":"perfusion","debit":"60 mL/h","volume_total":500,"volume_passed":120,"started_at":"2026-02-09T11:00:00Z"}'),
('rx000001-0000-0000-0000-000000000019', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'O2', '', 'INH', NULL, 'active', 'urgent',
 '{"type":"oxygene","o2_device":"Masque HC","o2_debit":"6L/min","o2_target":"SpO2 > 94%"}'),
('rx000001-0000-0000-0000-000000000020', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Surveillance respiratoire', '', 'IV', NULL, 'active', 'routine',
 '{"type":"surveillance","surveillance_type":"SpO2 + FR + DEP","surveillance_frequency":"q30min"}'),
('rx000001-0000-0000-0000-000000000021', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Bio', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"exam_bio","exam_list":["GDS arteriels","NFS","CRP","Ionogramme"],"exam_urgency":"urgent","exam_status":"preleve"}'),

-- ======== PATIENT 4: PETIT Jean — Colique nephretique ========
('rx000001-0000-0000-0000-000000000022', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Morphine IV titration', '', 'IV', NULL, 'active', 'stat',
 '{"type":"titration","titration_dose_init":2,"titration_dose_max":10,"titration_step":2,"titration_interval":"5 min","titration_target":"EVA < 4","titration_cumulated":4}'),
('rx000001-0000-0000-0000-000000000023', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Ketoprofene', '100mg', 'IV', '1 dose', 'completed', 'stat',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000024', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Phloroglucinol', '80mg', 'IV', 'q6h', 'active', 'routine',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000025', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '1000mL', 'IV', NULL, 'active', 'routine',
 '{"type":"perfusion","debit":"125 mL/h","volume_total":1000,"volume_passed":600,"started_at":"2026-02-09T12:30:00Z"}'),
('rx000001-0000-0000-0000-000000000026', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Bio', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"exam_bio","exam_list":["Creatinine","Ionogramme","NFS","BU"],"exam_urgency":"urgent","exam_status":"resultat_recu"}'),
('rx000001-0000-0000-0000-000000000027', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Scanner abdo-pelvien', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"exam_imagerie","exam_site":"Abdo-pelvien sans injection","exam_urgency":"urgent","exam_status":"realise"}'),
('rx000001-0000-0000-0000-000000000028', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Boissons libres', '', 'IV', NULL, 'active', 'routine',
 '{"type":"regime","regime_details":"Boissons libres si non chirurgical"}'),

-- ======== PATIENT 5: LEROY Emma — Intox medicamenteuse ========
('rx000001-0000-0000-0000-000000000029', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'N-Acetylcysteine', '150mg/kg', 'IV', 'protocole Prescott', 'active', 'stat',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000030', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'G5%', '500mL', 'IV', NULL, 'active', 'routine',
 '{"type":"perfusion","debit":"250 mL/h","duration":"vecteur NAC","volume_total":500,"volume_passed":400,"started_at":"2026-02-09T09:00:00Z"}'),
('rx000001-0000-0000-0000-000000000031', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Surveillance continue', '', 'IV', NULL, 'active', 'routine',
 '{"type":"surveillance","surveillance_type":"scope + conscience + diurese","surveillance_frequency":"horaire"}'),
('rx000001-0000-0000-0000-000000000032', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Bio toxicologique', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"exam_bio","exam_list":["Paracetamolemie","Bilan hepatique","TP/INR","Ionogramme","Creatinine","GDS","Lactates"],"exam_urgency":"urgent","exam_status":"resultat_recu"}'),
('rx000001-0000-0000-0000-000000000033', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'A jeun strict', '', 'IV', NULL, 'active', 'routine',
 '{"type":"regime","regime_details":"A jeun strict"}'),
('rx000001-0000-0000-0000-000000000034', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Avis reanimation', '', 'IV', NULL, 'active', 'urgent',
 '{"type":"avis_specialise","avis_speciality":"Reanimation","avis_motif":"Intox paracetamol massive H+4, discussion transfert rea","avis_urgency":"urgent","avis_status":"vu","avis_notes":"Transfert rea si cytolyse > 10N ou TP < 30%"}'),

-- ======== BACKGROUND PATIENTS — simple prescriptions ========
('rx000001-0000-0000-0000-000000000035', 'e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'Paracetamol', '1g', 'IV', 'q6h', 'active', 'routine',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000036', 'e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '1000mL', 'IV', 'Bolus', 'completed', 'stat',
 '{"type":"perfusion","debit":"999 mL/h","volume_total":1000,"volume_passed":1000}'),
('rx000001-0000-0000-0000-000000000037', 'e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'Paracetamol', '1g', 'IV', 'q6h', 'completed', 'routine',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000038', 'e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'Ceftriaxone', '2g', 'IV', '1x/jour', 'active', 'urgent',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000039', 'e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'Paracetamol', '1g', 'IV', 'q6h', 'active', 'routine',
 '{"type":"medicament"}'),
('rx000001-0000-0000-0000-000000000040', 'e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', 'Morphine IV titration', '', 'IV', NULL, 'active', 'stat',
 '{"type":"titration","titration_dose_init":2,"titration_dose_max":10,"titration_step":2,"titration_interval":"5 min","titration_target":"EVA < 4","titration_cumulated":6}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADMINISTRATIONS
-- ============================================================
INSERT INTO administrations (prescription_id, encounter_id, patient_id, administered_by, dose_given, route, administered_at, notes) VALUES
-- Patient 1: Paracetamol given, Morphine conditionnel once
('rx000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '1g', 'IV', NOW() - INTERVAL '3 hours', NULL),
('rx000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '3mg', 'SC', NOW() - INTERVAL '2 hours 30 minutes', '{"eva_before":8}'),
-- Patient 2: Ketoprofene
('rx000001-0000-0000-0000-000000000010', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', '100mg', 'IV', NOW() - INTERVAL '2 hours', NULL),
-- Patient 3: Salbutamol x2, Methylpred
('rx000001-0000-0000-0000-000000000015', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', '5mg', 'INH', NOW() - INTERVAL '2 hours 40 minutes', NULL),
('rx000001-0000-0000-0000-000000000015', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', '5mg', 'INH', NOW() - INTERVAL '2 hours 20 minutes', NULL),
('rx000001-0000-0000-0000-000000000017', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', '80mg', 'IV', NOW() - INTERVAL '2 hours 35 minutes', NULL),
-- Patient 4: Titration morphine — 2 bolus
('rx000001-0000-0000-0000-000000000022', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', '2mg', 'IV', NOW() - INTERVAL '1 hour 15 minutes', '{"eva_before":9,"titration_step":1}'),
('rx000001-0000-0000-0000-000000000022', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', '2mg', 'IV', NOW() - INTERVAL '1 hour 10 minutes', '{"eva_before":7,"titration_step":2}'),
('rx000001-0000-0000-0000-000000000023', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', '100mg', 'IV', NOW() - INTERVAL '1 hour 20 minutes', NULL),
-- Patient 5: NAC
('rx000001-0000-0000-0000-000000000029', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', '150mg/kg', 'IV', NOW() - INTERVAL '4 hours 30 minutes', NULL),
-- Background
('rx000001-0000-0000-0000-000000000036', 'e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', '1000mL', 'IV', NOW() - INTERVAL '20 minutes', NULL),
('rx000001-0000-0000-0000-000000000037', 'e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', '1g', 'IV', NOW() - INTERVAL '4 hours', NULL);

-- ============================================================
-- RESULTS
-- ============================================================
INSERT INTO results (encounter_id, patient_id, category, title, content, is_critical, is_read, received_at) VALUES
-- Patient 1: Tropo negative, bio OK
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'bio', 'NFS + Ionogramme + CRP', '{"hemoglobine": 13.5, "leucocytes": 7.2, "creatinine": 88, "potassium": 4.1, "CRP": 12}', false, true, NOW() - INTERVAL '2 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'bio', 'Troponine H0', '{"troponine_us": 8, "seuil": 14}', false, true, NOW() - INTERVAL '2 hours 30 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'bio', 'D-Dimeres + BNP', '{"D_Dimeres": 350, "BNP": 45}', false, false, NOW() - INTERVAL '2 hours 20 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'ecg', 'ECG 12 derivations', '{"rythme": "Sinusal 82/min", "axe": "Normal", "ST": "Pas de sus-decalage", "conclusion": "ECG normal"}', false, true, NOW() - INTERVAL '3 hours'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'imagerie', 'Radio thorax', '{"conclusion": "Pas de foyer, pas de pneumothorax. Silhouette cardiaque normale.", "technique": "Face debout"}', false, true, NOW() - INTERVAL '2 hours'),
-- Patient 2: Radio fracture
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'imagerie', 'Radio cheville G', '{"conclusion": "Fracture malleole externe sans deplacement.", "technique": "Face + profil + mortaise"}', false, false, NOW() - INTERVAL '1 hour'),
-- Patient 3: GDS
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'bio', 'GDS arteriels', '{"pH": 7.38, "pCO2": 42, "pO2": 72, "HCO3": 24, "lactates": 1.2}', false, false, NOW() - INTERVAL '1 hour 30 minutes'),
-- Patient 4: Bio CN
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'bio', 'Creatinine + Iono + NFS', '{"creatinine": 145, "potassium": 4.8, "hemoglobine": 14.2, "leucocytes": 8.1}', false, false, NOW() - INTERVAL '45 minutes'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'imagerie', 'Scanner abdo-pelvien', '{"conclusion": "Calcul ureteral gauche 8mm au tiers moyen. Dilatation pyelo-calicielle gauche moderee. Pas de complication.", "technique": "Sans injection"}', false, false, NOW() - INTERVAL '30 minutes'),
-- Patient 5: Bilan intox
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'bio', 'Bilan toxicologique', '{"paracetamolemie": 180, "seuil_toxique": 150, "ASAT": 45, "ALAT": 52, "TP": 78, "INR": 1.2}', true, false, NOW() - INTERVAL '3 hours'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'bio', 'Iono + GDS', '{"potassium": 3.8, "creatinine": 62, "pH": 7.35, "lactates": 1.5}', false, false, NOW() - INTERVAL '2 hours 45 minutes'),
-- Background
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'bio', 'Bilan urgence', '{"hemoglobine": 8.2, "leucocytes": 3.1, "creatinine": 250, "potassium": 6.1, "lactates": 4.5}', true, false, NOW() - INTERVAL '15 minutes'),
('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'bio', 'NFS + CRP', '{"hemoglobine": 10.5, "leucocytes": 18.5, "CRP": 180, "procalcitonine": 2.5}', true, false, NOW() - INTERVAL '2 hours'),
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'bio', 'Troponine H0', '{"troponine_us": 120, "seuil": 14}', true, false, NOW() - INTERVAL '1 hour 30 minutes');

-- ============================================================
-- PROCEDURES
-- ============================================================
INSERT INTO procedures (encounter_id, patient_id, performed_by, procedure_type, notes, performed_at) VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 18G bras gauche', NOW() - INTERVAL '3 hours 30 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'Bilan sanguin complet', NOW() - INTERVAL '3 hours 25 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'ecg', 'ECG 12 derivations — sinusal, pas de sus-decalage', NOW() - INTERVAL '3 hours 20 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 20G avant-bras droit', NOW() - INTERVAL '2 hours 40 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'GDS arteriels + bio', NOW() - INTERVAL '2 hours 35 minutes'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 18G bras droit', NOW() - INTERVAL '1 hour 25 minutes'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'Bio + BU', NOW() - INTERVAL '1 hour 20 minutes'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 18G antecubital gauche', NOW() - INTERVAL '4 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'Bilan toxicologique complet', NOW() - INTERVAL '4 hours 40 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 16G antecubital gauche', NOW() - INTERVAL '24 minutes');

-- ============================================================
-- TIMELINE_ITEMS
-- ============================================================
INSERT INTO timeline_items (patient_id, item_type, content, source_document, source_date, source_author) VALUES
-- Patient 1 (HTA + Diabete + SCA)
('a0000001-0000-0000-0000-000000000001', 'antecedent', 'HTA depuis 2010 — traite par bisoprolol 5mg', 'DMP', '2024-06-15', 'Dr. Leroy'),
('a0000001-0000-0000-0000-000000000001', 'antecedent', 'Diabete type 2 depuis 2015 — metformine 1g x2/j', 'DMP', '2024-06-15', 'Dr. Leroy'),
('a0000001-0000-0000-0000-000000000001', 'allergie', 'Allergie : Penicilline (eruption cutanee)', 'DMP', '2020-03-01', 'Pharmacie CHU'),
('a0000001-0000-0000-0000-000000000001', 'traitement', 'Bisoprolol 5mg 1x/j, Metformine 1g 2x/j, Ramipril 5mg 1x/j', 'Ordonnance', '2025-11-01', 'Dr. Leroy'),
('a0000001-0000-0000-0000-000000000001', 'crh', 'Hospitalisation SCA non ST+ 2024 — coronarographie : stenose IVA traitee par angioplastie + stent', 'CRH Cardiologie CHU', '2024-03-20', 'Dr. Cardiologue'),
-- Patient 2 (Aspirine allergy)
('a0000001-0000-0000-0000-000000000002', 'allergie', 'Allergie : Aspirine (bronchospasme)', 'DMP', '2019-05-15', 'Dr. Simon'),
-- Patient 3 (Asthme)
('a0000001-0000-0000-0000-000000000003', 'antecedent', 'Asthme allergique depuis enfance — bien controle', 'DMP', '2024-01-20', 'Dr. Laurent'),
('a0000001-0000-0000-0000-000000000003', 'traitement', 'Ventoline a la demande, Symbicort 200/6 2x/j', 'Ordonnance', '2025-09-01', 'Dr. Laurent'),
-- Patient 4 (IR + HTA + Iode)
('a0000001-0000-0000-0000-000000000004', 'antecedent', 'Insuffisance renale chronique stade 3b — creatinine basale 150', 'DMP', '2023-05-01', 'Dr. Garcia'),
('a0000001-0000-0000-0000-000000000004', 'antecedent', 'HTA ancienne sous tritherapie', 'DMP', '2023-05-01', 'Dr. Garcia'),
('a0000001-0000-0000-0000-000000000004', 'allergie', 'Allergie : Iode (reaction anaphylactoide au PCI)', 'DMP', '2018-11-20', 'Radiologue CHU'),
('a0000001-0000-0000-0000-000000000004', 'traitement', 'Ramipril 10mg, Amlodipine 10mg, Furosemide 40mg', 'Ordonnance', '2025-10-01', 'Dr. Garcia'),
-- Patient 5 (no history — young patient)
-- Patient 6 (Migraine)
('a0000001-0000-0000-0000-000000000006', 'antecedent', 'Migraine chronique avec aura — 3-4 crises/mois', 'DMP', '2024-02-10', 'Dr. Martin'),
-- Patient 8 (HTA + Hypothyroidie + Allergies)
('a0000001-0000-0000-0000-000000000008', 'allergie', 'Allergie : Penicilline (rash)', 'DMP', '2015-09-01', 'Pharmacie'),
('a0000001-0000-0000-0000-000000000008', 'allergie', 'Allergie : Sulfamides (Stevens-Johnson)', 'DMP', '2017-03-15', 'Dermatologue CHU'),
-- Patient 9 (AVC + FA + HTA)
('a0000001-0000-0000-0000-000000000009', 'antecedent', 'AVC ischemique 2022 — sequelles minimes', 'CRH Neurologie', '2022-08-10', 'Dr. Neurologue'),
('a0000001-0000-0000-0000-000000000009', 'antecedent', 'Fibrillation auriculaire permanente — warfarine', 'DMP', '2023-01-15', 'Dr. Dupont'),
-- Patient 11 (Morphine allergy)
('a0000001-0000-0000-0000-000000000011', 'allergie', 'Allergie : Morphine (nausees severes + urticaire)', 'DMP', '2021-06-10', 'Anesthesiste'),
-- Patient 13 (BPCO + IC)
('a0000001-0000-0000-0000-000000000013', 'antecedent', 'BPCO stade IV — OLD 2L/min', 'DMP', '2023-11-01', 'Dr. Petit'),
('a0000001-0000-0000-0000-000000000013', 'antecedent', 'Insuffisance cardiaque a FEVG alteree 30%', 'DMP', '2023-11-01', 'Dr. Petit'),
-- Patient 14 (Latex allergy)
('a0000001-0000-0000-0000-000000000014', 'allergie', 'Allergie : Latex (urticaire de contact)', 'DMP', '2022-04-01', 'Allergologue'),
-- Patient 15 (Lombalgie)
('a0000001-0000-0000-0000-000000000015', 'antecedent', 'Lombalgie chronique — hernie discale L4-L5 operee 2023', 'DMP', '2024-01-10', 'Dr. Durand');

-- ============================================================
-- TRANSMISSIONS (DAR examples)
-- ============================================================
INSERT INTO transmissions (encounter_id, patient_id, author_id, donnees, actions, resultats, cible) VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001',
 'FC 82 | PA 130/80 | SpO2 98% | T 37.0 | EVA 3/10',
 'Admin: Paracetamol 1g IV | Morphine 3mg SC (EVA 8) | VVP 18G posee | ECG realise | Bio prelevee',
 'Douleur en regression EVA 8->3. Tropo negative. ECG normal. Radio thorax sans anomalie. Avis cardio en cours.',
 'Douleur'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001',
 'FC 82 | PA 120/75 | SpO2 96% | T 37.1 | FR 20',
 'Aerosol Salbutamol 5mg x2 | Ipratropium 0.5mg | Methylprednisolone 80mg IV | O2 masque HC 6L/min | NaCl 500mL 60mL/h',
 'Dyspnee amelioree. SpO2 remontee de 89 a 96%. FR 32->20. DEP en amelioration.',
 'Respiratoire'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001',
 'FC 85 | PA 145/88 | SpO2 98% | T 37.0 | EVA 5/10',
 'Morphine IV titration 2+2mg (cumule 4mg) | Ketoprofene 100mg IV | Phloroglucinol 80mg IV | VVP | Bio + BU',
 'EVA amelioree 9->5. Titration en cours. Scanner abdo confirme calcul ureteral G 8mm. Bio: creat 145 (baseline 150).',
 'Douleur'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001',
 'FC 75 | PA 115/72 | SpO2 98% | T 37.0 | GCS 15',
 'NAC protocole Prescott debute | G5% 500mL 250mL/h | Scope + surveillance conscience horaire',
 'Patiente stable. Paracetamolemie 180 (toxique). ASAT/ALAT en legere elevation. TP 78%. Rea contactee: surveillance USI si cytolyse > 10N.',
 'Toxicologique');
