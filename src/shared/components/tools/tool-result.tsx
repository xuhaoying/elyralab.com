'use client';

import { ReactNode } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

import { CopyButton } from './copy-button';
import { DownloadButton } from './download-button';

export function ToolResult({
  title = 'Result',
  description,
  result,
  downloadText,
  emptyState = 'Complete the form to generate a result.',
  filename,
  toolSlug,
  copyLabel,
  children,
}: {
  title?: string;
  description?: string;
  result: string;
  downloadText?: string;
  emptyState?: string;
  filename: string;
  toolSlug: string;
  copyLabel?: string;
  children?: ReactNode;
}) {
  const hasResult = result.trim().length > 0;

  return (
    <Card className="rounded-lg">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <CopyButton
              text={result}
              toolSlug={toolSlug}
              disabled={!hasResult}
              label={copyLabel}
            />
            <DownloadButton
              text={downloadText || result}
              filename={filename}
              toolSlug={toolSlug}
              disabled={!hasResult}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasResult ? (
          <pre className="bg-muted text-foreground overflow-x-auto rounded-md border p-4 text-sm leading-6 whitespace-pre-wrap">
            <code>{result}</code>
          </pre>
        ) : (
          <div className="bg-muted/60 text-muted-foreground rounded-md border border-dashed p-4 text-sm">
            {emptyState}
          </div>
        )}
        {hasResult && children ? <div>{children}</div> : null}
      </CardContent>
    </Card>
  );
}
