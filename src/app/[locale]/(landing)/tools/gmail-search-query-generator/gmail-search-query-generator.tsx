'use client';

import { FormEvent, useRef, useState } from 'react';
import { RotateCcw, Search } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { ToolResult } from '@/shared/components/tools';

type LabelMode = 'label' | 'category';

interface FormState {
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

interface Explanation {
  part: string;
  description: string;
}

interface GeneratedResult {
  query: string;
  explanations: Explanation[];
}

const emptyForm: FormState = {
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

function quoteIfNeeded(value: string) {
  const trimmed = value.trim().replaceAll('"', '\\"');

  if (!trimmed) {
    return '';
  }

  return /\s/.test(trimmed) ? `"${trimmed}"` : trimmed;
}

function splitTerms(value: string) {
  return value
    .split(/[,\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatGmailDate(value: string) {
  return value ? value.replaceAll('-', '/') : '';
}

function buildGmailQuery(form: FormState): GeneratedResult {
  const parts: Explanation[] = [];

  if (form.from.trim()) {
    const part = `from:${quoteIfNeeded(form.from)}`;
    parts.push({
      part,
      description: 'Matches messages from this sender.',
    });
  }

  if (form.to.trim()) {
    const part = `to:${quoteIfNeeded(form.to)}`;
    parts.push({
      part,
      description: 'Matches messages sent to this recipient.',
    });
  }

  if (form.subjectKeyword.trim()) {
    const part = `subject:${quoteIfNeeded(form.subjectKeyword)}`;
    parts.push({
      part,
      description: 'Looks for the keyword or phrase in the email subject.',
    });
  }

  const containsTerms = splitTerms(form.containsWords);
  if (containsTerms.length > 0) {
    const part = containsTerms.map(quoteIfNeeded).join(' ');
    parts.push({
      part,
      description: 'Requires these words or phrases anywhere in the message.',
    });
  }

  const excludedTerms = splitTerms(form.excludesWords);
  if (excludedTerms.length > 0) {
    const part = excludedTerms
      .map((term) => `-${quoteIfNeeded(term.replace(/^-+/, ''))}`)
      .join(' ');
    parts.push({
      part,
      description: 'Excludes messages that contain these words or phrases.',
    });
  }

  if (form.hasAttachment) {
    parts.push({
      part: 'has:attachment',
      description: 'Only includes messages with attachments.',
    });
  }

  if (form.afterDate) {
    const part = `after:${formatGmailDate(form.afterDate)}`;
    parts.push({
      part,
      description: 'Only includes messages after this date.',
    });
  }

  if (form.beforeDate) {
    const part = `before:${formatGmailDate(form.beforeDate)}`;
    parts.push({
      part,
      description: 'Only includes messages before this date.',
    });
  }

  if (form.unreadOnly) {
    parts.push({
      part: 'is:unread',
      description: 'Only includes unread messages.',
    });
  }

  if (form.labelValue.trim()) {
    const value =
      form.labelMode === 'category'
        ? form.labelValue.trim().toLowerCase().replace(/\s+/g, '-')
        : quoteIfNeeded(form.labelValue);
    const part = `${form.labelMode}:${value}`;
    parts.push({
      part,
      description:
        form.labelMode === 'category'
          ? 'Limits results to this Gmail category.'
          : 'Limits results to this Gmail label.',
    });
  }

  return {
    query: parts.map((item) => item.part).join(' '),
    explanations: parts,
  };
}

function resultFileText(result: GeneratedResult) {
  if (!result.query) {
    return '';
  }

  const explanation = result.explanations
    .map((item) => `- ${item.part}: ${item.description}`)
    .join('\n');

  return `Gmail search query\n\n${result.query}\n\nExplanation\n${explanation}\n`;
}

export function GmailSearchQueryGenerator({
  toolSlug,
}: {
  toolSlug: string;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<GeneratedResult>({
    query: '',
    explanations: [],
  });
  const [emptyState, setEmptyState] = useState(
    'Add one or more filters, then generate a query.'
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

    const nextResult = buildGmailQuery(form);
    setResult(nextResult);

    if (!nextResult.query) {
      setEmptyState('Add at least one filter to generate a Gmail search query.');
      return;
    }

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      query_part_count: nextResult.explanations.length,
      character_count: nextResult.query.length,
      has_attachment: form.hasAttachment,
      unread_only: form.unreadOnly,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult({ query: '', explanations: [] });
    setEmptyState('Add one or more filters, then generate a query.');
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Query builder</CardTitle>
          <CardDescription>
            Fill only the filters you need. Empty fields are ignored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gmail-from">From</Label>
                <Input
                  id="gmail-from"
                  type="text"
                  value={form.from}
                  onChange={(event) => updateField('from', event.target.value)}
                  placeholder="sender@example.com"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-to">To</Label>
                <Input
                  id="gmail-to"
                  type="text"
                  value={form.to}
                  onChange={(event) => updateField('to', event.target.value)}
                  placeholder="recipient@example.com"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-subject">Subject keyword</Label>
                <Input
                  id="gmail-subject"
                  type="text"
                  value={form.subjectKeyword}
                  onChange={(event) =>
                    updateField('subjectKeyword', event.target.value)
                  }
                  placeholder="invoice"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-contains">Contains words</Label>
                <Input
                  id="gmail-contains"
                  type="text"
                  value={form.containsWords}
                  onChange={(event) =>
                    updateField('containsWords', event.target.value)
                  }
                  placeholder="receipt, quarterly report"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-excludes">Excludes words</Label>
                <Input
                  id="gmail-excludes"
                  type="text"
                  value={form.excludesWords}
                  onChange={(event) =>
                    updateField('excludesWords', event.target.value)
                  }
                  placeholder="draft, newsletter"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-label-value">Label/category</Label>
                <div className="grid gap-2 sm:grid-cols-[130px_1fr]">
                  <Select
                    value={form.labelMode}
                    onValueChange={(value) =>
                      updateField('labelMode', value as LabelMode)
                    }
                  >
                    <SelectTrigger id="gmail-label-mode" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="label">Label</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="gmail-label-value"
                    type="text"
                    value={form.labelValue}
                    onChange={(event) =>
                      updateField('labelValue', event.target.value)
                    }
                    placeholder={
                      form.labelMode === 'category' ? 'promotions' : 'work'
                    }
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-after">After date</Label>
                <Input
                  id="gmail-after"
                  type="date"
                  value={form.afterDate}
                  onChange={(event) =>
                    updateField('afterDate', event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-before">Before date</Label>
                <Input
                  id="gmail-before"
                  type="date"
                  value={form.beforeDate}
                  onChange={(event) =>
                    updateField('beforeDate', event.target.value)
                  }
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id="gmail-has-attachment"
                  checked={form.hasAttachment}
                  onCheckedChange={(checked) =>
                    updateField('hasAttachment', checked === true)
                  }
                />
                <Label htmlFor="gmail-has-attachment">Has attachment</Label>
              </div>

              <div className="flex items-center gap-3 rounded-md border p-3">
                <Checkbox
                  id="gmail-unread-only"
                  checked={form.unreadOnly}
                  onCheckedChange={(checked) =>
                    updateField('unreadOnly', checked === true)
                  }
                />
                <Label htmlFor="gmail-unread-only">Unread only</Label>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <Search className="size-4" />
                Generate query
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToolResult
        title="Generated Gmail search query"
        description="Paste this into the Gmail search bar."
        result={result.query}
        downloadText={resultFileText(result)}
        emptyState={emptyState}
        filename="gmail-search-query.txt"
        toolSlug={toolSlug}
      >
        <div className="space-y-3" aria-live="polite">
          <h3 className="text-sm font-semibold">Explanation</h3>
          <ul className="space-y-2">
            {result.explanations.map((item) => (
              <li key={item.part} className="rounded-md border p-3 text-sm">
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  {item.part}
                </code>
                <p className="text-muted-foreground mt-2 leading-6">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </ToolResult>
    </div>
  );
}
