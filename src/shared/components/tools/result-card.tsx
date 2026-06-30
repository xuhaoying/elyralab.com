import { ReactNode } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

export type ResultTone = 'low' | 'medium' | 'high' | 'neutral';

const toneClasses: Record<ResultTone, string> = {
  low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  medium:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  high: 'border-destructive/30 bg-destructive/10 text-destructive',
  neutral: 'border-primary/30 bg-primary/10 text-primary',
};

export function ResultCard({
  title = 'Result',
  description,
  label,
  tone = 'neutral',
  summary,
  recommendedNextSteps,
  emptyState = 'Complete the form to generate a result.',
  children,
}: {
  title?: string;
  description?: string;
  label?: string;
  tone?: ResultTone;
  summary?: string;
  recommendedNextSteps?: string[];
  emptyState?: string;
  children?: ReactNode;
}) {
  const hasResult = Boolean(summary || label || children);

  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {label ? (
            <Badge variant="outline" className={cn('w-fit', toneClasses[tone])}>
              {label}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasResult ? (
          <>
            {summary ? (
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-semibold">Summary</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {summary}
                </p>
              </div>
            ) : null}

            {recommendedNextSteps && recommendedNextSteps.length > 0 ? (
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-semibold">
                  Recommended next steps
                </h3>
                <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
                  {recommendedNextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {children}
          </>
        ) : (
          <div className="bg-muted/60 text-muted-foreground rounded-md border border-dashed p-4 text-sm">
            {emptyState}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
