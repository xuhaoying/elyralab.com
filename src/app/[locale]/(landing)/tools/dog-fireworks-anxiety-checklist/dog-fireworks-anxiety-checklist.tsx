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
  buildPetNoisePlan,
  emptyForm,
  petNoisePlanText,
  type AloneStatus,
  type FormState,
  type NoiseEvent,
  type NoiseReaction,
  type PetAge,
  type PetNoisePlan,
  type PetType,
  type RiskLevel,
} from './dog-fireworks-anxiety-checklist.logic';

const questions: ToolQuestion[] = [
  {
    id: 'petType',
    label: 'Pet type',
    type: 'radio',
    options: [
      { value: 'dog', label: 'Dog' },
      { value: 'cat', label: 'Cat' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'petAge',
    label: 'Pet age',
    type: 'radio',
    options: [
      { value: 'young', label: 'Puppy / kitten' },
      { value: 'adult', label: 'Adult' },
      { value: 'senior', label: 'Senior' },
    ],
  },
  {
    id: 'reaction',
    label: 'Past reaction to loud noise',
    description:
      'Choose the strongest reaction you have seen during fireworks, thunderstorms, construction noise, or a similar event.',
    type: 'select',
    options: [
      { value: 'calm', label: 'Calm or mildly alert' },
      { value: 'hides', label: 'Hides' },
      { value: 'shakes', label: 'Shakes, pants, or refuses food' },
      { value: 'escape', label: 'Tries to escape' },
      {
        value: 'destructive',
        label: 'Destructive behavior or self-injury',
      },
    ],
  },
  {
    id: 'eventType',
    label: 'Event type',
    type: 'select',
    options: [
      { value: 'july-4-fireworks', label: 'July 4 fireworks' },
      { value: 'new-year-fireworks', label: 'New Year fireworks' },
      { value: 'local-fireworks', label: 'Local fireworks' },
      { value: 'thunderstorm', label: 'Thunderstorm' },
      { value: 'construction-noise', label: 'Construction noise' },
      { value: 'other-loud-event', label: 'Other loud event' },
    ],
  },
  {
    id: 'aloneStatus',
    label: 'Will the pet be alone during the event?',
    type: 'radio',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
      { value: 'not-sure', label: 'Not sure' },
    ],
  },
];

const riskTone: Record<RiskLevel, 'low' | 'medium' | 'high'> = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
};

function normalizeFormValue<Field extends keyof FormState>(
  field: Field,
  value: ToolFormValue
): FormState[Field] {
  if (field === 'petType') {
    return value as PetType as FormState[Field];
  }

  if (field === 'petAge') {
    return value as PetAge as FormState[Field];
  }

  if (field === 'reaction') {
    return value as NoiseReaction as FormState[Field];
  }

  if (field === 'eventType') {
    return value as NoiseEvent as FormState[Field];
  }

  return value as AloneStatus as FormState[Field];
}

function PlanInputs({ plan }: { plan: PetNoisePlan }) {
  return (
    <div className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
      <div>
        <span className="text-muted-foreground block">Pet</span>
        <span className="font-medium">
          {plan.labels.petType}, {plan.labels.petAge}
        </span>
      </div>
      <div>
        <span className="text-muted-foreground block">Event</span>
        <span className="font-medium">{plan.labels.eventType}</span>
      </div>
      <div>
        <span className="text-muted-foreground block">Past reaction</span>
        <span className="font-medium">{plan.labels.reaction}</span>
      </div>
      <div>
        <span className="text-muted-foreground block">Alone during event</span>
        <span className="font-medium">{plan.labels.aloneStatus}</span>
      </div>
    </div>
  );
}

export function DogFireworksAnxietyChecklist({
  toolSlug,
}: {
  toolSlug: string;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [plan, setPlan] = useState<PetNoisePlan | null>(null);
  const startedRef = useRef(false);

  function updateField(field: string, value: ToolFormValue) {
    setForm((current) => ({
      ...current,
      [field]: normalizeFormValue(field as keyof FormState, value),
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

    const nextPlan = buildPetNoisePlan(form);
    setPlan(nextPlan);

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      risk_level: nextPlan.riskLevel,
      pet_type: form.petType,
      pet_age: form.petAge,
      reaction: form.reaction,
      event_type: form.eventType,
      alone_status: form.aloneStatus,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setPlan(null);
  }

  return (
    <div className="space-y-6">
      <ToolForm
        title="Build your noise safety plan"
        description="Answer 5 quick questions and get a printable safety plan for fireworks, thunderstorms, and other loud-noise events."
        questions={questions}
        values={{ ...form }}
        onValueChange={updateField}
        onSubmit={handleSubmit}
        onReset={handleReset}
        submitLabel="Generate plan"
      />

      <ResultCard
        title="Plan result"
        description="Use the summary to decide how much preparation and supervision to plan."
        label={plan ? `Risk level: ${plan.riskLevel}` : undefined}
        tone={plan ? riskTone[plan.riskLevel] : 'neutral'}
        summary={plan?.summary}
        recommendedNextSteps={plan?.recommendedNextSteps}
      >
        {plan ? <PlanInputs plan={plan} /> : null}
      </ResultCard>

      <PrintablePlan
        title="Printable pet noise safety plan"
        description="Print this checklist or choose Save as PDF in your browser print dialog."
        disabled={!plan}
        toolSlug={toolSlug}
      >
        {plan ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">
                {plan.riskLevel} risk plan for {plan.labels.eventType}
              </h2>
              <p className="text-muted-foreground text-sm leading-6">
                {plan.summary}
              </p>
              <p className="text-muted-foreground text-sm leading-6">
                {plan.explanation}
              </p>
            </div>

            <PlanInputs plan={plan} />

            <ChecklistSection
              title="Printable checklist"
              sections={plan.checklistSections}
            />

            <section className="rounded-md border p-4" data-print-page>
              <h3 className="font-semibold">Safety notes and limitations</h3>
              <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
                {plan.safetyNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>

            <details className="text-muted-foreground text-xs" data-print-hidden="true">
              <summary className="cursor-pointer">Plain-text version</summary>
              <pre className="mt-3 whitespace-pre-wrap rounded-md border p-3">
                {petNoisePlanText(plan)}
              </pre>
            </details>
          </div>
        ) : null}
      </PrintablePlan>

      <SEOContent
        title="Fireworks and loud-noise planning notes"
        intro="A useful pet noise plan starts with the basics: reduce exposure, prevent escape, avoid unsafe calming products, and know when a veterinarian should be involved."
        sections={[
          {
            title: 'Works beyond July 4',
            body: 'The same checklist structure can help with New Year fireworks, local fireworks, thunderstorms, construction noise, street festivals, and other loud events.',
          },
          {
            title: 'Dog and cat safety limits',
            body: 'Dogs and cats can both hide, panic, refuse food, or try to escape during loud noise. This tool gives a practical checklist, not a diagnosis or treatment plan.',
          },
          {
            title: 'When preparation should start',
            body: 'For mild cases, set up the safe area before the event day. For repeated shaking, escape attempts, destructive behavior, self-injury, or senior pets with strong symptoms, contact a veterinarian earlier.',
          },
          {
            title: 'Medical boundary',
            items: [
              'This tool is not veterinary advice.',
              'It does not diagnose anxiety or prescribe medication.',
              'Do not give medication or supplements without asking a vet.',
            ],
          },
        ]}
      />
    </div>
  );
}
