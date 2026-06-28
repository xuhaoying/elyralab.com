import {
  UpdateAITask,
  findAITaskById,
  getAITasksPendingStorageMigration,
  updateAITaskById,
  updateAITaskByIdAndTaskInfo,
} from '@/shared/models/ai_task';
import { runInBackground } from '@/shared/lib/background-task';
import { getUniSeq } from '@/shared/lib/hash';
import { Configs, getAllConfigs } from '@/shared/models/config';
import { getStorageService } from '@/shared/services/storage';
import { triggerAsyncAITaskShowcaseSync } from '@/shared/services/ai_task_showcase';

type StorageItemStatus = 'pending' | 'uploading' | 'success' | 'failed';

interface StorageImageItem {
  sourceUrl: string;
  r2Url?: string;
  status: StorageItemStatus;
  error?: string;
  updatedAt: string;
}

interface NormalizeResult {
  taskInfo: any;
  hasPending: boolean;
}

const migratingTaskIds = new Set<string>();
const STORAGE_UPLOADING_TIMEOUT_MS = 10 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

function extFromUrl(url: string) {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase() || 'png';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext)) {
      return ext;
    }
  } catch {}
  return 'png';
}

function contentTypeByExt(ext: string) {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'bmp') return 'image/bmp';
  return 'image/png';
}

function extractCandidateUrls(taskInfo: any): string[] {
  const urls: string[] = [];

  if (Array.isArray(taskInfo?.images)) {
    taskInfo.images.forEach((item: any) => {
      const url = item?.imageUrl || item?.url || item?.src;
      if (typeof url === 'string' && url) {
        urls.push(url);
      }
    });
  }

  if (Array.isArray(taskInfo?.output)) {
    taskInfo.output.forEach((item: any) => {
      if (typeof item === 'string' && item) {
        urls.push(item);
      } else if (typeof item?.url === 'string' && item.url) {
        urls.push(item.url);
      }
    });
  }

  return Array.from(new Set(urls));
}

function getStorageItems(taskInfo: any): StorageImageItem[] {
  if (!Array.isArray(taskInfo?.storage?.images)) {
    return [];
  }
  return taskInfo.storage.images
    .map((item: any) => {
      if (!item?.sourceUrl) return null;
      return {
        sourceUrl: String(item.sourceUrl),
        r2Url: item.r2Url ? String(item.r2Url) : undefined,
        status: (item.status || 'pending') as StorageItemStatus,
        error: item.error ? String(item.error) : undefined,
        updatedAt: item.updatedAt ? String(item.updatedAt) : nowIso(),
      } as StorageImageItem;
    })
    .filter(Boolean) as StorageImageItem[];
}

function isExpiredStatus(updatedAt?: string | null, timeoutMs = STORAGE_UPLOADING_TIMEOUT_MS) {
  if (!updatedAt) {
    return true;
  }

  const value = new Date(updatedAt).getTime();
  if (!Number.isFinite(value)) {
    return true;
  }

  return Date.now() - value >= timeoutMs;
}

function normalizeExpiredUploadingItems(items: StorageImageItem[]) {
  let changed = false;

  const nextItems = items.map((item) => {
    if (
      !item.r2Url &&
      item.status === 'uploading' &&
      isExpiredStatus(item.updatedAt)
    ) {
      changed = true;
      return {
        ...item,
        status: 'failed' as StorageItemStatus,
        error: item.error || 'uploading timeout',
        updatedAt: nowIso(),
      };
    }

    return item;
  });

  return {
    items: nextItems,
    changed,
  };
}

export function hasPendingStorageItems(taskInfo: any) {
  return getStorageItems(taskInfo).some(
    (item) =>
      !item.r2Url &&
      (item.status === 'pending' ||
        item.status === 'failed' ||
        (item.status === 'uploading' && isExpiredStatus(item.updatedAt)))
  );
}

