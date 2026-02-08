import { Pill, HeartPulse, FlaskConical, ScanLine } from 'lucide-react';
import React from 'react';

const soinsKeywords = ['pansement', 'soin', 'nursing', 'toilette', 'surveillance', 'scope', 'monitoring'];
const examBioKeywords = ['bilan', 'nfs', 'iono', 'crp', 'troponine', 'hémostase', 'gaz du sang', 'lactate', 'bhu', 'hémoglobine'];
const examImagerieKeywords = ['radio', 'scanner', 'irm', 'écho', 'imagerie', 'rx', 'tdm', 'radiographie'];

export type PrescriptionCategory = 'soins' | 'examens_bio' | 'examens_imagerie' | 'traitements';

export function categorizePrescription(rx: { medication_name: string }): PrescriptionCategory {
  const name = rx.medication_name.toLowerCase();
  if (soinsKeywords.some(k => name.includes(k))) return 'soins';
  if (examBioKeywords.some(k => name.includes(k))) return 'examens_bio';
  if (examImagerieKeywords.some(k => name.includes(k))) return 'examens_imagerie';
  return 'traitements';
}

export const PRESCRIPTION_SECTIONS: { key: PrescriptionCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'traitements', label: 'Traitements', icon: React.createElement(Pill, { className: 'h-3.5 w-3.5' }) },
  { key: 'soins', label: 'Soins', icon: React.createElement(HeartPulse, { className: 'h-3.5 w-3.5' }) },
  { key: 'examens_bio', label: 'Examens — Bilan', icon: React.createElement(FlaskConical, { className: 'h-3.5 w-3.5' }) },
  { key: 'examens_imagerie', label: 'Examens — Imagerie', icon: React.createElement(ScanLine, { className: 'h-3.5 w-3.5' }) },
];
