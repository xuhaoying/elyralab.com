export type BinaryAnswer = 'yes' | 'no';
export type TernaryAnswer = 'yes' | 'no' | 'unknown';
export type AssessmentKey =
  | 'hasAboutPage'
  | 'hasFaqPage'
  | 'hasProductPages'
  | 'hasAuthorInfo'
  | 'hasStructuredData'
  | 'hasLlmsTxt'
  | 'hasPricingPages'
  | 'hasOriginalResearch';

export interface FormState {
  websiteUrl: string;
  brandName: string;
  targetAudience: string;
  hasAboutPage: BinaryAnswer;
  hasFaqPage: BinaryAnswer;
  hasProductPages: BinaryAnswer;
  hasAuthorInfo: BinaryAnswer;
  hasStructuredData: TernaryAnswer;
  hasLlmsTxt: TernaryAnswer;
  hasPricingPages: BinaryAnswer;
  hasOriginalResearch: BinaryAnswer;
}

export interface AssessmentItem {
  key: AssessmentKey;
  label: string;
  description: string;
  recommendation: string;
  weight: number;
  answer: TernaryAnswer;
}

export interface PriorityAction {
  title: string;
  impact: 'High' | 'Medium';
  why: string;
  action: string;
}

export interface ReadinessResult {
  score: number;
  level: string;
  strengths: string[];
  missingItems: string[];
  priorityChecklist: string[];
  topPriorities: PriorityAction[];
  scoreBandAction: string;
  recommendations: string[];
  summary: string;
  items: AssessmentItem[];
}

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export interface ValidationResult {
  message: string;
  fieldErrors: FieldErrors;
}

export const emptyForm: FormState = {
  websiteUrl: '',
  brandName: '',
  targetAudience: '',
  hasAboutPage: 'no',
  hasFaqPage: 'no',
  hasProductPages: 'no',
  hasAuthorInfo: 'no',
  hasStructuredData: 'unknown',
  hasLlmsTxt: 'unknown',
  hasPricingPages: 'no',
  hasOriginalResearch: 'no',
};

export const assessmentConfig: Array<
  Omit<AssessmentItem, 'answer'> & { key: AssessmentKey }
> = [
  {
    key: 'hasProductPages',
    label: 'Clear product or service pages',
    description:
      'AI systems need crawlable pages that explain what you offer, who it is for, and why it is different.',
    recommendation:
      'Create or improve product/service pages with clear use cases, benefits, proof points, and plain-language descriptions.',
    weight: 18,
  },
  {
    key: 'hasStructuredData',
    label: 'Structured data/schema',
    description:
      'Schema helps search systems understand entities, products, organizations, articles, FAQs, and reviews.',
    recommendation:
      'Add appropriate JSON-LD schema such as Organization, Product, Service, FAQPage, Article, BreadcrumbList, or Review where relevant.',
    weight: 16,
  },
  {
    key: 'hasOriginalResearch',
    label: 'Original research or unique data',
    description:
      'Unique data, benchmarks, examples, or research give AI search systems something distinctive to cite.',
    recommendation:
      'Publish original data, benchmarks, teardown examples, customer insights, or proprietary methodology pages.',
    weight: 14,
  },
  {
    key: 'hasAuthorInfo',
    label: 'Author or company information',
    description:
      'Clear ownership and expertise signals help establish who is responsible for the content.',
    recommendation:
      'Add author bios, editorial ownership, company details, contact information, and credentials where relevant.',
    weight: 12,
  },
  {
    key: 'hasFaqPage',
    label: 'FAQ page',
    description:
      'Question-and-answer content maps well to AI answer formats and long-tail search intent.',
    recommendation:
      'Build FAQ content around real buyer questions, objections, pricing concerns, alternatives, and implementation details.',
    weight: 12,
  },
  {
    key: 'hasAboutPage',
    label: 'About page',
    description:
      'A strong About page clarifies the brand entity, mission, audience, location, and trust signals.',
    recommendation:
      'Create an About page that explains who you are, who you serve, what you do, and why the brand is credible.',
    weight: 10,
  },
  {
    key: 'hasPricingPages',
    label: 'Pricing or comparison pages',
    description:
      'Commercial-intent pages help AI systems answer buying and comparison questions accurately.',
    recommendation:
      'Add pricing, plans, alternatives, competitor comparison, or buying-guide pages when appropriate.',
    weight: 10,
  },
  {
    key: 'hasLlmsTxt',
    label: 'llms.txt',
    description:
      'An llms.txt file can point AI systems to important documentation, policies, and canonical content.',
    recommendation:
      'Consider adding llms.txt with concise links to important product, docs, policy, and knowledge-base pages.',
    weight: 8,
  },
];

