import {
  CustomProvider,
  FalProvider,
  GeminiProvider,
  KieProvider,
  ReplicateProvider,
} from '@/extensions/ai';
import { AIProvider } from '@/extensions/ai/types';
import { Configs } from '@/shared/models/config';

export type AIProviderKind = 'kie' | 'replicate' | 'fal' | 'gemini' | 'custom';

export interface AIProviderChannel {
  id: string;
  name: string;
  provider: AIProviderKind;
  priority: number;
  enabled: boolean;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export const AI_PROVIDER_ROWS_CONFIG_KEY = 'ai_provider_rows';

const DEFAULT_CHANNEL_IDS = {
  kie: 'default-kie',
  replicate: 'default-replicate',
  fal: 'default-fal',
  gemini: 'default-gemini',
} as const;

function toInt(value: any, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.max(1, Math.floor(num));
}

function toBool(value: any, fallback = false): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === '1' || value === 1) {
    return true;
  }
  if (value === 'false' || value === '0' || value === 0) {
    return false;
  }
  return fallback;
}

function safeParseRows(raw: string | undefined): AIProviderChannel[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as AIProviderChannel[];
  } catch {
    return [];
  }
}

function defaultChannels(configs: Configs): AIProviderChannel[] {
  return [
    {
      id: DEFAULT_CHANNEL_IDS.kie,
      name: 'Kie',
      provider: 'kie',
      priority: 10,
      enabled: !!configs.kie_api_key,
      model: configs.kie_model || 'nano-banana-pro',
      apiKey: configs.kie_api_key || '',
      baseUrl: configs.kie_base_url || 'https://api.kie.ai/api/v1',
    },
    {
      id: DEFAULT_CHANNEL_IDS.replicate,
      name: 'Replicate',
      provider: 'replicate',
      priority: 20,
      enabled: !!configs.replicate_api_token,
      model: configs.replicate_model || 'google/nano-banana-pro',
      apiKey: configs.replicate_api_token || '',
      baseUrl: configs.replicate_base_url || '',
    },
    {
      id: DEFAULT_CHANNEL_IDS.fal,
      name: 'Fal',
      provider: 'fal',
      priority: 30,
      enabled: !!configs.fal_api_key,
      model: configs.fal_model || 'fal-ai/nano-banana-pro',
      apiKey: configs.fal_api_key || '',
      baseUrl: configs.fal_base_url || 'https://queue.fal.run',
    },
    {
      id: DEFAULT_CHANNEL_IDS.gemini,
      name: 'Gemini',
      provider: 'gemini',
      priority: 40,
      enabled: !!configs.gemini_api_key,
      model: configs.gemini_model || 'gemini-3-pro-image-preview',
      apiKey: configs.gemini_api_key || '',
      baseUrl: configs.gemini_base_url || '',
    },
  ];
}

function normalizeChannel(input: any, index: number): AIProviderChannel | null {
  const provider = String(input?.provider || '').trim() as AIProviderKind;
  if (!['kie', 'replicate', 'fal', 'gemini', 'custom'].includes(provider)) {
    return null;
  }

  const id = String(input?.id || '').trim() || `custom-${Date.now()}-${index}`;
  const name = String(input?.name || '').trim() || provider.toUpperCase();
  const model = String(input?.model || '').trim();
  const apiKey = String(input?.apiKey || '').trim();
  const baseUrl = String(input?.baseUrl || '').trim();

  return {
    id,
    name,
    provider,
    priority: toInt(input?.priority, index + 1),
    enabled: toBool(input?.enabled, false),
    model,
    apiKey,
    baseUrl,
  };
}

export function normalizeAIProviderRows(rows: any[]): AIProviderChannel[] {
  const normalized = rows
    .map((row, idx) => normalizeChannel(row, idx))
    .filter(Boolean) as AIProviderChannel[];

  const dedup = new Map<string, AIProviderChannel>();
  normalized.forEach((row) => {
    dedup.set(row.id, row);
  });

  return Array.from(dedup.values()).sort((a, b) => a.priority - b.priority);
}

export function getAIProviderRows(configs: Configs): AIProviderChannel[] {
  const defaults = defaultChannels(configs);
  const saved = safeParseRows(configs[AI_PROVIDER_ROWS_CONFIG_KEY]);
  const normalizedSaved = normalizeAIProviderRows(saved);

  if (normalizedSaved.length === 0) {
    const legacyCustomEnabled = !!(
      configs.custom_ai_api_key &&
      configs.custom_ai_base_url
    );
    const legacyCustomModel = configs.custom_ai_model || 'nano-banana-pro';
    if (legacyCustomEnabled) {
      defaults.unshift({
        id: 'custom-legacy-1',
        name: configs.custom_ai_provider || 'Custom',
        provider: 'custom',
        priority: 5,
        enabled: true,
        model: legacyCustomModel,
        apiKey: configs.custom_ai_api_key || '',
        baseUrl: configs.custom_ai_base_url || '',
      });
    }
    return defaults.sort((a, b) => a.priority - b.priority);
  }

  const byId = new Map(normalizedSaved.map((item) => [item.id, item]));
  const mergedDefaults = defaults.map((row) => {
    const savedRow = byId.get(row.id);
    if (!savedRow) {
      return row;
    }
    return {
      ...row,
      priority: savedRow.priority,
      enabled: savedRow.enabled,
      model: savedRow.model ?? row.model,
      name: savedRow.name ?? row.name,
      apiKey: savedRow.apiKey ?? row.apiKey,
      baseUrl: savedRow.baseUrl ?? row.baseUrl,
    };
  });

  const customRows = normalizedSaved.filter((row) => row.provider === 'custom');

  return [...mergedDefaults, ...customRows].sort((a, b) => a.priority - b.priority);
}

export function getEnabledImageChannels(configs: Configs): AIProviderChannel[] {
  return getAIProviderRows(configs)
    .filter((row) => row.enabled && row.apiKey && row.model)
    .filter((row) => (row.provider === 'custom' ? !!row.baseUrl : true))
    .sort((a, b) => a.priority - b.priority);
}

export function createProviderByChannel(
  channel: AIProviderChannel,
  configs: Configs
): AIProvider {
  switch (channel.provider) {
    case 'kie':
      return new KieProvider({
        apiKey: channel.apiKey,
        baseUrl: channel.baseUrl || configs.kie_base_url,
        customStorage: configs.kie_custom_storage === 'true',
      });
    case 'replicate':
      return new ReplicateProvider({
        apiToken: channel.apiKey,
        baseUrl: channel.baseUrl || configs.replicate_base_url,
        customStorage: configs.replicate_custom_storage === 'true',
      });
    case 'fal':
      return new FalProvider({
        apiKey: channel.apiKey,
        baseUrl: channel.baseUrl || configs.fal_base_url,
        customStorage: configs.fal_custom_storage === 'true',
      });
    case 'gemini':
      return new GeminiProvider({
        apiKey: channel.apiKey,
      });
    case 'custom':
      if (!channel.baseUrl) {
        throw new Error(`custom provider ${channel.name} base url is required`);
      }
      return new CustomProvider({
        apiKey: channel.apiKey,
        baseUrl: channel.baseUrl,
      });
    default:
      throw new Error(`unsupported provider: ${channel.provider}`);
  }
}

export function findChannelById(
  configs: Configs,
  channelId: string
): AIProviderChannel | undefined {
  return getAIProviderRows(configs).find((row) => row.id === channelId);
}
