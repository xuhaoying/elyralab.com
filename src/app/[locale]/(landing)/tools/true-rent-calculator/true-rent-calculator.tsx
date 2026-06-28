'use client';

import { FormEvent, useRef, useState } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';

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
import { ToolResult } from '@/shared/components/tools';

interface FormState {
  baseMonthlyRent: string;
  utilities: string;
  internet: string;
  parking: string;
  petRent: string;
  trashFee: string;
  adminFee: string;
  otherMonthlyFees: string;
  applicationFee: string;
  moveInFee: string;
  securityDeposit: string;
  leaseLengthMonths: string;
}

interface BreakdownRow {
  label: string;
  cadence: 'Monthly' | 'One-time';
  amount: number;
  firstMonthImpact: number;
  leaseImpact: number;
}

interface RentResult {
  leaseLengthMonths: number;
  monthlyRecurringTotal: number;
  oneTimeTotal: number;
  trueMonthlyRent: number;
  firstMonthTotalCost: number;
  totalLeaseCost: number;
  annualizedHousingCost: number;
  summary: string;
  rows: BreakdownRow[];
}

const emptyForm: FormState = {
  baseMonthlyRent: '',
  utilities: '',
  internet: '',
  parking: '',
  petRent: '',
  trashFee: '',
  adminFee: '',
  otherMonthlyFees: '',
  applicationFee: '',
  moveInFee: '',
  securityDeposit: '',
  leaseLengthMonths: '12',
};

const monthlyFields: Array<{
  key: keyof FormState;
  label: string;
  placeholder: string;
}> = [
  {
    key: 'baseMonthlyRent',
    label: 'Base monthly rent',
    placeholder: '2200',
  },
  {
    key: 'utilities',
    label: 'Utilities',
    placeholder: '150',
  },
  {
    key: 'internet',
    label: 'Internet',
    placeholder: '60',
  },
  {
    key: 'parking',
    label: 'Parking',
    placeholder: '125',
  },
  {
    key: 'petRent',
    label: 'Pet rent',
    placeholder: '50',
  },
  {
    key: 'trashFee',
    label: 'Trash fee',
    placeholder: '25',
  },
  {
    key: 'adminFee',
    label: 'Admin fee',
    placeholder: '15',
  },
  {
    key: 'otherMonthlyFees',
    label: 'Other monthly fees',
    placeholder: '40',
  },
];

const oneTimeFields: Array<{
  key: keyof FormState;
  label: string;
  placeholder: string;
}> = [
  {
    key: 'applicationFee',
    label: 'Application fee',
    placeholder: '75',
  },
  {
    key: 'moveInFee',
    label: 'Move-in fee',
    placeholder: '350',
  },
  {
    key: 'securityDeposit',
    label: 'Security deposit',
    placeholder: '2200',
  },
];

function parseCurrency(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function parseLeaseLength(value: string) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 12;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function buildRow(
  label: string,
  cadence: BreakdownRow['cadence'],
  amount: number,
  leaseLengthMonths: number
): BreakdownRow {
  const isMonthly = cadence === 'Monthly';

  return {
    label,
    cadence,
    amount,
    firstMonthImpact: amount,
    leaseImpact: isMonthly ? amount * leaseLengthMonths : amount,
  };
}

function buildRentResult(form: FormState): RentResult {
  const leaseLengthMonths = parseLeaseLength(form.leaseLengthMonths);
  const monthlyRows = monthlyFields.map((field) =>
    buildRow(
      field.label,
      'Monthly',
      parseCurrency(form[field.key]),
      leaseLengthMonths
    )
  );
  const oneTimeRows = oneTimeFields.map((field) =>
    buildRow(
      field.label,
      'One-time',
      parseCurrency(form[field.key]),
      leaseLengthMonths
    )
  );
  const rows = [...monthlyRows, ...oneTimeRows];
  const monthlyRecurringTotal = monthlyRows.reduce(
    (total, row) => total + row.amount,
    0
  );
  const oneTimeTotal = oneTimeRows.reduce(
    (total, row) => total + row.amount,
    0
  );
  const totalLeaseCost =
    monthlyRecurringTotal * leaseLengthMonths + oneTimeTotal;
  const trueMonthlyRent = totalLeaseCost / leaseLengthMonths;
  const firstMonthTotalCost = monthlyRecurringTotal + oneTimeTotal;
  const annualizedHousingCost = trueMonthlyRent * 12;
  const amortizedOneTime = oneTimeTotal / leaseLengthMonths;

  const summary = `Your true monthly rent is ${formatCurrency(
    trueMonthlyRent
  )}. That combines ${formatCurrency(
    monthlyRecurringTotal
  )} in recurring monthly rent and fees with ${formatCurrency(
    amortizedOneTime
  )} in upfront costs spread across a ${leaseLengthMonths}-month lease. Your first-month cash need is ${formatCurrency(
    firstMonthTotalCost
  )}, total lease cost is ${formatCurrency(
    totalLeaseCost
  )}, and the annualized housing cost is ${formatCurrency(
    annualizedHousingCost
  )}. This treats the security deposit as cash required during the lease; if it is fully refunded, subtract it from the total cost.`;

  return {
    leaseLengthMonths,
    monthlyRecurringTotal,
    oneTimeTotal,
    trueMonthlyRent,
    firstMonthTotalCost,
    totalLeaseCost,
    annualizedHousingCost,
    summary,
    rows,
  };
}

function resultText(result: RentResult) {
  return [
    'True Rent Calculator result',
    '',
    `True monthly rent: ${formatCurrency(result.trueMonthlyRent)}`,
    `First-month total cost: ${formatCurrency(result.firstMonthTotalCost)}`,
    `Total lease cost: ${formatCurrency(result.totalLeaseCost)}`,
    `Annualized housing cost: ${formatCurrency(
      result.annualizedHousingCost
    )}`,
    `Lease length: ${result.leaseLengthMonths} months`,
    '',
    result.summary,
    '',
    'Fee breakdown:',
    ...result.rows.map(
      (row) =>
        `- ${row.label}: ${row.cadence}, ${formatCurrency(
          row.amount
        )}, first month ${formatCurrency(
          row.firstMonthImpact
        )}, lease total ${formatCurrency(row.leaseImpact)}`
    ),
  ].join('\n');
}

function csvEscape(value: string | number) {
  const stringValue = String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }

  return stringValue;
}

