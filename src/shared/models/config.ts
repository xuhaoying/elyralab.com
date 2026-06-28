import { revalidateTag, unstable_cache } from 'next/cache';

import { db } from '@/core/db';
import { envConfigs } from '@/config';
import { config } from '@/config/db/schema';
import {
  getAllSettingNames,
  publicSettingNames,
} from '@/shared/services/settings';

export type Config = typeof config.$inferSelect;
export type NewConfig = typeof config.$inferInsert;
export type UpdateConfig = Partial<Omit<NewConfig, 'name'>>;

export type Configs = Record<string, string>;

export const CACHE_TAG_CONFIGS = 'configs';

function isIgnorableSettingNamesError(error: any) {
  const message = String(error?.message || '');
  const causeMessage = String(error?.cause?.message || '');
  const digest = String(error?.digest || '');
  const causeDigest = String(error?.cause?.digest || '');

  return (
    digest === 'DYNAMIC_SERVER_USAGE' ||
    causeDigest === 'DYNAMIC_SERVER_USAGE' ||
    message.includes(
      'Usage of next-intl APIs in Server Components currently opts into dynamic rendering'
    ) ||
    causeMessage.includes('Dynamic server usage:')
  );
}

export async function saveConfigs(configs: Record<string, string>) {
  const result = await db().transaction(async (tx: any) => {
    const configEntries = Object.entries(configs);
    const results: any[] = [];

    for (const [name, configValue] of configEntries) {
      const [upsertResult] = await tx
        .insert(config)
        .values({ name, value: configValue })
        .onConflictDoUpdate({
          target: config.name,
          set: { value: configValue },
        })
        .returning();

      results.push(upsertResult);
    }

    return results;
  });

  revalidateTag(CACHE_TAG_CONFIGS, 'max');

  return result;
}

export async function addConfig(newConfig: NewConfig) {
  const [result] = await db().insert(config).values(newConfig).returning();
  revalidateTag(CACHE_TAG_CONFIGS, 'max');

  return result;
}

export const getConfigs = unstable_cache(
  async (): Promise<Configs> => {
    const configs: Record<string, string> = {};

    if (!envConfigs.database_url) {
      return configs;
    }

    const result = await db().select().from(config);
    if (!result) {
      return configs;
    }

    for (const config of result) {
      configs[config.name] = config.value ?? '';
    }

    return configs;
  },
  ['configs'],
  {
    revalidate: 3600,
    tags: [CACHE_TAG_CONFIGS],
  }
);

export async function getAllConfigs(): Promise<Configs> {
  let rawDbConfigs: Configs = {};
  let dbConfigs: Configs = {};

  // only get configs from db in server side
  if (typeof window === 'undefined' && envConfigs.database_url) {
    try {
      rawDbConfigs = await getConfigs();
      dbConfigs = { ...rawDbConfigs };
    } catch (e) {
      console.log(`get configs from db failed:`, e);
      try {
        const fallbackResult = await db().select().from(config);
        rawDbConfigs = {};
        fallbackResult.forEach((item: Config) => {
          rawDbConfigs[item.name] = item.value ?? '';
        });
        dbConfigs = { ...rawDbConfigs };
      } catch (fallbackError) {
        console.log(`fallback get configs from db failed:`, fallbackError);
        rawDbConfigs = {};
        dbConfigs = {};
      }
    }
  }

  let settingNames: string[] = [];
  try {
    settingNames = await getAllSettingNames();
  } catch (e) {
    if (!isIgnorableSettingNamesError(e)) {
      console.log(`get setting names failed:`, e);
    }
    settingNames = Array.from(
      new Set([...Object.keys(rawDbConfigs), ...Object.keys(envConfigs)])
    );
  }
  settingNames.forEach((key) => {
    const upperKey = key.toUpperCase();
    // use env configs if available
    if (process.env[upperKey]) {
      dbConfigs[key] = process.env[upperKey] ?? '';
    } else if (process.env[key]) {
      dbConfigs[key] = process.env[key] ?? '';
    }
  });

  const configs = {
    ...envConfigs,
    ...dbConfigs,
  };

  configs.app_name = rawDbConfigs.app_name?.trim() || envConfigs.app_name;
  configs.app_logo = rawDbConfigs.app_logo?.trim() || '/logo.png';

  return configs;
}

export async function getPublicConfigs(): Promise<Configs> {
  let allConfigs = await getAllConfigs();

  const publicConfigs: Record<string, string> = {};

  // get public configs
  for (const key in allConfigs) {
    if (publicSettingNames.includes(key)) {
      publicConfigs[key] = String(allConfigs[key]);
    }
  }

  const configs = {
    ...publicConfigs,
  };

  return configs;
}