const binaryFields: AssessmentKey[] = [
  'hasAboutPage',
  'hasFaqPage',
  'hasProductPages',
  'hasAuthorInfo',
  'hasPricingPages',
  'hasOriginalResearch',
];
const ternaryFields: AssessmentKey[] = ['hasStructuredData', 'hasLlmsTxt'];
const binaryAnswers = new Set<TernaryAnswer>(['yes', 'no']);
const ternaryAnswers = new Set<TernaryAnswer>(['yes', 'no', 'unknown']);

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);

    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname) {
      return '';
    }

    return url.toString();
  } catch {
    return '';
  }
}

export function validateReadinessForm(form: FormState): ValidationResult {
  const fieldErrors: FieldErrors = {};
  const brandName = clean(form.brandName);
  const targetAudience = clean(form.targetAudience);

  if (!form.websiteUrl.trim()) {
    fieldErrors.websiteUrl = 'Enter the website URL.';
  } else if (!normalizeWebsiteUrl(form.websiteUrl)) {
    fieldErrors.websiteUrl = 'Enter a valid http or https website URL.';
  }

  if (!brandName) {
    fieldErrors.brandName = 'Enter the brand name.';
  } else if (brandName.length > 100) {
    fieldErrors.brandName = 'Keep the brand name under 100 characters.';
  }

  if (!targetAudience) {
    fieldErrors.targetAudience = 'Enter the target audience.';
  } else if (targetAudience.length > 250) {
    fieldErrors.targetAudience =
      'Keep the target audience under 250 characters.';
  }

  for (const key of binaryFields) {
    if (!binaryAnswers.has(form[key])) {
      fieldErrors[key] = 'Choose yes or no.';
    }
  }

  for (const key of ternaryFields) {
    if (!ternaryAnswers.has(form[key])) {
      fieldErrors[key] = 'Choose yes, no, or unknown.';
    }
  }

  const firstError = Object.values(fieldErrors)[0] || '';

  return {
    fieldErrors,
    message: firstError,
  };
}

function normalizedForm(form: FormState): FormState {
  return {
    ...form,
    websiteUrl: normalizeWebsiteUrl(form.websiteUrl),
    brandName: clean(form.brandName),
    targetAudience: clean(form.targetAudience),
  };
}

export function answerScore(answer: TernaryAnswer, weight: number) {
  if (answer === 'yes') {
    return weight;
  }

  if (answer === 'unknown') {
    return Math.round(weight * 0.25);
  }

  return 0;
}

export function getReadinessLevel(score: number) {
  if (score >= 80) {
    return 'Strong';
  }

  if (score >= 60) {
    return 'Developing';
  }

  if (score >= 40) {
    return 'Early';
  }

  return 'Needs foundation work';
}

export function getScoreBandAction(score: number) {
  if (score >= 80) {
    return 'Defend the lead: keep entity pages current, add fresh proof points, and monitor how AI search tools describe the brand.';
  }

  if (score >= 60) {
    return 'Close the highest-weight gaps first, then add distinctive proof that AI systems can cite instead of generic category language.';
  }

  if (score >= 40) {
    return 'Build the crawlable foundation before chasing advanced tactics: product pages, ownership signals, FAQ content, and schema.';
  }

  return 'Start with foundations: make the offer, audience, ownership, and core pages clear before spending time on advanced AI-search tactics.';
}

export function buildItems(form: FormState) {
  return assessmentConfig.map((item) => ({
    ...item,
    answer: form[item.key],
  }));
}

