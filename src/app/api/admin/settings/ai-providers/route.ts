import { PERMISSIONS, requireAllPermissions } from '@/core/rbac';
import { respData, respErr } from '@/shared/lib/resp';
import { saveConfigs } from '@/shared/models/config';
import {
  AIProviderChannel,
  normalizeAIProviderRows,
} from '@/shared/services/ai_channels';

export async function POST(req: Request) {
  try {
    await requireAllPermissions({
      codes: [PERMISSIONS.SETTINGS_READ, PERMISSIONS.SETTINGS_WRITE],
    });

    const body = await req.json();
    const rows = normalizeAIProviderRows(body?.rows || []);
    const invalidRow = rows.find(
      (row) =>
        row.enabled &&
        (!Number.isFinite(Number(row.priority)) ||
          Number(row.priority) < 1 ||
          !String(row.name || '').trim() ||
          !String(row.provider || '').trim() ||
          !String(row.model || '').trim() ||
          !String(row.apiKey || '').trim() ||
          !String(row.baseUrl || '').trim())
    );
    if (invalidRow) {
      return respErr('enabled_row_required');
    }

    const defaults: Record<string, AIProviderChannel | undefined> = {
      kie: rows.find((row) => row.id === 'default-kie'),
      replicate: rows.find((row) => row.id === 'default-replicate'),
      fal: rows.find((row) => row.id === 'default-fal'),
      gemini: rows.find((row) => row.id === 'default-gemini'),
    };

    const firstCustom = rows.find((row) => row.provider === 'custom');

    await saveConfigs({
      ai_provider_rows: JSON.stringify(rows),

      kie_api_key: defaults.kie?.apiKey || '',
      kie_base_url: defaults.kie?.baseUrl || '',
      kie_model: defaults.kie?.model || 'nano-banana-pro',

      replicate_api_token: defaults.replicate?.apiKey || '',
      replicate_base_url: defaults.replicate?.baseUrl || '',
      replicate_model: defaults.replicate?.model || 'google/nano-banana-pro',

      fal_api_key: defaults.fal?.apiKey || '',
      fal_base_url: defaults.fal?.baseUrl || '',
      fal_model: defaults.fal?.model || 'fal-ai/nano-banana-pro',

      gemini_api_key: defaults.gemini?.apiKey || '',
      gemini_base_url: defaults.gemini?.baseUrl || '',
      gemini_model: defaults.gemini?.model || 'gemini-3-pro-image-preview',

      custom_ai_provider: firstCustom?.name || '',
      custom_ai_api_key: firstCustom?.apiKey || '',
      custom_ai_base_url: firstCustom?.baseUrl || '',
      custom_ai_model: firstCustom?.model || 'nano-banana-pro',
    });

    return respData({
      rows,
    });
  } catch (e: any) {
    return respErr(e?.message || 'save ai providers failed');
  }
}
