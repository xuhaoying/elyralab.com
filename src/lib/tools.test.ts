import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import {
  getPublishedTools,
  getRelatedTools,
  getToolHref,
  toolCategories,
  tools,
} from './tools';

test('tool registry keeps unique slugs and derived hrefs', () => {
  const slugs = new Set<string>();

  for (const tool of tools) {
    assert.ok(!slugs.has(tool.slug), `duplicate tool slug: ${tool.slug}`);
    slugs.add(tool.slug);
    assert.equal(tool.href, getToolHref(tool.slug));
    assert.ok(toolCategories.includes(tool.category));
  }
});

test('published tools have physical Next.js routes', () => {
  const appDir = join(
    process.cwd(),
    'src/app/[locale]/(landing)/tools'
  );

  for (const tool of getPublishedTools()) {
    assert.ok(
      existsSync(join(appDir, tool.slug, 'page.tsx')),
      `missing route for ${tool.slug}`
    );
  }
});

test('related tools only include published tools and exclude current slug', () => {
  const publishedSlugs = new Set(getPublishedTools().map((tool) => tool.slug));

  for (const tool of tools) {
    const related = getRelatedTools(tool.slug, 10);
    assert.ok(related.every((item) => item.slug !== tool.slug));
    assert.ok(related.every((item) => publishedSlugs.has(item.slug)));
  }
});

