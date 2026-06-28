export type PaymentFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface FormState {
  purchaseAmount: string;
  firstPaymentDate: string;
  numberOfPayments: string;
  paymentFrequency: PaymentFrequency;
  merchantName: string;
  note: string;
}

export interface PaymentRow {
  number: number;
  dueDate: Date;
  amountCents: number;
  merchantName: string;
  note: string;
}

export interface PaymentScheduleResult {
  totalAmountCents: number;
  amountPerPaymentLabel: string;
  numberOfPayments: number;
  paymentFrequency: PaymentFrequency;
  merchantName: string;
  note: string;
  rows: PaymentRow[];
  nextPayments: PaymentRow[];
}

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export interface ValidationResult {
  message: string;
  fieldErrors: FieldErrors;
}

export const emptyForm: FormState = {
  purchaseAmount: '',
  firstPaymentDate: '',
  numberOfPayments: '4',
  paymentFrequency: 'biweekly',
  merchantName: '',
  note: '',
};

export const frequencyLabels: Record<PaymentFrequency, string> = {
  weekly: 'Weekly',
  biweekly: 'Biweekly',
  monthly: 'Monthly',
};

const validFrequencies = new Set<PaymentFrequency>([
  'weekly',
  'biweekly',
  'monthly',
]);
const maxPurchaseAmountCents = 1_000_000_00;
const maxNumberOfPayments = 60;

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeMoneyInput(value: string) {
  return value.trim().replace(/[$,\s]/g, '');
}

export function parseAmountCents(value: string) {
  const normalized = normalizeMoneyInput(value);

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : Number.NaN;
}

export function parsePaymentCount(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : Number.NaN;
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

export function parseDate(value: string) {
  if (!isValidIsoDate(value)) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function validateBnplForm(form: FormState): ValidationResult {
  const fieldErrors: FieldErrors = {};
  const purchaseAmountCents = parseAmountCents(form.purchaseAmount);
  const numberOfPayments = parsePaymentCount(form.numberOfPayments);

  if (!form.purchaseAmount.trim()) {
    fieldErrors.purchaseAmount = 'Enter the purchase amount.';
  } else if (!Number.isFinite(purchaseAmountCents)) {
    fieldErrors.purchaseAmount = 'Enter a valid purchase amount.';
  } else if (purchaseAmountCents <= 0) {
    fieldErrors.purchaseAmount = 'Purchase amount must be greater than $0.';
  } else if (purchaseAmountCents > maxPurchaseAmountCents) {
    fieldErrors.purchaseAmount = 'Purchase amount must be $1,000,000 or less.';
  }

  if (!form.firstPaymentDate) {
    fieldErrors.firstPaymentDate = 'Enter the first payment date.';
  } else if (!isValidIsoDate(form.firstPaymentDate)) {
    fieldErrors.firstPaymentDate = 'Enter a valid first payment date.';
  }

  if (!form.numberOfPayments.trim()) {
    fieldErrors.numberOfPayments = 'Enter the number of payments.';
  } else if (!Number.isFinite(numberOfPayments)) {
    fieldErrors.numberOfPayments = 'Number of payments must be a whole number.';
  } else if (numberOfPayments < 1) {
    fieldErrors.numberOfPayments = 'Use at least 1 payment.';
  } else if (numberOfPayments > maxNumberOfPayments) {
    fieldErrors.numberOfPayments = `Use ${maxNumberOfPayments} payments or fewer.`;
  } else if (
    Number.isFinite(purchaseAmountCents) &&
    purchaseAmountCents > 0 &&
    numberOfPayments > purchaseAmountCents
  ) {
    fieldErrors.numberOfPayments =
      'Use fewer payments so every installment is at least $0.01.';
  }

  if (!validFrequencies.has(form.paymentFrequency)) {
    fieldErrors.paymentFrequency = 'Choose a supported payment frequency.';
  }

  if (clean(form.merchantName).length > 80) {
    fieldErrors.merchantName = 'Keep the merchant name under 80 characters.';
  }

  if (form.note.trim().length > 500) {
    fieldErrors.note = 'Keep the note under 500 characters.';
  }

  const firstError = Object.values(fieldErrors)[0] || '';

  return {
    fieldErrors,
    message: firstError,
  };
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  const originalDay = date.getUTCDate();
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
  const lastDay = new Date(
    Date.UTC(next.getUTCFullYear(), next.getUTCMonth() + 1, 0)
  ).getUTCDate();

  next.setUTCDate(Math.min(originalDay, lastDay));
  return next;
}

export function getPaymentDate(
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

export function buildAmounts(
  totalAmountCents: number,
  numberOfPayments: number
) {
  const baseAmount = Math.floor(totalAmountCents / numberOfPayments);
  const remainder = totalAmountCents % numberOfPayments;

  return Array.from({ length: numberOfPayments }, (_, index) =>
    index < remainder ? baseAmount + 1 : baseAmount
  );
}

export function buildAmountPerPaymentLabel(amounts: number[]) {
  const uniqueAmounts = Array.from(new Set(amounts));

  if (uniqueAmounts.length === 1) {
    return `${formatCurrencyFromCents(uniqueAmounts[0])} each`;
  }

  const min = Math.min(...uniqueAmounts);
  const max = Math.max(...uniqueAmounts);

  return `${formatCurrencyFromCents(min)}-${formatCurrencyFromCents(max)} each`;
}

function normalizeToday(today: Date) {
  return new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
}

export function buildSchedule(form: FormState, today = new Date()) {
  const totalAmountCents = parseAmountCents(form.purchaseAmount);
  const numberOfPayments = parsePaymentCount(form.numberOfPayments);
  const firstPaymentDate = parseDate(form.firstPaymentDate);

  if (!totalAmountCents || !numberOfPayments || !firstPaymentDate) {
    return null;
  }

  const amounts = buildAmounts(totalAmountCents, numberOfPayments);
  const merchantName = clean(form.merchantName);
  const note = form.note.trim();
  const rows = amounts.map((amountCents, index) => ({
    number: index + 1,
    dueDate: getPaymentDate(firstPaymentDate, index, form.paymentFrequency),
    amountCents,
    merchantName,
    note,
  }));
  const normalizedToday = normalizeToday(today);
  const nextPayments = rows
    .filter((row) => row.dueDate >= normalizedToday)
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
  } satisfies PaymentScheduleResult;
}

export function checklistText(result: PaymentScheduleResult) {
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

export function scheduleCsv(result: PaymentScheduleResult) {
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
