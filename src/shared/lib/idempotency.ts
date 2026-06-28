import { md5 } from '@/shared/lib/hash';

export const IMAGE_GENERATE_IDEMPOTENCY_WINDOW_MS = 10 * 1000;

export function buildImageGenerateIdempotencyKey({
  provider,
  model,
  prompt,
  scene,
  options,
  now = Date.now(),
  windowMs = IMAGE_GENERATE_IDEMPOTENCY_WINDOW_MS,
}: {
  provider: string;
  model: string;
  prompt: string;
  scene: string;
  options: Record<string, any>;
  now?: number;
  windowMs?: number;
}) {
  const bucket = Math.floor(now / windowMs);
  return md5(
    JSON.stringify({
      provider,
      model,
      prompt,
      scene,
      options,
      bucket,
    })
  );
}

export function shouldRotateImageTaskId(status?: string | null) {
  return status === 'success' || status === 'failed' || status === 'canceled';
}
