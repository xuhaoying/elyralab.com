export type PeopleCount = '1' | '2' | '3-4' | '5-plus';
export type DaysToPlan = '1' | '3' | '5' | '7';
export type BudgetLevel = 'low' | 'medium' | 'flexible';
export type StorageOption =
  | 'fridge'
  | 'freezer'
  | 'pantry-only'
  | 'limited-storage';
export type DietaryPreference =
  | 'none'
  | 'vegetarian'
  | 'high-protein'
  | 'kid-friendly'
  | 'elderly-friendly'
  | 'low-prep';
export type KitchenTool =
  | 'none'
  | 'microwave'
  | 'kettle'
  | 'blender'
  | 'toaster';
export type MainGoal =
  | 'stay-cool'
  | 'save-money'
  | 'avoid-cooking'
  | 'family-meals'
  | 'emergency-prep';

export interface FormState {
  people: PeopleCount;
  days: DaysToPlan;
  budget: BudgetLevel;
  storage: StorageOption;
  diet: DietaryPreference;
  tools: KitchenTool[];
  goal: MainGoal;
}

export interface PlanSection {
  title: string;
  description?: string;
  items: string[];
}

export interface DailyMealPlan {
  day: number;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string[];
}

export interface HeatwaveMealPlan {
  planType: string;
  summary: string;
  recommendedNextSteps: string[];
  days: DailyMealPlan[];
  ideaSections: PlanSection[];
  grocerySections: PlanSection[];
  storageReminders: string[];
  budgetTips: string[];
  safetyNotes: string[];
  labels: {
    people: string;
    days: string;
    budget: string;
    storage: string;
    diet: string;
    tools: string;
    goal: string;
  };
}

export const emptyForm: FormState = {
  people: '2',
  days: '3',
  budget: 'medium',
  storage: 'fridge',
  diet: 'none',
  tools: ['none'],
  goal: 'stay-cool',
};

export const peopleLabels: Record<PeopleCount, string> = {
  '1': '1 person',
  '2': '2 people',
  '3-4': '3-4 people',
  '5-plus': '5+ people',
};

export const dayLabels: Record<DaysToPlan, string> = {
  '1': '1 day',
  '3': '3 days',
  '5': '5 days',
  '7': '7 days',
};

export const budgetLabels: Record<BudgetLevel, string> = {
  low: 'low',
  medium: 'medium',
  flexible: 'flexible',
};

export const storageLabels: Record<StorageOption, string> = {
  fridge: 'fridge',
  freezer: 'freezer',
  'pantry-only': 'pantry only',
  'limited-storage': 'limited storage',
};

export const dietLabels: Record<DietaryPreference, string> = {
  none: 'no restriction',
  vegetarian: 'vegetarian',
  'high-protein': 'high protein',
  'kid-friendly': 'kid-friendly',
  'elderly-friendly': 'elderly-friendly',
  'low-prep': 'low prep',
};

export const toolLabels: Record<KitchenTool, string> = {
  none: 'none',
  microwave: 'microwave',
  kettle: 'kettle',
  blender: 'blender',
  toaster: 'toaster',
};

export const goalLabels: Record<MainGoal, string> = {
  'stay-cool': 'stay cool',
  'save-money': 'save money',
  'avoid-cooking': 'avoid cooking',
  'family-meals': 'simple family meals',
  'emergency-prep': 'emergency heatwave prep',
};

const daysCount: Record<DaysToPlan, number> = {
  '1': 1,
  '3': 3,
  '5': 5,
  '7': 7,
};

function pick(items: string[], index: number) {
  return items[index % items.length];
}

function unique(items: string[]) {
  return [...new Set(items)];
}

function isPantryFocused(form: FormState) {
  return form.storage === 'pantry-only' || form.storage === 'limited-storage';
}

function prefersShelfStablePlan(form: FormState) {
  return isPantryFocused(form) || form.goal === 'emergency-prep';
}

function hasTool(form: FormState, tool: KitchenTool) {
  return form.tools.includes(tool);
}

function getPlanType(form: FormState) {
  if (prefersShelfStablePlan(form) && form.diet === 'kid-friendly') {
    return 'Shelf-stable kid-friendly heatwave plan';
  }

  if (prefersShelfStablePlan(form) && form.diet === 'elderly-friendly') {
    return 'Shelf-stable easy-to-chew heatwave plan';
  }

  if (prefersShelfStablePlan(form)) {
    return 'Shelf-stable heatwave backup plan';
  }

  if (form.diet === 'elderly-friendly') {
    return 'Hydrating easy-to-chew no-cook plan';
  }

  if (form.diet === 'kid-friendly' || form.goal === 'family-meals') {
    return 'Kid-friendly no-cook family plan';
  }

  if (form.diet === 'high-protein') {
    return 'High-protein no-cook heatwave plan';
  }

  if (form.budget === 'low' || form.goal === 'save-money') {
    return 'Low-cost no-cook meal plan';
  }

  return 'Simple no-cook heatwave meal plan';
}

