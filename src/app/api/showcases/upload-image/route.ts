import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { getStorageService } from '@/shared/services/storage';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function isPrivateIpAddress(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;

  if (isIP(normalized) === 4) {
    const parts = normalized.split('.').map(Number);
    if (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254)
    ) {
      return true;
    }
  }

  if (isIP(normalized) === 6) {
    return (
      normalized === '::1' ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd') ||
      normalized.startsWith('fe80:')
    );
  }

  return false;
}

function isPrivateHostname(hostname: string) {
  const value = hostname.trim().toLowerCase();
  if (!value) return true;
  if (
    value === 'localhost' ||
    value === '127.0.0.1' ||
    value === '::1' ||
    value.endsWith('.local') ||
    value.endsWith('.internal')
  ) {
    return true;
  }

  return isPrivateIpAddress(value);
}

async function resolvesToPrivateAddress(hostname: string) {
  if (isIP(hostname)) {
    return isPrivateIpAddress(hostname);
  }

  try {
    const records = await lookup(hostname, { all: true });
    return records.some((record) => isPrivateIpAddress(record.address));
  } catch {
    return true;
  }
}

const extFromMime = (mimeType: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType] || '';
};

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('unauthorized');
    }

    const body = await req.json().catch(() => null);
    const rawUrl = body?.url;
    if (!rawUrl || typeof rawUrl !== 'string') {
      return respErr('invalid image url');
    }

    const url = new URL(rawUrl);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return respErr('invalid image url');
    }

    if (
      url.username ||
      url.password ||
      isPrivateHostname(url.hostname) ||
      (await resolvesToPrivateAddress(url.hostname))
    ) {
      return respErr('invalid image url');
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store',
    });

    if (!response.ok) {
      return respErr(`fetch image failed: ${response.status}`);
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    if (!contentType.startsWith('image/')) {
      return respErr('invalid image content type');
    }

    const contentLength = Number(response.headers.get('content-length') || '0');
    if (contentLength > MAX_FILE_SIZE) {
      return respErr('file too large');
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return respErr('file too large');
    }

    const storageService = await getStorageService();
    const now = new Date();
    const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext =
      extFromMime(contentType) || url.pathname.split('.').pop() || 'bin';
    const key = `${dateFolder}/${timestamp}-${randomStr}.${ext}`;

    const result = await storageService.uploadFile({
      body: new Uint8Array(arrayBuffer),
      key,
      contentType,
      disposition: 'inline',
    });

    if (!result.success || !result.url) {
      return respErr(result.error || 'upload failed');
    }

    return respData({
      url: result.url,
    });
  } catch (error) {
    console.error('upload showcase image failed:', error);
    return respErr('upload showcase image failed');
  }
}
