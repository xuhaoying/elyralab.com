import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildPetNoisePlan,
  emptyForm,
  getRiskLevel,
  petNoisePlanText,
} from './dog-fireworks-anxiety-checklist.logic';

test('getRiskLevel keeps calm supervised pets low risk', () => {
  assert.equal(getRiskLevel(emptyForm), 'Low');
});

test('getRiskLevel treats hiding or being alone as medium risk', () => {
  assert.equal(
    getRiskLevel({
      ...emptyForm,
      reaction: 'hides',
    }),
    'Medium'
  );

  assert.equal(
    getRiskLevel({
      ...emptyForm,
      aloneStatus: 'yes',
    }),
    'Medium'
  );

  assert.equal(
    getRiskLevel({
      ...emptyForm,
      aloneStatus: 'not-sure',
    }),
    'Medium'
  );
});

test('getRiskLevel escalates escape, self-injury, senior stress, and alone marked stress', () => {
  assert.equal(
    getRiskLevel({
      ...emptyForm,
      reaction: 'escape',
    }),
    'High'
  );

  assert.equal(
    getRiskLevel({
      ...emptyForm,
      reaction: 'destructive',
    }),
    'High'
  );

  assert.equal(
    getRiskLevel({
      ...emptyForm,
      petAge: 'senior',
      reaction: 'shakes',
    }),
    'High'
  );

  assert.equal(
    getRiskLevel({
      ...emptyForm,
      reaction: 'shakes',
      aloneStatus: 'yes',
    }),
    'High'
  );

  assert.equal(
    getRiskLevel({
      ...emptyForm,
      reaction: 'shakes',
      aloneStatus: 'not-sure',
    }),
    'High'
  );
});

test('buildPetNoisePlan includes event-specific labels, vet guidance, and safety notes', () => {
  const plan = buildPetNoisePlan({
    ...emptyForm,
    petType: 'cat',
    eventType: 'thunderstorm',
    reaction: 'shakes',
  });
  const text = petNoisePlanText(plan);

  assert.equal(plan.riskLevel, 'Medium');
  assert.equal(plan.labels.petType, 'cat');
  assert.equal(plan.labels.eventType, 'thunderstorm');
  assert.match(text, /When to call a vet/);
  assert.match(text, /not veterinary advice/);
  assert.match(text, /does not diagnose anxiety or prescribe medication/);
  assert.match(text, /Do not give medication or supplements/);
});
