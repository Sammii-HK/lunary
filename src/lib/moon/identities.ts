/**
 * Rich identity data for each named moon of the year.
 *
 * Full moons use traditional folk names (Wolf Moon, Snow Moon, etc.).
 * New moons are identified by their sign, with thematic qualities
 * that reflect the energy of that month's dark moon.
 *
 * Each identity includes themes, keywords, energy descriptions,
 * ritual focus, elemental associations, and accent colours for
 * visual theming in emails and social content.
 */

export interface MoonIdentity {
  /** Traditional name (full moons) or descriptive name (new moons) */
  name: string;
  /** Core themes this moon embodies (3-4) */
  themes: string[];
  /** Evocative keywords for social copy and hooks (4-6) */
  keywords: string[];
  /** One-sentence energy description */
  energy: string;
  /** Ritual focus for this specific moon */
  ritualFocus: string;
  /** Dominant elemental association */
  element: 'fire' | 'earth' | 'air' | 'water';
  /** Hex accent colour for email/visual theming */
  colour: string;
}

export interface MonthMoonIdentities {
  fullMoon: MoonIdentity;
  newMoon: MoonIdentity;
}

/**
 * Moon identities keyed by month (1 = January, 12 = December).
 *
 * Full moon names are the widely recognised North American/European
 * folk names. New moon identities are themed around the energy of
 * the season and the sign the new moon typically falls in.
 */
