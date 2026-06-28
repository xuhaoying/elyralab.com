'use client';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

export function PromptEllipsis({
  value,
  className,
  enableCopy = false,
  copyLabel,
  copiedLabel,
}: {
  value?: string | null;
  className?: string;
  enableCopy?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
}) {
  if (!value) {
    return <div className={className}>-</div>;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(copiedLabel || 'Copied');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className || ''}`.trim()}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[220px] truncate text-left sm:max-w-[280px]">
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-h-80 max-w-sm overflow-y-auto whitespace-pre-wrap break-words"
        >
          {value}
        </TooltipContent>
      </Tooltip>
      {enableCopy && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleCopy}
              aria-label={copyLabel || 'Copy'}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">{copyLabel || 'Copy'}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
