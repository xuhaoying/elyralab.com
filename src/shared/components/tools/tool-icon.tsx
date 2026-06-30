import {
  CalendarDays,
  Calculator,
  MailSearch,
  MessageSquareReply,
  PawPrint,
  Plane,
  Salad,
  SearchCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  CalendarDays,
  Calculator,
  MailSearch,
  MessageSquareReply,
  PawPrint,
  Plane,
  Salad,
  SearchCheck,
};

export function ToolIcon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Icon = name ? iconMap[name] || Wrench : Wrench;

  return <Icon aria-hidden="true" className={cn('size-5', className)} />;
}