export const MOON_IDENTITIES: Record<number, MonthMoonIdentities> = {
  // ── January ──────────────────────────────────────────────
  1: {
    fullMoon: {
      name: 'Wolf Moon',
      themes: ['survival', 'instinct', 'community bonds'],
      keywords: ['primal', 'hunger', 'pack mentality', 'endurance', 'howling'],
      energy:
        'The Wolf Moon stirs primal instincts and the deep need for community in the coldest nights.',
      ritualFocus:
        'Protection rituals and calling in your tribe. Light a candle for those who sustain you.',
      element: 'water',
      colour: '#6366f1', // indigo
    },
    newMoon: {
      name: 'Dark Moon of Renewal',
      themes: ['fresh starts', 'ambition', 'quiet resolve'],
      keywords: ['reset', 'discipline', 'foundations', 'silence', 'seed'],
      energy:
        'The January dark moon invites you to plant seeds of ambition in frozen ground, trusting they will take root.',
      ritualFocus:
        'Write your intentions for the year ahead. Be specific and unapologetic about what you want.',
      element: 'earth',
      colour: '#475569', // slate
    },
  },

  // ── February ─────────────────────────────────────────────
  2: {
    fullMoon: {
      name: 'Snow Moon',
      themes: ['endurance', 'stillness', 'inner light'],
      keywords: ['patience', 'resilience', 'frost', 'illumination', 'hearth'],
      energy:
        'The Snow Moon illuminates what lies beneath the surface, asking you to find warmth within.',
      ritualFocus:
        'Self-compassion rituals. Run a bath, light white candles, and release self-criticism.',
      element: 'water',
      colour: '#94a3b8', // cool grey-blue
    },
    newMoon: {
      name: 'Dark Moon of Vision',
      themes: ['imagination', 'dreams', 'unconventional thinking'],
      keywords: ['innovation', 'detachment', 'clarity', 'future', 'rebellion'],
      energy:
        'The February dark moon opens a window to your most unconventional ideas. Let your mind roam freely.',
      ritualFocus:
        'Dream journaling and vision boarding. Capture the images that visit you in the dark.',
      element: 'air',
      colour: '#7c3aed', // violet
    },
  },

  // ── March ────────────────────────────────────────────────
  3: {
    fullMoon: {
      name: 'Worm Moon',
      themes: ['awakening', 'emergence', 'fertility'],
      keywords: ['thaw', 'stirring', 'rebirth', 'soil', 'potential', 'spring'],
      energy:
        'The Worm Moon signals the earth waking up. What was dormant in you is ready to emerge.',
      ritualFocus:
        'Spring cleaning rituals, both physical and energetic. Clear space for what is arriving.',
      element: 'earth',
      colour: '#84cc16', // lime green
    },
    newMoon: {
      name: 'Dark Moon of Courage',
      themes: ['initiative', 'daring', 'self-assertion'],
      keywords: ['bravery', 'spark', 'action', 'ignition', 'first step'],
      energy:
        'The March dark moon dares you to take the first bold step. Hesitation dissolves in the dark.',
      ritualFocus:
        'Write down the one thing you have been avoiding, then commit to one small action towards it.',
      element: 'fire',
      colour: '#ef4444', // red
    },
  },

  // ── April ────────────────────────────────────────────────
  4: {
    fullMoon: {
      name: 'Pink Moon',
      themes: ['beauty', 'blossoming', 'vulnerability'],
      keywords: ['bloom', 'softness', 'colour', 'opening', 'tenderness'],
      energy:
        'The Pink Moon celebrates the first blossoms and the courage it takes to open up.',
      ritualFocus:
        'Heart-opening rituals. Wear pink or rose quartz, write a love letter to yourself or someone you cherish.',
      element: 'water',
      colour: '#ec4899', // pink
    },
    newMoon: {
      name: 'Dark Moon of Worth',
      themes: ['values', 'stability', 'self-worth'],
      keywords: ['grounding', 'abundance', 'roots', 'nourishment', 'security'],
      energy:
        'The April dark moon asks what you truly value. Build from that foundation.',
      ritualFocus:
        'Abundance rituals. Hold a coin or crystal and speak your worth aloud. Plant something in soil.',
      element: 'earth',
      colour: '#78716c', // warm stone
    },
  },

  // ── May ──────────────────────────────────────────────────
  5: {
    fullMoon: {
      name: 'Flower Moon',
      themes: ['abundance', 'sensuality', 'celebration'],
      keywords: ['lush', 'fragrance', 'fertility', 'joy', 'harvest potential'],
      energy:
        'The Flower Moon bursts with colour and life. Celebrate everything that is growing.',
      ritualFocus:
        'Gratitude and pleasure rituals. Fill your space with flowers, dance, or share a meal with loved ones.',
      element: 'earth',
      colour: '#f59e0b', // amber
    },
    newMoon: {
      name: 'Dark Moon of Curiosity',
      themes: ['communication', 'learning', 'connections'],
      keywords: ['questions', 'dialogue', 'wit', 'versatility', 'siblings'],
      energy:
        'The May dark moon sparks curiosity and the desire to learn. Ask the questions you have been sitting on.',
      ritualFocus:
        'Write a letter (even unsent), start a new book, or reach out to someone you have lost touch with.',
      element: 'air',
      colour: '#fbbf24', // yellow
    },
  },

  // ── June ─────────────────────────────────────────────────
  6: {
    fullMoon: {
      name: 'Strawberry Moon',
      themes: ['sweetness', 'romance', 'fulfilment'],
      keywords: ['ripe', 'lush', 'midsummer', 'desire', 'warmth', 'honey'],
      energy:
        'The Strawberry Moon is ripe with sweetness. Savour what you have cultivated.',
      ritualFocus:
        'Romance and relationship rituals. Share strawberries under the moon, or write about what love means to you now.',
      element: 'water',
      colour: '#f43f5e', // rose
    },
    newMoon: {
      name: 'Dark Moon of Nurturing',
      themes: ['home', 'family', 'emotional roots'],
      keywords: ['sanctuary', 'comfort', 'ancestors', 'belonging', 'care'],
      energy:
        'The June dark moon turns you inward to the hearth. Tend to what feels like home.',
      ritualFocus:
        'Create a sacred space at home. Cook a family recipe, call a parent, or honour your ancestry.',
      element: 'water',
      colour: '#a3a3a3', // silver
    },
  },

  // ── July ─────────────────────────────────────────────────
  7: {
    fullMoon: {
      name: 'Buck Moon',
      themes: ['strength', 'growth', 'leadership'],
      keywords: ['antlers', 'power', 'sovereignty', 'pride', 'peak'],
      energy:
        'The Buck Moon crowns you with strength. Stand tall in who you are becoming.',
      ritualFocus:
        'Personal power rituals. Wear gold, speak affirmations of strength, and claim your space.',
      element: 'fire',
      colour: '#d97706', // deep amber
    },
    newMoon: {
      name: 'Dark Moon of Expression',
      themes: ['creativity', 'self-expression', 'play'],
      keywords: ['stage', 'heart', 'drama', 'generosity', 'spotlight'],
      energy:
        'The July dark moon invites you to create without judgement. Play is a form of prayer.',
      ritualFocus:
        'Creative expression rituals. Paint, sing, write, or dance, anything that lets your inner child out.',
      element: 'fire',
      colour: '#ea580c', // orange
    },
  },

  // ── August ───────────────────────────────────────────────
  8: {
    fullMoon: {
      name: 'Sturgeon Moon',
      themes: ['provision', 'abundance', 'deep waters'],
      keywords: ['harvest', 'depth', 'sustenance', 'ancient', 'plenty'],
      energy:
        'The Sturgeon Moon reminds you that abundance runs deep. Trust the currents carrying you.',
      ritualFocus:
        'Harvest gratitude rituals. List what you have gathered this year and give thanks for the abundance.',
      element: 'water',
      colour: '#0891b2', // cyan
    },
    newMoon: {
      name: 'Dark Moon of Refinement',
      themes: ['precision', 'health', 'service'],
      keywords: ['detail', 'improvement', 'craft', 'humility', 'purification'],
      energy:
        'The August dark moon asks you to refine your craft. Small adjustments create lasting change.',
      ritualFocus:
        'Cleansing and organisation rituals. Declutter one area of your life, body, or mind.',
      element: 'earth',
      colour: '#65a30d', // green
    },
  },

  // ── September ────────────────────────────────────────────
  9: {
    fullMoon: {
      name: 'Harvest Moon',
      themes: ['gratitude', 'reaping', 'equilibrium'],
      keywords: ['golden', 'reward', 'equinox', 'balance', 'gathering'],
      energy:
        'The Harvest Moon is the great gathering. Reap what you have sown and share it generously.',
      ritualFocus:
        'Gratitude feasting. Prepare a meal with seasonal foods, set an extra place for abundance.',
      element: 'earth',
      colour: '#ca8a04', // gold
    },
    newMoon: {
      name: 'Dark Moon of Harmony',
      themes: ['balance', 'partnership', 'justice'],
      keywords: ['scales', 'fairness', 'beauty', 'diplomacy', 'mirror'],
      energy:
        'The September dark moon weighs what is fair. Seek balance in your relationships and commitments.',
      ritualFocus:
        'Mirror rituals and relationship check-ins. Are your partnerships nourishing both sides equally?',
      element: 'air',
      colour: '#8b5cf6', // purple
    },
  },

  // ── October ──────────────────────────────────────────────
  10: {
    fullMoon: {
      name: 'Hunter Moon',
      themes: ['focus', 'preparation', 'the hunt'],
      keywords: ['pursuit', 'provision', 'sharp', 'vigilance', 'autumn'],
      energy:
        'The Hunter Moon sharpens your focus. Pursue what matters and release distractions.',
      ritualFocus:
        'Release and focus rituals. Write down distractions, burn them, and recommit to your true targets.',
      element: 'fire',
      colour: '#dc2626', // deep red
    },
    newMoon: {
      name: 'Dark Moon of Transformation',
      themes: ['death and rebirth', 'shadow work', 'power'],
      keywords: ['metamorphosis', 'secrets', 'intensity', 'phoenix', 'depth'],
      energy:
        'The October dark moon is the threshold between worlds. Step through and leave what no longer serves you.',
      ritualFocus:
        'Shadow work rituals. Journal on what you are afraid to look at. Name it. Then release it.',
      element: 'water',
      colour: '#1e1b4b', // deep indigo
    },
  },

  // ── November ─────────────────────────────────────────────
  11: {
    fullMoon: {
      name: 'Beaver Moon',
      themes: ['industry', 'preparation', 'resourcefulness'],
      keywords: ['building', 'dam', 'shelter', 'foresight', 'storage'],
      energy:
        'The Beaver Moon is about building shelter before the storm. Prepare wisely.',
      ritualFocus:
        'Preparation and resource rituals. Review your finances, stock your pantry, fortify your routines.',
      element: 'earth',
      colour: '#92400e', // warm brown
    },
    newMoon: {
      name: 'Dark Moon of Expansion',
      themes: ['truth-seeking', 'adventure', 'philosophy'],
      keywords: ['arrow', 'horizon', 'wisdom', 'travel', 'faith'],
      energy:
        'The November dark moon pulls your gaze to the horizon. What truth are you seeking?',
      ritualFocus:
        'Philosophy and expansion rituals. Read something that challenges your worldview, or plan a journey.',
      element: 'fire',
      colour: '#7c2d12', // rust
    },
  },

  // ── December ─────────────────────────────────────────────
  12: {
    fullMoon: {
      name: 'Cold Moon',
      themes: ['reflection', 'completion', 'inner fire'],
      keywords: [
        'solstice',
        'longest night',
        'stillness',
        'light returning',
        'legacy',
      ],
      energy:
        'The Cold Moon holds the longest night. In the deepest dark, your inner fire burns brightest.',
      ritualFocus:
        'Year-end reflection rituals. Review the year by moonlight, honour what you survived, and set a single word for the year ahead.',
      element: 'water',
      colour: '#1e3a5f', // midnight blue
    },
    newMoon: {
      name: 'Dark Moon of Structure',
      themes: ['discipline', 'legacy', 'mastery'],
      keywords: ['mountain', 'ambition', 'bones', 'time', 'authority'],
      energy:
        'The December dark moon is the architect. Build the structures that will carry your legacy.',
      ritualFocus:
        'Goal-setting and commitment rituals. Write down your non-negotiables for the year ahead.',
      element: 'earth',
      colour: '#334155', // dark slate
    },
  },
};

