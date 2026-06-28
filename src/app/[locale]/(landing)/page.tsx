import { ArrowRight, Sparkles } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';

import {
  getAllTools,
  getPublishedTools,
  toolCategories,
} from '@/lib/tools';
import { Link } from '@/core/i18n/navigation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { getMetadata } from '@/shared/lib/seo';
import { ToolCard, ToolHero } from '@/shared/components/tools';

export const generateMetadata = getMetadata({
  title: 'ElyraLab Tool Library | Free Everyday Workflow Tools',
  description:
    'A growing directory of free, browser-based tools for email, finance, travel, reputation, and AI search workflows.',
  keywords:
    'free tools, tool directory, Gmail search query generator, productivity tools',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const publishedTools = getPublishedTools();
  const allTools = getAllTools();

  return (
    <main>
      <ToolHero
        eyebrow="Tool library"
        title="Useful tools for everyday workflows"
        description="ElyraLab is becoming a focused directory of lightweight tools that run in your browser, require no login, and solve specific workflow problems."
      >
        <Card className="rounded-lg">
          <CardContent className="grid grid-cols-2 gap-4 p-5">
            <div>
              <div className="text-3xl font-semibold">{allTools.length}</div>
              <div className="text-muted-foreground text-sm">Tools planned</div>
            </div>
            <div>
              <div className="text-3xl font-semibold">
                {publishedTools.length}
              </div>
              <div className="text-muted-foreground text-sm">Available now</div>
            </div>
          </CardContent>
        </Card>
      </ToolHero>

      <section className="container pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Available tools</h2>
                <p className="text-muted-foreground max-w-2xl leading-7">
                  Start with the live tools in the library. Planned tools stay
                  visible in the directory so the roadmap is easy to scan.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/tools">
                  View directory
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {publishedTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-primary size-5" />
              <h2 className="text-lg font-semibold">Tool categories</h2>
            </div>
            <div className="grid gap-3">
              {toolCategories.map((category) => {
                const count = allTools.filter(
                  (tool) => tool.category === category
                ).length;

                return (
                  <Card key={category} className="rounded-lg py-0 shadow-none">
                    <CardContent className="flex items-center justify-between gap-4 p-4">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-muted-foreground text-sm">
                        {count}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
