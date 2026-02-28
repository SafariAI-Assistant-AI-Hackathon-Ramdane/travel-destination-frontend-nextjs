// Safari AI — Intent Detector
// Pure keyword-matching, no external API needed. Supports FR / EN / AR.

export type IntentType =
  | 'destination'
  | 'guide'
  | 'driver'
  | 'restaurant'
  | 'itinerary'
  | 'activity'
  | 'recommendation'
  | 'greeting'
  | 'unknown';

export interface DetectedIntent {
  type: IntentType;
  keywords: string[];
  location?: string;
  budget?: string;
  persons?: number;
  confidence: number; // 0–1
}

const INTENT_PATTERNS: { type: IntentType; patterns: RegExp[] }[] = [
  {
    type: 'greeting',
    patterns: [
      /\b(bonjour|salut|hello|hi|salam|مرحبا|أهلا|coucou|bonsoir)\b/i,
    ],
  },
  {
    type: 'guide',
    patterns: [
      /\b(guide|accompagnateur|accompagnatrice|tour guide|مرشد|مرشدة)\b/i,
    ],
  },
  {
    type: 'driver',
    patterns: [
      /\b(chauffeur|driver|taxi|transport|voiture|car|سائق|نقل|تاكسي)\b/i,
    ],
  },
  {
    type: 'restaurant',
    patterns: [
      /\b(restaurant|manger|dîner|déjeuner|café|food|eat|cuisine|tagine|couscous|مطعم|أكل|طعام)\b/i,
    ],
  },
  {
    type: 'itinerary',
    patterns: [
      /\b(itinéraire|programme|planning|plan de voyage|schedule|journey|رحلة|برنامج|خطة)\b/i,
      /\b(jours?|days?|semaine|week)\b.*\b(marrakech|maroc|morocco)\b/i,
      /\b(marrakech|maroc|morocco)\b.*\b(jours?|days?|semaine|week)\b/i,
    ],
  },
  {
    type: 'activity',
    patterns: [
      /\b(activité|excursion|aventure|randonnée|activity|hike|bike|quad|montgolfière|surf|balloon|باراشوت|مغامرة|نشاط)\b/i,
    ],
  },
  {
    type: 'recommendation',
    patterns: [
      /\b(recommande|suggère|propose|recommend|suggest|conseil|top|best|meilleur|أفضل|توصية)\b/i,
      /\b(que (voir|faire|visiter)|what (to see|to do|to visit))\b/i,
    ],
  },
  {
    type: 'destination',
    patterns: [
      /\b(plage|beach|شاطئ|balnéaire|mer|sea)\b/i,
      /\b(montagne|mountain|جبل|atlas|toubkal)\b/i,
      /\b(désert|sahara|dunes|صحراء|merzouga|erg)\b/i,
      /\b(médina|ville|city|souk|jardin|garden|palace|palais|mosquée|mosque|riad|quartier)\b/i,
      /\b(visiter|découvrir|explorer|visit|discover|explore|زيارة|استكشاف)\b/i,
      /\b(attraction|lieu|place|endroit|site|monument|destination)\b/i,
      /\b(romantique|romantic|romatico|family|famille|enfants|kids|أسرة)\b/i,
      /\b(chefchaouen|essaouira|agadir|fès|rabat|casablanca|ouarzazate|taghazout|dakhla|ifrane)\b/i,
    ],
  },
];

const LOCATION_HINTS = [
  'marrakech', 'agadir', 'fès', 'fez', 'casablanca', 'rabat', 'chefchaouen',
  'essaouira', 'ouarzazate', 'merzouga', 'taghazout', 'dakhla', 'ifrane',
  'maroc', 'morocco', 'المغرب', 'مراكش', 'الصويرة', 'أكادير',
];

const BUDGET_PATTERNS = [
  { key: 'économique', regex: /\b(économique|budget|pas cher|cheap|رخيص|اقتصادي)\b/i },
  { key: 'moyen', regex: /\b(moyen|moderate|medium|متوسط)\b/i },
  { key: 'luxe', regex: /\b(luxe|luxury|premium|haut de gamme|فاخر|راقي)\b/i },
];

export function detectIntent(message: string): DetectedIntent {
  const lower = message.toLowerCase();

  // Find location
  const location = LOCATION_HINTS.find((loc) => lower.includes(loc));

  // Find budget
  let budget: string | undefined;
  for (const bp of BUDGET_PATTERNS) {
    if (bp.regex.test(message)) {
      budget = bp.key;
      break;
    }
  }

  // Find persons
  const personsMatch = message.match(/\b(\d+)\s*(personnes?|people|adults?)\b/i);
  const persons = personsMatch ? parseInt(personsMatch[1]) : undefined;

  // Score each intent
  const scores: Partial<Record<IntentType, number>> = {};
  const allKeywords: string[] = [];

  for (const { type, patterns } of INTENT_PATTERNS) {
    let matchCount = 0;
    for (const regex of patterns) {
      const match = message.match(regex);
      if (match) {
        matchCount++;
        if (match[0]) allKeywords.push(match[0].toLowerCase());
      }
    }
    if (matchCount > 0) {
      scores[type] = matchCount;
    }
  }

  // Determine best intent
  let bestType: IntentType = 'unknown';
  let bestScore = 0;

  for (const [type, score] of Object.entries(scores)) {
    if ((score ?? 0) > bestScore) {
      bestScore = score ?? 0;
      bestType = type as IntentType;
    }
  }

  // Greeting check — minimum confidence
  if (bestType === 'unknown' && message.trim().length < 20) {
    bestType = 'greeting';
  }

  const confidence = bestScore > 0 ? Math.min(bestScore * 0.4, 1) : 0.1;

  return {
    type: bestType,
    keywords: Array.from(new Set(allKeywords)),
    location,
    budget,
    persons,
    confidence,
  };
}