function getSummary(form: FormState, planType: string) {
  const storagePhrase = storageLabels[form.storage];
  const toolsPhrase = formatTools(form.tools);

  return `${planType} for ${peopleLabels[form.people].toLowerCase()} across ${
    dayLabels[form.days]
  }. It emphasizes cool, simple meals that fit ${storagePhrase} storage and ${toolsPhrase} kitchen tools.`;
}

function getBreakfastIdeas(form: FormState) {
  const pantry = prefersShelfStablePlan(form);
  const ideas = pantry
    ? [
        'Peanut butter banana toast or crackers',
        'Shelf-stable milk with oats, raisins, and cinnamon',
        'Applesauce cup with nut butter and granola',
        'Rice cakes with peanut butter and sliced fruit',
      ]
    : [
        'Greek yogurt with fruit and granola',
        'Overnight oats with milk, banana, and nut butter',
        'Cottage cheese with fruit and crackers',
        'Smoothie with yogurt, frozen fruit, and oats',
      ];

  if (form.diet === 'kid-friendly') {
    ideas.unshift(
      pantry
        ? 'Shelf-stable cereal with banana and shelf-stable milk'
        : 'Yogurt, banana, and cereal snack plate'
    );
  }

  if (form.diet === 'elderly-friendly') {
    ideas.unshift(
      pantry
        ? 'Applesauce cup with oats and nut butter'
        : 'Soft yogurt bowl with canned peaches and oats'
    );
  }

  if (form.diet === 'high-protein') {
    ideas.unshift(
      pantry
        ? 'Peanut butter oats with shelf-stable milk'
        : 'Greek yogurt bowl with nut butter and pre-cooked egg on the side'
    );
  }

  if (form.diet === 'vegetarian') {
    return unique(ideas.filter((idea) => !/tuna|salmon|chicken/i.test(idea)));
  }

  return unique(ideas);
}

function getLunchIdeas(form: FormState) {
  const pantry = prefersShelfStablePlan(form);
  const ideas = pantry
    ? [
        'Bean and corn salad with crackers',
        'Peanut butter banana sandwich',
        'Canned tuna or salmon packets with rice cakes',
        'Shelf-stable hummus cup with pita chips',
      ]
    : [
        'Hummus veggie wrap with cucumber and bagged greens',
        'Tuna or salmon salad pita with cucumber',
        'Rotisserie chicken salad wrap',
        'Bean, corn, and avocado bowl over bagged salad',
      ];

  if (form.diet === 'vegetarian') {
    return unique(
      ideas
        .filter((idea) => !/tuna|salmon|chicken/i.test(idea))
        .concat(
          pantry
            ? 'Chickpea and shelf-stable hummus pita with fruit cup'
            : 'Chickpea and cucumber pita with hummus'
        )
    );
  }

  if (form.diet === 'kid-friendly') {
    ideas.unshift(
      pantry
        ? 'Peanut butter banana wrap with applesauce cup'
        : 'Turkey, cheese, or hummus pinwheel wraps with fruit'
    );
  }

  if (form.diet === 'elderly-friendly') {
    ideas.unshift(
      pantry
        ? 'Soft bean spread on bread with canned fruit'
        : 'Soft bean spread on bread with cucumber and melon'
    );
  }

  if (form.diet === 'high-protein') {
    ideas.unshift(
      pantry
        ? 'Canned tuna or salmon with bean salad and crackers'
        : 'Rotisserie chicken, hummus, and bean salad plate'
    );
  }

  return unique(ideas);
}

