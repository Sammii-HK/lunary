export interface DreamClassification {
  thematicTags: string[];
  emotionalTags: string[];
}

interface TagPattern {
  tag: string;
  keywords: string[];
}

const THEMATIC_PATTERNS: TagPattern[] = [
  {
    tag: 'water',
    keywords: [
      'water',
      'ocean',
      'sea',
      'river',
      'lake',
      'rain',
      'flood',
      'swimming',
      'drowning',
      'waves',
      'underwater',
    ],
  },
  {
    tag: 'falling',
    keywords: [
      'falling',
      'fall',
      'dropped',
      'plummet',
      'cliff',
      'edge',
      'height',
      'gravity',
    ],
  },
  {
    tag: 'flying',
    keywords: [
      'flying',
      'fly',
      'floating',
      'soaring',
      'wings',
      'air',
      'above',
      'levitating',
    ],
  },
  {
    tag: 'houses',
    keywords: [
      'house',
      'home',
      'room',
      'building',
      'apartment',
      'mansion',
      'attic',
      'basement',
      'door',
      'window',
    ],
  },
  {
    tag: 'doors',
    keywords: [
      'door',
      'doorway',
      'entrance',
      'exit',
      'gate',
      'opening',
      'locked',
      'unlocked',
      'key',
    ],
  },
  {
    tag: 'animals',
    keywords: [
      'animal',
      'cat',
      'dog',
      'bird',
      'snake',
      'wolf',
      'bear',
      'lion',
      'horse',
      'spider',
      'fish',
      'creature',
    ],
  },
  {
    tag: 'vehicles',
    keywords: [
      'car',
      'driving',
      'vehicle',
      'bus',
      'train',
      'plane',
      'boat',
      'crash',
      'accident',
      'brakes',
    ],
  },
  {
    tag: 'chasing',
    keywords: [
      'chase',
      'chasing',
      'running',
      'pursued',
      'escape',
      'following',
      'hiding',
      'catching',
    ],
  },
  {
    tag: 'teeth',
    keywords: [
      'teeth',
      'tooth',
      'falling out',
      'crumbling',
      'losing teeth',
      'dental',
    ],
  },
  {
    tag: 'death',
    keywords: [
      'death',
      'dying',
      'dead',
      'funeral',
      'grave',
      'cemetery',
      'afterlife',
      'ghost',
    ],
  },
  {
    tag: 'people',
    keywords: [
      'person',
      'people',
      'stranger',
      'crowd',
      'friend',
      'family',
      'mother',
      'father',
      'child',
      'ex',
      'partner',
    ],
  },
  {
    tag: 'ex-partner',
    keywords: [
      'ex',
      'ex-partner',
      'ex-boyfriend',
      'ex-girlfriend',
      'ex-husband',
      'ex-wife',
      'former partner',
      'past relationship',
    ],
  },
  {
    tag: 'work',
    keywords: [
      'work',
      'job',
      'office',
      'boss',
      'colleague',
      'meeting',
      'presentation',
      'deadline',
      'fired',
    ],
  },
  {
    tag: 'school',
    keywords: [
      'school',
      'class',
      'teacher',
      'exam',
      'test',
      'homework',
      'student',
      'graduate',
      'university',
      'college',
    ],
  },
  {
    tag: 'nature',
    keywords: [
      'nature',
      'forest',
      'tree',
      'mountain',
      'garden',
      'flower',
      'plant',
      'sky',
      'sun',
      'moon',
      'stars',
    ],
  },
  {
    tag: 'fire',
    keywords: [
      'fire',
      'flame',
      'burning',
      'smoke',
      'heat',
      'explosion',
      'inferno',
    ],
  },
  {
    tag: 'darkness',
    keywords: [
      'dark',
      'darkness',
      'shadow',
      'night',
      'black',
      'blind',
      "can't see",
    ],
  },
  {
    tag: 'light',
    keywords: [
      'light',
      'bright',
      'glow',
      'shining',
      'sun',
      'illumination',
      'radiant',
    ],
  },
  {
    tag: 'transformation',
    keywords: [
      'transform',
      'change',
      'becoming',
      'shapeshifting',
      'metamorphosis',
      'different',
    ],
  },
  {
    tag: 'lost',
    keywords: [
      'lost',
      "can't find",
      'searching',
      'wandering',
      'maze',
      'confused',
      'direction',
    ],
  },
];

