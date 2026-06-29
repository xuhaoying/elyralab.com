import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildRentResult,
  emptyForm,
  formatCurrency,
  getEnteredFeeCounts,
  hasAnyAmount,
  parseCurrency,
  resultCsv,
  resultText,
  validateRentForm,
} from './true-rent-calculator.logic';

test('buildRentResult separates refundable deposit cash flow from net cost', () => {
  const result = buildRentResult({
    ...emptyForm,
    baseMonthlyRent: '2000',
    utilities: '150',
    petRent: '50',
    applicationFee: '100',
    moveInFee: '300',
    securityDeposit: '2000',
    leaseLengthMonths: '12',
  });

  assert.equal(result.monthlyRecurringTotal, 2200);
  assert.equal(result.oneTimeTotal, 2400);
  assert.equal(result.nonRefundableOneTimeTotal, 400);
  assert.equal(result.refundableDepositTotal, 2000);
  assert.equal(result.amortizedOneTimeTotal, 400 / 12);
  assert.equal(result.trueMonthlyRent, 2200 + 400 / 12);
  assert.equal(result.firstMonthTotalCost, 4600);
  assert.equal(result.cashRequiredBeforeRefunds, 28800);
  assert.equal(result.totalLeaseCost, 26800);
  assert.equal(result.annualizedHousingCost, 26800);
  assert.match(result.summary, /\$2,233\.33/);
  assert.match(result.notes.join(' '), /treated as refundable/);
});

test('buildRentResult includes security deposit in net cost when marked non-refundable', () => {
  const result = buildRentResult({
    ...emptyForm,
    baseMonthlyRent: '2000',
    securityDeposit: '2000',
    leaseLengthMonths: '12',
    securityDepositRefundable: false,
  });

  assert.equal(result.refundableDepositTotal, 0);
  assert.equal(result.nonRefundableOneTimeTotal, 2000);
  assert.equal(result.trueMonthlyRent, 2000 + 2000 / 12);
  assert.equal(result.cashRequiredBeforeRefunds, 26000);
  assert.equal(result.totalLeaseCost, 26000);
  assert.match(result.notes.join(' '), /treated as non-refundable/);
});

test('buildRentResult accepts pasted currency formatting', () => {
  const result = buildRentResult({
    ...emptyForm,
    baseMonthlyRent: '$1,950.50',
    internet: '49.50',
    moveInFee: '1,000',
    leaseLengthMonths: '10',
  });

  assert.equal(result.monthlyRecurringTotal, 2000);
  assert.equal(result.oneTimeTotal, 1000);
  assert.equal(result.trueMonthlyRent, 2100);
  assert.equal(parseCurrency('$1,234.56'), 1234.56);
});

test('validateRentForm rejects invalid amount and lease length inputs', () => {
  assert.match(
    validateRentForm({
      ...emptyForm,
      baseMonthlyRent: '-1',
    }).message,
    /cannot be negative/
  );

  assert.match(
    validateRentForm({
      ...emptyForm,
      utilities: 'about 200',
    }).message,
    /valid dollar amount/
  );

  assert.match(
    validateRentForm({
      ...emptyForm,
      leaseLengthMonths: '12.5',
    }).message,
    /whole number/
  );

  assert.match(
    validateRentForm({
      ...emptyForm,
      leaseLengthMonths: '121',
    }).message,
    /120 months or less/
  );
});

test('hasAnyAmount and getEnteredFeeCounts only count positive entered charges', () => {
  const form = {
    ...emptyForm,
    baseMonthlyRent: '2100',
    utilities: '0',
    applicationFee: '75',
    securityDeposit: '-500',
  };

  assert.equal(hasAnyAmount(emptyForm), false);
  assert.equal(hasAnyAmount(form), true);
  assert.deepEqual(getEnteredFeeCounts(form), {
    monthlyFeeCount: 1,
    oneTimeFeeCount: 1,
  });
});

test('resultText and resultCsv include assumptions and breakdown rows', () => {
  const result = buildRentResult({
    ...emptyForm,
    baseMonthlyRent: '1800',
    trashFee: '30',
    securityDeposit: '1800',
    leaseLengthMonths: '18',
  });
  const text = resultText(result);
  const csv = resultCsv(result);

  assert.match(text, /True Rent Calculator result/);
  assert.match(text, /Assumptions/);
  assert.match(text, /Security deposit/);
  assert.match(csv, /True monthly rent/);
  assert.match(csv, /Plain-English summary/);
  assert.match(
    csv,
    /Security deposit,One-time,Refundable deposit,1800.00,1800.00,0.00/
  );
});

test('formatCurrency keeps stable USD formatting for copied results', () => {
  assert.equal(formatCurrency(1234.5), '$1,234.50');
});
