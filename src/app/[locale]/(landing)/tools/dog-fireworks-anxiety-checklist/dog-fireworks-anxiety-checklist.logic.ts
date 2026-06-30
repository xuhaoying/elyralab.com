export type PetType = 'dog' | 'cat' | 'other';
export type PetAge = 'young' | 'adult' | 'senior';
export type NoiseReaction =
  | 'calm'
  | 'hides'
  | 'shakes'
  | 'escape'
  | 'destructive';
export type NoiseEvent =
  | 'july-4-fireworks'
  | 'new-year-fireworks'
  | 'local-fireworks'
  | 'thunderstorm'
  | 'construction-noise'
  | 'other-loud-event';
export type AloneStatus = 'no' | 'yes' | 'not-sure';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface FormState {
  petType: PetType;
  petAge: PetAge;
  reaction: NoiseReaction;
  eventType: NoiseEvent;
  aloneStatus: AloneStatus;
}

export interface PlanSection {
  title: string;
  description?: string;
  items: string[];
}

export interface PetNoisePlan {
  riskLevel: RiskLevel;
  summary: string;
  explanation: string;
  recommendedNextSteps: string[];
  checklistSections: PlanSection[];
  safetyNotes: string[];
  labels: {
    petType: string;
    petAge: string;
    reaction: string;
    eventType: string;
    aloneStatus: string;
  };
}

export const emptyForm: FormState = {
  petType: 'dog',
  petAge: 'adult',
  reaction: 'calm',
  eventType: 'july-4-fireworks',
  aloneStatus: 'no',
};

export const petTypeLabels: Record<PetType, string> = {
  dog: 'dog',
  cat: 'cat',
  other: 'pet',
};

export const petAgeLabels: Record<PetAge, string> = {
  young: 'puppy / kitten',
  adult: 'adult',
  senior: 'senior',
};

export const reactionLabels: Record<NoiseReaction, string> = {
  calm: 'calm or mildly alert',
  hides: 'hides',
  shakes: 'shakes, pants, or refuses food',
  escape: 'tries to escape',
  destructive: 'destructive behavior or self-injury',
};

export const eventLabels: Record<NoiseEvent, string> = {
  'july-4-fireworks': 'July 4 fireworks',
  'new-year-fireworks': 'New Year fireworks',
  'local-fireworks': 'local fireworks',
  thunderstorm: 'thunderstorm',
  'construction-noise': 'construction noise',
  'other-loud-event': 'other loud event',
};

export const aloneStatusLabels: Record<AloneStatus, string> = {
  no: 'no',
  yes: 'yes',
  'not-sure': 'not sure',
};

const reactionSeverity: Record<NoiseReaction, number> = {
  calm: 0,
  hides: 1,
  shakes: 2,
  escape: 3,
  destructive: 4,
};

function getPetLabel(petType: PetType) {
  return petTypeLabels[petType];
}

function getPossessivePetLabel(petType: PetType) {
  return petType === 'other' ? 'your pet' : `your ${petTypeLabels[petType]}`;
}