function preferredUrls(items: StorageImageItem[]) {
  return items.map((item) => item.r2Url || item.sourceUrl).filter(Boolean);
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function getManagedStoragePrefixes(configs: any): string[] {
  const prefixes: string[] = [];
  const uploadPath = String(configs?.r2_upload_path || 'uploads').replace(
    /^\/+|\/+$/g,
    ''
  );
  const publicDomain = String(configs?.r2_domain || '').trim();
  const endpoint = String(configs?.r2_endpoint || '').trim();
  const bucket = String(configs?.r2_bucket_name || '').trim();
  const s3Domain = String(configs?.s3_domain || '').trim();
  const s3Endpoint = String(configs?.s3_endpoint || '').trim();
  const s3Bucket = String(configs?.s3_bucket || '').trim();

  if (publicDomain) {
    prefixes.push(`${trimTrailingSlash(publicDomain)}/${uploadPath}/`);
  }
  if (endpoint && bucket) {
    prefixes.push(`${trimTrailingSlash(endpoint)}/${bucket}/${uploadPath}/`);
  }
  if (s3Domain) {
    prefixes.push(`${trimTrailingSlash(s3Domain)}/`);
  }
  if (s3Endpoint && s3Bucket) {
    prefixes.push(`${trimTrailingSlash(s3Endpoint)}/${s3Bucket}/`);
  }

  return prefixes;
}

function isManagedStorageUrl(url: string, prefixes: string[]) {
  return prefixes.some((prefix) => url.startsWith(prefix));
}

function applyItemsToTaskInfo(taskInfo: any, items: StorageImageItem[]) {
  const output = preferredUrls(items);
  const images = output.map((url) => ({
    imageUrl: url,
    createTime: new Date(),
  }));

  return {
    ...(taskInfo || {}),
    storage: {
      ...(taskInfo?.storage || {}),
      images: items,
    },
    output,
    images,
  };
}

export function normalizeTaskInfoForDualUrls({
  latestTaskInfo,
  previousTaskInfo,
}: {
  latestTaskInfo: any;
  previousTaskInfo?: any;
}): NormalizeResult {
  const latestUrls = extractCandidateUrls(latestTaskInfo);
  const previousItems = getStorageItems(previousTaskInfo);
  const currentItems = getStorageItems(latestTaskInfo);

  const bySource = new Map<string, StorageImageItem>();
  [...previousItems, ...currentItems].forEach((item) => {
    bySource.set(item.sourceUrl, item);
    if (item.r2Url) {
      bySource.set(item.r2Url, item);
    }
  });

  const seenSources = new Set<string>();
  const mergedItems: StorageImageItem[] = [];
  latestUrls.forEach((sourceUrl) => {
    const existing = bySource.get(sourceUrl);
    const item = existing || {
      sourceUrl,
      status: 'pending' as const,
      updatedAt: nowIso(),
    };
    if (seenSources.has(item.sourceUrl)) {
      return;
    }
    seenSources.add(item.sourceUrl);
    mergedItems.push(item);
  });

  const taskInfo = applyItemsToTaskInfo(latestTaskInfo, mergedItems);
  const hasPending = mergedItems.some(
    (item) =>
      !item.r2Url &&
      (item.status === 'pending' ||
        item.status === 'failed' ||
        (item.status === 'uploading' && isExpiredStatus(item.updatedAt)))
  );

  return { taskInfo, hasPending };
}

export async function migrateAITaskToR2(taskId: string, configs?: Configs) {
  const task = await findAITaskById(taskId);
  if (!task || !task.taskInfo) {
    return { ok: false, skipped: true, reason: 'task not found' as const };
  }

  const resolvedConfigs = configs || (await getAllConfigs());
  const managedStoragePrefixes = getManagedStoragePrefixes(resolvedConfigs);

  let taskInfo: any = null;
  try {
    taskInfo = JSON.parse(task.taskInfo);
  } catch {
    return { ok: false, skipped: true, reason: 'invalid task info' as const };
  }

  let currentTaskInfoText = task.taskInfo;
  const normalizedItems = normalizeExpiredUploadingItems(getStorageItems(taskInfo));
  const items = normalizedItems.items;
  if (normalizedItems.changed) {
    taskInfo = applyItemsToTaskInfo(taskInfo, items);
    const nextTaskInfoText = JSON.stringify(taskInfo);
    const recoveredTask = await updateAITaskByIdAndTaskInfo({
      id: taskId,
      expectedTaskInfo: currentTaskInfoText,
      updateAITask: {
        taskInfo: nextTaskInfoText,
      },
    });

    if (!recoveredTask) {
      return { ok: true, skipped: true, reason: 'concurrent migration' as const };
    }

    currentTaskInfoText = nextTaskInfoText;
  }

  items.forEach((item) => {
    if (!item.r2Url && isManagedStorageUrl(item.sourceUrl, managedStoragePrefixes)) {
      item.r2Url = item.sourceUrl;
      item.status = 'success';
      item.error = undefined;
      item.updatedAt = nowIso();
    }
  });
  const pendingItems = items.filter(
    (item) =>
      !item.r2Url && (item.status === 'pending' || item.status === 'failed')
  );

  if (pendingItems.length === 0) {
    const finalTaskInfo = applyItemsToTaskInfo(taskInfo, items);
    if (JSON.stringify(finalTaskInfo) !== JSON.stringify(taskInfo)) {
      await updateAITaskById(taskId, {
        taskInfo: JSON.stringify(finalTaskInfo),
      });
    }
    triggerAsyncAITaskShowcaseSync(taskId);
    return { ok: true, skipped: true, reason: 'no pending storage items' as const };
  }

  let storageService: any = null;
  try {
      storageService = await getStorageService(resolvedConfigs);
  } catch (error: any) {
    const failedItems = items.map((item) => {
      if (!item.r2Url) {
        return {
          ...item,
          status: 'failed' as StorageItemStatus,
          error: error?.message || 'storage unavailable',
          updatedAt: nowIso(),
        };
      }
      return item;
    });

    const failedTaskInfo = applyItemsToTaskInfo(taskInfo, failedItems);
    const updateData: UpdateAITask = {
      taskInfo: JSON.stringify(failedTaskInfo),
    };
    await updateAITaskById(taskId, updateData);
    return { ok: false, skipped: true, reason: 'storage unavailable' as const };
  }

  const uploadTargets = new Map(items.map((item) => [item.sourceUrl, item]));
  for (const pendingItem of pendingItems) {
    const item = uploadTargets.get(pendingItem.sourceUrl);
    if (!item) continue;

    item.status = 'uploading';
    item.error = undefined;
    item.updatedAt = nowIso();
  }

  const uploadingTaskInfo = applyItemsToTaskInfo(
    taskInfo,
    Array.from(uploadTargets.values())
  );
  const claimedTask = await updateAITaskByIdAndTaskInfo({
    id: taskId,
    expectedTaskInfo: currentTaskInfoText || JSON.stringify(taskInfo),
    updateAITask: {
      taskInfo: JSON.stringify(uploadingTaskInfo),
    },
  });

  if (!claimedTask) {
    return { ok: true, skipped: true, reason: 'concurrent migration' as const };
  }

  for (const pendingItem of pendingItems) {
    const item = uploadTargets.get(pendingItem.sourceUrl);
    if (!item) continue;

    const ext = extFromUrl(item.sourceUrl);
    const date = new Date().toISOString().slice(0, 10);
    const key = `ai/image/${date}/${getUniSeq('img_')}.${ext}`;

    try {
      const uploaded = await storageService.downloadAndUpload({
        url: item.sourceUrl,
        key,
        contentType: contentTypeByExt(ext),
      });

      if (!uploaded?.success || !uploaded?.url) {
        throw new Error(uploaded?.error || 'upload failed');
      }

      item.r2Url = uploaded.url;
      item.status = 'success';
      item.error = undefined;
      item.updatedAt = nowIso();
    } catch (error: any) {
      item.status = 'failed';
      item.error = error?.message || 'upload failed';
      item.updatedAt = nowIso();
    }
  }

  const finalTaskInfo = applyItemsToTaskInfo(
    uploadingTaskInfo,
    Array.from(uploadTargets.values())
  );
  await updateAITaskById(taskId, {
    taskInfo: JSON.stringify(finalTaskInfo),
  });
  triggerAsyncAITaskShowcaseSync(taskId);

  return {
    ok: true,
    skipped: false,
    failedCount: Array.from(uploadTargets.values()).filter(
      (item) => item.status === 'failed'
    ).length,
  };
}

export async function retryFailedR2Migrations(limit = 100) {
  const configs = await getAllConfigs();
  if (!configs.r2_access_key || !configs.r2_secret_key || !configs.r2_bucket_name) {
    return {
      total: 0,
      retried: 0,
      skipped: true,
      reason: 'r2 not configured',
      results: [],
    };
  }

  const tasks = await getAITasksPendingStorageMigration({ limit });
  const pendingTasks = tasks.filter((task: any) => {
    try {
      return hasPendingStorageItems(JSON.parse(task.taskInfo || '{}'));
    } catch {
      return false;
    }
  });

  const results = [];
  for (const task of pendingTasks) {
    const result = await migrateAITaskToR2(task.id);
    results.push({
      taskId: task.id,
      ...result,
    });
  }

  return {
    total: pendingTasks.length,
    retried: results.filter((item) => item.ok && !item.skipped).length,
    skipped: false,
    results,
  };
}

export function triggerAsyncR2Migration(taskId: string, configs?: Configs) {
  if (migratingTaskIds.has(taskId)) {
    return;
  }

  migratingTaskIds.add(taskId);

  const run = migrateAITaskToR2(taskId, configs)
    .catch((error) => {
      console.error('async r2 migration failed:', error);
    })
    .finally(() => {
      migratingTaskIds.delete(taskId);
    });

  runInBackground(run);
}
