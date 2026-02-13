/**
 * PSMI Generator — Plan de Soins Médico-Infirmier
 * ------------------------------------------------
 * Generates the PSMI (care plan) document for patient handoff,
 * transfer, and shift change in French emergency departments.
 *
 * The PSMI summarizes:
 *  - Patient identity & demographics
 *  - Active prescriptions (medications, surveillance, exams)
 *  - Vital signs trend
 *  - Pending results
 *  - Nursing care plan (transmissions DAR)
 *  - Transfer/orientation information
 *
 * Output: HTML document ready for print or MSSanté transmission
 *
 * References:
 *  - Arrêté du 28 mars 2022 (socle commun DPI)
 *  - CI-SIS Volet Lettre de Liaison à l'entrée/sortie
 *  - SFMU Recommandations sur le dossier de passage aux urgences
 */

import type {
  FullEncounterData,
  CanonicalPrescription,
  CanonicalVitals,
} from './canonical-model';
import { ESTABLISHMENT } from './coding-systems';

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

export interface PSMISection {
  title: string;
  content: string;
  priority: 'critical' | 'high' | 'normal';
}

export interface PSMIDocument {
  /** Generated HTML content */
  html: string;
  /** Structured sections */
  sections: PSMISection[];
  /** Generation timestamp */
  generatedAt: string;
  /** Author */
  generatedBy: string;
  /** Patient summary line */
  patientSummary: string;
  /** Active alerts count */
  alertsCount: number;
}

export type PSMIContext = 'releve' | 'transfert' | 'sortie' | 'hospitalisation';

// ────────────────────────────────────────────────────────────────
// Core Generation
// ────────────────────────────────────────────────────────────────

/** Generate a complete PSMI document */
export function generatePSMI(
  data: FullEncounterData,
  context: PSMIContext = 'releve',
): PSMIDocument {
  const sections: PSMISection[] = [];
  let alertsCount = 0;

  // 1. Identité & alertes
  const identitySection = buildIdentitySection(data);
  sections.push(identitySection);

  // 2. Allergies (critical if present)
  const allergySection = buildAllergySection(data);
  if (allergySection.priority === 'critical') alertsCount++;
  sections.push(allergySection);

  // 3. Motif et diagnostic
  sections.push(buildDiagnosticSection(data));

  // 4. Constantes vitales (tendance)
  const vitalsSection = buildVitalsSection(data);
  if (vitalsSection.priority === 'critical') alertsCount++;
  sections.push(vitalsSection);

  // 5. Prescriptions actives
  const rxSection = buildPrescriptionsSection(data);
  sections.push(rxSection);

  // 6. Examens en attente
  const pendingSection = buildPendingExamsSection(data);
  if (pendingSection.content) sections.push(pendingSection);

  // 7. Soins infirmiers / Transmissions
  const nursingSection = buildNursingSection(data);
  if (nursingSection.content) sections.push(nursingSection);

  // 8. Orientation / Consignes
  const orientSection = buildOrientationSection(data, context);
  sections.push(orientSection);

  // Generate HTML
  const html = renderPSMIHTML(data, sections, context);

  return {
    html,
    sections,
    generatedAt: new Date().toISOString(),
    generatedBy: data.encounter.assigned_doctor_name || 'Équipe urgences',
    patientSummary: `${data.patient.nom} ${data.patient.prenom} — ${calculateAge(data.patient.date_naissance)} ans — ${data.encounter.motif_sfmu || data.encounter.motif || 'Motif non renseigné'}`,
    alertsCount,
  };
}

// ────────────────────────────────────────────────────────────────
// Section Builders
// ────────────────────────────────────────────────────────────────

