import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getToolBySlug } from '@/lib/tools';
import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { DogFireworksAnxietyChecklist } from './dog-fireworks-anxiety-checklist';

const toolSlug = 'dog-fireworks-anxiety-checklist';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'Free Dog Fireworks Anxiety Plan Generator | Elyra Lab',
  description:
    'Answer a few questions and get a printable dog or cat safety plan for fireworks, thunderstorms, and other loud-noise events.',
  keywords:
    'dog fireworks anxiety checklist, July 4 dog anxiety plan, pet noise anxiety, cat fireworks anxiety, thunderstorm pet safety',
  canonicalUrl: '/tools/dog-fireworks-anxiety-checklist',
});

export default async function DogFireworksAnxietyChecklistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!tool) {
    notFound();
  }

  return (
    <ToolLayout tool={tool}>
      <DogFireworksAnxietyChecklist toolSlug={tool.slug} />
    </ToolLayout>
  );
}
