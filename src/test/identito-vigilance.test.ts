/**
 * Tests unitaires — Module Identito-vigilance
 * Vérifie la vérification d'identité patient conforme RNIV
 */
import { describe, it, expect } from 'vitest';
import {
  verifyIdentity,
  crossValidateTraitsStricts,
  generateWristbandData,
  formatWristbandLabel,
  generateNNOIdentity,
  type TraitsStricts,
} from '@/lib/identito-vigilance';
import type { CanonicalPatient } from '@/lib/interop/canonical-model';

const makePatient = (): CanonicalPatient => ({
  id: 'pat-1',
  nom: 'DUPONT',
  prenom: 'Jean',
  date_naissance: '1985-03-15',
  sexe: 'M',
  ins_numero: '185037512345645',
  ins_status: 'qualifie',
  ipp: 'IPP-001',
});

const makeINSTraits = (): TraitsStricts => ({
  nomNaissance: 'DUPONT',
  premierPrenom: 'Jean',
  dateNaissance: '1985-03-15',
  sexe: 'M',
});

describe('verifyIdentity — Patient complet', () => {
  it('valide un patient complet avec score élevé', () => {
    const result = verifyIdentity(makePatient(), makeINSTraits());

    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.threatLevel).toBe('aucun');
    expect(result.checks.length).toBeGreaterThan(5);
  });

  it('retourne le statut validee pour un patient parfait', () => {
    const result = verifyIdentity(makePatient(), makeINSTraits());
    expect(result.status).toBe('validee');
  });

  it('inclut le timestamp de vérification', () => {
    const result = verifyIdentity(makePatient());
    expect(result.verifiedAt).toBeTruthy();
  });

  it('inclut le patientId', () => {
    const result = verifyIdentity(makePatient());
    expect(result.patientId).toBe('pat-1');
  });
});

describe('verifyIdentity — Nom manquant', () => {
  it('détecte un nom manquant', () => {
    const patient = { ...makePatient(), nom: '' };
    const result = verifyIdentity(patient);

    expect(result.score).toBeLessThan(80);
    expect(result.checks.some(c => c.name === 'NOM_PRESENT' && !c.passed)).toBe(true);
  });

  it('détecte un nom trop court', () => {
    const patient = { ...makePatient(), nom: 'A' };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'NOM_PRESENT' && !c.passed)).toBe(true);
  });
});

describe('verifyIdentity — Date de naissance', () => {
  it('détecte une DDN manquante', () => {
    const patient = { ...makePatient(), date_naissance: '' };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'DDN_VALIDE' && !c.passed)).toBe(true);
  });

  it('détecte une DDN invalide', () => {
    const patient = { ...makePatient(), date_naissance: '2024-13-45' };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'DDN_VALIDE' && !c.passed)).toBe(true);
  });

  it('détecte une DDN dans le futur', () => {
    const patient = { ...makePatient(), date_naissance: '2099-01-01' };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'DDN_VALIDE' && !c.passed)).toBe(true);
  });
});

describe('verifyIdentity — INS', () => {
  it('valide un INS présent et qualifié', () => {
    const result = verifyIdentity(makePatient());
    expect(result.checks.some(c => c.name === 'INS_PRESENT' && c.passed)).toBe(true);
    expect(result.checks.some(c => c.name === 'INS_QUALIFIE' && c.passed)).toBe(true);
  });

  it('détecte un INS manquant', () => {
    const patient = { ...makePatient(), ins_numero: undefined };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'INS_PRESENT' && !c.passed)).toBe(true);
    expect(result.actions.some(a => a.includes('INSi'))).toBe(true);
  });

  it('détecte un INS provisoire', () => {
    const patient = { ...makePatient(), ins_status: 'provisoire' as const };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'INS_QUALIFIE' && !c.passed)).toBe(true);
  });

  it('détecte un INS invalide', () => {
    const patient = { ...makePatient(), ins_status: 'invalide' as const };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'INS_QUALIFIE' && !c.passed)).toBe(true);
  });
});

describe('verifyIdentity — Format nom RNIV', () => {
  it('valide un nom en majuscules', () => {
    const result = verifyIdentity(makePatient());
    expect(result.checks.some(c => c.name === 'FORMAT_NOM' && c.passed)).toBe(true);
  });

  it('signale un nom en minuscules', () => {
    const patient = { ...makePatient(), nom: 'Dupont' };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'FORMAT_NOM' && !c.passed)).toBe(true);
    expect(result.checks.find(c => c.name === 'FORMAT_NOM')?.detail).toContain('majuscules');
  });

  it('signale un nom avec des chiffres', () => {
    const patient = { ...makePatient(), nom: 'DUPONT123' };
    const result = verifyIdentity(patient);

    expect(result.checks.some(c => c.name === 'FORMAT_NOM' && !c.passed)).toBe(true);
  });
});

describe('verifyIdentity — Threat levels', () => {
  it('aucun menace pour un patient complet', () => {
    const result = verifyIdentity(makePatient(), makeINSTraits());
    expect(result.threatLevel).toBe('aucun');
  });

  it('menace critique si traits stricts discordants', () => {
    const patient = makePatient();
    const wrongTraits: TraitsStricts = {
      nomNaissance: 'MARTIN', // Wrong!
      premierPrenom: 'Pierre', // Wrong!
      dateNaissance: '1990-01-01', // Wrong!
      sexe: 'F', // Wrong!
    };
    const result = verifyIdentity(patient, wrongTraits);

    expect(result.threatLevel).toBe('critique');
  });

  it('génère des actions recommandées', () => {
    const patient = { ...makePatient(), ins_numero: undefined, ipp: undefined };
    const result = verifyIdentity(patient);

    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions.some(a => a.includes('INSi') || a.includes('IPP'))).toBe(true);
  });
});

