import { notFound } from 'next/navigation';
import { getToolBySlug } from '@/lib/tools';
import { setRequestLocale } from 'next-intl/server';

import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { AirlineRefundClaimLetterGenerator } from './airline-refund-claim-letter-generator';

const toolSlug = 'airline-refund-claim-letter-generator';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'Airline Refund Claim Letter Generator | ElyraLab',
  description:
    'Generate an airline refund, compensation, voucher, or rebooking claim package with a letter, subject line, evidence checklist, and follow-up plan.',
  keywords:
    'airline refund claim letter, flight refund letter, flight compensation claim, cancelled flight refund, denied boarding claim',
  canonicalUrl: '/tools/airline-refund-claim-letter-generator',
});

export default async function AirlineRefundClaimLetterGeneratorPage({
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
      <AirlineRefundClaimLetterGenerator toolSlug={tool.slug} />
    </ToolLayout>
  );
}
