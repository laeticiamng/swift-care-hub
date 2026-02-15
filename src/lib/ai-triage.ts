// ================================================================
// UrgenceOS — Module d'Aide au Triage par IA
// Différenciateur clé vs ResUrgences (qui n'a pas d'IA)
// Suggestion CIMU, orientations et diagnostics différentiels
// ================================================================

export interface TriageInput {
  age_years: number;
  sexe: 'M' | 'F';
  motif_principal: string;
  symptomes: string[];
  constantes?: {
    fc?: number;
    pas?: number;
    pad?: number;
    spo2?: number;
    temperature?: number;
    fr?: number;
    gcs?: number;
    eva?: number;
    glycemie?: number;
  };
  antecedents?: string[];
  traitements?: string[];
  allergies?: string[];
  mode_arrivee?: 'ambulance' | 'smur' | 'personnel' | 'pompiers';
  delai_symptomes?: string;
}

export interface TriageSuggestion {
  cimu_suggere: 1 | 2 | 3 | 4 | 5;
  cimu_justification: string;
  zone_suggeree: string;
  diagnostics_differentiels: DiagnosticDifferentiel[];
  examens_suggeres: string[];
  alertes: string[];
  scores_calcules: ScoreResult[];
  orientations_possibles: string[];
  gravite_score: number; // 0-100
}

export interface DiagnosticDifferentiel {
  diagnostic: string;
  code_cim10?: string;
  probabilite: 'haute' | 'moyenne' | 'basse';
  arguments_pour: string[];
  a_eliminer: string[];
}

export interface ScoreResult {
  nom: string;
  valeur: number | string;
  interpretation: string;
}

// ── Règles de triage ──

interface TriageRule {
  condition: (input: TriageInput) => boolean;
  cimu: 1 | 2 | 3 | 4 | 5;
  justification: string;
  zone: string;
  priority: number; // Higher = checked first
}

