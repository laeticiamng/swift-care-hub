/**
 * Tests unitaires — Module Form Builder (No-Code)
 * Vérifie l'évaluation des conditions et la validation des formulaires
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateCondition,
  evaluateConditions,
  validateFormSubmission,
  getFormById,
  getFormsByCategory,
  getVisibleFields,
  BUILTIN_FORMS,
  type FormDefinition,
  type ConditionalRule,
} from '@/lib/form-builder';

describe('evaluateCondition', () => {
  it('operator equals — vrai', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'equals', value: 'x' }, { a: 'x' })).toBe(true);
  });

  it('operator equals — faux', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'equals', value: 'x' }, { a: 'y' })).toBe(false);
  });

  it('operator not_equals', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'not_equals', value: 'x' }, { a: 'y' })).toBe(true);
  });

  it('operator contains — string', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'contains', value: 'ell' }, { a: 'hello' })).toBe(true);
  });

  it('operator contains — array', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'contains', value: 'b' }, { a: ['a', 'b', 'c'] })).toBe(true);
  });

  it('operator gt', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'gt', value: 5 }, { a: 10 })).toBe(true);
    expect(evaluateCondition({ field_id: 'a', operator: 'gt', value: 10 }, { a: 5 })).toBe(false);
  });

  it('operator lt', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'lt', value: 10 }, { a: 5 })).toBe(true);
  });

  it('operator gte', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'gte', value: 5 }, { a: 5 })).toBe(true);
  });

  it('operator lte', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'lte', value: 5 }, { a: 5 })).toBe(true);
  });

  it('operator in', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'in', value: ['x', 'y', 'z'] }, { a: 'y' })).toBe(true);
    expect(evaluateCondition({ field_id: 'a', operator: 'in', value: ['x', 'y'] }, { a: 'w' })).toBe(false);
  });

  it('operator not_empty', () => {
    expect(evaluateCondition({ field_id: 'a', operator: 'not_empty', value: true }, { a: 'hello' })).toBe(true);
    expect(evaluateCondition({ field_id: 'a', operator: 'not_empty', value: true }, { a: '' })).toBe(false);
    expect(evaluateCondition({ field_id: 'a', operator: 'not_empty', value: true }, {})).toBe(false);
  });
});

describe('evaluateConditions', () => {
  it('retourne true si aucune condition', () => {
    expect(evaluateConditions(undefined, {})).toBe(true);
    expect(evaluateConditions([], {})).toBe(true);
  });

  it('toutes les conditions doivent être vraies (AND)', () => {
    const rules: ConditionalRule[] = [
      { field_id: 'a', operator: 'equals', value: 'x' },
      { field_id: 'b', operator: 'gt', value: 5 },
    ];
    expect(evaluateConditions(rules, { a: 'x', b: 10 })).toBe(true);
    expect(evaluateConditions(rules, { a: 'x', b: 3 })).toBe(false);
  });
});

describe('validateFormSubmission', () => {
  const form: FormDefinition = {
    id: 'test-form',
    name: 'Test',
    version: 1,
    category: 'custom',
    is_active: true,
    created_at: '',
    updated_at: '',
    sections: [{
      id: 's1',
      title: 'Section',
      order: 1,
      fields: [
        { id: 'name', label: 'Nom', type: 'text', order: 1, validation: { required: true, min_length: 2 } },
        { id: 'age', label: 'Âge', type: 'number', order: 2, validation: { min: 0, max: 150 } },
        { id: 'email', label: 'Email', type: 'text', order: 3, validation: { pattern: '^.+@.+$', pattern_message: 'Email invalide' } },
      ],
    }],
  };

  it('valide un formulaire correct', () => {
    const errors = validateFormSubmission(form, { name: 'Jean', age: 30, email: 'a@b.com' });
    expect(Object.keys(errors).length).toBe(0);
  });

  it('signale un champ obligatoire manquant', () => {
    const errors = validateFormSubmission(form, { age: 30 });
    expect(errors.name).toBeTruthy();
  });

  it('signale une longueur minimale non respectée', () => {
    const errors = validateFormSubmission(form, { name: 'J' });
    expect(errors.name).toContain('2 caractères');
  });

  it('signale une valeur numérique hors bornes', () => {
    const errors = validateFormSubmission(form, { name: 'Jean', age: 200 });
    expect(errors.age).toContain('150');
  });

  it('signale un pattern non respecté', () => {
    const errors = validateFormSubmission(form, { name: 'Jean', email: 'notanemail' });
    expect(errors.email).toBe('Email invalide');
  });

  it('ignore les champs vides non-requis', () => {
    const errors = validateFormSubmission(form, { name: 'Jean' });
    expect(errors.age).toBeUndefined();
    expect(errors.email).toBeUndefined();
  });
});

describe('BUILTIN_FORMS', () => {
  it('contient au moins le formulaire de triage IOA', () => {
    const triageForm = BUILTIN_FORMS.find(f => f.id === 'triage-ioa-standard');
    expect(triageForm).toBeDefined();
    expect(triageForm!.sections.length).toBeGreaterThan(0);
  });

  it('contient le formulaire de surveillance IDE', () => {
    const survForm = BUILTIN_FORMS.find(f => f.id === 'surveillance-ide-standard');
    expect(survForm).toBeDefined();
  });
});

describe('getFormById', () => {
  it('retourne le formulaire par id', () => {
    const form = getFormById('triage-ioa-standard');
    expect(form).toBeDefined();
    expect(form!.name).toContain('Triage');
  });

  it('retourne undefined pour un id inconnu', () => {
    expect(getFormById('nonexistent')).toBeUndefined();
  });
});

describe('getFormsByCategory', () => {
  it('retourne les formulaires de triage', () => {
    const forms = getFormsByCategory('triage');
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every(f => f.category === 'triage')).toBe(true);
  });
});

describe('getVisibleFields', () => {
  it('retourne tous les champs si pas de conditions', () => {
    const form = getFormById('triage-ioa-standard')!;
    const fields = getVisibleFields(form, {});
    expect(fields.length).toBeGreaterThan(0);
  });
});
