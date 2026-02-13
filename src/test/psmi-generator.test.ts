/**
 * Tests unitaires — Module PSMI Generator
 * Vérifie la génération du Plan de Soins Médico-Infirmier
 */
import { describe, it, expect } from 'vitest';
import { generatePSMI, type PSMIContext } from '@/lib/interop/psmi-generator';
import type { FullEncounterData } from '@/lib/interop/canonical-model';

const makeFullData = (): FullEncounterData => ({
  patient: {
    id: 'pat-1',
    nom: 'DUPONT',
    prenom: 'Jean',
    date_naissance: '1985-03-15',
    sexe: 'M',
    ins_numero: '185037512345645',
    ipp: 'IPP-001',
    poids: 75,
    traitements: 'Metformine 1000mg x2/j, Ramipril 5mg/j',
  },
  encounter: {
    id: 'enc-1',
    patient_id: 'pat-1',
    status: 'in-progress',
    arrival_time: '2024-01-15T10:30:00Z',
    motif_sfmu: 'Douleur thoracique',
    cimu: 2,
    ccmu: 3,
    zone: 'SAUV',
    box_number: 3,
    assigned_doctor_name: 'Martin',
  },
  vitals: [
    {
      id: 'v-1', patient_id: 'pat-1', encounter_id: 'enc-1',
      recorded_at: '2024-01-15T10:35:00Z', when_event: '2024-01-15T10:35:00Z',
      fc: 95, pas: 145, pad: 85, spo2: 97, temperature: 37.2, gcs: 15, eva: 7,
    },
    {
      id: 'v-2', patient_id: 'pat-1', encounter_id: 'enc-1',
      recorded_at: '2024-01-15T12:00:00Z', when_event: '2024-01-15T12:00:00Z',
      fc: 88, pas: 135, pad: 78, spo2: 98, temperature: 37.0, gcs: 15, eva: 4,
    },
  ],
  prescriptions: [
    {
      id: 'rx-1', encounter_id: 'enc-1', patient_id: 'pat-1',
      prescription_type: 'medicament', medication_name: 'Paracétamol',
      dose_value: 1, dose_unit: 'g', route: 'IV', frequency: 'q6h',
      status: 'active', priority: 'routine',
    },
    {
      id: 'rx-2', encounter_id: 'enc-1', patient_id: 'pat-1',
      prescription_type: 'titration', medication_name: 'Morphine',
      dose_value: 3, dose_unit: 'mg', route: 'IV',
      status: 'active', priority: 'stat',
    },
    {
      id: 'rx-3', encounter_id: 'enc-1', patient_id: 'pat-1',
      prescription_type: 'surveillance', surveillance_type: 'Scope + SpO2',
      surveillance_frequency: '15min', status: 'active',
    },
    {
      id: 'rx-4', encounter_id: 'enc-1', patient_id: 'pat-1',
      prescription_type: 'exam_bio', exam_list: ['Troponine T', 'NFS', 'Iono'],
      exam_urgency: 'urgent', status: 'active', created_at: '2024-01-15T10:40:00Z',
    },
  ],
  administrations: [],
  procedures: [],
  results: [],
  allergies: [
    { patient_id: 'pat-1', substance: 'Pénicilline', criticality: 'high', reaction: 'Anaphylaxie', severity: 'severe' },
  ],
  conditions: [
    { patient_id: 'pat-1', encounter_id: 'enc-1', code_cim10: 'I21.0', code_display: 'IDM antérieur aigu', category: 'hypothese', verification_status: 'differential' },
    { patient_id: 'pat-1', code_display: 'Diabète type 2', category: 'antecedent' },
    { patient_id: 'pat-1', code_display: 'HTA', category: 'antecedent' },
  ],
  transmissions: [
    {
      id: 't-1', encounter_id: 'enc-1', patient_id: 'pat-1', author_id: 'ide-1',
      when_event: '2024-01-15T11:00:00Z',
      cible: 'Douleur', donnees: 'EVA 7/10 thoracique', actions: 'Morphine 3mg IV', resultats: 'EVA 4/10 à H+30',
    },
  ],
  documents: [],
});

