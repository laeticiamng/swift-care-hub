-- UrgenceOS MVP — Seed Data
-- Run this after migrations to populate demo data.
-- Note: User creation must be done via Supabase Auth API (see seed-data edge function).
-- This file seeds the clinical data tables assuming patients/encounters already exist.

-- ============================================================
-- PATIENTS (15)
-- ============================================================
INSERT INTO patients (id, nom, prenom, date_naissance, sexe, allergies, antecedents, medecin_traitant, poids, telephone)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'MARTIN', 'Pierre', '1955-03-15', 'M', ARRAY['Pénicilline'], ARRAY['HTA','Diabète type 2'], 'Dr. Leroy', 82, '06 12 34 56 78'),
  ('a0000001-0000-0000-0000-000000000002', 'DUBOIS', 'Marie', '1948-07-22', 'F', ARRAY[]::text[], ARRAY['BPCO','FA'], 'Dr. Roux', 65, '06 23 45 67 89'),
  ('a0000001-0000-0000-0000-000000000003', 'BERNARD', 'Lucas', '1992-11-08', 'M', ARRAY['Aspirine'], ARRAY[]::text[], 'Dr. Simon', 78, NULL),
  ('a0000001-0000-0000-0000-000000000004', 'PETIT', 'Sophie', '1980-01-30', 'F', ARRAY[]::text[], ARRAY['Asthme'], 'Dr. Laurent', 60, '06 34 56 78 90'),
  ('a0000001-0000-0000-0000-000000000005', 'ROBERT', 'Jean', '1940-05-12', 'M', ARRAY['Iode'], ARRAY['Insuffisance rénale','HTA'], 'Dr. Garcia', 70, '06 45 67 89 01'),
  ('a0000001-0000-0000-0000-000000000006', 'MOREAU', 'Camille', '1975-09-18', 'F', ARRAY[]::text[], ARRAY['Migraine chronique'], 'Dr. Martin', 58, NULL),
  ('a0000001-0000-0000-0000-000000000007', 'SIMON', 'Thomas', '1998-12-25', 'M', ARRAY[]::text[], ARRAY[]::text[], NULL, 75, NULL),
  ('a0000001-0000-0000-0000-000000000008', 'LAURENT', 'Émilie', '1965-06-03', 'F', ARRAY['Pénicilline','Sulfamides'], ARRAY['HTA','Hypothyroïdie'], 'Dr. Blanc', 68, '06 56 78 90 12'),
  ('a0000001-0000-0000-0000-000000000009', 'LEROY', 'Antoine', '1937-02-14', 'M', ARRAY[]::text[], ARRAY['AVC','FA','HTA'], 'Dr. Dupont', 72, '06 67 89 01 23'),
  ('a0000001-0000-0000-0000-000000000010', 'ROUX', 'Chloé', '2001-08-07', 'F', ARRAY[]::text[], ARRAY[]::text[], NULL, 55, NULL),
  ('a0000001-0000-0000-0000-000000000011', 'GARCIA', 'Michel', '1960-04-20', 'M', ARRAY['Morphine'], ARRAY['Diabète type 2','Obésité'], 'Dr. Martinez', 110, '06 78 90 12 34'),
  ('a0000001-0000-0000-0000-000000000012', 'MARTINEZ', 'Julie', '1988-10-11', 'F', ARRAY[]::text[], ARRAY['Endométriose'], 'Dr. Lefèvre', 62, NULL),
  ('a0000001-0000-0000-0000-000000000013', 'BLANC', 'Henri', '1945-12-01', 'M', ARRAY[]::text[], ARRAY['BPCO','Insuffisance cardiaque'], 'Dr. Petit', 76, '06 89 01 23 45'),
  ('a0000001-0000-0000-0000-000000000014', 'FOURNIER', 'Léa', '1995-03-28', 'F', ARRAY['Latex'], ARRAY[]::text[], NULL, 57, NULL),
  ('a0000001-0000-0000-0000-000000000015', 'GIRARD', 'Paul', '1970-07-16', 'M', ARRAY[]::text[], ARRAY['Lombalgie chronique'], 'Dr. Durand', 85, '06 90 12 34 56')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ENCOUNTERS (15)
