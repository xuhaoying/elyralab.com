export type AITaskErrorType =
  | 'auth_required'
  | 'insufficient_credits'
  | 'task_limit'
  | 'model_unavailable'
  | 'safety_blocked'
  | 'service_busy'
  | 'timeout'
  | 'no_result'
  | 'invalid_input'
  | 'generic';

function includesAny(message: string, keywords: string[]) {
  return keywords.some((keyword) => message.includes(keyword));
}

export function getAITaskErrorType(message?: string | null): AITaskErrorType {
  const normalized = String(message || '')
    .trim()
    .toLowerCase();

  if (!normalized) {
    return 'generic';
  }

  if (
    includesAny(normalized, [
      'no auth, please sign in',
      'unauthorized',
      'no permission',
    ])
  ) {
    return 'auth_required';
  }

  if (
    includesAny(normalized, [
      'insufficient credits',
      'insufficient credit',
    ])
  ) {
    return 'insufficient_credits';
  }

  if (includesAny(normalized, ['too many active tasks'])) {
    return 'task_limit';
  }

  if (
    includesAny(normalized, [
      'selected ai model is not available',
      'no available ai provider',
      'invalid provider',
      'invalid ai provider',
    ])
  ) {
    return 'model_unavailable';
  }

  if (
    includesAny(normalized, [
      'safety system',
      'safety_violations',
      'safety violation',
      'violates safety',
      'content policy',
      'moderation',
      'sexual',
      'unsafe',
      'rejected by the safety system',
    ])
  ) {
    return 'safety_blocked';
  }

  if (includesAny(normalized, ['timeout', 'timed out'])) {
    return 'timeout';
  }

  if (
    includesAny(normalized, [
      'no images returned',
      'no videos returned',
      'no songs returned',
      'no audio returned',
      'no result',
      'no results',
      'returned no',
    ])
  ) {
    return 'no_result';
  }

  if (
    includesAny(normalized, [
      'invalid prompt',
      'invalid params',
      'prompt or options is required',
      'reference image required',
      'invalid request',
      'unsupported',
    ])
  ) {
    return 'invalid_input';
  }

  if (
    includesAny(normalized, [
      'all channels failed',
      'all providers failed',
      'provider busy',
      'rate limit',
      'too many request',
      'temporarily unavailable',
      'service unavailable',
      'overloaded',
      'internal error',
      'internal server error',
      'network',
      'econnreset',
      'etimedout',
      'socket hang up',
      'queue retry limit exceeded',
      'retryable provider error',
    ])
  ) {
    return 'service_busy';
  }

  return 'generic';
}

export function getAITaskErrorMessage(input: any): string {
  if (!input) {
    return '';
  }

  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'object') {
    if (typeof input.userErrorMessage === 'string' && input.userErrorMessage) {
      return input.userErrorMessage;
    }
    if (typeof input.errorMessage === 'string' && input.errorMessage) {
      return input.errorMessage;
    }
    if (typeof input.message === 'string' && input.message) {
      return input.message;
    }
    if (
      input.error &&
      typeof input.error === 'object' &&
      typeof input.error.message === 'string'
    ) {
      return input.error.message;
    }
  }

  return '';
}

export function formatAITaskErrorMessage({
  input,
  t,
  keyPrefix = 'user_facing.',
}: {
  input: any;
  t: (key: string) => string;
  keyPrefix?: string;
}) {
  const errorType = getAITaskErrorType(getAITaskErrorMessage(input));
  return t(`${keyPrefix}${errorType}`);
}
