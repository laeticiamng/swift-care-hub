// ================================================================
// UrgenceOS — MSSante Adapter + CRH Template Generator
// MSSante = secure document exchange (CRH, ordonnances, courriers)
// ================================================================

import {
  type CanonicalPatient,
  type CanonicalEncounter,
  type CanonicalVitals,
  type CanonicalPrescription,
  type CanonicalResult,
  type CanonicalAllergy,
  type CanonicalCondition,
  type FullEncounterData,
} from './canonical-model';

import { ESTABLISHMENT } from './coding-systems';

// ── MSSante Message Type ──
export interface MSSanteMessage {
  from: string;
  to: string[];
  subject: string;
  patient: {
    ins: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
  };
  document: {
    type: 'crh' | 'ordonnance' | 'courrier';
    title: string;
    contentHTML: string;
    metadata: {
      dateCreation: string;
      auteur: string;
      etablissement: string;
      service: string;
    };
  };
}

// ── MSSante Send Log (for demo) ──
export interface MSSanteLog {
  id: string;
  timestamp: string;
  recipient: string;
  documentType: 'crh' | 'ordonnance' | 'courrier';
  patientName: string;
  status: 'sent' | 'error' | 'pending';
}

// ── Age calculation ──
function calculateAge(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ── Date formatting ──
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Format vitals for CRH display ──
function formatVitalsForCRH(vitals?: CanonicalVitals): string {
  if (!vitals) return 'Non renseigne';
  const parts: string[] = [];
  const fc = vitals.fc;
  const pas = vitals.pas ?? vitals.pa_systolique;
  const pad = vitals.pad ?? vitals.pa_diastolique;
  const spo2 = vitals.spo2;
  const temp = vitals.temperature;
  const fr = vitals.fr ?? vitals.frequence_respiratoire;
  const gcs = vitals.gcs;
  const eva = vitals.eva ?? vitals.eva_douleur;

  if (fc != null) parts.push(`FC ${fc}/min`);
  if (pas != null && pad != null) parts.push(`PA ${pas}/${pad} mmHg`);
  if (spo2 != null) parts.push(`SpO2 ${spo2}%`);
  if (temp != null) parts.push(`T ${temp}°C`);
  if (fr != null) parts.push(`FR ${fr}/min`);
  if (gcs != null) parts.push(`GCS ${gcs}/15`);
  if (eva != null) parts.push(`EVA ${eva}/10`);

  return parts.join(' — ') || 'Non renseigne';
}

// ── Generate CRH HTML ──
export function generateCRHHTML(data: FullEncounterData): string {
  const patient = data.patient;
  const encounter = data.encounter;

  const antecedents = data.conditions
    .filter(c => c.category === 'antecedent')
    .map(c => c.code_display)
    .filter(Boolean);

  const diagnostics = data.conditions
    .filter(c => c.category === 'diagnostic_actuel' || c.category === 'hypothese')
    .map(c => `${c.code_display || ''}${c.code_cim10 ? ` (${c.code_cim10})` : ''}`)
    .filter(Boolean);

  const medicationRx = data.prescriptions.filter(rx =>
    ['medicament', 'perfusion', 'titration', 'conditionnel', 'oxygene'].includes(rx.prescription_type),
  );

  const examResults = data.results.filter(r => r.result_type === 'bio' || r.category === 'bio');
  const imagingResults = data.results.filter(r => r.result_type === 'imagerie' || r.category === 'imagerie');
  const sortieRx = data.prescriptions.filter(rx => rx.prescription_type === 'sortie');

  const allergiesDisplay = data.allergies.length > 0
    ? data.allergies.map(a => `${a.substance}${a.reaction ? ` (${a.reaction})` : ''}`).join(', ')
    : 'Aucune allergie connue';

  const traitements = patient.traitements_actuels
    ? (typeof patient.traitements_actuels === 'string' ? patient.traitements_actuels : JSON.stringify(patient.traitements_actuels))
    : patient.traitements || 'Non renseigne';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e; line-height: 1.5; font-size: 13px; }
  .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 18px; font-weight: 700; color: #1e40af; letter-spacing: -0.02em; }
  .header .subtitle { font-size: 11px; color: #64748b; margin-top: 4px; }
  .patient-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }
  .patient-card strong { font-size: 15px; }
  .patient-card .details { color: #475569; font-size: 12px; margin-top: 4px; }
  h2 { font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 20px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
  .section { margin-bottom: 12px; }
  .section p { margin-bottom: 4px; }
  .critical { color: #dc2626; font-weight: 600; }
  .result-item { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f1f5f9; }
  .result-value { font-weight: 500; }
  .result-unit { color: #64748b; font-size: 11px; }
  .result-critical { color: #dc2626; font-weight: 700; }
  ul { padding-left: 20px; }
  li { margin-bottom: 3px; }
  .footer { margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
  .footer .signature { font-weight: 600; font-size: 14px; }
  .footer .institution { color: #64748b; font-size: 12px; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
  <div class="header">
    <h1>COMPTE-RENDU DE PASSAGE AUX URGENCES</h1>
    <div class="subtitle">${ESTABLISHMENT.name} — ${ESTABLISHMENT.service}</div>
  </div>

  <div class="patient-card">
    <strong>${escapeHtml(patient.nom)} ${escapeHtml(patient.prenom)}</strong>
    <div class="details">
      ${calculateAge(patient.date_naissance)} ans — ${patient.sexe === 'M' ? 'Homme' : 'Femme'} —
      Ne(e) le ${formatDate(patient.date_naissance)} —
      INS: ${patient.ins_numero || 'Non qualifie'}
    </div>
  </div>

  <h2>Motif de consultation</h2>
  <div class="section">
    <p><strong>${escapeHtml(encounter.motif_sfmu || encounter.motif || 'Non renseigne')}</strong></p>
    <p>CCMU ${encounter.ccmu || '?'} — CIMU ${encounter.cimu || '?'}</p>
    <p>Arrivee le ${encounter.when_event ? formatDateTime(encounter.when_event) : encounter.arrival_time ? formatDateTime(encounter.arrival_time) : 'Non renseigne'}</p>
  </div>

  <h2>Antecedents</h2>
  <div class="section">
    <p>${antecedents.length > 0 ? antecedents.map(a => escapeHtml(a)).join(', ') : (patient.antecedents && patient.antecedents.length > 0 ? patient.antecedents.map(a => escapeHtml(a)).join(', ') : 'Aucun antecedent renseigne')}</p>
  </div>

  <h2>Allergies</h2>
  <div class="section">
    <p class="${data.allergies.length > 0 ? 'critical' : ''}">${escapeHtml(allergiesDisplay)}</p>
  </div>

  <h2>Traitement habituel</h2>
  <div class="section">
    <p>${escapeHtml(typeof traitements === 'string' ? traitements : 'Non renseigne')}</p>
  </div>

  <h2>Constantes a l'arrivee</h2>
  <div class="section">
    <p>${formatVitalsForCRH(data.vitals[0])}</p>
  </div>

  ${examResults.length > 0 ? `
  <h2>Resultats biologiques</h2>
  <div class="section">
    ${examResults.map(r => `
    <div class="result-item">
      <span>${escapeHtml(r.title || r.name || '')}</span>
      <span class="${r.is_critical ? 'result-critical' : 'result-value'}">
        ${r.value_numeric != null ? r.value_numeric : (r.value_text || '')}
        <span class="result-unit">${r.value_unit || ''}</span>
        ${r.reference_range ? `<span class="result-unit">(N: ${r.reference_range})</span>` : ''}
        ${r.is_critical ? ' ⚠' : ''}
      </span>
    </div>
    `).join('')}
  </div>
  ` : ''}

  ${imagingResults.length > 0 ? `
  <h2>Resultats imagerie</h2>
  <div class="section">
    ${imagingResults.map(r => `<p><strong>${escapeHtml(r.title || r.name || '')}</strong>: ${escapeHtml(r.value_text || 'Resultat en attente')}</p>`).join('')}
  </div>
  ` : ''}

  <h2>Diagnostic</h2>
  <div class="section">
    <p>${diagnostics.length > 0 ? diagnostics.map(d => escapeHtml(d)).join(', ') : 'En cours d\'exploration'}</p>
  </div>

  <h2>Traitement aux urgences</h2>
  <div class="section">
    <ul>
      ${medicationRx.length > 0 ? medicationRx.map(rx => `
      <li>${escapeHtml(rx.medication_name || '')} ${rx.dose_value || rx.dosage || ''} ${rx.dose_unit || ''} ${rx.route || ''} ${rx.frequency || ''}</li>
      `).join('') : '<li>Aucun traitement administre</li>'}
    </ul>
  </div>

  <h2>Orientation</h2>
  <div class="section">
    <p>${escapeHtml(encounter.discharge_destination || encounter.orientation || 'En cours')}</p>
  </div>

  ${sortieRx.length > 0 ? `
  <h2>Ordonnance de sortie</h2>
  <div class="section">
    ${sortieRx.map(rx => `<p>${escapeHtml(rx.sortie_consignes || '')}</p>`).join('')}
  </div>
  ` : ''}

  <h2>Consignes de sortie</h2>
  <div class="section">
    <p>${sortieRx.length > 0 && sortieRx[0].sortie_consignes ? escapeHtml(sortieRx[0].sortie_consignes) : 'Reconsulter si aggravation'}</p>
  </div>

  <div class="footer">
    <p class="signature">Dr ${escapeHtml(encounter.assigned_doctor_name || 'Medecin urgentiste')}</p>
    <p class="institution">${ESTABLISHMENT.service} — ${ESTABLISHMENT.name}</p>
    <p class="institution">${formatDate(new Date())}</p>
  </div>
</body>
</html>`;
}

// ── Generate Ordonnance de sortie HTML ──
export function generateOrdonnanceHTML(data: FullEncounterData): string {
  const patient = data.patient;
  const encounter = data.encounter;
  const sortieRx = data.prescriptions.filter(rx => rx.prescription_type === 'sortie');

  // Get sortie medications or convert intrahospital to PO
  const medications: Array<{ name: string; dose: string; route: string; frequency: string; duration: string }> = [];

  if (sortieRx.length > 0 && sortieRx[0].sortie_medications) {
    medications.push(...sortieRx[0].sortie_medications);
  } else {
    // Auto-convert intrahospital prescriptions
    const ivToPoMap: Record<string, string> = {
      'Paracetamol': 'Paracetamol 1g PO',
      'Ketoprofene': 'Ketoprofene 100mg PO',
      'Phloroglucinol': 'Phloroglucinol 80mg PO',
      'Amoxicilline': 'Amoxicilline 1g PO',
    };

    for (const rx of data.prescriptions.filter(r => r.prescription_type === 'medicament' && r.status === 'active')) {
      const name = rx.medication_name || '';
      const converted = Object.entries(ivToPoMap).find(([key]) => name.toLowerCase().includes(key.toLowerCase()));
      if (converted) {
        medications.push({
          name: converted[1].split(' ')[0],
          dose: converted[1].split(' ')[1] || rx.dosage || '',
          route: 'PO',
          frequency: rx.frequency || 'q6h',
          duration: '5 jours',
        });
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Inter', system-ui, sans-serif; max-width: 700px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e; }
  .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 20px; color: #1e40af; }
  .header .doctor { font-size: 14px; color: #475569; margin-top: 4px; }
  .patient { background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
  .rx-line { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
  .rx-name { font-weight: 600; font-size: 14px; }
  .rx-details { color: #475569; font-size: 12px; margin-top: 2px; }
  .footer { margin-top: 40px; text-align: right; }
  .footer .date { color: #64748b; font-size: 12px; }
  .footer .signature { margin-top: 60px; border-top: 1px solid #1a1a2e; display: inline-block; padding-top: 4px; }
</style>
</head>
<body>
  <div class="header">
    <h1>ORDONNANCE</h1>
    <div class="doctor">Dr ${escapeHtml(encounter.assigned_doctor_name || 'Medecin urgentiste')}</div>
    <div class="doctor">${ESTABLISHMENT.service} — ${ESTABLISHMENT.name}</div>
  </div>

  <div class="patient">
    <strong>${escapeHtml(patient.nom)} ${escapeHtml(patient.prenom)}</strong> —
    ${calculateAge(patient.date_naissance)} ans —
    Ne(e) le ${formatDate(patient.date_naissance)}
    ${patient.poids ? ` — ${patient.poids} kg` : ''}
  </div>

  ${medications.length > 0 ? medications.map(med => `
  <div class="rx-line">
    <div class="rx-name">${escapeHtml(med.name)} ${escapeHtml(med.dose)}</div>
    <div class="rx-details">${escapeHtml(med.route)} — ${escapeHtml(med.frequency)} — pendant ${escapeHtml(med.duration)}</div>
  </div>
  `).join('') : '<p>Pas de traitement de sortie prescrit</p>'}

  <div class="footer">
    <div class="date">Fait le ${formatDate(new Date())}</div>
    <div class="signature">Signature</div>
  </div>
</body>
</html>`;
}

// ── Build MSSante message for CRH ──
export function buildMSSanteMessage(data: FullEncounterData, crhHTML: string): MSSanteMessage {
  const patient = data.patient;
  const encounter = data.encounter;

  return {
    from: `urgences@${ESTABLISHMENT.mssante_domain}`,
    to: [patient.medecin_traitant_mssante || `mt@${ESTABLISHMENT.mssante_domain}`].filter(Boolean),
    subject: `CR passage urgences - ${patient.nom} ${patient.prenom} - ${encounter.when_event ? formatDate(encounter.when_event) : formatDate(new Date())}`,
    patient: {
      ins: patient.ins_numero || '',
      nom: patient.nom,
      prenom: patient.prenom,
      dateNaissance: patient.date_naissance,
    },
    document: {
      type: 'crh',
      title: 'Compte-rendu de passage aux urgences',
      contentHTML: crhHTML,
      metadata: {
        dateCreation: new Date().toISOString(),
        auteur: encounter.assigned_doctor_name || 'Dr Urgentiste',
        etablissement: ESTABLISHMENT.name,
        service: ESTABLISHMENT.service,
      },
    },
  };
}

// ── Generate RPU (Resume de Passage aux Urgences - ATIH format) ──
export function generateRPU(data: FullEncounterData): Record<string, string | number | null> {
  const patient = data.patient;
  const encounter = data.encounter;
  const diagnostic = data.conditions.find(c => c.category === 'diagnostic_actuel' && c.verification_status === 'confirmed');

  return {
    INS: patient.ins_numero || null,
    IPP: patient.ipp || null,
    NOM: patient.nom,
    PRENOM: patient.prenom,
    DATE_NAISSANCE: patient.date_naissance,
    SEXE: patient.sexe,
    CP: null, // Code postal
    COMMUNE: null,
    DATE_ENTREE: encounter.when_event || encounter.arrival_time,
    MODE_ARRIVEE: 'Personnel', // Could be enriched
    PROVENANCE: 'Domicile',
    MOTIF_SFMU: encounter.motif_sfmu || '',
    CCMU: encounter.ccmu || null,
    CIMU: encounter.cimu || null,
    GEMSA: encounter.gemsa || null,
    DIAGNOSTIC_CIM10: diagnostic?.code_cim10 || null,
    DIAGNOSTIC_LIBELLE: diagnostic?.code_display || null,
    ACTES_CCAM: data.procedures.map(p => p.code).filter(Boolean).join(', ') || null,
    ORIENTATION: encounter.discharge_destination || encounter.orientation || null,
    DATE_SORTIE: encounter.discharge_at || encounter.discharge_time || null,
    MODE_SORTIE: encounter.discharge_destination || null,
    DESTINATION: encounter.discharge_destination || null,
    FINESS: ESTABLISHMENT.finess,
    SERVICE: ESTABLISHMENT.service,
  };
}

// ── Demo MSSante logs ──
export function generateDemoMSSanteLogs(): MSSanteLog[] {
  const now = new Date();
  return [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
      recipient: 'dr.martin@medecin.mssante.fr',
      documentType: 'crh',
      patientName: 'DUPONT Jean',
      status: 'sent',
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      recipient: 'dr.leroy@medecin.mssante.fr',
      documentType: 'ordonnance',
      patientName: 'MARTIN Marie',
      status: 'sent',
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
      recipient: 'dr.bernard@medecin.mssante.fr',
      documentType: 'crh',
      patientName: 'BERNARD Pierre',
      status: 'pending',
    },
  ];
}

// ── HTML Escape helper ──
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
