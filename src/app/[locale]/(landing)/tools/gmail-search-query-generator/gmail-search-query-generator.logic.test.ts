import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGmailQuery,
  emptyForm,
  queryRecipes,
  resultFileText,
  validateGmailForm,
} from './gmail-search-query-generator.logic';

test('buildGmailQuery creates a complete Gmail query from populated fields', () => {
  const result = buildGmailQuery({
    ...emptyForm,
    from: 'sender@example.com',
    to: 'team@example.com',
    subjectKeyword: 'quarterly report',
    containsWords: 'invoice, board packet',
    excludesWords: '-draft\nspam',
    hasAttachment: true,
    afterDate: '2026-01-01',
    beforeDate: '2026-02-01',
    unreadOnly: true,
    labelMode: 'category',
    labelValue: 'promotions',
  });

  assert.equal(
    result.query,
    'from:sender@example.com to:team@example.com subject:"quarterly report" invoice "board packet" -draft -spam has:attachment after:2026/01/01 before:2026/02/01 is:unread category:promotions'
  );
  assert.equal(result.explanations.length, 10);
  assert.equal(result.notices[0]?.title, 'Multi-word phrases are quoted');
});

test('buildGmailQuery quotes labels with spaces', () => {
  const result = buildGmailQuery({
    ...emptyForm,
    labelMode: 'label',
    labelValue: 'Client Projects',
  });

  assert.equal(result.query, 'label:"Client Projects"');
});

test('query recipes generate useful starting queries', () => {
  const invoiceRecipe = queryRecipes.find(
    (recipe) => recipe.id === 'invoice-attachments'
  );

  assert.ok(invoiceRecipe);

  const result = buildGmailQuery({
    ...emptyForm,
    ...invoiceRecipe.form,
  });

  assert.equal(result.query, 'subject:invoice receipt payment has:attachment');
  assert.equal(result.notices.length, 0);
});

test('buildGmailQuery warns when a generated query is likely too broad', () => {
  const result = buildGmailQuery({
    ...emptyForm,
    hasAttachment: true,
  });

  assert.equal(result.query, 'has:attachment');
  assert.equal(result.notices[0]?.title, 'Broad search');
});

test('validateGmailForm rejects empty or reversed date ranges', () => {
  assert.match(
    validateGmailForm({
      ...emptyForm,
      afterDate: '2026-02-01',
      beforeDate: '2026-02-01',
    }),
    /Before date must be later/
  );

  assert.match(
    validateGmailForm({
      ...emptyForm,
      afterDate: '2026-03-01',
      beforeDate: '2026-02-01',
    }),
    /Before date must be later/
  );
});

test('validateGmailForm rejects unsupported Gmail categories', () => {
  assert.match(
    validateGmailForm({
      ...emptyForm,
      labelMode: 'category',
      labelValue: 'custom work',
    }),
    /supported categories/
  );
});

test('resultFileText includes explanation and notices', () => {
  const result = buildGmailQuery({
    ...emptyForm,
    containsWords: 'board packet',
  });
  const fileText = resultFileText(result);

  assert.match(fileText, /Gmail search query/);
  assert.match(fileText, /"board packet"/);
  assert.match(fileText, /Explanation/);
  assert.match(fileText, /Notes/);
});
