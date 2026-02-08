import { Pill, HeartPulse, FlaskConical, ScanLine } from 'lucide-react';
import React from 'react';

const soinsKeywords = ['pansement', 'soin', 'nursing', 'toilette', 'surveillance', 'scope', 'monitoring'];
const examBioKeywords = ['bilan', 'nfs', 'iono', 'crp', 'troponine', 'hémostase', 'gaz du sang', 'lactate', 'bhu', 'hémoglobine'];
const examImagerieKeywords = ['radio', 'scanner', 'irm', 'écho', 'imagerie', 'rx', 'tdm', 'radiographie'];

export type PrescriptionCategory = 'soins' | 'examens_bio' | 'examens_imagerie' | 'traitements';

export function categorizePrescription(rx: { medication_name: string; notes?: string | null }): PrescriptionCategory {
  const notes = (rx.notes || '').toLowerCase();
  const typeMatch = notes.match(/\[type:(soins|examens_bio|examens_imagerie|traitements)\]/);
  if (typeMatch) return typeMatch[1] as PrescriptionCategory;
  const name = rx.medication_name.toLowerCase();
  if (soinsKeywords.some(k => name.includes(k))) return 'soins';
  if (examBioKeywords.some(k => name.includes(k))) return 'examens_bio';
  if (examImagerieKeywords.some(k => name.includes(k))) return 'examens_imagerie';
  return 'traitements';
}

export const PRESCRIPTION_TEMPLATES: Record<string, { name: string; dosage: string; route: string; type: PrescriptionCategory }[]> = {
  'Douleur thoracique': [
    { name: 'Aspirine', dosage: '250mg', route: 'PO', type: 'traitements' },
    { name: 'Héparine sodique', dosage: '5000 UI', route: 'IV', type: 'traitements' },
    { name: 'Troponine + NFS + Iono', dosage: 'Bilan standard', route: 'IV', type: 'examens_bio' },
    { name: 'ECG 12 dérivations', dosage: 'Standard', route: 'IV', type: 'soins' },
    { name: 'Radio thorax', dosage: 'Face', route: 'IV', type: 'examens_imagerie' },
  ],
  'Dyspnée': [
    { name: 'Oxygénothérapie', dosage: '3L/min', route: 'INH', type: 'soins' },
    { name: 'Salbutamol nébulisation', dosage: '5mg', route: 'INH', type: 'traitements' },
    { name: 'Gaz du sang artériel', dosage: 'Standard', route: 'IV', type: 'examens_bio' },
    { name: 'Radio thorax', dosage: 'Face', route: 'IV', type: 'examens_imagerie' },
  ],
  'Douleur abdominale': [
    { name: 'Paracétamol', dosage: '1g', route: 'IV', type: 'traitements' },
    { name: 'Phloroglucinol', dosage: '80mg', route: 'IV', type: 'traitements' },
    { name: 'NFS + CRP + Lipase + BHC', dosage: 'Bilan standard', route: 'IV', type: 'examens_bio' },
    { name: 'Scanner abdominal', dosage: 'Injecté', route: 'IV', type: 'examens_imagerie' },
  ],
  'Traumatisme membre': [
    { name: 'Paracétamol', dosage: '1g', route: 'PO', type: 'traitements' },
    { name: 'Kétoprofène', dosage: '100mg', route: 'IV', type: 'traitements' },
    { name: 'Radio standard', dosage: 'Face + Profil', route: 'IV', type: 'examens_imagerie' },
  ],
  'Céphalée': [
    { name: 'Paracétamol', dosage: '1g', route: 'IV', type: 'traitements' },
    { name: 'NFS + CRP + Iono', dosage: 'Bilan standard', route: 'IV', type: 'examens_bio' },
    { name: 'Scanner cérébral', dosage: 'Sans injection', route: 'IV', type: 'examens_imagerie' },
  ],
  'Malaise / syncope': [
    { name: 'NFS + Glycémie + Iono + Troponine', dosage: 'Bilan standard', route: 'IV', type: 'examens_bio' },
    { name: 'ECG 12 dérivations', dosage: 'Standard', route: 'IV', type: 'soins' },
    { name: 'Scope monitoring', dosage: 'Continu', route: 'IV', type: 'soins' },
  ],
  'Chute personne âgée': [
    { name: 'Paracétamol', dosage: '1g', route: 'IV', type: 'traitements' },
    { name: 'NFS + Iono + Créatinine + INR', dosage: 'Bilan standard', route: 'IV', type: 'examens_bio' },
    { name: 'Scanner cérébral', dosage: 'Sans injection', route: 'IV', type: 'examens_imagerie' },
    { name: 'Radio bassin + rachis', dosage: 'Face', route: 'IV', type: 'examens_imagerie' },
    { name: 'ECG 12 dérivations', dosage: 'Standard', route: 'IV', type: 'soins' },
  ],
  'Intoxication': [
    { name: 'Charbon activé', dosage: '50g', route: 'PO', type: 'traitements' },
    { name: 'NFS + Iono + BHC + Paracétamolémie', dosage: 'Bilan toxicologique', route: 'IV', type: 'examens_bio' },
    { name: 'ECG 12 dérivations', dosage: 'Standard', route: 'IV', type: 'soins' },
    { name: 'Scope monitoring', dosage: 'Continu', route: 'IV', type: 'soins' },
  ],
  'AEG / Fièvre': [
    { name: 'Paracétamol', dosage: '1g', route: 'IV', type: 'traitements' },
    { name: 'NaCl 0.9%', dosage: '500mL', route: 'IV', type: 'traitements' },
    { name: 'NFS + CRP + Hémocultures + ECBU + Lactates', dosage: 'Bilan infectieux', route: 'IV', type: 'examens_bio' },
    { name: 'Radio thorax', dosage: 'Face', route: 'IV', type: 'examens_imagerie' },
  ],
  'Plaie / Brûlure': [
    { name: 'Paracétamol', dosage: '1g', route: 'PO', type: 'traitements' },
    { name: 'Lidocaïne injectable', dosage: '1%', route: 'SC', type: 'traitements' },
    { name: 'Pansement / Suture', dosage: 'Selon localisation', route: 'IV', type: 'soins' },
    { name: 'SAT-VAT', dosage: 'Vérifier statut vaccinal', route: 'IM', type: 'traitements' },
  ],
};

export const PRESCRIPTION_SECTIONS: { key: PrescriptionCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'traitements', label: 'Traitements', icon: React.createElement(Pill, { className: 'h-3.5 w-3.5' }) },
  { key: 'soins', label: 'Soins', icon: React.createElement(HeartPulse, { className: 'h-3.5 w-3.5' }) },
  { key: 'examens_bio', label: 'Examens — Bilan', icon: React.createElement(FlaskConical, { className: 'h-3.5 w-3.5' }) },
  { key: 'examens_imagerie', label: 'Examens — Imagerie', icon: React.createElement(ScanLine, { className: 'h-3.5 w-3.5' }) },
];
