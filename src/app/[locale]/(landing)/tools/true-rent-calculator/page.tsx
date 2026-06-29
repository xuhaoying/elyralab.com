import { notFound } from 'next/navigation';
import { getToolBySlug } from '@/lib/tools';
import { setRequestLocale } from 'next-intl/server';

import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { TrueRentCalculator } from './true-rent-calculator';

const toolSlug = 'true-rent-calculator';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'True Rent Calculator | ElyraLab',
  description:
    'Calculate true monthly rent, first-month move-in cash, net lease cost, annualized housing cost, and refundable deposit impact.',
  keywords:
    'true rent calculator, apartment fee calculator, move in cost calculator, rent budget calculator',
  canonicalUrl: '/tools/true-rent-calculator',
});

export default async function TrueRentCalculatorPage({
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
      <TrueRentCalculator toolSlug={tool.slug} />
    </ToolLayout>
  );
}