function buildIdentitySection(data: FullEncounterData): PSMISection {
  const p = data.patient;
  const e = data.encounter;
  const age = calculateAge(p.date_naissance);
  const poids = p.poids || p.weight_kg;

  const lines = [
    `<strong>${esc(p.nom)} ${esc(p.prenom)}</strong> — ${age} ans — ${p.sexe === 'M' ? 'Homme' : 'Femme'}`,
    `DDN: ${formatDate(p.date_naissance)}${p.ins_numero ? ` — INS: ${esc(p.ins_numero)}` : ''}${p.ipp ? ` — IPP: ${esc(p.ipp)}` : ''}`,
    poids ? `Poids: ${poids} kg` : null,
    `Zone: ${e.zone || '?'} — Box: ${e.box_number || '?'}`,
    `Arrivée: ${e.arrival_time ? formatDateTime(e.arrival_time) : '?'} — Durée: ${calculateDuration(e.arrival_time)}`,
    e.assigned_doctor_name ? `Médecin: Dr ${esc(e.assigned_doctor_name)}` : null,
  ].filter(Boolean);

  return {
    title: 'Identité patient',
    content: lines.join('<br/>'),
    priority: 'normal',
  };
}

function buildAllergySection(data: FullEncounterData): PSMISection {
  if (data.allergies.length === 0) {
    return {
      title: 'Allergies',
      content: 'Aucune allergie connue',
      priority: 'normal',
    };
  }

  const lines = data.allergies.map(a => {
    const parts = [esc(a.substance)];
    if (a.criticality === 'high') parts.push('<span class="critical">CRITIQUE</span>');
    if (a.reaction) parts.push(`réaction: ${esc(a.reaction)}`);
    if (a.severity) parts.push(`sévérité: ${esc(a.severity)}`);
    return `<li>${parts.join(' — ')}</li>`;
  });

  return {
    title: 'Allergies',
    content: `<ul>${lines.join('')}</ul>`,
    priority: data.allergies.some(a => a.criticality === 'high') ? 'critical' : 'high',
  };
}

function buildDiagnosticSection(data: FullEncounterData): PSMISection {
  const e = data.encounter;
  const diagnostics = data.conditions.filter(
    c => c.category === 'diagnostic_actuel' || c.category === 'hypothese',
  );
  const antecedents = data.conditions.filter(c => c.category === 'antecedent');

  const lines: string[] = [];
  lines.push(`<strong>Motif:</strong> ${esc(e.motif_sfmu || e.motif || 'Non renseigné')}`);
  lines.push(`CIMU: ${e.cimu || '?'} — CCMU: ${e.ccmu || '?'}`);

  if (diagnostics.length > 0) {
    lines.push('<strong>Diagnostic:</strong>');
    diagnostics.forEach(d => {
      lines.push(`• ${esc(d.code_display || '')}${d.code_cim10 ? ` (${d.code_cim10})` : ''} [${d.verification_status || '?'}]`);
    });
  }

  if (antecedents.length > 0) {
    lines.push(`<strong>ATCD:</strong> ${antecedents.map(a => esc(a.code_display || '')).join(', ')}`);
  }

  const traitements = data.patient.traitements_actuels || data.patient.traitements;
  if (traitements) {
    lines.push(`<strong>TTT habituel:</strong> ${esc(typeof traitements === 'string' ? traitements : JSON.stringify(traitements))}`);
  }

  return {
    title: 'Motif & diagnostic',
    content: lines.join('<br/>'),
    priority: 'normal',
  };
}