function getDinnerIdeas(form: FormState) {
  const pantry = prefersShelfStablePlan(form);
  const ideas = pantry
    ? [
        'Canned bean, corn, and salsa tostada plate',
        'No-cook chickpea salad with crackers',
        'Peanut butter sandwich with fruit and shelf-stable milk',
        'Canned fish, crackers, and fruit plate',
      ]
    : [
        'Greek salad plate with hummus, pita, cucumber, tomato, and olives',
        'Cold rotisserie chicken wraps with bagged salad',
        'Tofu, cucumber, and bagged slaw bowl with sesame dressing',
        'Ready-to-eat bean salad with avocado and tortilla chips',
      ];

  if (hasTool(form, 'microwave')) {
    ideas.push('Microwave rice pouch topped with beans, salsa, and avocado');
  }

  if (hasTool(form, 'toaster')) {
    ideas.push(
      pantry
        ? 'Toast with peanut butter, banana, and cinnamon'
        : 'Toast with hummus, tomato, cucumber, and cheese'
    );
  }

  if (form.diet === 'vegetarian') {
    return unique(
      ideas
        .filter((idea) => !/fish|tuna|salmon|chicken/i.test(idea))
        .concat('Vegetarian hummus, bean, and pita plate')
    );
  }

  if (form.diet === 'kid-friendly') {
    ideas.unshift(
      pantry
        ? 'Peanut butter sandwich, fruit cup, and crackers'
        : 'Sandwich, fruit, yogurt, and crunchy veggie snack plate'
    );
  }

  if (form.diet === 'elderly-friendly') {
    ideas.unshift(
      pantry
        ? 'Soft bean spread, pita, applesauce, and canned peaches'
        : 'Soft hummus, avocado, pita, and melon plate'
    );
  }

  if (form.diet === 'high-protein') {
    ideas.unshift(
      pantry
        ? 'Canned fish, bean salad, and crackers'
        : 'Rotisserie chicken, tofu, hummus, and bagged salad plate'
    );
  }

  return unique(ideas);
}

function getSnackIdeas(form: FormState) {
  const pantry = prefersShelfStablePlan(form);
  const ideas = pantry
    ? [
        'Bananas, apples, oranges, or fruit cups',
        'Trail mix or nuts',
        'Crackers with peanut butter',
        'Shelf-stable pudding or applesauce cups',
      ]
    : [
        'Fruit, yogurt, and granola',
        'Hummus with cucumber or pita chips',
        'Cheese, crackers, and grapes',
        'Frozen fruit or popsicles if a freezer is available',
      ];

  if (form.diet === 'kid-friendly') {
    ideas.unshift(
      pantry
        ? 'Snack plate with fruit cup, crackers, and nut butter'
        : 'Snack plate with fruit, yogurt, crackers, and nut butter'
    );
  }

  if (form.diet === 'elderly-friendly') {
    ideas.unshift(
      pantry
        ? 'Applesauce, canned peaches, or soft shelf-stable fruit cups'
        : 'Chilled melon, applesauce, yogurt, or soft fruit'
    );
  }

  if (form.diet === 'high-protein') {
    ideas.unshift(
      pantry
        ? 'Nut butter, trail mix, or tuna packets with crackers'
        : 'Greek yogurt, hummus, cottage cheese, or pre-cooked eggs'
    );
  }

  return unique(ideas);
}

function buildDailyPlans(form: FormState): DailyMealPlan[] {
  const breakfasts = getBreakfastIdeas(form);
  const lunches = getLunchIdeas(form);
  const dinners = getDinnerIdeas(form);
  const snacks = getSnackIdeas(form);

  return Array.from({ length: daysCount[form.days] }, (_, index) => ({
    day: index + 1,
    breakfast: pick(breakfasts, index),
    lunch: pick(lunches, index),
    dinner: pick(dinners, index),
    snacks: [pick(snacks, index), pick(snacks, index + 1)],
  }));
}