describe('crossValidateTraitsStricts', () => {
  it('valide quand tous les traits concordent', () => {
    const checks = crossValidateTraitsStricts(makePatient(), makeINSTraits());

    expect(checks.every(c => c.passed)).toBe(true);
    expect(checks.length).toBe(4);
  });

  it('détecte une discordance de nom', () => {
    const traits = { ...makeINSTraits(), nomNaissance: 'MARTIN' };
    const checks = crossValidateTraitsStricts(makePatient(), traits);

    const nomCheck = checks.find(c => c.name === 'TRAIT_NOM');
    expect(nomCheck?.passed).toBe(false);
    expect(nomCheck?.severity).toBe('critical');
  });

  it('détecte une discordance de prénom', () => {
    const traits = { ...makeINSTraits(), premierPrenom: 'Pierre' };
    const checks = crossValidateTraitsStricts(makePatient(), traits);

    const prenomCheck = checks.find(c => c.name === 'TRAIT_PRENOM');
    expect(prenomCheck?.passed).toBe(false);
    expect(prenomCheck?.severity).toBe('critical');
  });

  it('détecte une discordance de DDN', () => {
    const traits = { ...makeINSTraits(), dateNaissance: '1990-01-01' };
    const checks = crossValidateTraitsStricts(makePatient(), traits);

    const ddnCheck = checks.find(c => c.name === 'TRAIT_DDN');
    expect(ddnCheck?.passed).toBe(false);
    expect(ddnCheck?.severity).toBe('critical');
  });

  it('détecte une discordance de sexe', () => {
    const traits = { ...makeINSTraits(), sexe: 'F' as const };
    const checks = crossValidateTraitsStricts(makePatient(), traits);

    const sexeCheck = checks.find(c => c.name === 'TRAIT_SEXE');
    expect(sexeCheck?.passed).toBe(false);
  });

  it('normalise les accents et tirets', () => {
    const patient = { ...makePatient(), nom: 'LEFEVRE-DUPONT' };
    const traits = { ...makeINSTraits(), nomNaissance: 'LEFÈVRE-DUPONT' };
    const checks = crossValidateTraitsStricts(patient, traits);

    const nomCheck = checks.find(c => c.name === 'TRAIT_NOM');
    expect(nomCheck?.passed).toBe(true);
  });
});

describe('generateWristbandData', () => {
  it('génère les données du bracelet', () => {
    const wristband = generateWristbandData(makePatient());

    expect(wristband.nom).toBe('DUPONT');
    expect(wristband.prenom).toBe('Jean');
    expect(wristband.dateNaissance).toBe('1985-03-15');
    expect(wristband.sexe).toBe('M');
    expect(wristband.identifiant).toBe('IPP-001');
    expect(wristband.barcode).toBe('IPP-001');
  });

  it('inclut les allergies critiques', () => {
    const wristband = generateWristbandData(makePatient(), ['Pénicilline', 'Iode']);

    expect(wristband.allergiesCritiques).toContain('Pénicilline');
    expect(wristband.allergiesCritiques).toContain('Iode');
  });

  it('utilise l\'ID patient si pas d\'IPP', () => {
    const patient = { ...makePatient(), ipp: undefined };
    const wristband = generateWristbandData(patient);

    expect(wristband.identifiant).toBe('pat-1');
  });
});

describe('formatWristbandLabel', () => {
  it('formate le bracelet en texte', () => {
    const wristband = generateWristbandData(makePatient());
    const label = formatWristbandLabel(wristband);

    expect(label).toContain('DUPONT Jean');
    expect(label).toContain('1985-03-15');
    expect(label).toContain('IPP-001');
  });

  it('inclut les allergies sur le bracelet', () => {
    const wristband = generateWristbandData(makePatient(), ['Pénicilline']);
    const label = formatWristbandLabel(wristband);

    expect(label).toContain('ALLERGIES');
    expect(label).toContain('Pénicilline');
  });
});

describe('generateNNOIdentity', () => {
  it('génère une identité NNO', () => {
    const nno = generateNNOIdentity();

    expect(nno.nom).toBe('INCONNU');
    expect(nno.id).toContain('NNO-');
    expect(nno.ins_status).toBe('invalide');
  });

  it('estime la DDN à partir de l\'âge', () => {
    const nno = generateNNOIdentity('M', 40);
    const year = new Date().getFullYear() - 40;

    expect(nno.date_naissance).toContain(year.toString());
    expect(nno.sexe).toBe('M');
  });

  it('utilise le sexe estimé', () => {
    const nnoF = generateNNOIdentity('F');
    expect(nnoF.sexe).toBe('F');

    const nnoM = generateNNOIdentity('M');
    expect(nnoM.sexe).toBe('M');
  });

  it('génère des IDs uniques', () => {
    const nno1 = generateNNOIdentity();
    const nno2 = generateNNOIdentity();
    expect(nno1.id).not.toBe(nno2.id);
  });
});
