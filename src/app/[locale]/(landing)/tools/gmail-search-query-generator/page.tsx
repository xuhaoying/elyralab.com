import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getToolBySlug } from '@/lib/tools';
import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { GmailSearchQueryGenerator } from './gmail-search-query-generator';

const toolSlug = 'gmail-search-query-generator';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'Gmail Search Query Generator | ElyraLab',
  description:
    'Build precise Gmail search queries from sender, recipient, subject, words, attachments, dates, unread status, and label or category filters.',
  keywords:
    'Gmail search query generator, Gmail operators, Gmail search filters, email search',
  canonicalUrl: '/tools/gmail-search-query-generator',
});

export default async function GmailSearchQueryGeneratorPage({
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
      <GmailSearchQueryGenerator toolSlug={tool.slug} />
    </ToolLayout>
  );
}
