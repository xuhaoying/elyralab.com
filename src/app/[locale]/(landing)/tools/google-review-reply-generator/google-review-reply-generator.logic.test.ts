import assert from 'node:assert/strict';
import test from 'node:test';

import {
  downloadText,
  emptyForm,
  generateReplies,
  getDetailPhrase,
  getSentiment,
  validateReviewForm,
} from './google-review-reply-generator.logic';

test('generateReplies creates positive replies with customer and business context', () => {
  const result = generateReplies({
    ...emptyForm,
    reviewText: 'Great service and fast pickup.',
    starRating: '5',
    businessType: 'coffee shop',
    tone: 'friendly',
    customerName: 'Taylor',
    businessName: 'Acme Cafe',
  });

  assert.equal(result.sentiment, 'positive');
  assert.match(result.professionalReply, /Hi Taylor/);
  assert.match(result.professionalReply, /coffee shop/);
  assert.match(result.professionalReply, /"Great service and fast pickup\."/);
  assert.match(result.shortReply, /Acme Cafe/);
});

test('generateReplies creates neutral replies for three-star reviews', () => {
  const result = generateReplies({
    ...emptyForm,
    reviewText: 'The visit was okay, but the wait was long.',
    starRating: '3',
    businessType: 'dental clinic',
    tone: 'warm',
  });

  assert.equal(result.sentiment, 'neutral');
  assert.match(result.professionalReply, /use it to improve/);
  assert.match(result.warmerReply, /next visit/);
});

test('generateReplies creates careful negative replies without admitting specific fault', () => {
  const result = generateReplies({
    ...emptyForm,
    reviewText: 'The order was wrong and no one helped.',
    starRating: '1',
    businessType: 'restaurant',
    tone: 'professional',
  });

  assert.equal(result.sentiment, 'negative');
  assert.match(result.professionalReply, /sorry to hear/);
  assert.match(result.professionalReply, /protect your privacy/);
  assert.doesNotMatch(result.professionalReply, /our fault/i);
});

test('validateReviewForm rejects missing or oversized inputs', () => {
  assert.match(validateReviewForm(emptyForm).message, /review text/i);

  assert.match(
    validateReviewForm({
      ...emptyForm,
      reviewText: 'Good',
      businessType: '',
    }).message,
    /business type/i
  );

  assert.match(
    validateReviewForm({
      ...emptyForm,
      reviewText: 'Good',
      starRating: '6',
      businessType: 'salon',
    }).message,
    /star rating/
  );

  assert.match(
    validateReviewForm({
      ...emptyForm,
      reviewText: 'x'.repeat(2001),
      businessType: 'salon',
    }).message,
    /2,000/
  );
});

test('helpers map sentiment and review details consistently', () => {
  assert.equal(getSentiment('5'), 'positive');
  assert.equal(getSentiment('3'), 'neutral');
  assert.equal(getSentiment('2'), 'negative');
  assert.equal(
    getDetailPhrase(' Helpful and kind staff. '),
    'your feedback about "Helpful and kind staff."'
  );
  assert.equal(getDetailPhrase('x'.repeat(91)), 'the details you shared');
});

test('downloadText includes all reply versions', () => {
  const result = generateReplies({
    ...emptyForm,
    reviewText: 'Nice team.',
    starRating: '4',
    businessType: 'salon',
  });
  const text = downloadText(result);

  assert.match(text, /Review sentiment: Positive/);
  assert.match(text, /Professional reply:/);
  assert.match(text, /Short reply:/);
  assert.match(text, /Warmer reply:/);
});
