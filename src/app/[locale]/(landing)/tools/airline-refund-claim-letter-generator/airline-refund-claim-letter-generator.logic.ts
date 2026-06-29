export type IssueType =
  | 'cancelled'
  | 'delayed'
  | 'denied boarding'
  | 'refund refused'
  | 'schedule changed';
export type DesiredOutcome =
  | 'refund'
  | 'compensation'
  | 'voucher'
  | 'rebooking';
export type Tone = 'polite' | 'firm' | 'concise';

export interface FormState {
  airlineName: string;
  passengerName: string;
  flightNumber: string;
  flightDate: string;
  route: string;
  issueType: IssueType;
  desiredOutcome: DesiredOutcome;
  tone: Tone;
  extraDetails: string;
}

export interface GeneratedClaim {
  subjectLine: string;
  letter: string;
  evidenceChecklist: string[];
  claimPlan: ClaimPlanItem[];
}

export interface ClaimPlanItem {
  label: string;
  detail: string;
}

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export interface ValidationResult {
  message: string;
  fieldErrors: FieldErrors;
}

export const emptyForm: FormState = {
  airlineName: '',
  passengerName: '',
  flightNumber: '',
  flightDate: '',
  route: '',
  issueType: 'cancelled',
  desiredOutcome: 'refund',
  tone: 'polite',
  extraDetails: '',
};

export const issueLabels: Record<IssueType, string> = {
  cancelled: 'Cancelled flight',
  delayed: 'Delayed flight',
  'denied boarding': 'Denied boarding',
  'refund refused': 'Refund refused',
  'schedule changed': 'Schedule changed',
};

export const outcomeLabels: Record<DesiredOutcome, string> = {
  refund: 'Refund',
  compensation: 'Compensation',
  voucher: 'Voucher',
  rebooking: 'Rebooking',
};

export const toneLabels: Record<Tone, string> = {
  polite: 'Polite',
  firm: 'Firm',
  concise: 'Concise',
};

const issueDescriptions: Record<IssueType, string> = {
  cancelled: 'my flight was cancelled',
  delayed: 'my flight was delayed',
  'denied boarding': 'I was denied boarding',
  'refund refused': 'my refund request was refused',
  'schedule changed': 'my schedule was materially changed',
};

const outcomeRequests: Record<DesiredOutcome, string> = {
  refund: 'a refund to my original payment method',
  compensation: 'compensation for the disruption',
  voucher: 'a travel voucher or credit that fairly reflects the disruption',
  rebooking: 'rebooking on a suitable replacement itinerary at no extra cost',
};

