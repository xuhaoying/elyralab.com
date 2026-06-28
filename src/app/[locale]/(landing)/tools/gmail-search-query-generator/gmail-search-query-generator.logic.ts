export type LabelMode = 'label' | 'category';
export type QueryNoticeTone = 'info' | 'warning';

export interface FormState {
  from: string;
  to: string;
  subjectKeyword: string;
  containsWords: string;
  excludesWords: string;
  hasAttachment: boolean;
  afterDate: string;
  beforeDate: string;
  unreadOnly: boolean;
  labelMode: LabelMode;
  labelValue: string;
}

export interface Explanation {
  part: string;
  description: string;
}

export interface QueryNotice {
  tone: QueryNoticeTone;
  title: string;
  description: string;
}

export interface GeneratedResult {
  query: string;
  explanations: Explanation[];
  notices: QueryNotice[];
}

export const emptyForm: FormState = {
  from: '',
  to: '',
  subjectKeyword: '',
  containsWords: '',
  excludesWords: '',
  hasAttachment: false,
  afterDate: '',
  beforeDate: '',
  unreadOnly: false,
  labelMode: 'label',
  labelValue: '',
};

export const gmailCategories = [
  {
    value: 'primary',
    label: 'Primary',
  },
  {
    value: 'social',
    label: 'Social',
  },
  {
    value: 'promotions',
    label: 'Promotions',
  },
  {
    value: 'updates',
    label: 'Updates',
  },
  {
    value: 'forums',
    label: 'Forums',
  },
] as const;

export function quoteIfNeeded(value: string) {
  const trimmed = value.trim().replaceAll('"', '\\"');

  if (!trimmed) {
    return '';
  }

  return /\s/.test(trimmed) ? `"${trimmed}"` : trimmed;
}

export function splitTerms(value: string) {
  return value
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatGmailDate(value: string) {
  return value ? value.replaceAll('-', '/') : '';
}

export function normalizeGmailCategory(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, '-');
  return gmailCategories.some((category) => category.value === normalized)
    ? normalized
    : '';
}

export function validateGmailForm(form: FormState) {
  if (form.afterDate && form.beforeDate && form.afterDate >= form.beforeDate) {
    return 'Before date must be later than after date. Gmail treats before: as an exclusive upper bound.';
  }

  if (form.labelMode === 'category' && form.labelValue.trim()) {
    const category = normalizeGmailCategory(form.labelValue);

    if (!category) {
      return 'Choose one of Gmail’s supported categories: Primary, Social, Promotions, Updates, or Forums.';
    }
  }

  return '';
}

function addPart(parts: Explanation[], part: string, description: string) {
  if (!part.trim()) {
    return;
  }

  parts.push({
    part,
    description,
  });
}

export function buildGmailQuery(form: FormState): GeneratedResult {
  const parts: Explanation[] = [];
  const notices: QueryNotice[] = [];

  addPart(
    parts,
    form.from.trim() ? `from:${quoteIfNeeded(form.from)}` : '',
    'Matches messages from this sender.'
  );

  addPart(
    parts,
    form.to.trim() ? `to:${quoteIfNeeded(form.to)}` : '',
    'Matches messages sent to this recipient.'
  );

  addPart(
    parts,
    form.subjectKeyword.trim()
      ? `subject:${quoteIfNeeded(form.subjectKeyword)}`
      : '',
    'Looks for the keyword or phrase in the email subject.'
  );

  const containsTerms = splitTerms(form.containsWords);
  if (containsTerms.length > 0) {
    addPart(
      parts,
      containsTerms.map(quoteIfNeeded).join(' '),
      'Requires these words or phrases anywhere in the message.'
    );
  }

  const excludedTerms = splitTerms(form.excludesWords);
  if (excludedTerms.length > 0) {
    addPart(
      parts,
      excludedTerms
        .map((term) => `-${quoteIfNeeded(term.replace(/^-+/, ''))}`)
        .join(' '),
      'Excludes messages that contain these words or phrases.'
    );
  }

  if ([...containsTerms, ...excludedTerms].some((term) => /\s/.test(term))) {
    notices.push({
      tone: 'info',
      title: 'Multi-word phrases are quoted',
      description:
        'Terms separated with commas, semicolons, or line breaks stay grouped when they contain spaces.',
    });
  }

  if (form.hasAttachment) {
    addPart(
      parts,
      'has:attachment',
      'Only includes messages with attachments.'
    );
  }

  if (form.afterDate) {
    addPart(
      parts,
      `after:${formatGmailDate(form.afterDate)}`,
      'Only includes messages after this date.'
    );
  }

  if (form.beforeDate) {
    addPart(
      parts,
      `before:${formatGmailDate(form.beforeDate)}`,
      'Only includes messages before this date. Gmail treats before: as exclusive.'
    );
  }

  if (form.unreadOnly) {
    addPart(parts, 'is:unread', 'Only includes unread messages.');
  }

  if (form.labelValue.trim()) {
    const value =
      form.labelMode === 'category'
        ? normalizeGmailCategory(form.labelValue)
        : quoteIfNeeded(form.labelValue);

    if (value) {
      addPart(
        parts,
        `${form.labelMode}:${value}`,
        form.labelMode === 'category'
          ? 'Limits results to this Gmail category.'
          : 'Limits results to this Gmail label.'
      );
    }
  }

  const query = parts.map((item) => item.part).join(' ');

  if (query.length > 1200) {
    notices.push({
      tone: 'warning',
      title: 'Long query',
      description:
        'Very long Gmail searches can become hard to edit. Consider narrowing the most important filters first.',
    });
  }

  return {
    query,
    explanations: parts,
    notices,
  };
}

export function resultFileText(result: GeneratedResult) {
  if (!result.query) {
    return '';
  }

  const explanation = result.explanations
    .map((item) => `- ${item.part}: ${item.description}`)
    .join('\n');
  const notices =
    result.notices.length > 0
      ? `\n\nNotes\n${result.notices
          .map((item) => `- ${item.title}: ${item.description}`)
          .join('\n')}`
      : '';

  return `Gmail search query\n\n${result.query}\n\nExplanation\n${explanation}${notices}\n`;
}