const TRIAGE_RULES: TriageRule[] = [
  // CIMU 1 — Urgence vitale immédiate
  {
    condition: (i) => (i.constantes?.gcs !== undefined && i.constantes.gcs < 9),
    cimu: 1, justification: 'GCS < 9 — altération sévère de conscience', zone: 'dechoc', priority: 100,
  },
  {
    condition: (i) => (i.constantes?.pas !== undefined && i.constantes.pas < 70),
    cimu: 1, justification: 'PAS < 70 mmHg — état de choc', zone: 'dechoc', priority: 100,
  },
  {
    condition: (i) => (i.constantes?.spo2 !== undefined && i.constantes.spo2 < 85),
    cimu: 1, justification: 'SpO2 < 85% — détresse respiratoire sévère', zone: 'dechoc', priority: 100,
  },
  {
    condition: (i) => (i.constantes?.fc !== undefined && (i.constantes.fc < 30 || i.constantes.fc > 180)),
    cimu: 1, justification: 'FC extrême (<30 ou >180) — trouble du rythme menaçant', zone: 'dechoc', priority: 100,
  },
  {
    condition: (i) => i.mode_arrivee === 'smur',
    cimu: 1, justification: 'Arrivée SMUR — prise en charge immédiate', zone: 'dechoc', priority: 95,
  },
  {
    condition: (i) => containsAny(i.motif_principal + ' ' + i.symptomes.join(' '), ['arrêt cardiaque', 'acr', 'inconscient ne respire pas']),
    cimu: 1, justification: 'Suspicion ACR — déchocage immédiat', zone: 'dechoc', priority: 100,
  },

  // CIMU 2 — Urgence vraie
  {
    condition: (i) => containsAny(i.motif_principal, ['douleur thoracique', 'dlr thoracique', 'oppression thoracique']) && i.age_years > 35,
    cimu: 2, justification: 'Douleur thoracique > 35 ans — SCA à éliminer en priorité', zone: 'dechoc', priority: 80,
  },
  {
    condition: (i) => containsAny(i.motif_principal + ' ' + i.symptomes.join(' '), ['deficit neurologique', 'hémiplégie', 'aphasie', 'paralysie faciale', 'avc']),
    cimu: 2, justification: 'Déficit neurologique aigu — AVC à éliminer, golden hour', zone: 'dechoc', priority: 80,
  },
  {
    condition: (i) => (i.constantes?.spo2 !== undefined && i.constantes.spo2 < 92),
    cimu: 2, justification: 'SpO2 < 92% — hypoxie significative', zone: 'soins', priority: 75,
  },
  {
    condition: (i) => (i.constantes?.temperature !== undefined && i.constantes.temperature > 40),
    cimu: 2, justification: 'Température > 40°C — hyperthermie sévère', zone: 'soins', priority: 70,
  },
  {
    condition: (i) => (i.constantes?.eva !== undefined && i.constantes.eva >= 8),
    cimu: 2, justification: 'EVA ≥ 8/10 — douleur très sévère, analgésie urgente', zone: 'soins', priority: 70,
  },
  {
    condition: (i) => containsAny(i.motif_principal, ['traumatisme crânien', 'tc']) && (i.constantes?.gcs !== undefined && i.constantes.gcs < 14),
    cimu: 2, justification: 'TC avec GCS < 14 — surveillance neuro rapprochée', zone: 'dechoc', priority: 75,
  },
  {
    condition: (i) => containsAny(i.motif_principal + ' ' + i.symptomes.join(' '), ['hémorragie active', 'hématémèse', 'rectorragie abondante', 'méléna']),
    cimu: 2, justification: 'Hémorragie active — évaluation hémodynamique urgente', zone: 'soins', priority: 75,
  },
  {
    condition: (i) => containsAny(i.motif_principal + ' ' + i.symptomes.join(' '), ['allergie sévère', 'anaphylaxie', 'oedème de quincke', 'choc anaphylactique']),
    cimu: 2, justification: 'Réaction anaphylactique — adrénaline et surveillance', zone: 'dechoc', priority: 80,
  },

  // CIMU 3 — Urgence relative
  {
    condition: (i) => containsAny(i.motif_principal, ['douleur abdominale', 'dlr abdominale']),
    cimu: 3, justification: 'Douleur abdominale — bilan étiologique nécessaire', zone: 'soins', priority: 50,
  },
  {
    condition: (i) => containsAny(i.motif_principal, ['dyspnée', 'essoufflement', 'gêne respiratoire']),
    cimu: 3, justification: 'Dyspnée — évaluation respiratoire et bilan étiologique', zone: 'soins', priority: 55,
  },
  {
    condition: (i) => containsAny(i.motif_principal, ['fracture', 'traumatisme', 'chute', 'avp']),
    cimu: 3, justification: 'Traumatisme — évaluation lésionnelle et imagerie', zone: 'trauma', priority: 50,
  },
  {
    condition: (i) => (i.constantes?.temperature !== undefined && i.constantes.temperature >= 38.5),
    cimu: 3, justification: 'Fièvre ≥ 38.5°C — bilan infectieux recommandé', zone: 'soins', priority: 45,
  },
  {
    condition: (i) => containsAny(i.motif_principal + ' ' + i.symptomes.join(' '), ['céphalée', 'mal de tête']) && containsAny(i.symptomes.join(' '), ['brutale', 'thunderclap', 'pire de ma vie']),
    cimu: 3, justification: 'Céphalée brutale — hémorragie méningée à éliminer', zone: 'soins', priority: 60,
  },

  // CIMU 4 — Semi-urgent
  {
    condition: (i) => containsAny(i.motif_principal, ['plaie', 'coupure', 'morsure']),
    cimu: 4, justification: 'Plaie — suture et soins locaux', zone: 'consultation', priority: 30,
  },
  {
    condition: (i) => containsAny(i.motif_principal, ['entorse', 'contusion', 'douleur articulaire']),
    cimu: 4, justification: 'Traumatisme mineur — évaluation et traitement symptomatique', zone: 'consultation', priority: 30,
  },
  {
    condition: (i) => containsAny(i.motif_principal, ['mal de gorge', 'angine', 'otite', 'rhinite']),
    cimu: 4, justification: 'Pathologie ORL bénigne — consultation médicale', zone: 'consultation', priority: 25,
  },

  // CIMU 5 — Non urgent
  {
    condition: (i) => containsAny(i.motif_principal, ['renouvellement ordonnance', 'certificat', 'administratif']),
    cimu: 5, justification: 'Motif non urgent / administratif', zone: 'consultation', priority: 10,
  },
];

// ── Moteur de calcul du triage ──

