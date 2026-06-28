'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/analytics';
import { FileText, RotateCcw } from 'lucide-react';

import { ToolResult } from '@/shared/components/tools';
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

import {
  downloadText,
  emptyForm,
  generateClaim,
  issueLabels,
  outcomeLabels,
  toneLabels,
  validateClaimForm,
  type DesiredOutcome,
  type FieldErrors,
  type FormState,
  type GeneratedClaim,
  type IssueType,
  type Tone,
} from './airline-refund-claim-letter-generator.logic';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-destructive text-sm">
      {message}
    </p>
  );
}

export function AirlineRefundClaimLetterGenerator({
  toolSlug,
}: {
  toolSlug: string;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<GeneratedClaim | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
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
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }

    const validation = validateClaimForm(form);

    if (validation.message) {
      setResult(null);
      setFieldErrors(validation.fieldErrors);
      setFormError(validation.message);
      setEmptyState(
        'Fix the highlighted fields, then generate a claim letter.'
      );
      return;
    }

    const nextResult = generateClaim(form);
    setResult(nextResult);
    setFieldErrors({});
    setFormError('');

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      issue_type: form.issueType,
      desired_outcome: form.desiredOutcome,
      tone: form.tone,
      has_passenger_name: Boolean(form.passengerName.trim()),
      has_flight_number: Boolean(form.flightNumber.trim()),
      has_route: Boolean(form.route.trim()),
      extra_detail_length: form.extraDetails.trim().length,
      evidence_item_count: nextResult.evidenceChecklist.length,
      letter_character_count: nextResult.letter.length,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setFieldErrors({});
    setFormError('');
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
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
              >
                {formError}
              </div>
            ) : null}

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
                  aria-invalid={Boolean(fieldErrors.airlineName)}
                  aria-describedby={
                    fieldErrors.airlineName ? 'airline-name-error' : undefined
                  }
                />
                <FieldError
                  id="airline-name-error"
                  message={fieldErrors.airlineName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passenger-name">
                  Passenger name (optional)
                </Label>
                <Input
                  id="passenger-name"
                  value={form.passengerName}
                  onChange={(event) =>
                    updateField('passengerName', event.target.value)
                  }
                  placeholder="Alex Chen"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.passengerName)}
                  aria-describedby={
                    fieldErrors.passengerName
                      ? 'passenger-name-error'
                      : undefined
                  }
                />
                <FieldError
                  id="passenger-name-error"
                  message={fieldErrors.passengerName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flight-number">Flight number (optional)</Label>
                <Input
                  id="flight-number"
                  value={form.flightNumber}
                  onChange={(event) =>
                    updateField('flightNumber', event.target.value)
                  }
                  placeholder="EA123"
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.flightNumber)}
                  aria-describedby={
                    fieldErrors.flightNumber ? 'flight-number-error' : undefined
                  }
                />
                <FieldError
                  id="flight-number-error"
                  message={fieldErrors.flightNumber}
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
                  aria-invalid={Boolean(fieldErrors.flightDate)}
                  aria-describedby={
                    fieldErrors.flightDate ? 'flight-date-error' : undefined
                  }
                />
                <FieldError
                  id="flight-date-error"
                  message={fieldErrors.flightDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="route">Route (optional)</Label>
                <Input
                  id="route"
                  value={form.route}
                  onChange={(event) => updateField('route', event.target.value)}
                  placeholder="JFK to LAX"
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.route)}
                  aria-describedby={
                    fieldErrors.route ? 'route-error' : undefined
                  }
                />
                <FieldError id="route-error" message={fieldErrors.route} />
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
                aria-invalid={Boolean(fieldErrors.extraDetails)}
                aria-describedby={
                  fieldErrors.extraDetails ? 'extra-details-error' : undefined
                }
              />
              <FieldError
                id="extra-details-error"
                message={fieldErrors.extraDetails}
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
        copyLabel="Copy letter"
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
