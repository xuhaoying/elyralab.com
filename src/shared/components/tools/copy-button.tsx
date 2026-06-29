'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import type { AnalyticsProperties } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';

const CLIPBOARD_WRITE_TIMEOUT_MS = 800;

function fallbackCopy(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  return copied;
}

async function writeClipboard(text: string) {
  if (!navigator.clipboard?.writeText) {
    return false;
  }

  try {
    const writePromise = navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
    const timeoutPromise = new Promise<boolean>((resolve) => {
      window.setTimeout(() => resolve(false), CLIPBOARD_WRITE_TIMEOUT_MS);
    });

    return await Promise.race([writePromise, timeoutPromise]);
  } catch {
    return false;
  }
}

export function CopyButton({
  text,
  toolSlug,
  disabled,
  label = 'Copy',
  copiedLabel = 'Copied',
  analyticsProperties,
}: {
  text: string;
  toolSlug: string;
  disabled?: boolean;
  label?: string;
  copiedLabel?: string;
  analyticsProperties?: AnalyticsProperties;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    if (!text) {
      return;
    }

    try {
      const copiedWithClipboard = await writeClipboard(text);

      if (!copiedWithClipboard && !fallbackCopy(text)) {
        throw new Error('Copy failed');
      }

      trackToolEvent('copy_result', {
        tool_slug: toolSlug,
        character_count: text.length,
        ...analyticsProperties,
      });
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2000);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleCopy}
      disabled={disabled || !text}
      aria-label={
        failed
          ? 'Copy failed'
          : copied
            ? `${copiedLabel} result`
            : `${label} result`
      }
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      <span>{failed ? 'Copy failed' : copied ? copiedLabel : label}</span>
    </Button>
  );
}