function buildVitalsSection(data: FullEncounterData): PSMISection {
  if (data.vitals.length === 0) {
    return { title: 'Constantes vitales', content: 'Aucune constante enregistrée', priority: 'normal' };
  }

  // Sort by time, most recent last
  const sorted = [...data.vitals].sort((a, b) =>
    (a.when_event || a.recorded_at || '').localeCompare(b.when_event || b.recorded_at || ''),
  );

  const latest = sorted[sorted.length - 1];
  const alerts: string[] = [];

  // Critical value detection
  if (latest.fc != null && (latest.fc < 40 || latest.fc > 150)) alerts.push(`FC ${latest.fc}/min`);
  if (latest.pas != null && (latest.pas < 80 || latest.pas > 200)) alerts.push(`PAS ${latest.pas} mmHg`);
  if (latest.spo2 != null && latest.spo2 < 90) alerts.push(`SpO2 ${latest.spo2}%`);
  if (latest.temperature != null && (latest.temperature < 35 || latest.temperature > 40)) alerts.push(`T° ${latest.temperature}°C`);
  if (latest.gcs != null && latest.gcs < 13) alerts.push(`GCS ${latest.gcs}/15`);

  const formatVital = (v: CanonicalVitals): string => {
    const parts: string[] = [];
    const time = v.when_event || v.recorded_at;
    if (time) parts.push(`<em>${formatTime(time)}</em>`);
    if (v.fc != null) parts.push(`FC ${v.fc}`);
    const pas = v.pas ?? v.pa_systolique;
    const pad = v.pad ?? v.pa_diastolique;
    if (pas != null && pad != null) parts.push(`PA ${pas}/${pad}`);
    if (v.spo2 != null) parts.push(`SpO2 ${v.spo2}%`);
    if (v.temperature != null) parts.push(`T° ${v.temperature}°C`);
    const fr = v.fr ?? v.frequence_respiratoire;
    if (fr != null) parts.push(`FR ${fr}`);
    if (v.gcs != null) parts.push(`GCS ${v.gcs}`);
    const eva = v.eva ?? v.eva_douleur;
    if (eva != null) parts.push(`EVA ${eva}/10`);
    return parts.join(' — ');
  };

  // Show last 3 readings for trend
  const recentVitals = sorted.slice(-3);
  const lines = recentVitals.map(v => formatVital(v));

  let content = lines.map(l => `<div class="vital-row">${l}</div>`).join('');

  if (alerts.length > 0) {
    content = `<div class="alert-box">⚠ ALERTES: ${alerts.join(', ')}</div>` + content;
  }

  return {
    title: 'Constantes vitales',
    content,
    priority: alerts.length > 0 ? 'critical' : 'normal',
  };
}

function buildPrescriptionsSection(data: FullEncounterData): PSMISection {
  const activeRx = data.prescriptions.filter(rx =>
    rx.status === 'active' || rx.status === 'prescrit',
  );

  if (activeRx.length === 0) {
    return { title: 'Prescriptions actives', content: 'Aucune prescription active', priority: 'normal' };
  }

  const groupByType = (type: string): CanonicalPrescription[] =>
    activeRx.filter(rx => rx.prescription_type === type);

  const lines: string[] = [];

  // Medications
  const meds = activeRx.filter(rx =>
    ['medicament', 'perfusion', 'titration', 'conditionnel', 'oxygene'].includes(rx.prescription_type),
  );
  if (meds.length > 0) {
    lines.push('<strong>Médicaments:</strong>');
    meds.forEach(rx => {
      const parts = [esc(rx.medication_name || '?')];
      if (rx.dose_value) parts.push(`${rx.dose_value} ${rx.dose_unit || ''}`);
      if (rx.route) parts.push(rx.route);
      if (rx.frequency) parts.push(rx.frequency);
      if (rx.prescription_type === 'titration') parts.push('(TITRATION)');
      if (rx.prescription_type === 'conditionnel') parts.push(`(SI ${esc(rx.condition_trigger || '')})`);
      if (rx.priority === 'stat') parts.push('<span class="critical">STAT</span>');
      lines.push(`• ${parts.join(' — ')}`);
    });
  }

  // Surveillance
  const surv = groupByType('surveillance');
  if (surv.length > 0) {
    lines.push('<strong>Surveillance:</strong>');
    surv.forEach(rx => {
      lines.push(`• ${esc(rx.surveillance_type || 'Paramètres')} toutes les ${esc(rx.surveillance_frequency || '?')}`);
    });
  }

  // Exams pending
  const exams = activeRx.filter(rx =>
    ['exam_bio', 'exam_imagerie', 'exam_ecg', 'exam_autre'].includes(rx.prescription_type),
  );
  if (exams.length > 0) {
    lines.push('<strong>Examens prescrits:</strong>');
    exams.forEach(rx => {
      const examName = rx.exam_list?.join(', ') || rx.medication_name || rx.prescription_type;
      lines.push(`• ${esc(examName)}${rx.exam_urgency === 'urgent' ? ' <span class="critical">URGENT</span>' : ''}`);
    });
  }

  // Diet / mobilization
  const regime = groupByType('regime');
  const mobil = groupByType('mobilisation');
  if (regime.length > 0 || mobil.length > 0) {
    lines.push('<strong>Régime / Mobilisation:</strong>');
    regime.forEach(rx => lines.push(`• Régime: ${esc(rx.regime_details || 'À jeun')}`));
    mobil.forEach(rx => lines.push(`• ${esc(rx.mobilisation_details || 'Repos strict')}`));
  }

  return {
    title: 'Prescriptions actives',
    content: lines.join('<br/>'),
    priority: meds.some(rx => rx.priority === 'stat') ? 'high' : 'normal',
  };
}

