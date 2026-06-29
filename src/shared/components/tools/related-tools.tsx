'use client';

import { ArrowRight } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { getToolAccessLabel, ToolDefinition } from '@/lib/tools';
import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';

import { ToolIcon } from './tool-icon';

export function RelatedTools({
  currentSlug,
  tools,
}: {
  currentSlug: string;
  tools: ToolDefinition[];
}) {
  if (tools.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-tools-heading" className="space-y-4">
      <div className="space-y-1">
        <h2 id="related-tools-heading" className="text-lg font-semibold">
          Related tools
        </h2>
        <p className="text-muted-foreground text-sm">
          More tools in the ElyraLab library.
        </p>
      </div>

      <div className="grid gap-3">
        {tools.map((tool) => (
          <Card key={tool.slug} className="rounded-lg py-0 shadow-none">
            <CardContent className="p-4">
              <Link
                href={tool.href}
                className="group grid grid-cols-[auto_1fr_auto] items-start gap-3"
                onClick={() =>
                  trackToolEvent('related_tool_click', {
                    from_tool_slug: currentSlug,
                    related_tool_slug: tool.slug,
                    related_tool_status: tool.status,
                  })
                }
              >
                <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-md">
                  <ToolIcon name={tool.icon} className="size-4" />
                </span>
                <span className="min-w-0 space-y-1">
                  <span className="block text-sm font-medium">{tool.name}</span>
                  <span className="text-muted-foreground line-clamp-2 block text-xs leading-5">
                    {tool.description}
                  </span>
                  <Badge variant="outline">{getToolAccessLabel(tool.access)}</Badge>
                </span>
                <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
