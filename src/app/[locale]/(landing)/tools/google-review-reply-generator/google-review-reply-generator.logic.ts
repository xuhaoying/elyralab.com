export type ReplyTone = 'professional' | 'friendly' | 'warm' | 'concise';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type StarRating = '1' | '2' | '3' | '4' | '5';
export type ReplyVariantLabel =
  | 'Professional reply'
  | 'Short reply'
  | 'Warmer reply';

export interface FormState {
  reviewText: string;
  starRating: string;
  businessType: string;
  tone: ReplyTone;
  customerName: string;
  businessName: string;
}

export interface ReplyResult {
  sentiment: Sentiment;
  recommendedReplyLabel: ReplyVariantLabel;
  professionalReply: string;
  shortReply: string;
  warmerReply: string;
  publicReplyChecklist: string[];
  privateDetailWarning: string;
}

export type FieldErrors = Partial<Record<keyof FormState, string>>;

export interface ValidationResult {
  message: string;
  fieldErrors: FieldErrors;
}

export const emptyForm: FormState = {
  reviewText: '',
  starRating: '5',
  businessType: '',
  tone: 'professional',
  customerName: '',
  businessName: '',
};

export const toneLabels: Record<ReplyTone, string> = {
  professional: 'Professional',
  friendly: 'Friendly',
  warm: 'Warm',
  concise: 'Concise',
};

export const sentimentLabels: Record<Sentiment, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  negative: 'Negative',
};

export const starRatingLabels: Record<StarRating, string> = {
  '5': '5 stars',
  '4': '4 stars',
  '3': '3 stars',
  '2': '2 stars',
  '1': '1 star',
};

const validTones = new Set<ReplyTone>([
  'professional',
  'friendly',
  'warm',
  'concise',
]);
const validStarRatings = new Set<StarRating>(['1', '2', '3', '4', '5']);