describe('generatePSMI — Génération complète', () => {
  it('génère un document PSMI avec toutes les sections', () => {
    const psmi = generatePSMI(makeFullData());

    expect(psmi.html).toContain('PSMI');
    expect(psmi.sections.length).toBeGreaterThan(5);
    expect(psmi.generatedAt).toBeTruthy();
    expect(psmi.generatedBy).toBe('Martin');
  });

  it('résume le patient correctement', () => {
    const psmi = generatePSMI(makeFullData());

    expect(psmi.patientSummary).toContain('DUPONT');
    expect(psmi.patientSummary).toContain('Jean');
    expect(psmi.patientSummary).toContain('Douleur thoracique');
  });

  it('détecte les alertes (allergies critiques)', () => {
    const psmi = generatePSMI(makeFullData());
    expect(psmi.alertsCount).toBeGreaterThan(0);
  });
});

describe('generatePSMI — Section identité', () => {
  it('inclut nom, prénom, âge, sexe', () => {
    const psmi = generatePSMI(makeFullData());
    const identitySection = psmi.sections.find(s => s.title === 'Identité patient');

    expect(identitySection).toBeDefined();
    expect(identitySection!.content).toContain('DUPONT');
    expect(identitySection!.content).toContain('Jean');
    expect(identitySection!.content).toContain('Homme');
  });

  it('inclut la zone et le box', () => {
    const psmi = generatePSMI(makeFullData());
    const identitySection = psmi.sections.find(s => s.title === 'Identité patient');

    expect(identitySection!.content).toContain('SAUV');
    expect(identitySection!.content).toContain('3');
  });
});

describe('generatePSMI — Section allergies', () => {
  it('affiche les allergies critiques', () => {
    const psmi = generatePSMI(makeFullData());
    const allergySection = psmi.sections.find(s => s.title === 'Allergies');

    expect(allergySection).toBeDefined();
    expect(allergySection!.content).toContain('Pénicilline');
    expect(allergySection!.content).toContain('CRITIQUE');
    expect(allergySection!.priority).toBe('critical');
  });

  it('affiche "Aucune allergie" si pas d\'allergie', () => {
    const data = makeFullData();
    data.allergies = [];
    const psmi = generatePSMI(data);
    const allergySection = psmi.sections.find(s => s.title === 'Allergies');

    expect(allergySection!.content).toContain('Aucune allergie');
    expect(allergySection!.priority).toBe('normal');
  });
});

describe('generatePSMI — Section constantes', () => {
  it('affiche les constantes vitales', () => {
    const psmi = generatePSMI(makeFullData());
    const vitalsSection = psmi.sections.find(s => s.title === 'Constantes vitales');

    expect(vitalsSection).toBeDefined();
    expect(vitalsSection!.content).toContain('FC');
    expect(vitalsSection!.content).toContain('PA');
    expect(vitalsSection!.content).toContain('SpO2');
  });

  it('détecte les constantes critiques', () => {
    const data = makeFullData();
    data.vitals[1].spo2 = 85; // Critical SpO2
    const psmi = generatePSMI(data);
    const vitalsSection = psmi.sections.find(s => s.title === 'Constantes vitales');

    expect(vitalsSection!.priority).toBe('critical');
    expect(vitalsSection!.content).toContain('ALERTES');
    expect(vitalsSection!.content).toContain('SpO2');
  });

  it('gère l\'absence de constantes', () => {
    const data = makeFullData();
    data.vitals = [];
    const psmi = generatePSMI(data);
    const vitalsSection = psmi.sections.find(s => s.title === 'Constantes vitales');

    expect(vitalsSection!.content).toContain('Aucune constante');
  });
});

