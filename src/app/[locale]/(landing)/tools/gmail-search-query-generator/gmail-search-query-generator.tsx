'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/analytics';
import { RotateCcw, Search } from 'lucide-react';

import { ToolResult } from '@/shared/components/tools';
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
import { Textarea } from '@/shared/components/ui/textarea';

import {
  buildGmailQuery,
  emptyForm,
  FormState,
  GeneratedResult,
  gmailCategories,
  LabelMode,
  QueryRecipe,
  queryRecipes,
  resultFileText,
  validateGmailForm,
} from './gmail-search-query-generator.logic';

export function GmailSearchQueryGenerator({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<GeneratedResult>({
    query: '',
    explanations: [],
    notices: [],
  });
  const [emptyState, setEmptyState] = useState(
    'Add one or more filters, then generate a query.'
  );
  const [validationMessage, setValidationMessage] = useState('');
  const startedRef = useRef(false);

  function updateField<Field extends keyof FormState>(
    field: Field,
    value: FormState[Field]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setValidationMessage('');
  }

  function handleLabelModeChange(value: LabelMode) {
    setForm((current) => ({
      ...current,
      labelMode: value,
      labelValue: '',
    }));
    setValidationMessage('');
  }

  function trackStartOnce() {
    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }
  }

  function publishResult(nextForm: FormState, recipeId?: string) {
    const nextResult = buildGmailQuery(nextForm);
    setResult(nextResult);

    if (!nextResult.query) {
      setEmptyState(
        'Add at least one filter to generate a Gmail search query.'
      );
      return;
    }

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      query_part_count: nextResult.explanations.length,
      character_count: nextResult.query.length,
      has_attachment: nextForm.hasAttachment,
      unread_only: nextForm.unreadOnly,
      recipe_id: recipeId,
    });
  }

  function applyRecipe(recipe: QueryRecipe) {
    trackStartOnce();
    const nextForm = {
      ...emptyForm,
      ...recipe.form,
    };

    setForm(nextForm);
    setValidationMessage('');
    publishResult(nextForm, recipe.id);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackStartOnce();

    const validationError = validateGmailForm(form);

    if (validationError) {
      setResult({ query: '', explanations: [], notices: [] });
      setValidationMessage(validationError);
      setEmptyState(validationError);
      return;
    }

    publishResult(form);
  }

  function handleReset() {
    setForm(emptyForm);
    setResult({ query: '', explanations: [], notices: [] });
    setEmptyState('Add one or more filters, then generate a query.');
    setValidationMessage('');
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
            <section className="space-y-3" aria-labelledby="gmail-recipes">
              <div className="space-y-1">
                <h2 id="gmail-recipes" className="text-base font-semibold">
                  Start from a common search
                </h2>
                <p className="text-muted-foreground text-sm leading-6">
                  These presets generate immediately. Edit any field afterward
                  to narrow the search.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {queryRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    className="hover:bg-muted/60 focus-visible:ring-ring rounded-md border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    onClick={() => applyRecipe(recipe)}
                  >
                    <span className="block text-sm font-medium">
                      {recipe.title}
                    </span>
                    <span className="text-muted-foreground mt-1 block text-xs leading-5">
                      {recipe.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>

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
                  aria-describedby="gmail-from-hint"
                />
                <p
                  id="gmail-from-hint"
                  className="text-muted-foreground text-xs leading-5"
                >
                  Use one email address, domain, or sender name.
                </p>
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
                  aria-describedby="gmail-to-hint"
                />
                <p
                  id="gmail-to-hint"
                  className="text-muted-foreground text-xs leading-5"
                >
                  Use one recipient address, domain, or name.
                </p>
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
                <Textarea
                  id="gmail-contains"
                  value={form.containsWords}
                  onChange={(event) =>
                    updateField('containsWords', event.target.value)
                  }
                  placeholder={'receipt, quarterly report\napproval'}
                  autoComplete="off"
                  className="min-h-24"
                  aria-describedby="gmail-contains-hint"
                />
                <p
                  id="gmail-contains-hint"
                  className="text-muted-foreground text-xs leading-5"
                >
                  Separate words or phrases with commas, semicolons, or line
                  breaks.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gmail-excludes">Excludes words</Label>
                <Textarea
                  id="gmail-excludes"
                  value={form.excludesWords}
                  onChange={(event) =>
                    updateField('excludesWords', event.target.value)
                  }
                  placeholder={'draft, newsletter\nspam'}
                  autoComplete="off"
                  className="min-h-24"
                  aria-describedby="gmail-excludes-hint"
                />
                <p
                  id="gmail-excludes-hint"
                  className="text-muted-foreground text-xs leading-5"
                >
                  A leading minus sign is optional; the generator adds it for
                  you.
                </p>
              </div>

              <div className="space-y-2">
                <Label id="gmail-label-filter-label">Label/category</Label>
                <div className="space-y-3">
                  <div
                    className="grid grid-cols-2 gap-2"
                    role="group"
                    aria-labelledby="gmail-label-filter-label"
                  >
                    {(['label', 'category'] as const).map((mode) => (
                      <Button
                        key={mode}
                        type="button"
                        variant={
                          form.labelMode === mode ? 'default' : 'outline'
                        }
                        aria-pressed={form.labelMode === mode}
                        onClick={() => handleLabelModeChange(mode)}
                      >
                        {mode === 'label' ? 'Label' : 'Category'}
                      </Button>
                    ))}
                  </div>

                  {form.labelMode === 'category' ? (
                    <div
                      className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                      role="group"
                      aria-label="Gmail category"
                    >
                      {gmailCategories.map((category) => (
                        <Button
                          key={category.value}
                          type="button"
                          variant={
                            form.labelValue === category.value
                              ? 'default'
                              : 'outline'
                          }
                          aria-pressed={form.labelValue === category.value}
                          onClick={() =>
                            updateField('labelValue', category.value)
                          }
                        >
                          {category.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="gmail-label-value">Label name</Label>
                      <Input
                        id="gmail-label-value"
                        type="text"
                        value={form.labelValue}
                        onChange={(event) =>
                          updateField('labelValue', event.target.value)
                        }
                        placeholder="work"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground text-xs leading-5">
                  Labels can be custom. Categories are limited to Gmail’s
                  built-in inbox categories.
                </p>
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
                  aria-invalid={Boolean(validationMessage)}
                  aria-describedby={
                    validationMessage ? 'gmail-date-error' : undefined
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
                  aria-invalid={Boolean(validationMessage)}
                  aria-describedby={
                    validationMessage ? 'gmail-date-error' : undefined
                  }
                />
              </div>
            </div>

            {validationMessage ? (
              <div
                id="gmail-date-error"
                className="border-destructive/30 bg-destructive/5 text-destructive rounded-md border p-3 text-sm leading-6"
                role="alert"
              >
                {validationMessage}
              </div>
            ) : null}

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
          {result.notices.length > 0 ? (
            <div className="space-y-2">
              {result.notices.map((notice) => (
                <div
                  key={notice.title}
                  className="bg-muted/60 rounded-md border p-3 text-sm"
                >
                  <div className="font-medium">{notice.title}</div>
                  <p className="text-muted-foreground mt-1 leading-6">
                    {notice.description}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
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
