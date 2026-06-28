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
      'Estimate the real monthly cost of rent after utilities, recurring fees, deposits, and move-in costs.',
    category: 'Finance & Payments',
    status: 'available',
    href: '/tools/true-rent-calculator',
    icon: 'Calculator',
    keywords: [
      'true rent calculator',
      'rent calculator',
      'apartment fees',
      'move in cost calculator',
      'housing budget',
    ],
    faq: [
      {
        question: 'What does true monthly rent include?',
        answer:
          'It includes base rent, recurring monthly fees, and one-time upfront charges spread across the lease length. This gives a better monthly comparison than rent alone.',
      },
      {
        question: 'How is the security deposit treated?',
        answer:
          'The calculator includes the security deposit as cash required during the lease. If it is fully refunded, subtract it from the total lease cost and divide it by the lease length to adjust the true monthly amount.',
      },
      {
        question: 'Is this a financial or legal recommendation?',
        answer:
          'No. It is a budgeting worksheet that helps you compare rental listings. Always check your lease and local rules for exact fees and refundable deposits.',
      },
      {
        question: 'Does this tool save my rent numbers?',
        answer:
          'No. The calculation runs in your browser. It does not require login, store data, or call a paid API.',
      },
    ],
  },
  {
    slug: 'airline-refund-claim-letter-generator',
    name: 'Airline Refund Claim Letter Generator',
    shortName: 'Refund Letter Generator',
    description:
      'Draft a clear airline refund or compensation claim letter from flight and disruption details.',
    category: 'Travel & Consumer Rights',
    status: 'available',
    href: '/tools/airline-refund-claim-letter-generator',
    icon: 'Plane',
    keywords: [
      'airline refund',
      'flight compensation',
      'claim letter',
      'cancelled flight refund',
      'denied boarding claim',
    ],
    faq: [
      {
        question: 'Does this generator use AI?',
        answer:
          'No. The first version uses deterministic templates based on the details you enter. It does not call an AI API.',
      },
      {
        question: 'Is this legal advice?',
        answer:
          'No. It is a drafting aid for a customer service claim. Airline policies and passenger rights rules vary by country, route, and ticket type, so check the rules that apply to your trip.',
      },
      {
        question: 'What should I attach to the claim?',
        answer:
          'Attach booking confirmation, boarding pass or check-in proof, airline disruption notices, refund denial messages, expense receipts, and any timeline evidence that supports your request.',
      },
      {
        question: 'Does this tool save my flight details?',
        answer:
          'No. The letter is generated in your browser. The tool requires no login, database, or paid API.',
      },
    ],
  },
  {
    slug: 'bnpl-payment-calendar',
    name: 'BNPL Payment Calendar',
    shortName: 'BNPL Calendar',
    description:
      'Turn buy-now-pay-later plans into a readable payment schedule and reminder checklist.',
    category: 'Finance & Payments',
    status: 'available',
    href: '/tools/bnpl-payment-calendar',
    icon: 'CalendarDays',
    keywords: [
      'BNPL payment calendar',
      'buy now pay later schedule',
      'installment payment calendar',
      'payment checklist',
    ],
    faq: [
      {
        question: 'Does this tool connect to my BNPL account?',
        answer:
          'No. It only creates a schedule from the amount, first payment date, number of payments, and frequency you enter.',
      },
      {
        question: 'How does the calculator handle cents?',
        answer:
          'It splits the purchase into cents so the payment amounts add back to the exact purchase amount. If the amount does not divide evenly, the earliest payments receive the extra cents.',
      },
      {
        question: 'Can I import this into a calendar app?',
        answer:
          'Version 1 provides CSV download. You can open the CSV in a spreadsheet or use it as a reference for calendar reminders.',
      },
      {
        question: 'Is this financial advice?',
        answer:
          'No. It is a planning checklist for installment payments. Confirm due dates, fees, and payment rules with your BNPL provider or merchant.',
      },
    ],
  },
  {
    slug: 'google-review-reply-generator',
    name: 'Google Review Reply Generator',
    shortName: 'Review Reply Generator',
    description:
      'Create thoughtful, on-brand replies for positive, neutral, and negative Google reviews.',
    category: 'Reputation & Marketing',
    status: 'available',
    href: '/tools/google-review-reply-generator',
    icon: 'MessageSquareReply',
    keywords: [
      'Google review reply generator',
      'review response templates',
      'local business reviews',
      'reputation management',
      'customer review replies',
    ],
    faq: [
      {
        question: 'Does this tool use AI?',
        answer:
          'No. Version 1 uses deterministic templates based on the star rating, tone, business type, and optional names you enter.',
      },
      {
        question: 'How does it handle negative reviews?',
        answer:
          'Ratings of 1 or 2 stars generate apology-forward replies that acknowledge the issue, avoid arguing publicly, and invite the customer to continue the conversation directly.',
      },
      {
        question: 'Can I use the replies directly on Google?',
        answer:
          'Yes, but review each reply before posting. Add any specific facts, policies, or contact details your business wants to include.',
      },
      {
        question: 'Does it store review text?',
        answer:
          'No. The replies are generated in your browser with no login, database, or paid API.',
      },
    ],
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
