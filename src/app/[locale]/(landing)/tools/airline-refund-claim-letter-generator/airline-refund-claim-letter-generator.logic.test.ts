import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildClaimPlan,
  buildSubjectLine,
  downloadText,
  emptyForm,
  formatDate,
  generateClaim,
  isValidIsoDate,
  validateClaimForm,
} from './airline-refund-claim-letter-generator.logic';

test('generateClaim builds a firm refund refused claim package with checklist evidence', () => {
  const result = generateClaim({
    ...emptyForm,
    airlineName: 'Example Airways',
    passengerName: 'Alex Chen',
    flightNumber: 'ea123',
    flightDate: '2026-03-14',
    route: 'JFK to LAX',
    issueType: 'refund refused',
    desiredOutcome: 'refund',
    tone: 'firm',
    extraDetails: 'The support team denied my refund request on March 16.',
  });

  assert.equal(
    result.subjectLine,
    'Request for refund - refund refused - EA123 on March 14, 2026'
  );
  assert.match(result.letter, /Dear Example Airways Customer Relations/);
  assert.match(result.letter, /Passenger: Alex Chen/);
  assert.match(result.letter, /Flight number: EA123/);
  assert.match(result.letter, /formally request a refund/);
  assert.ok(
    result.evidenceChecklist.includes(
      'Copy of the refund denial or customer service response'
    )
  );
  assert.ok(
    result.evidenceChecklist.includes(
      'Payment receipt showing the original fare and fees'
    )
  );
  assert.ok(
    result.claimPlan.some(
      (item) =>
        item.label === 'Main argument' &&
        item.detail.includes('original service was not provided')
    )
  );
  assert.ok(
    result.claimPlan.some(
      (item) =>
        item.label === 'Follow-up timing' && item.detail.includes('7 days')
    )
  );
});

test('generateClaim creates a concise letter without optional flight details', () => {
  const result = generateClaim({
    ...emptyForm,
    airlineName: 'Example Airways',
    flightDate: '2026-05-02',
    issueType: 'delayed',
    desiredOutcome: 'compensation',
    tone: 'concise',
  });

  assert.match(result.letter, /Dear Example Airways Customer Relations/);
  assert.match(result.letter, /my flight on May 2, 2026/);
  assert.doesNotMatch(result.letter, /Flight number:/);
  assert.match(result.letter, /expected resolution timeline/);
});

test('validateClaimForm rejects missing, malformed, and oversized values', () => {
  assert.match(validateClaimForm(emptyForm).message, /airline name/i);

  assert.match(
    validateClaimForm({
      ...emptyForm,
      airlineName: 'Example Airways',
      flightDate: '2026-02-31',
    }).message,
    /valid flight date/
  );

  assert.match(
    validateClaimForm({
      ...emptyForm,
      airlineName: 'Example Airways',
      flightNumber: 'EA#123',
      flightDate: '2026-02-20',
    }).message,
    /letters, numbers/
  );

  assert.match(
    validateClaimForm({
      ...emptyForm,
      airlineName: 'Example Airways',
      flightDate: '2026-02-20',
      extraDetails: 'x'.repeat(1501),
    }).message,
    /1,500/
  );
});

test('date helpers format only valid ISO dates', () => {
  assert.equal(isValidIsoDate('2026-02-28'), true);
  assert.equal(isValidIsoDate('2026-02-31'), false);
  assert.equal(formatDate('2026-02-28'), 'February 28, 2026');
  assert.equal(formatDate('not-a-date'), '');
});

test('downloadText includes subject, evidence checklist, and letter', () => {
  const result = generateClaim({
    ...emptyForm,
    airlineName: 'Example Airways',
    flightDate: '2026-01-15',
    issueType: 'schedule changed',
    desiredOutcome: 'rebooking',
    tone: 'polite',
  });
  const text = downloadText(result);

  assert.match(text, /^Subject: Request for rebooking - schedule changed/m);
  assert.match(text, /Claim plan:/);
  assert.match(text, /Best first channel/);
  assert.match(text, /Evidence checklist:/);
  assert.match(text, /Original itinerary and updated itinerary/);
  assert.match(text, /Claim letter:/);
});

test('buildClaimPlan adapts the main argument to compensation and rebooking goals', () => {
  const compensationPlan = buildClaimPlan({
    ...emptyForm,
    airlineName: 'Example Airways',
    flightDate: '2026-06-01',
    issueType: 'delayed',
    desiredOutcome: 'compensation',
  });
  const rebookingPlan = buildClaimPlan({
    ...emptyForm,
    airlineName: 'Example Airways',
    flightDate: '2026-06-01',
    issueType: 'schedule changed',
    desiredOutcome: 'rebooking',
  });

  assert.ok(
    compensationPlan.some((item) => item.detail.includes('disruption timeline'))
  );
  assert.ok(
    rebookingPlan.some((item) => item.detail.includes('replacement itinerary'))
  );
});

test('buildSubjectLine keeps subject lines readable for optional details', () => {
  assert.equal(
    buildSubjectLine({
      ...emptyForm,
      airlineName: 'Example Airways',
      flightDate: '2026-09-01',
      issueType: 'denied boarding',
      desiredOutcome: 'voucher',
    }),
    'Request for voucher - denied boarding on September 1, 2026'
  );
});
