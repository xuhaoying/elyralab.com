'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/analytics';
import { RotateCcw, SearchCheck } from 'lucide-react';

import { ToolResult } from '@/shared/components/tools';
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

import {
  buildResult,
  emptyForm,
  resultText,
  validateReadinessForm,
  type BinaryAnswer,
  type FieldErrors,
  type FormState,
  type ReadinessResult,
  type TernaryAnswer,
} from './ai-search-readiness-checker.logic';

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-destructive text-sm">
      {message}
    </p>
  );
}

function OptionSelect({
  id,
  label,
  value,
  onChange,
  includeUnknown = false,
  error,
}: {
  id: string;
  label: string;
  value: TernaryAnswer;
  onChange: (value: TernaryAnswer) => void;
  includeUnknown?: boolean;
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => onChange(next as TernaryAnswer)}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
          {includeUnknown ? (
            <SelectItem value="unknown">Unknown</SelectItem>
          ) : null}
        </SelectContent>
      </Select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function AISearchReadinessChecker({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<ReadinessResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
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
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
    setFormError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }

    const validation = validateReadinessForm(form);

    if (validation.message) {
      setResult(null);
      setFieldErrors(validation.fieldErrors);
      setFormError(validation.message);
      setEmptyState('Fix the highlighted fields, then generate your report.');
      return;
    }

    const nextResult = buildResult(form);
    setResult(nextResult);
    setFieldErrors({});
    setFormError('');

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      score: nextResult.score,
      readiness_level: nextResult.level,
      strength_count: nextResult.strengths.length,
      missing_count: nextResult.missingItems.length,
      top_priority_count: nextResult.topPriorities.length,
      has_schema: form.hasStructuredData,
      has_llms_txt: form.hasLlmsTxt,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setFieldErrors({});
    setFormError('');
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
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {formError ? (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
              >
                {formError}
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website-url">Website URL</Label>
                <Input
                  id="website-url"
                  type="text"
                  inputMode="url"
                  value={form.websiteUrl}
                  onChange={(event) =>
                    updateField('websiteUrl', event.target.value)
                  }
                  placeholder="https://example.com"
                  autoComplete="url"
                  aria-invalid={Boolean(fieldErrors.websiteUrl)}
                  aria-describedby={
                    fieldErrors.websiteUrl ? 'website-url-error' : undefined
                  }
                />
                <FieldError
                  id="website-url-error"
                  message={fieldErrors.websiteUrl}
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
                  aria-invalid={Boolean(fieldErrors.brandName)}
                  aria-describedby={
                    fieldErrors.brandName ? 'brand-name-error' : undefined
                  }
                />
                <FieldError
                  id="brand-name-error"
                  message={fieldErrors.brandName}
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
                  aria-invalid={Boolean(fieldErrors.targetAudience)}
                  aria-describedby={
                    fieldErrors.targetAudience
                      ? 'target-audience-error'
                      : undefined
                  }
                />
                <FieldError
                  id="target-audience-error"
                  message={fieldErrors.targetAudience}
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
                error={fieldErrors.hasAboutPage}
              />
              <OptionSelect
                id="has-faq-page"
                label="Has FAQ page"
                value={form.hasFaqPage}
                onChange={(value) =>
                  updateField('hasFaqPage', value as BinaryAnswer)
                }
                error={fieldErrors.hasFaqPage}
              />
              <OptionSelect
                id="has-product-pages"
                label="Has clear product or service pages"
                value={form.hasProductPages}
                onChange={(value) =>
                  updateField('hasProductPages', value as BinaryAnswer)
                }
                error={fieldErrors.hasProductPages}
              />
              <OptionSelect
                id="has-author-info"
                label="Has author or company information"
                value={form.hasAuthorInfo}
                onChange={(value) =>
                  updateField('hasAuthorInfo', value as BinaryAnswer)
                }
                error={fieldErrors.hasAuthorInfo}
              />
              <OptionSelect
                id="has-structured-data"
                label="Has structured data/schema"
                value={form.hasStructuredData}
                onChange={(value) => updateField('hasStructuredData', value)}
                includeUnknown
                error={fieldErrors.hasStructuredData}
              />
              <OptionSelect
                id="has-llms-txt"
                label="Has llms.txt"
                value={form.hasLlmsTxt}
                onChange={(value) => updateField('hasLlmsTxt', value)}
                includeUnknown
                error={fieldErrors.hasLlmsTxt}
              />
              <OptionSelect
                id="has-pricing-pages"
                label="Has pricing or comparison pages"
                value={form.hasPricingPages}
                onChange={(value) =>
                  updateField('hasPricingPages', value as BinaryAnswer)
                }
                error={fieldErrors.hasPricingPages}
              />
              <OptionSelect
                id="has-original-research"
                label="Has original research or unique data"
                value={form.hasOriginalResearch}
                onChange={(value) =>
                  updateField('hasOriginalResearch', value as BinaryAnswer)
                }
                error={fieldErrors.hasOriginalResearch}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <SearchCheck className="size-4" />
                Generate report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToolResult
        title="AI search readiness score"
        description="Copy or download this self-assessment summary."
        result={output}
        filename="ai-search-readiness-report.txt"
        toolSlug={toolSlug}
        emptyState={emptyState}
      >
        {result ? (
          <div className="space-y-5" aria-live="polite">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="AI search readiness score"
                value={`${result.score}/100`}
              />
              <MetricCard label="Level" value={result.level} />
              <MetricCard
                label="Priority items"
                value={String(result.priorityChecklist.length)}
              />
            </div>

            <section className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Executive summary</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {result.summary}
              </p>
              <p className="text-muted-foreground mt-3 text-sm leading-6">
                {result.scoreBandAction}
              </p>
            </section>

            <section className="rounded-md border p-4">
              <h3 className="text-sm font-semibold">Top priority actions</h3>
              {result.topPriorities.length > 0 ? (
                <div className="mt-3 grid gap-3">
                  {result.topPriorities.map((item, index) => (
                    <div key={item.title} className="rounded-md border p-3">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="text-sm font-medium">
                          {index + 1}. {item.title}
                        </h4>
                        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                          {item.impact} impact
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2 text-sm leading-6">
                        {item.why}
                      </p>
                      <p className="mt-2 text-sm leading-6">{item.action}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-3 text-sm leading-6">
                  Keep the strongest pages current and add new proof points.
                </p>
              )}
            </section>

            <ResultList
              title="Strengths"
              items={result.strengths}
              empty="No strengths selected yet."
            />
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
      <div className="mt-2 text-xl leading-7 font-semibold">{value}</div>
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
