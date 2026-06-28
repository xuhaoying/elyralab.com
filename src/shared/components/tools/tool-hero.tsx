import { ReactNode } from 'react';

import { ToolDefinition } from '@/lib/tools';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

import { ToolIcon } from './tool-icon';

export function ToolHero({
  eyebrow,
  title,
  description,
  tool,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  tool?: Pick<ToolDefinition, 'category' | 'status' | 'icon'>;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('container pt-24 pb-10 md:pt-32 md:pb-14', className)}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {tool?.icon ? (
              <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
                <ToolIcon name={tool.icon} />
              </span>
            ) : null}
            {eyebrow ? <Badge variant="outline">{eyebrow}</Badge> : null}
            {tool?.category ? (
              <Badge variant="secondary">{tool.category}</Badge>
            ) : null}
            {tool?.status === 'planned' ? (
              <Badge variant="outline">Planned</Badge>
            ) : null}
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-normal text-balance md:text-5xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-7 text-balance md:text-lg">
              {description}
            </p>
          </div>
        </div>

        {children ? <div className="lg:justify-self-end">{children}</div> : null}
      </div>
    </section>
  );
}