function getGrocerySections(form: FormState): PlanSection[] {
  const pantry = prefersShelfStablePlan(form);
  const vegetarian = form.diet === 'vegetarian';
  const lowBudget = form.budget === 'low' || form.goal === 'save-money';
  const hasColdStorage = !pantry;

  const proteins = vegetarian
    ? [
        'beans',
        'hummus',
        'nut butter',
        'tofu if refrigerated',
        'Greek yogurt if refrigerated',
      ]
    : ['beans', 'hummus', 'peanut butter', 'canned tuna or salmon'];

  if (!vegetarian && hasColdStorage) {
    proteins.push(
      'rotisserie chicken',
      'pre-cooked eggs',
      'Greek yogurt',
      'tofu'
    );
  }

  if (form.diet === 'high-protein') {
    proteins.push(
      'Greek yogurt',
      'canned tuna or salmon',
      'rotisserie chicken',
      'beans',
      'hummus',
      'tofu',
      'pre-cooked eggs'
    );
  }

  const grains = [
    'bread',
    'tortillas or pita',
    'crackers',
    'rice cakes',
    'oats',
    'granola',
  ];

  if (hasTool(form, 'microwave')) {
    grains.push('microwave rice pouches');
  }

  const produce = pantry
    ? [
        'bananas',
        'apples',
        'oranges',
        'canned fruit in juice',
        'applesauce cups',
        'shelf-stable salsa',
      ]
    : [
        'bananas',
        'cucumbers',
        'cherry tomatoes',
        'bagged salad',
        'melon',
        'grapes',
        'frozen fruit if freezer space is available',
      ];

  if (form.diet === 'kid-friendly') {
    produce.push('easy fruit cups');
    if (!pantry) {
      produce.push('baby carrots if refrigerated');
    }
  }

  if (form.diet === 'elderly-friendly') {
    produce.push(
      pantry ? 'soft shelf-stable fruit cups' : 'soft fruit',
      ...(pantry ? [] : ['melon']),
      'applesauce',
      'canned peaches'
    );
  }

  const coldItems = pantry
    ? ['shelf-stable milk', 'single-serve shelf-stable snacks']
    : ['yogurt', 'cheese sticks', 'milk', 'hummus', 'bagged salad'];

  const hydration = [
    'water',
    'electrolyte packets or drinks',
    'ice if available',
    'hydrating fruit',
  ];

  const pantryBackup = [
    'canned beans',
    'canned fish if not vegetarian',
    'nut butter',
    'crackers',
    'shelf-stable milk',
    'canned fruit',
  ].filter((item) => (vegetarian ? !/fish/i.test(item) : true));

  if (lowBudget) {
    proteins.push('peanut butter', 'beans');
    if (!vegetarian) {
      proteins.push('canned fish');
    }
    grains.push('bread', 'rice cakes', 'oats');
    produce.push('banana');
    coldItems.push('yogurt if cold storage is available');
  }

  if (pantry) {
    return [
      {
        title: 'Shelf-stable proteins',
        items: unique(
          proteins.filter((item) => !/rotisserie|yogurt|tofu|egg/i.test(item))
        ),
      },
      {
        title: 'Grains and simple bases',
        items: unique(grains),
      },
      {
        title: 'Fruit, vegetables, and flavor',
        items: unique(produce),
      },
      {
        title: 'Hydration and backup items',
        items: unique([...hydration, ...pantryBackup]),
      },
    ];
  }

  return [
    {
      title: 'Proteins',
      items: unique(proteins),
    },
    {
      title: 'Grains and simple bases',
      items: unique(grains),
    },
    {
      title: 'Fruit and vegetables',
      items: unique(produce),
    },
    {
      title: 'Cold items and hydration',
      items: unique([...coldItems, ...hydration]),
    },
  ];
}

function getStorageReminders(form: FormState) {
  const reminders = [
    'Keep perishable foods cold and return them to the fridge or cooler quickly.',
    'Discard food that smells off, looks spoiled, or has been held warm too long.',
    'Keep water visible and easy to reach during the hottest hours.',
  ];

  if (form.storage === 'pantry-only' || form.goal === 'emergency-prep') {
    reminders.unshift(
      'Choose mostly shelf-stable foods and buy small amounts of fresh produce that can sit safely at room temperature.'
    );
  }

  if (form.storage === 'limited-storage') {
    reminders.unshift(
      'Shop in smaller batches and use single-serve or shelf-stable portions to reduce spoilage.'
    );
  }

  if (form.storage === 'freezer') {
    reminders.push(
      'Freeze fruit, water bottles, or electrolyte drinks to use as cooling snacks or cooler packs.'
    );
  }

  if (form.diet === 'elderly-friendly') {
    reminders.push(
      'Use easy-to-open containers and soft, hydrating foods when chewing or appetite is a concern.'
    );
  }

  return reminders;
}

function getBudgetTips(form: FormState) {
  const tips = [
    'Repeat flexible ingredients across meals instead of buying one-off items.',
    'Use beans, oats, bread, rice cakes, bananas, and peanut butter as low-cost anchors.',
    'Choose store brands when possible and compare unit prices.',
  ];

  if (form.budget === 'low' || form.goal === 'save-money') {
    const proteinPhrase =
      form.diet === 'vegetarian'
        ? 'peanut butter, beans, hummus, nut butter'
        : 'peanut butter, beans, canned fish';

    tips.unshift(
      prefersShelfStablePlan(form)
        ? `Prioritize ${proteinPhrase}, bread, bananas, oats, crackers, and shelf-stable milk.`
        : `Prioritize ${proteinPhrase}, bread, bananas, oats, yogurt, and bagged salad only when it will be eaten quickly.`
    );
  }

  if (prefersShelfStablePlan(form)) {
    tips.push(
      'Buy fewer perishable items at a time; shelf-stable options reduce waste when cooling is limited.'
    );
  }

  if (form.people === '5-plus') {
    tips.push(
      'Serve meal components family-style so people can build wraps, plates, or bowls without extra prep.'
    );
  }

  return unique(tips);
}

