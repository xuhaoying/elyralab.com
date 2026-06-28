import { getAllTools, getToolsByCategory, toolCategories } from '@/lib/tools';
import { setRequestLocale } from 'next-intl/server';

import { ToolCard, ToolHero } from '@/shared/components/tools';
import { Badge } from '@/shared/components/ui/badge';
import { getMetadata } from '@/shared/lib/seo';

function getCategoryId(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const generateMetadata = getMetadata({
  title: 'Tool Directory | ElyraLab',
  description:
    'Browse the ElyraLab tool directory by category, including Gmail search, rent, travel refund, payment calendar, review reply, and AI search tools.',
  keywords:
    'tool directory, browser tools, Gmail search query generator, rent calculator, AI search checker',
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
  const availableCount = tools.filter(
    (tool) => tool.status === 'available'
  ).length;
  const categorySummaries = toolCategories.map((category) => {
    const categoryTools = getToolsByCategory(category);
    const categoryAvailableCount = categoryTools.filter(
      (tool) => tool.status === 'available'
    ).length;

    return {
      availableCount: categoryAvailableCount,
      category,
      id: getCategoryId(category),
      totalCount: categoryTools.length,
    };
  });

  return (
    <main>
      <ToolHero
        eyebrow="Directory"
        title="All tools"
        description="Browse practical tools by category. New tools are added through the shared registry so every listing and related-tools section stays in sync."
      >
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Badge variant="secondary">{availableCount} available</Badge>
          <Badge variant="outline">
            {tools.length - availableCount} planned
          </Badge>
        </div>
      </ToolHero>

      <section className="container pb-8">
        <div aria-label="Tool categories" className="flex flex-wrap gap-2">
          {categorySummaries.map(
            ({ availableCount, category, id, totalCount }) => (
              <a
                key={category}
                className="border-border bg-background hover:bg-muted flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                href={`#${id}`}
              >
                <span>{category}</span>
                <Badge variant="secondary">
                  {availableCount}/{totalCount}
                </Badge>
              </a>
            )
          )}
        </div>
      </section>

      <section className="container space-y-12 pb-16">
        {toolCategories.map((category) => {
          const categoryTools = getToolsByCategory(category);
          const categoryId = getCategoryId(category);
          const categoryAvailableCount = categoryTools.filter(
            (tool) => tool.status === 'available'
          ).length;

          if (categoryTools.length === 0) {
            return null;
          }

          return (
            <section
              key={category}
              aria-labelledby={`${categoryId}-heading`}
              className="space-y-5"
              id={categoryId}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                  <h2
                    id={`${categoryId}-heading`}
                    className="text-2xl font-semibold"
                  >
                    {category}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {categoryTools.length} tool
                    {categoryTools.length === 1 ? '' : 's'}
                  </p>
                </div>
                <Badge className="w-fit" variant="outline">
                  {categoryAvailableCount} available
                </Badge>
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
