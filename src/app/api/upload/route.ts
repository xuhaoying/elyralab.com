import { NextRequest, NextResponse } from 'next/server';

import {
  getSafeImageExtension,
  validateImageUploadBody,
  validateImageUploadMetadata,
} from '@/shared/lib/upload-security';
import { getUserInfo } from '@/shared/models/user';
import { getStorageService } from '@/shared/services/storage';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const metadataValidation = validateImageUploadMetadata(file);
    if (!metadataValidation.ok) {
      return NextResponse.json(
        { error: metadataValidation.error },
        { status: 415 }
      );
    }

    const storageService = await getStorageService();

    const now = new Date();
    const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = getSafeImageExtension(metadataValidation.mimeType);
    const key = `${dateFolder}/${timestamp}-${randomStr}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const bodyValidation = validateImageUploadBody(
      buffer,
      metadataValidation.mimeType
    );
    if (!bodyValidation.ok) {
      return NextResponse.json(
        { error: bodyValidation.error },
        { status: 415 }
      );
    }

    const result = await storageService.uploadFile({
      body: buffer,
      key,
      contentType: metadataValidation.mimeType,
      disposition: 'inline',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
