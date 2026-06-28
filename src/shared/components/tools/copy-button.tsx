'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export function CopyButton({
  text,
  toolSlug,
  disabled,
  label = 'Copy',
  copiedLabel = 'Copied',
}: {
  text: string;
  toolSlug: string;
  disabled?: boolean;
  label?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) {
      return;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }

    trackToolEvent('copy_result', {
      tool_slug: toolSlug,
      character_count: text.length,
    });
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={copied ? `${copiedLabel} result` : `${label} result`}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span>{copied ? copiedLabel : label}</span>
    </Button>
  );
}