export function getSentiment(starRating: string): Sentiment {
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

export function hasPossiblePrivateInfo(value: string) {
  const text = value.trim();

  if (!text) {
    return false;
  }

  return (
    /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(text) ||
    /(?:\+?\d[\d\s().-]{6,}\d)/.test(text) ||
    /\b(?:order|invoice|booking|reservation|account|case)\s*(?:number|no\.?|#)?\s*[:#-]?\s*[A-Z0-9-]{4,}\b/i.test(
      text
    )
  );
}

export function validateReviewForm(form: FormState): ValidationResult {
  const fieldErrors: FieldErrors = {};
  const reviewText = form.reviewText.trim();
  const businessType = cleanText(form.businessType);
  const customerName = cleanText(form.customerName);
  const businessName = cleanText(form.businessName);

  if (!reviewText) {
    fieldErrors.reviewText = 'Enter the customer review text.';
  } else if (reviewText.length > 2000) {
    fieldErrors.reviewText = 'Keep the review text under 2,000 characters.';
  }

  if (!validStarRatings.has(form.starRating as StarRating)) {
    fieldErrors.starRating = 'Choose a star rating from 1 to 5.';
  }

  if (!businessType) {
    fieldErrors.businessType = 'Enter the business type.';
  } else if (businessType.length > 80) {
    fieldErrors.businessType = 'Keep the business type under 80 characters.';
  }

  if (!validTones.has(form.tone)) {
    fieldErrors.tone = 'Choose a supported tone.';
  }

  if (customerName.length > 80) {
    fieldErrors.customerName = 'Keep the customer name under 80 characters.';
  }

  if (businessName.length > 100) {
    fieldErrors.businessName = 'Keep the business name under 100 characters.';
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
    reviewText: form.reviewText.trim(),
    businessType: cleanText(form.businessType),
    customerName: cleanText(form.customerName),
    businessName: cleanText(form.businessName),
  };
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

export function getDetailPhrase(reviewText: string) {
  const text = cleanText(reviewText);

  if (!text) {
    return 'your feedback';
  }

  if (hasPossiblePrivateInfo(text)) {
    return 'the details you shared';
  }

  if (text.length <= 90) {
    return `your feedback about "${text}"`;
  }

  return 'the details you shared';
}

function thankYou(tone: ReplyTone) {
  if (tone === 'friendly') {
    return 'Thanks so much';
  }

  if (tone === 'warm') {
    return 'Thank you very much';
  }

  return 'Thank you';
}

export function buildPublicReplyChecklist(
  form: FormState,
  sentiment: Sentiment
) {
  const checklist = [
    'Confirm the public reply does not include private customer, payment, order, health, or contact details.',
    'Keep the reply focused on acknowledgement and next steps, not a point-by-point argument.',
  ];

  if (hasPossiblePrivateInfo(form.reviewText)) {
    checklist.unshift(
      'The review appears to include private details. Do not repeat those details in the public reply.'
    );
  }

  if (sentiment === 'negative') {
    checklist.push(
      'Move specifics to a private channel and avoid admitting specific fault before your team reviews the case.'
    );
  } else if (sentiment === 'neutral') {
    checklist.push(
      'Mention improvement without promising a specific fix unless the business can actually deliver it.'
    );
  } else {
    checklist.push(
      'Personalize lightly, but avoid offering incentives for reviews or asking the customer to change their rating.'
    );
  }

  return checklist;
}

export function getRecommendedReplyLabel(
  tone: ReplyTone,
  sentiment: Sentiment
): ReplyVariantLabel {
  if (sentiment === 'negative') {
    return 'Professional reply';
  }

  if (tone === 'concise') {
    return 'Short reply';
  }

  if (tone === 'warm' || tone === 'friendly') {
    return 'Warmer reply';
  }

  return 'Professional reply';
}

function withPublishingGuidance(
  result: Omit<
    ReplyResult,
    'recommendedReplyLabel' | 'publicReplyChecklist' | 'privateDetailWarning'
  >,
  form: FormState
): ReplyResult {
  const privateDetailWarning = hasPossiblePrivateInfo(form.reviewText)
    ? 'Potential private details detected in the review. The generated replies avoid quoting the review directly.'
    : '';

  return {
    ...result,
    recommendedReplyLabel: getRecommendedReplyLabel(
      form.tone,
      result.sentiment
    ),
    publicReplyChecklist: buildPublicReplyChecklist(form, result.sentiment),
    privateDetailWarning,
  };
}

function buildPositiveReplies(
  form: FormState
): Omit<
  ReplyResult,
  'recommendedReplyLabel' | 'publicReplyChecklist' | 'privateDetailWarning'
> {
  const greeting = getCustomerGreeting(form.customerName);
  const businessType = getBusinessReference(form.businessType);
  const signature = getBusinessSignature(form.businessName);
  const detailPhrase = getDetailPhrase(form.reviewText);
  const thanks = thankYou(form.tone);

  return {
    sentiment: 'positive',
    professionalReply: `${greeting} ${thanks} for taking the time to leave this review. We are glad to hear that you had a positive experience with our ${businessType}, and we appreciate ${detailPhrase}. We look forward to serving you again.${signature}`,
    shortReply: `${greeting} thank you for the kind review. We appreciate your support and hope to see you again soon.${signature}`,
    warmerReply: `${greeting} your review means a lot to our team. We are so glad your experience was a good one, and we truly appreciate you choosing our ${businessType}. We hope to welcome you back soon.${signature}`,
  };
}

function buildNeutralReplies(
  form: FormState
): Omit<
  ReplyResult,
  'recommendedReplyLabel' | 'publicReplyChecklist' | 'privateDetailWarning'
> {
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

function buildNegativeReplies(
  form: FormState
): Omit<
  ReplyResult,
  'recommendedReplyLabel' | 'publicReplyChecklist' | 'privateDetailWarning'
> {
  const greeting = getCustomerGreeting(form.customerName);
  const businessType = getBusinessReference(form.businessType);
  const signature = getBusinessSignature(form.businessName);
  const detailPhrase = getDetailPhrase(form.reviewText);
  const concise = form.tone === 'concise';

  return {
    sentiment: 'negative',
    professionalReply: `${greeting} thank you for bringing this to our attention. We are sorry to hear that your experience with our ${businessType} did not meet expectations. We take ${detailPhrase} seriously. To protect your privacy and review the details accurately, please contact our team directly so we can look into this further.${signature}`,
    shortReply: `${greeting} we are sorry to hear about your experience. Please contact our team directly so we can review the details and help.${signature}`,
    warmerReply: concise
      ? `${greeting} we are sorry to hear this. Thank you for letting us know, and please reach out so we can review it with care.${signature}`
      : `${greeting} we are genuinely sorry to hear that this was your experience. Thank you for taking the time to explain what happened. We want every guest to feel heard and cared for, and we would appreciate the chance to learn more through a direct conversation.${signature}`,
  };
}

export function generateReplies(form: FormState): ReplyResult {
  const normalized = normalizedForm(form);
  const sentiment = getSentiment(normalized.starRating);

  if (sentiment === 'positive') {
    return withPublishingGuidance(buildPositiveReplies(normalized), normalized);
  }

  if (sentiment === 'neutral') {
    return withPublishingGuidance(buildNeutralReplies(normalized), normalized);
  }

  return withPublishingGuidance(buildNegativeReplies(normalized), normalized);
}

export function downloadText(result: ReplyResult) {
  return [
    `Review sentiment: ${sentimentLabels[result.sentiment]}`,
    `Recommended version: ${result.recommendedReplyLabel}`,
    '',
    'Publishing checklist:',
    ...result.publicReplyChecklist.map((item) => `- ${item}`),
    ...(result.privateDetailWarning
      ? ['', `Privacy note: ${result.privateDetailWarning}`]
      : []),
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