export function calculateTriageSuggestion(input: TriageInput): TriageSuggestion {
  const alertes: string[] = [];
  const examens_suggeres: string[] = [];
  const scores_calcules: ScoreResult[] = [];
  const diagnostics_differentiels: DiagnosticDifferentiel[] = [];

  // Appliquer les règles de triage (priorité décroissante)
  const sortedRules = [...TRIAGE_RULES].sort((a, b) => b.priority - a.priority);
  let cimu_suggere: 1 | 2 | 3 | 4 | 5 = 4;
  let cimu_justification = 'Aucune règle d\'urgence identifiée';
  let zone_suggeree = 'consultation';

  for (const rule of sortedRules) {
    if (rule.condition(input)) {
      cimu_suggere = rule.cimu;
      cimu_justification = rule.justification;
      zone_suggeree = rule.zone;
      break;
    }
  }

  // ── Calcul des scores cliniques ──

  // Score NEWS (National Early Warning Score)
  if (input.constantes) {
    const news = calculateNEWS(input.constantes);
    scores_calcules.push(news);
    if (Number(news.valeur) >= 7) {
      alertes.push(`NEWS ${news.valeur} ≥ 7: Réponse médicale immédiate requise`);
      if (cimu_suggere > 2) { cimu_suggere = 2; cimu_justification = `NEWS élevé (${news.valeur})`; }
    } else if (Number(news.valeur) >= 5) {
      alertes.push(`NEWS ${news.valeur}: Surveillance rapprochée recommandée`);
    }
  }

  // Score de Glasgow
  if (input.constantes?.gcs !== undefined) {
    scores_calcules.push({
      nom: 'Glasgow (GCS)',
      valeur: input.constantes.gcs,
      interpretation: input.constantes.gcs <= 8 ? 'Coma — protection des voies aériennes' :
        input.constantes.gcs <= 12 ? 'Altération modérée de conscience' :
        input.constantes.gcs <= 14 ? 'Confusion légère' : 'Normal',
    });
  }

  // qSOFA (sepsis)
  if (input.constantes?.pas !== undefined && input.constantes?.fr !== undefined && input.constantes?.gcs !== undefined) {
    const qsofa = (input.constantes.pas <= 100 ? 1 : 0) +
                  (input.constantes.fr >= 22 ? 1 : 0) +
                  (input.constantes.gcs < 15 ? 1 : 0);
    scores_calcules.push({
      nom: 'qSOFA',
      valeur: qsofa,
      interpretation: qsofa >= 2 ? 'Suspicion de sepsis — bilan septique complet' : 'Risque septique faible',
    });
    if (qsofa >= 2) {
      alertes.push('qSOFA ≥ 2: Suspicion de sepsis, bilan septique et lactates urgents');
      examens_suggeres.push('Lactates', 'Hémocultures', 'ECBU', 'NFS CRP PCT');
    }
  }

  // ── Suggestions d'examens par motif ──
  const motifLower = (input.motif_principal + ' ' + input.symptomes.join(' ')).toLowerCase();

  if (containsAny(motifLower, ['douleur thoracique', 'dlr thoracique', 'oppression'])) {
    examens_suggeres.push('ECG 12 dérivations', 'Troponine', 'RP', 'D-dimères si Wells positif');
    diagnostics_differentiels.push(
      { diagnostic: 'Syndrome coronarien aigu', code_cim10: 'I21.9', probabilite: 'moyenne', arguments_pour: ['Douleur thoracique'], a_eliminer: ['ECG, Troponine H0 et H3'] },
      { diagnostic: 'Embolie pulmonaire', code_cim10: 'I26.9', probabilite: 'basse', arguments_pour: ['Douleur thoracique'], a_eliminer: ['D-dimères, Angio-TDM si positifs'] },
      { diagnostic: 'Péricardite', code_cim10: 'I30.9', probabilite: 'basse', arguments_pour: ['Douleur thoracique'], a_eliminer: ['ECG, Troponine, ETT'] },
      { diagnostic: 'Douleur pariétale', probabilite: 'moyenne', arguments_pour: ['Localisation, reproduction à la palpation'], a_eliminer: ['Diagnostic d\'élimination'] },
    );
  }

  if (containsAny(motifLower, ['douleur abdominale', 'dlr abdominale'])) {
    examens_suggeres.push('NFS', 'CRP', 'Ionogramme', 'Lipase', 'BHC', 'Bandelette urinaire');
    if (input.sexe === 'F' && input.age_years >= 15 && input.age_years <= 50) {
      examens_suggeres.push('Beta-HCG');
      diagnostics_differentiels.push(
        { diagnostic: 'GEU', code_cim10: 'O00.9', probabilite: 'basse', arguments_pour: ['Femme en âge de procréer, douleur abdominale'], a_eliminer: ['Beta-HCG, Echo pelvienne'] }
      );
    }
    diagnostics_differentiels.push(
      { diagnostic: 'Appendicite', code_cim10: 'K35.9', probabilite: 'moyenne', arguments_pour: ['Douleur abdominale'], a_eliminer: ['Examen clinique, bio, echo/TDM'] },
      { diagnostic: 'Occlusion intestinale', code_cim10: 'K56.6', probabilite: 'basse', arguments_pour: ['Douleur abdominale'], a_eliminer: ['ASP/TDM, transit'] },
    );
  }

  if (containsAny(motifLower, ['dyspnée', 'essoufflement', 'gêne respiratoire'])) {
    examens_suggeres.push('GDS', 'RP', 'NFS', 'BNP', 'D-dimères');
    diagnostics_differentiels.push(
      { diagnostic: 'Pneumopathie infectieuse', code_cim10: 'J18.9', probabilite: 'moyenne', arguments_pour: ['Dyspnée', 'Fièvre si présente'], a_eliminer: ['RP, NFS CRP PCT'] },
      { diagnostic: 'Décompensation cardiaque', code_cim10: 'I50.9', probabilite: 'moyenne', arguments_pour: ['Dyspnée, antécédents cardiaques'], a_eliminer: ['BNP, RP, ETT'] },
      { diagnostic: 'Exacerbation BPCO/Asthme', code_cim10: 'J44.1', probabilite: 'moyenne', arguments_pour: ['Dyspnée sifflante'], a_eliminer: ['GDS, DEP, RP'] },
    );
  }

  if (containsAny(motifLower, ['céphalée', 'mal de tête'])) {
    examens_suggeres.push('Examen neurologique complet');
    if (containsAny(motifLower, ['brutale', 'thunderclap', 'pire'])) {
      examens_suggeres.push('TDM cérébral sans injection', 'PL si TDM normal');
      diagnostics_differentiels.push(
        { diagnostic: 'Hémorragie sous-arachnoïdienne', code_cim10: 'I60.9', probabilite: 'haute', arguments_pour: ['Céphalée brutale'], a_eliminer: ['TDM, PL'] }
      );
    }
  }

  if (containsAny(motifLower, ['traumatisme', 'chute', 'avp', 'fracture'])) {
    examens_suggeres.push('Radiographies ciblées', 'Vérification status vaccinal tétanos');
    diagnostics_differentiels.push(
      { diagnostic: 'Fracture', probabilite: 'moyenne', arguments_pour: ['Mécanisme traumatique'], a_eliminer: ['Radiographies'] }
    );
  }

  // ── Alertes spécifiques ──
  if (input.constantes?.glycemie !== undefined) {
    if (input.constantes.glycemie < 0.6) {
      alertes.push('Hypoglycémie sévère (< 0.6 g/L) — resucrage urgent');
    } else if (input.constantes.glycemie > 3.0) {
      alertes.push('Hyperglycémie sévère (> 3.0 g/L) — rechercher acidocétose');
      examens_suggeres.push('GDS', 'Ionogramme', 'Cétonémie');
    }
  }

  if (input.age_years < 3 && input.constantes?.temperature !== undefined && input.constantes.temperature >= 38.0) {
    alertes.push('Nourrisson fébrile < 3 ans: évaluation systématique bilan infectieux');
    examens_suggeres.push('NFS CRP PCT', 'BU +/- ECBU', 'Hémocultures');
  }

  if (input.age_years > 75) {
    alertes.push('Patient > 75 ans: rechercher fragilité, chute, iatrogénie');
  }

  // ── Score de gravité global ──
  const gravite_score = calculateGravityScore(input, cimu_suggere, scores_calcules);

  // ── Orientations possibles ──
  const orientations_possibles = suggestOrientations(cimu_suggere, diagnostics_differentiels);

  // Dédupliquer les examens
  const uniqueExamens = [...new Set(examens_suggeres)];

  return {
    cimu_suggere,
    cimu_justification,
    zone_suggeree,
    diagnostics_differentiels,
    examens_suggeres: uniqueExamens,
    alertes,
    scores_calcules,
    orientations_possibles,
    gravite_score,
  };
}

