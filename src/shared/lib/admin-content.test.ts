import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPromptDeleteAction,
  createShowcaseDeleteAction,
  PROMPT_DELETE_PERMISSION_CODES,
  PROMPT_READ_PERMISSION_CODES,
  PROMPT_WRITE_PERMISSION_CODES,
  SHOWCASE_DELETE_PERMISSION_CODES,
  SHOWCASE_READ_PERMISSION_CODES,
  SHOWCASE_WRITE_PERMISSION_CODES,
  shouldExcludeArchivedRecords,
} from '@/shared/lib/admin-content';
import { PERMISSIONS } from '@/core/rbac';

test('prompt permission codes keep dedicated and legacy admin permissions', () => {
  assert.deepEqual(PROMPT_READ_PERMISSION_CODES, [
    PERMISSIONS.PROMPTS_READ,
    PERMISSIONS.CATEGORIES_READ,
  ]);
  assert.deepEqual(PROMPT_WRITE_PERMISSION_CODES, [
    PERMISSIONS.PROMPTS_WRITE,
    PERMISSIONS.CATEGORIES_WRITE,
  ]);
  assert.deepEqual(PROMPT_DELETE_PERMISSION_CODES, [
    PERMISSIONS.PROMPTS_DELETE,
    PERMISSIONS.PROMPTS_WRITE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.CATEGORIES_WRITE,
  ]);
});

test('showcase permission codes keep dedicated and legacy admin permissions', () => {
  assert.deepEqual(SHOWCASE_READ_PERMISSION_CODES, [
    PERMISSIONS.SHOWCASES_READ,
    PERMISSIONS.CATEGORIES_READ,
  ]);
  assert.deepEqual(SHOWCASE_WRITE_PERMISSION_CODES, [
    PERMISSIONS.SHOWCASES_WRITE,
    PERMISSIONS.CATEGORIES_WRITE,
  ]);
  assert.deepEqual(SHOWCASE_DELETE_PERMISSION_CODES, [
    PERMISSIONS.SHOWCASES_DELETE,
    PERMISSIONS.SHOWCASES_WRITE,
    PERMISSIONS.CATEGORIES_DELETE,
    PERMISSIONS.CATEGORIES_WRITE,
  ]);
});

test('archived records are excluded by default only when no explicit status is requested', () => {
  assert.equal(shouldExcludeArchivedRecords(undefined, false), true);
  assert.equal(shouldExcludeArchivedRecords('published', false), false);
  assert.equal(shouldExcludeArchivedRecords(undefined, true), false);
});

test('prompt delete action deletes existing prompt without owner restriction', async () => {
  let deleteCalls = 0;
  const removePrompt = createPromptDeleteAction({
    findPrompt: async ({ id }) => ({ id, userId: 'another-user' } as any),
    deletePrompt: async () => {
      deleteCalls += 1;
      return true;
    },
  });

  const result = await removePrompt('prompt_1');

  assert.equal(result, true);
  assert.equal(deleteCalls, 1);
});

test('delete actions do not delete missing records', async () => {
  let promptDeleteCalls = 0;
  let showcaseDeleteCalls = 0;

  const removePrompt = createPromptDeleteAction({
    findPrompt: async () => null,
    deletePrompt: async () => {
      promptDeleteCalls += 1;
      return true;
    },
  });

  const removeShowcase = createShowcaseDeleteAction({
    getShowcase: async () => null,
    deleteShowcase: async () => {
      showcaseDeleteCalls += 1;
      return true;
    },
  });

  assert.equal(await removePrompt('prompt_missing'), false);
  assert.equal(await removeShowcase('showcase_missing'), false);
  assert.equal(promptDeleteCalls, 0);
  assert.equal(showcaseDeleteCalls, 0);
});
