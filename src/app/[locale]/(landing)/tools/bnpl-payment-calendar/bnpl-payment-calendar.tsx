'use client';

import { FormEvent, useRef, useState } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';

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

type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

interface FormState {
  purchaseAmount: string;
  firstPaymentDate: string;
  numberOfPayments: string;
  paymentFrequency: PaymentFrequency;
  merchantName: string;
  note: string;
}

interface PaymentRow {
  number: number;
  dueDate: Date;
  amountCents: number;
  merchantName: string;
  note: string;
}

interface PaymentScheduleResult {
  totalAmountCents: number;
  amountPerPaymentLabel: string;
  numberOfPayments: number;
  paymentFrequency: PaymentFrequency;
  merchantName: string;
  note: string;
  rows: PaymentRow[];
  nextPayments: PaymentRow[];
}

const emptyForm: FormState = {
  purchaseAmount: '',
  firstPaymentDate: '',
  numberOfPayments: '4',
  paymentFrequency: 'biweekly',
  merchantName: '',
  note: '',
};

const frequencyLabels: Record<PaymentFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
};

function parseAmountCents(value: string) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.round(parsed * 100);
}

function parsePaymentCount(value: string) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const originalDay = date.getDate();
  const next = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0
  ).getDate();

  next.setDate(Math.min(originalDay, lastDay));
  return next;
}

function getPaymentDate(
  firstPaymentDate: Date,
  index: number,
  frequency: PaymentFrequency
) {
  if (frequency === 'weekly') {
    return addDays(firstPaymentDate, index * 7);
  }

  if (frequency === 'biweekly') {
    return addDays(firstPaymentDate, index * 14);
  }

  return addMonths(firstPaymentDate, index);
}

function buildAmounts(totalAmountCents: number, numberOfPayments: number) {
  const baseAmount = Math.floor(totalAmountCents / numberOfPayments);
  const remainder = totalAmountCents % numberOfPayments;

  return Array.from({ length: numberOfPayments }, (_, index) =>
    index < remainder ? baseAmount + 1 : baseAmount
  );
}

function buildAmountPerPaymentLabel(amounts: number[]) {
  const uniqueAmounts = Array.from(new Set(amounts));

  if (uniqueAmounts.length === 1) {
    return `${formatCurrencyFromCents(uniqueAmounts[0])} each`;
  }

  const min = Math.min(...uniqueAmounts);
  const max = Math.max(...uniqueAmounts);

  return `${formatCurrencyFromCents(min)}-${formatCurrencyFromCents(
    max
  )} each`;
}

function buildSchedule(form: FormState): PaymentScheduleResult | null {
  const totalAmountCents = parseAmountCents(form.purchaseAmount);
  const numberOfPayments = parsePaymentCount(form.numberOfPayments);
  const firstPaymentDate = parseDate(form.firstPaymentDate);

  if (!totalAmountCents || !numberOfPayments || !firstPaymentDate) {
    return null;
  }

  const amounts = buildAmounts(totalAmountCents, numberOfPayments);
  const merchantName = form.merchantName.trim();
  const note = form.note.trim();
  const rows = amounts.map((amountCents, index) => ({
    number: index + 1,
    dueDate: getPaymentDate(
      firstPaymentDate,
      index,
      form.paymentFrequency
    ),
    amountCents,
    merchantName,
    note,
  }));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextPayments = rows
    .filter((row) => row.dueDate >= today)
    .slice(0, 3);

  return {
    totalAmountCents,
    amountPerPaymentLabel: buildAmountPerPaymentLabel(amounts),
    numberOfPayments,
    paymentFrequency: form.paymentFrequency,
    merchantName,
    note,
    rows,
    nextPayments,
  };
}

function checklistText(result: PaymentScheduleResult) {
  const title = result.merchantName
    ? `BNPL payment checklist for ${result.merchantName}`
    : 'BNPL payment checklist';
  const lines = [
    title,
    '',
    `Total amount: ${formatCurrencyFromCents(result.totalAmountCents)}`,
    `Amount per payment: ${result.amountPerPaymentLabel}`,
    `Frequency: ${frequencyLabels[result.paymentFrequency]}`,
    `Payments: ${result.numberOfPayments}`,
  ];

  if (result.note) {
    lines.push(`Note: ${result.note}`);
  }

  lines.push('', 'Checklist:');
  result.rows.forEach((row) => {
    lines.push(
      `[ ] Payment ${row.number}: ${formatCurrencyFromCents(
        row.amountCents
      )} due ${formatDisplayDate(row.dueDate)}`
    );
  });

  return lines.join('\n');
}

function csvEscape(value: string | number) {
  const stringValue = String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function scheduleCsv(result: PaymentScheduleResult) {
  const rows = [
    ['Payment', 'Due Date', 'Amount', 'Merchant', 'Note'],
    ...result.rows.map((row) => [
      row.number,
      formatIsoDate(row.dueDate),
      (row.amountCents / 100).toFixed(2),
      row.merchantName,
      row.note,
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => csvEscape(cell)).join(','))
    .join('\n');
}

export function BNPLPaymentCalendar({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<PaymentScheduleResult | null>(null);
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
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }

    const nextResult = buildSchedule(form);

    if (!nextResult) {
      setResult(null);
      setEmptyState(
        'Purchase amount, first payment date, and number of payments are required.'
      );
      return;
    }

    setResult(nextResult);
    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      purchase_amount: Number((nextResult.totalAmountCents / 100).toFixed(2)),
      number_of_payments: nextResult.numberOfPayments,
      payment_frequency: nextResult.paymentFrequency,
      has_merchant_name: Boolean(nextResult.merchantName),
      has_note: Boolean(nextResult.note),
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bnpl-purchase-amount">Purchase amount</Label>
                <div className="relative">
                  <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
                    $
                  </span>
                  <Input
                    id="bnpl-purchase-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.purchaseAmount}
                    onChange={(event) =>
                      updateField('purchaseAmount', event.target.value)
                    }
                    placeholder="240"
                    className="pl-7"
                    required
                  />
                </div>
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
                  required
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
                  step="1"
                  inputMode="numeric"
                  value={form.numberOfPayments}
                  onChange={(event) =>
                    updateField('numberOfPayments', event.target.value)
                  }
                  placeholder="4"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnpl-payment-frequency">Payment frequency</Label>
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
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bnpl-merchant-name">
                  Merchant name optional
                </Label>
                <Input
                  id="bnpl-merchant-name"
                  value={form.merchantName}
                  onChange={(event) =>
                    updateField('merchantName', event.target.value)
                  }
                  placeholder="Store name"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bnpl-note">Note optional</Label>
              <Textarea
                id="bnpl-note"
                value={form.note}
                onChange={(event) => updateField('note', event.target.value)}
                placeholder="Add an order number, card used, reminder note, or payoff goal."
                className="min-h-24"
              />
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
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Amount per payment"
                value={result.amountPerPaymentLabel}
              />
              <MetricCard
                label="Total amount"
                value={formatCurrencyFromCents(result.totalAmountCents)}
              />
              <MetricCard
                label="Next dates"
                value={
                  result.nextPayments.length > 0
                    ? result.nextPayments
                        .map((row) => formatDisplayDate(row.dueDate))
                        .join(', ')
                    : 'No upcoming payments'
                }
              />
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
      <div className="mt-2 text-base font-semibold leading-6">{value}</div>
    </div>
  );
}
