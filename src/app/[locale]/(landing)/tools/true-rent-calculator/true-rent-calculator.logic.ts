export interface FormState {
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

export type RentAmountField = Exclude<keyof FormState, 'leaseLengthMonths'>;

export interface BreakdownRow {
  label: string;
  cadence: 'Monthly' | 'One-time';
  amount: number;
  firstMonthImpact: number;
  leaseImpact: number;
}

export interface RentResult {
  leaseLengthMonths: number;
  monthlyRecurringTotal: number;
  oneTimeTotal: number;
  amortizedOneTimeTotal: number;
  trueMonthlyRent: number;
  firstMonthTotalCost: number;
  totalLeaseCost: number;
  annualizedHousingCost: number;
  summary: string;
  notes: string[];
  rows: BreakdownRow[];
}

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export interface ValidationResult {
  message: string;
  fieldErrors: FieldErrors;
}

export const emptyForm: FormState = {
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

export const monthlyFields: Array<{
  key: RentAmountField;
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

export const oneTimeFields: Array<{
  key: RentAmountField;
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

const allAmountFields = [...monthlyFields, ...oneTimeFields];
const maxAmount = 10_000_000;
const maxLeaseLengthMonths = 120;

function normalizeMoneyInput(value: string) {
  return value.trim().replace(/[$,\s]/g, '');
}

export function parseCurrency(value: string) {
  const normalized = normalizeMoneyInput(value);

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parseLeaseLength(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export function validateRentForm(form: FormState): ValidationResult {
  const fieldErrors: FieldErrors = {};

  for (const field of allAmountFields) {
    const value = form[field.key];
    const amount = parseCurrency(value);

    if (!value.trim()) {
      continue;
    }

    if (!Number.isFinite(amount)) {
      fieldErrors[field.key] =
        `Enter a valid dollar amount for ${field.label.toLowerCase()}.`;
    } else if (amount < 0) {
      fieldErrors[field.key] = `${field.label} cannot be negative.`;
    } else if (amount > maxAmount) {
      fieldErrors[field.key] =
        `${field.label} looks unusually high. Keep each amount under ${formatCurrency(
          maxAmount
        )}.`;
    }
  }

  const leaseLengthMonths = parseLeaseLength(form.leaseLengthMonths);

  if (!form.leaseLengthMonths.trim()) {
    fieldErrors.leaseLengthMonths = 'Enter a lease length in months.';
  } else if (!Number.isFinite(leaseLengthMonths)) {
    fieldErrors.leaseLengthMonths =
      'Lease length must be a whole number of months.';
  } else if (leaseLengthMonths < 1) {
    fieldErrors.leaseLengthMonths = 'Lease length must be at least 1 month.';
  } else if (leaseLengthMonths > maxLeaseLengthMonths) {
    fieldErrors.leaseLengthMonths = `Lease length must be ${maxLeaseLengthMonths} months or less.`;
  }

  const firstError = Object.values(fieldErrors)[0] || '';

  return {
    fieldErrors,
    message: firstError,
  };
}

export function hasAnyAmount(form: FormState) {
  return allAmountFields.some((field) => parseCurrency(form[field.key]) > 0);
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

export function buildRentResult(form: FormState): RentResult {
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
  const amortizedOneTimeTotal = oneTimeTotal / leaseLengthMonths;
  const trueMonthlyRent = monthlyRecurringTotal + amortizedOneTimeTotal;
  const firstMonthTotalCost = monthlyRecurringTotal + oneTimeTotal;
  const annualizedHousingCost = trueMonthlyRent * 12;

  const notes = [
    'One-time move-in costs are spread across the lease to estimate true monthly rent.',
  ];

  if (parseCurrency(form.securityDeposit) > 0) {
    notes.push(
      'Security deposit is included as cash required at move-in; if it is fully refunded, subtract it when comparing total net cost.'
    );
  }

  const summary = `Your true monthly rent is ${formatCurrency(
    trueMonthlyRent
  )}. That combines ${formatCurrency(
    monthlyRecurringTotal
  )} in recurring monthly rent and fees with ${formatCurrency(
    amortizedOneTimeTotal
  )} in upfront costs spread across a ${leaseLengthMonths}-month lease. Your first-month cash need is ${formatCurrency(
    firstMonthTotalCost
  )}, total lease cost is ${formatCurrency(
    totalLeaseCost
  )}, and annualized housing cost is ${formatCurrency(annualizedHousingCost)}.`;

  return {
    leaseLengthMonths,
    monthlyRecurringTotal,
    oneTimeTotal,
    amortizedOneTimeTotal,
    trueMonthlyRent,
    firstMonthTotalCost,
    totalLeaseCost,
    annualizedHousingCost,
    summary,
    notes,
    rows,
  };
}

export function resultText(result: RentResult) {
  return [
    'True Rent Calculator result',
    '',
    `True monthly rent: ${formatCurrency(result.trueMonthlyRent)}`,
    `Recurring monthly costs: ${formatCurrency(result.monthlyRecurringTotal)}`,
    `Amortized upfront costs: ${formatCurrency(result.amortizedOneTimeTotal)}`,
    `First-month total cost: ${formatCurrency(result.firstMonthTotalCost)}`,
    `Total lease cost: ${formatCurrency(result.totalLeaseCost)}`,
    `Annualized housing cost: ${formatCurrency(result.annualizedHousingCost)}`,
    `Lease length: ${result.leaseLengthMonths} months`,
    '',
    result.summary,
    '',
    'Assumptions:',
    ...result.notes.map((note) => `- ${note}`),
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

export function resultCsv(result: RentResult) {
  const metricRows = [
    ['Metric', 'Amount'],
    ['True monthly rent', result.trueMonthlyRent.toFixed(2)],
    ['Recurring monthly costs', result.monthlyRecurringTotal.toFixed(2)],
    ['Amortized upfront costs', result.amortizedOneTimeTotal.toFixed(2)],
    ['First-month total cost', result.firstMonthTotalCost.toFixed(2)],
    ['Total lease cost', result.totalLeaseCost.toFixed(2)],
    ['Annualized housing cost', result.annualizedHousingCost.toFixed(2)],
    ['Lease length months', result.leaseLengthMonths],
    ['Plain-English summary', result.summary],
    [],
    ['Assumption'],
    ...result.notes.map((note) => [note]),
    [],
    ['Fee', 'Cadence', 'Amount', 'First-month impact', 'Lease total'],
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

export function getEnteredFeeCounts(form: FormState) {
  return {
    monthlyFeeCount: monthlyFields.filter(
      (field) => parseCurrency(form[field.key]) > 0
    ).length,
    oneTimeFeeCount: oneTimeFields.filter(
      (field) => parseCurrency(form[field.key]) > 0
    ).length,
  };
}
