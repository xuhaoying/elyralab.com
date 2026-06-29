const MAX_PROXY_FILE_BYTES = 100 * 1024 * 1024;

function parseIpv4(hostname: string) {
  const parts = hostname.split('.');
  if (parts.length !== 4) return null;

  const octets = parts.map((part) => {
    if (!/^\d{1,3}$/.test(part)) return NaN;
    return Number(part);
  });

  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
    return null;
  }

  return octets;
}

function isPrivateIpv4(hostname: string) {
  const octets = parseIpv4(hostname);
  if (!octets) return false;

  const [a, b] = octets;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = hostname.replace(/^\[|\]$/g, '').toLowerCase();
  return (
    normalized === '::1' ||
    normalized === '::' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:') ||
    normalized.startsWith('0:')
  );
}

export function validatePublicFetchUrl(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false as const, error: 'Invalid url' };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { ok: false as const, error: 'Only http and https urls are allowed' };
  }

  if (url.username || url.password) {
    return { ok: false as const, error: 'Url credentials are not allowed' };
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return { ok: false as const, error: 'Private hostnames are not allowed' };
  }

  if (isPrivateIpv4(hostname) || isPrivateIpv6(hostname)) {
    return { ok: false as const, error: 'Private network urls are not allowed' };
  }

  return { ok: true as const, url };
}

export function validateProxyResponse(response: Response) {
  const contentLength = response.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_PROXY_FILE_BYTES) {
    return { ok: false as const, error: 'File is too large', status: 413 };
  }

  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';
  const normalizedType = contentType.split(';')[0].trim().toLowerCase();
  const allowed =
    normalizedType.startsWith('image/') ||
    normalizedType.startsWith('video/') ||
    normalizedType.startsWith('audio/') ||
    normalizedType === 'application/octet-stream' ||
    normalizedType === 'application/pdf' ||
    normalizedType === 'text/plain';

  if (!allowed || normalizedType === 'image/svg+xml') {
    return { ok: false as const, error: 'File type is not allowed', status: 415 };
  }

  return { ok: true as const, contentType };
}

