import { PricingItem } from '@/shared/types/blocks/pricing';

export const DOMESTIC_CARD_PAYMENT_PROVIDER = 'domestic_card';

type DomesticCardEnvironment = 'sandbox' | 'production';

const DOMESTIC_CARD_PAYMENT_CONFIG_MAP: Record<
  DomesticCardEnvironment,
  Record<string, string>
> = {
  sandbox: {
    'credits-package': 'domestic_card_sandbox_credits_payment_url',
    'starter-monthly': 'domestic_card_sandbox_monthly_payment_url',
    'premium-yearly': 'domestic_card_sandbox_yearly_payment_url',
  },
  production: {
    'credits-package': 'domestic_card_production_credits_payment_url',
    'starter-monthly': 'domestic_card_production_monthly_payment_url',
    'premium-yearly': 'domestic_card_production_yearly_payment_url',
  },
};

const DOMESTIC_CARD_PAYMENT_LEGACY_CONFIG_MAP: Record<string, string> = {
  'credits-package': 'domestic_card_credits_payment_url',
  'starter-monthly': 'domestic_card_monthly_payment_url',
  'premium-yearly': 'domestic_card_yearly_payment_url',
};

export function getDomesticCardEnvironment(configs?: Record<string, string>) {
  if (configs?.domestic_card_environment === 'production') {
    return 'production';
  }
  if (configs?.domestic_card_environment === 'sandbox') {
    return 'sandbox';
  }
  return 'sandbox';
}

export function getDomesticCardConfigKey(
  productId?: string | null,
  environment: DomesticCardEnvironment = 'sandbox'
) {
  return (
    DOMESTIC_CARD_PAYMENT_CONFIG_MAP[environment][String(productId || '').trim()] ||
    ''
  );
}

export function getDomesticCardPaymentUrl(
  configs: Record<string, string>,
  productId?: string | null
) {
  const environment = getDomesticCardEnvironment(configs);
  const key = getDomesticCardConfigKey(productId, environment);
  const legacyKey =
    DOMESTIC_CARD_PAYMENT_LEGACY_CONFIG_MAP[String(productId || '').trim()] || '';
  return key
    ? String(configs[key] || configs[legacyKey] || '').trim()
    : String(configs[legacyKey] || '').trim();
}

export function isDomesticCardSubscriptionItem(
  item?: Pick<PricingItem, 'interval'> | null
) {
  return !!item && item.interval !== 'one-time';
}

export function resolvePaymentKamiMode(configs?: Record<string, string>) {
  if (configs) {
    return getDomesticCardEnvironment(configs) === 'production'
      ? 'live'
      : 'test';
  }
  return 'test';
}
