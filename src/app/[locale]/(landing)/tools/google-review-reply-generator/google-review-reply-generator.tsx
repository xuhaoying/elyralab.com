'use client';

import { FormEvent, useRef, useState } from 'react';
import { MessageSquareReply, RotateCcw } from 'lucide-react';

import { trackToolEvent } from '@/lib/analytics';
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

type ReplyTone = 'professional' | 'friendly' | 'warm' | 'concise';
type Sentiment = 'positive' | 'neutral' | 'negative';

interface FormState {
  reviewText: string;
  starRating: string;
  businessType: string;
  tone: ReplyTone;
  customerName: string;
  businessName: string;
}

interface ReplyResult {
  sentiment: Sentiment;
  professionalReply: string;
  shortReply: string;
  warmerReply: string;
}

const emptyForm: FormState = {
  reviewText: '',
  starRating: '5',
  businessType: '',
  tone: 'professional',
  customerName: '',
  businessName: '',
};

const toneLabels: Record<ReplyTone, string> = {
  professional: 'Professional',
  friendly: 'Friendly',
  warm: 'Warm',
  concise: 'Concise',
};

const sentimentLabels: Record<Sentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

function getSentiment(starRating: string): Sentiment {
  const rating = Number(starRating);

  if (rating >= 4) {
    return 'positive';
  }

  if (rating === 3) {
    return 'neutral';
  }

  return 'negative';
}

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function getCustomerGreeting(customerName: string) {
  const name = cleanText(customerName);
  return name ? `Hi ${name},` : 'Hi,';
}

function getBusinessReference(businessType: string) {
  const type = cleanText(businessType);
  return type || 'business';
}

function getBusinessSignature(businessName: string) {
  const name = cleanText(businessName);
  return name ? ` - ${name}` : '';
}

function getDetailPhrase(reviewText: string) {
  const text = cleanText(reviewText);

  if (!text) {
    return 'your feedback';
  }

  if (text.length <= 90) {
    return `your feedback about "${text}"`;
  }

  return 'the details you shared';
}

function tonePrefix(tone: ReplyTone) {
  if (tone === 'friendly') {
    return 'Thanks so much';
  }

  if (tone === 'warm') {
    return 'Thank you very much';
  }

  if (tone === 'concise') {
    return 'Thank you';
  }

  return 'Thank you';
}

function buildPositiveReplies(form: FormState): ReplyResult {
  const greeting = getCustomerGreeting(form.customerName);
  const businessType = getBusinessReference(form.businessType);
  const signature = getBusinessSignature(form.businessName);
  const detailPhrase = getDetailPhrase(form.reviewText);
  const thanks = tonePrefix(form.tone);

  return {
    sentiment: 'positive',
    professionalReply: `${greeting} ${thanks} for taking the time to leave this review. We are glad to hear that you had a positive experience with our ${businessType}, and we appreciate ${detailPhrase}. We look forward to serving you again.${signature}`,
    shortReply: `${greeting} thank you for the kind review. We appreciate your support and hope to see you again soon.${signature}`,
    warmerReply: `${greeting} your review means a lot to our team. We are so glad your experience was a good one, and we truly appreciate you choosing our ${businessType}. We hope to welcome you back soon.${signature}`,
  };
}

function buildNeutralReplies(form: FormState): ReplyResult {
  const greeting = getCustomerGreeting(form.customerName);
  const businessType = getBusinessReference(form.businessType);
  const signature = getBusinessSignature(form.businessName);
  const detailPhrase = getDetailPhrase(form.reviewText);
  const concise = form.tone === 'concise';

  return {
    sentiment: 'neutral',
    professionalReply: `${greeting} thank you for sharing your feedback. We appreciate ${detailPhrase} and will use it to improve the experience at our ${businessType}. If there is anything specific we can address, please contact our team directly so we can better understand what happened.${signature}`,
    shortReply: `${greeting} thanks for your review. We appreciate the feedback and will keep working to improve.${signature}`,
    warmerReply: concise
      ? `${greeting} thank you for the feedback. We appreciate the chance to improve and hope to provide a better experience next time.${signature}`
      : `${greeting} thank you for giving us the opportunity to learn from your experience. We appreciate your honest feedback and hope we can make your next visit with our ${businessType} smoother and more satisfying.${signature}`,
  };
}