/**
 * Special moon modifier overlays for supermoons, blue moons,
 * black moons, and eclipses. These augment the base identity
 * rather than replacing it.
 */
export interface MoonModifier {
  label: string;
  description: string;
  extraEnergy: string;
  colour: string;
}

export const MOON_MODIFIERS: Record<string, MoonModifier> = {
  supermoon: {
    label: 'Supermoon',
    description:
      'The moon is at its closest point to Earth, appearing larger and brighter than usual.',
    extraEnergy:
      'Emotions and intuition are amplified. Whatever this moon stirs, expect it to feel more intense.',
    colour: '#fbbf24', // gold
  },
  micromoon: {
    label: 'Micromoon',
    description:
      'The moon is at its farthest point from Earth, appearing smaller and more subtle.',
    extraEnergy:
      'A gentler, more reflective energy. This moon whispers rather than shouts.',
    colour: '#94a3b8', // muted silver
  },
  blueMoon: {
    label: 'Blue Moon',
    description:
      'The second full moon in a calendar month, a rare and potent occurrence.',
    extraEnergy:
      'Blue moons carry the energy of the unexpected. Wishes made under a blue moon hold extra weight.',
    colour: '#3b82f6', // blue
  },
  blackMoon: {
    label: 'Black Moon',
    description:
      'The second new moon in a calendar month, deepening the dark moon energy.',
    extraEnergy:
      'Double the darkness, double the potential. A powerful time for shadow work and deep intention-setting.',
    colour: '#0f172a', // near-black
  },
  lunarEclipse: {
    label: 'Lunar Eclipse',
    description:
      'The Earth passes between the Sun and Moon, casting a shadow that reveals hidden truths.',
    extraEnergy:
      'Eclipses accelerate change. What needs to end will end. What needs to begin will begin. Trust the process.',
    colour: '#991b1b', // blood red
  },
  solarEclipse: {
    label: 'Solar Eclipse',
    description:
      'The Moon passes between the Earth and Sun, briefly plunging the world into shadow.',
    extraEnergy:
      'A cosmic reset button. Solar eclipses open portals of radical new beginnings that unfold over six months.',
    colour: '#1c1917', // eclipse dark
  },
};

/**
 * Look up the moon identity for a given month and phase type.
 * Returns undefined if the month is out of range.
 */
export function getMoonIdentity(
  month: number,
  type: 'full' | 'new',
): MoonIdentity | undefined {
  const monthData = MOON_IDENTITIES[month];
  if (!monthData) return undefined;
  return type === 'full' ? monthData.fullMoon : monthData.newMoon;
}
