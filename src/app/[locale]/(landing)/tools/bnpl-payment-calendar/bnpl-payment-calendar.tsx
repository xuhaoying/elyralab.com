'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/analytics';
import { CalendarDays, RotateCcw } from 'lucide-react';

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
  buildSchedule,
  checklistText,
  emptyForm,
  formatCurrencyFromCents,
  formatDisplayDate,
  frequencyLabels,
  scheduleCsv,
  validateBnplForm,
  type FieldErrors,
  type FormState,
  type PaymentFrequency,
  type PaymentScheduleResult,
} from './bnpl-payment-calendar.logic';

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

export function BNPLPaymentCalendar({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<PaymentScheduleResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [emptyState, setEmptyState] = useState(
    'Enter purchase details, then generate a payment calendar.'
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

    const validation = validateBnplForm(form);

    if (validation.message) {
      setResult(null);
      setFieldErrors(validation.fieldErrors);
      setFormError(validation.message);
      setEmptyState('Fix the highlighted fields, then generate a schedule.');
      return;
    }

    const nextResult = buildSchedule(form);

    if (!nextResult) {
      setResult(null);
      setFieldErrors({});
      setFormError('Enter purchase amount, first date, and payment count.');
      setEmptyState('Enter purchase amount, first date, and payment count.');
      return;
    }

    setResult(nextResult);
    setFieldErrors({});
    setFormError('');

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      purchase_amount: Number((nextResult.totalAmountCents / 100).toFixed(2)),
      number_of_payments: nextResult.numberOfPayments,
      payment_frequency: nextResult.paymentFrequency,
      has_merchant_name: Boolean(nextResult.merchantName),
      has_note: Boolean(nextResult.note),
      next_payment_count: nextResult.nextPayments.length,
      missed_payment_count: nextResult.missedPayments.length,
      peak_month_total: Number(
        (nextResult.peakMonth.totalAmountCents / 100).toFixed(2)
      ),
      warning_count: nextResult.warnings.length,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setFieldErrors({});
    setFormError('');
    setEmptyState('Enter purchase details, then generate a payment calendar.');
  }

  const copiedChecklist = result ? checklistText(result) : '';
  const downloadedCsv = result ? scheduleCsv(result) : '';

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Payment plan details</CardTitle>
          <CardDescription>
            Build a simple installment schedule. This tool does not connect to
            your BNPL provider.
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
                <Label htmlFor="bnpl-purchase-amount">Purchase amount</Label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                    $
                  </span>
                  <Input
                    id="bnpl-purchase-amount"
                    type="text"
                    inputMode="decimal"
                    value={form.purchaseAmount}
                    onChange={(event) =>
                      updateField('purchaseAmount', event.target.value)
                    }
                    placeholder="240"
                    className="pl-7"
                    aria-invalid={Boolean(fieldErrors.purchaseAmount)}
                    aria-describedby={
                      fieldErrors.purchaseAmount
                        ? 'bnpl-purchase-amount-error'
                        : undefined
                    }
                  />
                </div>
                <FieldError
                  id="bnpl-purchase-amount-error"
                  message={fieldErrors.purchaseAmount}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnpl-first-payment-date">
                  First payment date
                </Label>
                <Input
                  id="bnpl-first-payment-date"
                  type="date"
                  value={form.firstPaymentDate}
                  onChange={(event) =>
                    updateField('firstPaymentDate', event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.firstPaymentDate)}
                  aria-describedby={
                    fieldErrors.firstPaymentDate
                      ? 'bnpl-first-payment-date-error'
                      : undefined
                  }
                />
                <FieldError
                  id="bnpl-first-payment-date-error"
                  message={fieldErrors.firstPaymentDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnpl-number-of-payments">
                  Number of payments
                </Label>
                <Input
                  id="bnpl-number-of-payments"
                  type="number"
                  min="1"
                  max="60"
                  step="1"
                  inputMode="numeric"
                  value={form.numberOfPayments}
                  onChange={(event) =>
                    updateField('numberOfPayments', event.target.value)
                  }
                  placeholder="4"
                  aria-invalid={Boolean(fieldErrors.numberOfPayments)}
                  aria-describedby={
                    fieldErrors.numberOfPayments
                      ? 'bnpl-number-of-payments-error'
                      : undefined
                  }
                />
                <FieldError
                  id="bnpl-number-of-payments-error"
                  message={fieldErrors.numberOfPayments}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnpl-payment-frequency">
                  Payment frequency
                </Label>
                <Select
                  value={form.paymentFrequency}
                  onValueChange={(value) =>
                    updateField('paymentFrequency', value as PaymentFrequency)
                  }
                >
                  <SelectTrigger id="bnpl-payment-frequency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frequencyLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnpl-merchant-name">
                  Merchant name (optional)
                </Label>
                <Input
                  id="bnpl-merchant-name"
                  value={form.merchantName}
                  onChange={(event) =>
                    updateField('merchantName', event.target.value)
                  }
                  placeholder="Store name"
                  autoComplete="organization"
                  aria-invalid={Boolean(fieldErrors.merchantName)}
                  aria-describedby={
                    fieldErrors.merchantName
                      ? 'bnpl-merchant-name-error'
                      : undefined
                  }
                />
                <FieldError
                  id="bnpl-merchant-name-error"
                  message={fieldErrors.merchantName}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bnpl-note">Note (optional)</Label>
              <Textarea
                id="bnpl-note"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Add an order number, card used, reminder note, or payoff goal."
                className="min-h-24"
                aria-invalid={Boolean(fieldErrors.note)}
                aria-describedby={
                  fieldErrors.note ? 'bnpl-note-error' : undefined
                }
              />
              <FieldError id="bnpl-note-error" message={fieldErrors.note} />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <CalendarDays className="size-4" />
                Generate schedule
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToolResult
        title="BNPL payment schedule"
        description="Copy the checklist or download the schedule as CSV."
        result={copiedChecklist}
        downloadText={downloadedCsv}
        emptyState={emptyState}
        filename="bnpl-payment-calendar.csv"
        toolSlug={toolSlug}
        copyLabel="Copy checklist"
      >
        {result ? (
          <div className="space-y-5" aria-live="polite">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Amount per payment"
                value={result.amountPerPaymentLabel}
              />
              <MetricCard
                label="Total amount"
                value={formatCurrencyFromCents(result.totalAmountCents)}
              />
              <MetricCard
                label="Final payment"
                value={formatDisplayDate(result.finalPaymentDate)}
              />
              <MetricCard
                label="Peak month"
                value={`${result.peakMonth.label}: ${formatCurrencyFromCents(
                  result.peakMonth.totalAmountCents
                )}`}
              />
            </div>

            <div className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Plain-English summary</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {result.summary}
              </p>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Next payments</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {result.nextPayments.length > 0
                  ? result.nextPayments
                      .map(
                        (row) =>
                          `${formatDisplayDate(row.dueDate)} (${formatCurrencyFromCents(
                            row.amountCents
                          )})`
                      )
                      .join(', ')
                  : 'No upcoming payments based on the selected dates.'}
              </p>
            </div>

            {result.warnings.length > 0 ? (
              <div className="rounded-md border border-amber-300/50 bg-amber-50/70 p-4 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                <h3 className="text-sm font-semibold">Cash flow notes</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Monthly cash flow</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Month</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Payments
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.monthlyTotals.map((month) => (
                      <tr key={month.monthKey} className="border-t">
                        <td className="px-4 py-3">{month.label}</td>
                        <td className="px-4 py-3 text-right">
                          {month.paymentCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrencyFromCents(month.totalAmountCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Payment schedule</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[620px] text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Payment</th>
                      <th className="px-4 py-3 font-medium">Due date</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-3 font-medium">Merchant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={row.number} className="border-t">
                        <td className="px-4 py-3">{row.number}</td>
                        <td className="px-4 py-3">
                          {formatDisplayDate(row.dueDate)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrencyFromCents(row.amountCents)}
                        </td>
                        <td className="text-muted-foreground px-4 py-3">
                          {row.merchantName || '-'}
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
      <div className="mt-2 text-base leading-6 font-semibold">{value}</div>
    </div>
  );
}