const EMOTIONAL_PATTERNS: TagPattern[] = [
  {
    tag: 'anxious',
    keywords: [
      'anxious',
      'anxiety',
      'worried',
      'stress',
      'nervous',
      'panic',
      'scared',
      'afraid',
      'fear',
      'terrified',
    ],
  },
  {
    tag: 'peaceful',
    keywords: [
      'peaceful',
      'calm',
      'serene',
      'relaxed',
      'content',
      'tranquil',
      'harmonious',
    ],
  },
  {
    tag: 'joyful',
    keywords: [
      'happy',
      'joy',
      'joyful',
      'elated',
      'excited',
      'wonderful',
      'amazing',
      'beautiful',
    ],
  },
  {
    tag: 'sad',
    keywords: [
      'sad',
      'crying',
      'tears',
      'grief',
      'loss',
      'mourning',
      'melancholy',
      'depressed',
    ],
  },
  {
    tag: 'confused',
    keywords: [
      'confused',
      'weird',
      'strange',
      'bizarre',
      'nonsensical',
      "didn't make sense",
      'surreal',
    ],
  },
  {
    tag: 'curious',
    keywords: [
      'curious',
      'wondering',
      'exploring',
      'discovering',
      'interesting',
      'intrigued',
    ],
  },
  {
    tag: 'angry',
    keywords: [
      'angry',
      'rage',
      'furious',
      'frustrated',
      'annoyed',
      'mad',
      'fighting',
    ],
  },
  {
    tag: 'hopeful',
    keywords: [
      'hopeful',
      'hope',
      'optimistic',
      'positive',
      'promising',
      'looking forward',
    ],
  },
  {
    tag: 'nostalgic',
    keywords: [
      'nostalgic',
      'memory',
      'past',
      'childhood',
      'remember',
      'old',
      'familiar',
    ],
  },
  {
    tag: 'powerful',
    keywords: [
      'powerful',
      'strong',
      'in control',
      'confident',
      'capable',
      'invincible',
    ],
  },
  {
    tag: 'helpless',
    keywords: [
      'helpless',
      'powerless',
      'stuck',
      'trapped',
      "can't move",
      'paralyzed',
      'vulnerable',
    ],
  },
  {
    tag: 'connected',
    keywords: [
      'connected',
      'together',
      'unity',
      'love',
      'bond',
      'relationship',
      'intimacy',
    ],
  },
];

function findMatchingTags(content: string, patterns: TagPattern[]): string[] {
  const lowerContent = content.toLowerCase();
  const matchedTags: string[] = [];

  for (const pattern of patterns) {
    for (const keyword of pattern.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        if (!matchedTags.includes(pattern.tag)) {
          matchedTags.push(pattern.tag);
        }
        break;
      }
    }
  }

  return matchedTags;
}

export function classifyDream(content: string): DreamClassification {
  return {
    thematicTags: findMatchingTags(content, THEMATIC_PATTERNS),
    emotionalTags: findMatchingTags(content, EMOTIONAL_PATTERNS),
  };
}

export function isDreamEntry(entry: {
  content: string;
  moodTags?: string[];
  source?: string;
}): boolean {
  if (entry.source === 'dream') return true;
  if (entry.moodTags?.includes('dream')) return true;

  const dreamIndicators = [
    'dream',
    'dreamt',
    'dreamed',
    'nightmare',
    'last night',
    'woke up',
    'in my sleep',
    'while sleeping',
  ];

  const lowerContent = entry.content.toLowerCase();
  return dreamIndicators.some((indicator) => lowerContent.includes(indicator));
}

export function extractAllDreamTags(content: string): string[] {
  const classification = classifyDream(content);
  return [...classification.thematicTags, ...classification.emotionalTags];
}
