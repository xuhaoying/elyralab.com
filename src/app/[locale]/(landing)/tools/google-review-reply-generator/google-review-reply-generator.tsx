'use client';

import { FormEvent, useRef, useState } from 'react';
import { trackToolEvent } from '@/lib/analytics';
import { MessageSquareReply, RotateCcw } from 'lucide-react';

import { CopyButton, DownloadButton } from '@/shared/components/tools';
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
  downloadText,
  emptyForm,
  generateReplies,
  sentimentLabels,
  starRatingLabels,
  toneLabels,
  validateReviewForm,
  type FieldErrors,
  type FormState,
  type ReplyResult,
  type ReplyTone,
} from './google-review-reply-generator.logic';

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

export function GoogleReviewReplyGenerator({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<ReplyResult | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [emptyState, setEmptyState] = useState(
    'Enter a review, then generate reply options.'
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

    const validation = validateReviewForm(form);

    if (validation.message) {
      setResult(null);
      setFieldErrors(validation.fieldErrors);
      setFormError(validation.message);
      setEmptyState('Fix the highlighted fields, then generate reply options.');
      return;
    }

    const nextResult = generateReplies(form);
    setResult(nextResult);
    setFieldErrors({});
    setFormError('');

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      star_rating: Number(form.starRating),
      sentiment: nextResult.sentiment,
      tone: form.tone,
      has_customer_name: Boolean(form.customerName.trim()),
      has_business_name: Boolean(form.businessName.trim()),
      review_character_count: form.reviewText.trim().length,
      recommended_reply: nextResult.recommendedReplyLabel,
      has_private_detail_warning: Boolean(nextResult.privateDetailWarning),
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
    setFieldErrors({});
    setFormError('');
    setEmptyState('Enter a review, then generate reply options.');
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle>Review details</CardTitle>
          <CardDescription>
            This v1 generator uses local templates only. It does not call an AI
            API or store review content.
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

            <div className="space-y-2">
              <Label htmlFor="review-text">Review text</Label>
              <Textarea
                id="review-text"
                value={form.reviewText}
                onChange={(event) =>
                  updateField('reviewText', event.target.value)
                }
                placeholder="Paste the customer review here."
                className="min-h-32"
                aria-invalid={Boolean(fieldErrors.reviewText)}
                aria-describedby={
                  fieldErrors.reviewText ? 'review-text-error' : undefined
                }
              />
              <FieldError
                id="review-text-error"
                message={fieldErrors.reviewText}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="star-rating">Star rating</Label>
                <Select
                  value={form.starRating}
                  onValueChange={(value) => updateField('starRating', value)}
                >
                  <SelectTrigger id="star-rating" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(starRatingLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business type</Label>
                <Input
                  id="business-type"
                  value={form.businessType}
                  onChange={(event) =>
                    updateField('businessType', event.target.value)
                  }
                  placeholder="restaurant, dental clinic, salon"
                  autoComplete="off"
                  aria-invalid={Boolean(fieldErrors.businessType)}
                  aria-describedby={
                    fieldErrors.businessType ? 'business-type-error' : undefined
                  }
                />
                <FieldError
                  id="business-type-error"
                  message={fieldErrors.businessType}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-tone">Tone</Label>
                <Select
                  value={form.tone}
                  onValueChange={(value) =>
                    updateField('tone', value as ReplyTone)
                  }
                >
                  <SelectTrigger id="reply-tone" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(toneLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer name (optional)</Label>
                <Input
                  id="customer-name"
                  value={form.customerName}
                  onChange={(event) =>
                    updateField('customerName', event.target.value)
                  }
                  placeholder="Taylor"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.customerName)}
                  aria-describedby={
                    fieldErrors.customerName ? 'customer-name-error' : undefined
                  }
                />
                <FieldError
                  id="customer-name-error"
                  message={fieldErrors.customerName}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business-name">Business name (optional)</Label>
                <Input
                  id="business-name"
                  value={form.businessName}
                  onChange={(event) =>
                    updateField('businessName', event.target.value)
                  }
                  placeholder="Acme Cafe"
                  autoComplete="organization"
                  aria-invalid={Boolean(fieldErrors.businessName)}
                  aria-describedby={
                    fieldErrors.businessName ? 'business-name-error' : undefined
                  }
                />
                <FieldError
                  id="business-name-error"
                  message={fieldErrors.businessName}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="submit">
                <MessageSquareReply className="size-4" />
                Generate replies
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Generated replies</CardTitle>
              <CardDescription>
                Copy one version or download all replies as a text file.
              </CardDescription>
            </div>
            <DownloadButton
              text={result ? downloadText(result) : ''}
              filename="google-review-replies.txt"
              toolSlug={toolSlug}
              disabled={!result}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {result ? (
            <>
              <div className="text-muted-foreground text-sm">
                Detected review type:{' '}
                <span className="text-foreground font-medium">
                  {sentimentLabels[result.sentiment]}
                </span>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                Recommended version:{' '}
                <span className="text-foreground font-medium">
                  {result.recommendedReplyLabel}
                </span>
              </div>
              <div className="rounded-md border p-4">
                <h3 className="text-sm font-semibold">Publishing checklist</h3>
                {result.privateDetailWarning ? (
                  <p className="mt-3 rounded-md border border-amber-300/50 bg-amber-50/70 px-3 py-2 text-sm leading-6 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                    {result.privateDetailWarning}
                  </p>
                ) : null}
                <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
                  {result.publicReplyChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-4">
                <ReplyCard
                  title="Professional reply"
                  variant="professional"
                  text={result.professionalReply}
                  toolSlug={toolSlug}
                />
                <ReplyCard
                  title="Short reply"
                  variant="short"
                  text={result.shortReply}
                  toolSlug={toolSlug}
                />
                <ReplyCard
                  title="Warmer reply"
                  variant="warmer"
                  text={result.warmerReply}
                  toolSlug={toolSlug}
                />
              </div>
            </>
          ) : (
            <div className="bg-muted/60 text-muted-foreground rounded-md border border-dashed p-4 text-sm">
              {emptyState}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ReplyCard({
  title,
  variant,
  text,
  toolSlug,
}: {
  title: string;
  variant: string;
  text: string;
  toolSlug: string;
}) {
  const headingId = title.toLowerCase().replaceAll(' ', '-');

  return (
    <section className="rounded-md border p-4" aria-labelledby={headingId}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 id={headingId} className="text-sm font-semibold">
          {title}
        </h3>
        <CopyButton
          text={text}
          toolSlug={toolSlug}
          label={`Copy ${title}`}
          analyticsProperties={{ reply_variant: variant }}
        />
      </div>
      <p className="text-muted-foreground mt-3 text-sm leading-6 whitespace-pre-wrap">
        {text}
      </p>
    </section>
  );
}
