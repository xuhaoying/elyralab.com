export type ToolStatus = 'available' | 'planned';

export type ToolCategory =
  | 'Email & Communication'
  | 'Finance & Payments'
  | 'Travel & Consumer Rights'
  | 'Reputation & Marketing'
  | 'AI & SEO';

export interface ToolFAQItem {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  href: string;
  icon: string;
  keywords: string[];
  faq?: ToolFAQItem[];
}

export const toolCategories: ToolCategory[] = [
  'Email & Communication',
  'Finance & Payments',
  'Travel & Consumer Rights',
  'Reputation & Marketing',
  'AI & SEO',
];

export const tools: ToolDefinition[] = [
  {
    slug: 'gmail-search-query-generator',
    name: 'Gmail Search Query Generator',
    shortName: 'Gmail Query Generator',
    description:
      'Build precise Gmail search operators from simple filters, then copy or download the query.',
    category: 'Email & Communication',
    status: 'available',
    href: '/tools/gmail-search-query-generator',
    icon: 'MailSearch',
    keywords: [
      'gmail search query',
      'gmail operators',
      'email search',
      'gmail filters',
    ],
    faq: [
      {
        question: 'Does this tool connect to my Gmail account?',
        answer:
          'No. It only builds a search query in your browser. It does not ask for login access, read email, or send data to Gmail.',
      },
      {
        question: 'Can I paste the query directly into Gmail?',
        answer:
          'Yes. Copy the generated query and paste it into the Gmail search bar. Gmail will apply the supported operators such as from:, to:, subject:, has:attachment, after:, before:, and is:unread.',
      },
      {
        question: 'Why are some words wrapped in quotes?',
        answer:
          'Quotes keep multi-word phrases together. For example, subject:"invoice due" searches for that phrase in the subject instead of treating the words separately.',
      },
      {
        question: 'What date format does the generator use?',
        answer:
          'The form accepts browser date inputs and converts them to Gmail-friendly YYYY/MM/DD dates for after: and before: searches.',
      },
    ],
  },
  {
    slug: 'true-rent-calculator',
    name: 'True Rent Calculator',
    shortName: 'True Rent Calculator',
    description:
      'Estimate the real monthly cost of rent after fees, utilities, deposits, commute, and incentives.',
    category: 'Finance & Payments',
    status: 'planned',
    href: '/tools/true-rent-calculator',
    icon: 'Calculator',
    keywords: ['rent calculator', 'apartment costs', 'housing budget'],
  },
  {
    slug: 'airline-refund-claim-letter-generator',
    name: 'Airline Refund Claim Letter Generator',
    shortName: 'Refund Letter Generator',
    description:
      'Draft a clear airline refund or compensation claim letter from flight and disruption details.',
    category: 'Travel & Consumer Rights',
    status: 'planned',
    href: '/tools/airline-refund-claim-letter-generator',
    icon: 'Plane',
    keywords: ['airline refund', 'flight compensation', 'claim letter'],
  },
  {
    slug: 'bnpl-payment-calendar',
    name: 'BNPL Payment Calendar',
    shortName: 'BNPL Calendar',
    description:
      'Turn buy-now-pay-later plans into a readable payment schedule and reminder checklist.',
    category: 'Finance & Payments',
    status: 'planned',
    href: '/tools/bnpl-payment-calendar',
    icon: 'CalendarDays',
    keywords: ['bnpl', 'payment calendar', 'installment schedule'],
  },
  {
    slug: 'google-review-reply-generator',
    name: 'Google Review Reply Generator',
    shortName: 'Review Reply Generator',
    description:
      'Create thoughtful, on-brand replies for positive, neutral, and negative Google reviews.',
    category: 'Reputation & Marketing',
    status: 'planned',
    href: '/tools/google-review-reply-generator',
    icon: 'MessageSquareReply',
    keywords: ['google reviews', 'review replies', 'local business'],
  },
  {
    slug: 'ai-search-readiness-checker',
    name: 'AI Search Readiness Checker',
    shortName: 'AI Search Checker',
    description:
      'Check whether a page is structured for AI search answers, citations, and entity clarity.',
    category: 'AI & SEO',
    status: 'planned',
    href: '/tools/ai-search-readiness-checker',
    icon: 'SearchCheck',
    keywords: ['ai search', 'seo checker', 'answer engine optimization'],
  },
];

export function getAllTools() {
  return tools;
}

export function getPublishedTools() {
  return tools.filter((tool) => tool.status === 'available');
}

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((tool) => tool.category === category);
}

export function getRelatedTools(slug: string, limit = 3) {
  const current = getToolBySlug(slug);

  if (!current) {
    return tools.slice(0, limit);
  }

  const sameCategory = tools.filter(
    (tool) => tool.slug !== slug && tool.category === current.category
  );
  const otherTools = tools.filter(
    (tool) => tool.slug !== slug && tool.category !== current.category
  );

  return [...sameCategory, ...otherTools].slice(0, limit);
}