function buildNegativeReplies(form: FormState): ReplyResult {
  const greeting = getCustomerGreeting(form.customerName);
  const businessType = getBusinessReference(form.businessType);
  const signature = getBusinessSignature(form.businessName);
  const detailPhrase = getDetailPhrase(form.reviewText);
  const concise = form.tone === 'concise';

  return {
    sentiment: 'negative',
    professionalReply: `${greeting} thank you for bringing this to our attention. We are sorry that your experience with our ${businessType} did not meet expectations. We take ${detailPhrase} seriously and would like the opportunity to review this further. Please contact our team directly so we can work toward a resolution.${signature}`,
    shortReply: `${greeting} we are sorry to hear about your experience. Please contact our team directly so we can look into this and help make it right.${signature}`,
    warmerReply: concise
      ? `${greeting} we are sorry this happened. Thank you for letting us know, and please reach out so we can review it with care.${signature}`
      : `${greeting} we are genuinely sorry that this was your experience. Thank you for taking the time to explain what happened. We want every guest to feel heard and cared for, and we would appreciate the chance to learn more and make this right.${signature}`,
  };
}

function generateReplies(form: FormState): ReplyResult {
  const sentiment = getSentiment(form.starRating);

  if (sentiment === 'positive') {
    return buildPositiveReplies(form);
  }

  if (sentiment === 'neutral') {
    return buildNeutralReplies(form);
  }

  return buildNegativeReplies(form);
}

function downloadText(result: ReplyResult) {
  return [
    `Review sentiment: ${sentimentLabels[result.sentiment]}`,
    '',
    'Professional reply:',
    result.professionalReply,
    '',
    'Short reply:',
    result.shortReply,
    '',
    'Warmer reply:',
    result.warmerReply,
  ].join('\n');
}

export function GoogleReviewReplyGenerator({ toolSlug }: { toolSlug: string }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [result, setResult] = useState<ReplyResult | null>(null);
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
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!startedRef.current) {
      trackToolEvent('tool_start', { tool_slug: toolSlug });
      startedRef.current = true;
    }

    if (!form.reviewText.trim() || !form.businessType.trim()) {
      setResult(null);
      setEmptyState('Review text and business type are required.');
      return;
    }

    const nextResult = generateReplies(form);
    setResult(nextResult);

    trackToolEvent('result_generated', {
      tool_slug: toolSlug,
      star_rating: Number(form.starRating),
      sentiment: nextResult.sentiment,
      tone: form.tone,
      has_customer_name: Boolean(form.customerName.trim()),
      has_business_name: Boolean(form.businessName.trim()),
      review_character_count: form.reviewText.trim().length,
    });
  }

  function handleReset() {
    setForm(emptyForm);
    setResult(null);
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
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                required
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
                    <SelectItem value="5">5 stars</SelectItem>
                    <SelectItem value="4">4 stars</SelectItem>
                    <SelectItem value="3">3 stars</SelectItem>
                    <SelectItem value="2">2 stars</SelectItem>
                    <SelectItem value="1">1 star</SelectItem>
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-tone">Tone</Label>
                <Select
                  value={form.tone}
                  onValueChange={(value) => updateField('tone', value as ReplyTone)}
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
                <Label htmlFor="customer-name">Customer name optional</Label>
                <Input
                  id="customer-name"
                  value={form.customerName}
                  onChange={(event) =>
                    updateField('customerName', event.target.value)
                  }
                  placeholder="Taylor"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business-name">Business name optional</Label>
                <Input
                  id="business-name"
                  value={form.businessName}
                  onChange={(event) =>
                    updateField('businessName', event.target.value)
                  }
                  placeholder="Acme Cafe"
                  autoComplete="organization"
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
              </div>
              <div className="grid gap-4">
                <ReplyCard
                  title="Professional reply"
                  text={result.professionalReply}
                  toolSlug={toolSlug}
                />
                <ReplyCard
                  title="Short reply"
                  text={result.shortReply}
                  toolSlug={toolSlug}
                />
                <ReplyCard
                  title="Warmer reply"
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
  text,
  toolSlug,
}: {
  title: string;
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
        <CopyButton text={text} toolSlug={toolSlug} label={`Copy ${title}`} />
      </div>
      <p className="text-muted-foreground mt-3 text-sm leading-6 whitespace-pre-wrap">
        {text}
      </p>
    </section>
  );
}