function getSentencePetLabel(petType: PetType) {
  const label = getPossessivePetLabel(petType);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

export function getRiskLevel(form: FormState): RiskLevel {
  const severity = reactionSeverity[form.reaction];
  const hasEscapeOrInjuryHistory = severity >= 3;
  const hasMarkedStress = severity >= 2;
  const hasAnyStress = severity >= 1;
  const seniorWithMarkedStress = form.petAge === 'senior' && hasMarkedStress;
  const aloneWithMarkedStress = form.aloneStatus === 'yes' && hasMarkedStress;
  const uncertainSupervision = form.aloneStatus === 'not-sure';
  const uncertainWithMarkedStress = uncertainSupervision && hasMarkedStress;

  if (
    hasEscapeOrInjuryHistory ||
    seniorWithMarkedStress ||
    aloneWithMarkedStress ||
    uncertainWithMarkedStress
  ) {
    return 'High';
  }

  if (hasAnyStress || form.aloneStatus === 'yes' || uncertainSupervision) {
    return 'Medium';
  }

  return 'Low';
}

function getSummary(form: FormState, riskLevel: RiskLevel) {
  const petLabel = getSentencePetLabel(form.petType);
  const eventLabel = eventLabels[form.eventType].toLowerCase();

  if (riskLevel === 'High') {
    return `${petLabel} has high-risk noise anxiety flags for ${eventLabel}. Prioritize escape prevention, supervision, and veterinary guidance before the event.`;
  }

  if (riskLevel === 'Medium') {
    return `${petLabel} may have a meaningful stress response during ${eventLabel}. Prepare a quiet safe room, plan supervision, and keep the routine simple.`;
  }

  return `${petLabel} appears low risk based on these answers, but loud events can change quickly. Use a basic comfort plan and prevent accidental escapes.`;
}

function getExplanation(form: FormState, riskLevel: RiskLevel) {
  const severity = reactionSeverity[form.reaction];
  const reasons: string[] = [];

  if (severity >= 3) {
    reasons.push('past escape, destructive behavior, or self-injury');
  } else if (severity >= 2) {
    reasons.push('shaking, panting, food refusal, or similar stress signs');
  } else if (severity === 1) {
    reasons.push('hiding during loud noise');
  } else {
    reasons.push('only mild alertness reported');
  }

  if (form.petAge === 'senior' && severity >= 2) {
    reasons.push('senior pet with a clear stress response');
  }

  if (form.aloneStatus === 'yes') {
    reasons.push('the pet may be alone during the event');
  }

  if (form.aloneStatus === 'not-sure') {
    reasons.push('supervision is not fully confirmed');
  }

  return `${riskLevel} risk is based on ${reasons.join(', ')}.`;
}

function getBeforeItems(form: FormState, riskLevel: RiskLevel) {
  const petLabel = getPetLabel(form.petType);
  const items = [
    'Choose an interior room or quiet corner away from windows and exterior doors.',
    `Add familiar bedding, water, and a safe hiding place for the ${petLabel}.`,
    'Close windows, curtains, blinds, pet doors, and any easy escape route before noise starts.',
    'Check collar, ID tag, microchip details, carrier, leash, and recent photos.',
    'Plan bathroom breaks, feeding, and exercise earlier in the day when it is quiet.',
    'Set up steady background sound such as a fan, white noise, or calm music.',
  ];

  if (riskLevel !== 'Low') {
    items.push(
      'Prepare high-value treats, food puzzles, or comfort items, but do not force interaction if the pet refuses them.'
    );
  }

  if (riskLevel === 'High') {
    items.push(
      'Contact a veterinarian before the event to discuss a safe prevention plan.',
      'Arrange supervision; avoid leaving the pet alone if there is any history of escape, injury, or panic.'
    );
  }

  return items;
}

function getDuringItems(form: FormState, riskLevel: RiskLevel) {
  const petLabel = getPetLabel(form.petType);
  const items = [
    `Keep the ${petLabel} indoors and away from open doors, balconies, windows, and guests entering or leaving.`,
    'Let the pet hide if hiding is safe; do not pull them out or punish fear behavior.',
    'Use calm, predictable movement and short check-ins instead of loud reassurance.',
    'Offer water and small treats, but do not worry if food is refused during the loudest period.',
    'Keep outdoor trips on leash or in a secure carrier, even for pets that usually stay nearby.',
  ];

  if (form.aloneStatus === 'yes') {
    items.push(
      'If the pet must be alone, use the most secure interior area and remove breakable or dangerous objects.'
    );
  }

  if (riskLevel === 'High') {
    items.push(
      'Do not crate a panicking pet unless the crate is already a calm, safe place; panic can lead to injury.',
      'Keep emergency contact details and the nearest open veterinary clinic information available.'
    );
  }

  return items;
}

function getAfterItems(riskLevel: RiskLevel) {
  const items = [
    'Check food, water, litter box or bathroom needs, and general breathing and movement.',
    'Inspect doors, windows, screens, crates, gates, and hiding areas for damage or injury risks.',
    'Return to the normal routine gradually instead of forcing play, training, or grooming.',
    'Write down what worked, what failed, and how long it took the pet to settle.',
  ];

  if (riskLevel !== 'Low') {
    items.push(
      'Save notes for the next storm, fireworks night, construction period, or vet conversation.'
    );
  }

  return items;
}

function getVetItems(form: FormState, riskLevel: RiskLevel) {
  const items = [
    'Call a veterinarian before the event if there is any history of escaping, self-injury, seizures, heart disease, breathing problems, or extreme panic.',
    'Ask a vet before giving any medication, supplement, sedative, or calming product.',
    'Seek urgent care if the pet is injured, collapses, has trouble breathing, has a seizure, or cannot settle after the noise ends.',
  ];

  if (riskLevel === 'High') {
    items.unshift(
      'Because this plan shows high-risk flags, contact a veterinarian before the event whenever possible.'
    );
  }

  if (form.petAge === 'senior') {
    items.push(
      'For senior pets, call sooner if stress is paired with weakness, coughing, labored breathing, or confusion.'
    );
  }

  return items;
}

function getNextSteps(riskLevel: RiskLevel) {
  if (riskLevel === 'High') {
    return [
      'Call your veterinarian before the loud event if there is time.',
      'Plan for supervision and remove escape routes before noise starts.',
      'Use the printable checklist to brief anyone who will be at home.',
    ];
  }

  if (riskLevel === 'Medium') {
    return [
      'Set up the safe room at least a day before the event when possible.',
      'Confirm who will check on the pet during the loudest period.',
      'Track the reaction so the next plan can be more specific.',
    ];
  }

  return [
    'Prepare a quiet indoor area and close escape routes before the event.',
    'Keep identification current in case the reaction is stronger than expected.',
    'Save this checklist for fireworks, thunderstorms, construction noise, and similar events.',
  ];
}

export function buildPetNoisePlan(form: FormState): PetNoisePlan {
  const riskLevel = getRiskLevel(form);

  return {
    riskLevel,
    summary: getSummary(form, riskLevel),
    explanation: getExplanation(form, riskLevel),
    recommendedNextSteps: getNextSteps(riskLevel),
    checklistSections: [
      {
        title: 'Before the event checklist',
        description: 'Prepare comfort, identification, and escape prevention.',
        items: getBeforeItems(form, riskLevel),
      },
      {
        title: 'During the event checklist',
        description: 'Keep the pet inside, supervised, and physically safe.',
        items: getDuringItems(form, riskLevel),
      },
      {
        title: 'After the event checklist',
        description: 'Check recovery and improve the next plan.',
        items: getAfterItems(riskLevel),
      },
      {
        title: 'When to call a vet',
        description:
          'Use professional guidance for medical risks, severe panic, or medication questions.',
        items: getVetItems(form, riskLevel),
      },
    ],
    safetyNotes: [
      'This tool is not veterinary advice.',
      'It does not diagnose anxiety or prescribe medication.',
      'Do not give medication or supplements without asking a veterinarian.',
      'If your pet has a history of escaping, self-injury, seizures, heart disease, breathing problems, or extreme panic, contact a veterinarian before the event.',
    ],
    labels: {
      petType: petTypeLabels[form.petType],
      petAge: petAgeLabels[form.petAge],
      reaction: reactionLabels[form.reaction],
      eventType: eventLabels[form.eventType],
      aloneStatus: aloneStatusLabels[form.aloneStatus],
    },
  };
}

export function petNoisePlanText(plan: PetNoisePlan) {
  const lines = [
    'Free Dog Fireworks Anxiety Plan Generator',
    `Risk level: ${plan.riskLevel}`,
    plan.summary,
    plan.explanation,
    '',
    'Inputs',
    `Pet type: ${plan.labels.petType}`,
    `Pet age: ${plan.labels.petAge}`,
    `Past reaction: ${plan.labels.reaction}`,
    `Event type: ${plan.labels.eventType}`,
    `Alone during event: ${plan.labels.aloneStatus}`,
    '',
    'Recommended next steps',
    ...plan.recommendedNextSteps.map((step) => `- ${step}`),
    '',
    ...plan.checklistSections.flatMap((section) => [
      section.title,
      ...(section.description ? [section.description] : []),
      ...section.items.map((item) => `- ${item}`),
      '',
    ]),
    'Safety notes',
    ...plan.safetyNotes.map((note) => `- ${note}`),
  ];

  return lines.join('\n');
}
