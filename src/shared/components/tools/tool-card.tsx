import { ArrowRight } from 'lucide-react';

import { ToolDefinition } from '@/lib/tools';
import { Link } from '@/core/i18n/navigation';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

import { ToolIcon } from './tool-icon';

function CardInner({ tool }: { tool: ToolDefinition }) {
  return (
    <>
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-md">
            <ToolIcon name={tool.icon} />
          </span>
          <Badge variant={tool.status === 'available' ? 'secondary' : 'outline'}>
            {tool.status === 'available' ? 'Available' : 'Planned'}
          </Badge>
        </div>
        <div className="space-y-2">
          <CardTitle className="leading-snug">{tool.name}</CardTitle>
          <CardDescription className="leading-6">{tool.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="mt-auto flex items-center justify-between gap-4">
        <Badge variant="outline">{tool.category}</Badge>
        <span className="text-muted-foreground inline-flex items-center gap-1 text-sm">
          {tool.status === 'available' ? 'Open' : 'Coming soon'}
          {tool.status === 'available' ? <ArrowRight className="size-4" /> : null}
        </span>
      </CardContent>
    </>
  );
}

export function ToolCard({
  tool,
  className,
}: {
  tool: ToolDefinition;
  className?: string;
}) {
  const cardClassName = cn(
    'h-full rounded-lg transition-colors',
    tool.status === 'available' ? 'hover:border-primary/40' : 'opacity-80',
    className
  );

  if (tool.status === 'available') {
    return (
      <Link href={tool.href} className="block h-full">
        <Card className={cardClassName}>
          <CardInner tool={tool} />
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cardClassName} aria-disabled="true">
      <CardInner tool={tool} />
    </Card>
  );
}
