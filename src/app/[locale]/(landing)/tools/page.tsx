import { setRequestLocale } from 'next-intl/server';

import {
  getAllTools,
  getToolsByCategory,
  toolCategories,
} from '@/lib/tools';
import { ToolCard, ToolHero } from '@/shared/components/tools';
import { Badge } from '@/shared/components/ui/badge';
import { getMetadata } from '@/shared/lib/seo';

export const generateMetadata = getMetadata({
  title: 'Free Tool Directory | ElyraLab',
  description:
    'Browse the ElyraLab tool directory by category, including Gmail search, rent, travel refund, payment calendar, review reply, and AI search tools.',
  keywords:
    'tool directory, free browser tools, Gmail search query generator, rent calculator, AI search checker',
  canonicalUrl: '/tools',
});

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tools = getAllTools();
  const availableCount = tools.filter((tool) => tool.status === 'available').length;

  return (
    <main>
      <ToolHero
        eyebrow="Directory"
        title="All tools"
        description="Browse practical tools by category. New tools are added through the shared registry so every listing and related-tools section stays in sync."
      >
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Badge variant="secondary">{availableCount} available</Badge>
          <Badge variant="outline">{tools.length - availableCount} planned</Badge>
        </div>
      </ToolHero>

      <section className="container space-y-12 pb-16">
        {toolCategories.map((category) => {
          const categoryTools = getToolsByCategory(category);

          if (categoryTools.length === 0) {
            return null;
          }

          return (
            <section
              key={category}
              aria-labelledby={`${category.toLowerCase().replaceAll(' ', '-')}-heading`}
              className="space-y-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <h2
                    id={`${category.toLowerCase().replaceAll(' ', '-')}-heading`}
                    className="text-2xl font-semibold"
                  >
                    {category}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {categoryTools.length} tool
                    {categoryTools.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </main>
  );
}
