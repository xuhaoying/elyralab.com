import assert from 'node:assert/strict';
import test from 'node:test';

import {
  addMonths,
  buildAmounts,
  buildMonthlyTotals,
  buildSchedule,
  checklistText,
  emptyForm,
  formatIsoDate,
  parseAmountCents,
  scheduleCsv,
  validateBnplForm,
} from './bnpl-payment-calendar.logic';

test('buildSchedule splits cents exactly and produces a biweekly schedule', () => {
  const result = buildSchedule(
    {
      ...emptyForm,
      purchaseAmount: '100',
      firstPaymentDate: '2026-01-01',
      numberOfPayments: '3',
      paymentFrequency: 'biweekly',
      merchantName: 'Store',
      note: 'Order 123',
    },
    new Date(Date.UTC(2026, 0, 1))
  );

  assert.ok(result);
  assert.equal(result.totalAmountCents, 10000);
  assert.deepEqual(
    result.rows.map((row) => row.amountCents),
    [3334, 3333, 3333]
  );
  assert.deepEqual(
    result.rows.map((row) => formatIsoDate(row.dueDate)),
    ['2026-01-01', '2026-01-15', '2026-01-29']
  );
  assert.equal(result.amountPerPaymentLabel, '$33.33-$33.34 each');
  assert.equal(result.nextPayments.length, 3);
  assert.equal(formatIsoDate(result.finalPaymentDate), '2026-01-29');
  assert.deepEqual(
    result.monthlyTotals.map((month) => [
      month.label,
      month.paymentCount,
      month.totalAmountCents,
    ]),
    [['Jan 2026', 3, 10000]]
  );
  assert.equal(result.peakMonth.label, 'Jan 2026');
  assert.match(result.summary, /highest monthly cash load is \$100\.00/);
  assert.ok(
    result.warnings.some((warning) =>
      warning.includes('3 payments totaling $100.00')
    )
  );
});

test('monthly schedules preserve month-end behavior', () => {
  const firstPaymentDate = new Date(Date.UTC(2026, 0, 31));

  assert.equal(formatIsoDate(addMonths(firstPaymentDate, 1)), '2026-02-28');
  assert.equal(formatIsoDate(addMonths(firstPaymentDate, 2)), '2026-03-31');

  const result = buildSchedule(
    {
      ...emptyForm,
      purchaseAmount: '$240.00',
      firstPaymentDate: '2026-01-31',
      numberOfPayments: '3',
      paymentFrequency: 'monthly',
    },
    new Date(Date.UTC(2026, 0, 1))
  );

  assert.ok(result);
  assert.deepEqual(
    result.rows.map((row) => formatIsoDate(row.dueDate)),
    ['2026-01-31', '2026-02-28', '2026-03-31']
  );
});

test('validateBnplForm rejects invalid inputs with clear field errors', () => {
  assert.match(validateBnplForm(emptyForm).message, /purchase amount/i);

  assert.match(
    validateBnplForm({
      ...emptyForm,
      purchaseAmount: '-5',
      firstPaymentDate: '2026-01-01',
    }).message,
    /greater than/
  );

  assert.match(
    validateBnplForm({
      ...emptyForm,
      purchaseAmount: '250',
      firstPaymentDate: '2026-02-31',
    }).message,
    /valid first payment date/
  );

  assert.match(
    validateBnplForm({
      ...emptyForm,
      purchaseAmount: '250',
      firstPaymentDate: '2026-02-20',
      numberOfPayments: '4.5',
    }).message,
    /whole number/
  );

  assert.match(
    validateBnplForm({
      ...emptyForm,
      purchaseAmount: '0.01',
      firstPaymentDate: '2026-02-20',
      numberOfPayments: '3',
    }).message,
    /at least \$0\.01/
  );
});

test('amount parsing and amount builder handle currency formatting and totals', () => {
  assert.equal(parseAmountCents('$1,234.56'), 123456);
  assert.deepEqual(buildAmounts(10001, 4), [2501, 2500, 2500, 2500]);
});

test('buildSchedule flags past scheduled payments and long commitments', () => {
  const result = buildSchedule(
    {
      ...emptyForm,
      purchaseAmount: '240',
      firstPaymentDate: '2026-01-01',
      numberOfPayments: '12',
      paymentFrequency: 'monthly',
    },
    new Date(Date.UTC(2026, 2, 1))
  );

  assert.ok(result);
  assert.equal(result.missedPayments.length, 2);
  assert.ok(
    result.warnings.some((warning) => warning.includes('before today'))
  );
  assert.ok(
    result.warnings.some((warning) => warning.includes('long BNPL commitment'))
  );
});

test('buildMonthlyTotals groups payments by UTC month', () => {
  const result = buildSchedule(
    {
      ...emptyForm,
      purchaseAmount: '90',
      firstPaymentDate: '2026-01-31',
      numberOfPayments: '3',
      paymentFrequency: 'monthly',
    },
    new Date(Date.UTC(2026, 0, 1))
  );

  assert.ok(result);
  assert.deepEqual(
    buildMonthlyTotals(result.rows).map((month) => month.monthKey),
    ['2026-01', '2026-02', '2026-03']
  );
});

test('checklistText and scheduleCsv include merchant and escaped notes', () => {
  const result = buildSchedule(
    {
      ...emptyForm,
      purchaseAmount: '120',
      firstPaymentDate: '2026-04-10',
      numberOfPayments: '2',
      paymentFrequency: 'weekly',
      merchantName: 'Shop, Inc.',
      note: 'Card ending 1234, payoff early',
    },
    new Date(Date.UTC(2026, 3, 1))
  );

  assert.ok(result);

  const checklist = checklistText(result);
  const csv = scheduleCsv(result);

  assert.match(checklist, /BNPL payment checklist for Shop, Inc\./);
  assert.match(checklist, /Peak month: Apr 2026/);
  assert.match(checklist, /Cash flow notes:/);
  assert.match(checklist, /\[ \] Payment 1: \$60\.00 due Apr 10, 2026/);
  assert.match(csv, /"Shop, Inc\."/);
  assert.match(csv, /"Card ending 1234, payoff early"/);
  assert.match(csv, /Monthly cash flow/);
  assert.match(csv, /Cash flow notes/);
});
