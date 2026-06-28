import assert from 'node:assert/strict';
import test from 'node:test';

import { supportsImageResolution } from '@/shared/lib/image-generation';

test('custom and kie image models support resolution switching', () => {
  assert.equal(supportsImageResolution('custom', 'nano-banana-pro'), true);
  assert.equal(supportsImageResolution('kie', 'nano-banana-pro'), true);
});
