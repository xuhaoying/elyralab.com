'use client';

import { FormEvent, useRef, useState } from 'react';

import { trackToolEvent } from '@/lib/analytics';
import {
  ChecklistSection,
  PrintablePlan,
  ResultCard,
  SEOContent,
  ToolForm,
  type ToolFormValue,
  type ToolQuestion,
} from '@/shared/components/tools';

import {
  buildHeatwaveMealPlan,
  emptyForm,
  heatwavePlanText,
  type BudgetLevel,
  type DaysToPlan,
  type DietaryPreference,
  type FormState,
  type HeatwaveMealPlan,
  type KitchenTool,
  type MainGoal,
  type PeopleCount,
  type StorageOption,
} from './no-cook-heatwave-meal-planner.logic';

const questions: ToolQuestion[] = [
  {
    id: 'people',
    label: 'Number of people',
    type: 'radio',
    options: [
      { value: '1', label: '1' },
      { value: '2', label: '2' },
      { value: '3-4', label: '3-4' },
      { value: '5-plus', label: '5+' },
    ],
  },
  {
    id: 'days',
    label: 'Days to plan',
    type: 'radio',
    options: [
      { value: '1', label: '1 day' },
      { value: '3', label: '3 days' },
      { value: '5', label: '5 days' },
      { value: '7', label: '7 days' },
    ],
  },
  {
    id: 'budget',
    label: 'Budget level',
    type: 'radio',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'flexible', label: 'Flexible' },
    ],
  },
  {
    id: 'storage',
    label: 'Available storage',
    type: 'radio',
    options: [
      { value: 'fridge', label: 'Fridge' },
      { value: 'freezer', label: 'Freezer' },
      { value: 'pantry-only', label: 'Pantry only' },
      { value: 'limited-storage', label: 'Limited storage' },
    ],
  },
  {
    id: 'diet',
    label: 'Dietary preference',
    type: 'select',
    options: [
      { value: 'none', label: 'No restriction' },
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'high-protein', label: 'High protein' },
      { value: 'kid-friendly', label: 'Kid-friendly' },
      { value: 'elderly-friendly', label: 'Elderly-friendly' },
      { value: 'low-prep', label: 'Low prep' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools available',
    description:
      'Choose any small tools you can use without turning on a stove or oven.',
    type: 'checkbox',
    options: [
      { value: 'none', label: 'None' },
      { value: 'microwave', label: 'Microwave' },
      { value: 'kettle', label: 'Kettle' },
      { value: 'blender', label: 'Blender' },
      { value: 'toaster', label: 'Toaster' },
    ],
  },
  {
    id: 'goal',
    label: 'Main goal',
    type: 'select',
    options: [
      { value: 'stay-cool', label: 'Stay cool' },
      { value: 'save-money', label: 'Save money' },
      { value: 'avoid-cooking', label: 'Avoid cooking' },
      { value: 'family-meals', label: 'Simple family meals' },
      { value: 'emergency-prep', label: 'Emergency heatwave prep' },
    ],
  },
];

function normalizeTools(current: KitchenTool[], nextValue: ToolFormValue) {
  const next = Array.isArray(nextValue) ? (nextValue as KitchenTool[]) : [];

  if (next.length === 0) {
    return ['none'] as KitchenTool[];
  }

  if (!current.includes('none') && next.includes('none')) {
    return ['none'] as KitchenTool[];
  }

  if (current.includes('none') && next.length > 1) {
    return next.filter((tool) => tool !== 'none');
  }

  return next;
}

function normalizeFormValue<Field extends keyof FormState>(
  field: Field,
  value: ToolFormValue,
  current: FormState
): FormState[Field] {
  if (field === 'tools') {
    return normalizeTools(current.tools, value) as FormState[Field];
  }

  if (field === 'people') {
    return value as PeopleCount as FormState[Field];
  }

  if (field === 'days') {
    return value as DaysToPlan as FormState[Field];
  }

  if (field === 'budget') {
    return value as BudgetLevel as FormState[Field];
  }

  if (field === 'storage') {
    return value as StorageOption as FormState[Field];
  }

  if (field === 'diet') {
    return value as DietaryPreference as FormState[Field];
  }

  return value as MainGoal as FormState[Field];
}

function PlanInputs({ plan }: { plan: HeatwaveMealPlan }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
      <div>
        <span className="text-muted-foreground block">People and days</span>
        <span className="font-medium">
          {plan.labels.people}, {plan.labels.days}
        </span>
      </div>
      <div>
        <span className="text-muted-foreground block">Budget and storage</span>
        <span className="font-medium">
          {plan.labels.budget}, {plan.labels.storage}
        </span>
      </div>
      <div>
        <span className="text-muted-foreground block">Diet</span>
        <span className="font-medium">{plan.labels.diet}</span>
      </div>
      <div>
        <span className="text-muted-foreground block">Tools and goal</span>
        <span className="font-medium">
          {plan.labels.tools}; {plan.labels.goal}
        </span>
      </div>
    </div>
  );
}

