export const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_COUNT = 8;

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
]);

export function getSafeImageExtension(mimeType: string) {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType.toLowerCase()] || '';
}

export function validateImageUploadMetadata(file: File) {
  if (!file || typeof file.size !== 'number') {
    return { ok: false as const, error: 'Invalid file' };
  }

  const mimeType = (file.type || '').toLowerCase();
  if (!allowedImageMimeTypes.has(mimeType)) {
    return { ok: false as const, error: `File ${file.name} is not an allowed image type` };
  }

  if (file.size <= 0) {
    return { ok: false as const, error: `File ${file.name} is empty` };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return { ok: false as const, error: `File ${file.name} is larger than 10 MB` };
  }

  return { ok: true as const, mimeType };
}

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function hasAllowedImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (mimeType === 'image/gif') {
    const header = ascii(bytes, 0, 6);
    return header === 'GIF87a' || header === 'GIF89a';
  }

  if (mimeType === 'image/webp') {
    return ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP';
  }

  if (mimeType === 'image/avif' || mimeType === 'image/heic' || mimeType === 'image/heif') {
    const box = ascii(bytes, 4, 4);
    const brand = ascii(bytes, 8, 4);
    return (
      box === 'ftyp' &&
      ['avif', 'avis', 'heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(
        brand
      )
    );
  }

  return false;
}

export function validateImageUploadBody(bytes: Uint8Array, mimeType: string) {
  if (!hasAllowedImageSignature(bytes, mimeType)) {
    return { ok: false as const, error: 'File content does not match an allowed image type' };
  }

  return { ok: true as const };
}

