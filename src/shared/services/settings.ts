import { getTranslations } from 'next-intl/server';

import { Tab } from '@/shared/types/blocks/common';

export interface Setting {
  name: string;
  title: string;
  type: string;
  placeholder?: string;
  options?: {
    title: string;
    value: string;
  }[];
  tip?: string;
  value?: string | string[] | boolean | number;
  group?: string;
  tab?: string;
  attributes?: Record<string, any>;
  validation?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface SettingGroup {
  name: string;
  title: string;
  description?: string;
  tab: string;
}

export async function getSettingTabs(tab: string) {
  const t = await getTranslations('admin.settings');

  const tabs: Tab[] = [
    {
      name: 'general',
      title: t('edit.tabs.general'),
      url: '/admin/settings/general',
      is_active: tab === 'general',
    },
    {
      name: 'auth',
      title: t('edit.tabs.auth'),
      url: '/admin/settings/auth',
      is_active: tab === 'auth',
    },
    {
      name: 'payment',
      title: t('edit.tabs.payment'),
      url: '/admin/settings/payment',
      is_active: tab === 'payment',
    },
    {
      name: 'email',
      title: t('edit.tabs.email'),
      url: '/admin/settings/email',
      is_active: tab === 'email',
    },
    {
      name: 'storage',
      title: t('edit.tabs.storage'),
      url: '/admin/settings/storage',
      is_active: tab === 'storage',
    },

    {
      name: 'ai',
      title: t('edit.tabs.ai'),
      url: '/admin/settings/ai',
      is_active: tab === 'ai',
    },
    {
      name: 'analytics',
      title: t('edit.tabs.analytics'),
      url: '/admin/settings/analytics',
      is_active: tab === 'analytics',
    },
    {
      name: 'ads',
      title: t('edit.tabs.ads'),
      url: '/admin/settings/ads',
      is_active: tab === 'ads',
    },
    {
      name: 'affiliate',
      title: t('edit.tabs.affiliate'),
      url: '/admin/settings/affiliate',
      is_active: tab === 'affiliate',
    },
    {
      name: 'customer_service',
      title: t('edit.tabs.customer_service'),
      url: '/admin/settings/customer_service',
      is_active: tab === 'customer_service',
    },
  ];

  return tabs;
}

export async function getSettingGroups() {
  const t = await getTranslations('admin.settings');
  const settingGroups: SettingGroup[] = [
    {
      name: 'appinfo',
      title: t('groups.appinfo'),
      description: 'custom your app info',
      tab: 'general',
    },
    {
      name: 'user_role',
      title: t('groups.user_role'),
      description: 'custom user role settings',
      tab: 'general',
    },
    {
      name: 'credit',
      title: t('groups.credit'),
      description: 'custom credit settings',
      tab: 'general',
    },
    {
      name: 'email_auth',
      title: t('groups.email_auth'),
      description: 'custom your email auth settings',
      tab: 'auth',
    },
    {
      name: 'google_auth',
      title: t('groups.google_auth'),
      description: 'custom your google auth settings',
      tab: 'auth',
    },
    {
      name: 'github_auth',
      title: t('groups.github_auth'),
      description: 'custom your github auth settings',
      tab: 'auth',
    },
    {
      name: 'basic_payment',
      title: t('groups.basic_payment'),
      description: t('payment.groups.basic_payment_description'),
      tab: 'payment',
    },
    {
      name: 'domestic_card_payment',
      title: t('groups.domestic_card_payment'),
      description: t('payment.groups.domestic_card_payment_description'),
      tab: 'payment',
    },
    {
      name: 'stripe',
      title: t('groups.stripe'),
      description: t.raw('payment.groups.stripe_description'),
      tab: 'payment',
    },
    {
      name: 'creem',
      title: t('groups.creem'),
      description: t.raw('payment.groups.creem_description'),
      tab: 'payment',
    },
    {
      name: 'paypal',
      title: t('groups.paypal'),
      description: t('payment.groups.paypal_description'),
      tab: 'payment',
    },
    {
      name: 'google_analytics',
      title: t('groups.google_analytics'),
      description:
        'custom your <a href="https://analytics.google.com/" class="text-primary" target="_blank">Google Analytics</a> settings',
      tab: 'analytics',
    },
    {
      name: 'clarity',
      title: t('groups.clarity'),
      description:
        'custom your <a href="https://clarity.microsoft.com/" class="text-primary" target="_blank">Clarity</a> settings',
      tab: 'analytics',
    },
    {
      name: 'plausible',
      title: t('groups.plausible'),
      description:
        'custom your <a href="https://plausible.io/" class="text-primary" target="_blank">Plausible</a> settings',
      tab: 'analytics',
    },
    {
      name: 'openpanel',
      title: t('groups.openpanel'),
      description:
        'custom your <a href="https://openpanel.dev/" class="text-primary" target="_blank">OpenPanel</a> settings',
      tab: 'analytics',
    },
    {
      name: 'vercel_analytics',
      title: t('groups.vercel_analytics'),
      description:
        'custom your <a href="https://vercel.com/docs/analytics/" class="text-primary" target="_blank">Vercel Analytics</a> settings',
      tab: 'analytics',
    },
    {
      name: 'resend',
      title: t('groups.resend'),
      description: 'custom your resend settings',
      tab: 'email',
    },
    {
      name: 'r2',
      title: t('groups.r2'),
      description: 'custom your cloudflare r2 settings',
      tab: 'storage',
    },
    {
      name: 'openrouter',
      title: t('groups.openrouter'),
      description: `Custom <a href="https://openrouter.ai" class="text-primary" target="_blank">OpenRouter</a> settings`,
      tab: 'ai',
    },
    {
      name: 'custom_ai',
      title: t('groups.custom_ai'),
      description: 'Custom your own AI provider settings',
      tab: 'ai',
    },
    {
      name: 'replicate',
      title: t('groups.replicate'),
      description: `Custom <a href="https://replicate.com" class="text-primary" target="_blank">Replicate</a> settings`,
      tab: 'ai',
    },
    {
      name: 'fal',
      title: 'Fal',
      description: `Custom <a href="https://fal.ai" class="text-primary" target="_blank">Fal</a> settings`,
      tab: 'ai',
    },
    {
      name: 'gemini',
      title: 'Gemini',
      description: `Custom <a href="https://aistudio.google.com/api-keys" class="text-primary" target="_blank">Gemini</a> settings`,
      tab: 'ai',
    },
    {
      name: 'kie',
      title: 'Kie',
      description: `Custom <a href="https://kie.ai" class="text-primary" target="_blank">Kie</a> settings`,
      tab: 'ai',
    },
    {
      name: 'adsense',
      title: t('groups.adsense'),
      description: 'custom your adsense settings',
      tab: 'ads',
    },
    {
      name: 'affonso',
      title: t('groups.affonso'),
      description:
        'custom your <a href="https://affonso.io?atp=elyralab" class="text-primary" target="_blank">Affonso</a> settings',
      tab: 'affiliate',
    },
    {
      name: 'promotekit',
      title: t('groups.promotekit'),
      description:
        'custom your <a href="https://www.promotekit.com?via=elyralab" class="text-primary" target="_blank">PromoteKit</a> settings',
      tab: 'affiliate',
    },
    {
      name: 'crisp',
      title: t('groups.crisp'),
      description:
        'custom your <a href="https://crisp.chat" class="text-primary" target="_blank">Crisp</a> settings',
      tab: 'customer_service',
    },
    {
      name: 'tawk',
      title: t('groups.tawk'),
      description:
        'custom your <a href="https://www.tawk.to" class="text-primary" target="_blank">Tawk</a> settings',
      tab: 'customer_service',
    },
  ];
  return settingGroups;
}

export async function getSettings() {
  const t = await getTranslations('admin.settings');
  const settings: Setting[] = [
    {
      name: 'app_name',
      title: 'App Name',
      placeholder: 'ElyraLab',
      type: 'text',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'app_description',
      title: 'App Description',
      placeholder:
        'ElyraLab is an AI image editing product built for fast creation workflows.',
      type: 'textarea',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'app_logo',
      title: 'App Logo',
      type: 'upload_image',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'app_preview_image',
      title: 'App Preview Image',
      type: 'upload_image',
      group: 'appinfo',
      tab: 'general',
    },
    {
      name: 'initial_role_enabled',
      title: 'Initial Role Enabled',
      type: 'switch',
      value: 'false',
      group: 'user_role',
      tab: 'general',
      tip: 'whether assign initial role for new user',
    },
    {
      name: 'initial_role_name',
      title: 'Initial Role',
      type: 'select',
      value: 'viewer',
      options: [
        { title: 'Viewer', value: 'viewer' },
        { title: 'Editor', value: 'editor' },
        { title: 'Admin', value: 'admin' },
        { title: 'Super Admin', value: 'super_admin' },
      ],
      group: 'user_role',
      tab: 'general',
      tip: 'the initial role for new user',
    },
    {
      name: 'initial_credits_enabled',
      title: 'Initial Credits Enabled',
      type: 'switch',
      value: 'false',
      group: 'credit',
      tab: 'general',
      tip: 'whether grant initial credits for new user',
    },
    {
      name: 'initial_credits_amount',
      title: 'Initial Credits Amount',
      type: 'number',
      placeholder: '0',
      group: 'credit',
      tab: 'general',
      tip: 'initial credits amount for new user',
    },
    {
      name: 'initial_credits_valid_days',
      title: 'Initial Credits Valid Days',
      type: 'number',
      placeholder: '30',
      group: 'credit',
      tab: 'general',
      tip: 'initial credits will expire after this days',
    },
    {
      name: 'initial_credits_description',
      title: 'Initial Credits Description',
      type: 'text',
      placeholder: 'initial credits for free trial',
      group: 'credit',
      tab: 'general',
      tip: 'description for initial credits',
    },
    {
      name: 'email_auth_enabled',
      title: 'Enabled',
      type: 'switch',
      value: 'true',
      group: 'email_auth',
      tab: 'auth',
    },
    {
      name: 'email_verification_enabled',
      title: 'Email Verification Required',
      type: 'switch',
      value: 'false',
      group: 'email_auth',
      tab: 'auth',
      tip: 'Require users to verify their email before they can sign in. Requires a configured email provider (e.g. Resend).',
    },
    {
      name: 'google_auth_enabled',
      title: 'Auth Enabled',
      type: 'switch',
      value: 'false',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'google_one_tap_enabled',
      title: 'OneTap Enabled',
      type: 'switch',
      value: 'false',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'google_client_id',
      title: 'Google Client ID',
      type: 'text',
      placeholder: '',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'google_client_secret',
      title: 'Google Client Secret',
      type: 'password',
      placeholder: '',
      group: 'google_auth',
      tab: 'auth',
    },
    {
      name: 'github_auth_enabled',
      title: 'Auth Enabled',
      type: 'switch',
      group: 'github_auth',
      tab: 'auth',
    },
    {
      name: 'github_client_id',
      title: 'Github Client ID',
      type: 'text',
      placeholder: '',
      group: 'github_auth',
      tab: 'auth',
    },
    {
      name: 'github_client_secret',
      title: 'Github Client Secret',
      type: 'password',
      placeholder: '',
      group: 'github_auth',
      tab: 'auth',
    },
    {
      name: 'select_payment_enabled',
      title: t('payment.fields.select_payment_enabled.title'),
      type: 'switch',
      value: 'false',
      tip: t('payment.fields.select_payment_enabled.tip'),
      placeholder: '',
      group: 'basic_payment',
      tab: 'payment',
    },
    {
      name: 'default_payment_provider',
      title: t('payment.fields.default_payment_provider.title'),
      type: 'select',
      value: 'stripe',
      options: [
        {
          title: 'Stripe',
          value: 'stripe',
        },
        {
          title: 'Creem',
          value: 'creem',
        },
        {
          title: 'Paypal',
          value: 'paypal',
        },
      ],
      tip: t('payment.fields.default_payment_provider.tip'),
      group: 'basic_payment',
      tab: 'payment',
    },
    {
      name: 'domestic_card_payment_enabled',
      title: t('payment.fields.domestic_card_payment_enabled.title'),
      type: 'switch',
      value: 'false',
      tip: t.raw('payment.fields.domestic_card_payment_enabled.tip'),
      group: 'domestic_card_payment',
      tab: 'payment',
    },
    {
      name: 'domestic_card_environment',
      title: t('payment.fields.domestic_card_environment.title'),
      type: 'select',
      value: 'sandbox',
      options: [
        { title: t('payment.options.sandbox'), value: 'sandbox' },
        { title: t('payment.options.production'), value: 'production' },
      ],
      group: 'domestic_card_payment',
      tab: 'payment',
    },
    {
      name: 'domestic_card_sandbox_credits_payment_url',
      title: t('payment.fields.domestic_card_credits_payment_url.title'),
      type: 'url',
      placeholder: 'https://example.com/pay/credits-package',
      group: 'domestic_card_payment',
      tab: 'payment',
      validation: {
        message: t('payment.messages.domestic_card_links_required'),
      },
      metadata: {
        visibleWhen: {
          field: 'domestic_card_environment',
          equals: 'sandbox',
        },
        requiredWhen: {
          field: 'domestic_card_payment_enabled',
          equals: true,
        },
        paymentKami: {
          productId: 'credits-package',
          mode: 'test',
        },
      },
    },
    {
      name: 'domestic_card_sandbox_monthly_payment_url',
      title: t('payment.fields.domestic_card_monthly_payment_url.title'),
      type: 'url',
      placeholder: 'https://example.com/pay/starter-monthly',
      group: 'domestic_card_payment',
      tab: 'payment',
      validation: {
        message: t('payment.messages.domestic_card_links_required'),
      },
      metadata: {
        visibleWhen: {
          field: 'domestic_card_environment',
          equals: 'sandbox',
        },
        requiredWhen: {
          field: 'domestic_card_payment_enabled',
          equals: true,
        },
        paymentKami: {
          productId: 'starter-monthly',
          mode: 'test',
        },
      },
    },
    {
      name: 'domestic_card_sandbox_yearly_payment_url',
      title: t('payment.fields.domestic_card_yearly_payment_url.title'),
      type: 'url',
      placeholder: 'https://example.com/pay/premium-yearly',
      group: 'domestic_card_payment',
      tab: 'payment',
      validation: {
        message: t('payment.messages.domestic_card_links_required'),
      },
      metadata: {
        visibleWhen: {
          field: 'domestic_card_environment',
          equals: 'sandbox',
        },
        requiredWhen: {
          field: 'domestic_card_payment_enabled',
          equals: true,
        },
        paymentKami: {
          productId: 'premium-yearly',
          mode: 'test',
        },
      },
    },
    {
      name: 'domestic_card_production_credits_payment_url',
      title: t('payment.fields.domestic_card_credits_payment_url.title'),
      type: 'url',
      placeholder: 'https://example.com/pay/credits-package',
      group: 'domestic_card_payment',
      tab: 'payment',
      validation: {
        message: t('payment.messages.domestic_card_links_required'),
      },
      metadata: {
        visibleWhen: {
          field: 'domestic_card_environment',
          equals: 'production',
        },
        requiredWhen: {
          field: 'domestic_card_payment_enabled',
          equals: true,
        },
        paymentKami: {
          productId: 'credits-package',
          mode: 'live',
        },
      },
    },
    {
      name: 'domestic_card_production_monthly_payment_url',
      title: t('payment.fields.domestic_card_monthly_payment_url.title'),
      type: 'url',
      placeholder: 'https://example.com/pay/starter-monthly',
      group: 'domestic_card_payment',
      tab: 'payment',
      validation: {
        message: t('payment.messages.domestic_card_links_required'),
      },
      metadata: {
        visibleWhen: {
          field: 'domestic_card_environment',
          equals: 'production',
        },
        requiredWhen: {
          field: 'domestic_card_payment_enabled',
          equals: true,
        },
        paymentKami: {
          productId: 'starter-monthly',
          mode: 'live',
        },
      },
    },
    {
      name: 'domestic_card_production_yearly_payment_url',
      title: t('payment.fields.domestic_card_yearly_payment_url.title'),
      type: 'url',
      placeholder: 'https://example.com/pay/premium-yearly',
      group: 'domestic_card_payment',
      tab: 'payment',
      validation: {
        message: t('payment.messages.domestic_card_links_required'),
      },
      metadata: {
        visibleWhen: {
          field: 'domestic_card_environment',
          equals: 'production',
        },
        requiredWhen: {
          field: 'domestic_card_payment_enabled',
          equals: true,
        },
        paymentKami: {
          productId: 'premium-yearly',
          mode: 'live',
        },
      },
    },
    {
      name: 'stripe_enabled',
      title: t('payment.fields.stripe_enabled.title'),
      type: 'switch',
      value: 'false',
      placeholder: '',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_publishable_key',
      title: t('payment.fields.stripe_publishable_key.title'),
      type: 'text',
      placeholder: 'pk_xxx',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_secret_key',
      title: t('payment.fields.stripe_secret_key.title'),
      type: 'password',
      placeholder: 'sk_xxx',
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_signing_secret',
      title: t('payment.fields.stripe_signing_secret.title'),
      type: 'password',
      placeholder: 'whsec_xxx',
      tip: t('payment.fields.stripe_signing_secret.tip'),
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_payment_methods',
      title: t('payment.fields.stripe_payment_methods.title'),
      type: 'checkbox',
      tip: t('payment.fields.stripe_payment_methods.tip'),
      options: [
        { title: t('payment.options.card'), value: 'card' },
        { title: t('payment.options.wechat_pay'), value: 'wechat_pay' },
        { title: t('payment.options.alipay'), value: 'alipay' },
      ],
      value: ['card'],
      group: 'stripe',
      tab: 'payment',
    },
    {
      name: 'stripe_promotion_codes',
      title: t('payment.fields.stripe_promotion_codes.title'),
      type: 'textarea',
      attributes: {
        rows: 6,
      },
      placeholder: `{
  "starter": "promo_xxx",
  "standard-monthly": "promo_xxx",
  "premium-yearly": "promo_xxx"
}`,
      group: 'stripe',
      tab: 'payment',
      tip: t.raw('payment.fields.stripe_promotion_codes.tip'),
    },
    {
      name: 'stripe_allow_promotion_codes',
      title: t('payment.fields.stripe_allow_promotion_codes.title'),
      type: 'switch',
      value: 'false',
      group: 'stripe',
      tab: 'payment',
      tip: t('payment.fields.stripe_allow_promotion_codes.tip'),
    },
    {
      name: 'creem_enabled',
      title: t('payment.fields.creem_enabled.title'),
      type: 'switch',
      value: 'false',
      group: 'creem',
      tab: 'payment',
    },
    {
      name: 'creem_environment',
      title: t('payment.fields.creem_environment.title'),
      type: 'select',
      value: 'sandbox',
      options: [
        { title: t('payment.options.sandbox'), value: 'sandbox' },
        { title: t('payment.options.production'), value: 'production' },
      ],
      group: 'creem',
      tab: 'payment',
    },
    {
      name: 'creem_api_key',
      title: t('payment.fields.creem_api_key.title'),
      type: 'password',
      placeholder: 'creem_xxx',
      group: 'creem',
      tab: 'payment',
    },
    {
      name: 'creem_signing_secret',
      title: t('payment.fields.creem_signing_secret.title'),
      type: 'password',
      placeholder: 'whsec_xxx',
      group: 'creem',
      tab: 'payment',
      tip: t('payment.fields.creem_signing_secret.tip'),
    },
    {
      name: 'creem_product_ids',
      title: t('payment.fields.creem_product_ids.title'),
      type: 'textarea',
      attributes: {
        rows: 6,
      },
      placeholder: `{
  "starter": "prod_xxx",
  "standard-monthly": "prod_xxx",
  "premium-yearly": "prod_xxx"
}`,
      group: 'creem',
      tab: 'payment',
      tip: t.raw('payment.fields.creem_product_ids.tip'),
    },
    {
      name: 'paypal_enabled',
      title: t('payment.fields.paypal_enabled.title'),
      type: 'switch',
      value: 'false',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_environment',
      title: t('payment.fields.paypal_environment.title'),
      type: 'select',
      value: 'sandbox',
      options: [
        { title: t('payment.options.sandbox'), value: 'sandbox' },
        { title: t('payment.options.production'), value: 'production' },
      ],
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_client_id',
      title: t('payment.fields.paypal_client_id.title'),
      type: 'text',
      placeholder: 'paypal_xxx',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_client_secret',
      title: t('payment.fields.paypal_client_secret.title'),
      type: 'password',
      placeholder: 'paypal_xxx',
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'paypal_webhook_id',
      title: t('payment.fields.paypal_webhook_id.title'),
      type: 'text',
      placeholder: 'xxx',
      tip: t('payment.fields.paypal_webhook_id.tip'),
      group: 'paypal',
      tab: 'payment',
    },
    {
      name: 'google_analytics_id',
      title: 'Google Analytics ID',
      type: 'text',
      placeholder: '',
      group: 'google_analytics',
      tab: 'analytics',
    },
    {
      name: 'clarity_id',
      title: 'Clarity ID',
      type: 'text',
      placeholder: '',
      group: 'clarity',
      tab: 'analytics',
    },
    {
      name: 'plausible_domain',
      title: 'Plausible Domain',
      type: 'text',
      placeholder: 'elyralab.site',
      group: 'plausible',
      tab: 'analytics',
    },
    {
      name: 'plausible_src',
      title: 'Plausible Script Src',
      type: 'url',
      placeholder: 'https://plausible.io/js/script.js',
      group: 'plausible',
      tab: 'analytics',
    },
    {
      name: 'openpanel_client_id',
      title: 'OpenPanel Client ID',
      type: 'text',
      placeholder: '',
      group: 'openpanel',
      tab: 'analytics',
    },
    {
      name: 'vercel_analytics_enabled',
      title: 'Enabled',
      type: 'switch',
      value: 'false',
      group: 'vercel_analytics',
      tab: 'analytics',
    },
    {
      name: 'resend_api_key',
      title: 'Resend API Key',
      type: 'password',
      placeholder: '',
      group: 'resend',
      tab: 'email',
    },
    {
      name: 'resend_sender_email',
      title: 'Resend Sender Email',
      type: 'text',
      placeholder: 'ElyraLab <no-reply@mail.elyralab.site>',
      group: 'resend',
      tab: 'email',
    },
    {
      name: 'r2_access_key',
      title: 'Cloudflare Access Key',
      type: 'text',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_secret_key',
      title: 'Cloudflare Secret Key',
      type: 'password',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_bucket_name',
      title: 'Bucket Name',
      type: 'text',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_upload_path',
      title: 'Upload Path',
      type: 'text',
      placeholder: 'uploads',
      tip: 'The path to upload files to, leave empty to use the default upload path. Example: uploads/foo/bar',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_endpoint',
      title: 'Endpoint',
      type: 'url',
      placeholder: 'https://<account-id>.r2.cloudflarestorage.com',
      tip: 'Leave empty to use the default R2 endpoint',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'r2_domain',
      title: 'Domain',
      type: 'url',
      placeholder: '',
      group: 'r2',
      tab: 'storage',
    },
    {
      name: 'openrouter_api_key',
      title: 'OpenRouter API Key',
      type: 'password',
      placeholder: 'sk-or-xxx',
      group: 'openrouter',
      tab: 'ai',
    },
    {
      name: 'openrouter_base_url',
      title: 'OpenRouter Base URL',
      type: 'url',
      placeholder: 'https://openrouter.ai/api/v1',
      tip: 'Set any OpenAI compatible API URL, leave empty to use the default OpenRouter API URL',
      group: 'openrouter',
      tab: 'ai',
    },
    {
      name: 'custom_ai_provider',
      title: 'Custom Provider',
      type: 'text',
      placeholder: 'OpenAI Compatible Provider',
      group: 'custom_ai',
      tab: 'ai',
    },
    {
      name: 'custom_ai_api_key',
      title: 'Custom API Key',
      type: 'password',
      placeholder: 'sk-xxx',
      group: 'custom_ai',
      tab: 'ai',
    },
    {
      name: 'custom_ai_base_url',
      title: 'Custom Base URL',
      type: 'url',
      placeholder: 'https://api.example.com/v1',
      tip: 'Set your custom provider base URL',
      group: 'custom_ai',
      tab: 'ai',
    },
    {
      name: 'ai_provider_rows',
      title: 'AI Provider Rows',
      type: 'textarea',
      placeholder: '',
      group: 'custom_ai',
      tab: 'ai',
    },
    {
      name: 'custom_ai_model',
      title: 'Custom Model',
      type: 'text',
      placeholder: 'nano-banana-pro',
      group: 'custom_ai',
      tab: 'ai',
    },
    {
      name: 'replicate_api_token',
      title: 'Replicate API Token',
      type: 'password',
      placeholder: 'r8_xxx',
      group: 'replicate',
      tab: 'ai',
    },
    {
      name: 'replicate_custom_storage',
      title: 'Replicate Custom Storage',
      type: 'switch',
      value: 'false',
      group: 'replicate',
      tab: 'ai',
      tip: 'Use custom storage to save files generated by Replicate',
    },
    {
      name: 'replicate_base_url',
      title: 'Replicate Base URL',
      type: 'url',
      placeholder: 'https://api.replicate.com/v1',
      group: 'replicate',
      tab: 'ai',
    },
    {
      name: 'replicate_model',
      title: 'Replicate Model',
      type: 'text',
      placeholder: 'google/nano-banana-pro',
      group: 'replicate',
      tab: 'ai',
    },
    {
      name: 'fal_api_key',
      title: 'Fal API Key',
      type: 'password',
      placeholder: 'fal_xxx',
      group: 'fal',
      tip: 'Fal API Key is used to access the Fal API',
      tab: 'ai',
    },
    {
      name: 'fal_custom_storage',
      title: 'Fal Custom Storage',
      type: 'switch',
      value: 'false',
      group: 'fal',
      tab: 'ai',
      tip: 'Use custom storage to save files generated by Fal',
    },
    {
      name: 'fal_base_url',
      title: 'Fal Base URL',
      type: 'url',
      placeholder: 'https://queue.fal.run',
      group: 'fal',
      tab: 'ai',
    },
    {
      name: 'fal_model',
      title: 'Fal Model',
      type: 'text',
      placeholder: 'fal-ai/nano-banana-pro',
      group: 'fal',
      tab: 'ai',
    },
    {
      name: 'gemini_api_key',
      title: 'Gemini API Key',
      type: 'password',
      placeholder: 'AIza...',
      group: 'gemini',
      tip: 'Google Gemini API Key',
      tab: 'ai',
    },
    {
      name: 'gemini_base_url',
      title: 'Gemini Base URL',
      type: 'url',
      placeholder: '',
      group: 'gemini',
      tab: 'ai',
    },
    {
      name: 'gemini_model',
      title: 'Gemini Model',
      type: 'text',
      placeholder: 'gemini-3-pro-image-preview',
      group: 'gemini',
      tab: 'ai',
    },
    {
      name: 'kie_api_key',
      title: 'Kie API Key',
      type: 'password',
      placeholder: 'xxx',
      group: 'kie',
      tip: 'Kie API Key is used to access the Kie API',
      tab: 'ai',
    },
    {
      name: 'kie_custom_storage',
      title: 'Kie Custom Storage',
      type: 'switch',
      value: 'false',
      group: 'kie',
      tab: 'ai',
      tip: 'Use custom storage to save files generated by Kie',
    },
    {
      name: 'kie_base_url',
      title: 'Kie Base URL',
      type: 'url',
      placeholder: 'https://api.kie.ai/api/v1',
      group: 'kie',
      tab: 'ai',
    },
    {
      name: 'kie_model',
      title: 'Kie Model',
      type: 'text',
      placeholder: 'nano-banana-pro',
      group: 'kie',
      tab: 'ai',
    },
    {
      name: 'adsense_code',
      title: 'Adsense Code',
      type: 'text',
      placeholder: 'ca-pub-xxx',
      group: 'adsense',
      tab: 'ads',
    },
    {
      name: 'affonso_enabled',
      title: 'Affonso Enabled',
      type: 'switch',
      value: 'false',
      group: 'affonso',
      tab: 'affiliate',
    },
    {
      name: 'affonso_id',
      title: 'Affonso ID',
      type: 'text',
      placeholder: 'xxx',
      tip: 'Affonso Program ID',
      group: 'affonso',
      tab: 'affiliate',
    },
    {
      name: 'affonso_cookie_duration',
      title: 'Affonso Cookie Duration',
      type: 'number',
      placeholder: '30',
      tip: 'Affonso Cookie Duration in days, default is 30 days',
      value: '30',
      group: 'affonso',
      tab: 'affiliate',
    },
    {
      name: 'promotekit_enabled',
      title: 'PromoteKit Enabled',
      type: 'switch',
      value: 'false',
      group: 'promotekit',
      tab: 'affiliate',
    },
    {
      name: 'promotekit_id',
      title: 'PromoteKit ID',
      type: 'text',
      placeholder: 'xxx',
      tip: 'PromoteKit Program ID',
      group: 'promotekit',
      tab: 'affiliate',
    },
    {
      name: 'crisp_enabled',
      title: 'Crisp Enabled',
      type: 'switch',
      value: 'false',
      group: 'crisp',
      tab: 'customer_service',
    },
    {
      name: 'crisp_website_id',
      title: 'Crisp Website ID',
      type: 'text',
      placeholder: 'xxx',
      group: 'crisp',
      tab: 'customer_service',
    },
    {
      name: 'tawk_enabled',
      title: 'Tawk Enabled',
      type: 'switch',
      value: 'false',
      group: 'tawk',
      tab: 'customer_service',
    },
    {
      name: 'tawk_property_id',
      title: 'Tawk Property ID',
      tip: 'Tawk Property ID is associated with your Tawk account',
      type: 'text',
      placeholder: 'xxx',
      group: 'tawk',
      tab: 'customer_service',
    },
    {
      name: 'tawk_widget_id',
      title: 'Tawk Widget ID',
      type: 'text',
      placeholder: 'xxx',
      group: 'tawk',
      tab: 'customer_service',
    },
  ];

  return settings;
}

// SECURITY: this whitelist gates which DB-stored config keys are allowed to
// reach the browser via `getPublicConfigs()`. Only add keys that are safe to
// expose publicly (feature flags, public client IDs). NEVER add API keys,
// client secrets, signing secrets, or any credential here.
export const publicSettingNames = [
  'email_auth_enabled',
  'email_verification_enabled',
  'google_auth_enabled',
  'google_one_tap_enabled',
  'google_client_id',
  'github_auth_enabled',
  'select_payment_enabled',
  'default_payment_provider',
  'domestic_card_payment_enabled',
  'domestic_card_environment',
  'domestic_card_sandbox_credits_payment_url',
  'domestic_card_sandbox_monthly_payment_url',
  'domestic_card_sandbox_yearly_payment_url',
  'domestic_card_production_credits_payment_url',
  'domestic_card_production_monthly_payment_url',
  'domestic_card_production_yearly_payment_url',
  'stripe_enabled',
  'creem_enabled',
  'paypal_enabled',
  'affonso_enabled',
  'promotekit_enabled',
  'crisp_enabled',
  'tawk_enabled',
];

export async function getAllSettingNames() {
  const settings = await getSettings();
  const settingNames: string[] = [];

  settings.forEach((setting: Setting) => {
    settingNames.push(setting.name);
  });

  return settingNames;
}