function buildPendingExamsSection(data: FullEncounterData): PSMISection {
  const pendingResults = data.prescriptions.filter(rx =>
    ['exam_bio', 'exam_imagerie', 'exam_ecg', 'exam_autre'].includes(rx.prescription_type)
    && rx.status === 'active',
  );

  // Check which exams have results
  const resultExams = new Set(data.results.map(r => r.category || r.result_type));
  const stillPending = pendingResults.filter(rx => {
    const type = rx.prescription_type.replace('exam_', '');
    return !resultExams.has(type);
  });

  if (stillPending.length === 0) {
    return { title: 'Examens en attente', content: '', priority: 'normal' };
  }

  const lines = stillPending.map(rx => {
    const name = rx.exam_list?.join(', ') || rx.prescription_type;
    return `• ${esc(name)} — prescrit ${rx.created_at ? formatTime(rx.created_at) : '?'}`;
  });

  return {
    title: 'Examens en attente de résultats',
    content: lines.join('<br/>'),
    priority: 'high',
  };
}

function buildNursingSection(data: FullEncounterData): PSMISection {
  if (data.transmissions.length === 0) {
    return { title: 'Transmissions IDE', content: '', priority: 'normal' };
  }

  // Show latest 5 transmissions
  const recent = [...data.transmissions]
    .sort((a, b) => (b.when_event || b.when_recorded || '').localeCompare(a.when_event || a.when_recorded || ''))
    .slice(0, 5);

  const lines = recent.map(t => {
    const parts: string[] = [];
    const time = t.when_event || t.when_recorded;
    if (time) parts.push(`<em>${formatTime(time)}</em>`);
    if (t.cible) parts.push(`[${esc(t.cible)}]`);
    if (t.donnees) parts.push(`D: ${esc(t.donnees)}`);
    if (t.actions) parts.push(`A: ${esc(t.actions)}`);
    if (t.resultats) parts.push(`R: ${esc(t.resultats)}`);
    return `<div class="transmission-row">${parts.join(' — ')}</div>`;
  });

  return {
    title: 'Transmissions IDE (DAR)',
    content: lines.join(''),
    priority: 'normal',
  };
}

function buildOrientationSection(data: FullEncounterData, context: PSMIContext): PSMISection {
  const e = data.encounter;
  const lines: string[] = [];

  const contextLabels: Record<PSMIContext, string> = {
    releve: 'Relevé d\'équipe',
    transfert: 'Transfert',
    sortie: 'Sortie',
    hospitalisation: 'Hospitalisation',
  };

  lines.push(`<strong>Contexte:</strong> ${contextLabels[context]}`);

  if (e.discharge_destination || e.orientation) {
    lines.push(`<strong>Orientation:</strong> ${esc(e.discharge_destination || e.orientation || '')}`);
  }

  if (e.gemsa) {
    const gemsaLabels: Record<number, string> = {
      1: 'Patient décédé',
      2: 'Retour domicile',
      3: 'Hospitalisation (même établissement)',
      4: 'Transfert',
      5: 'Fugue / sortie contre avis',
      6: 'Parti sans attendre',
    };
    lines.push(`<strong>GEMSA:</strong> ${e.gemsa} — ${gemsaLabels[e.gemsa] || 'Autre'}`);
  }

  // Pending actions for next team
  const pendingActions: string[] = [];
  const pendingExams = data.prescriptions.filter(rx =>
    ['exam_bio', 'exam_imagerie'].includes(rx.prescription_type) && rx.status === 'active',
  );
  if (pendingExams.length > 0) {
    pendingActions.push(`${pendingExams.length} examen(s) en attente de résultat`);
  }

  const activePerfusions = data.prescriptions.filter(rx =>
    rx.prescription_type === 'perfusion' && rx.status === 'active',
  );
  if (activePerfusions.length > 0) {
    pendingActions.push(`${activePerfusions.length} perfusion(s) en cours`);
  }

  const pendingAvis = data.prescriptions.filter(rx =>
    rx.prescription_type === 'avis_specialise' && rx.status === 'active',
  );
  if (pendingAvis.length > 0) {
    pendingActions.push(`Avis spécialisé en attente: ${pendingAvis.map(a => esc(a.avis_speciality || '?')).join(', ')}`);
  }

  if (pendingActions.length > 0) {
    lines.push('<strong>Actions en attente:</strong>');
    pendingActions.forEach(a => lines.push(`• ${a}`));
  }

  return {
    title: 'Orientation & consignes',
    content: lines.join('<br/>'),
    priority: pendingActions.length > 0 ? 'high' : 'normal',
  };
}

