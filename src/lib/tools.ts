export type ToolStatus = 'available' | 'planned';
export type ToolAccess = 'free' | 'freemium' | 'paid';

export type ToolCategory =
  | 'Lightweight Planning'
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
  access: ToolAccess;
  href: string;
  icon: string;
  keywords: string[];
  useCase?: string;
  faq?: ToolFAQItem[];
}

export const toolCategories: ToolCategory[] = [
  'Lightweight Planning',
  'Email & Communication',
  'Finance & Payments',
  'Travel & Consumer Rights',
  'Reputation & Marketing',
  'AI & SEO',
];

export const tools: ToolDefinition[] = [
  {
    slug: 'dog-fireworks-anxiety-checklist',
    name: 'Free Dog Fireworks Anxiety Plan Generator',
    shortName: 'Dog Fireworks Anxiety Plan',
    description:
      'Create a printable safety checklist for fireworks, thunderstorms, and other loud-noise events.',
    category: 'Lightweight Planning',
    status: 'available',
    access: 'free',
    href: '/tools/dog-fireworks-anxiety-checklist',
    icon: 'PawPrint',
    useCase: 'Pet safety',
    keywords: [
      'dog fireworks anxiety checklist',
      'July 4 dog anxiety plan',
      'pet noise anxiety',
      'cat fireworks anxiety',
      'thunderstorm pet safety',
    ],
    faq: [
      {
        question: 'How early should I prepare my dog for fireworks?',
        answer:
          'For mild reactions, prepare the safe room before the event day and close escape routes before noise starts. If your dog has a history of escape, self-injury, extreme panic, seizures, heart disease, or breathing problems, contact a veterinarian as early as possible before the event.',
      },
      {
        question: 'What should I do if my dog hides during fireworks?',
        answer:
          'Let your dog hide if the spot is physically safe. Do not pull them out, punish fear behavior, or force interaction. Keep the room secure, quiet, and stocked with water and familiar bedding.',
      },
      {
        question: 'Should I leave my dog alone during fireworks?',
        answer:
          'Avoid leaving a dog alone if they shake, pant, refuse food, try to escape, damage doors or crates, or injure themselves during loud noise. If being alone cannot be avoided, use the most secure interior area and remove hazards.',
      },
      {
        question: 'Can cats be scared of fireworks too?',
        answer:
          'Yes. Cats can hide, refuse food, tremble, vocalize, or try to escape during fireworks, thunderstorms, and construction noise. The checklist supports cats as well as dogs.',
      },
      {
        question: 'When should I call a vet about fireworks anxiety?',
        answer:
          'Call a veterinarian before the event if your pet has a history of escaping, self-injury, seizures, heart disease, breathing problems, destructive panic, or extreme fear. Do not give medication or supplements without asking a vet.',
      },
      {
        question: 'Does this checklist work for thunderstorms?',
        answer:
          'Yes. The same safety steps apply to thunderstorms, local fireworks, New Year fireworks, construction noise, and other loud events. Adjust timing based on the forecast or event schedule.',
      },
    ],
  },
  {
    slug: 'no-cook-heatwave-meal-planner',
    name: 'No-Cook Heatwave Meal Planner',
    shortName: 'Heatwave Meal Planner',
    description:
      'Build a simple no-cook meal plan and grocery list for hot days and small kitchens.',
    category: 'Lightweight Planning',
    status: 'available',
    access: 'free',
    href: '/tools/no-cook-heatwave-meal-planner',
    icon: 'Salad',
    useCase: 'Heatwave meals',
    keywords: [
      'no-cook heatwave meal planner',
      'no cook meals',
      'heatwave meals',
      'dorm meal plan',
      'small kitchen meal prep',
    ],
    faq: [
      {
        question: 'What can I eat during a heatwave without cooking?',
        answer:
          'Simple options include yogurt bowls, overnight oats, hummus wraps, bean salads, tuna or salmon packets, fruit, snack plates, peanut butter sandwiches, and shelf-stable backup meals when cold storage is limited.',
      },
      {
        question: 'What are cheap no-cook meals?',
        answer:
          'Low-cost anchors include peanut butter, beans, oats, bread, rice cakes, canned fish, bananas, yogurt when cold storage is available, and bagged salad when it will be eaten quickly.',
      },
      {
        question: 'What no-cook meals work in a dorm?',
        answer:
          'Dorm-friendly meals include wraps, yogurt and granola, hummus plates, tuna packets with crackers, fruit cups, overnight oats, and microwave rice bowls if a microwave is available.',
      },
      {
        question: 'How do I meal prep without a stove?',
        answer:
          'Pick a few repeatable bases such as wraps, salads, snack plates, oats, and bean bowls. Keep ingredients cold when needed, buy smaller amounts if storage is limited, and assemble meals right before eating.',
      },
      {
        question: 'What should seniors eat during hot weather?',
        answer:
          'This tool can suggest soft, hydrating, simple-prep foods, but it is not medical or nutrition advice. For chronic illness, swallowing problems, diabetes, kidney disease, or restricted diets, consult a qualified professional.',
      },
      {
        question: 'Can I make high-protein meals without cooking?',
        answer:
          'Yes. Depending on storage and preferences, options can include Greek yogurt, canned tuna or salmon, rotisserie chicken, beans, hummus, tofu, and pre-cooked eggs. Keep perishable foods cold.',
      },
    ],
  },
  {
    slug: 'gmail-search-query-generator',
    name: 'Gmail Search Query Generator',
    shortName: 'Gmail Query Generator',
    description:
      'Build precise Gmail search operators from simple filters, then copy or download the query.',
    category: 'Email & Communication',
    status: 'available',
    access: 'free',
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
    access: 'free',
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
    access: 'free',
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
    access: 'free',
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
    access: 'free',
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
    status: 'available',
    access: 'free',
    href: '/tools/ai-search-readiness-checker',
    icon: 'SearchCheck',
    keywords: [
      'AI search readiness checker',
      'AI SEO checklist',
      'answer engine optimization',
      'llms.txt',
      'structured data checker',
    ],
    faq: [
      {
        question: 'Does this checker crawl my website?',
        answer:
          'No. Version 1 is a self-assessment. It scores only the answers you provide and does not crawl, fetch, or inspect the website URL.',
      },
      {
        question: 'What does the score measure?',
        answer:
          'The score estimates whether your site has the foundations AI search systems often need: clear entity information, product pages, FAQ content, schema, llms.txt, comparison pages, and unique data.',
      },
      {
        question: 'Should every site have llms.txt?',
        answer:
          'Not necessarily. It is an emerging convention, but it can be useful for pointing AI systems toward your most important docs, policies, and canonical content.',
      },
      {
        question: 'Is this a full SEO audit?',
        answer:
          'No. It is a lightweight readiness checklist for AI search visibility. A full audit should also review technical crawlability, content quality, backlinks, analytics, and actual search performance.',
      },
    ],
  },
];

export function getAllTools() {
  return tools;
}

export function getPublishedTools() {
  return tools.filter((tool) => tool.status === 'available');
}

export function getToolHref(slug: string) {
  return `/tools/${slug}`;
}

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(
  category: ToolCategory,
  options: { publishedOnly?: boolean } = {}
) {
  const source = options.publishedOnly ? getPublishedTools() : tools;
  return source.filter((tool) => tool.category === category);
}

export function getToolAccessLabel(access: ToolAccess) {
  const labels: Record<ToolAccess, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
  };

  return labels[access];
}

export function getRelatedTools(slug: string, limit = 5) {
  const current = getToolBySlug(slug);
  const publishedTools = getPublishedTools();

  if (!current) {
    return publishedTools.slice(0, limit);
  }

  const sameCategory = publishedTools.filter(
    (tool) => tool.slug !== slug && tool.category === current.category
  );
  const otherTools = publishedTools.filter(
    (tool) => tool.slug !== slug && tool.category !== current.category
  );

  return [...sameCategory, ...otherTools].slice(0, limit);
}
