import { notFound } from 'next/navigation';
import { getToolBySlug } from '@/lib/tools';
import { setRequestLocale } from 'next-intl/server';

import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { GoogleReviewReplyGenerator } from './google-review-reply-generator';

const toolSlug = 'google-review-reply-generator';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'Google Review Reply Generator | ElyraLab',
  description:
    'Generate professional, short, and warmer Google review replies with recommended version guidance and a public posting checklist.',
  keywords:
    'Google review reply generator, review response templates, business review replies, local business reputation',
  canonicalUrl: '/tools/google-review-reply-generator',
});

export default async function GoogleReviewReplyGeneratorPage({
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
      <GoogleReviewReplyGenerator toolSlug={tool.slug} />
    </ToolLayout>
  );
}