// ────────────────────────────────────────────────────────────────
// HTML Rendering
// ────────────────────────────────────────────────────────────────

function renderPSMIHTML(
  data: FullEncounterData,
  sections: PSMISection[],
  context: PSMIContext,
): string {
  const contextTitles: Record<PSMIContext, string> = {
    releve: 'PSMI — Relevé d\'équipe',
    transfert: 'PSMI — Transfert patient',
    sortie: 'PSMI — Sortie patient',
    hospitalisation: 'PSMI — Hospitalisation',
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #1a1a2e; font-size: 12px; line-height: 1.4; }
  .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 16px; color: #1e40af; }
  .header .meta { text-align: right; color: #64748b; font-size: 11px; }
  .section { margin-bottom: 12px; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
  .section-header { background: #f1f5f9; padding: 6px 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; display: flex; justify-content: space-between; }
  .section-body { padding: 8px 12px; }
  .section.critical { border-color: #fca5a5; }
  .section.critical .section-header { background: #fef2f2; color: #dc2626; }
  .section.high { border-color: #fde68a; }
  .section.high .section-header { background: #fffbeb; color: #92400e; }
  .critical { color: #dc2626; font-weight: 700; }
  .alert-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 4px; padding: 6px 10px; margin-bottom: 6px; color: #dc2626; font-weight: 600; }
  .vital-row { padding: 2px 0; border-bottom: 1px solid #f1f5f9; }
  .transmission-row { padding: 3px 0; border-bottom: 1px solid #f1f5f9; }
  ul { padding-left: 16px; margin: 4px 0; }
  li { margin-bottom: 2px; }
  em { color: #64748b; }
  strong { color: #1e40af; }
  .footer { margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 12px; display: flex; justify-content: space-between; color: #64748b; font-size: 11px; }
  @media print { body { padding: 12px; font-size: 10px; } .section { break-inside: avoid; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${contextTitles[context]}</h1>
      <div style="font-size:11px; color:#64748b;">${ESTABLISHMENT.name} — ${ESTABLISHMENT.service}</div>
    </div>
    <div class="meta">
      <div>${formatDateTime(new Date().toISOString())}</div>
      <div>Dr ${esc(data.encounter.assigned_doctor_name || 'Urgentiste')}</div>
    </div>
  </div>

  ${sections.filter(s => s.content).map(section => `
  <div class="section ${section.priority}">
    <div class="section-header">
      <span>${esc(section.title)}</span>
      ${section.priority === 'critical' ? '<span>⚠ CRITIQUE</span>' : ''}
    </div>
    <div class="section-body">${section.content}</div>
  </div>
  `).join('')}

  <div class="footer">
    <div>Généré par UrgenceOS — ${ESTABLISHMENT.finess}</div>
    <div>Document confidentiel — usage médical uniquement</div>
  </div>
</body>
</html>`;
}

// ────────────────────────────────────────────────────────────────
// Utility functions
// ────────────────────────────────────────────────────────────────

function calculateAge(dateNaissance: string): number {
  const birth = new Date(dateNaissance);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit', minute: '2-digit',
  });
}

function calculateDuration(arrivalTime?: string): string {
  if (!arrivalTime) return '?';
  const arrival = new Date(arrivalTime);
  const now = new Date();
  const diffMs = now.getTime() - arrival.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}

function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
