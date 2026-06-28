import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getToolBySlug } from '@/lib/tools';
import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { AISearchReadinessChecker } from './ai-search-readiness-checker';

const toolSlug = 'ai-search-readiness-checker';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'AI Search Readiness Checker | ElyraLab',
  description:
    'Run a self-assessment for AI search readiness across brand clarity, entity information, FAQ coverage, schema, llms.txt, pricing pages, and original data.',
  keywords:
    'AI search readiness checker, answer engine optimization, llms.txt checker, schema checklist, AI SEO self assessment',
  canonicalUrl: '/tools/ai-search-readiness-checker',
});

export default async function AISearchReadinessCheckerPage({
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
      <AISearchReadinessChecker toolSlug={tool.slug} />
    </ToolLayout>
  );
}
