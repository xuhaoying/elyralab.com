'use client';

import { useMemo, useState } from 'react';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/shared/components/ui/drawer';

export function JsonPreview({
  value,
  placeholder,
  metadata,
  className,
}: {
  value: string;
  placeholder?: string;
  metadata?: Record<string, any>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  const preview = useMemo(() => {
    if (!value) {
      return '';
    }

    if (typeof value !== 'string') {
      return String(value);
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }, [value]);

  if (!value) {
    if (placeholder) {
      return <div className={`block min-w-0 ${className || ''}`}>{placeholder}</div>;
    }

    return null;
  }

  const shortPreview =
    preview.length > 60 ? `${preview.slice(0, 60)}...` : preview;
  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    toast.success(metadata?.message ?? 'Copied');
  };

  return (
    <>
      <button
        type="button"
        className={`text-muted-foreground block w-full min-w-0 cursor-pointer overflow-hidden text-left text-ellipsis whitespace-nowrap hover:underline ${className || ''}`}
        onClick={() => setOpen(true)}
      >
        {shortPreview}
      </button>
      <Drawer open={open} onOpenChange={setOpen} direction="right" handleOnly>
        {open ? (
          <DrawerContent
            className={`h-full w-full ${metadata?.drawerClassName || 'sm:max-w-4xl'}`}
          >
            <DrawerHeader className="flex flex-row items-center justify-between gap-3 text-left">
              <DrawerTitle>{metadata?.title || shortPreview}</DrawerTitle>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-sm"
                onClick={handleCopy}
              >
                <CopyIcon className="h-4 w-4" />
                <span>{metadata?.copyLabel ?? '复制'}</span>
              </button>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 select-text">
              <div className="overflow-x-auto rounded-md border">
                <div className="grid min-w-full grid-cols-[auto_1fr] text-sm">
                  {preview.split('\n').map((line, index) => (
                    <div key={index} className="contents">
                      <div className="bg-muted/40 text-muted-foreground border-r px-3 py-1 text-right select-none">
                        {index + 1}
                      </div>
                      <pre className="whitespace-pre-wrap break-all px-4 py-1">
                        {line || ' '}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        ) : null}
      </Drawer>
    </>
  );
}
