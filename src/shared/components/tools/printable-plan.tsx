'use client';

import { ReactNode } from 'react';
import { Printer } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

export function PrintablePlan({
  title = 'Printable plan',
  description,
  disabled,
  emptyState = 'Generate a result to print or save as PDF.',
  printLabel = 'Print / Save as PDF',
  toolSlug,
  children,
}: {
  title?: string;
  description?: string;
  disabled?: boolean;
  emptyState?: string;
  printLabel?: string;
  toolSlug: string;
  children: ReactNode;
}) {
  function handlePrint() {
    if (disabled) {
      return;
    }

    trackToolEvent('print_result', { tool_slug: toolSlug });
    window.print();
  }

  return (
    <Card className="rounded-lg" data-print-root>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          <div data-print-hidden="true">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrint}
              disabled={disabled}
            >
              <Printer className="size-4" />
              {printLabel}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {disabled ? (
          <div className="bg-muted/60 text-muted-foreground rounded-md border border-dashed p-4 text-sm">
            {emptyState}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
