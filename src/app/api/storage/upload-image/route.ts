import { md5 } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import {
  getSafeImageExtension,
  MAX_IMAGE_UPLOAD_COUNT,
  validateImageUploadBody,
  validateImageUploadMetadata,
} from '@/shared/lib/upload-security';
import { getUserInfo } from '@/shared/models/user';
import { getStorageService } from '@/shared/services/storage';

export async function POST(req: Request) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr('no auth, please sign in', 401);
    }

    const storageService = await getStorageService();
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return respErr('No files provided');
    }
    if (files.length > MAX_IMAGE_UPLOAD_COUNT) {
      return respErr(`Upload at most ${MAX_IMAGE_UPLOAD_COUNT} images`, 413);
    }

    const uploadResults = [];

    for (const file of files) {
      const metadataValidation = validateImageUploadMetadata(file);
      if (!metadataValidation.ok) {
        return respErr(metadataValidation.error, 415);
      }

      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);
      const bodyValidation = validateImageUploadBody(
        body,
        metadataValidation.mimeType
      );
      if (!bodyValidation.ok) {
        return respErr(bodyValidation.error, 415);
      }

      const digest = md5(body);
      const ext = getSafeImageExtension(metadataValidation.mimeType);
      const key = `${digest}.${ext}`;

      // If the same image already exists, reuse its URL to save storage space.
      // (Still depends on provider supporting signed HEAD + public url generation.)
      const exists = await storageService.exists({ key });
      if (exists) {
        const publicUrl = storageService.getPublicUrl({ key });
        if (publicUrl) {
          uploadResults.push({
            url: publicUrl,
            key,
            filename: file.name,
            deduped: true,
          });
          continue;
        }
      }

      const result = await storageService.uploadFile({
        body,
        key: key,
        contentType: metadataValidation.mimeType,
        disposition: 'inline',
      });

      if (!result.success) {
        console.error('[API] Upload failed:', result.error);
        return respErr(result.error || 'Upload failed');
      }

      uploadResults.push({
        url: result.url,
        key: result.key,
        filename: file.name,
        deduped: false,
      });
    }

    return respData({
      urls: uploadResults.map((r) => r.url),
      results: uploadResults,
    });
  } catch (e) {
    console.error('upload image failed:', e);
    return respErr('upload image failed');
  }
}