const validIssues = new Set<IssueType>([
  'cancelled',
  'delayed',
  'denied boarding',
  'refund refused',
  'schedule changed',
]);
const validOutcomes = new Set<DesiredOutcome>([
  'refund',
  'compensation',
  'voucher',
  'rebooking',
]);
const validTones = new Set<Tone>(['polite', 'firm', 'concise']);

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function formatDate(value: string) {
  if (!isValidIsoDate(value)) {
    return '';
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function validateClaimForm(form: FormState): ValidationResult {
  const fieldErrors: FieldErrors = {};
  const airlineName = clean(form.airlineName);
  const passengerName = clean(form.passengerName);
  const flightNumber = clean(form.flightNumber).toUpperCase();
  const route = clean(form.route);
  const extraDetails = form.extraDetails.trim();

  if (!airlineName) {
    fieldErrors.airlineName = 'Enter the airline name.';
  } else if (airlineName.length > 80) {
    fieldErrors.airlineName = 'Keep the airline name under 80 characters.';
  }

  if (passengerName.length > 80) {
    fieldErrors.passengerName = 'Keep the passenger name under 80 characters.';
  }

  if (flightNumber && !/^[A-Z0-9 -]{2,20}$/.test(flightNumber)) {
    fieldErrors.flightNumber =
      'Use only letters, numbers, spaces, or hyphens for the flight number.';
  }

  if (!form.flightDate) {
    fieldErrors.flightDate = 'Enter the flight date.';
  } else if (!isValidIsoDate(form.flightDate)) {
    fieldErrors.flightDate = 'Enter a valid flight date.';
  }

  if (route.length > 120) {
    fieldErrors.route = 'Keep the route under 120 characters.';
  }

  if (!validIssues.has(form.issueType)) {
    fieldErrors.issueType = 'Choose a supported issue type.';
  }

  if (!validOutcomes.has(form.desiredOutcome)) {
    fieldErrors.desiredOutcome = 'Choose a supported desired outcome.';
  }

  if (!validTones.has(form.tone)) {
    fieldErrors.tone = 'Choose a supported tone.';
  }

  if (extraDetails.length > 1500) {
    fieldErrors.extraDetails = 'Keep extra details under 1,500 characters.';
  }

  const firstError = Object.values(fieldErrors)[0] || '';

  return {
    fieldErrors,
    message: firstError,
  };
}

function normalizedForm(form: FormState): FormState {
  return {
    ...form,
    airlineName: clean(form.airlineName),
    passengerName: clean(form.passengerName),
    flightNumber: clean(form.flightNumber).toUpperCase(),
    route: clean(form.route),
    extraDetails: form.extraDetails.trim(),
  };
}

function buildFlightReference(form: FormState) {
  const details = [
    form.flightNumber ? `flight ${form.flightNumber}` : 'my flight',
    formatDate(form.flightDate) ? `on ${formatDate(form.flightDate)}` : '',
    form.route ? `for ${form.route}` : '',
  ].filter(Boolean);

  return details.join(' ');
}

export function buildSubjectLine(form: FormState) {
  const normalized = normalizedForm(form);
  const issue = issueLabels[normalized.issueType].toLowerCase();
  const outcome = outcomeLabels[normalized.desiredOutcome].toLowerCase();
  const flight = normalized.flightNumber ? ` - ${normalized.flightNumber}` : '';
  const date = formatDate(normalized.flightDate);

  return `Request for ${outcome} - ${issue}${flight}${date ? ` on ${date}` : ''}`;
}

export function buildEvidenceChecklist(form: FormState) {
  const checklist = [
    'Booking confirmation, ticket receipt, or reservation number',
    'Boarding pass or check-in confirmation, if available',
    'Any airline notice about the disruption',
    'Screenshots or emails showing the flight status and timeline',
    'Receipts for extra costs caused by the disruption',
  ];

  if (form.issueType === 'refund refused') {
    checklist.push('Copy of the refund denial or customer service response');
  }

  if (form.issueType === 'denied boarding') {
    checklist.push(
      'Gate agent note, denied boarding form, or written explanation'
    );
  }

  if (form.issueType === 'schedule changed') {
    checklist.push(
      'Original itinerary and updated itinerary showing the change'
    );
  }

  if (form.desiredOutcome === 'refund') {
    checklist.push('Payment receipt showing the original fare and fees');
  }

  return checklist;
}

export function buildClaimPlan(form: FormState): ClaimPlanItem[] {
  const normalized = normalizedForm(form);
  const plan: ClaimPlanItem[] = [
    {
      label: 'Best first channel',
      detail:
        'Submit through the airline refund, customer relations, or complaint form first. Save the confirmation number, then send the same letter by email if you have an address.',
    },
  ];

  if (
    normalized.desiredOutcome === 'refund' &&
    ['cancelled', 'schedule changed', 'refund refused'].includes(
      normalized.issueType
    )
  ) {
    plan.push({
      label: 'Main argument',
      detail:
        'Lead with the fact that the original service was not provided as booked and request a refund to the original payment method.',
    });
  } else if (
    normalized.desiredOutcome === 'compensation' ||
    ['delayed', 'denied boarding'].includes(normalized.issueType)
  ) {
    plan.push({
      label: 'Main argument',
      detail:
        'Lead with the disruption timeline, what the airline told you, and any measurable costs or lost time caused by the incident.',
    });
  } else if (normalized.desiredOutcome === 'rebooking') {
    plan.push({
      label: 'Main argument',
      detail:
        'Lead with the replacement itinerary you want and ask the airline to confirm that there will be no extra fare, change fee, or service fee.',
    });
  } else {
    plan.push({
      label: 'Main argument',
      detail:
        'Lead with the disruption, explain why the requested outcome is fair, and ask for all voucher terms to be provided in writing.',
    });
  }

  plan.push(
    {
      label: 'Follow-up timing',
      detail:
        normalized.tone === 'firm'
          ? 'If there is no written response within 7 days, reply in the same thread and ask for a supervisor review or claim reference update.'
          : 'If there is no written response within 10 to 14 days, reply in the same thread with the original subject line and attach your evidence again.',
    },
    {
      label: 'Escalation packet',
      detail:
        'Keep the final letter, booking proof, airline notices, receipts, screenshots, and any denial reason together so you can escalate cleanly if the airline refuses.',
    },
    {
      label: 'Accuracy check',
      detail:
        'Do not overstate facts or cite rules you have not checked. If you reference passenger rights, verify the rule for the country, airline, and itinerary first.',
    }
  );

  return plan;
}

function buildOpening(form: FormState) {
  const flightReference = buildFlightReference(form);
  const issueDescription = issueDescriptions[form.issueType];
  const outcomeRequest = outcomeRequests[form.desiredOutcome];

  if (form.tone === 'concise') {
    return `I am writing about ${flightReference}. Because ${issueDescription}, I am requesting ${outcomeRequest}.`;
  }

  if (form.tone === 'firm') {
    return `I am writing to formally request ${outcomeRequest} for ${flightReference}. ${issueDescription.charAt(0).toUpperCase()}${issueDescription.slice(
      1
    )}, and I expect this matter to be reviewed promptly.`;
  }

  return `I am writing to request your help with ${flightReference}. Because ${issueDescription}, I would like to request ${outcomeRequest}.`;
}

function buildDetailsParagraph(form: FormState) {
  if (!form.extraDetails) {
    return 'Please review the booking record, disruption details, and the supporting evidence I can provide. If you need additional information, please let me know what documentation is required.';
  }

  return `Additional details: ${form.extraDetails}`;
}

function buildClosing(form: FormState) {
  if (form.tone === 'concise') {
    return 'Please confirm the next steps and expected resolution timeline. If the request is denied, please provide the reason in writing.';
  }

  if (form.tone === 'firm') {
    return 'Please confirm receipt of this claim and provide a written response with the proposed resolution and timeline. If this cannot be resolved directly, please explain the reason in writing and identify any further documentation required.';
  }

  return 'Please confirm receipt of this request and let me know the expected timeline for review. If additional documentation is needed, please tell me what to provide. Thank you for your assistance.';
}

function compactLetterLines(lines: string[]) {
  return lines
    .filter((line, index, allLines) => {
      if (line !== '') {
        return true;
      }

      return allLines[index - 1] !== '' && allLines[index + 1] !== '';
    })
    .join('\n');
}

export function generateClaim(form: FormState): GeneratedClaim {
  const normalized = normalizedForm(form);
  const airline = normalized.airlineName || 'the airline';
  const passengerLine = normalized.passengerName
    ? `Passenger: ${normalized.passengerName}`
    : '';
  const flightLine = normalized.flightNumber
    ? `Flight number: ${normalized.flightNumber}`
    : '';
  const dateLine = formatDate(normalized.flightDate)
    ? `Flight date: ${formatDate(normalized.flightDate)}`
    : '';
  const routeLine = normalized.route ? `Route: ${normalized.route}` : '';
  const referenceLines = [
    passengerLine,
    flightLine,
    dateLine,
    routeLine,
  ].filter(Boolean);
  const subjectLine = buildSubjectLine(normalized);
  const evidenceChecklist = buildEvidenceChecklist(normalized);
  const claimPlan = buildClaimPlan(normalized);
  const body =
    normalized.tone === 'concise'
      ? [
          `Dear ${airline} Customer Relations,`,
          '',
          buildOpening(normalized),
          buildDetailsParagraph(normalized),
          buildClosing(normalized),
          '',
          'Sincerely,',
          normalized.passengerName || '[Your name]',
        ]
      : [
          `Dear ${airline} Customer Relations,`,
          '',
          buildOpening(normalized),
          '',
          referenceLines.length > 0 ? referenceLines.join('\n') : '',
          '',
          buildDetailsParagraph(normalized),
          '',
          buildClosing(normalized),
          '',
          'Sincerely,',
          normalized.passengerName || '[Your name]',
        ];

  return {
    subjectLine,
    letter: compactLetterLines(body),
    evidenceChecklist,
    claimPlan,
  };
}

export function downloadText(result: GeneratedClaim) {
  return [
    `Subject: ${result.subjectLine}`,
    '',
    'Claim plan:',
    ...result.claimPlan.map((item) => `- ${item.label}: ${item.detail}`),
    '',
    'Evidence checklist:',
    ...result.evidenceChecklist.map((item) => `- ${item}`),
    '',
    'Claim letter:',
    '',
    result.letter,
  ].join('\n');
}
