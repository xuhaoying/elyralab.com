import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getToolBySlug } from '@/lib/tools';
import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { NoCookHeatwaveMealPlanner } from './no-cook-heatwave-meal-planner';

const toolSlug = 'no-cook-heatwave-meal-planner';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'No-Cook Heatwave Meal Planner | Elyra Lab',
  description:
    'Create a simple no-cook meal plan and grocery list for hot days, dorms, small kitchens, and heatwave weeks.',
  keywords:
    'no-cook heatwave meal planner, no cook meals, heatwave meals, dorm meal plan, small kitchen meal prep',
  canonicalUrl: '/tools/no-cook-heatwave-meal-planner',
});

export default async function NoCookHeatwaveMealPlannerPage({
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
      <NoCookHeatwaveMealPlanner toolSlug={tool.slug} />
    </ToolLayout>
  );
}