export function buildTopPriorities(items: AssessmentItem[]) {
  return items
    .filter((item) => item.answer !== 'yes')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((item) => ({
      title:
        item.answer === 'unknown'
          ? `Verify ${item.label.toLowerCase()}`
          : `Improve ${item.label.toLowerCase()}`,
      impact: item.weight >= 14 ? 'High' : 'Medium',
      why: item.description,
      action: item.recommendation,
    })) satisfies PriorityAction[];
}

export function buildResult(form: FormState): ReadinessResult {
  const normalized = normalizedForm(form);
  const items = buildItems(normalized);
  const score = items.reduce(
    (total, item) => total + answerScore(item.answer, item.weight),
    0
  );
  const strengths = items
    .filter((item) => item.answer === 'yes')
    .map((item) => item.label);
  const missingItems = items
    .filter((item) => item.answer !== 'yes')
    .map((item) =>
      item.answer === 'unknown'
        ? `${item.label} needs verification`
        : item.label
    );
  const priorityChecklist = items
    .filter((item) => item.answer !== 'yes')
    .sort((a, b) => b.weight - a.weight)
    .map((item) =>
      item.answer === 'unknown'
        ? `Verify ${item.label.toLowerCase()}`
        : `Add ${item.label.toLowerCase()}`
    );
  const recommendations = items
    .filter((item) => item.answer !== 'yes')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((item) => item.recommendation);
  const level = getReadinessLevel(score);
  const topPriorities = buildTopPriorities(items);
  const scoreBandAction = getScoreBandAction(score);
  const unknownCount = items.filter((item) => item.answer === 'unknown').length;
  const prioritySummary =
    topPriorities.length > 0
      ? ` Start with ${topPriorities
          .map((item) => item.title.toLowerCase())
          .join(', ')}.`
      : ' Keep refreshing proof points and monitor brand answers over time.';
  const summary = `${normalized.brandName} scores ${score}/100 for AI search readiness. The current level is ${level.toLowerCase()}. The strongest path forward is to make the site easier for AI systems to understand, cite, and connect to ${normalized.targetAudience}.${prioritySummary}${unknownCount > 0 ? ` ${unknownCount} item${unknownCount === 1 ? '' : 's'} should be verified because unknown answers receive partial credit only.` : ''}`;

  return {
    score,
    level,
    strengths,
    missingItems,
    priorityChecklist,
    topPriorities,
    scoreBandAction,
    recommendations,
    summary,
    items,
  };
}

export function resultText(form: FormState, result: ReadinessResult) {
  const normalized = normalizedForm(form);
  const lines = [
    'AI search readiness score',
    '',
    `Website URL: ${normalized.websiteUrl}`,
    `Brand name: ${normalized.brandName}`,
    `Target audience: ${normalized.targetAudience}`,
    `AI search readiness score: ${result.score}/100`,
    `Readiness level: ${result.level}`,
    '',
    'Summary:',
    result.summary,
    '',
    'Score-band strategy:',
    result.scoreBandAction,
    '',
    'Strengths:',
    ...(result.strengths.length > 0
      ? result.strengths.map((item) => `- ${item}`)
      : ['- No strengths selected yet.']),
    '',
    'Missing items:',
    ...(result.missingItems.length > 0
      ? result.missingItems.map((item) => `- ${item}`)
      : ['- No major missing items selected.']),
    '',
    'Priority checklist:',
    ...(result.priorityChecklist.length > 0
      ? result.priorityChecklist.map((item) => `[ ] ${item}`)
      : [
          '[ ] Maintain current AI-search foundations and refresh content regularly.',
        ]),
    '',
    'Top 3 priority actions:',
    ...(result.topPriorities.length > 0
      ? result.topPriorities.map(
          (item, index) =>
            `${index + 1}. ${item.title} (${item.impact} impact): ${item.action}`
        )
      : ['1. Keep the strongest pages current and add new proof points.']),
    '',
    'Next-step recommendations:',
    ...(result.recommendations.length > 0
      ? result.recommendations.map((item) => `- ${item}`)
      : [
          '- Keep high-value pages current, add new proof points, and monitor how AI search systems describe the brand.',
        ]),
  ];

  return lines.join('\n');
}
