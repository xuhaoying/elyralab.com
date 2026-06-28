import assert from 'node:assert/strict';
import test from 'node:test';

import {
  answerScore,
  buildResult,
  emptyForm,
  getReadinessLevel,
  normalizeWebsiteUrl,
  resultText,
  validateReadinessForm,
} from './ai-search-readiness-checker.logic';

test('buildResult scores a fully ready site at 100', () => {
  const result = buildResult({
    ...emptyForm,
    websiteUrl: 'example.com',
    brandName: 'Acme',
    targetAudience: 'operations teams',
    hasAboutPage: 'yes',
    hasFaqPage: 'yes',
    hasProductPages: 'yes',
    hasAuthorInfo: 'yes',
    hasStructuredData: 'yes',
    hasLlmsTxt: 'yes',
    hasPricingPages: 'yes',
    hasOriginalResearch: 'yes',
  });

  assert.equal(result.score, 100);
  assert.equal(result.level, 'Strong');
  assert.equal(result.missingItems.length, 0);
  assert.match(result.summary, /Acme scores 100\/100/);
});

test('buildResult gives unknown answers partial credit and prioritizes verification', () => {
  const result = buildResult({
    ...emptyForm,
    websiteUrl: 'https://example.com',
    brandName: 'Acme',
    targetAudience: 'buyers',
    hasStructuredData: 'unknown',
    hasLlmsTxt: 'unknown',
  });

  assert.equal(result.score, 6);
  assert.equal(result.level, 'Needs foundation work');
  assert.equal(result.missingItems[0], 'Clear product or service pages');
  assert.ok(result.priorityChecklist.includes('Verify structured data/schema'));
  assert.ok(result.priorityChecklist.includes('Verify llms.txt'));
  assert.match(result.summary, /unknown answers receive partial credit/);
});

test('validation accepts bare domains and rejects unsupported URL protocols', () => {
  assert.equal(normalizeWebsiteUrl('example.com'), 'https://example.com/');
  assert.equal(
    normalizeWebsiteUrl('https://example.com/path'),
    'https://example.com/path'
  );
  assert.equal(normalizeWebsiteUrl('ftp://example.com'), '');

  assert.match(validateReadinessForm(emptyForm).message, /website URL/i);

  assert.match(
    validateReadinessForm({
      ...emptyForm,
      websiteUrl: 'ftp://example.com',
      brandName: 'Acme',
      targetAudience: 'buyers',
    }).message,
    /valid http or https/
  );
});

test('validation rejects missing or oversized identity fields', () => {
  assert.match(
    validateReadinessForm({
      ...emptyForm,
      websiteUrl: 'https://example.com',
      brandName: '',
      targetAudience: 'buyers',
    }).message,
    /brand name/i
  );

  assert.match(
    validateReadinessForm({
      ...emptyForm,
      websiteUrl: 'https://example.com',
      brandName: 'Acme',
      targetAudience: 'x'.repeat(251),
    }).message,
    /250/
  );
});

test('answerScore and readiness levels stay stable at thresholds', () => {
  assert.equal(answerScore('yes', 16), 16);
  assert.equal(answerScore('unknown', 16), 4);
  assert.equal(answerScore('no', 16), 0);
  assert.equal(getReadinessLevel(80), 'Strong');
  assert.equal(getReadinessLevel(60), 'Developing');
  assert.equal(getReadinessLevel(40), 'Early');
  assert.equal(getReadinessLevel(39), 'Needs foundation work');
});

test('resultText includes normalized URL, strengths, missing items, and recommendations', () => {
  const form = {
    ...emptyForm,
    websiteUrl: 'example.com',
    brandName: 'Acme',
    targetAudience: 'marketing teams',
    hasAboutPage: 'yes' as const,
    hasProductPages: 'yes' as const,
  };
  const result = buildResult(form);
  const text = resultText(form, result);

  assert.match(text, /Website URL: https:\/\/example\.com\//);
  assert.match(text, /Strengths:/);
  assert.match(text, /Clear product or service pages/);
  assert.match(text, /Missing items:/);
  assert.match(text, /Priority checklist:/);
  assert.match(text, /Next-step recommendations:/);
});