// ── Score NEWS (National Early Warning Score) ──

function calculateNEWS(constantes: NonNullable<TriageInput['constantes']>): ScoreResult {
  let score = 0;

  // Fréquence respiratoire
  if (constantes.fr !== undefined) {
    if (constantes.fr <= 8) score += 3;
    else if (constantes.fr <= 11) score += 1;
    else if (constantes.fr <= 20) score += 0;
    else if (constantes.fr <= 24) score += 2;
    else score += 3;
  }

  // SpO2
  if (constantes.spo2 !== undefined) {
    if (constantes.spo2 <= 91) score += 3;
    else if (constantes.spo2 <= 93) score += 2;
    else if (constantes.spo2 <= 95) score += 1;
    else score += 0;
  }

  // Température
  if (constantes.temperature !== undefined) {
    if (constantes.temperature <= 35.0) score += 3;
    else if (constantes.temperature <= 36.0) score += 1;
    else if (constantes.temperature <= 38.0) score += 0;
    else if (constantes.temperature <= 39.0) score += 1;
    else score += 2;
  }

  // PAS
  if (constantes.pas !== undefined) {
    if (constantes.pas <= 90) score += 3;
    else if (constantes.pas <= 100) score += 2;
    else if (constantes.pas <= 110) score += 1;
    else if (constantes.pas <= 219) score += 0;
    else score += 3;
  }

  // FC
  if (constantes.fc !== undefined) {
    if (constantes.fc <= 40) score += 3;
    else if (constantes.fc <= 50) score += 1;
    else if (constantes.fc <= 90) score += 0;
    else if (constantes.fc <= 110) score += 1;
    else if (constantes.fc <= 130) score += 2;
    else score += 3;
  }

  // GCS
  if (constantes.gcs !== undefined && constantes.gcs < 15) {
    score += 3;
  }

  const interpretation = score >= 7 ? 'Risque clinique élevé — réponse d\'urgence' :
    score >= 5 ? 'Risque moyen — surveillance rapprochée' :
    score >= 1 ? 'Risque faible — surveillance standard' : 'Paramètres normaux';

  return { nom: 'NEWS', valeur: score, interpretation };
}

