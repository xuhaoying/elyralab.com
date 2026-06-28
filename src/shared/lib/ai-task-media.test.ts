import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAITaskImageUrls,
  normalizeAITaskImageUrls,
  shouldUseSingleImageResult,
} from '@/shared/lib/ai-task-media';

test('custom image tasks use single image result mode', () => {
  assert.equal(
    shouldUseSingleImageResult({
      provider: 'custom',
      model: 'nano-banana-pro',
    }),
    true
  );

  assert.deepEqual(
    normalizeAITaskImageUrls(
      { provider: 'custom', model: 'nano-banana-pro' },
      ['https://a.test/1.png', 'https://a.test/2.png']
    ),
    ['https://a.test/1.png']
  );
});

test('legacy gpt image2 custom tasks still use single image result mode', () => {
  assert.equal(
    shouldUseSingleImageResult({
      provider: 'custom',
      model: 'gpt-image2',
    }),
    true
  );
});

test('getAITaskImageUrls reads custom image result payloads', () => {
  const urls = getAITaskImageUrls({
    provider: 'custom',
    model: 'nano-banana-pro',
    taskResult: JSON.stringify({
      data: {
        result: {
          images: [{ url: ['https://a.test/final.png', 'https://a.test/extra.png'] }],
        },
      },
    }),
  });

  assert.deepEqual(urls, ['https://a.test/final.png']);
});