function getSafetyNotes() {
  return [
    'This tool provides general meal ideas, not medical or nutrition advice.',
    'For babies, pregnancy, chronic illness, diabetes, kidney disease, eating disorders, or medically restricted diets, consult a qualified professional.',
    'During extreme heat, follow local heat safety guidance and stay hydrated.',
    'Do not eat spoiled food; keep perishable foods cold.',
  ];
}

function getNextSteps(form: FormState) {
  const steps = [
    'Pick 2-3 repeatable meals so shopping stays simple.',
    'Print the grocery list before a heatwave or high-temperature week.',
  ];

  if (prefersShelfStablePlan(form)) {
    steps.unshift(
      'Stock shelf-stable proteins, fruit, grains, and water first.'
    );
  } else {
    steps.unshift(
      'Check fridge or cooler space before buying perishable foods.'
    );
  }

  if (form.diet === 'elderly-friendly') {
    steps.push('Prioritize easy-to-chew foods, fluids, and simple assembly.');
  }

  if (form.diet === 'kid-friendly') {
    steps.push(
      'Use snack plates and wraps to reduce heat, mess, and arguments.'
    );
  }

  return steps;
}

function formatTools(tools: KitchenTool[]) {
  const selected: KitchenTool[] = tools.length > 0 ? tools : ['none'];

  if (selected.includes('none') || selected.length === 0) {
    return 'no extra';
  }

  return selected.map((tool) => toolLabels[tool]).join(', ');
}

export function buildHeatwaveMealPlan(form: FormState): HeatwaveMealPlan {
  const planType = getPlanType(form);

  return {
    planType,
    summary: getSummary(form, planType),
    recommendedNextSteps: getNextSteps(form),
    days: buildDailyPlans(form),
    ideaSections: [
      {
        title: 'Breakfast ideas',
        items: getBreakfastIdeas(form),
      },
      {
        title: 'Lunch ideas',
        items: getLunchIdeas(form),
      },
      {
        title: 'Dinner ideas',
        items: getDinnerIdeas(form),
      },
      {
        title: 'Snack ideas',
        items: getSnackIdeas(form),
      },
    ],
    grocerySections: getGrocerySections(form),
    storageReminders: getStorageReminders(form),
    budgetTips: getBudgetTips(form),
    safetyNotes: getSafetyNotes(),
    labels: {
      people: peopleLabels[form.people],
      days: dayLabels[form.days],
      budget: budgetLabels[form.budget],
      storage: storageLabels[form.storage],
      diet: dietLabels[form.diet],
      tools: formatTools(form.tools),
      goal: goalLabels[form.goal],
    },
  };
}

export function heatwavePlanText(plan: HeatwaveMealPlan) {
  const lines = [
    'No-Cook Heatwave Meal Planner',
    plan.planType,
    plan.summary,
    '',
    'Inputs',
    `People: ${plan.labels.people}`,
    `Days: ${plan.labels.days}`,
    `Budget: ${plan.labels.budget}`,
    `Storage: ${plan.labels.storage}`,
    `Dietary preference: ${plan.labels.diet}`,
    `Tools: ${plan.labels.tools}`,
    `Goal: ${plan.labels.goal}`,
    '',
    'Meal plan by day',
    ...plan.days.flatMap((day) => [
      `Day ${day.day}`,
      `- Breakfast: ${day.breakfast}`,
      `- Lunch: ${day.lunch}`,
      `- Dinner: ${day.dinner}`,
      `- Snacks: ${day.snacks.join('; ')}`,
    ]),
    '',
    ...plan.ideaSections.flatMap((section) => [
      section.title,
      ...section.items.map((item) => `- ${item}`),
      '',
    ]),
    'Grocery list',
    ...plan.grocerySections.flatMap((section) => [
      section.title,
      ...section.items.map((item) => `- ${item}`),
      '',
    ]),
    'Heat-safe storage reminders',
    ...plan.storageReminders.map((item) => `- ${item}`),
    '',
    'Budget tips',
    ...plan.budgetTips.map((item) => `- ${item}`),
    '',
    'Safety notes',
    ...plan.safetyNotes.map((item) => `- ${item}`),
  ];

  return lines.join('\n');
}