function DailyPlan({ plan }: { plan: HeatwaveMealPlan }) {
  return (
    <section className="space-y-4" data-print-page>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Meal plan by day</h3>
        <p className="text-muted-foreground text-sm leading-6">
          Repeat meals when it reduces shopping, heat, and prep.
        </p>
      </div>
      <div className="grid gap-4">
        {plan.days.map((day) => (
          <section key={day.day} className="rounded-md border p-4">
            <h4 className="font-semibold">Day {day.day}</h4>
            <dl className="mt-3 grid gap-3 text-sm">
              <div>
                <dt className="font-medium">Breakfast</dt>
                <dd className="text-muted-foreground mt-1">{day.breakfast}</dd>
              </div>
              <div>
                <dt className="font-medium">Lunch</dt>
                <dd className="text-muted-foreground mt-1">{day.lunch}</dd>
              </div>
              <div>
                <dt className="font-medium">Dinner</dt>
                <dd className="text-muted-foreground mt-1">{day.dinner}</dd>
              </div>
              <div>
                <dt className="font-medium">Snacks</dt>
                <dd className="text-muted-foreground mt-1">
                  {day.snacks.join('; ')}
                </dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}

export function NoCookHeatwaveMealPlanner({
  toolSlug,
}: {
  toolSlug: string;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [plan, setPlan] = useState<HeatwaveMealPlan | null>(null);
  const startedRef = useRef(false);

  function updateField(field: string, value: ToolFormValue) {
    setForm((current) => ({
      ...current,
      [field]: normalizeFormValue(field as keyof FormState, value, current),
    }));
  }

  function trackStartOnce() {
    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackStartOnce();

    const nextPlan = buildHeatwaveMealPlan(form);
    setPlan(nextPlan);

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      plan_type: nextPlan.planType,
      people: form.people,
      days: form.days,
      budget: form.budget,
      storage: form.storage,
      diet: form.diet,
      goal: form.goal,
      tool_count: form.tools.includes('none') ? 0 : form.tools.length,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setPlan(null);
  }

  return (
    <div className="space-y-6">
      <ToolForm
        title="Build your no-cook meal plan"
        description="Build a simple no-cook meal plan for hot days, small kitchens, dorms, and heatwave weeks."
        questions={questions}
        values={{ ...form }}
        onValueChange={updateField}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitLabel="Generate meal plan"
      />

      <ResultCard
        title="Meal plan result"
        description="Use this summary to shop, prep, and print a heat-safe checklist."
        label={plan?.planType}
        summary={plan?.summary}
        recommendedNextSteps={plan?.recommendedNextSteps}
      >
        {plan ? <PlanInputs plan={plan} /> : null}
      </ResultCard>

      <PrintablePlan
        title="Printable no-cook heatwave meal plan"
        description="Print this plan or choose Save as PDF in your browser print dialog."
        disabled={!plan}
        toolSlug={toolSlug}
      >
        {plan ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{plan.planType}</h2>
              <p className="text-muted-foreground text-sm leading-6">
                {plan.summary}
              </p>
            </div>

            <PlanInputs plan={plan} />
            <DailyPlan plan={plan} />

            <ChecklistSection
              title="Meal ideas"
              description="Swap these into any day when they fit your storage and appetite."
              sections={plan.ideaSections}
            />

            <ChecklistSection
              title="Grocery list"
              description="Adjust quantities for appetite, local prices, and storage."
              sections={plan.grocerySections}
            />

            <ChecklistSection
              title="Heat-safe reminders"
              sections={[
                {
                  title: 'Storage reminders',
                  items: plan.storageReminders,
                },
                {
                  title: 'Budget tips',
                  items: plan.budgetTips,
                },
                {
                  title: 'Safety notes and limitations',
                  items: plan.safetyNotes,
                },
              ]}
            />

            <details className="text-muted-foreground text-xs" data-print-hidden="true">
              <summary className="cursor-pointer">Plain-text version</summary>
              <pre className="mt-3 whitespace-pre-wrap rounded-md border p-3">
                {heatwavePlanText(plan)}
              </pre>
            </details>
          </div>
        ) : null}
      </PrintablePlan>

      <SEOContent
        title="No-cook heatwave meal planning notes"
        intro="The goal is to keep food simple, cool, safe, and realistic when a stove or oven would make the room hotter."
        sections={[
          {
            title: 'Useful for hot days and small kitchens',
            body: 'This planner can fit heatwave weeks, dorms, rentals without strong air conditioning, senior check-ins, family snack dinners, and emergency prep.',
          },
          {
            title: 'Storage changes the plan',
            body: 'Pantry-only or limited storage plans lean on shelf-stable foods and smaller shopping trips. Fridge and freezer plans can safely use more yogurt, hummus, salads, fruit, and chilled proteins.',
          },
          {
            title: 'Diet and care boundaries',
            body: 'Elderly-friendly and high-protein options are general meal ideas. They are not medical nutrition advice and should not replace a clinician plan for restricted diets.',
          },
          {
            title: 'Heat safety basics',
            items: [
              'Keep perishable foods cold.',
              'Do not eat spoiled food.',
              'Follow local heat safety guidance during extreme heat.',
              'Stay hydrated and check on vulnerable people when temperatures are dangerous.',
            ],
          },
        ]}
      />
    </div>
  );
}