-- ============================================================
INSERT INTO encounters (id, patient_id, status, zone, box_number, ccmu, cimu, motif_sfmu, arrival_time, triage_time)
VALUES
  ('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'in-progress', 'sau', 1, 3, 3, 'Douleur thoracique', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 45 minutes'),
  ('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'in-progress', 'sau', 2, 3, 3, 'Chute personne âgée', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 50 minutes'),
  ('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'in-progress', 'sau', 3, 4, 4, 'Dyspnée', NOW() - INTERVAL '2 hours 30 minutes', NOW() - INTERVAL '2 hours 20 minutes'),
  ('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'triaged', 'sau', 4, 2, 2, 'Douleur abdominale', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 30 minutes'),
  ('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'in-progress', 'sau', 5, 2, 2, 'Traumatisme membre', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours 50 minutes'),
  ('e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'triaged', 'sau', 6, 3, 3, 'Céphalée', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '50 minutes'),
  ('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'in-progress', 'dechocage', 1, 1, 1, 'Malaise / syncope', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes'),
  ('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'in-progress', 'uhcd', 1, 4, 4, 'Intoxication', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 50 minutes'),
  ('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'in-progress', 'uhcd', 2, 3, 3, 'AEG', NOW() - INTERVAL '3 hours 30 minutes', NOW() - INTERVAL '3 hours 15 minutes'),
  ('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'triaged', 'uhcd', 3, 2, 2, 'Plaie', NOW() - INTERVAL '1 hour 15 minutes', NOW() - INTERVAL '1 hour'),
  ('e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'in-progress', 'uhcd', 4, 3, 3, 'Brûlure', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes'),
  ('e0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000012', 'arrived', 'sau', NULL, NULL, NULL, NULL, NOW() - INTERVAL '20 minutes', NULL),
  ('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'in-progress', 'dechocage', 2, 2, 2, 'Douleur thoracique', NOW() - INTERVAL '2 hours 15 minutes', NOW() - INTERVAL '2 hours'),
  ('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'triaged', 'sau', 7, 2, 2, 'Traumatisme membre', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '35 minutes'),
  ('e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 'in-progress', 'sau', 8, 5, 5, 'Douleur abdominale', NOW() - INTERVAL '1 hour 30 minutes', NOW() - INTERVAL '1 hour 20 minutes')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VITALS (40+ entries — 2-4 per encounter)
-- ============================================================
INSERT INTO vitals (encounter_id, patient_id, fc, pa_systolique, pa_diastolique, spo2, temperature, frequence_respiratoire, gcs, eva_douleur, recorded_at) VALUES
-- Patient 1 (douleur thoracique) — 3 series
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 95, 155, 90, 96, 37.2, 18, 15, 7, NOW() - INTERVAL '3 hours 40 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 88, 145, 85, 97, 37.1, 16, 15, 5, NOW() - INTERVAL '2 hours'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 82, 138, 82, 98, 37.0, 15, 15, 3, NOW() - INTERVAL '30 minutes'),
-- Patient 2 (chute PA) — 3 series
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 110, 100, 60, 94, 37.5, 20, 15, 4, NOW() - INTERVAL '2 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 105, 110, 65, 95, 37.4, 18, 15, 3, NOW() - INTERVAL '1 hour 30 minutes'),
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 98, 118, 70, 96, 37.3, 16, 15, 2, NOW() - INTERVAL '20 minutes'),
-- Patient 3 (dyspnée) — 3 series
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 78, 130, 80, 92, 37.0, 24, 15, 2, NOW() - INTERVAL '2 hours 15 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 75, 125, 78, 95, 37.0, 20, 15, 1, NOW() - INTERVAL '1 hour'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 72, 120, 75, 97, 36.9, 18, 15, 0, NOW() - INTERVAL '15 minutes'),
-- Patient 4 (douleur abdo) — 2 series
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 100, 135, 85, 98, 38.8, 22, 15, 8, NOW() - INTERVAL '1 hour 25 minutes'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 92, 128, 80, 98, 38.5, 20, 15, 6, NOW() - INTERVAL '30 minutes'),
-- Patient 5 (traumatisme) — 2 series
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 88, 140, 85, 97, 37.1, 16, 15, 6, NOW() - INTERVAL '4 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 80, 135, 80, 98, 37.0, 15, 15, 4, NOW() - INTERVAL '2 hours'),
-- Patient 6 (céphalée) — 2 series
('e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 76, 160, 95, 99, 37.0, 14, 15, 8, NOW() - INTERVAL '45 minutes'),
('e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 72, 150, 90, 99, 37.0, 14, 15, 5, NOW() - INTERVAL '10 minutes'),
-- Patient 7 (malaise — déchocage) — 4 series
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 45, 80, 50, 88, 36.2, 8, 10, 0, NOW() - INTERVAL '25 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 55, 90, 55, 92, 36.5, 12, 12, 0, NOW() - INTERVAL '18 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 62, 100, 60, 95, 36.8, 14, 14, 0, NOW() - INTERVAL '10 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 68, 105, 65, 96, 37.0, 15, 15, 1, NOW() - INTERVAL '2 minutes'),
-- Patient 8 (intoxication UHCD) — 3 series
('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 65, 110, 70, 97, 36.8, 14, 14, 0, NOW() - INTERVAL '5 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 70, 115, 72, 98, 37.0, 15, 15, 0, NOW() - INTERVAL '3 hours'),
('e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 72, 118, 75, 98, 37.0, 16, 15, 0, NOW() - INTERVAL '1 hour'),
-- Patient 9 (AEG) — 2 series
('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 115, 95, 55, 93, 39.2, 26, 14, 3, NOW() - INTERVAL '3 hours 10 minutes'),
('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 105, 100, 60, 95, 38.8, 22, 15, 2, NOW() - INTERVAL '1 hour'),
-- Patient 10 (plaie) — 2 series
('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 85, 120, 75, 99, 37.0, 16, 15, 5, NOW() - INTERVAL '55 minutes'),
('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 80, 118, 72, 99, 37.0, 15, 15, 3, NOW() - INTERVAL '15 minutes'),
-- Patient 11 (brûlure) — 2 series
('e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 100, 145, 90, 97, 37.3, 18, 15, 9, NOW() - INTERVAL '1 hour 45 minutes'),
('e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 90, 138, 85, 98, 37.2, 16, 15, 6, NOW() - INTERVAL '45 minutes'),
-- Patient 13 (douleur thoracique déchocage) — 3 series
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 130, 85, 50, 91, 37.5, 28, 14, 8, NOW() - INTERVAL '1 hour 55 minutes'),
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 118, 95, 58, 93, 37.3, 24, 15, 6, NOW() - INTERVAL '1 hour'),
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 105, 110, 65, 96, 37.1, 20, 15, 4, NOW() - INTERVAL '15 minutes'),
-- Patient 14 (traumatisme) — 2 series
('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 90, 125, 78, 99, 37.0, 15, 15, 7, NOW() - INTERVAL '30 minutes'),
('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 82, 120, 75, 99, 37.0, 14, 15, 5, NOW() - INTERVAL '10 minutes'),
-- Patient 15 (douleur abdo) — 2 series
('e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 78, 130, 80, 98, 37.1, 16, 15, 4, NOW() - INTERVAL '1 hour 15 minutes'),
('e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 75, 125, 78, 99, 37.0, 15, 15, 2, NOW() - INTERVAL '20 minutes');

-- ============================================================
-- PRESCRIPTIONS (30+)
-- ============================================================
INSERT INTO prescriptions (id, encounter_id, patient_id, prescriber_id, medication_name, dosage, route, frequency, status, priority) VALUES
-- Patient 1: Douleur thoracique
('rx000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'PO', 'Toutes les 6h', 'completed', 'routine'),
('rx000001-0000-0000-0000-000000000002', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Aspirine', '250mg', 'PO', 'Dose unique', 'active', 'stat'),
('rx000001-0000-0000-0000-000000000003', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Héparine', '5000UI', 'IV', 'Bolus', 'active', 'stat'),
-- Patient 2: Chute PA
('rx000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'IV', 'Toutes les 6h', 'completed', 'routine'),
('rx000001-0000-0000-0000-000000000005', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '500ml', 'IV', 'En 2h', 'active', 'routine'),
-- Patient 3: Dyspnée
('rx000001-0000-0000-0000-000000000006', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Salbutamol', '5mg', 'INH', 'Toutes les 4h', 'active', 'urgent'),
('rx000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '500ml', 'IV', 'En 2h', 'completed', 'routine'),
-- Patient 4: Douleur abdominale
('rx000001-0000-0000-0000-000000000008', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'IV', 'Toutes les 6h', 'active', 'routine'),
('rx000001-0000-0000-0000-000000000009', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Ceftriaxone', '2g', 'IV', '1x/jour', 'active', 'urgent'),
('rx000001-0000-0000-0000-000000000010', 'e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Métoclopramide', '10mg', 'IV', 'Si nausées', 'active', 'routine'),
-- Patient 5: Traumatisme
('rx000001-0000-0000-0000-000000000011', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Kétoprofène', '100mg', 'IV', 'Toutes les 8h', 'completed', 'routine'),
('rx000001-0000-0000-0000-000000000012', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Morphine', '5mg', 'IV', 'Si EVA > 6', 'active', 'urgent'),
-- Patient 6: Céphalée
('rx000001-0000-0000-0000-000000000013', 'e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'IV', 'Toutes les 6h', 'active', 'routine'),
('rx000001-0000-0000-0000-000000000014', 'e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'Oméprazole', '40mg', 'IV', '1x/jour', 'active', 'routine'),
-- Patient 7: Malaise — déchocage
('rx000001-0000-0000-0000-000000000015', 'e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '1000ml', 'IV', 'Bolus', 'completed', 'stat'),
('rx000001-0000-0000-0000-000000000016', 'e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'Adrénaline', '1mg', 'IV', 'Si ACR', 'active', 'stat'),
-- Patient 8: Intoxication
('rx000001-0000-0000-0000-000000000017', 'e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '500ml', 'IV', 'En 4h', 'completed', 'routine'),
('rx000001-0000-0000-0000-000000000018', 'e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'Oméprazole', '40mg', 'IV', '1x/jour', 'active', 'routine'),
-- Patient 9: AEG
('rx000001-0000-0000-0000-000000000019', 'e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'IV', 'Toutes les 6h', 'completed', 'routine'),
('rx000001-0000-0000-0000-000000000020', 'e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'Ceftriaxone', '2g', 'IV', '1x/jour', 'active', 'urgent'),
('rx000001-0000-0000-0000-000000000021', 'e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '1000ml', 'IV', 'En 2h', 'active', 'routine'),
-- Patient 10: Plaie
('rx000001-0000-0000-0000-000000000022', 'e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'PO', 'Toutes les 6h', 'active', 'routine'),
-- Patient 11: Brûlure
('rx000001-0000-0000-0000-000000000023', 'e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000001', 'Morphine', '5mg', 'IV', 'Si EVA > 6', 'active', 'urgent'),
('rx000001-0000-0000-0000-000000000024', 'e0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000001', 'NaCl 0.9%', '1000ml', 'IV', 'En 4h', 'active', 'routine'),
-- Patient 13: Douleur thoracique déchocage
('rx000001-0000-0000-0000-000000000025', 'e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', 'Aspirine', '250mg', 'PO', 'Dose unique', 'completed', 'stat'),
('rx000001-0000-0000-0000-000000000026', 'e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', 'Héparine', '5000UI', 'IV', 'Bolus', 'completed', 'stat'),
('rx000001-0000-0000-0000-000000000027', 'e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', 'Morphine', '3mg', 'IV', 'Titration', 'active', 'stat'),
-- Patient 14: Traumatisme membre
('rx000001-0000-0000-0000-000000000028', 'e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000001', 'Kétoprofène', '100mg', 'IV', 'Toutes les 8h', 'active', 'routine'),
('rx000001-0000-0000-0000-000000000029', 'e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000001', 'Enoxaparine', '4000UI', 'SC', '1x/jour', 'active', 'routine'),
-- Patient 15: Douleur abdominale
('rx000001-0000-0000-0000-000000000030', 'e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000001', 'Paracétamol', '1g', 'PO', 'Toutes les 6h', 'active', 'routine'),
('rx000001-0000-0000-0000-000000000031', 'e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000001', 'Amoxicilline', '1g', 'PO', 'Toutes les 8h', 'active', 'routine')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ADMINISTRATIONS (15)
-- ============================================================
INSERT INTO administrations (prescription_id, encounter_id, patient_id, administered_by, dose_given, route, administered_at) VALUES
('rx000001-0000-0000-0000-000000000001', 'e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '1g', 'PO', NOW() - INTERVAL '3 hours'),
('rx000001-0000-0000-0000-000000000004', 'e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', '1g', 'IV', NOW() - INTERVAL '2 hours 30 minutes'),
('rx000001-0000-0000-0000-000000000007', 'e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', '500ml', 'IV', NOW() - INTERVAL '1 hour 45 minutes'),
('rx000001-0000-0000-0000-000000000011', 'e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', '100mg', 'IV', NOW() - INTERVAL '4 hours'),
('rx000001-0000-0000-0000-000000000015', 'e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', '1000ml', 'IV', NOW() - INTERVAL '20 minutes'),
('rx000001-0000-0000-0000-000000000017', 'e0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', '500ml', 'IV', NOW() - INTERVAL '4 hours'),
('rx000001-0000-0000-0000-000000000019', 'e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', '1g', 'IV', NOW() - INTERVAL '2 hours 45 minutes'),
('rx000001-0000-0000-0000-000000000025', 'e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', '250mg', 'PO', NOW() - INTERVAL '1 hour 50 minutes'),
('rx000001-0000-0000-0000-000000000026', 'e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000001', '5000UI', 'IV', NOW() - INTERVAL '1 hour 45 minutes');

-- ============================================================
-- RESULTS (20)
-- ============================================================
INSERT INTO results (encounter_id, patient_id, category, title, content, is_critical, is_read, received_at) VALUES
-- Patient 1: Troponine positive
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'bio', 'Troponine H0', '{"troponine_us": 45, "seuil": 14}', true, false, NOW() - INTERVAL '2 hours 30 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'bio', 'NFS + Ionogramme', '{"hemoglobine": 14.2, "leucocytes": 8.5, "creatinine": 95, "potassium": 4.1}', false, true, NOW() - INTERVAL '2 hours 45 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'ecg', 'ECG 12 dérivations', '{"rythme": "Sinusal 82/min", "axe": "Normal", "ST": "Sus-décalage V1-V4", "conclusion": "SCA ST+ antérieur"}', true, false, NOW() - INTERVAL '3 hours'),
-- Patient 2: ECG FA
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'ecg', 'ECG 12 dérivations', '{"rythme": "FA rapide à 130/min", "axe": "Normal", "ST": "Pas de sus-décalage", "conclusion": "Fibrillation auriculaire rapide"}', true, false, NOW() - INTERVAL '2 hours'),
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'bio', 'NFS', '{"hemoglobine": 11.8, "leucocytes": 7.2, "creatinine": 110, "potassium": 4.5}', false, true, NOW() - INTERVAL '1 hour 45 minutes'),
-- Patient 3: Radio thorax
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'imagerie', 'Radio thorax', '{"conclusion": "Syndrome interstitiel bilatéral. Cardiomégalie modérée.", "technique": "Face debout"}', true, false, NOW() - INTERVAL '1 hour 30 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'bio', 'BNP', '{"BNP": 1200, "seuil": 100}', true, false, NOW() - INTERVAL '1 hour 15 minutes'),
-- Patient 4: Bio infectieuse
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'bio', 'CRP + Lactates', '{"CRP": 85, "lactates": 1.2, "procalcitonine": 0.8}', false, false, NOW() - INTERVAL '45 minutes'),
('e0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'bio', 'NFS + Ionogramme', '{"hemoglobine": 13.5, "leucocytes": 15.2, "creatinine": 68, "potassium": 3.8}', false, false, NOW() - INTERVAL '50 minutes'),
-- Patient 5: Résultats normaux
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'bio', 'NFS + Ionogramme', '{"hemoglobine": 15.0, "leucocytes": 6.8, "creatinine": 180, "potassium": 5.8}', true, false, NOW() - INTERVAL '3 hours'),
('e0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'imagerie', 'Radio genou D', '{"conclusion": "Pas de fracture visible. Épanchement articulaire modéré.", "technique": "Face + profil"}', false, true, NOW() - INTERVAL '2 hours 30 minutes'),
-- Patient 6: Scanner cérébral
('e0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'imagerie', 'Scanner cérébral', '{"conclusion": "Pas de lésion hémorragique. Pas d''effet de masse.", "injection": "Sans injection"}', false, false, NOW() - INTERVAL '30 minutes'),
-- Patient 7: Bio urgence
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'bio', 'Bilan urgence', '{"hemoglobine": 8.2, "leucocytes": 3.1, "creatinine": 250, "potassium": 6.1, "lactates": 4.5}', true, false, NOW() - INTERVAL '15 minutes'),
-- Patient 9: Bio AEG
('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'bio', 'NFS + CRP', '{"hemoglobine": 10.5, "leucocytes": 18.5, "CRP": 180, "procalcitonine": 2.5}', true, false, NOW() - INTERVAL '2 hours'),
('e0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'bio', 'Lactates + Iono', '{"lactates": 3.8, "potassium": 3.2, "creatinine": 145}', true, false, NOW() - INTERVAL '1 hour 45 minutes'),
-- Patient 10: Radio
('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'bio', 'NFS', '{"hemoglobine": 14.5, "leucocytes": 7.0, "creatinine": 62, "potassium": 4.0}', false, true, NOW() - INTERVAL '40 minutes'),
-- Patient 13: Bio urgence
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'bio', 'Troponine H0', '{"troponine_us": 120, "seuil": 14}', true, false, NOW() - INTERVAL '1 hour 30 minutes'),
('e0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000013', 'bio', 'NFS + Iono + Lactates', '{"hemoglobine": 12.0, "leucocytes": 11.5, "creatinine": 88, "potassium": 4.3, "lactates": 2.8}', false, false, NOW() - INTERVAL '1 hour 15 minutes'),
-- Patient 14: Radio
('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'imagerie', 'Radio cheville D', '{"conclusion": "Fracture malléole externe sans déplacement.", "technique": "Face + profil + mortaise"}', false, false, NOW() - INTERVAL '20 minutes'),
-- Patient 15: Bio normale
('e0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000015', 'bio', 'NFS + Ionogramme', '{"hemoglobine": 14.8, "leucocytes": 6.5, "creatinine": 72, "potassium": 4.2}', false, true, NOW() - INTERVAL '50 minutes');

-- ============================================================
-- PROCEDURES (10)
-- ============================================================
INSERT INTO procedures (encounter_id, patient_id, performed_by, procedure_type, notes, performed_at) VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 18G bras gauche', NOW() - INTERVAL '3 hours 30 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'Bilan sanguin complet', NOW() - INTERVAL '3 hours 25 minutes'),
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'ecg', 'ECG 12 dérivations — rythme sinusal', NOW() - INTERVAL '3 hours 20 minutes'),
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'NFS + Iono + INR', NOW() - INTERVAL '2 hours 40 minutes'),
('e0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'ecg', 'ECG 12 dérivations', NOW() - INTERVAL '2 hours 35 minutes'),
('e0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 20G avant-bras droit', NOW() - INTERVAL '2 hours 10 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'vvp', 'VVP 16G antécubital gauche', NOW() - INTERVAL '24 minutes'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'Bilan urgence complet + lactates', NOW() - INTERVAL '23 minutes'),
('e0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'pansement', 'Suture plaie main 3 points', NOW() - INTERVAL '30 minutes'),
('e0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000001', 'prelevement', 'NFS + Iono', NOW() - INTERVAL '25 minutes');

-- ============================================================
-- TIMELINE_ITEMS (40+)
-- ============================================================
INSERT INTO timeline_items (patient_id, item_type, content, source_document, source_date, source_author) VALUES
-- Patient 1 (HTA + Diabète)
('a0000001-0000-0000-0000-000000000001', 'antecedent', 'HTA depuis 2010 — traité par bisoprolol 5mg', 'DMP', '2024-06-15', 'Dr. Leroy'),
('a0000001-0000-0000-0000-000000000001', 'antecedent', 'Diabète type 2 depuis 2015 — metformine 1g x2/j', 'DMP', '2024-06-15', 'Dr. Leroy'),
('a0000001-0000-0000-0000-000000000001', 'allergie', 'Allergie : Pénicilline (éruption cutanée)', 'DMP', '2020-03-01', 'Pharmacie CHU'),
('a0000001-0000-0000-0000-000000000001', 'traitement', 'Bisoprolol 5mg 1x/j, Metformine 1g 2x/j, Ramipril 5mg 1x/j', 'Ordonnance', '2025-11-01', 'Dr. Leroy'),
('a0000001-0000-0000-0000-000000000001', 'crh', 'Hospitalisation SCA non ST+ 2024 — coronarographie : sténose IVA traitée par angioplastie + stent', 'CRH Cardiologie CHU', '2024-03-20', 'Dr. Cardiologue'),
-- Patient 2 (BPCO + FA)
('a0000001-0000-0000-0000-000000000002', 'antecedent', 'BPCO stade III — oxygénothérapie nocturne', 'DMP', '2023-09-10', 'Dr. Roux'),
('a0000001-0000-0000-0000-000000000002', 'antecedent', 'Fibrillation auriculaire permanente — apixaban', 'DMP', '2023-09-10', 'Dr. Roux'),
('a0000001-0000-0000-0000-000000000002', 'traitement', 'Apixaban 5mg 2x/j, Symbicort 400/12 2x/j, Spiriva 18µg 1x/j', 'Ordonnance', '2025-10-15', 'Dr. Roux'),
('a0000001-0000-0000-0000-000000000002', 'crh', 'Hospitalisation pour exacerbation BPCO — corticoïdes IV + ATB — amélioration J4', 'CRH Pneumologie', '2025-06-20', 'Dr. Pneumologue'),
-- Patient 3 (Aspirine allergy)
('a0000001-0000-0000-0000-000000000003', 'allergie', 'Allergie : Aspirine (bronchospasme)', 'DMP', '2019-05-15', 'Dr. Simon'),
-- Patient 4 (Asthme)
('a0000001-0000-0000-0000-000000000004', 'antecedent', 'Asthme allergique depuis enfance — bien contrôlé', 'DMP', '2024-01-20', 'Dr. Laurent'),
('a0000001-0000-0000-0000-000000000004', 'traitement', 'Ventoline à la demande, Symbicort 200/6 2x/j', 'Ordonnance', '2025-09-01', 'Dr. Laurent'),
-- Patient 5 (IR + HTA + Iode)
('a0000001-0000-0000-0000-000000000005', 'antecedent', 'Insuffisance rénale chronique stade 3b — créatinine basale 150', 'DMP', '2023-05-01', 'Dr. Garcia'),
('a0000001-0000-0000-0000-000000000005', 'antecedent', 'HTA ancienne sous trithérapie', 'DMP', '2023-05-01', 'Dr. Garcia'),
('a0000001-0000-0000-0000-000000000005', 'allergie', 'Allergie : Iode (réaction anaphylactoïde au PCI)', 'DMP', '2018-11-20', 'Radiologue CHU'),
('a0000001-0000-0000-0000-000000000005', 'traitement', 'Ramipril 10mg, Amlodipine 10mg, Furosémide 40mg, Kayexalate si K>5.5', 'Ordonnance', '2025-10-01', 'Dr. Garcia'),
('a0000001-0000-0000-0000-000000000005', 'crh', 'Hospitalisation pour IRA sur IRC — récupération partielle — créat de sortie 160', 'CRH Néphrologie', '2025-01-15', 'Dr. Néphrologue'),
-- Patient 6 (Migraine)
('a0000001-0000-0000-0000-000000000006', 'antecedent', 'Migraine chronique avec aura — 3-4 crises/mois', 'DMP', '2024-02-10', 'Dr. Martin'),
('a0000001-0000-0000-0000-000000000006', 'traitement', 'Topiramate 50mg 1x/j, Sumatriptan 50mg si crise', 'Ordonnance', '2025-08-01', 'Dr. Martin'),
-- Patient 8 (HTA + Hypothyroïdie + Allergies)
('a0000001-0000-0000-0000-000000000008', 'antecedent', 'HTA — sous bisoprolol', 'DMP', '2024-04-15', 'Dr. Blanc'),
('a0000001-0000-0000-0000-000000000008', 'antecedent', 'Hypothyroïdie — sous lévothyroxine', 'DMP', '2024-04-15', 'Dr. Blanc'),
('a0000001-0000-0000-0000-000000000008', 'allergie', 'Allergie : Pénicilline (rash)', 'DMP', '2015-09-01', 'Pharmacie'),
('a0000001-0000-0000-0000-000000000008', 'allergie', 'Allergie : Sulfamides (Stevens-Johnson)', 'DMP', '2017-03-15', 'Dermatologue CHU'),
('a0000001-0000-0000-0000-000000000008', 'traitement', 'Bisoprolol 2.5mg 1x/j, Lévothyroxine 75µg 1x/j', 'Ordonnance', '2025-11-10', 'Dr. Blanc'),
-- Patient 9 (AVC + FA + HTA)
('a0000001-0000-0000-0000-000000000009', 'antecedent', 'AVC ischémique 2022 — séquelles minimes (hémiparésie droite résiduelle)', 'CRH Neurologie', '2022-08-10', 'Dr. Neurologue'),
('a0000001-0000-0000-0000-000000000009', 'antecedent', 'Fibrillation auriculaire — sous warfarine', 'DMP', '2023-01-15', 'Dr. Dupont'),
('a0000001-0000-0000-0000-000000000009', 'antecedent', 'HTA ancienne', 'DMP', '2023-01-15', 'Dr. Dupont'),
('a0000001-0000-0000-0000-000000000009', 'traitement', 'Warfarine 5mg (INR cible 2-3), Ramipril 5mg, Atorvastatine 40mg', 'Ordonnance', '2025-09-20', 'Dr. Dupont'),
('a0000001-0000-0000-0000-000000000009', 'crh', 'Dernier contrôle neurologique — état stable — INR dans la cible', 'CRH Neurologie', '2025-07-15', 'Dr. Neurologue'),
-- Patient 11 (Diabète + Obésité + Morphine allergy)
('a0000001-0000-0000-0000-000000000011', 'antecedent', 'Diabète type 2 insulino-requérant', 'DMP', '2024-03-01', 'Dr. Martinez'),
('a0000001-0000-0000-0000-000000000011', 'antecedent', 'Obésité morbide IMC 38', 'DMP', '2024-03-01', 'Dr. Martinez'),
('a0000001-0000-0000-0000-000000000011', 'allergie', 'Allergie : Morphine (nausées sévères + urticaire)', 'DMP', '2021-06-10', 'Anesthésiste'),
('a0000001-0000-0000-0000-000000000011', 'traitement', 'Insuline Lantus 30UI/j, Metformine 1g 3x/j, Empagliflozine 25mg 1x/j', 'Ordonnance', '2025-10-20', 'Dr. Martinez'),
-- Patient 13 (BPCO + IC)
('a0000001-0000-0000-0000-000000000013', 'antecedent', 'BPCO stade IV — OLD 2L/min', 'DMP', '2023-11-01', 'Dr. Petit'),
('a0000001-0000-0000-0000-000000000013', 'antecedent', 'Insuffisance cardiaque à FEVG altérée 30%', 'DMP', '2023-11-01', 'Dr. Petit'),
('a0000001-0000-0000-0000-000000000013', 'traitement', 'Furosémide 80mg, Bisoprolol 2.5mg, Sacubitril/Valsartan 49/51mg 2x/j, Spironolactone 25mg', 'Ordonnance', '2025-10-01', 'Dr. Petit'),
('a0000001-0000-0000-0000-000000000013', 'crh', 'Hospitalisation décompensation cardiaque globale — reprise diurétiques IV — amélioration J5', 'CRH Cardiologie', '2025-09-20', 'Dr. Cardiologue'),
-- Patient 14 (Latex allergy)
('a0000001-0000-0000-0000-000000000014', 'allergie', 'Allergie : Latex (urticaire de contact)', 'DMP', '2022-04-01', 'Allergologue'),
-- Patient 15 (Lombalgie)
('a0000001-0000-0000-0000-000000000015', 'antecedent', 'Lombalgie chronique — hernie discale L4-L5 opérée 2023', 'DMP', '2024-01-10', 'Dr. Durand'),
('a0000001-0000-0000-0000-000000000015', 'traitement', 'Paracétamol 1g si douleur, Prégabaline 75mg 2x/j', 'Ordonnance', '2025-11-15', 'Dr. Durand'),
('a0000001-0000-0000-0000-000000000015', 'crh', 'Chirurgie hernie discale L4-L5 — discectomie — suites simples', 'CRH Neurochirurgie', '2023-05-10', 'Dr. Neurochirurgien');

-- ============================================================
-- TRANSMISSIONS (few DAR examples)
-- ============================================================
INSERT INTO transmissions (encounter_id, patient_id, author_id, donnees, actions, resultats, cible) VALUES
('e0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'FC 82 | PA 138/82 | SpO2 98% | T° 37.0°C | EVA 3/10', 'Admin: Paracétamol 1g PO | VVP 18G posée | ECG réalisé', 'Douleur en régression. Troponine positive — avis cardio en cours.', 'Douleur'),
('e0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'FC 68 | PA 105/65 | SpO2 96% | T° 37.0°C | GCS 15', 'Remplissage NaCl 1L bolus | VVP 16G posée | Bilan urgence prélevé', 'Hémodynamique stabilisée après remplissage. Patient conscient, orienté.', 'Hémodynamique');
