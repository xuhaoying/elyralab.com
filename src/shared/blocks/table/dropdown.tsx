'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { NavItem } from '@/shared/types/blocks/common';

function guessFileExtension(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    return match?.[1] || 'bin';
  } catch {
    return 'bin';
  }
}

export function Dropdown({
  value,
  placeholder,
  metadata,
  className,
}: {
  value: NavItem[];
  placeholder?: string;
  metadata: Record<string, any>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const t = useTranslations('common');

  if (!value || value.length === 0) {
    return null;
  }

  const handleDownload = async (item: NavItem, index: number) => {
    const downloads = item.downloads || [];
    const taskId = item.taskId || 'download';

    if (downloads.length === 0) {
      return;
    }

    const key = `${item.title}-${index}`;
    setLoadingKey(key);

    try {
      let successCount = 0;

      for (const [downloadIndex, url] of downloads.entries()) {
        const response = await fetch(
          `/api/proxy/file?url=${encodeURIComponent(url)}`
        );
        if (!response.ok) {
          throw new Error('download failed');
        }

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${taskId}-${downloadIndex + 1}.${guessFileExtension(url)}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
        successCount += 1;
      }

      if (successCount === downloads.length) {
        setOpen(false);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error(t('messages.download_failed'));
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <MoreHorizontal />
          <span className="sr-only">{t('actions.open_menu')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {value?.map((item, index) => {
          const itemKey = `${item.title}-${index}`;
          const isDownloading = loadingKey === itemKey;
          const hasDownloads = Array.isArray((item as any).downloads);

          return (
            <DropdownMenuItem
              key={itemKey}
              onSelect={hasDownloads ? (event) => event.preventDefault() : undefined}
            >
              {hasDownloads ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2"
                  onClick={() => void handleDownload(item, index)}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : item.icon ? (
                    <SmartIcon name={item.icon as string} className="h-4 w-4" />
                  ) : null}
                  {item.title}
                </button>
              ) : (
                <Link
                  href={item.url || ''}
                  target={item.target || '_self'}
                  className="flex w-full items-center gap-2"
                >
                  {item.icon && (
                    <SmartIcon name={item.icon as string} className="h-4 w-4" />
                  )}
                  {item.title}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
