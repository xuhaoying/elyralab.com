import { getCloudflareContext } from '@opennextjs/cloudflare';

export function getCloudflareEnv() {
  try {
    return getCloudflareContext({ async: false }).env as Record<string, any>;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Cloudflare context is not available:', error);
    }
    return null;
  }
}

