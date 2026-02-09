import { isVitalAbnormal, calculateAge } from './vitals-utils';

// --- Types ---
export interface SynthesisData {
  patient: {
    nom: string;
    prenom: string;
    date_naissance: string;
    sexe: string;
    poids?: number | null;
    allergies?: string[] | null;
    antecedents?: string[] | null;
    medecin_traitant?: string | null;
  };
  encounter: {
    motif_sfmu?: string | null;
    ccmu?: number | null;
    cimu?: number | null;
    zone?: string | null;
    box_number?: number | null;
    arrival_time?: string | null;
    medecin_id?: string | null;
  };
  vitals: Array<{
    fc?: number | null;
    pa_systolique?: number | null;
    pa_diastolique?: number | null;
    spo2?: number | null;
    temperature?: number | null;
    frequence_respiratoire?: number | null;
    gcs?: number | null;
    eva_douleur?: number | null;
    recorded_at: string;
  }>;
  prescriptions: Array<{
    medication_name: string;
    dosage: string;
    route: string;
    frequency?: string | null;
    status: string;
    priority: string;
  }>;
  administrations: Array<{
    prescription_id: string;
    dose_given: string;
    route: string;
    administered_at: string;
  }>;
  results: Array<{
    category: string;
    title: string;
    content: Record<string, unknown> | null;
    is_critical: boolean;
    is_read: boolean;
    received_at: string;
  }>;
  procedures: Array<{
    procedure_type: string;
    notes?: string | null;
    performed_at: string;
  }>;
  transmissions: Array<{
    donnees?: string | null;
    actions?: string | null;
    resultats?: string | null;
    cible?: string | null;
    created_at: string;
  }>;
  timelineItems: Array<{
    item_type: string;
    content: string;
    source_document?: string | null;
    source_date?: string | null;
    source_author?: string | null;
  }>;
}

export interface Synthesis {
  known: string[];
  missing: string[];
  concerns: string[];
  nextSteps: string[];
  sources: string[];
}

// --- Bio normal ranges ---
const BIO_NORMALS: Record<string, { unit: string; min?: number; max?: number }> = {
  hemoglobine: { unit: 'g/dL', min: 12, max: 17 },
  leucocytes: { unit: 'G/L', min: 4, max: 10 },
  creatinine: { unit: 'umol/L', min: 45, max: 104 },
  potassium: { unit: 'mmol/L', min: 3.5, max: 5.0 },
  troponine_us: { unit: 'ng/L', max: 14 },
  CRP: { unit: 'mg/L', max: 5 },
  lactates: { unit: 'mmol/L', max: 2 },
  procalcitonine: { unit: 'ng/mL', max: 0.5 },
  BNP: { unit: 'pg/mL', max: 100 },
};

function isBioAbnormal(key: string, value: number): boolean {
  const range = BIO_NORMALS[key];
  if (!range) return false;
  if (range.min !== undefined && value < range.min) return true;
  if (range.max !== undefined && value > range.max) return true;
  return false;
}

