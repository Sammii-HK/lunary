// Rich aspect interpretations for blog content generation
// Each planet pair has specific meanings for each aspect type

export interface AspectMeaning {
  energy: string;
  expect: string;
  workWith: string;
  avoid?: string;
}

export interface PlanetPairAspects {
  conjunction: AspectMeaning;
  sextile: AspectMeaning;
  square: AspectMeaning;
  trine: AspectMeaning;
  opposition: AspectMeaning;
}

// Aspect nature descriptions for fallback
export const aspectNatures: Record<
  string,
  { nature: string; keyword: string }
> = {
  conjunction: { nature: 'intensifying', keyword: 'fusion and focus' },
  sextile: { nature: 'supportive', keyword: 'opportunity and flow' },
  square: { nature: 'challenging', keyword: 'tension and growth' },
  trine: { nature: 'harmonious', keyword: 'ease and natural talent' },
  opposition: { nature: 'polarizing', keyword: 'awareness and balance' },
};

// Planet keywords for dynamic generation
export const planetKeywords: Record<
  string,
  { domain: string; energy: string; rules: string }
> = {
  Sun: {
    domain: 'identity and vitality',
    energy: 'radiant',
    rules: 'self-expression, confidence, life force',
  },
  Moon: {
    domain: 'emotions and intuition',
    energy: 'receptive',
    rules: 'feelings, habits, nurturing',
  },
  Mercury: {
    domain: 'communication and thought',
    energy: 'curious',
    rules: 'thinking, speaking, learning',
  },
  Venus: {
    domain: 'love and values',
    energy: 'attractive',
    rules: 'relationships, beauty, pleasure',
  },
  Mars: {
    domain: 'action and desire',
    energy: 'assertive',
    rules: 'drive, courage, physical energy',
  },
  Jupiter: {
    domain: 'growth and wisdom',
    energy: 'expansive',
    rules: 'luck, opportunity, philosophy',
  },
  Saturn: {
    domain: 'structure and responsibility',
    energy: 'consolidating',
    rules: 'discipline, boundaries, mastery',
  },
  Uranus: {
    domain: 'innovation and freedom',
    energy: 'awakening',
    rules: 'change, originality, breakthroughs',
  },
  Neptune: {
    domain: 'dreams and spirituality',
    energy: 'dissolving',
    rules: 'imagination, intuition, transcendence',
  },
  Pluto: {
    domain: 'transformation and power',
    energy: 'regenerative',
    rules: 'rebirth, depth, hidden truths',
  },
};

// Comprehensive aspect interpretations for common planet pairs
export const aspectInterpretations: Record<
  string,
  Partial<PlanetPairAspects>
