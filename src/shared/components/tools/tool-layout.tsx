import { ReactNode } from 'react';

import {
  getRelatedTools,
  getToolAccessLabel,
  ToolDefinition,
} from '@/lib/tools';

import { RelatedTools } from './related-tools';
import { ToolFAQ } from './tool-faq';
import { ToolHero } from './tool-hero';

export function ToolLayout({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: ReactNode;
}) {
  const relatedTools = getRelatedTools(tool.slug);

  return (
    <main>
      <ToolHero
        eyebrow={`${getToolAccessLabel(tool.access)} tool`}
        title={tool.name}
        description={tool.description}
        tool={tool}
      />

      <section className="container pb-10 md:pb-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="min-w-0">{children}</div>
          <aside className="lg:sticky lg:top-24">
            <RelatedTools currentSlug={tool.slug} tools={relatedTools} />
          </aside>
        </div>
      </section>

      {tool.faq ? <ToolFAQ items={tool.faq} /> : null}
    </main>
  );
}
