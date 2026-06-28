import { envConfigs } from '@/config';
import { getAllConfigs } from '@/shared/models/config';
import type { Brand } from '@/shared/types/blocks/common';

export const DEFAULT_APP_LOGO = '/logo.png';

function normalizeValue(value?: string) {
  const next = value?.trim();
  return next ? next : '';
}

export async function getAppBranding() {
  const configs = await getAllConfigs();

  return {
    appName: normalizeValue(configs.app_name) || envConfigs.app_name,
    appLogo: normalizeValue(configs.app_logo) || DEFAULT_APP_LOGO,
    appDescription:
      normalizeValue(configs.app_description) || envConfigs.app_description,
  };
}

export function applyBrandingToBrand(
  brand: Brand | undefined,
  branding: {
    appName: string;
    appLogo: string;
    appDescription?: string;
  }
) {
  if (!brand) {
    return;
  }

  brand.title = branding.appName;
  brand.logo = {
    ...brand.logo,
    src: branding.appLogo,
    alt: branding.appName,
  };

  if (branding.appDescription) {
    brand.description = branding.appDescription;
  }
}
