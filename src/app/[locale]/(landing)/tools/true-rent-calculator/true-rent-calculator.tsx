'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/analytics';
import { Calculator, RotateCcw } from 'lucide-react';

import { ToolResult } from '@/shared/components/tools';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';

import {
  buildRentResult,
  emptyForm,
  formatCurrency,
  getEnteredFeeCounts,
  hasAnyAmount,
  monthlyFields,
  oneTimeFields,
  resultCsv,
  resultText,
  validateRentForm,
  type FieldErrors,
  type FormState,
  type RentResult,
} from './true-rent-calculator.logic';

function CurrencyField({
  id,
  label,
  value,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
          $
        </span>
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pl-7"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TrueRentCalculator({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<RentResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [emptyState, setEmptyState] = useState(
    'Enter rent and fees, then generate your estimate.'
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
      if (!current[field]) {
        return current;
      }

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

    const validation = validateRentForm(form);

    if (validation.message) {
      setResult(null);
      setFieldErrors(validation.fieldErrors);
      setFormError(validation.message);
      setEmptyState('Fix the highlighted fields, then generate your estimate.');
      return;
    }

    if (!hasAnyAmount(form)) {
      setResult(null);
      setFieldErrors({});
      setFormError(
        'Enter at least one rent or fee amount to generate an estimate.'
      );
      setEmptyState(
        'Enter at least one rent or fee amount to generate an estimate.'
      );
      return;
    }

    const nextResult = buildRentResult(form);
    setResult(nextResult);
    setFieldErrors({});
    setFormError('');

    const feeCounts = getEnteredFeeCounts(form);
    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      lease_length_months: nextResult.leaseLengthMonths,
      true_monthly_rent: Number(nextResult.trueMonthlyRent.toFixed(2)),
      total_lease_cost: Number(nextResult.totalLeaseCost.toFixed(2)),
      monthly_fee_count: feeCounts.monthlyFeeCount,
      one_time_fee_count: feeCounts.oneTimeFeeCount,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setFieldErrors({});
    setFormError('');
    setEmptyState('Enter rent and fees, then generate your estimate.');
  }

  const textResult = result ? resultText(result) : '';
  const csvResult = result ? resultCsv(result) : '';

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Rent details</CardTitle>
          <CardDescription>
            Enter monthly charges and move-in costs. Leave fields blank when
            they do not apply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
              >
                {formError}
              </div>
            ) : null}

            <section className="space-y-4" aria-labelledby="monthly-costs">
              <div className="space-y-1">
                <h2 id="monthly-costs" className="text-base font-semibold">
                  Monthly costs
                </h2>
                <p className="text-muted-foreground text-sm">
                  Recurring charges paid every month.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {monthlyFields.map((field) => (
                  <CurrencyField
                    key={field.key}
                    id={`true-rent-${field.key}`}
                    label={field.label}
                    value={form[field.key]}
                    placeholder={field.placeholder}
                    error={fieldErrors[field.key]}
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4" aria-labelledby="move-in-costs">
              <div className="space-y-1">
                <h2 id="move-in-costs" className="text-base font-semibold">
                  Move-in costs
                </h2>
                <p className="text-muted-foreground text-sm">
                  One-time cash due before or during the first month.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {oneTimeFields.map((field) => (
                  <CurrencyField
                    key={field.key}
                    id={`true-rent-${field.key}`}
                    label={field.label}
                    value={form[field.key]}
                    placeholder={field.placeholder}
                    error={fieldErrors[field.key]}
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}
                <div className="space-y-2">
                  <Label htmlFor="true-rent-leaseLengthMonths">
                    Lease length in months
                  </Label>
                  <Input
                    id="true-rent-leaseLengthMonths"
                    type="text"
                    inputMode="numeric"
                    value={form.leaseLengthMonths}
                    onChange={(event) =>
                      updateField('leaseLengthMonths', event.target.value)
                    }
                    placeholder="12"
                    aria-invalid={Boolean(fieldErrors.leaseLengthMonths)}
                    aria-describedby={
                      fieldErrors.leaseLengthMonths
                        ? 'true-rent-leaseLengthMonths-error'
                        : undefined
                    }
                  />
                  {fieldErrors.leaseLengthMonths ? (
                    <p
                      id="true-rent-leaseLengthMonths-error"
                      className="text-destructive text-sm"
                    >
                      {fieldErrors.leaseLengthMonths}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-md border p-3">
                <Checkbox
                  id="true-rent-securityDepositRefundable"
                  checked={form.securityDepositRefundable}
                  onCheckedChange={(checked) =>
                    updateField('securityDepositRefundable', checked === true)
                  }
                  aria-describedby="true-rent-securityDepositRefundable-help"
                />
                <div className="space-y-1">
                  <Label htmlFor="true-rent-securityDepositRefundable">
                    Treat security deposit as refundable
                  </Label>
                  <p
                    id="true-rent-securityDepositRefundable-help"
                    className="text-muted-foreground text-sm leading-6"
                  >
                    Refundable deposits still count toward first-month cash
                    needed, but are excluded from net lease cost.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <Calculator className="size-4" />
                Generate estimate
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToolResult
        title="True rent estimate"
        description="Copy the text summary or download the full breakdown as CSV."
        result={textResult}
        downloadText={csvResult}
        emptyState={emptyState}
        filename="true-rent-calculator.csv"
        toolSlug={toolSlug}
      >
        {result ? (
          <div className="space-y-5" aria-live="polite">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MetricCard
                label="True monthly rent"
                value={formatCurrency(result.trueMonthlyRent)}
              />
              <MetricCard
                label="First-month total"
                value={formatCurrency(result.firstMonthTotalCost)}
              />
              <MetricCard
                label="Net lease cost"
                value={formatCurrency(result.totalLeaseCost)}
              />
              <MetricCard
                label="Annualized housing cost"
                value={formatCurrency(result.annualizedHousingCost)}
              />
              <MetricCard
                label="Cash before refunds"
                value={formatCurrency(result.cashRequiredBeforeRefunds)}
              />
            </div>

            <div className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Plain-English summary</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {result.summary}
              </p>
              <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm">
                {result.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Fee breakdown</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Fee</th>
                      <th className="px-4 py-3 font-medium">Cadence</th>
                      <th className="px-4 py-3 font-medium">Treatment</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        First month
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Net lease impact
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.label} className="border-t">
                        <td className="px-4 py-3">{row.label}</td>
                        <td className="text-muted-foreground px-4 py-3">
                          {row.cadence}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {row.treatment}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(row.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(row.firstMonthImpact)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(row.leaseImpact)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </ToolResult>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
