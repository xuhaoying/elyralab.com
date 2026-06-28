'use client';

import { Download } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';

export function DownloadButton({
  text,
  filename,
  toolSlug,
  disabled,
}: {
  text: string;
  filename: string;
  toolSlug: string;
  disabled?: boolean;
}) {
  function handleDownload() {
    if (!text) {
      return;
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    trackToolEvent('download_result', {
      tool_slug: toolSlug,
      filename,
      character_count: text.length,
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleDownload}
      disabled={disabled || !text}
    >
      <Download className="size-4" />
      <span>Download .txt</span>
    </Button>
  );
}
