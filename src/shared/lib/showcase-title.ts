import { getPromptPreviewText } from '@/shared/lib/prompt-preview';

const GENERIC_TITLES = new Set(['ai image', 'image']);

function normalizeTitle(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function truncateTitle(value: string, maxLength: number) {
  const normalized = normalizeTitle(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function isGenericTitle(value: string) {
  return GENERIC_TITLES.has(normalizeTitle(value).toLowerCase());
}

function extractTitleFromPromptValue(value: unknown): string {
  if (typeof value === 'string') {
    const normalized = normalizeTitle(value);
    if (!normalized || isGenericTitle(normalized)) {
      return '';
    }
    return normalized;
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const record = value as Record<string, unknown>;
  const preferredKeys = [
    'prompt',
    'text',
    'description',
    'subject',
    'scene',
    'title',
    'type',
  ];

  for (const key of preferredKeys) {
    const candidate = extractTitleFromPromptValue(record[key]);
    if (candidate) {
      return candidate;
    }
  }

  for (const nestedValue of Object.values(record)) {
    const candidate = extractTitleFromPromptValue(nestedValue);
    if (candidate) {
      return candidate;
    }
  }

  return '';
}

function getMeaningfulPromptTitle(rawPrompt: string) {
  if (!/^[\[{]/.test(rawPrompt)) {
    return rawPrompt;
  }

  try {
    return extractTitleFromPromptValue(JSON.parse(rawPrompt)) || rawPrompt;
  } catch {
    return rawPrompt;
  }
}

export function buildShowcaseTitleFromPrompt(prompt?: string | null) {
  const rawPrompt = normalizeTitle(prompt || '');
  if (!rawPrompt) {
    return 'AI Image';
  }

  const meaningfulPrompt = normalizeTitle(getMeaningfulPromptTitle(rawPrompt));
  const preview = normalizeTitle(getPromptPreviewText(meaningfulPrompt, 120));
  const firstSegment = normalizeTitle(
    preview.split(/\s*[,.，。;；|｜·]\s*/)[0] || ''
  );
  let title = firstSegment || preview || meaningfulPrompt || rawPrompt;

  if (isGenericTitle(title)) {
    title = meaningfulPrompt || rawPrompt;
  }

  if (title === meaningfulPrompt || title === rawPrompt) {
    const words = title.split(/\s+/).filter(Boolean);
    if (words.length > 6) {
      title = `${words.slice(0, 6).join(' ')}...`;
    } else if (title.length > 24) {
      title = truncateTitle(title, 24);
    }
  }

  return truncateTitle(title, 80) || 'AI Image';
}
