const SINGLE_IMAGE_RESULT_MODELS = new Set([
  'nano-banana-pro',
  'gpt-image-2',
  'gpt-image2',
]);

export function parseAITaskPayload(value?: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function dedupeAITaskUrls(urls: Array<string | null | undefined>) {
  return Array.from(new Set(urls.filter(Boolean) as string[]));
}

export function shouldUseSingleImageResult(task: {
  provider?: string | null;
  model?: string | null;
}) {
  const provider = String(task.provider || '').trim().toLowerCase();
  const model = String(task.model || '').trim().toLowerCase();

  return provider === 'custom' && SINGLE_IMAGE_RESULT_MODELS.has(model);
}

export function normalizeAITaskImageUrls(
  task: {
    provider?: string | null;
    model?: string | null;
  },
  urls: string[]
) {
  if (shouldUseSingleImageResult(task)) {
    return urls[0] ? [urls[0]] : [];
  }

  return dedupeAITaskUrls(urls);
}

export function getAITaskImageUrls(task: {
  provider?: string | null;
  model?: string | null;
  taskInfo?: string | null;
  taskResult?: string | null;
}) {
  const taskInfo = parseAITaskPayload(task.taskInfo);
  const taskResult = parseAITaskPayload(task.taskResult);

  if (!taskInfo && !taskResult) {
    return [];
  }

  if (shouldUseSingleImageResult(task)) {
    const nestedUrls = taskResult?.data?.result?.images
      ?.flatMap((image: any) =>
        Array.isArray(image?.url)
          ? image.url.filter((url: any) => typeof url === 'string')
          : typeof image?.url === 'string'
            ? [image.url]
            : []
      )
      .filter(Boolean);
    const taskInfoUrls = Array.isArray(taskInfo?.images)
      ? taskInfo.images.map((image: any) => image?.imageUrl)
      : Array.isArray(taskInfo?.output)
        ? taskInfo.output
        : [];

    return dedupeAITaskUrls(nestedUrls?.length ? [nestedUrls[0]] : [taskInfoUrls[0]]);
  }

  if (Array.isArray(taskInfo?.images)) {
    return dedupeAITaskUrls(taskInfo.images.map((image: any) => image?.imageUrl));
  }

  return [];
}