describe('generatePSMI — Section prescriptions', () => {
  it('affiche les médicaments actifs', () => {
    const psmi = generatePSMI(makeFullData());
    const rxSection = psmi.sections.find(s => s.title === 'Prescriptions actives');

    expect(rxSection).toBeDefined();
    expect(rxSection!.content).toContain('Paracétamol');
    expect(rxSection!.content).toContain('Morphine');
    expect(rxSection!.content).toContain('TITRATION');
  });

  it('affiche la surveillance', () => {
    const psmi = generatePSMI(makeFullData());
    const rxSection = psmi.sections.find(s => s.title === 'Prescriptions actives');

    expect(rxSection!.content).toContain('Scope');
    expect(rxSection!.content).toContain('15min');
  });

  it('marque les prescriptions STAT', () => {
    const psmi = generatePSMI(makeFullData());
    const rxSection = psmi.sections.find(s => s.title === 'Prescriptions actives');

    expect(rxSection!.priority).toBe('high');
  });
});

describe('generatePSMI — Section examens en attente', () => {
  it('liste les examens sans résultat', () => {
    const psmi = generatePSMI(makeFullData());
    const pendingSection = psmi.sections.find(s => s.title === 'Examens en attente de résultats');

    expect(pendingSection).toBeDefined();
    expect(pendingSection!.content).toContain('Troponine');
  });
});

describe('generatePSMI — Section transmissions IDE', () => {
  it('affiche les transmissions DAR', () => {
    const psmi = generatePSMI(makeFullData());
    const nursingSection = psmi.sections.find(s => s.title === 'Transmissions IDE (DAR)');

    expect(nursingSection).toBeDefined();
    expect(nursingSection!.content).toContain('Douleur');
    expect(nursingSection!.content).toContain('EVA');
    expect(nursingSection!.content).toContain('Morphine');
  });
});

describe('generatePSMI — Section orientation', () => {
  it('affiche le contexte de relevé', () => {
    const psmi = generatePSMI(makeFullData(), 'releve');
    const orientSection = psmi.sections.find(s => s.title === 'Orientation & consignes');

    expect(orientSection!.content).toContain('Relevé');
  });

  it('affiche le contexte de transfert', () => {
    const psmi = generatePSMI(makeFullData(), 'transfert');
    const orientSection = psmi.sections.find(s => s.title === 'Orientation & consignes');

    expect(orientSection!.content).toContain('Transfert');
  });

  it('liste les actions en attente', () => {
    const psmi = generatePSMI(makeFullData());
    const orientSection = psmi.sections.find(s => s.title === 'Orientation & consignes');

    expect(orientSection!.content).toContain('examen');
    expect(orientSection!.priority).toBe('high');
  });
});

describe('generatePSMI — Contextes variés', () => {
  const contexts: PSMIContext[] = ['releve', 'transfert', 'sortie', 'hospitalisation'];

  contexts.forEach(ctx => {
    it(`génère un PSMI valide pour le contexte "${ctx}"`, () => {
      const psmi = generatePSMI(makeFullData(), ctx);
      expect(psmi.html).toContain('PSMI');
      expect(psmi.html).toContain('<!DOCTYPE html>');
      expect(psmi.sections.length).toBeGreaterThan(0);
    });
  });
});

describe('generatePSMI — HTML output', () => {
  it('génère un document HTML complet', () => {
    const psmi = generatePSMI(makeFullData());

    expect(psmi.html).toContain('<!DOCTYPE html>');
    expect(psmi.html).toContain('<html');
    expect(psmi.html).toContain('</html>');
    expect(psmi.html).toContain('UrgenceOS');
  });

  it('inclut les styles CSS pour impression', () => {
    const psmi = generatePSMI(makeFullData());

    expect(psmi.html).toContain('@media print');
    expect(psmi.html).toContain('break-inside');
  });
});