> = {
  'Sun-Moon': {
    conjunction: {
      energy: 'New beginnings as conscious will meets emotional needs',
      expect:
        'Fresh starts, heightened intuition, emotional clarity about desires',
      workWith:
        'Set intentions, start new projects, align head and heart decisions',
      avoid: 'Ignoring either logic or feelings',
    },
    opposition: {
      energy: 'Tension between what you want and what you need',
      expect: 'Emotional fullness, relationship insights, culminations',
      workWith: 'Seek balance between self and others, celebrate achievements',
      avoid: 'Either/or thinking when both/and is possible',
    },
    square: {
      energy: 'Inner conflict between identity and emotional security',
      expect:
        'Feeling pulled in different directions, restlessness, growth edges',
      workWith: 'Use tension as motivation, make adjustments, honor both needs',
      avoid: 'Suppressing emotions or acting impulsively',
    },
    trine: {
      energy: 'Natural harmony between will and feelings',
      expect: 'Emotional ease, creative flow, feeling centered',
      workWith:
        'Trust your instincts, express yourself authentically, nurture connections',
    },
    sextile: {
      energy: 'Opportunities to align actions with emotional truth',
      expect: 'Small openings for self-expression, supportive conversations',
      workWith:
        'Take initiative on emotional matters, share your feelings openly',
    },
  },

  'Mercury-Venus': {
    conjunction: {
      energy: 'Thoughts and desires merge beautifully',
      expect:
        'Sweet conversations, artistic inspiration, love letters, harmonious negotiations',
      workWith:
        'Express appreciation, start creative projects, have heart-to-hearts, negotiate deals',
      avoid: 'Superficiality - go deeper than pleasantries',
    },
    sextile: {
      energy: 'Easy flow between mind and heart expression',
      expect:
        'Pleasant social interactions, good news about money or love, creative ideas',
      workWith:
        'Reach out to loved ones, pitch creative ideas, beautify your space',
    },
    square: {
      energy: 'Mind and heart sending mixed signals',
      expect:
        'Miscommunication in relationships, indecision about values, awkward timing',
      workWith:
        'Pause before responding, write feelings before speaking them, clarify intentions',
      avoid:
        'Saying yes when you mean no, making financial decisions emotionally',
    },
    trine: {
      energy: 'Graceful expression of affection and values',
      expect:
        'Charming conversations, social success, artistic breakthroughs, romantic ease',
      workWith:
        'Share your creative work, express love verbally, negotiate from the heart',
    },
    opposition: {
      energy: 'Awareness of gaps between what you think and what you value',
      expect:
        'Relationship discussions, values clarification, seeing both sides',
      workWith:
        'Listen as much as you speak, find common ground, appreciate differences',
    },
  },

  'Mercury-Mars': {
    conjunction: {
      energy: 'Quick thinking meets decisive action',
      expect: 'Sharp words, bold ideas, heated debates, mental energy surge',
      workWith:
        'Tackle challenging conversations, start writing projects, defend your ideas',
      avoid: 'Speaking before thinking, verbal aggression',
    },
    sextile: {
      energy: 'Productive mental energy with clear direction',
      expect: 'Efficient problem-solving, assertive communication, quick wins',
      workWith: 'Take action on ideas, have direct conversations, compete',
    },
    square: {
      energy: 'Mental frustration seeking outlet',
      expect: 'Arguments, impatience, rushing through details, sharp tongues',
      workWith:
        'Channel energy into exercise before important talks, edit before sending',
      avoid: 'Sending that angry email, making hasty decisions',
    },
    trine: {
      energy: 'Thoughts flow easily into action',
      expect:
        'Confident communication, mental clarity, successful negotiations',
      workWith:
        'Pitch ideas, have difficult conversations, start intellectual projects',
    },
    opposition: {
      energy: 'Awareness of conflict between thoughts and actions',
      expect:
        'Debates, defending positions, needing to bridge thinking and doing',
      workWith:
        'Listen to opposing views, find middle ground, act thoughtfully',
    },
  },

  'Venus-Mars': {
    conjunction: {
      energy: 'Desire and attraction merge powerfully',
      expect:
        'Romantic sparks, creative passion, strong attractions, motivated pursuit of pleasure',
      workWith:
        'Express romantic interest, start creative projects, pursue what you love',
      avoid: 'Confusing lust with love',
    },
    sextile: {
      energy: 'Harmonious dance between giving and receiving',
      expect: 'Flirtatious energy, social confidence, balanced relationships',
      workWith:
        'Plan romantic dates, collaborate on creative work, socialize actively',
    },
    square: {
      energy: 'Tension between what you want and how you pursue it',
      expect:
        'Romantic friction, creative blocks, push-pull dynamics, jealousy',
      workWith:
        'Examine relationship patterns, channel frustration into art, negotiate needs',
      avoid: 'Passive aggression, forcing connections',
    },
    trine: {
      energy: 'Natural magnetism and creative flow',
      expect:
        'Romantic ease, artistic inspiration, social grace, attracting what you want',
      workWith:
        'Put yourself out there, create boldly, enjoy pleasures guilt-free',
    },
    opposition: {
      energy: 'Awareness of relationship dynamics and desires',
      expect:
        'Attraction to opposites, relationship revelations, creative tension',
      workWith:
        'Appreciate what partners offer, find balance between giving and taking',
    },
  },

  'Sun-Mercury': {
    conjunction: {
      energy: 'Mind illuminated by conscious awareness',
      expect:
        'Mental clarity, important communications, self-expression through words',
      workWith:
        'Share your ideas confidently, make important calls, write about yourself',
    },
    // Mercury never gets far from Sun, so other aspects rare
  },

  'Sun-Venus': {
    conjunction: {
      energy: 'Identity radiates charm and creativity',
      expect:
        'Feeling attractive, creative confidence, social magnetism, pleasure-seeking',
      workWith:
        'Express yourself creatively, socialize, beautify yourself or space',
    },
    sextile: {
      energy: 'Easy access to charm and creativity',
      expect:
        'Pleasant interactions, small creative successes, feeling appreciated',
      workWith:
        'Collaborate with others, share your work, enjoy simple pleasures',
    },
    square: {
      energy: 'Tension between authentic self and desire for approval',
      expect:
        'Feeling undervalued, creative dissatisfaction, relationship friction',
      workWith: 'Create for yourself not others, examine what you truly value',
      avoid: 'People-pleasing at expense of authenticity',
    },
  },

  'Sun-Mars': {
    conjunction: {
      energy: 'Vitality and willpower surge together',
      expect: 'High energy, confidence, competitive drive, need for action',
      workWith:
        'Start bold projects, exercise vigorously, take leadership, compete',
      avoid: 'Burnout, aggression, dominating others',
    },
    sextile: {
      energy: 'Productive energy with clear purpose',
      expect: 'Motivation, physical vitality, successful initiatives',
      workWith: 'Take action on goals, lead projects, physical challenges',
    },
    square: {
      energy: 'Will clashing with desire, creating friction',
      expect:
        'Frustration, conflicts with authority, ego battles, accidents if rushed',
      workWith:
        'Channel anger constructively, compete fairly, examine what triggers you',
      avoid: 'Power struggles, impulsive actions, physical recklessness',
    },
    trine: {
      energy: 'Confident action flows naturally',
      expect:
        'Success in competitions, leadership opportunities, physical peak',
      workWith: 'Go after what you want, take calculated risks, inspire others',
    },
    opposition: {
      energy: 'Awareness of ego and aggression in relationships',
      expect:
        'Conflicts bringing clarity, competitive dynamics, energy projection',
      workWith:
        'See yourself through others, balance assertion with cooperation',
    },
  },

  'Sun-Jupiter': {
    conjunction: {
      energy: 'Confidence and optimism amplified',
      expect:
        'Luck, generosity, big thinking, opportunities, possible overconfidence',
      workWith:
        'Think big, take risks, teach or learn, travel, expand horizons',
      avoid: 'Overcommitting, excessive spending, arrogance',
    },
    sextile: {
      energy: 'Opportunities for growth and recognition',
      expect: 'Small lucky breaks, supportive mentors, positive outlook',
      workWith: 'Say yes to opportunities, network, share knowledge',
    },
    square: {
      energy: 'Restless desire for more clashing with current reality',
      expect: 'Overextension, unrealistic expectations, growth pains',
      workWith: 'Examine where you overdo it, find sustainable growth paths',
      avoid: 'Gambling, overpromising, ignoring limits',
    },
    trine: {
      energy: 'Natural abundance and good fortune',
      expect:
        'Success, recognition, opportunities finding you, generosity rewarded',
      workWith: 'Expand your reach, take calculated risks, be generous',
    },
    opposition: {
      energy: 'Awareness of balance between self and greater whole',
      expect: 'Others reflecting your potential, growth through relationships',
      workWith: 'Learn from teachers, balance giving and receiving',
    },
  },

  'Sun-Saturn': {
    conjunction: {
      energy: 'Identity tested and strengthened through challenges',
      expect:
        'Serious responsibilities, authority matters, hard-won achievements',
      workWith:
        'Commit to long-term goals, accept responsibilities, build structure',
      avoid: 'Self-criticism, depression, rigidity',
    },
    sextile: {
      energy: 'Opportunities through discipline and patience',
      expect: 'Recognition for hard work, productive routines, stable progress',
      workWith: 'Focus on mastery, build lasting structures, mentor others',
    },
    square: {
      energy: 'Will blocked by limitations or responsibilities',
      expect: 'Delays, obstacles, authority conflicts, feeling restricted',
      workWith: 'Work within limits, take responsibility, build patience',
      avoid: 'Giving up, blaming others, cutting corners',
    },
    trine: {
      energy: 'Effortless discipline and steady achievement',
      expect: 'Respect, authority, long-term success, practical wisdom',
      workWith: 'Lead with integrity, make lasting commitments, build legacy',
    },
    opposition: {
      energy: 'Awareness of self versus duty and structure',
      expect: 'Authority figures reflecting your growth, responsibility calls',
      workWith:
        'Balance personal needs with obligations, mature through challenges',
    },
  },

  'Mercury-Jupiter': {
    conjunction: {
      energy: 'Mind expands to embrace big ideas',
      expect:
        'Optimistic thinking, good news, learning opportunities, big plans',
      workWith: 'Study, travel mentally, share ideas widely, write, teach',
      avoid: 'Overlooking details, exaggerating, overpromising',
    },
    sextile: {
      energy: 'Productive intellectual opportunities',
      expect: 'Good conversations, learning chances, positive communications',
      workWith: 'Network, learn something new, share knowledge',
    },
    square: {
      energy: 'Mind overwhelmed by possibilities or opinions',
      expect: 'Information overload, scattered thinking, foot-in-mouth moments',
      workWith:
        'Focus on one thing, fact-check before sharing, edit ruthlessly',
      avoid: 'Spreading yourself thin, believing everything you hear',
    },
    trine: {
      energy: 'Ideas flow abundantly and find receptive audience',
      expect: 'Successful communications, learning ease, publishing success',
      workWith: 'Teach, write, pitch big ideas, travel, expand your worldview',
    },
    opposition: {
      energy: 'Awareness of different perspectives and beliefs',
      expect:
        'Debates about truth, encountering foreign ideas, mental stretching',
      workWith: 'Listen to different viewpoints, question your assumptions',
    },
  },

  'Venus-Jupiter': {
    conjunction: {
      energy: 'Love and abundance overflow',
      expect:
        'Social joy, romantic luck, financial windfalls, indulgence temptation',
      workWith:
        'Celebrate love, socialize grandly, invest in beauty, give generously',
      avoid: 'Overspending, overindulging, taking good fortune for granted',
    },
    sextile: {
      energy: 'Pleasant opportunities for love and money',
      expect: 'Social invitations, small luxuries, relationship growth',
      workWith:
        'Accept invitations, treat yourself reasonably, express gratitude',
    },
    square: {
      energy: 'Desire for more clashing with what you have',
      expect: 'Overspending, relationship restlessness, values questioned',
      workWith: 'Examine what truly fulfills you, practice gratitude',
      avoid: 'Retail therapy, grass-is-greener thinking',
    },
    trine: {
      energy: 'Natural grace, charm, and good fortune in love and money',
      expect:
        'Romantic bliss, financial luck, social success, artistic recognition',
      workWith: 'Enjoy abundance, share generously, create beauty, love boldly',
    },
    opposition: {
      energy: 'Awareness of values and relationships in larger context',
      expect: 'Partner reflecting abundance potential, values discussions',
      workWith: 'Balance personal pleasure with shared growth',
    },
  },

  'Mars-Jupiter': {
    conjunction: {
      energy: 'Action amplified by faith and enthusiasm',
      expect: 'Bold moves, athletic success, righteous anger, crusading energy',
      workWith: 'Take big action, compete, fight for beliefs, start adventures',
      avoid: 'Recklessness, overconfidence, imposing beliefs on others',
    },
    sextile: {
      energy: 'Productive energy with philosophical purpose',
      expect: 'Motivated action, sports success, beneficial risks',
      workWith: 'Take action on beliefs, compete, adventure, advocate',
    },
    square: {
      energy: 'Energy frustrated by overreach or moral conflicts',
      expect: 'Wasted effort, religious/political arguments, overcommitment',
      workWith: 'Channel energy wisely, examine motivations, temper enthusiasm',
      avoid: 'Holy wars, biting off more than you can chew',
    },
    trine: {
      energy: 'Confident action blessed by good fortune',
      expect:
        'Success in competitions, lucky timing, adventures that expand you',
      workWith: 'Go big, take calculated risks, lead with vision, compete',
    },
    opposition: {
      energy: 'Action reflecting larger meaning and purpose',
      expect:
        'Others challenging your direction, need to balance doing and believing',
      workWith: 'Let actions speak your beliefs, collaborate on missions',
    },
  },

  'Mars-Saturn': {
    conjunction: {
      energy: 'Disciplined force meeting immovable structure',
      expect:
        'Controlled power, endurance tests, frustration building, hard work',
      workWith:
        'Channel energy into long-term goals, build muscle, work persistently',
      avoid:
        'Suppressed anger, harsh self-criticism, accidents from frustration',
    },
    sextile: {
      energy: 'Productive discipline and strategic action',
      expect: 'Efficient work, measured progress, respected effort',
      workWith: 'Tackle difficult tasks, build endurance, lead methodically',
    },
    square: {
      energy: 'Desire blocked by limitations or fear',
      expect: 'Frustration, delays, feeling held back, authority conflicts',
      workWith:
        'Work within limits, build patience, examine fears blocking action',
      avoid: 'Explosive anger, giving up, reckless defiance',
    },
    trine: {
      energy: 'Effortless integration of energy and discipline',
      expect: 'Productive hard work, endurance, respected authority, mastery',
      workWith:
        'Commit to challenging goals, lead with integrity, build lasting things',
    },
    opposition: {
      energy: 'Awareness of personal desire versus external limitations',
      expect:
        'Confronting authority, working through blocks, maturity through conflict',
      workWith: 'Negotiate with authority, balance ambition and responsibility',
    },
  },

  'Jupiter-Saturn': {
    conjunction: {
      energy: 'New cycle of growth within structure begins',
      expect:
        'Major life chapter starts, realistic optimism, building with vision',
      workWith:
        'Set 20-year intentions, balance dreams with plans, commit wisely',
      avoid: 'Either extreme optimism or pessimism',
    },
    sextile: {
      energy: 'Opportunities for sustainable growth',
      expect: 'Practical expansion, wise investments, balanced progress',
      workWith:
        'Grow strategically, invest in future, balance risk and security',
    },
    square: {
      energy: 'Growth and limitation in tension',
      expect:
        'Frustrated ambitions, need to adjust plans, reality checks on dreams',
      workWith: 'Revise unrealistic goals, find sustainable growth path',
      avoid: 'Abandoning dreams or ignoring reality',
    },
    trine: {
      energy: 'Wisdom integrates expansion and consolidation',
      expect: 'Wise growth, respected achievements, balanced success',
      workWith: 'Build lasting structures, teach what you know, lead wisely',
    },
    opposition: {
      energy: 'Awareness of balance between growth and stability',
      expect: 'Weighing risk versus security, others reflecting your potential',
      workWith: 'Find middle path between expansion and consolidation',
    },
  },
};