// --- Main synthesis generator ---
export function generateSynthesis(data: SynthesisData): Synthesis {
  const synthesis: Synthesis = {
    known: [],
    missing: [],
    concerns: [],
    nextSteps: [],
    sources: [],
  };

  const age = calculateAge(data.patient.date_naissance);
  const latestVitals = data.vitals.length > 0 ? data.vitals[data.vitals.length - 1] : null;
  const firstVitals = data.vitals.length > 0 ? data.vitals[0] : null;

  // --- CE QU'ON SAIT ---

  // Patient demographics
  const motifStr = data.encounter.motif_sfmu || 'motif non precise';
  const terrainParts: string[] = [];
  if (data.patient.antecedents?.length) {
    terrainParts.push(...data.patient.antecedents.filter(a =>
      ['HTA', 'Diabete', 'Diabète', 'BPCO', 'FA', 'Insuffisance'].some(k => a.includes(k))
    ));
  }
  const terrainStr = terrainParts.length > 0 ? ` chez patient ${terrainParts.join(', ').toLowerCase()}` : '';
  synthesis.known.push(`${motifStr}${terrainStr}, ${age} ans`);

  // Troponine analysis
  const tropoResults = data.results.filter(r =>
    r.title.toLowerCase().includes('troponine') ||
    (r.content && typeof r.content === 'object' && Object.keys(r.content).some(k => k.toLowerCase().includes('troponine')))
  );

  for (const tr of tropoResults) {
    if (tr.content && typeof tr.content === 'object') {
      const tropoValue = (tr.content as Record<string, number>).troponine_us;
      if (tropoValue !== undefined) {
        if (tropoValue <= 14) {
          synthesis.known.push('Troponine negative — pas d\'argument pour SCA ST+');
        } else {
          synthesis.known.push(`Troponine POSITIVE a ${tropoValue} ng/L (seuil 14)`);
        }
        synthesis.sources.push(`Troponine ${new Date(tr.received_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      }
    }
  }

  // BNP analysis
  const bnpResults = data.results.filter(r =>
    r.content && typeof r.content === 'object' && Object.keys(r.content).some(k => k === 'BNP')
  );
  for (const br of bnpResults) {
    const bnpVal = (br.content as Record<string, number>).BNP;
    if (bnpVal !== undefined) {
      if (bnpVal > 100) {
        synthesis.known.push(`BNP eleve a ${bnpVal} pg/mL — argument pour insuffisance cardiaque`);
      } else {
        synthesis.known.push('BNP normal — insuffisance cardiaque peu probable');
      }
    }
  }

  // EVA pain evolution
  if (data.vitals.length > 1 && firstVitals?.eva_douleur != null && latestVitals?.eva_douleur != null) {
    const firstEVA = firstVitals.eva_douleur;
    const lastEVA = latestVitals.eva_douleur;
    if (lastEVA < firstEVA) {
      synthesis.known.push(`EVA amelioree de ${firstEVA} a ${lastEVA}/10`);
    } else if (lastEVA > firstEVA) {
      synthesis.concerns.push(`EVA aggravee de ${firstEVA} a ${lastEVA}/10`);
    }
  }

  // Vitals evolution
  if (data.vitals.length > 1 && latestVitals && firstVitals) {
    const vitalAbnormalFirst = [
      firstVitals.fc && isVitalAbnormal('fc', firstVitals.fc),
      firstVitals.spo2 && isVitalAbnormal('spo2', firstVitals.spo2),
      firstVitals.pa_systolique && isVitalAbnormal('pa_systolique', firstVitals.pa_systolique),
    ].filter(Boolean).length;

    const vitalAbnormalLast = [
      latestVitals.fc && isVitalAbnormal('fc', latestVitals.fc),
      latestVitals.spo2 && isVitalAbnormal('spo2', latestVitals.spo2),
      latestVitals.pa_systolique && isVitalAbnormal('pa_systolique', latestVitals.pa_systolique),
    ].filter(Boolean).length;

    if (vitalAbnormalLast < vitalAbnormalFirst) {
      synthesis.known.push('Constantes en voie de normalisation');
    } else if (vitalAbnormalLast === 0) {
      synthesis.known.push('Constantes stables et normales');
    }
  }

  // ECG findings
  const ecgResults = data.results.filter(r => r.category === 'ecg');
  for (const ecg of ecgResults) {
    if (ecg.content && typeof ecg.content === 'object') {
      const conclusion = (ecg.content as Record<string, string>).conclusion;
      if (conclusion) {
        synthesis.known.push(`ECG : ${conclusion}`);
        synthesis.sources.push(`ECG ${new Date(ecg.received_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      }
    }
  }

  // Imaging findings
  const imgResults = data.results.filter(r => r.category === 'imagerie');
  for (const img of imgResults) {
    if (img.content && typeof img.content === 'object') {
      const conclusion = (img.content as Record<string, string>).conclusion;
      if (conclusion) {
        synthesis.known.push(`${img.title} : ${conclusion}`);
        synthesis.sources.push(`${img.title} ${new Date(img.received_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
      }
    }
  }

  // --- CE QUI MANQUE ---

  // Check troponin H+3 control
  if (tropoResults.length === 1 && data.encounter.motif_sfmu?.toLowerCase().includes('thoracique')) {
    synthesis.missing.push('Controle troponine H+3 non prescrit');
  }

  // Check for missing D-dimers in chest pain
  if (data.encounter.motif_sfmu?.toLowerCase().includes('thoracique')) {
    const hasDDimers = data.results.some(r =>
      r.title.toLowerCase().includes('d-dim') ||
      (r.content && typeof r.content === 'object' && Object.keys(r.content).some(k => k.toLowerCase().includes('d_dim')))
    );
    if (!hasDDimers) {
      synthesis.missing.push('D-Dimeres non demandes');
    }
  }

  // Check for missing ECG
  if (['Douleur thoracique', 'Malaise / syncope', 'Dyspnee', 'Dyspnée'].some(m => data.encounter.motif_sfmu?.includes(m))) {
    if (ecgResults.length === 0) {
      synthesis.missing.push('ECG non realise');
    }
  }

  // Unread results
  const unreadCritical = data.results.filter(r => r.is_critical && !r.is_read);
  if (unreadCritical.length > 0) {
    synthesis.missing.push(`${unreadCritical.length} resultat(s) critique(s) non lu(s)`);
  }

  // No bio at all
  if (data.results.filter(r => r.category === 'bio').length === 0 && data.encounter.cimu && data.encounter.cimu <= 3) {
    synthesis.missing.push('Aucun bilan biologique realise');
  }

  // --- CE QUI INQUIETE ---

  // Allergies
  if (data.patient.allergies?.length) {
    synthesis.concerns.push(`Allergies : ${data.patient.allergies.join(', ')}`);
  }

  // Abnormal vitals
  if (latestVitals) {
    if (latestVitals.pa_systolique && isVitalAbnormal('pa_systolique', latestVitals.pa_systolique)) {
      synthesis.concerns.push(`HTA mal controlee (PA ${latestVitals.pa_systolique}/${latestVitals.pa_diastolique || '?'} mmHg)`);
    }
    if (latestVitals.spo2 && isVitalAbnormal('spo2', latestVitals.spo2)) {
      synthesis.concerns.push(`Desaturation SpO2 ${latestVitals.spo2}%`);
    }
    if (latestVitals.fc && isVitalAbnormal('fc', latestVitals.fc)) {
      const label = latestVitals.fc > 120 ? 'Tachycardie' : 'Bradycardie';
      synthesis.concerns.push(`${label} FC ${latestVitals.fc} bpm`);
    }
    if (latestVitals.temperature && isVitalAbnormal('temperature', latestVitals.temperature)) {
      synthesis.concerns.push(`Fievre T° ${latestVitals.temperature}°C`);
    }
    if (latestVitals.gcs && latestVitals.gcs < 15) {
      synthesis.concerns.push(`Alteration conscience GCS ${latestVitals.gcs}/15`);
    }
  }

  // Critical bio results
  for (const result of data.results.filter(r => r.category === 'bio')) {
    if (result.content && typeof result.content === 'object') {
      const content = result.content as Record<string, number>;
      for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'number' && isBioAbnormal(key, value)) {
          const range = BIO_NORMALS[key];
          if (range) {
            const label = key.replace(/_/g, ' ');
            synthesis.concerns.push(`${label} anormal : ${value} ${range.unit}`);
          }
        }
      }
    }
  }

  // Comorbidities from timeline
  const comorbidityKeywords = [
    { keyword: 'HTA', label: 'Terrain hypertendu' },
    { keyword: 'Diabete', label: 'Diabetique' },
    { keyword: 'Diabète', label: 'Diabetique' },
    { keyword: 'Insuffisance renale', label: 'Insuffisance renale chronique' },
    { keyword: 'Insuffisance rénale', label: 'Insuffisance renale chronique' },
    { keyword: 'BPCO', label: 'BPCO connue' },
    { keyword: 'Insuffisance cardiaque', label: 'Insuffisance cardiaque connue' },
    { keyword: 'FA', label: 'Fibrillation auriculaire connue' },
    { keyword: 'AVC', label: 'Antecedent d\'AVC' },
  ];

  const addedConcerns = new Set<string>();
  for (const ti of data.timelineItems) {
    for (const c of comorbidityKeywords) {
      if (ti.content.includes(c.keyword) && !addedConcerns.has(c.label)) {
        synthesis.concerns.push(c.label);
        addedConcerns.add(c.label);
      }
    }
  }

  // Deduplicate concerns
  synthesis.concerns = [...new Set(synthesis.concerns)];

  // --- PROCHAINE ETAPE ---

  // Troponin control
  if (tropoResults.length === 1 && data.encounter.motif_sfmu?.toLowerCase().includes('thoracique')) {
    synthesis.nextSteps.push('Controle troponine H+3');
    const tropoContent = tropoResults[0].content as Record<string, number> | null;
    if (tropoContent?.troponine_us && tropoContent.troponine_us > 14) {
      synthesis.nextSteps.push('Avis cardiologie urgent si tropo positive');
    }
  }

  // Re-evaluation EVA
  if (latestVitals?.eva_douleur != null && latestVitals.eva_douleur > 3) {
    synthesis.nextSteps.push('Reevaluation EVA douleur a H+2');
  }

  // Pending administrations
  const pendingRx = data.prescriptions
    .filter(rx => rx.status === 'active')
    .filter(rx => !data.administrations.some(a => a.prescription_id === (rx as unknown as { id: string }).id));
  if (pendingRx.length > 0) {
    synthesis.nextSteps.push(`${pendingRx.length} traitement(s) en attente d'administration`);
  }

  // Orientation
  if (!data.encounter.zone) {
    synthesis.nextSteps.push('Definir orientation du patient');
  }

  // Default next steps
  if (synthesis.nextSteps.length === 0) {
    synthesis.nextSteps.push('Reevaluation clinique');
    synthesis.nextSteps.push('Envisager orientation / sortie');
  }

  // --- SOURCES ---
  for (const r of data.results) {
    const time = new Date(r.received_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const src = `${r.title} ${time}`;
    if (!synthesis.sources.includes(src)) {
      synthesis.sources.push(src);
    }
  }

  if (latestVitals) {
    const time = new Date(latestVitals.recorded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    synthesis.sources.push(`Constantes ${time}`);
  }

  // CRH sources
  for (const ti of data.timelineItems.filter(t => t.item_type === 'crh')) {
    if (ti.source_document) {
      synthesis.sources.push(`${ti.source_document} ${ti.source_date || ''}`);
    }
  }

  // Deduplicate sources
  synthesis.sources = [...new Set(synthesis.sources)];

  return synthesis;
}
