import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';

import { getToolBySlug } from '@/lib/tools';
import { ToolLayout } from '@/shared/components/tools';
import { getMetadata } from '@/shared/lib/seo';

import { BNPLPaymentCalendar } from './bnpl-payment-calendar';

const toolSlug = 'bnpl-payment-calendar';
const tool = getToolBySlug(toolSlug);

export const generateMetadata = getMetadata({
  title: 'BNPL Payment Calendar | ElyraLab',
  description:
    'Create a buy-now-pay-later payment schedule with payment dates, amount per payment, total amount, next due dates, checklist copy, and CSV download.',
  keywords:
    'BNPL payment calendar, buy now pay later schedule, installment payment planner, payment checklist, payment CSV',
  canonicalUrl: '/tools/bnpl-payment-calendar',
});

export default async function BNPLPaymentCalendarPage({
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
      <BNPLPaymentCalendar toolSlug={tool.slug} />
    </ToolLayout>
  );
}
