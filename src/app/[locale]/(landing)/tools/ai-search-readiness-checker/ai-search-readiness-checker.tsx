'use client';

import { FormEvent, useRef, useState } from 'react';
import { RotateCcw, SearchCheck } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { ToolResult } from '@/shared/components/tools';

type BinaryAnswer = 'yes' | 'no';
type TernaryAnswer = 'yes' | 'no' | 'unknown';
type AssessmentKey =
  | 'hasAboutPage'
  | 'hasFaqPage'
  | 'hasProductPages'
  | 'hasAuthorInfo'
  | 'hasStructuredData'
  | 'hasLlmsTxt'
  | 'hasPricingPages'
  | 'hasOriginalResearch';

interface FormState {
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

interface AssessmentItem {
  key: AssessmentKey;
  label: string;
  description: string;
  recommendation: string;
  weight: number;
  answer: TernaryAnswer;
}

interface ReadinessResult {
  score: number;
  level: string;
  strengths: string[];
  missingItems: string[];
  priorityChecklist: string[];
  recommendations: string[];
  summary: string;
  items: AssessmentItem[];
}

const emptyForm: FormState = {
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

const assessmentConfig: Array<
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

function answerScore(answer: TernaryAnswer, weight: number) {
  if (answer === 'yes') {
    return weight;
  }

  if (answer === 'unknown') {
    return Math.round(weight * 0.25);
  }

  return 0;
}

function getReadinessLevel(score: number) {
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

function buildItems(form: FormState) {
  return assessmentConfig.map((item) => ({
    ...item,
    answer: form[item.key],
  }));
}

function buildResult(form: FormState): ReadinessResult {
  const items = buildItems(form);
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
  const brand = form.brandName.trim() || 'This brand';
  const audience = form.targetAudience.trim() || 'the target audience';
  const summary = `${brand} scores ${score}/100 for AI search readiness. The current level is ${level.toLowerCase()}. The strongest path forward is to make the site easier for AI systems to understand, cite, and connect to ${audience}.`;

  return {
    score,
    level,
    strengths,
    missingItems,
    priorityChecklist,
    recommendations,
    summary,
    items,
  };
}

function resultText(form: FormState, result: ReadinessResult) {
  const lines = [
    'AI Search Readiness Checker result',
    '',
    `Website URL: ${form.websiteUrl.trim()}`,
    `Brand name: ${form.brandName.trim()}`,
    `Target audience: ${form.targetAudience.trim()}`,
    `Score: ${result.score}/100`,
    `Readiness level: ${result.level}`,
    '',
    'Summary:',
    result.summary,
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
      : ['[ ] Maintain current AI-search foundations and refresh content regularly.']),
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

function OptionSelect({
  id,
  label,
  value,
  onChange,
  includeUnknown = false,
}: {
  id: string;
  label: string;
  value: TernaryAnswer;
  onChange: (value: TernaryAnswer) => void;
  includeUnknown?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={(next) => onChange(next as TernaryAnswer)}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
          {includeUnknown ? <SelectItem value="unknown">Unknown</SelectItem> : null}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AISearchReadinessChecker({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [emptyState, setEmptyState] = useState(
    'Complete the self-assessment, then generate your readiness report.'
  );
  const startedRef = useRef(false);

  function updateField<Field extends keyof FormState>(
    field: Field,
    value: FormState[Field]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }

    if (
      !form.websiteUrl.trim() ||
      !form.brandName.trim() ||
      !form.targetAudience.trim()
    ) {
      setResult(null);
      setEmptyState('Website URL, brand name, and target audience are required.');
      return;
    }

    const nextResult = buildResult(form);
    setResult(nextResult);

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      score: nextResult.score,
      readiness_level: nextResult.level,
      strength_count: nextResult.strengths.length,
      missing_count: nextResult.missingItems.length,
      has_schema: form.hasStructuredData,
      has_llms_txt: form.hasLlmsTxt,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setEmptyState(
      'Complete the self-assessment, then generate your readiness report.'
    );
  }

  const output = result ? resultText(form, result) : '';

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Self-assessment</CardTitle>
          <CardDescription>
            This v1 checker does not crawl your site. Answer based on what you
            know about the current website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website-url">Website URL</Label>
                <Input
                  id="website-url"
                  type="url"
                  value={form.websiteUrl}
                  onChange={(event) =>
                    updateField('websiteUrl', event.target.value)
                  }
                  placeholder="https://example.com"
                  autoComplete="url"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand-name">Brand name</Label>
                <Input
                  id="brand-name"
                  value={form.brandName}
                  onChange={(event) =>
                    updateField('brandName', event.target.value)
                  }
                  placeholder="Acme"
                  autoComplete="organization"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="target-audience">Target audience</Label>
                <Textarea
                  id="target-audience"
                  value={form.targetAudience}
                  onChange={(event) =>
                    updateField('targetAudience', event.target.value)
                  }
                  placeholder="Example: operations leaders at mid-market SaaS companies"
                  className="min-h-24"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <OptionSelect
                id="has-about-page"
                label="Has About page"
                value={form.hasAboutPage}
                onChange={(value) =>
                  updateField('hasAboutPage', value as BinaryAnswer)
                }
              />
              <OptionSelect
                id="has-faq-page"
                label="Has FAQ page"
                value={form.hasFaqPage}
                onChange={(value) =>
                  updateField('hasFaqPage', value as BinaryAnswer)
                }
              />
              <OptionSelect
                id="has-product-pages"
                label="Has clear product or service pages"
                value={form.hasProductPages}
                onChange={(value) =>
                  updateField('hasProductPages', value as BinaryAnswer)
                }
              />
              <OptionSelect
                id="has-author-info"
                label="Has author or company information"
                value={form.hasAuthorInfo}
                onChange={(value) =>
                  updateField('hasAuthorInfo', value as BinaryAnswer)
                }
              />
              <OptionSelect
                id="has-structured-data"
                label="Has structured data/schema"
                value={form.hasStructuredData}
                onChange={(value) => updateField('hasStructuredData', value)}
                includeUnknown
              />
              <OptionSelect
                id="has-llms-txt"
                label="Has llms.txt"
                value={form.hasLlmsTxt}
                onChange={(value) => updateField('hasLlmsTxt', value)}
                includeUnknown
              />
              <OptionSelect
                id="has-pricing-pages"
                label="Has pricing or comparison pages"
                value={form.hasPricingPages}
                onChange={(value) =>
                  updateField('hasPricingPages', value as BinaryAnswer)
                }
              />
              <OptionSelect
                id="has-original-research"
                label="Has original research or unique data"
                value={form.hasOriginalResearch}
                onChange={(value) =>
                  updateField('hasOriginalResearch', value as BinaryAnswer)
                }
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <SearchCheck className="size-4" />
                Check readiness
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToolResult
        title="AI search readiness report"
        description="Copy or download this self-assessment summary."
        result={output}
        filename="ai-search-readiness-report.txt"
        toolSlug={toolSlug}
        emptyState={emptyState}
      >
        {result ? (
          <div className="space-y-5" aria-live="polite">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard label="Score" value={`${result.score}/100`} />
              <MetricCard label="Level" value={result.level} />
              <MetricCard
                label="Priority items"
                value={String(result.priorityChecklist.length)}
              />
            </div>

            <ResultList title="Strengths" items={result.strengths} empty="No strengths selected yet." />
            <ResultList
              title="Missing items"
              items={result.missingItems}
              empty="No major missing items selected."
            />
            <ResultList
              title="Priority checklist"
              items={result.priorityChecklist}
              empty="Maintain current AI-search foundations and refresh content regularly."
              checklist
            />
            <ResultList
              title="Next-step recommendations"
              items={result.recommendations}
              empty="Keep high-value pages current, add new proof points, and monitor how AI search systems describe the brand."
            />
          </div>
        ) : null}
      </ToolResult>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border p-4">
      <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold leading-7">{value}</div>
    </div>
  );
}

function ResultList({
  title,
  items,
  empty,
  checklist = false,
}: {
  title: string;
  items: string[];
  empty: string;
  checklist?: boolean;
}) {
  return (
    <section className="rounded-md border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length > 0 ? (
        <ul className="text-muted-foreground mt-3 space-y-2 text-sm leading-6">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true">{checklist ? '[ ]' : '-'}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm leading-6">{empty}</p>
      )}
    </section>
  );
}