function resultCsv(result: RentResult) {
  const metricRows = [
    ['Metric', 'Amount'],
    ['True monthly rent', result.trueMonthlyRent.toFixed(2)],
    ['First-month total cost', result.firstMonthTotalCost.toFixed(2)],
    ['Total lease cost', result.totalLeaseCost.toFixed(2)],
    ['Annualized housing cost', result.annualizedHousingCost.toFixed(2)],
    ['Lease length months', result.leaseLengthMonths],
    ['Plain-English summary', result.summary],
    [],
    [
      'Fee',
      'Cadence',
      'Amount',
      'First-month impact',
      'Lease total',
    ],
    ...result.rows.map((row) => [
      row.label,
      row.cadence,
      row.amount.toFixed(2),
      row.firstMonthImpact.toFixed(2),
      row.leaseImpact.toFixed(2),
    ]),
  ];

  return metricRows
    .map((row) => row.map((cell) => csvEscape(cell)).join(','))
    .join('\n');
}

function hasAnyAmount(form: FormState) {
  return [...monthlyFields, ...oneTimeFields].some(
    (field) => parseCurrency(form[field.key]) > 0
  );
}

function CurrencyField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
          $
        </span>
        <Input
          id={id}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="pl-7"
        />
      </div>
    </div>
  );
}

export function TrueRentCalculator({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<RentResult | null>(null);
  const [emptyState, setEmptyState] = useState(
    'Enter rent and fees, then calculate your true rent.'
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

    if (!hasAnyAmount(form)) {
      setResult(null);
      setEmptyState('Enter at least one rent or fee amount to calculate.');
      return;
    }

    const nextResult = buildRentResult(form);
    setResult(nextResult);

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      lease_length_months: nextResult.leaseLengthMonths,
      true_monthly_rent: Number(nextResult.trueMonthlyRent.toFixed(2)),
      total_lease_cost: Number(nextResult.totalLeaseCost.toFixed(2)),
      monthly_fee_count: monthlyFields.filter(
        (field) => parseCurrency(form[field.key]) > 0
      ).length,
      one_time_fee_count: oneTimeFields.filter(
        (field) => parseCurrency(form[field.key]) > 0
      ).length,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setEmptyState('Enter rent and fees, then calculate your true rent.');
  }

  const textResult = result ? resultText(result) : '';
  const csvResult = result ? resultCsv(result) : '';

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Rent details</CardTitle>
          <CardDescription>
            Enter monthly charges and move-in costs. Leave fields blank when they
            do not apply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8" onSubmit={handleSubmit}>
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
                  One-time charges due before or during the first month.
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
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}
                <div className="space-y-2">
                  <Label htmlFor="true-rent-leaseLengthMonths">
                    Lease length in months
                  </Label>
                  <Input
                    id="true-rent-leaseLengthMonths"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={form.leaseLengthMonths}
                    onChange={(event) =>
                      updateField('leaseLengthMonths', event.target.value)
                    }
                    placeholder="12"
                  />
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
                Calculate true rent
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
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="True monthly rent"
                value={formatCurrency(result.trueMonthlyRent)}
              />
              <MetricCard
                label="First-month total"
                value={formatCurrency(result.firstMonthTotalCost)}
              />
              <MetricCard
                label="Total lease cost"
                value={formatCurrency(result.totalLeaseCost)}
              />
              <MetricCard
                label="Annualized housing cost"
                value={formatCurrency(result.annualizedHousingCost)}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Fee breakdown</h3>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="px-4 py-3 font-medium">Fee</th>
                      <th className="px-4 py-3 font-medium">Cadence</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        First month
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Lease total
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
