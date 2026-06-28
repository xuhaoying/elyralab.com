'use client';

import { FormEvent, useRef, useState } from 'react';
import { FileText, RotateCcw } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { ToolResult } from '@/shared/components/tools';

type IssueType =
  | 'cancelled'
  | 'delayed'
  | 'denied boarding'
  | 'refund refused'
  | 'schedule changed';
type DesiredOutcome = 'refund' | 'compensation' | 'voucher' | 'rebooking';
type Tone = 'polite' | 'firm' | 'concise';

interface FormState {
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

interface GeneratedClaim {
  subjectLine: string;
  letter: string;
  evidenceChecklist: string[];
}

const emptyForm: FormState = {
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

const issueLabels: Record<IssueType, string> = {
  cancelled: 'Cancelled flight',
  delayed: 'Delayed flight',
  'denied boarding': 'Denied boarding',
  'refund refused': 'Refund refused',
  'schedule changed': 'Schedule changed',
};

const outcomeLabels: Record<DesiredOutcome, string> = {
  refund: 'Refund',
  compensation: 'Compensation',
  voucher: 'Voucher',
  rebooking: 'Rebooking',
};

const toneLabels: Record<Tone, string> = {
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

function formatDate(value: string) {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function buildFlightReference(form: FormState) {
  const details = [
    form.flightNumber.trim() ? `flight ${form.flightNumber.trim()}` : 'my flight',
    formatDate(form.flightDate) ? `on ${formatDate(form.flightDate)}` : '',
    form.route.trim() ? `for ${form.route.trim()}` : '',
  ].filter(Boolean);

  return details.join(' ');
}

function buildSubjectLine(form: FormState) {
  const issue = issueLabels[form.issueType];
  const outcome = outcomeLabels[form.desiredOutcome].toLowerCase();
  const flight = form.flightNumber.trim()
    ? ` - ${form.flightNumber.trim()}`
    : '';
  const date = formatDate(form.flightDate);

  return `${issue} ${outcome} request${flight}${date ? ` on ${date}` : ''}`;
}

function buildEvidenceChecklist(form: FormState) {
  const checklist = [
    'Booking confirmation or ticket receipt',
    'Boarding pass or check-in confirmation, if available',
    'Any airline notice about the disruption',
    'Screenshots or emails showing the flight status and timeline',
    'Receipts for extra costs caused by the disruption',
  ];

  if (form.issueType === 'refund refused') {
    checklist.push('Copy of the refund denial or customer service response');
  }

  if (form.issueType === 'denied boarding') {
    checklist.push('Gate agent note, denied boarding form, or written explanation');
  }

  if (form.issueType === 'schedule changed') {
    checklist.push('Original itinerary and updated itinerary showing the change');
  }

  if (form.desiredOutcome === 'refund') {
    checklist.push('Payment receipt showing the original fare and fees');
  }

  return checklist;
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
  const details = form.extraDetails.trim();

  if (!details) {
    return 'Please review the booking record, disruption details, and the supporting evidence I can provide. If you need additional information, please let me know what documentation is required.';
  }

  return `Additional details: ${details}`;
}

function buildClosing(form: FormState) {
  if (form.tone === 'concise') {
    return 'Please confirm the next steps and expected resolution timeline.';
  }

  if (form.tone === 'firm') {
    return 'Please confirm receipt of this claim and provide a written response with the proposed resolution and timeline. If this cannot be resolved directly, please explain the reason in writing.';
  }

  return 'Please confirm receipt of this request and let me know the expected timeline for review. Thank you for your assistance.';
}

function generateClaim(form: FormState): GeneratedClaim {
  const airline = form.airlineName.trim() || 'the airline';
  const passengerLine = form.passengerName.trim()
    ? `Passenger: ${form.passengerName.trim()}`
    : '';
  const flightLine = form.flightNumber.trim()
    ? `Flight number: ${form.flightNumber.trim()}`
    : '';
  const dateLine = formatDate(form.flightDate)
    ? `Flight date: ${formatDate(form.flightDate)}`
    : '';
  const routeLine = form.route.trim() ? `Route: ${form.route.trim()}` : '';
  const referenceLines = [passengerLine, flightLine, dateLine, routeLine].filter(
    Boolean
  );
  const subjectLine = buildSubjectLine(form);
  const evidenceChecklist = buildEvidenceChecklist(form);
  const body =
    form.tone === 'concise'
      ? [
          `Dear ${airline} Customer Relations,`,
          '',
          buildOpening(form),
          buildDetailsParagraph(form),
          buildClosing(form),
          '',
          'Sincerely,',
          form.passengerName.trim() || '[Your name]',
        ]
      : [
          `Dear ${airline} Customer Relations,`,
          '',
          buildOpening(form),
          '',
          referenceLines.length > 0 ? referenceLines.join('\n') : '',
          '',
          buildDetailsParagraph(form),
          '',
          buildClosing(form),
          '',
          'Sincerely,',
          form.passengerName.trim() || '[Your name]',
        ];

  return {
    subjectLine,
    letter: body.filter((line, index, lines) => {
      if (line !== '') {
        return true;
      }

      return lines[index - 1] !== '' && lines[index + 1] !== '';
    }).join('\n'),
    evidenceChecklist,
  };
}

function downloadText(result: GeneratedClaim) {
  return [
    `Subject: ${result.subjectLine}`,
    '',
    'Evidence checklist:',
    ...result.evidenceChecklist.map((item) => `- ${item}`),
    '',
    'Claim letter:',
    '',
    result.letter,
  ].join('\n');
}

export function AirlineRefundClaimLetterGenerator({
  toolSlug,
}: {
  toolSlug: string;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<GeneratedClaim | null>(null);
  const [emptyState, setEmptyState] = useState(
    'Enter flight details, then generate a claim letter.'
  );
  const startedRef = useRef(false);

  function updateField<Field extends keyof FormState>(
    field: Field,
    value: FormState[Field]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }

    if (!form.airlineName.trim() || !form.flightDate) {
      setResult(null);
      setEmptyState('Airline name and flight date are required.');
      return;
    }

    const nextResult = generateClaim(form);
    setResult(nextResult);

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      issue_type: form.issueType,
      desired_outcome: form.desiredOutcome,
      tone: form.tone,
      has_passenger_name: Boolean(form.passengerName.trim()),
      has_flight_number: Boolean(form.flightNumber.trim()),
      has_route: Boolean(form.route.trim()),
      evidence_item_count: nextResult.evidenceChecklist.length,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setEmptyState('Enter flight details, then generate a claim letter.');
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Claim details</CardTitle>
          <CardDescription>
            This v1 generator uses templates only. It does not call an AI API or
            save your flight details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="airline-name">Airline name</Label>
                <Input
                  id="airline-name"
                  value={form.airlineName}
                  onChange={(event) =>
                    updateField('airlineName', event.target.value)
                  }
                  placeholder="Example Airways"
                  autoComplete="organization"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passenger-name">Passenger name optional</Label>
                <Input
                  id="passenger-name"
                  value={form.passengerName}
                  onChange={(event) =>
                    updateField('passengerName', event.target.value)
                  }
                  placeholder="Alex Chen"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight-number">Flight number optional</Label>
                <Input
                  id="flight-number"
                  value={form.flightNumber}
                  onChange={(event) =>
                    updateField('flightNumber', event.target.value)
                  }
                  placeholder="EA123"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight-date">Flight date</Label>
                <Input
                  id="flight-date"
                  type="date"
                  value={form.flightDate}
                  onChange={(event) =>
                    updateField('flightDate', event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route">Route optional</Label>
                <Input
                  id="route"
                  value={form.route}
                  onChange={(event) => updateField('route', event.target.value)}
                  placeholder="JFK to LAX"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue-type">Issue type</Label>
                <Select
                  value={form.issueType}
                  onValueChange={(value) =>
                    updateField('issueType', value as IssueType)
                  }
                >
                  <SelectTrigger id="issue-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(issueLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desired-outcome">Desired outcome</Label>
                <Select
                  value={form.desiredOutcome}
                  onValueChange={(value) =>
                    updateField('desiredOutcome', value as DesiredOutcome)
                  }
                >
                  <SelectTrigger id="desired-outcome" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(outcomeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={form.tone}
                  onValueChange={(value) => updateField('tone', value as Tone)}
                >
                  <SelectTrigger id="tone" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(toneLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra-details">Extra details</Label>
              <Textarea
                id="extra-details"
                value={form.extraDetails}
                onChange={(event) =>
                  updateField('extraDetails', event.target.value)
                }
                placeholder="Add what happened, wait times, customer service responses, expenses, booking reference, or refund denial details."
                className="min-h-32"
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <FileText className="size-4" />
                Generate letter
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToolResult
        title="Generated claim letter"
        description="Copy the letter or download the full package with the subject line and evidence checklist."
        result={result?.letter || ''}
        downloadText={result ? downloadText(result) : ''}
        emptyState={emptyState}
        filename="airline-refund-claim-letter.txt"
        toolSlug={toolSlug}
      >
        {result ? (
          <div className="space-y-5" aria-live="polite">
            <div className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Suggested subject line</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {result.subjectLine}
              </p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Evidence checklist</h3>
              <ul className="text-muted-foreground mt-3 space-y-2 text-sm leading-6">
                {result.evidenceChecklist.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true">-</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </ToolResult>
    </div>
  );
}