/**
 * Get aspect interpretation for a planet pair
 */
export function getAspectInterpretation(
  planetA: string,
  planetB: string,
  aspectType: string,
): AspectMeaning | null {
  // Try both orderings
  const key1 = `${planetA}-${planetB}`;
  const key2 = `${planetB}-${planetA}`;

  const interpretations =
    aspectInterpretations[key1] || aspectInterpretations[key2];
  if (!interpretations) return null;

  const normalizedAspect = aspectType.toLowerCase();
  return interpretations[normalizedAspect as keyof PlanetPairAspects] || null;
}

/**
 * Generate a fallback interpretation when no specific one exists
 */
export function generateFallbackInterpretation(
  planetA: string,
  planetB: string,
  aspectType: string,
): AspectMeaning {
  const planetAInfo = planetKeywords[planetA] || {
    domain: 'cosmic energy',
    energy: 'transformative',
    rules: 'universal forces',
  };
  const planetBInfo = planetKeywords[planetB] || {
    domain: 'cosmic energy',
    energy: 'transformative',
    rules: 'universal forces',
  };
  const aspectInfo = aspectNatures[aspectType.toLowerCase()] || {
    nature: 'connecting',
    keyword: 'interaction',
  };

  const isHarmonious = ['trine', 'sextile', 'conjunction'].includes(
    aspectType.toLowerCase(),
  );

  return {
    energy: `${planetAInfo.domain} meets ${planetBInfo.domain} with ${aspectInfo.nature} energy`,
    expect: isHarmonious
      ? `Flowing connection between ${planetAInfo.rules} and ${planetBInfo.rules}`
      : `Dynamic tension between ${planetAInfo.rules} and ${planetBInfo.rules}`,
    workWith: isHarmonious
      ? `Leverage the natural flow between these energies`
      : `Use the tension as motivation for growth and adjustment`,
    avoid: isHarmonious
      ? undefined
      : `Ignoring the need for balance between these areas`,
  };
}

/**
 * Get complete aspect meaning with fallback
 */
export function getAspectMeaning(
  planetA: string,
  planetB: string,
  aspectType: string,
): AspectMeaning {
  const specific = getAspectInterpretation(planetA, planetB, aspectType);
  if (specific) return specific;
  return generateFallbackInterpretation(planetA, planetB, aspectType);
}