// ── Score de gravité composite ──

function calculateGravityScore(
  input: TriageInput,
  cimu: number,
  scores: ScoreResult[],
): number {
  let score = 0;

  // Base CIMU inversé (CIMU 1 = très grave)
  score += (6 - cimu) * 15;

  // Constantes anormales
  if (input.constantes?.spo2 !== undefined && input.constantes.spo2 < 95) score += 10;
  if (input.constantes?.pas !== undefined && input.constantes.pas < 90) score += 15;
  if (input.constantes?.gcs !== undefined && input.constantes.gcs < 15) score += 10;
  if (input.constantes?.temperature !== undefined && input.constantes.temperature > 39) score += 5;

  // NEWS
  const news = scores.find(s => s.nom === 'NEWS');
  if (news && typeof news.valeur === 'number') score += news.valeur * 2;

  // Facteurs de risque
  if (input.age_years > 75) score += 5;
  if (input.age_years < 1) score += 5;
  if (input.mode_arrivee === 'smur') score += 10;

  return Math.min(100, Math.max(0, score));
}

// ── Orientations possibles ──

function suggestOrientations(cimu: number, diagnostics: DiagnosticDifferentiel[]): string[] {
  const orientations: string[] = [];

  if (cimu <= 2) {
    orientations.push('UHCD (Unité d\'Hospitalisation de Courte Durée)');
    orientations.push('Hospitalisation service spécialisé');
    orientations.push('Réanimation / Soins continus');
  } else if (cimu === 3) {
    orientations.push('UHCD');
    orientations.push('Hospitalisation si besoin');
    orientations.push('Retour à domicile après bilan');
  } else {
    orientations.push('Retour à domicile');
    orientations.push('Consultation médecin traitant');
  }

  // Ajouter des orientations spécifiques selon les diagnostics
  for (const diag of diagnostics) {
    if (diag.diagnostic.includes('SCA') || diag.diagnostic.includes('coronarien')) {
      if (!orientations.includes('Cardiologie / USIC')) orientations.push('Cardiologie / USIC');
    }
    if (diag.diagnostic.includes('AVC') || diag.diagnostic.includes('neurologique')) {
      if (!orientations.includes('UNV (Unité Neuro-Vasculaire)')) orientations.push('UNV (Unité Neuro-Vasculaire)');
    }
  }

  return orientations;
}

// ── Helpers ──

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return keywords.some(kw =>
    lower.includes(kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
  );
}
