import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildHeatwaveMealPlan,
  emptyForm,
  heatwavePlanText,
} from './no-cook-heatwave-meal-planner.logic';

test('buildHeatwaveMealPlan creates the requested number of daily plans', () => {
  const plan = buildHeatwaveMealPlan({
    ...emptyForm,
    days: '5',
  });

  assert.equal(plan.days.length, 5);
  assert.match(plan.summary, /5 days/);
});

test('pantry-only plans prioritize shelf-stable groceries and storage reminders', () => {
  const plan = buildHeatwaveMealPlan({
    ...emptyForm,
    storage: 'pantry-only',
    budget: 'low',
    goal: 'emergency-prep',
  });
  const text = heatwavePlanText(plan);

  assert.match(plan.planType, /Shelf-stable/);
  assert.match(text, /Shelf-stable proteins/);
  assert.match(text, /shelf-stable/i);
  assert.doesNotMatch(text, /rotisserie chicken/);
  assert.doesNotMatch(text, /bagged salad/);
});

test('pantry-only kid and elderly plans do not emit cold-storage meals', () => {
  const coldFoodPattern =
    /yogurt|cheese|turkey|cucumber|melon|bagged salad|rotisserie chicken/i;

  const kidPlan = heatwavePlanText(
    buildHeatwaveMealPlan({
      ...emptyForm,
      storage: 'pantry-only',
      diet: 'kid-friendly',
    })
  );
  const elderlyPlan = heatwavePlanText(
    buildHeatwaveMealPlan({
      ...emptyForm,
      storage: 'pantry-only',
      diet: 'elderly-friendly',
    })
  );

  assert.doesNotMatch(kidPlan, coldFoodPattern);
  assert.doesNotMatch(elderlyPlan, coldFoodPattern);
  assert.match(kidPlan, /Shelf-stable/i);
  assert.match(elderlyPlan, /Shelf-stable/i);
});

test('pantry-only toaster plans avoid cold toast toppings', () => {
  const plan = buildHeatwaveMealPlan({
    ...emptyForm,
    storage: 'pantry-only',
    tools: ['toaster'],
    days: '7',
  });
  const text = heatwavePlanText(plan);

  assert.match(text, /Toast with peanut butter, banana, and cinnamon/);
  assert.doesNotMatch(text, /tomato, cucumber, and cheese/i);
});

test('high-protein plans include ready-to-eat protein options', () => {
  const plan = buildHeatwaveMealPlan({
    ...emptyForm,
    diet: 'high-protein',
    storage: 'fridge',
  });
  const text = heatwavePlanText(plan);

  assert.match(plan.planType, /High-protein/);
  assert.match(text, /Greek yogurt/);
  assert.match(text, /canned tuna or salmon/);
  assert.match(text, /hummus/);
});

test('elderly-friendly plans mention easy-to-chew hydration without medical claims', () => {
  const plan = buildHeatwaveMealPlan({
    ...emptyForm,
    diet: 'elderly-friendly',
  });
  const text = heatwavePlanText(plan);

  assert.match(plan.planType, /easy-to-chew/);
  assert.match(text, /soft/i);
  assert.match(text, /hydrating/i);
  assert.match(text, /not medical or nutrition advice/);
});

test('vegetarian plans remove meat and fish meal ideas', () => {
  const plan = buildHeatwaveMealPlan({
    ...emptyForm,
    diet: 'vegetarian',
  });
  const text = heatwavePlanText(plan);

  assert.doesNotMatch(text, /rotisserie chicken/i);
  assert.doesNotMatch(text, /tuna or salmon/i);
  assert.match(text, /Chickpea/);
});
