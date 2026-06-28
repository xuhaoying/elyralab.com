function normalizePromptSegment(value: string) {
  return value
    .replace(/\{argument\s+name="[^"]*"(?:\s+default="[^"]*")?\s*\}/gi, '')
    .replace(/argument\s+name=\\?"([^"]+)\\?"(?:\s+default=\\?"([^"]*)\\?")?/gi, (_match, name, defaultValue) => {
      const normalizedName = String(name || '').trim();
      const normalizedDefault = String(defaultValue || '').trim();
      if (normalizedName && normalizedDefault) {
        return `${normalizedName}: ${normalizedDefault}`;
      }
      return normalizedName || normalizedDefault || '';
    })
    .replace(/\\+"/g, '"')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[{[]+|[}\]]+$/g, '')
    .trim();
}

function extractStructuredPreview(value: string) {
  const captureQuotedValue = (key: string) => {
    const pattern = new RegExp(
      `"${key}"\\s*:\\s*"((?:\\\\.|[^"])*)"`,
      'i'
    );
    const match = value.match(pattern);
    return match?.[1] || '';
  };

  const primaryKeys = ['type', 'title'];
  for (const key of primaryKeys) {
    const normalized = normalizePromptSegment(captureQuotedValue(key));
    if (normalized) {
      return [normalized];
    }
  }

  const fallbackKeys = ['prompt', 'text', 'description'];
  for (const key of fallbackKeys) {
    const normalized = normalizePromptSegment(captureQuotedValue(key));
    if (normalized) {
      return [normalized];
    }
  }

  return [];
}

function collectPromptSegments(
  value: unknown,
  results: string[],
  limit: number
) {
  if (results.length >= limit || value == null) {
    return;
  }

  if (typeof value === 'string') {
    const normalized = normalizePromptSegment(value);
    if (normalized && !results.includes(normalized)) {
      results.push(normalized);
    }
    return;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    const normalized = String(value);
    if (!results.includes(normalized)) {
      results.push(normalized);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectPromptSegments(item, results, limit);
      if (results.length >= limit) {
        break;
      }
    }
    return;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    const preferredKeys = [
      'type',
      'title',
      'subject',
      'description',
      'prompt',
      'text',
      'style',
      'scene',
    ];

    for (const key of preferredKeys) {
      const matched = entries.find(([entryKey]) => entryKey === key);
      if (matched) {
        collectPromptSegments(matched[1], results, limit);
        if (results.length >= limit) {
          return;
        }
      }
    }

    for (const [, entryValue] of entries) {
      collectPromptSegments(entryValue, results, limit);
      if (results.length >= limit) {
        break;
      }
    }
  }
}

export function getPromptPreviewText(value?: string | null, maxLength = 160) {
  if (!value) {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (!/^[\[{]/.test(trimmed)) {
    return normalizePromptSegment(trimmed);
  }

  try {
    const parsed = JSON.parse(trimmed);
    const segments: string[] = [];
    collectPromptSegments(parsed, segments, 4);
    const preview = segments.join(' · ');

    if (!preview) {
      return normalizePromptSegment(trimmed);
    }

    return preview.length > maxLength
      ? `${preview.slice(0, maxLength).trimEnd()}...`
      : preview;
  } catch {
    const fallbackSegments = extractStructuredPreview(trimmed);
    const fallbackPreview = fallbackSegments.join(' · ');

    if (fallbackPreview) {
      return fallbackPreview.length > maxLength
        ? `${fallbackPreview.slice(0, maxLength).trimEnd()}...`
        : fallbackPreview;
    }

    return normalizePromptSegment(trimmed);
  }
}
